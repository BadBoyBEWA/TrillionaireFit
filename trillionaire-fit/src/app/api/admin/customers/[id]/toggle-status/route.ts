import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/auth-helpers';

// PUT /api/admin/customers/[id]/toggle-status - Toggle customer active status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireAdmin(request);
    await dbConnect();

    const customer = await User.findById(params.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (customer._id.toString() === admin.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Toggle active status
    customer.isActive = !customer.isActive;
    await customer.save();

    return NextResponse.json({
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      customer: {
        id: String(customer._id),
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive
      }
    });

  } catch (error) {
    console.error('Toggle customer status error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update customer status' },
      { status: 500 }
    );
  }
}
