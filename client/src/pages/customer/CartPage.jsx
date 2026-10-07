import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <ShoppingBag className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Please Sign In</h2>
        <p className="text-xs text-zinc-500 mb-6">Sign in to view your bag and proceed to checkout.</p>
        <Link
          to="/login?redirect=/cart"
          className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary || {
    totalItems: 0,
    totalOriginalPrice: 0,
    discountSavings: 0,
    subtotal: 0,
    shippingPrice: 0,
    taxPrice: 0,
    grandTotal: 0
  };

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-zinc-500 mb-6">
          Looks like you haven't added any clothing pieces yet. Explore our latest arrivals to elevate your wardrobe.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition shadow-md"
        >
          Explore Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const hasOutOfStockItems = items.some((item) => item.isOutOfStock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mb-2">
        Shopping Bag
      </h1>
      <p className="text-xs text-zinc-500 mb-8">
        {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'} in your bag
      </p>

      {hasOutOfStockItems && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
          One or more items in your bag exceed available inventory stock. Please adjust quantities before proceeding.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Bag Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            return (
              <div
                key={item._id}
                className="flex gap-4 sm:gap-6 bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-sm"
              >
                {/* Thumbnail */}
                <Link
                  to={`/products/${prod._id}`}
                  className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200"
                >
                  <img
                    src={prod.images?.[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        {prod.brand}
                      </p>
                      <Link
                        to={`/products/${prod._id}`}
                        className="text-sm font-semibold text-zinc-900 hover:text-black line-clamp-1 mt-0.5"
                      >
                        {prod.name}
                      </Link>

                      {/* Attributes */}
                      <div className="flex items-center gap-3 text-xs text-zinc-600 mt-2">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded font-medium">
                          Size: {item.size}
                        </span>
                        <span className="bg-zinc-100 px-2 py-0.5 rounded font-medium">
                          Color: {item.color}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-zinc-400 hover:text-red-600 p-1 rounded transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-zinc-300 rounded-md bg-white">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center text-xs font-bold text-zinc-600 hover:text-black disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= prod.stock}
                        className="w-7 h-7 flex items-center justify-center text-xs font-bold text-zinc-600 hover:text-black disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-950">
                        ₹{item.itemTotal?.toLocaleString('en-IN')}
                      </p>
                      {prod.discount > 0 && (
                        <p className="text-[11px] text-zinc-400 line-through">
                          ₹{(prod.price * item.quantity)?.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Price Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4 sticky top-28">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹{summary.totalOriginalPrice?.toLocaleString('en-IN')}</span>
              </div>

              {summary.discountSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Bag Discount</span>
                  <span>- ₹{summary.discountSavings?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{summary.subtotal?.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (5% GST)</span>
                <span>₹{summary.taxPrice?.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                {summary.shippingPrice === 0 ? (
                  <span className="text-emerald-700 font-semibold uppercase text-[10px]">Free</span>
                ) : (
                  <span>₹{summary.shippingPrice}</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-zinc-900">Total Payable</span>
              <span className="text-xl font-bold text-zinc-950">
                ₹{summary.grandTotal?.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={hasOutOfStockItems || items.length === 0}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 transition flex items-center justify-center gap-2 shadow-md pt-3.5 pb-3.5"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Safe & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
