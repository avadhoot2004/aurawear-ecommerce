import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
      enum: ['Topwear', 'Bottomwear', 'Dresses', 'Footwear', 'Outerwear', 'Accessories']
    },
    subcategory: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      required: [true, 'Please specify target gender'],
      enum: ['Men', 'Women', 'Unisex', 'Kids']
    },
    price: {
      type: Number,
      required: [true, 'Please provide regular price'],
      min: [0, 'Price must be non-negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [90, 'Discount cannot exceed 90%']
    },
    finalPrice: {
      type: Number,
      default: function () {
        return Math.round(this.price * (1 - (this.discount || 0) / 100));
      }
    },
    sizes: {
      type: [String],
      required: [true, 'Please provide available sizes'],
      default: ['S', 'M', 'L', 'XL']
    },
    colors: {
      type: [String],
      required: [true, 'Please provide available colors'],
      default: ['Black']
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image URL'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Please provide total stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 10
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    numberOfReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    tags: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure finalPrice is consistently computed
productSchema.pre('save', function (next) {
  if (this.isModified('price') || this.isModified('discount')) {
    this.finalPrice = Math.round(this.price * (1 - (this.discount || 0) / 100));
  }
  next();
});

// Indexes for high performance searching, filtering, and sorting
productSchema.index({ name: 'text', brand: 'text', category: 'text', tags: 'text' });
productSchema.index({ category: 1, gender: 1, finalPrice: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
