export type Product = {
  id: string;
  name: string;
  designer: string;
  description: string;
  price: number;
  imageUrl: string;
  gender: 'men' | 'women' | 'unisex';
  tags?: string[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};
