import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/inventory/stats - Get inventory analytics
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    // Get inventory analytics
    const inventoryAnalytics = await Product.aggregate([
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
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          onSaleProducts: { $sum: { $cond: ['$isOnSale', 1, 0] } },
          lowStockProducts: {
            $sum: { $cond: [{ $and: [{ $gt: ['$totalStock', 0] }, { $lt: ['$totalStock', 10] }] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] }
          },
          totalInventoryValue: {
            $sum: { $multiply: ['$totalStock', '$price'] }
          },
          averageStockLevel: { $avg: '$totalStock' }
        }
      }
    ]);

    const result = inventoryAnalytics[0] || {
      totalProducts: 0,
      activeProducts: 0,
      onSaleProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalInventoryValue: 0,
      averageStockLevel: 0
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get inventory stats error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory stats' },
      { status: 500 }
    );
  }
}
