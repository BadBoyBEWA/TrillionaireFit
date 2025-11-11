import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    FLW_SECRET_KEY: process.env.FLW_SECRET_KEY ? '✅ Found' : '❌ Missing',
    NEXT_PUBLIC_FLW_PUBLIC_KEY: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY ? '✅ Found' : '❌ Missing',
    FLW_ENCRYPTION_KEY: process.env.FLW_ENCRYPTION_KEY ? '✅ Found' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('FLW'))
  });
}