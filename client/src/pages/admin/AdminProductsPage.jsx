import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminProductsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      query.set('page', page);
      query.set('limit', 10);

      const response = await api.get(`/products?${query.toString()}`);
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalProducts(response.data.data.pagination.totalProducts);
      }
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      const response = await api.delete(`/products/${productToDelete._id}`);
      if (response.data.success) {
        toast.success(`"${productToDelete.name}" was deleted.`);
        setDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Product Management
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage catalogue, stock inventory, and apparel listings ({totalProducts} total)
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition shadow"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filter / Search input */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, brand, or tag..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-zinc-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading catalogue...</div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase text-[10px] tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Final</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-12 rounded object-cover bg-zinc-800 border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {p.brand}
                          </p>
                          <p className="font-semibold text-white truncate max-w-[200px]">
                            {p.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-zinc-400">
                        {p.gender} • {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">₹{p.price}</td>
                    <td className="py-3 px-4">
                      {p.discount > 0 ? (
                        <span className="text-emerald-400 font-bold">{p.discount}%</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">₹{p.finalPrice}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.stock === 0
                            ? 'bg-red-950 text-red-400 border border-red-900'
                            : p.stock <= 5
                            ? 'bg-amber-950 text-amber-400 border border-amber-900'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">No products found.</div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 rounded"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Product</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to permanently remove "{productToDelete.name}" from the catalogue?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {deleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
