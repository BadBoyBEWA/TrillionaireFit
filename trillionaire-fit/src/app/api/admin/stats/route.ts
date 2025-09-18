import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Get total revenue (sum of all completed orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get total products
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    // Get recent orders (last 10)
    const recentOrders = await Order.find({})
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber status total createdAt user')
      .lean();

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalProducts,
      recentOrders
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
