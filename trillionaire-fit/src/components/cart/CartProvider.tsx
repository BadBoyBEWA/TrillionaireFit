"use client";

import { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import { CartItem, Product } from '@/lib/types';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD_FROM_STORAGE'; items: CartItem[] };

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
    case 'LOAD_FROM_STORAGE':
      return { items: action.items };
    default:
      return state;
  }
}

// Helper functions for localStorage
const CART_STORAGE_KEY = 'trillionaire-fit-cart';

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

function loadCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];
    
    const items = JSON.parse(saved);
    
    // Validate that items have required structure
    return items.filter((item: any) => 
      item && 
      item.product && 
      item.quantity && 
      typeof item.quantity === 'number' &&
      item.product.id &&
      item.product.name &&
      typeof item.product.price === 'number'
    );
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedItems = loadCartFromStorage();
    if (savedItems.length > 0) {
      // Optionally refresh product data for cart items
      refreshCartItems(savedItems).then(refreshedItems => {
        dispatch({ type: 'LOAD_FROM_STORAGE', items: refreshedItems });
      });
    }
  }, []);

  // Function to refresh product data for cart items
  const refreshCartItems = async (items: CartItem[]): Promise<CartItem[]> => {
    try {
      const refreshedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(`/api/products/${item.product._id || item.product.id}`);
            if (response.ok) {
              const data = await response.json();
              const product = data.product || data;
              return {
                ...item,
                product: {
                  ...product,
                  id: product._id || product.id // Ensure id field exists
                }
              };
            }
          } catch (error) {
            console.error('Failed to refresh product data:', error);
          }
          return item; // Return original item if refresh fails
        })
      );
      return refreshedItems;
    } catch (error) {
      console.error('Failed to refresh cart items:', error);
      return items;
    }
  };

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

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
