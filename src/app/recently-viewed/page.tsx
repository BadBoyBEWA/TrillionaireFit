'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, XMarkIcon, ClockIcon } from '@/components/ui/SocialIcons';
import { recentlyViewed, RecentlyViewedProduct } from '@/lib/recently-viewed';

export default function RecentlyViewedPage() {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const recent = recentlyViewed.getAll();
        setProducts(recent);
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, []);

  const handleRemove = (productId: string) => {
    recentlyViewed.remove(productId);
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleClearAll = () => {
    recentlyViewed.clear();
    setProducts([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-luxury-elegant">Loading recently viewed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-luxury-display text-black">Recently Viewed</h1>
              <p className="text-gray-600 mt-2 font-luxury-elegant">
                {products.length} {products.length === 1 ? 'item' : 'items'} viewed recently
              </p>
            </div>
            
            {products.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-800 font-luxury-elegant"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 font-luxury-heading">
              No recently viewed items
            </h3>
            <p className="mt-1 text-sm text-gray-500 font-luxury-elegant">
              Start browsing products to see them here
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors font-luxury-elegant"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden">
                  <Link href={`/product/${product.id}`}>
                    <Image
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Time ago badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatTimeAgo(product.viewedAt)}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    title="Remove from recently viewed"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="text-sm text-gray-500 font-luxury-elegant mb-1">
                    {product.designer}
                  </div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-medium text-gray-900 font-luxury-elegant line-clamp-2 hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-semibold text-black font-luxury-elegant">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex space-x-2">
                    <Link
                      href={`/product/${product.id}`}
                      className="flex-1 bg-black text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors font-luxury-elegant"
                    >
                      View Again
                    </Link>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-luxury-elegant">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

