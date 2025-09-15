import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { seedProducts } from '@/lib/seed-products';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    requireAdmin(request);
    
    // Run the seeder
    const products = await seedProducts();
    
    return NextResponse.json({
      message: 'Products seeded successfully',
      count: products.length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        designer: p.designer,
        sku: p.sku
      }))
    });

  } catch (error) {
    console.error('Seed products error:', error);
    
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to seed products' },
      { status: 500 }
    );
  }
}
