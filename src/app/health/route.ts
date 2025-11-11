import { NextResponse } from 'next/server';
import { checkDatabaseHealth, getDatabaseInfo } from '@/lib/db';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    const body = {
      status: health.status,
      message: health.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: getDatabaseInfo(),
    };
    return NextResponse.json(body, { status: health.status === 'healthy' ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}


