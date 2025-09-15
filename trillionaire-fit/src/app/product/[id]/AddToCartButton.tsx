"use client";

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';

interface AddToCartButtonProps {
  id: string;
  disabled?: boolean;
}

export function AddToCartButton({ id, disabled = false }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async () => {
    if (disabled) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch product details from API
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      const product = data.product || data;
      
      // Check if product is in stock
      if (product.totalStock <= 0) {
        throw new Error('Product is out of stock');
      }
      
      // Add to cart
      addToCart(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button 
        className="btn-primary" 
        onClick={handleAddToCart}
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add to cart'}
      </button>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}