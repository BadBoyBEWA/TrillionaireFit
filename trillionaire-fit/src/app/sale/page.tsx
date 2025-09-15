'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';

interface Product {
  _id: string;
  name: string;
  designer: string;
  price: number;
  originalPrice?: number;
  images: string[];
  gender: 'men' | 'women' | 'unisex';
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sku: string;
  totalStock: number;
  discountPercentage?: number;
  createdAt: string;
}

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true);
        // Fetch products that are on sale
        const response = await fetch('/api/products?isOnSale=true&isActive=true&limit=20');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Sale</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading sale products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Sale</h1>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sale</h1>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No sale products available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}