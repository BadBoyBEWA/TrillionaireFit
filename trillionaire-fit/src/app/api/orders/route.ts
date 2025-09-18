import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth-helpers';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { z } from 'zod';

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be positive')
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }).optional(),
  paymentMethod: z.enum(['paystack', 'cash_on_delivery']),
  notes: z.string().max(500).optional()
});

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const filter: any = { user: user.userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name designer images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filter);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify products exist and get current details
    const productIds = validatedData.items.map(item => item.productId);
    const products = await Product.find({ 
      _id: { $in: productIds },
      isActive: true 
    }).lean();

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found or inactive' },
        { status: 400 }
      );
    }

    // Create order items with current product details
    const orderItems = validatedData.items.map(item => {
      const product = products.find(p => String(p._id) === item.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check stock availability
      if (product.totalStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.totalStock}`);
      }

      return {
        product: product._id,
        quantity: item.quantity,
        price: item.price,
        name: product.name,
        designer: product.designer,
        image: product.images[0] || '/placeholder-image.jpg'
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 50000 ? 0 : 2000; // Free shipping over ₦50,000
    const tax = Math.round(subtotal * 0.075); // 7.5% VAT
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `TF-${timestamp}-${random}`;

    // Check for recent duplicate orders (within last 5 minutes)
    const recentOrder = await Order.findOne({
      user: user.userId,
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 minutes ago
      total: total,
      'items.0.product': orderItems[0]?.product // Check if first item matches
    });

    if (recentOrder) {
      return NextResponse.json({
        message: 'Order already exists',
        order: {
          id: recentOrder._id,
          orderNumber: recentOrder.orderNumber,
          total: recentOrder.total,
          status: recentOrder.status,
          paymentMethod: recentOrder.payment.method
        }
      });
    }

    // Create order
    const order = new Order({
      orderNumber,
      user: user.userId,
      items: orderItems,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress || validatedData.shippingAddress,
      payment: {
        method: validatedData.paymentMethod,
        status: 'pending',
        amount: total,
        currency: 'NGN'
      },
      status: 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      notes: validatedData.notes
    });

    await order.save();

    // Send order confirmation email
    try {
      const emailResult = await sendOrderConfirmationEmail(
        validatedData.shippingAddress.email,
        {
          ...order.toObject(),
          createdAt: order.createdAt,
          items: orderItems
        },
        `${validatedData.shippingAddress.firstName} ${validatedData.shippingAddress.lastName}`
      );
      
      if (emailResult.success) {
        console.log('✅ Order confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send order confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Order confirmation email error:', emailError);
    }

    // Update product stock (simplified - in production, you'd want more sophisticated inventory management)
    for (const item of orderItems) {
      const product = products.find(p => String(p._id) === String(item.product));
      if (product && product.stock) {
        // Since we used .lean(), stock is a plain object, not a Map
        // Simple approach: reduce from the first available size/color combination
        const stockObj = product.stock as any;
        const sizes = Object.keys(stockObj);
        
        if (sizes.length > 0) {
          const firstSize = sizes[0];
          const colors = Object.keys(stockObj[firstSize] || {});
          
          if (colors.length > 0) {
            const firstColor = colors[0];
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { [`stock.${firstSize}.${firstColor}`]: -item.quantity } },
              { new: true }
            );
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: String(order._id),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentMethod: order.payment.method
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    
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

    if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Insufficient stock'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}