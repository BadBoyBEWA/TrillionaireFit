import { NextResponse } from 'next/server';
import { generateCSRFTokenWithSecret } from '@/lib/csrf';

export async function GET() {
  try {
    const { token, secret } = generateCSRFTokenWithSecret();
    
    const response = NextResponse.json({ 
      csrfToken: token,
      csrfSecret: secret 
    });
    
    // Set the token as an HttpOnly cookie for additional security
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 // 1 hour
    });
    
    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
