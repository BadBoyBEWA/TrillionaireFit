'use client';

import { useState, useEffect } from 'react';

interface Address {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressFormProps {
  address?: Address | null;
  onSave: (address: Address) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function AddressForm({ address, onSave, onCancel, isEditing = false }: AddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/addresses', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          id: address?._id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save address');
      }

      const savedAddress = await response.json();
      onSave(savedAddress);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Street Address *
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter state"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Postal Code *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors"
            placeholder="Enter postal code"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Country *
        </label>
        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          required
          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base bg-transparent transition-colors"
        >
          <option value="Nigeria">Nigeria</option>
          <option value="Ghana">Ghana</option>
          <option value="Kenya">Kenya</option>
          <option value="South Africa">South Africa</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleInputChange}
          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Set as default address
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Address' : 'Save Address')}
        </button>
      </div>
    </form>
  );
}
