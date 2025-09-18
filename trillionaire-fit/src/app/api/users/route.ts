import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth-helpers';
import { registerSchema, querySchema, validateInput } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    requireAdmin(request);
    
    // Connect to MongoDB
    await dbConnect();

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { page, limit, role } = validateInput(querySchema, queryParams);

    // Build query
    const query = role ? { role } : {};

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(query)
      .select('-password') // Exclude password field
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    // Log error securely
    console.error('Get users error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Handle authentication errors
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    requireAdmin(request);
    
    // Connect to MongoDB
    await dbConnect();

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = validateInput(registerSchema, body);
    const { name, email, password, role } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role
    };

    // Create and save the user
    const user = new User(userData);
    await user.save();

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    // Log error securely
    console.error('Create user error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Handle authentication errors
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    // Handle validation errors
    if (error instanceof Error && error.message.startsWith('Validation error:')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
