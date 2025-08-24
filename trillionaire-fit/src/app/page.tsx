import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/mock/products';
import { ProductCard } from '@/components/product/ProductCard';

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Luxury fashion, curated for you
          </h1>
          <p className="text-zinc-600 max-w-prose">
            Discover the world’s most coveted designers and emerging labels. Shop
            across boutiques worldwide with seamless checkout.
          </p>
          <div className="flex gap-3">
            <Link href="/women" className="btn-primary">Shop Women</Link>
            <Link href="/men" className="btn-outline">Shop Men</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image
            alt="Hero"
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">New in</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
