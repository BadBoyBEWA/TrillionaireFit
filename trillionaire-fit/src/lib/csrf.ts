import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getValidatedEnv } from './env-validation';

// Get CSRF secret from validated environment
let CSRF_SECRET: string;
try {
  const env = getValidatedEnv();
  CSRF_SECRET = env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';
} catch {
  // Fallback for when validation fails
  CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateCSRFTokenWithSecret(): { token: string; secret: string } {
  const token = generateCSRFToken();
  const secret = crypto.createHmac('sha256', CSRF_SECRET).update(token).digest('hex');
  return { token, secret };
}

export function verifyCSRFToken(token: string, secret: string): boolean {
  const expectedSecret = crypto.createHmac('sha256', CSRF_SECRET).update(token).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(secret, 'hex'), Buffer.from(expectedSecret, 'hex'));
}

export function getCSRFTokenFromRequest(request: NextRequest): { token: string; secret: string } | null {
  const token = request.headers.get('x-csrf-token');
  const secret = request.headers.get('x-csrf-secret');
  
  if (!token || !secret) {
    return null;
  }
  
  return { token, secret };
}

export function setCSRFTokenCookie(response: Response, token: string): void {
  response.headers.set('Set-Cookie', `csrf-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`);
}
