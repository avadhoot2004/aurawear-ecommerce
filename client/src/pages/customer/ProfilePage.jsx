import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Address modal/form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingUser(true);
      const payload = { name };
      if (password) {
        if (password.length < 6) {
          toast.error('New password must be at least 6 characters.');
          setUpdatingUser(false);
          return;
        }
        payload.password = password;
      }
      await updateProfile(payload);
      setPassword('');
      toast.success('Your profile details were updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { fullName, phone, street, city, state, pincode } = newAddress;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      toast.error('Please complete all address fields.');
      return;
    }

    try {
      const currentAddresses = user?.addresses || [];
      const updatedAddresses = [...currentAddresses, newAddress];
      await updateProfile({ addresses: updatedAddresses });
      toast.success('New delivery address added.');
      setShowAddressForm(false);
      setNewAddress({
        fullName: user?.name || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    } catch (err) {
      toast.error(err.message || 'Could not save address.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const updated = user.addresses.filter((a) => a._id !== addressId);
      await updateProfile({ addresses: updated });
      toast.info('Address removed.');
    } catch (err) {
      toast.error(err.message || 'Could not delete address.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mb-1">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-500">
          Manage your personal information and delivery addresses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Personal Information & Password Form */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <User className="w-4 h-4 text-black" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Personal Profile
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Email cannot be changed directly</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                Change Password (Optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={updatingUser}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 transition"
            >
              {updatingUser ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Right: Saved Delivery Addresses */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Address Book
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="flex items-center gap-1 text-xs font-bold text-black hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          {/* New Address Sub-form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900">Add New Shipping Address</h3>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded-md p-2 text-xs"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded-md p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Street Address"
                required
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded-md p-2 text-xs"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="bg-white border border-zinc-300 rounded-md p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="bg-white border border-zinc-300 rounded-md p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  required
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="bg-white border border-zinc-300 rounded-md p-2 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-md"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-2 bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Addresses */}
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="space-y-3">
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 text-zinc-600">
                    <p className="font-bold text-zinc-900">{addr.fullName}</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-zinc-500 text-[11px]">Phone: {addr.phone}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-zinc-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No saved addresses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
