import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_ATLAS: process.env.MONGODB_ATLAS,
    MONGODB_ATLAS_URI: process.env.MONGODB_ATLAS_URI ? 'exists' : 'missing',
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('MONGODB') || key.includes('NODE'))
  });
}
