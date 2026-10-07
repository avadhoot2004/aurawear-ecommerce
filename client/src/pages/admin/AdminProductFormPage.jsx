import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: 'Topwear',
    subcategory: '',
    gender: 'Men',
    price: '',
    discount: 0,
    stock: 10,
    sizes: ['S', 'M', 'L'],
    colors: 'Black, White',
    images: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
    tags: 'casual, cotton',
    isFeatured: false
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const response = await api.get(`/products/${id}`);
          if (response.data.success) {
            const p = response.data.data.product;
            setFormData({
              name: p.name || '',
              description: p.description || '',
              brand: p.brand || '',
              category: p.category || 'Topwear',
              subcategory: p.subcategory || '',
              gender: p.gender || 'Men',
              price: p.price || '',
              discount: p.discount || 0,
              stock: p.stock || 10,
              sizes: p.sizes || ['S', 'M'],
              colors: Array.isArray(p.colors) ? p.colors.join(', ') : '',
              images: Array.isArray(p.images) ? p.images.join('\n') : '',
              tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
              isFeatured: !!p.isFeatured
            });
          }
        } catch (err) {
          toast.error('Failed to load product details.');
          navigate('/admin/products');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const updated = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || !formData.price) {
      toast.error('Please enter name, brand, and price.');
      return;
    }

    if (formData.sizes.length === 0) {
      toast.error('Please select at least one available size.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      stock: Number(formData.stock || 0),
      colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean),
      images: formData.images.split('\n').map((url) => url.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
    };

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated successfully.');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully.');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-xs text-zinc-400 p-8">Loading product data...</div>;
  }

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products List
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          {isEdit ? 'Edit Product' : 'Create New Product'}
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Define attributes, inventory levels, sizing, and media assets
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Pure French Linen Relaxed Shirt"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              required
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g. LinenCraft"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Department *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Dresses">Dresses</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Subcategory (Optional)
            </label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              placeholder="e.g. Linen Shirts"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Retail Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="2999"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="90"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              placeholder="20"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Stock Units *
            </label>
            <input
              type="number"
              min="0"
              required
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="15"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Colors (Comma-separated)
            </label>
            <input
              type="text"
              name="colors"
              value={formData.colors}
              onChange={handleInputChange}
              placeholder="Sky Blue, Sand Beige, Pure White"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2">
              Available Sizes *
            </label>
            <div className="flex gap-2">
              {allSizes.map((s) => {
                const checked = formData.sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSizeToggle(s)}
                    className={`px-3 py-1.5 text-xs font-bold rounded border transition ${
                      checked
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Product Images (One URL per line) *
            </label>
            <textarea
              rows={3}
              required
              name="images"
              value={formData.images}
              onChange={handleInputChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Product Description *
            </label>
            <textarea
              rows={4}
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of tailoring, fabric, and fit..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="rounded border-zinc-700 bg-zinc-900 text-black h-4 w-4"
              />
              <span>Feature this product in the homepage spotlight</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
