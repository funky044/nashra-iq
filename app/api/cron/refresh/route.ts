import { NextRequest, NextResponse } from 'next/server';
import { aiDataService } from '@/lib/ai-data-service';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting automated data refresh...');
    
    // Run AI data service
    const result = await aiDataService.refreshAllData();
    
    // Clear Redis cache after update
    try {
      const redis = await getRedisClient();
      await redis.flushdb();
      console.log('Redis cache cleared');
    } catch (redisError) {
      console.error('Failed to clear Redis cache:', redisError);
    }
    
    // Log results
    console.log('Data refresh completed:', result);
    
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
    console.error('Cron job failed:', error);
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
