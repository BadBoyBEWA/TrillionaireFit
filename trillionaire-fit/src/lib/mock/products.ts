import { Product } from '@/lib/types';

export const products: Product[] = Array.from({ length: 24 }).map((_, index) => {
  const id = String(index + 1);
  const isWomen = index % 2 === 0;
  return {
    id,
    name: isWomen ? `Womenswear ${id}` : `Menswear ${id}`,
    designer: ['Gucci', 'Prada', 'Balenciaga', 'Off-White', 'Saint Laurent'][index % 5],
    description:
      'Crafted from premium materials. A timeless silhouette blending modern luxury and comfort.',
    price: 150 + index * 20,
    imageUrl: '/api/placeholder/400/400',
    gender: isWomen ? 'women' : 'men',
    tags: ['new-in', index % 3 === 0 ? 'sale' : ''],
  } as Product;
});

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByGender(gender: 'men' | 'women'): Product[] {
  return products.filter((p) => p.gender === gender);
}

export function getSimilarProducts(currentProductId: string, limit: number = 4): Product[] {
  const currentProduct = getProductById(currentProductId);
  if (!currentProduct) return [];
  
  return products
    .filter((p) => p.id !== currentProductId && p.gender === currentProduct.gender)
    .slice(0, limit);
}