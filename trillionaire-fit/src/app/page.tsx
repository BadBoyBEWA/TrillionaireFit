'use client';

import Image from 'next/image';
import { getProductsByGender } from '@/lib/mock/products';
import { ProductCard } from '@/components/product/ProductCard';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

export default function HomePage() {
  const menProducts = getProductsByGender('men');
  const { navigate } = useNavigationWithLoading();
  
  return (
    <div className="space-y-14">
        <section className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Luxury fashion, curated for you
            </h1>
            <p className="text-zinc-600 max-w-prose">
              Discover the world's most coveted designers and emerging labels. Shop
              across boutiques worldwide with seamless checkout.
            </p>
            <div className="flex gap-3">
              {/* <button onClick={() => navigate('/women')} className="btn-primary">Shop Women</button> */}
              <button onClick={() => navigate('/men')} className="btn-outline">Shop Men</button>
            </div>
          </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-zinc-200 rounded-full mx-auto flex items-center justify-center">
              <span className="text-4xl">👔</span>
            </div>
            <p className="text-zinc-600 font-medium">Luxury Fashion</p>
          </div>
        </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">New in</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {menProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
  );
}
