'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, XMarkIcon } from '@/components/ui/SocialIcons';
import { recentlyViewed, RecentlyViewedProduct } from '@/lib/recently-viewed';

export default function RecentlyViewed() {
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

    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recently_viewed_products') {
        loadRecentlyViewed();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRemove = (productId: string) => {
    recentlyViewed.remove(productId);
    setProducts(prev => prev.filter(product => product.id !== productId));
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
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-square"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 font-luxury-heading">
          Recently Viewed
        </h3>
        <button
          onClick={() => {
            recentlyViewed.clear();
            setProducts([]);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 font-luxury-elegant"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            <Link href={`/product/${product.id}`} className="block">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Time ago badge */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatTimeAgo(product.viewedAt)}
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(product.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white bg-opacity-75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  title="Remove from recently viewed"
                >
                  <XMarkIcon className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </Link>

            <div className="mt-2">
              <p className="text-xs text-gray-500 font-luxury-elegant truncate">
                {product.designer}
              </p>
              <p className="text-sm font-medium text-gray-900 font-luxury-elegant truncate">
                {product.name}
              </p>
              <p className="text-sm font-semibold text-black font-luxury-elegant">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {products.length >= 6 && (
        <div className="mt-4 text-center">
          <Link
            href="/recently-viewed"
            className="text-sm text-gray-600 hover:text-gray-800 font-luxury-elegant"
          >
            View all recently viewed →
          </Link>
        </div>
      )}
    </div>
  );
}

