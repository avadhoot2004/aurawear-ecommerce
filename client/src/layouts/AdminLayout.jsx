import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  Users,
  ArrowLeft,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, loading, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Strictly guard admin routes
  if (!isAdmin) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: PackageCheck },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-900 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white block">AURAWEAR</span>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Management Console</span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 rounded-lg hover:bg-zinc-900 transition text-left"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0e]">
        <header className="h-16 border-b border-zinc-800 px-8 flex items-center justify-between bg-zinc-950/60 backdrop-blur">
          <h1 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
            AuraWear Operations
          </h1>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400">{user?.email}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase text-[10px]">
              Super Admin
            </span>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
