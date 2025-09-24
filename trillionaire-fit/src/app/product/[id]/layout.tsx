import { Metadata } from 'next';
import { generateProductMetadata } from '@/lib/seo';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  
  try {
    await connectToDatabase();
    const product = await Product.findById(id).select('name description price images designer category');
    
    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    return generateProductMetadata({
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      designer: product.designer,
      category: product.category,
      id: product._id.toString(),
    });
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product',
      description: 'View product details at Trillionaire Fit.',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
