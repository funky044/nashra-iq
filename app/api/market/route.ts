import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/redis';

// Force dynamic - prevent static generation of API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const market = searchParams.get('market') || 'saudi';
  
  // Try cache first
  const cacheKey = `market:${market}`;
  const cached = await cacheGet(cacheKey);
  
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  try {
    // Get market statistics
    const result = await query(`
      WITH latest_prices AS (
        SELECT DISTINCT ON (c.id)
          c.id,
          c.ticker,
          c.name_en,
          c.sector,
          p.close_price,
          p.volume,
          p.trade_date
        FROM companies c
        INNER JOIN prices_ohlc p ON c.id = p.company_id
        WHERE c.market = $1 AND c.is_active = true
        ORDER BY c.id, p.trade_date DESC
      ),
      previous_prices AS (
        SELECT DISTINCT ON (c.id)
          c.id,
          p.close_price as prev_close
        FROM companies c
        INNER JOIN prices_ohlc p ON c.id = p.company_id
        WHERE c.market = $1 AND c.is_active = true
          AND p.trade_date < (SELECT MAX(trade_date) FROM prices_ohlc WHERE company_id = c.id)
        ORDER BY c.id, p.trade_date DESC
      )
      SELECT 
        l.ticker,
        l.name_en,
        l.sector,
        l.close_price,
        l.volume,
        (l.close_price - p.prev_close) as change,
        ((l.close_price - p.prev_close) / p.prev_close * 100) as change_percent
      FROM latest_prices l
      LEFT JOIN previous_prices p ON l.id = p.id
      ORDER BY l.ticker
    `, [market]);
    
    const data = {
      market,
      timestamp: new Date().toISOString(),
      companies: result.rows.map(row => ({
        ticker: row.ticker,
        name: row.name_en,
        sector: row.sector,
        price: parseFloat(row.close_price),
        volume: parseInt(row.volume),
        change: row.change ? parseFloat(row.change) : 0,
        changePercent: row.change_percent ? parseFloat(row.change_percent) : 0,
      })),
    };
    
    // Cache for 1 minute
    await cacheSet(cacheKey, JSON.stringify(data), 60);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
