import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { aiDataService } from '@/lib/ai-data-service';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('Manual sync triggered by admin:', decoded.email);

    // Run data refresh
    const result = await aiDataService.refreshAllData();

    // Clear Redis cache
    try {
      const redis = await getRedisClient();
      await redis.flushdb();
      console.log('Redis cache cleared');
    } catch (redisError) {
      console.error('Failed to clear Redis cache:', redisError);
    }

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      results: {
        stocksUpdated: result.stocksUpdated,
        newsAdded: result.newsAdded,
        errors: result.errors
      }
    });
  } catch (error: any) {
    console.error('Manual sync failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
