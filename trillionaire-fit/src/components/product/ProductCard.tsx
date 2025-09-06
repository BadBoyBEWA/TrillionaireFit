'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const { navigate } = useNavigationWithLoading();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <button 
      onClick={handleClick}
      className="card overflow-hidden w-full text-left hover:scale-105 transition-transform"
    >
      <div className="relative aspect-square w-full">
        <Image alt={product.name} src={product.imageUrl} fill className="object-cover" />
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-500">{product.designer}</p>
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-zinc-600">$ {product.price.toFixed(2)}</p>
      </div>
    </button>
  );
}
