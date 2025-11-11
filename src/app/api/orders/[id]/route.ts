import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { requireAuth } from '@/lib/auth-helpers';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    await dbConnect();

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
    const orderData = order as any;
    const transformedOrder = {
      id: String(orderData._id),
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      paymentStatus: orderData.payment?.status || 'pending',
      total: orderData.total,
      estimatedDelivery: orderData.estimatedDelivery,
      items: orderData.items.map((item: any) => ({
        name: item.name,
        designer: item.designer,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress: orderData.shippingAddress,
      payment: orderData.payment
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

// PATCH /api/orders/[id] - Update single order
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const body = await request.json();
    const { status, paymentDetails } = body;

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

    // Update order fields
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (paymentDetails) {
      updateData.payment = {
        ...order.payment,
        ...paymentDetails,
        status: 'paid',
        paidAt: new Date()
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      order: updatedOrder,
      message: 'Order updated successfully' 
    });

  } catch (error) {
    console.error('Update order error:', error);
    
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

// DELETE /api/orders/[id] - Delete single order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    await dbConnect();

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
