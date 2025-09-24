'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/format-currency';

interface AnalyticsData {
  overview: {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
    totalUsers: number;
    pendingOrders: number;
    completedOrders: number;
    revenueGrowth: number;
  };
  salesOverTime: Array<{
    _id: { year: number; month: number; day: number };
    total: number;
    count: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    designer: string;
    totalSold: number;
    totalRevenue: number;
    image: string;
  }>;
  orderStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  customerAnalytics: {
    totalCustomers: number;
    customersWithOrders: number;
    averageOrderValue: number;
    topCustomers: Array<{
      name: string;
      email: string;
      totalOrders: number;
      totalSpent: number;
    }>;
  };
  inventoryAnalytics: {
    totalProducts: number;
    activeProducts: number;
    onSaleProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
  };
  recentActivity: Array<{
    _id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      product: {
        name: string;
        designer: string;
      };
      quantity: number;
      price: number;
    }>;
  }>;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to load analytics data');
      }

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
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
          <p className="text-gray-600 font-luxury-elegant">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-luxury-display text-black">
            Admin Dashboard
          </h1>
              <p className="text-gray-600 mt-2 font-luxury-elegant">Comprehensive analytics and management</p>
        </div>

            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 font-luxury-elegant">Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          {/* <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 font-luxury-elegant">Total Revenue</p>
                <p className="text-2xl font-bold text-black font-luxury-display">
                  {analytics ? formatCurrency(analytics.overview.totalRevenue) : '₦0.00'}
                </p>
              </div>
            </div>
            </div> */}

          {/* Total Orders */}
          {/* <Link 
            href="/admin/orders"
            className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 font-luxury-elegant">Total Orders</p>
                <p className="text-2xl font-bold text-black font-luxury-display">
                  {analytics?.overview.totalOrders || 0}
                </p>
              </div>
            </div>
          </Link> */}

          {/* Total Products */}
          {/* <Link 
            href="/admin/products"
            className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-luxury-elegant">Total Products</p>
                <p className="text-2xl font-bold text-black font-luxury-display mt-2">
                  {analytics?.overview.totalProducts || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.inventoryAnalytics.activeProducts || 0} active
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Link> */}

          {/* Total Customers */}
          {/* <Link 
            href="/admin/users"
            className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-luxury-elegant">Total Customers</p>
                <p className="text-2xl font-bold text-black font-luxury-display mt-2">
                  {analytics?.overview.totalUsers || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.customerAnalytics.customersWithOrders || 0} with orders
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </Link>
        </div> */}

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-black font-luxury-heading">Top Selling Products</h2>
            </div>
            <div className="p-6">
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-black font-luxury-elegant">{product.productName}</p>
                          <p className="text-sm text-gray-600">{product.designer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-black">{product.totalSold} sold</p>
                        <p className="text-sm text-gray-600">{formatCurrency(product.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8 font-luxury-elegant">No sales data available</p>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-black font-luxury-heading">Order Status Distribution</h2>
            </div>
            <div className="p-6">
              {analytics?.orderStatusDistribution && analytics.orderStatusDistribution.length > 0 ? (
                <div className="space-y-3">
                  {analytics.orderStatusDistribution.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status._id === 'delivered' ? 'bg-green-500' :
                          status._id === 'shipped' ? 'bg-indigo-500' :
                          status._id === 'processing' ? 'bg-purple-500' :
                          status._id === 'confirmed' ? 'bg-blue-500' :
                          status._id === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700 font-luxury-elegant capitalize">
                          {status._id}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-black">{status.count}</span>
                    </div>
                  ))}
              </div>
              ) : (
                <p className="text-gray-600 text-center py-8 font-luxury-elegant">No order data available</p>
              )}
              </div>
            </div>
          </div>

        {/* Inventory Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-black font-luxury-heading">Inventory Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-black font-luxury-display">
                  {analytics?.inventoryAnalytics.totalProducts || 0}
                </p>
                <p className="text-sm text-gray-600 font-luxury-elegant">Total Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 font-luxury-display">
                  {analytics?.inventoryAnalytics.activeProducts || 0}
                </p>
                <p className="text-sm text-gray-600 font-luxury-elegant">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 font-luxury-display">
                  {analytics?.inventoryAnalytics.lowStockProducts || 0}
                </p>
                <p className="text-sm text-gray-600 font-luxury-elegant">Low Stock</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 font-luxury-display">
                  {analytics?.inventoryAnalytics.outOfStockProducts || 0}
                </p>
                <p className="text-sm text-gray-600 font-luxury-elegant">Out of Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-black font-luxury-heading">Recent Activity</h2>
              <Link 
                href="/admin/orders"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium font-luxury-elegant"
              >
                View all →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentActivity.slice(0, 10).map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    <div>
                        <p className="font-medium text-black font-luxury-elegant">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.user.name}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-black font-luxury-elegant">{formatCurrency(order.total)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 font-luxury-elegant">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
