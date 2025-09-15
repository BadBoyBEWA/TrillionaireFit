"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

export default function CartPage() {
  const { state, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { navigate } = useNavigationWithLoading();
  const [isLoading, setIsLoading] = useState(true);
  const isEmpty = state.items.length === 0;

  // Show loading state briefly to allow cart to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      {isEmpty ? (
        <p className="text-zinc-600">Your cart is empty.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {state.items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 border-b pb-4">
                <div className="size-20 rounded-lg bg-zinc-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">IMG</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-zinc-500">{product.designer}</p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <label className="text-zinc-600">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-zinc-300 px-2 py-1"
                    />
                    <button className="text-red-600" onClick={() => removeFromCart(product.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="font-medium">₦{(product.price * quantity).toFixed(2)}</div>
              </div>
            ))}
            <button className="text-sm text-zinc-600 underline" onClick={clearCart}>
              Clear cart
            </button>
          </div>
          <aside className="space-y-3">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium">₦{subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')} 
                className="btn-primary mt-4 w-full text-center"
              >
                Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
