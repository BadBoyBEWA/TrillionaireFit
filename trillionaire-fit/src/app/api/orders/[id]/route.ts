import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth-helpers';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const order = await Order.findOne({ 
      _id: params.id, 
      user: user.userId 
    })
    .populate('items.product', 'name designer images')
    .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform the order to match frontend expectations
    const transformedOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.payment?.status || 'pending',
      total: order.total,
      estimatedDelivery: order.estimatedDelivery,
      items: order.items.map(item => ({
        name: item.name,
        designer: item.designer,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress: order.shippingAddress,
      payment: order.payment
    };

    return NextResponse.json({ order: transformedOrder });

  } catch (error) {
    console.error('Get order error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete single order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const order = await Order.findOne({ 
      _id: params.id, 
      user: user.userId 
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of pending or cancelled orders
    if (!['pending', 'cancelled'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Cannot delete order with status: ' + order.status },
        { status: 400 }
      );
    }

    await Order.findByIdAndDelete(params.id);

    return NextResponse.json({ 
      message: 'Order deleted successfully' 
    });

  } catch (error) {
    console.error('Delete order error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
