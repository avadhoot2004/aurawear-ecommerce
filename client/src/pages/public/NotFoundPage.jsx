import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-4">
        <Compass className="w-12 h-12 text-zinc-400 mx-auto" />
        <h1 className="font-serif text-5xl font-bold text-zinc-950">404</h1>
        <h2 className="text-lg font-semibold text-zinc-900">Page Not Found</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The requested page or collection does not exist or has been shifted to a new department.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
