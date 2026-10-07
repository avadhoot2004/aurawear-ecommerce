import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const getStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SHIPPED':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'PACKED':
    case 'CONFIRMED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-zinc-100 text-zinc-800 border-zinc-200';
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/my-orders');
        if (response.data.success) {
          setOrders(response.data.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4 animate-pulse">
        <div className="h-6 bg-zinc-200 w-48 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-zinc-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">No Orders Placed Yet</h2>
        <p className="text-xs text-zinc-500 mb-6">
          You haven't ordered any items yet. Discover our curated collection today.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mb-2">
        My Orders
      </h1>
      <p className="text-xs text-zinc-500 mb-8">
        Review and track all your previous purchases
      </p>

      <div className="space-y-5">
        {orders.map((order) => {
          const totalUnits = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5 sm:p-6 space-y-4 hover:border-zinc-300 transition"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-zinc-500">Placed on {orderDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails & summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {order.orderItems?.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      title={`${item.name} (${item.quantity}x)`}
                      className="w-14 h-16 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                    />
                  ))}
                  {order.orderItems?.length > 4 && (
                    <div className="w-14 h-16 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 border border-zinc-200">
                      +{order.orderItems.length - 4} more
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Total Amount</p>
                    <p className="text-base font-bold text-zinc-950">
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
