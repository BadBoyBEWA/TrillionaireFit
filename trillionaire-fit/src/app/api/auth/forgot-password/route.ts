import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { authRateLimiter, createRateLimitResponse } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  console.log('🔍 FORGOT PASSWORD API CALLED');
  try {
    // Rate Limiting
    const rateLimitResult = authRateLimiter.check(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetTime,
        'Too many password reset attempts. Please try again later.'
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

    console.log('✅ Rate limit and CSRF checks passed');
    await dbConnect();
    console.log('✅ Database connected');

    const body = await request.json();
    const { email } = body;
    console.log('📧 Email received:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 90000); // 1 minute 30 seconds (90 seconds)

    // Save reset token to user
    try {
      const updateResult = await User.updateOne(
        { _id: user._id },
        { 
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry
        }
      );
      
      if (!updateResult.acknowledged) {
        throw new Error('Failed to save reset token');
      }
    } catch (saveError) {
      console.error('Error saving reset token:', saveError);
      return NextResponse.json(
        { error: 'Failed to save reset token. Please try again.' },
        { status: 500 }
      );
    }

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(
        email, 
        resetToken, 
        user.firstName || 'User'
      );
      
      if (emailResult.success) {
        console.log('✅ Password reset email sent successfully');
      } else {
        console.error('❌ Failed to send password reset email:', emailResult.error);
        // Still return success to user for security (don't reveal email issues)
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Still return success to user for security
    }

    // For development, also log the reset link
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: ${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`);
    }

    return NextResponse.json({
      message: 'Password reset instructions have been sent to your email address.'
    });

  } catch (error) {
    console.error('Forgot password error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
