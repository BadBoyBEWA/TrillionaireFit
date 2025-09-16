import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { z } from 'zod';

const manualVerifySchema = z.object({
  reference: z.string().min(1, 'Reference is required')
});

// POST /api/payments/paystack/manual-verify - Manually verify payment
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { reference } = manualVerifySchema.parse(body);

    // Find the order by reference
    const order = await Order.findOne({ 
      orderNumber: reference,
      status: 'pending'
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await verifyPaystackTransaction(reference);

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: paystackResponse.message || 'Payment verification failed' },
        { status: 400 }
      );
    }

    const paymentData = paystackResponse.data;

    if (paymentData.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Update order with successful payment
    order.status = 'confirmed';
    order.payment.status = 'completed';
    order.payment.paystackTransactionId = paymentData.id.toString();
    order.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
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
    console.error('Manual verify error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
