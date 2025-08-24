"use client";

import { useCart } from '@/components/cart/CartProvider';
import { getProductById } from '@/lib/mock/products';

export function AddToCartButton({ id }: { id: string }) {
  const { addToCart } = useCart();
  const product = getProductById(id);
  if (!product) return null;
  return (
    <button className="btn-primary" onClick={() => addToCart(product)}>
      Add to cart
    </button>
  );
}
