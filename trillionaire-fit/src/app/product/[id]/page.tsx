'use client';

import Image from 'next/image';
import { getProductById, getSimilarProducts } from '@/lib/mock/products';
import { AddToCartButton } from './AddToCartButton';
import { ProductCard } from '@/components/product/ProductCard';
import { BackButton } from '@/app/product/[id]/BackButton';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

type Props = { params: { id: string } };

export default function ProductDetail({ params }: Props) {
  const { id } = params;
  const product = getProductById(id);
  const similarProducts = getSimilarProducts(id);
  const { navigate } = useNavigationWithLoading();
  
  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="space-y-12">
      {/* Back Navigation */}
      <BackButton />

      {/* Product Details */}
      <div className="grid gap-10 md:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="relative aspect-square w-full">
            <Image alt={product.name} src={product.imageUrl} fill className="object-cover" priority />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-zinc-500">{product.designer}</p>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
          </div>
          <p className="text-xl">$ {product.price.toFixed(2)}</p>
          <p className="text-zinc-600">{product.description}</p>
          <div className="flex gap-3">
            <AddToCartButton id={product.id} />
            <button onClick={() => navigate('/cart')} className="btn-outline">View cart</button>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
