import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const OrderDetailPage = () => {
  const { id } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const response = await api.put(`/orders/${id}/cancel`);
      if (response.data.success) {
        setOrder(response.data.data.order);
        setConfirmCancelOpen(false);
        toast.info('Order was cancelled and inventory restored.');
      }
    } catch (err) {
      toast.error(err.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-zinc-200 w-48 rounded" />
        <div className="h-64 bg-zinc-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-bold text-black uppercase underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';
  const canCancel = ['PLACED', 'CONFIRMED'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button & Title */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-black mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          {canCancel && (
            <button
              onClick={() => setConfirmCancelOpen(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status Progress Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-6">
          Delivery Status
        </h3>

        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-medium">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">This order has been cancelled.</p>
              <p className="text-[11px] text-red-700">Stock has been returned to our inventory.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Progress line */}
            <div className="overflow-hidden h-1.5 mb-6 flex rounded bg-zinc-100">
              <div
                style={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`
                }}
                className="bg-black transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-5 text-center gap-1">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={st} className="space-y-1.5">
                    <div
                      className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isPassed
                          ? 'bg-black text-white'
                          : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold truncate ${
                        isCurrent ? 'text-black' : isPassed ? 'text-zinc-700' : 'text-zinc-400'
                      }`}
                    >
                      {st}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Breakdown: 2 Cols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Items Snapshot (2 cols) */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
            Items in this Shipment
          </h3>

          <div className="space-y-4">
            {order.orderItems?.map((item) => (
              <div key={item._id} className="flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {item.brand}
                  </p>
                  <p className="text-xs font-semibold text-zinc-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Size: <span className="font-medium text-zinc-800">{item.size}</span> • Color:{' '}
                    <span className="font-medium text-zinc-800">{item.color}</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-950">
                    ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Address & Price Summary (1 col) */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <MapPin className="w-4 h-4 text-black" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Delivery Address
              </h3>
            </div>
            <div className="text-xs text-zinc-600 space-y-1">
              <p className="font-bold text-zinc-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                {order.shippingAddress?.pincode}
              </p>
              <p className="text-zinc-500 pt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment & Price Summary */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-2 border-b border-zinc-100">
              Payment & Totals
            </h3>

            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-bold text-zinc-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className={order.isPaid ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {order.isPaid ? 'PAID' : 'DUE UPON DELIVERY'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-100">
                <span>Items Subtotal</span>
                <span>₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>₹{order.taxPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Total</span>
              <span className="text-lg font-bold text-zinc-950">
                ₹{order.totalPrice?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Order Cancellation */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-zinc-900">Cancel This Order?</h3>
              <p className="text-xs text-zinc-500">
                Are you sure you want to cancel this order? This action will return items to stock.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
