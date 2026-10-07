import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-800 w-48 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockCount: 0
  };

  const statCards = [
    {
      title: 'Total Gross Revenue',
      value: `₹${metrics.totalRevenue?.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
    },
    {
      title: 'Total Orders Placed',
      value: metrics.totalOrders,
      icon: Package,
      color: 'text-sky-400 bg-sky-950/40 border-sky-800/40'
    },
    {
      title: 'Active Products',
      value: metrics.totalProducts,
      icon: ShoppingBag,
      color: 'text-purple-400 bg-purple-950/40 border-purple-800/40'
    },
    {
      title: 'Registered Customers',
      value: metrics.totalUsers,
      icon: Users,
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/40'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Operations Overview
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time metrics, catalog health, and order fulfillment status
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Notification (if any) */}
      {metrics.lowStockCount > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                Low Stock Warning: {metrics.lowStockCount} items have 5 or fewer units remaining.
              </p>
              <p className="text-[11px] text-amber-400/80">
                Replenish inventory to avoid fulfillment shortages.
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition shrink-0"
          >
            Review Stock
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Customer Orders
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Last 6 orders placed in the system</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase text-[10px] tracking-wider text-zinc-400">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-white">{ord.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-zinc-500">{ord.user?.email}</p>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ₹{ord.totalPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="text-xs font-semibold text-amber-400 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 py-6 text-center">No orders recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
