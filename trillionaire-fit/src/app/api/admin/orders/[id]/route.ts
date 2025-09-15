import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional()
});

// PUT /api/admin/orders/[id] - Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    order.status = validatedData.status;
    
    if (validatedData.trackingNumber) {
      order.trackingNumber = validatedData.trackingNumber;
    }
    
    if (validatedData.notes) {
      order.adminNotes = validatedData.notes;
    }

    // Set estimated delivery based on status
    if (validatedData.status === 'shipped') {
      order.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    } else if (validatedData.status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    return NextResponse.json({
      message: 'Order updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      }
    });

  } catch (error) {
    console.error('Update order error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
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
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
