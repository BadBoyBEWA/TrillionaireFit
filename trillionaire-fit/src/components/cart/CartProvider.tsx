"use client";

import { createContext, useContext, useMemo, useReducer } from 'react';
import { CartItem, Product } from '@/lib/types';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' };

const CartContext = createContext<{
  state: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}>({} as any);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const quantity = action.quantity ?? 1;
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity }] };
    }
    case 'REMOVE': {
      return { items: state.items.filter((i) => i.product.id !== action.productId) };
    }
    case 'UPDATE_QTY': {
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: Math.max(1, action.quantity) } : i
        ),
      };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [state.items]
  );

  const addToCart = (product: Product, quantity = 1) => dispatch({ type: 'ADD', product, quantity });
  const removeFromCart = (productId: string) => dispatch({ type: 'REMOVE', productId });
  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QTY', productId, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider
      value={{ state, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
