import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import api from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import Pagination from '../../components/common/Pagination';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL Search Params
  const search = searchParams.get('search') || '';
  const gender = searchParams.get('gender') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const size = searchParams.get('size') || '';
  const inStock = searchParams.get('inStock') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await api.get('/products/meta/filters');
        if (response.data.success) {
          setMetadata(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();

      if (search) query.set('search', search);
      if (gender) query.set('gender', gender);
      if (category) query.set('category', category);
      if (brand) query.set('brand', brand);
      if (size) query.set('size', size);
      if (inStock) query.set('inStock', inStock);
      if (sort) query.set('sort', sort);
      query.set('page', page);
      query.set('limit', 12);

      const response = await api.get(`/products?${query.toString()}`);
      if (response.data.success) {
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, gender, category, brand, size, inStock, sort, page]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search); // preserve search keyword if any
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const activeFilterCount = [gender, category, brand, size, inStock].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header bar with title, search context and mobile filter toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">
            {gender ? `${gender} Collection` : 'All Apparel'}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mt-0.5">
            {search ? `Search results for "${search}"` : 'Catalogue'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {pagination.totalProducts} items
          </p>
        </div>

        {/* Sort Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md border border-zinc-300 bg-white text-zinc-800"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-md px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <label htmlFor="sort-select" className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="text-xs font-semibold text-zinc-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sticky Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-sm">
            <ProductFilters
              filters={{ gender, category, brand, size, inStock }}
              metadata={metadata}
              onFilterChange={updateFilter}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>

        {/* Product Grid and Pagination */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage="We couldn't find any clothing matching your current filters. Try resetting your filters to explore more."
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Mobile Filter Slide-out Modal/Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-6">
              <h3 className="font-serif text-lg font-bold">Filter Products</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-zinc-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductFilters
              filters={{ gender, category, brand, size, inStock }}
              metadata={metadata}
              onFilterChange={updateFilter}
              onResetFilters={handleResetFilters}
            />

            <div className="pt-6 border-t border-zinc-200 mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
