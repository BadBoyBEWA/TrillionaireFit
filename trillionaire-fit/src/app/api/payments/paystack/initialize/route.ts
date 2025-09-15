import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth-helpers';
import { initializePaystackTransaction, formatAmountForPaystack } from '@/lib/paystack';
import { z } from 'zod';

const initializePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  email: z.string().email('Valid email is required')
});

// POST /api/payments/paystack/initialize - Initialize Paystack payment
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { orderId, email } = initializePaymentSchema.parse(body);

    // Find the order
    const order = await Order.findOne({ 
      _id: orderId, 
      user: user.userId,
      status: 'pending'
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      );
    }

    // Check if payment is already initialized
    if (order.payment.paystackReference) {
      return NextResponse.json(
        { error: 'Payment already initialized for this order' },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order=${order._id}`;

    const paystackResponse = await initializePaystackTransaction({
      reference: order.orderNumber,
      amount: formatAmountForPaystack(order.total, 'NGN'),
      email: email,
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: user.userId
      }
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: paystackResponse.message || 'Failed to initialize payment' },
        { status: 400 }
      );
    }

    // Update order with Paystack reference
    order.payment.paystackReference = paystackResponse.data.reference;
    await order.save();

    return NextResponse.json({
      message: 'Payment initialized successfully',
      paymentUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      accessCode: paystackResponse.data.access_code
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    
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

    if (error instanceof Error && error.message.includes('Paystack API error')) {
      return NextResponse.json(
        { error: 'Payment service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
