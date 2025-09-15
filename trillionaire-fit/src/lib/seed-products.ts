import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: 'Classic White Shirt',
    description: 'A timeless white shirt crafted from premium cotton. Perfect for both casual and formal occasions. Features a classic collar and button-down design.',
    designer: 'Gucci',
    price: 450,
    originalPrice: 550,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    gender: 'men',
    category: 'Tops',
    subcategory: 'Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Navy'],
    materials: ['Cotton'],
    tags: ['classic', 'formal', 'cotton'],
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    sku: 'GUCCI-WS-001',
    totalStock: 25,
    weight: 0.3,
    dimensions: {
      length: 75,
      width: 55,
      height: 2
    },
    careInstructions: 'Machine wash cold, hang dry',
    shippingInfo: {
      freeShipping: true,
      estimatedDays: 3
    },
    seo: {
      title: 'Classic White Shirt by Gucci',
      description: 'Premium white cotton shirt from Gucci. Perfect for formal and casual wear.',
      keywords: ['gucci', 'white shirt', 'cotton', 'formal', 'classic']
    }
  },
  {
    name: 'Elegant Black Dress',
    description: 'A sophisticated black dress designed for special occasions. Features a flattering silhouette and premium fabric construction.',
    designer: 'Prada',
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    gender: 'women',
    category: 'Dresses',
    subcategory: 'Evening Dresses',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    materials: ['Silk', 'Polyester'],
    tags: ['elegant', 'evening', 'silk'],
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    sku: 'PRADA-BD-001',
    totalStock: 15,
    weight: 0.4,
    dimensions: {
      length: 120,
      width: 45,
      height: 3
    },
    careInstructions: 'Dry clean only',
    shippingInfo: {
      freeShipping: true,
      estimatedDays: 5
    },
    seo: {
      title: 'Elegant Black Dress by Prada',
      description: 'Sophisticated black evening dress from Prada. Perfect for special occasions.',
      keywords: ['prada', 'black dress', 'evening', 'silk', 'elegant']
    }
  },
  {
    name: 'Luxury Leather Jacket',
    description: 'A premium leather jacket made from genuine Italian leather. Features a modern design with attention to detail and craftsmanship.',
    designer: 'Balenciaga',
    price: 1800,
    originalPrice: 2200,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    gender: 'unisex',
    category: 'Outerwear',
    subcategory: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Brown'],
    materials: ['Leather'],
    tags: ['leather', 'luxury', 'jacket'],
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    sku: 'BALENCIAGA-LJ-001',
    totalStock: 8,
    weight: 1.2,
    dimensions: {
      length: 70,
      width: 60,
      height: 5
    },
    careInstructions: 'Professional leather cleaning recommended',
    shippingInfo: {
      freeShipping: true,
      estimatedDays: 7
    },
    seo: {
      title: 'Luxury Leather Jacket by Balenciaga',
      description: 'Premium Italian leather jacket from Balenciaga. Unisex design with modern styling.',
      keywords: ['balenciaga', 'leather jacket', 'luxury', 'italian leather', 'unisex']
    }
  },
  {
    name: 'Designer Sneakers',
    description: 'High-end sneakers combining comfort and style. Features premium materials and innovative design elements.',
    designer: 'Off-White',
    price: 650,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    gender: 'unisex',
    category: 'Shoes',
    subcategory: 'Sneakers',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['White', 'Black'],
    materials: ['Leather', 'Canvas'],
    tags: ['sneakers', 'designer', 'comfort'],
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    sku: 'OFFWHITE-SN-001',
    totalStock: 12,
    weight: 0.8,
    dimensions: {
      length: 30,
      width: 20,
      height: 12
    },
    careInstructions: 'Spot clean with damp cloth',
    shippingInfo: {
      freeShipping: false,
      estimatedDays: 3
    },
    seo: {
      title: 'Designer Sneakers by Off-White',
      description: 'Premium sneakers from Off-White. Comfortable and stylish design.',
      keywords: ['off-white', 'sneakers', 'designer', 'comfort', 'unisex']
    }
  },
  {
    name: 'Silk Scarf',
    description: 'Luxurious silk scarf with intricate patterns. Perfect accessory for any outfit, adding elegance and sophistication.',
    designer: 'Saint Laurent',
    price: 280,
    images: [
      'https://images.unsplash.com/photo-1601925260369-5b6b2a8b8b8b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    gender: 'women',
    category: 'Accessories',
    subcategory: 'Scarves',
    sizes: ['One Size'],
    colors: ['Red', 'Blue', 'Green'],
    materials: ['Silk'],
    tags: ['silk', 'scarf', 'accessory', 'elegant'],
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    sku: 'SAINTLAURENT-SC-001',
    totalStock: 30,
    weight: 0.1,
    dimensions: {
      length: 90,
      width: 90,
      height: 1
    },
    careInstructions: 'Dry clean only',
    shippingInfo: {
      freeShipping: true,
      estimatedDays: 2
    },
    seo: {
      title: 'Silk Scarf by Saint Laurent',
      description: 'Luxurious silk scarf from Saint Laurent. Perfect accessory for any outfit.',
      keywords: ['saint laurent', 'silk scarf', 'accessory', 'elegant', 'luxury']
    }
  }
];

export async function seedProducts() {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Convert totalStock to stock structure for each product
    const productsWithStock = sampleProducts.map(product => {
      const { totalStock, ...productData } = product;
      
      // Create a simple stock structure with default size/color
      const stockStructure = {};
      if (totalStock && totalStock > 0) {
        const defaultSize = productData.sizes[0] || 'M';
        const defaultColor = productData.colors[0] || 'Default';
        stockStructure[defaultSize] = { [defaultColor]: totalStock };
      }
      
      return {
        ...productData,
        stock: stockStructure
      };
    });
    
    // Insert sample products
    const createdProducts = await Product.insertMany(productsWithStock);
    console.log(`Created ${createdProducts.length} sample products`);
    
    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('Product seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Product seeding failed:', error);
      process.exit(1);
    });
}
