"use client";

import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';

export function CartIndicator() {
  const { state } = useCart();
  const count = state.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <Link className="hover:underline" href="/cart">
      Cart{count > 0 ? ` (${count})` : ''}
    </Link>
  );
}
