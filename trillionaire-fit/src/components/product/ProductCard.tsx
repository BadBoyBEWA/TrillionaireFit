'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const { navigate } = useNavigationWithLoading();

  const handleClick = () => {
    navigate(`/product/${product._id || product.id}`);
  };

  const isOutOfStock = (product.totalStock || 0) === 0;
  const hasDiscount = product.originalPrice && product.originalPrice > (product.price || 0);

  return (
    <button 
      onClick={handleClick}
      className="card overflow-hidden w-full text-left hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isOutOfStock}
    >
      <div className="relative aspect-square w-full">
        <Image 
          alt={product.name} 
          src={product.images?.[0] || product.imageUrl || '/placeholder-image.jpg'} 
          fill 
          className="object-cover" 
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-500">{product.designer}</p>
        <p className="font-medium">{product.name}</p>
        
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-semibold">${(product.price || 0).toFixed(2)}</p>
          {hasDiscount && (
            <p className="text-xs text-gray-500 line-through">${product.originalPrice?.toFixed(2)}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {isOutOfStock ? 'Out of stock' : `${product.totalStock || 0} in stock`}
          </span>
          {product.discountPercentage && (
            <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>
      </div>
    </button>
  );
}