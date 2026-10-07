import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Truck, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Autofill if user has a default address saved in profile
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setShippingAddress({
        fullName: defaultAddr.fullName || user.name || '',
        phone: defaultAddr.phone || '',
        street: defaultAddr.street || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        pincode: defaultAddr.pincode || ''
      });
    }
  }, [user]);

  const items = cart?.items || [];
  const summary = cart?.summary || { grandTotal: 0 };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">No Items to Checkout</h2>
        <p className="text-xs text-zinc-500 mb-6">Your shopping bag is empty.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutofillSavedAddress = (addr) => {
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const { fullName, phone, street, city, state, pincode } = shippingAddress;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/orders', {
        shippingAddress,
        paymentMethod
      });

      if (response.data.success) {
        const orderId = response.data.data.order._id;
        await fetchCart(); // Refresh cart to empty state
        toast.success('Your order has been placed successfully!');
        navigate(`/orders/${orderId}`, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please check stock availability.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mb-2">
        Checkout
      </h1>
      <p className="text-xs text-zinc-500 mb-8">
        Review your delivery details and order summary
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Shipping Address & Payment Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address Box */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-black" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Delivery Address
                </h2>
              </div>
            </div>

            {/* Saved Addresses quick picker */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Select from Saved Addresses:
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.addresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => handleAutofillSavedAddress(addr)}
                      className="px-3 py-1.5 bg-white border border-zinc-300 rounded-md text-[11px] font-semibold text-zinc-800 hover:border-black transition"
                    >
                      {addr.city} ({addr.pincode})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="Rohit Sharma"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Street Address & Flat / Apartment *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="Flat 402, Skyline Residency, Bandra West"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="Maharashtra"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="400050"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Payment Method
            </h2>

            <div className="p-4 border-2 border-black bg-zinc-50/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                    Cash on Delivery (COD)
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Pay securely in cash or UPI directly to the delivery partner upon parcel delivery.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-5 sticky top-28">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Order Items ({items.length})
            </h2>

            {/* Thumbnail preview list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                    className="w-12 h-14 rounded-md object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Qty: {item.quantity} • Size: {item.size}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">
                    ₹{item.itemTotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{summary.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5% GST)</span>
                <span>₹{summary.taxPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {summary.shippingPrice === 0 ? 'FREE' : `₹${summary.shippingPrice}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-zinc-900">Final Payable</span>
              <span className="text-xl font-bold text-zinc-950">
                ₹{summary.grandTotal?.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 transition flex items-center justify-center gap-2 shadow-lg pt-3.5 pb-3.5"
            >
              {submitting ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Truck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ships within 24-48 business hours</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
