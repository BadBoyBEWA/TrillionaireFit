import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/categories - Get all categories with product counts
export async function GET() {
  try {
    await connectDB();

    // Aggregate categories with product counts
    const categories = await Product.aggregate([
      {
        $match: {
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            gender: '$gender'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id.category',
          gender: '$_id.gender',
          count: 1
        }
      },
      {
        $sort: {
          count: -1,
          name: 1
        }
      },
      {
        $limit: 20 // Limit to top 20 categories
      }
    ]);

    return NextResponse.json({
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
