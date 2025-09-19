'use client';

import { Product } from '@/lib/types';

export interface RecommendationEngine {
  getRecommendations: (productId: string, allProducts: Product[], limit?: number) => Product[];
  getPersonalizedRecommendations: (userId: string, allProducts: Product[], limit?: number) => Product[];
  getSimilarProducts: (product: Product, allProducts: Product[], limit?: number) => Product[];
}

class ProductRecommendationEngine implements RecommendationEngine {
  // Get recommendations based on product similarity
  getRecommendations(productId: string, allProducts: Product[], limit = 6): Product[] {
    const currentProduct = allProducts.find(p => p._id === productId);
    if (!currentProduct) return [];

    // Filter out current product and inactive products
    const availableProducts = allProducts.filter(p => 
      p._id !== productId && 
      p.isActive !== false &&
      p.images && p.images.length > 0
    );

    if (availableProducts.length === 0) return [];

    // Calculate similarity scores
    const scoredProducts = availableProducts.map(product => ({
      product,
      score: this.calculateSimilarity(currentProduct, product)
    }));

    // Sort by score (highest first) and return top products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  // Get personalized recommendations based on user's viewing history
  getPersonalizedRecommendations(userId: string, allProducts: Product[], limit = 6): Product[] {
    // This would typically use user's order history, wishlist, etc.
    // For now, we'll return featured products or random products
    const featuredProducts = allProducts.filter(p => 
      p.isFeatured && 
      p.isActive !== false &&
      p.images && p.images.length > 0
    );

    if (featuredProducts.length === 0) {
      // Fallback to random products
      const activeProducts = allProducts.filter(p => 
        p.isActive !== false &&
        p.images && p.images.length > 0
      );
      
      return this.shuffleArray(activeProducts).slice(0, limit);
    }

    return this.shuffleArray(featuredProducts).slice(0, limit);
  }

  // Get similar products based on category, designer, and price range
  getSimilarProducts(product: Product, allProducts: Product[], limit = 6): Product[] {
    const availableProducts = allProducts.filter(p => 
      p._id !== product._id && 
      p.isActive !== false &&
      p.images && p.images.length > 0
    );

    if (availableProducts.length === 0) return [];

    // Calculate similarity scores
    const scoredProducts = availableProducts.map(p => ({
      product: p,
      score: this.calculateSimilarity(product, p)
    }));

    // Sort by score and return top products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  // Calculate similarity between two products
  private calculateSimilarity(product1: Product, product2: Product): number {
    let score = 0;

    // Category similarity (40% weight)
    if (product1.category === product2.category) {
      score += 0.4;
    }

    // Designer similarity (30% weight)
    if (product1.designer === product2.designer) {
      score += 0.3;
    }

    // Gender similarity (20% weight)
    if (product1.gender === product2.gender) {
      score += 0.2;
    }

    // Price range similarity (10% weight)
    const priceDiff = Math.abs(product1.price - product2.price);
    const maxPrice = Math.max(product1.price, product2.price);
    const priceSimilarity = maxPrice > 0 ? 1 - (priceDiff / maxPrice) : 0;
    score += priceSimilarity * 0.1;

    // Subcategory similarity (bonus)
    if (product1.subcategory && product2.subcategory && 
        product1.subcategory === product2.subcategory) {
      score += 0.1;
    }

    // Tags similarity (bonus)
    if (product1.tags && product2.tags) {
      const commonTags = product1.tags.filter(tag => product2.tags?.includes(tag));
      if (commonTags.length > 0) {
        score += (commonTags.length / Math.max(product1.tags.length, product2.tags.length)) * 0.1;
      }
    }

    return Math.min(score, 1); // Cap at 1
  }

  // Shuffle array utility
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Create singleton instance
export const recommendationEngine = new ProductRecommendationEngine();

// Utility functions for easy use
export const getProductRecommendations = (
  productId: string, 
  allProducts: Product[], 
  limit = 6
): Product[] => {
  return recommendationEngine.getRecommendations(productId, allProducts, limit);
};

export const getPersonalizedRecommendations = (
  userId: string, 
  allProducts: Product[], 
  limit = 6
): Product[] => {
  return recommendationEngine.getPersonalizedRecommendations(userId, allProducts, limit);
};

export const getSimilarProducts = (
  product: Product, 
  allProducts: Product[], 
  limit = 6
): Product[] => {
  return recommendationEngine.getSimilarProducts(product, allProducts, limit);
};

