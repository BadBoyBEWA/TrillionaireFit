import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser } from '@/lib/create-admin';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode for security
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Admin creation is not allowed in production' },
        { status: 403 }
      );
    }
    
    const admin = await createAdminUser();
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
