import React from 'react';
import ProductCard from './ProductCard';
import { ShoppingBag } from 'lucide-react';

const ProductGrid = ({ products, loading, emptyMessage = 'No products found matching your criteria.' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="aspect-[3/4] bg-zinc-200 w-full" />
            <div className="p-3.5 space-y-2">
              <div className="h-3 bg-zinc-200 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 rounded w-4/5" />
              <div className="h-4 bg-zinc-200 rounded w-1/2 pt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center my-6">
        <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 mb-1">No items found</h3>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
