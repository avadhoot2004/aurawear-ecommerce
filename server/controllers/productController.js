import Product from '../models/Product.js';

// @desc    Get all products with server-side filtering, search, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      gender,
      category,
      brand,
      size,
      color,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Keyword Search (name, brand, description, tags)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { category: searchRegex }
      ];
    }

    // Filter by Gender (comma-separated or single)
    if (gender) {
      const genders = gender.split(',').map((g) => g.trim());
      query.gender = { $in: genders };
    }

    // Filter by Category
    if (category) {
      const categories = category.split(',').map((c) => c.trim());
      query.category = { $in: categories };
    }

    // Filter by Brand
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brands };
    }

    // Filter by Size
    if (size) {
      const sizes = size.split(',').map((s) => s.trim().toUpperCase());
      query.sizes = { $in: sizes };
    }

    // Filter by Color
    if (color) {
      const colors = color.split(',').map((c) => c.trim());
      query.colors = { $in: colors };
    }

    // Filter by Price range (on finalPrice)
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        query.finalPrice.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query.finalPrice.$lte = Number(maxPrice);
      }
    }

    // Filter by In-Stock availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Determine Sort Order
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOption = { finalPrice: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { finalPrice: -1 };
    } else if (sort === 'popularity') {
      sortOption = { rating: -1, numberOfReviews: -1 };
    } else if (sort === 'discount') {
      sortOption = { discount: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(pageSize),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          totalProducts: total,
          totalPages: Math.ceil(total / pageSize) || 1,
          currentPage: pageNumber,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter metadata (distinct brands, categories, genders, sizes, min/max price)
// @route   GET /api/products/meta/filters
// @access  Public
export const getFilterMetadata = async (req, res, next) => {
  try {
    const [brands, categories, genders, priceStats] = await Promise.all([
      Product.distinct('brand'),
      Product.distinct('category'),
      Product.distinct('gender'),
      Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$finalPrice' },
            maxPrice: { $max: '$finalPrice' }
          }
        }
      ])
    ]);

    const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    res.status(200).json({
      success: true,
      data: {
        brands: brands.sort(),
        categories: categories.sort(),
        genders: genders.sort(),
        sizes: standardSizes,
        priceRange: {
          min: priceStats.length ? priceStats[0].minPrice : 0,
          max: priceStats.length ? priceStats[0].maxPrice : 10000
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      subcategory,
      gender,
      price,
      discount,
      sizes,
      colors,
      images,
      stock,
      tags,
      isFeatured
    } = req.body;

    if (!name || !description || !brand || !category || !gender || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required product fields (name, description, brand, category, gender, price).'
      });
    }

    const product = new Product({
      name,
      description,
      brand,
      category,
      subcategory,
      gender,
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      colors: Array.isArray(colors) ? colors : [colors],
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'],
      stock: stock !== undefined ? Number(stock) : 10,
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: !!isFeatured
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: savedProduct }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const fieldsToUpdate = [
      'name',
      'description',
      'brand',
      'category',
      'subcategory',
      'gender',
      'price',
      'discount',
      'sizes',
      'colors',
      'images',
      'stock',
      'tags',
      'isFeatured'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product: updatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
