'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { getProductRecommendations, getSimilarProducts } from '@/lib/recommendations';
import { ShoppingBagIcon } from '@/components/ui/SocialIcons';
import WishlistButton from '@/components/wishlist/WishlistButton';

interface ProductRecommendationsProps {
  currentProduct: Product;
  allProducts: Product[];
  title?: string;
  limit?: number;
  type?: 'similar' | 'recommended';
}

export default function ProductRecommendations({ 
  currentProduct, 
  allProducts, 
  title,
  limit = 6,
  type = 'similar'
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = () => {
      try {
        setLoading(true);
        
        let recommended: Product[];
        if (type === 'similar') {
          recommended = getSimilarProducts(currentProduct, allProducts, limit);
        } else {
          recommended = getProductRecommendations(currentProduct._id!, allProducts, limit);
        }
        
        setRecommendations(recommended);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [currentProduct, allProducts, limit, type]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-square"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-lg font-medium text-gray-900 font-luxury-heading mb-6">
        {title || (type === 'similar' ? 'Similar Products' : 'You Might Also Like')}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <div key={product._id} className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="aspect-square relative overflow-hidden">
              <Link href={`/product/${product._id}`}>
                <Image
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              {/* Wishlist Button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <WishlistButton productId={product._id!} />
              </div>

              {/* Sale Badge */}
              {product.isOnSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                  Sale
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <div className="text-xs text-gray-500 font-luxury-elegant mb-1 truncate">
                {product.designer}
              </div>
              <Link href={`/product/${product._id}`}>
                <h4 className="text-sm font-medium text-gray-900 font-luxury-elegant line-clamp-2 hover:text-gray-600 transition-colors">
                  {product.name}
                </h4>
              </Link>
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold text-black font-luxury-elegant">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-500 line-through font-luxury-elegant">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex space-x-1">
                <Link
                  href={`/product/${product._id}`}
                  className="flex-1 bg-black text-white text-center py-1.5 px-2 rounded text-xs font-medium hover:bg-gray-800 transition-colors font-luxury-elegant"
                >
                  View
                </Link>
                <button className="flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <ShoppingBagIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

