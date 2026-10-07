import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Your AuraWear account has been created.');
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-zinc-200/80 shadow-lg">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="font-serif text-3xl font-black tracking-tight text-black">
            AURA<span className="font-light tracking-widest text-zinc-500">WEAR</span>
          </span>
          <h2 className="text-lg font-bold text-zinc-900 pt-2">Create Account</h2>
          <p className="text-xs text-zinc-500">Join our community for tailored styling and faster checkout</p>
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
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
            {loading ? 'Creating Account...' : 'Register'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
