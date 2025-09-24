import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required')
});

// POST /api/admin/orders/verify-payment - Manually verify payment (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    const body = await request.json();
    const { orderId } = verifyPaymentSchema.parse(body);

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      );
    }

    // Update order to confirmed status
    order.status = 'confirmed';
    order.payment.status = 'completed';
    order.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await order.save();

    return NextResponse.json({
      message: 'Payment verified successfully',
      order: {
        id: String(order._id),
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment.status
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
