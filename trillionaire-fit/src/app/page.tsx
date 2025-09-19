'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/lib/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigationWithLoading();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products?isFeatured=true&isActive=true&limit=8');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-14">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-luxury-display tracking-tight">
            Luxury fashion, curated for you
          </h1>
          <p className="text-zinc-600 max-w-prose font-luxury-body">
            Discover the world's most coveted designers and emerging labels. Shop
            across boutiques worldwide with seamless checkout.
          </p>

          <div className="flex flex-col gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <p className="text-green-600 font-luxury-elegant">
                  👋 Welcome, {user.name}!
                </p>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-luxury-elegant"
                >
                  Logout
                </button>
              </div>
            ) : (
              <p className="text-red-600 font-luxury-elegant">
                You are not logged in. <a href="/login" className="underline">Login here</a>
              </p>
            )}

            <div className="flex gap-3">
              {/* <button onClick={() => navigate('/women')} className="btn-primary">Shop Women</button> */}
              <button onClick={() => navigate('/men')} className="btn-outline">Shop Men</button>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 border-2 border-gray-600">
          <img 
            src="/image/TF_Pack.jpg" 
            alt="Luxury Fashion" 
            className="w-full h-full object-contain"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-luxury-heading">Featured Products</h2>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="font-luxury-body">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={{
                  ...product,
                  id: product._id || product.id || '',
                  imageUrl: product.images?.[0] || product.imageUrl || '/api/placeholder/400/400'
                }} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
