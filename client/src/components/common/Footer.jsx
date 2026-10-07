import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, RotateCcw, Truck, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-16 pb-12 border-t border-zinc-900 mt-20">
      {/* Value propositions banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Complimentary Shipping</h4>
              <p className="text-xs text-zinc-400 mt-0.5">On all orders above ₹1,999</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">15-Day Hassle-Free Returns</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Doorstep pickup & exchange</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Genuine Apparel</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Curated artisanal fashion</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cash on Delivery</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Pay upon package arrival</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              AURA<span className="font-light tracking-widest text-zinc-400">WEAR</span>
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              AuraWear redefines modern wardrobe essentials with mindful tailoring, tactile natural textiles, and effortless everyday sophistication.
            </p>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">Subscribe to our newsletter</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-zinc-900 text-xs text-white px-3 py-2.5 rounded-l-lg border border-zinc-800 focus:outline-none focus:border-zinc-500 w-full"
                />
                <button
                  type="submit"
                  className="bg-white text-black text-xs font-semibold px-4 py-2.5 rounded-r-lg hover:bg-zinc-200 transition"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Men Column */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Men</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/products?gender=Men&category=Topwear" className="hover:text-white transition">Shirts & Tees</Link></li>
              <li><Link to="/products?gender=Men&category=Bottomwear" className="hover:text-white transition">Trousers & Jeans</Link></li>
              <li><Link to="/products?gender=Men&category=Outerwear" className="hover:text-white transition">Jackets & Cardigans</Link></li>
              <li><Link to="/products?gender=Men&category=Footwear" className="hover:text-white transition">Sneakers & Loafers</Link></li>
            </ul>
          </div>

          {/* Women Column */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Women</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/products?gender=Women&category=Dresses" className="hover:text-white transition">Midi & Maxi Dresses</Link></li>
              <li><Link to="/products?gender=Women&category=Outerwear" className="hover:text-white transition">Blazers & Coats</Link></li>
              <li><Link to="/products?gender=Women&category=Bottomwear" className="hover:text-white transition">Linen Trousers</Link></li>
              <li><Link to="/products?gender=Women&category=Accessories" className="hover:text-white transition">Handbags & Belts</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/orders" className="hover:text-white transition">Track Order</Link></li>
              <li><span className="cursor-pointer hover:text-white transition">Shipping Policy</span></li>
              <li><span className="cursor-pointer hover:text-white transition">Returns & Exchanges</span></li>
              <li><span className="cursor-pointer hover:text-white transition">Size Guide</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© 2026 AuraWear Ltd. All rights reserved. MERN Portfolio Demonstration.</p>
        <div className="flex gap-6">
          <span className="hover:text-zinc-400 cursor-pointer">Privacy Notice</span>
          <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-400 cursor-pointer">Security Standards</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
