import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { authRateLimiter, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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

    await dbConnect();

    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 15) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 15 characters' },
        { status: 400 }
      );
    }

    // Find user with valid reset token (add 5 second buffer for timing issues)
    const currentTime = new Date();
    const bufferTime = new Date(currentTime.getTime() + 5000); // 5 second buffer
    


    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: bufferTime }
    });

    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ resetToken: token });
      if (expiredUser) {
        console.log('Token found but expired:', {
          tokenExpiry: expiredUser.resetTokenExpiry?.toISOString(),
          currentTime: currentTime.toISOString()
        });
        return NextResponse.json(
          { error: 'Reset token has expired. Please request a new one.' },
          { status: 400 }
        );
      } else {
        console.log('Token not found in database');
        return NextResponse.json(
          { error: 'Invalid reset token' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
