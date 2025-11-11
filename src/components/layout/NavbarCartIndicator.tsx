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
      className="relative p-2 hover:bg-zinc-100 rounded-lg transition-colors group"
      aria-label={`Shopping cart with ${count} items`}
    >
      {/* Shopping Bag Icon */}
      <svg 
        className="w-6 h-6 text-zinc-700 group-hover:text-zinc-900 transition-colors" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" 
        />
      </svg>
      
      {/* Count Badge */}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
