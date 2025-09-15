import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, validateInput } from '@/lib/validation';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { authRateLimiter, createRateLimitResponse } from '@/lib/rate-limit';

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
        'Too many login attempts. Please try again later.'
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

    await connectDB();

    // Parse and validate request
    const body = await request.json();
    const { email, password } = validateInput(loginSchema, body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    // Set cookie (HttpOnly so it's safe)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in prod
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}