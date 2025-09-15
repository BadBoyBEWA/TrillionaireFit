import { NextResponse } from 'next/server';
import { validateStartup } from '@/lib/startup-validation';

export async function GET() {
  try {
    const result = await validateStartup();
    
    if (result.success) {
      return NextResponse.json({
        status: 'healthy',
        message: result.message,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        message: result.message,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
