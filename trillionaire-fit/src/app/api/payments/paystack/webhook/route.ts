import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import crypto from 'crypto';

// POST /api/payments/paystack/webhook - Handle Paystack webhooks
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.log('No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.log('No Paystack secret key found');
      return NextResponse.json({ error: 'No secret key' }, { status: 500 });
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.log('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    console.log('Paystack webhook event:', event.event);

    if (event.event === 'charge.success') {
      const { reference, status, amount, customer } = event.data;

      // Find the order by reference
      const order = await Order.findOne({ 
        orderNumber: reference,
        status: 'pending'
      });

      if (!order) {
        console.log('Order not found for reference:', reference);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (status === 'success') {
        // Update order status
        order.status = 'confirmed';
        order.payment.status = 'completed';
        order.payment.paystackTransactionId = event.data.id.toString();
        order.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await order.save();

        console.log('Order confirmed:', order.orderNumber);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
