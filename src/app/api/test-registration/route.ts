import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 TEST - Starting registration test');
    
    // Connect to database
    await dbConnect();
    
    // Ensure connection is fully established
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.log('⚠️ WARNING - Connection not fully established, waiting...');
      await new Promise((resolve, reject) => {
        if (mongoose.default.connection.readyState === 1) {
          resolve(true);
        } else {
          mongoose.default.connection.once('open', () => resolve(true));
          mongoose.default.connection.once('error', reject);
          setTimeout(() => reject(new Error('Connection timeout')), 10000);
        }
      });
      console.log('✅ Connection fully established');
    }
    
    // Test user data
    const testUserData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'buyer' as const
    };
    
    console.log('🔍 TEST - Creating test user:', testUserData.email);
    
    // Create test user
    const user = new User(testUserData);
    await user.save();
    
    console.log('✅ TEST - User created successfully');
    console.log('🔍 TEST - User firstName:', user.firstName);
    console.log('🔍 TEST - User lastName:', user.lastName);
    
    // Clean up - delete the test user
    await User.findByIdAndDelete(user._id);
    console.log('🧹 TEST - Test user cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'Registration test successful',
      data: {
        userCreated: true,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ TEST - Registration test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
