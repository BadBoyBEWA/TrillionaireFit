export type Product = {
  _id?: string;
  id?: string; // For backward compatibility
  name: string;
  designer: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string; // For backward compatibility
  images?: string[];
  gender: 'men' | 'women' | 'unisex';
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  materials: string[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  careInstructions?: string;
  shippingInfo?: {
    freeShipping: boolean;
    estimatedDays: number;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  totalStock?: number;
  discountPercentage?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
