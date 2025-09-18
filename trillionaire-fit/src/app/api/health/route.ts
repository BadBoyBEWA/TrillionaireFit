import { NextResponse } from 'next/server';
import { checkDatabaseHealth, getDatabaseInfo } from '@/lib/db';

export async function GET() {
  try {
    // Skip database validation during build time
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
        database: getDatabaseInfo(),
      });
    }

    // Use the new database health check
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        message: healthCheck.message,
        timestamp: new Date().toISOString(),
        environment: healthCheck.environment,
        database: healthCheck.database,
        connection: getDatabaseInfo(),
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        message: healthCheck.message,
        timestamp: new Date().toISOString(),
        environment: healthCheck.environment,
        database: healthCheck.database,
        connection: getDatabaseInfo(),
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      connection: getDatabaseInfo(),
    }, { status: 500 });
  }
}
