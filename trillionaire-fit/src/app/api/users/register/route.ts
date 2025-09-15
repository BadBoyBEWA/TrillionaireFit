import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUserInput } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, validateInput } from '@/lib/validation';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { authRateLimiter, createRateLimitResponse } from '@/lib/rate-limit';
import { sendWelcomeEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimitResult = authRateLimiter.check(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetTime,
        'Too many registration attempts. Please try again later.'
      );
    }

    // CSRF Protection
    const csrfData = getCSRFTokenFromRequest(request);
    if (!csrfData || !verifyCSRFToken(csrfData.token, csrfData.secret)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Connect to DB
    await connectDB();

    // Parse & validate
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = validateInput(registerSchema, body);
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid input' },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validatedData;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (force role = buyer for safety)
    const userData: IUserInput = {
      name,
      email,
      password: hashedPassword,
      role: 'buyer',
    };
    const user = new User(userData);
    await user.save();

    // Send welcome email
    try {
      const emailResult = await sendWelcomeEmail(
        user.email,
        user.name || 'User'
      );
      
      if (emailResult.success) {
        console.log('✅ Welcome email sent successfully');
      } else {
        console.error('❌ Failed to send welcome email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Welcome email error:', emailError);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare response
    const response = NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set JWT in HttpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error(
      'Registration error:',
      error instanceof Error ? error.message : 'Unknown error'
    );


    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
