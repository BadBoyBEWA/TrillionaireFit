'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Carousel } from '@/components/ui/Carousel';
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
            Luxury Fashion Marketplace - Designer Clothes & Premium Clothing
          </h1>
          <p className="text-zinc-600 max-w-prose font-luxury-body">
            Discover the world's most coveted designers and emerging labels at Trillionaire Fit. 
            Shop luxury fashion across boutiques worldwide with seamless checkout, premium quality, 
            and worldwide shipping. Curated collections featuring exclusive designer pieces.
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
              <p className="text-black-600 font-luxury-elegant">
                <a href="/login" className="underline">Login here</a>
              </p>
            )}

            <div className="flex gap-3">
              {/* <button onClick={() => navigate('/women')} className="btn-primary">Shop Women</button> */}
              <button onClick={() => navigate('/men')} className="btn-outline">Shop Men</button>
            </div>
          </div>
        </div>

        <Carousel 
          items={[
            {
              src: "/image/TF_Pack.jpg",
              alt: "Trillionaire Fit luxury fashion collection - premium designer clothing and accessories"
            },
            {
              src: "/image/carousel1.jpg",
              alt: "Trillionaire Fit brand showcase - luxury fashion marketplace"
            },
            {
              src: "/image/carousel2.jpg",
              alt: "Trillionaire Fit exclusive designs - high-end fashion"
            },
            {
              src: "/image/carousel3.jpg",
              alt: "Trillionaire Fit exclusive wears"
            }
          ]}
          autoPlay={true}
          interval={4000}
          showDots={true}
          showArrows={true}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-luxury-heading">Featured Luxury Designer Products</h2>
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

      {/* SEO Content Sections */}
      <section className="space-y-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Premium Quality</h3>
            <p className="text-zinc-600 text-sm">
              Every piece is handpicked for exceptional craftsmanship and luxury materials. 
              We partner with renowned designers and emerging labels worldwide.
            </p>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Worldwide Shipping</h3>
            <p className="text-zinc-600 text-sm">
              Fast and secure delivery to your doorstep. With premium packaging and insurance.
            </p>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Exclusive Access</h3>
            <p className="text-zinc-600 text-sm">
              Discover limited edition pieces and exclusive collections from top luxury brands. 
              Be the first to access new arrivals and seasonal collections.
            </p>
          </div>
        </div>
      </section>

      {/* Additional SEO Content */}
      <section className="space-y-6">
        <h2 className="text-2xl font-luxury-heading">Why Choose Trillionaire Fit?</h2>
        <div className="prose prose-zinc max-w-none">
          <p className="text-zinc-600 leading-relaxed">
            At Trillionaire Fit, we believe luxury fashion should be accessible without compromising on quality or exclusivity. 
            Our curated marketplace brings together the world's most prestigious designers and emerging talents, 
            offering you a unique shopping experience that combines convenience with sophistication.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            Whether you're looking for timeless classics or the latest trends, our expert curation ensures every piece 
            meets our high standards for quality, design, and craftsmanship. From luxury menswear to unisex fashion, 
            we offer a comprehensive selection of premium fashion items.
          </p>
        </div>
      </section>
    </div>
  );
}
