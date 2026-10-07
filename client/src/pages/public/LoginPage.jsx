import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back to AuraWear.');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-zinc-200/80 shadow-lg">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="font-serif text-3xl font-black tracking-tight text-black">
            AURA<span className="font-light tracking-widest text-zinc-500">WEAR</span>
          </span>
          <h2 className="text-lg font-bold text-zinc-900 pt-2">Welcome Back</h2>
          <p className="text-xs text-zinc-500">Sign in to access your curated bag and orders</p>
        </div>

        {/* Demo Fast-Login Helper Pills */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 text-center">
            Quick Test Accounts (Learning / Portfolio)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('customer@aurawear.com', 'Customer@12345')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-zinc-200 hover:border-zinc-400 rounded-md text-[11px] font-semibold text-zinc-800 transition"
            >
              <User className="w-3 h-3 text-zinc-500" /> Demo Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@aurawear.com', 'Admin@12345')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-zinc-200 hover:border-zinc-400 rounded-md text-[11px] font-semibold text-amber-700 transition"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" /> Demo Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 transition flex items-center justify-center gap-2 shadow-md pt-3.5 pb-3.5 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 pt-2">
          New to AuraWear?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
