import { getProductsByGender } from '@/lib/mock/products';
import { ProductCard } from '@/components/product/ProductCard';

export default function MenListingPage() {
  const items = getProductsByGender('men');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Men</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
