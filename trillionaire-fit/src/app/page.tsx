'use client';

import Image from 'next/image';
import { Carousel } from '@/components/ui/Carousel';
import PaginatedProductGrid from '@/components/product/PaginatedProductGrid';
import { MarqueeText, MarqueeAnnouncement } from '@/components/ui/Marquee';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import { useAuth } from '@/context/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const { navigate } = useNavigationWithLoading();
  const { user, logout } = useAuth();

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
            ) : null}

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

      {/* Featured Products Section with Pagination */}
      <PaginatedProductGrid
        title="Featured Luxury Designer Products"
        fetchUrl="/api/products?isFeatured=true&isActive=true"
        productsPerPage={8}
        showNavigation={true}
        showPagination={true}
      />

      {/* Stylish Men's Shop Section */}
      <section className="py-8">
        <button 
          onClick={() => navigate('/men')}
          className="w-full group relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 hover:from-slate-100 hover:to-gray-200 transition-all duration-500 hover:shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px]">
            {/* Left Side - Text */}
            <div className="flex flex-col justify-center p-8 md:p-12 text-left">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-luxury-display font-bold text-gray-900 leading-tight">
                  <span className="block">Shop</span>
                  <span className="block text-gray-700">Men</span>
                </h2>
                <p className="text-lg text-gray-600 font-luxury-elegant max-w-sm">
                  Discover our exclusive collection of luxury menswear from the world's most coveted designers
                </p>
                <div className="pt-4">
                  <span className="inline-flex items-center text-sm font-medium text-gray-800 group-hover:text-black transition-colors">
                    Explore Collection
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Image Placeholder */}
            <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
              <div className="relative z-10 text-center p-8">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white/80 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-700 font-luxury-elegant">
                  Premium Menswear
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/15 rounded-full blur-lg group-hover:bg-white/25 transition-colors"></div>
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </section>

      {/* Marquee Examples */}
      <section className="py-8 space-y-6">
        {/* <h3 className="text-xl font-semibold text-center">Marquee Examples</h3> */}
        
        {/* Text Marquee */}
        {/* <div className="bg-black text-white py-4 rounded-lg">
          <MarqueeText text="✨ New Arrivals Every Week ✨ Free Shipping on Orders Over ₦50,000 ✨ Exclusive Designer Collections ✨" />
        </div> */}
        
        {/* Announcement Marquee */}
        {/* <div className="bg-gray-100 py-3 rounded-lg">
          <MarqueeAnnouncement 
            announcements={[
              "Free Shipping Nationwide",
              "New Collection Available",
              "Limited Time Offers",
              "Premium Quality Guaranteed",
              "Exclusive Designer Pieces"
            ]} 
          />
        </div> */}
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
