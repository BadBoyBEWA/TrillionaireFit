import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/inventory - Get inventory with filters and analytics
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const stock = searchParams.get('stock') || 'all';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build filter
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      switch (status) {
        case 'active':
          filter.isActive = true;
          break;
        case 'inactive':
          filter.isActive = false;
          break;
        case 'onSale':
          filter.isOnSale = true;
          break;
      }
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get products with calculated total stock
    const products = await Product.aggregate([
      { $match: filter },
      {
        $addFields: {
          totalStock: {
            $reduce: {
              input: { $objectToArray: '$stock' },
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $reduce: {
                      input: { $objectToArray: '$$this.v' },
                      initialValue: 0,
                      in: { $add: ['$$value', '$$this.v'] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // Apply stock filter after calculating totalStock
      ...(stock !== 'all' ? [{
        $match: {
          totalStock: stock === 'out' ? 0 : 
                     stock === 'low' ? { $gt: 0, $lt: 10 } :
                     { $gte: 10 }
        }
      }] : []),
      { $sort: sort },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          designer: 1,
          price: 1,
          images: 1,
          isActive: 1,
          isOnSale: 1,
          category: 1,
          createdAt: 1,
          totalStock: 1,
          lowStockThreshold: { $literal: 10 }
        }
      }
    ]);

    // Get total count with stock filter applied
    const totalPipeline = [
      { $match: filter },
      {
        $addFields: {
          totalStock: {
            $reduce: {
              input: { $objectToArray: '$stock' },
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $reduce: {
                      input: { $objectToArray: '$$this.v' },
                      initialValue: 0,
                      in: { $add: ['$$value', '$$this.v'] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      ...(stock !== 'all' ? [{
        $match: {
          totalStock: stock === 'out' ? 0 : 
                     stock === 'low' ? { $gt: 0, $lt: 10 } :
                     { $gte: 10 }
        }
      }] : []),
      { $count: 'total' }
    ];

    const totalResult = await Product.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
