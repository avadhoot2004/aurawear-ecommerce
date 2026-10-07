import React from 'react';
import { RotateCcw, Check } from 'lucide-react';

const ProductFilters = ({
  filters,
  metadata,
  onFilterChange,
  onResetFilters,
  className = ''
}) => {
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];
  const categories = metadata?.categories || ['Topwear', 'Bottomwear', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
  const brands = metadata?.brands || [];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const handleGenderToggle = (gender) => {
    const current = filters.gender ? filters.gender.split(',') : [];
    const updated = current.includes(gender)
      ? current.filter((g) => g !== gender)
      : [...current, gender];
    onFilterChange('gender', updated.join(','));
  };

  const handleCategoryToggle = (cat) => {
    const current = filters.category ? filters.category.split(',') : [];
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    onFilterChange('category', updated.join(','));
  };

  const handleBrandToggle = (brand) => {
    const current = filters.brand ? filters.brand.split(',') : [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onFilterChange('brand', updated.join(','));
  };

  const handleSizeToggle = (size) => {
    const current = filters.size ? filters.size.split(',') : [];
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    onFilterChange('size', updated.join(','));
  };

  const activeGenderList = filters.gender ? filters.gender.split(',') : [];
  const activeCategoryList = filters.category ? filters.category.split(',') : [];
  const activeBrandList = filters.brand ? filters.brand.split(',') : [];
  const activeSizeList = filters.size ? filters.size.split(',') : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Clear button */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Filters</h3>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-black font-medium transition"
        >
          <RotateCcw className="w-3 h-3" /> Clear All
        </button>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2.5">Department</h4>
        <div className="space-y-1.5">
          {genders.map((g) => {
            const checked = activeGenderList.includes(g);
            return (
              <label
                key={g}
                className="flex items-center gap-2.5 text-xs text-zinc-600 hover:text-black cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleGenderToggle(g)}
                  className="rounded border-zinc-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
                />
                <span className={checked ? 'font-semibold text-black' : ''}>{g}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="pt-4 border-t border-zinc-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2.5">Category</h4>
        <div className="space-y-1.5">
          {categories.map((c) => {
            const checked = activeCategoryList.includes(c);
            return (
              <label
                key={c}
                className="flex items-center gap-2.5 text-xs text-zinc-600 hover:text-black cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCategoryToggle(c)}
                  className="rounded border-zinc-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
                />
                <span className={checked ? 'font-semibold text-black' : ''}>{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div className="pt-4 border-t border-zinc-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2.5">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => {
            const checked = activeSizeList.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSizeToggle(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
                  checked
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="pt-4 border-t border-zinc-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2.5">Brand</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {brands.map((b) => {
              const checked = activeBrandList.includes(b);
              return (
                <label
                  key={b}
                  className="flex items-center gap-2.5 text-xs text-zinc-600 hover:text-black cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(b)}
                    className="rounded border-zinc-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className={checked ? 'font-semibold text-black' : ''}>{b}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* In-Stock filter */}
      <div className="pt-4 border-t border-zinc-100">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => onFilterChange('inStock', e.target.checked ? 'true' : '')}
            className="rounded border-zinc-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
