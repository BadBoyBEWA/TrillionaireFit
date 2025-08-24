import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/mock/products';
import { AddToCartButton } from './AddToCartButton';

type Props = { params: { id: string } };

export default function ProductDetail({ params }: Props) {
  const { id } = params;
  const product = getProductById(id);
  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
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
          <Link href="/cart" className="btn-outline">View cart</Link>
        </div>
      </div>
    </div>
  );
}
