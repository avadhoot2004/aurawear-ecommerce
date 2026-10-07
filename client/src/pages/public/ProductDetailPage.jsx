import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        if (response.data.success) {
          const prod = response.data.data.product;
          setProduct(prod);
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
        }
      } catch (err) {
        setError(err.message || 'Product could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please choose a size before adding to bag.');
      return;
    }
    if (!selectedColor) {
      toast.error('Please choose a color before adding to bag.');
      return;
    }

    setAddingToCart(true);
    await addToCart(product._id, selectedSize, selectedColor, quantity);
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-zinc-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-zinc-200 w-1/4 rounded" />
            <div className="h-8 bg-zinc-200 w-3/4 rounded" />
            <div className="h-6 bg-zinc-200 w-1/3 rounded" />
            <div className="h-24 bg-zinc-200 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">{error || 'This apparel item might have been archived or removed.'}</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md"
        >
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-8">
        <Link to="/" className="hover:text-black transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?gender=${product.gender}`} className="hover:text-black transition">{product.gender}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category}`} className="hover:text-black transition">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-900 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Product Images Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Image */}
          <div className="flex-1 aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
            <img
              src={product.images?.[selectedImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Right: Product Purchase Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              {product.brand}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
              {product.name}
            </h1>

            {/* Rating pill */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-xs font-bold text-zinc-800">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs text-zinc-500">
                {product.numberOfReviews} customer ratings
              </span>
            </div>
          </div>

          {/* Price Row */}
          <div className="pb-4 border-b border-zinc-200">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-950">
                ₹{product.finalPrice.toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-base text-zinc-400 line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Inclusive of all taxes. Free shipping over ₹1,999.</p>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Select Size: <span className="font-normal text-zinc-500">{selectedSize}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] h-11 px-3 text-xs font-bold uppercase rounded-md border transition ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-2">
              Select Color: <span className="font-normal text-zinc-500">{selectedColor}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {product.colors?.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition ${
                    selectedColor === col
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Stock status */}
          <div className="flex items-center gap-4 pt-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                Quantity
              </span>
              <div className="flex items-center border border-zinc-300 rounded-md bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-9 flex items-center justify-center text-sm font-bold text-zinc-600 hover:text-black disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-9 text-center text-xs font-bold text-zinc-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-9 flex items-center justify-center text-sm font-bold text-zinc-600 hover:text-black disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-5">
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
                  Hurry, only {product.stock} items remaining!
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  In Stock & Ready to Ship
                </span>
              )}
            </div>
          </div>

          {/* Add to Bag CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2.5 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock ? 'Sold Out' : addingToCart ? 'Adding to Bag...' : 'Add to Shopping Bag'}
            </button>
          </div>

          {/* Description & Details */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Product Overview
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Assurance guarantees */}
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-zinc-700">
              <Truck className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Standard delivery within 3-5 business days across India.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-700">
              <RotateCcw className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Complimentary 15-day exchanges & returns pickup.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-700">
              <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>100% Genuine, ethically sourced fabric and tailoring.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
