import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, ChevronRight, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const statuses = ['ALL', 'PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminOrdersPage = () => {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (activeStatus !== 'ALL') query.set('status', activeStatus);
      query.set('page', page);
      query.set('limit', 12);

      const response = await api.get(`/admin/orders?${query.toString()}`);
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const response = await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}.`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Fulfillment & Orders
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Process customer orders, update tracking states, and review delivery destinations
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => {
              setActiveStatus(st);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
              activeStatus === st
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase text-[10px] tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{ord.shippingAddress?.fullName || ord.user?.name}</p>
                      <p className="text-[10px] text-zinc-400">{ord.shippingAddress?.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-zinc-300 truncate max-w-[150px]">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                      </p>
                      <p className="text-[10px] text-zinc-500">{ord.shippingAddress?.pincode}</p>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{ord.totalPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        disabled={updatingId === ord._id}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded bg-zinc-900 border focus:outline-none cursor-pointer ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'text-emerald-400 border-emerald-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'text-red-400 border-red-800'
                            : 'text-zinc-200 border-zinc-700'
                        }`}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 p-1 text-zinc-400 hover:text-white"
                        title="View Full Order"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            No orders found under {activeStatus}.
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 rounded"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
