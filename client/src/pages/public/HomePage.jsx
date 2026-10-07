import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products?limit=8&sort=popularity');
        if (response.data.success) {
          setFeaturedProducts(response.data.data.products);
        }
      } catch (err) {
        console.error('Error loading featured products:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      title: 'Men’s Tailoring',
      desc: 'Architectural cuts & crisp linen shirts',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      link: '/products?gender=Men'
    },
    {
      title: 'Women’s Dresses',
      desc: 'Flowing silk slips & contemporary midis',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      link: '/products?gender=Women&category=Dresses'
    },
    {
      title: 'Outerwear & Layers',
      desc: 'Wool blazers, trench coats & selvedge denim',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      link: '/products?category=Outerwear'
    },
    {
      title: 'Little Aura Kids',
      desc: 'Playful organic cotton & all-weather sets',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
      link: '/products?gender=Kids'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Editorial Banner */}
      <section className="relative bg-zinc-900 text-white overflow-hidden min-h-[580px] sm:min-h-[660px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80"
            alt="AuraWear Autumn Winter Campaign"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-widest text-zinc-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> New Season Drop
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
              Tactile Ease. Modern Grace.
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-lg">
              Explore our new curated wardrobe essentials crafted with pure Normandy linen, Grade-A cashmere, and relaxed precision tailoring.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products?gender=Women"
                className="px-6 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-md hover:bg-zinc-200 transition shadow-lg"
              >
                Explore Women
              </Link>
              <Link
                to="/products?gender=Men"
                className="px-6 py-3.5 bg-black/60 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-black/90 transition"
              >
                Explore Men
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">Curated Edits</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
              Shop by Department
            </h2>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:text-black mt-2 sm:mt-0 group"
          >
            View All Collections <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] bg-zinc-100 flex flex-col justify-end p-6 border border-zinc-200/80 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <h3 className="font-serif text-xl font-bold">{cat.title}</h3>
                <p className="text-xs text-zinc-300 line-clamp-1">{cat.desc}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider pt-2 text-white/90 group-hover:text-white">
                  Discover <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Trending Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">Trending Now</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
              Popular Essentials
            </h2>
          </div>
          <Link
            to="/products?sort=popularity"
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:text-black mt-2 sm:mt-0 group"
          >
            See More Trending <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* Editorial Quote & Craftsmanship Banner */}
      <section className="bg-zinc-100 py-16 sm:py-20 border-y border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Compass className="w-8 h-8 mx-auto text-zinc-400" />
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-zinc-900 leading-snug">
            “True modern elegance lies not in excess, but in the tactile balance of quiet silhouettes, breathability, and timeless form.”
          </h2>
          <p className="text-xs uppercase font-bold tracking-widest text-zinc-500 pt-2">
            AuraWear Atelier Manifesto
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
