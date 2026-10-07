import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper to format cart response with computed totals
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalOriginalPrice = 0;
  const items = [];

  for (const item of cart.items) {
    if (!item.product) continue;

    const unitPrice = item.product.finalPrice;
    const originalUnitPrice = item.product.price;
    const itemTotal = unitPrice * item.quantity;
    const originalItemTotal = originalUnitPrice * item.quantity;

    subtotal += itemTotal;
    totalOriginalPrice += originalItemTotal;

    items.push({
      _id: item._id,
      product: {
        _id: item.product._id,
        name: item.product.name,
        brand: item.product.brand,
        images: item.product.images,
        price: item.product.price,
        discount: item.product.discount,
        finalPrice: item.product.finalPrice,
        stock: item.product.stock
      },
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      itemTotal,
      isOutOfStock: item.product.stock < item.quantity
    });
  }

  const discountSavings = totalOriginalPrice - subtotal;
  const shippingPrice = subtotal > 0 && subtotal < 1999 ? 150 : 0; // Free shipping over 1999
  const taxPrice = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + shippingPrice + taxPrice;

  return {
    _id: cart._id,
    items,
    summary: {
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalOriginalPrice,
      discountSavings,
      subtotal,
      shippingPrice,
      taxPrice,
      grandTotal
    }
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name brand images price discount finalPrice stock sizes colors'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: {
        cart: formatCartResponse(cart)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    if (!productId || !size || !color) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, size, and color are required.'
      });
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock.`
      });
    }

    if (!product.sizes.includes(size)) {
      return res.status(400).json({
        success: false,
        message: `Size '${size}' is not available for this product.`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if the item already exists in cart with matching size & color
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You already have ${cart.items[existingIndex].quantity} in cart and total stock is ${product.stock}.`
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        size,
        color,
        quantity: qty
      });
    }

    await cart.save();

    // Re-fetch populated cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand images price discount finalPrice stock sizes colors'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to bag.',
      data: {
        cart: formatCartResponse(cart)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in bag.'
      });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      // Product was deleted from catalog, remove item from cart
      cart.items.pull(itemId);
      await cart.save();
      return res.status(400).json({
        success: false,
        message: 'This product is no longer available and was removed from your bag.'
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock.`
      });
    }

    item.quantity = qty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand images price discount finalPrice stock sizes colors'
    });

    res.status(200).json({
      success: true,
      message: 'Bag updated.',
      data: {
        cart: formatCartResponse(populatedCart)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items.pull(itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand images price discount finalPrice stock sizes colors'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from bag.',
      data: {
        cart: formatCartResponse(populatedCart)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bag cleared.',
      data: {
        cart: {
          items: [],
          summary: {
            totalItems: 0,
            totalOriginalPrice: 0,
            discountSavings: 0,
            subtotal: 0,
            shippingPrice: 0,
            taxPrice: 0,
            grandTotal: 0
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
