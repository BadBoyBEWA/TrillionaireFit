import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyPaystackTransaction, formatAmountFromPaystack } from '@/lib/paystack';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Reference is required')
});

// POST /api/payments/paystack/verify - Verify Paystack payment
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { reference } = verifyPaymentSchema.parse(body);

    // Find the order by reference
    const order = await Order.findOne({ 
      'payment.paystackReference': reference 
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment is already verified
    if (order.payment.status === 'completed') {
      return NextResponse.json({
        message: 'Payment already verified',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment.status,
          total: order.total
        }
      });
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

    // Verify payment details match order
    if (paymentData.reference !== reference) {
      return NextResponse.json(
        { error: 'Payment reference mismatch' },
        { status: 400 }
      );
    }

    if (paymentData.status !== 'success') {
      // Update order with failed payment
      order.payment.status = 'failed';
      order.status = 'cancelled';
      await order.save();

      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Verify amount matches
    const expectedAmount = formatAmountFromPaystack(paymentData.amount, 'NGN');
    if (Math.abs(expectedAmount - order.total) > 0.01) { // Allow for small rounding differences
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    // Update order with successful payment
    order.payment.status = 'completed';
    order.payment.paystackTransactionId = paymentData.id.toString();
    order.status = 'confirmed';
    order.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await order.save();

    return NextResponse.json({
      message: 'Payment verified successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment.status,
        total: order.total,
        estimatedDelivery: order.estimatedDelivery
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Paystack API error')) {
      return NextResponse.json(
        { error: 'Payment verification service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
