import { NextResponse } from 'next/server';
import { validateStartup } from '@/lib/startup-validation';

export async function GET() {
  try {
    // Skip database validation during build time
    // Check if we're in a build context by looking for build-specific indicators
    const isBuildTime = process.env.NODE_ENV === 'production' && 
                       (process.env.npm_lifecycle_event === 'build' || 
                        process.argv.includes('build') ||
                        process.env.VERCEL_ENV === 'preview');
    
    if (isBuildTime) {
      return NextResponse.json({
        status: 'healthy',
        message: 'Build-time health check - database validation skipped',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
    }

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
