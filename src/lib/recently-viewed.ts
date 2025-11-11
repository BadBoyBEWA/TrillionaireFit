'use client';

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const MAX_RECENT_ITEMS = 10;

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  designer: string;
  price: number;
  image: string;
  viewedAt: number;
}

export const recentlyViewed = {
  // Add product to recently viewed
  add: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    if (typeof window === 'undefined') return;

    try {
      const existing = recentlyViewed.getAll();
      
      // Remove if already exists
      const filtered = existing.filter(item => item.id !== product.id);
      
      // Add to beginning
      const updated = [
        { ...product, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT_ITEMS);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  },

  // Get all recently viewed products
  getAll: (): RecentlyViewedProduct[] => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // Sort by viewedAt (most recent first) and limit
      return parsed
        .sort((a: RecentlyViewedProduct, b: RecentlyViewedProduct) => b.viewedAt - a.viewedAt)
        .slice(0, MAX_RECENT_ITEMS);
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  },

  // Remove product from recently viewed
  remove: (productId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const existing = recentlyViewed.getAll();
      const filtered = existing.filter(item => item.id !== productId);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  },

  // Clear all recently viewed
  clear: () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  },

  // Get count of recently viewed items
  getCount: (): number => {
    return recentlyViewed.getAll().length;
  }
};

