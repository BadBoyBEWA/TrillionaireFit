"use client";

import { useCart } from '@/components/cart/CartProvider';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

export function CartIndicator() {
  const { state } = useCart();
  const { navigate } = useNavigationWithLoading();
  const count = state.items.reduce((n, i) => n + i.quantity, 0);
  
  return (
    <button 
      onClick={() => navigate('/cart')} 
      className="hover:underline"
    >
      Cart{count > 0 ? ` (${count})` : ''}
    </button>
  );
}
