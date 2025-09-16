'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileForm from '@/components/dashboard/ProfileForm';
import AddressForm from '@/components/dashboard/AddressForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToastContainer from '@/components/ui/ToastContainer';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      designer: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  payment: {
    status: string;
    method: string;
  };
  estimatedDelivery?: string;
  trackingNumber?: string;
  deliveredAt?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

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

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { dialog, showConfirm, hideConfirm, handleConfirm } = useConfirmDialog();
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await fetch('/api/orders?limit=10', {
        credentials: 'include'
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }

      // Fetch user profile
      const profileResponse = await fetch('/api/users/profile', {
        credentials: 'include'
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Fetch addresses
      const addressesResponse = await fetch('/api/users/addresses', {
        credentials: 'include'
      });
      
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    showSuccess('Profile updated successfully');
  };

  const handleAddressSave = (savedAddress: Address) => {
    if (editingAddress) {
      setAddresses(prev => prev.map(addr => 
        addr._id === savedAddress._id ? savedAddress : addr
      ));
      setEditingAddress(null);
      showSuccess('Address updated successfully');
    } else {
      setAddresses(prev => [...prev, savedAddress]);
      showSuccess('Address added successfully');
    }
    setShowAddressForm(false);
  };

  const handleAddressEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddressDelete = (addressId: string) => {
    showConfirm(
      'Delete Address',
      'Are you sure you want to delete this address? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/users/addresses?id=${addressId}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (response.ok) {
            setAddresses(prev => prev.filter(addr => addr._id !== addressId));
            showSuccess('Address deleted successfully');
          } else {
            showError('Failed to delete address');
          }
        } catch (err) {
          console.error('Delete address error:', err);
          showError('Failed to delete address');
        }
      },
      {
        confirmText: 'Delete Address',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    );
  };

  const handleOrderDelete = (orderId: string) => {
    showConfirm(
      'Delete Order',
      'Are you sure you want to delete this order? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (response.ok) {
            setOrders(prev => prev.filter(order => order._id !== orderId));
            showSuccess('Order deleted successfully');
          } else {
            const errorData = await response.json();
            showError(errorData.error || 'Failed to delete order');
          }
        } catch (err) {
          console.error('Delete order error:', err);
          showError('Failed to delete order');
        }
      },
      {
        confirmText: 'Delete Order',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Welcome back, {profile?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and track your orders</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'orders', name: 'Orders' },
              { id: 'profile', name: 'Profile' },
              { id: 'addresses', name: 'Addresses' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-black mb-6">Account Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
                  <p className="text-2xl font-bold text-black">{orders.length}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Orders</h3>
                  <p className="text-2xl font-bold text-black">
                    {orders.filter(order => order.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spent</h3>
                  <p className="text-2xl font-bold text-black">
                    ₦{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black mb-4">Recent Orders</h3>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-black">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-black">₦{order.total.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link 
                      href="/dashboard?tab=orders"
                      className="block text-center text-black hover:text-gray-600 font-medium"
                    >
                      View all orders →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link 
                      href="/"
                      className="inline-flex items-center px-4 py-2 border border-black text-black font-medium hover:bg-gray-50 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-black mb-6">Order History</h2>
              
              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-black">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-black">₦{order.total.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOrderDelete(order._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium p-2 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete order"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                              {item.product?.images?.[0] ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name || 'Product'}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <span className="text-xs text-gray-500">IMG</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-black truncate">
                                {item.product?.name || 'Product not found'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {item.product?.designer || 'Unknown designer'}
                              </p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium text-black">
                              ₦{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span>Payment Method:</span>
                          <span className="capitalize">{order.payment.method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Payment Status:</span>
                          <span className={`capitalize ${order.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {order.payment.status}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Tracking Number:</span>
                            <span className="font-mono text-blue-600">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Estimated Delivery:</span>
                            <span>{formatDate(order.estimatedDelivery)}</span>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Delivered On:</span>
                            <span className="text-green-600">{formatDate(order.deliveredAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No orders found</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-black text-black font-medium hover:bg-gray-50 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-black mb-6">Profile Settings</h2>
              <ProfileForm 
                profile={profile} 
                onUpdate={handleProfileUpdate}
              />
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-black">Saved Addresses</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Add Address
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-black mb-4">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <AddressForm
                    address={editingAddress}
                    onSave={handleAddressSave}
                    onCancel={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    isEditing={!!editingAddress}
                  />
                </div>
              )}

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div key={address._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-black">
                            {address.firstName} {address.lastName}
                          </h3>
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddressEdit(address)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => address._id && handleAddressDelete(address._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                        <p>{address.email}</p>
                        <p>{address.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No addresses saved yet</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-black text-black font-medium hover:bg-gray-50 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
        variant={dialog.variant}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
}
