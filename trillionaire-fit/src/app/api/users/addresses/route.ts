import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  isDefault: z.boolean().optional()
});

// GET /api/users/addresses - Get user addresses
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const userProfile = await User.findById(user.userId)
      .select('addresses')
      .lean();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile.addresses || []);

  } catch (error) {
    console.error('Get addresses error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/users/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // If this is set as default, unset all other default addresses
    if (validatedData.isDefault) {
      await User.findByIdAndUpdate(
        user.userId,
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    // Add new address
    const newAddress = {
      _id: new Date().getTime().toString(), // Simple ID generation
      ...validatedData,
      isDefault: validatedData.isDefault || false
    };

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $push: { addresses: newAddress } },
      { new: true, select: 'addresses' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(newAddress);

  } catch (error) {
    console.error('Create address error:', error);
    
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
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}

// PUT /api/users/addresses - Update address
export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { id, ...addressData } = body;
    const validatedData = addressSchema.parse(addressData);

    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other default addresses
    if (validatedData.isDefault) {
      await User.findByIdAndUpdate(
        user.userId,
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    // Update the specific address
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: user.userId,
        'addresses._id': id
      },
      { 
        $set: {
          'addresses.$.firstName': validatedData.firstName,
          'addresses.$.lastName': validatedData.lastName,
          'addresses.$.email': validatedData.email,
          'addresses.$.phone': validatedData.phone,
          'addresses.$.address': validatedData.address,
          'addresses.$.city': validatedData.city,
          'addresses.$.state': validatedData.state,
          'addresses.$.country': validatedData.country,
          'addresses.$.postalCode': validatedData.postalCode,
          'addresses.$.isDefault': validatedData.isDefault || false
        }
      },
      { new: true, select: 'addresses' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const updatedAddress = updatedUser.addresses.find(addr => addr._id === id);
    return NextResponse.json(updatedAddress);

  } catch (error) {
    console.error('Update address error:', error);
    
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
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/addresses - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true, select: 'addresses' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Address deleted successfully' });

  } catch (error) {
    console.error('Delete address error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
