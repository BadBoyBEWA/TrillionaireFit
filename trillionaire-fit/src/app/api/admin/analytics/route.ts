import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Basic stats
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' })
    ]);

    // Revenue analytics
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Sales over time (last 30 days)
    const salesOverTime = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          designer: '$product.designer',
          totalSold: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ['$product.images', 0] }
        }
      }
    ]);

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Customer analytics
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

    // Inventory analytics
    const inventoryAnalytics = await Product.aggregate([
      {
        $project: {
          name: 1,
          designer: 1,
          price: 1,
          isActive: 1,
          isOnSale: 1,
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
            $sum: { $cond: [{ $lt: ['$totalStock', 10] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] }
          },
          totalInventoryValue: {
            $sum: { $multiply: ['$totalStock', '$price'] }
          }
        }
      }
    ]);

    // Recent activity
    const recentActivity = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name designer')
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderNumber status total createdAt user items')
      .lean();

    // Monthly revenue comparison
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: {
              $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
              $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: {
              $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
              $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const currentRevenue = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
    const lastRevenue = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: revenue,
        totalProducts,
        totalUsers,
        pendingOrders,
        completedOrders,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      salesOverTime,
      topProducts,
      orderStatusDistribution,
      customerAnalytics: customerAnalytics[0] || {
        totalCustomers: 0,
        customersWithOrders: 0,
        averageOrderValue: 0,
        topCustomers: []
      },
      inventoryAnalytics: inventoryAnalytics[0] || {
        totalProducts: 0,
        activeProducts: 0,
        onSaleProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalInventoryValue: 0
      },
      recentActivity
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
