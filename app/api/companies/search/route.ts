import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Force dynamic - prevent static generation of API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const market = searchParams.get('market');
  const sector = searchParams.get('sector');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    let sql = `
      SELECT 
        c.ticker,
        c.name_en,
        c.name_ar,
        c.market,
        c.sector,
        c.industry,
        c.market_cap
      FROM companies c
      WHERE c.is_active = true
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (q) {
      paramCount++;
      sql += ` AND (
        c.ticker ILIKE $${paramCount} OR 
        c.name_en ILIKE $${paramCount} OR 
        c.name_ar ILIKE $${paramCount}
      )`;
      params.push(`%${q}%`);
    }
    
    if (market) {
      paramCount++;
      sql += ` AND c.market = $${paramCount}`;
      params.push(market);
    }
    
    if (sector) {
      paramCount++;
      sql += ` AND c.sector = $${paramCount}`;
      params.push(sector);
    }
    
    sql += ` ORDER BY c.market_cap DESC NULLS LAST LIMIT ${limit}`;
    
    const result = await query(sql, params);
    
    return NextResponse.json({
      results: result.rows.map(row => ({
        ticker: row.ticker,
        nameEn: row.name_en,
        nameAr: row.name_ar,
        market: row.market,
        sector: row.sector,
        industry: row.industry,
        marketCap: row.market_cap ? parseFloat(row.market_cap) : null,
      })),
    });
  } catch (error) {
    console.error('Company search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
