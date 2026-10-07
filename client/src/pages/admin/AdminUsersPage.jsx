import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const toast = useToast();
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (err) {
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (targetUser) => {
    if (targetUser._id === currentAdmin._id) {
      toast.error('You cannot change your own administrator role.');
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const response = await api.put(`/admin/users/${targetUser._id}/role`, {
        role: newRole
      });
      if (response.data.success) {
        toast.success(`Role for ${targetUser.name} updated to ${newRole}.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Customer & Admin Directory
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          View registered accounts and manage role-based permissions
        </p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading user directory...</div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase text-[10px] tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Saved Addresses</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Role Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((u) => {
                  const isSelf = u._id === currentAdmin?._id;
                  return (
                    <tr key={u._id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-semibold text-white">
                        {u.name} {isSelf && <span className="text-[10px] text-zinc-500">(You)</span>}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-950 text-amber-400 border border-amber-900'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <>
                              <ShieldCheck className="w-3 h-3" /> Admin
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" /> Customer
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{u.addresses?.length || 0}</td>
                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition"
                          >
                            Toggle to {u.role === 'admin' ? 'Customer' : 'Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
