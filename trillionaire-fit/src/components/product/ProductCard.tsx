import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  return (
    <Link href={`/product/${product.id}`} className="card overflow-hidden">
      <div className="relative aspect-square w-full">
        <Image alt={product.name} src={product.imageUrl} fill className="object-cover" />
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-500">{product.designer}</p>
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-zinc-600">$ {product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
