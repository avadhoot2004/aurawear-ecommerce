import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col bg-white rounded-lg overflow-hidden border border-zinc-200/80 hover:border-zinc-400 hover:shadow-md transition-all duration-300"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
            {product.discount}% OFF
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute bottom-2.5 left-2.5 right-2.5 bg-zinc-950/90 text-white text-[11px] font-semibold text-center py-1 uppercase tracking-wider backdrop-blur-sm rounded">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Only {product.stock} Left
          </span>
        ) : null}

        {/* Rating Floating Pill */}
        {product.rating > 0 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[11px] font-semibold text-zinc-900 shadow-sm">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-zinc-400 text-[10px]">({product.numberOfReviews || 0})</span>
          </div>
        )}
      </div>

      {/* Product Details info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Brand */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 truncate">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="text-sm font-medium text-zinc-900 group-hover:text-black line-clamp-1 transition-colors mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-zinc-100">
          <span className="text-sm font-bold text-zinc-950">
            ₹{product.finalPrice?.toLocaleString('en-IN') || product.price?.toLocaleString('en-IN')}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-zinc-400 line-through">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
