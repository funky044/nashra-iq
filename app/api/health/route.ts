import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getRedisClient } from '@/lib/redis';

// Force dynamic - prevent static generation of API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const checks: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
  };

  try {
    // Check Database
    const dbStart = Date.now();
    await query('SELECT 1');
    checks.services.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    checks.status = 'unhealthy';
    checks.services.database = {
      status: 'unhealthy',
      error: 'Connection failed',
    };
  }

  try {
    // Check Redis
    const redisStart = Date.now();
    const redis = await getRedisClient();
    await redis.ping();
    checks.services.redis = {
      status: 'healthy',
      responseTime: Date.now() - redisStart,
    };
  } catch (error) {
    checks.status = 'unhealthy';
    checks.services.redis = {
      status: 'unhealthy',
      error: 'Connection failed',
    };
  }

  // Application version
  checks.version = process.env.npm_package_version || '1.0.0';
  checks.environment = process.env.NODE_ENV || 'development';

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(checks, { status: statusCode });
}
