import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/customers/stats - Get customer analytics
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    // Get customer analytics
    const customerAnalytics = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.total' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          customersWithOrders: {
            $sum: { $cond: [{ $gt: ['$totalOrders', 0] }, 1, 0] }
          },
          averageOrderValue: { $avg: '$totalSpent' },
          topCustomers: {
            $push: {
              name: '$name',
              email: '$email',
              totalOrders: '$totalOrders',
              totalSpent: '$totalSpent'
            }
          }
        }
      },
      {
        $project: {
          totalCustomers: 1,
          customersWithOrders: 1,
          averageOrderValue: 1,
          topCustomers: {
            $slice: [
              {
                $sortArray: {
                  input: '$topCustomers',
                  sortBy: { totalSpent: -1 }
                }
              },
              10
            ]
          }
        }
      }
    ]);

    const result = customerAnalytics[0] || {
      totalCustomers: 0,
      customersWithOrders: 0,
      averageOrderValue: 0,
      topCustomers: []
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get customer stats error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch customer stats' },
      { status: 500 }
    );
  }
}
