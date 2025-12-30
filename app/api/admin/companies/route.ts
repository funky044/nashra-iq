import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - List all companies
export async function GET(request: NextRequest) {
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

    const result = await query(
      `SELECT * FROM companies ORDER BY ticker ASC`
    );

    return NextResponse.json({ companies: result.rows });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

// POST - Create new company
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

    const body = await request.json();
    const { ticker, nameEn, nameAr, market, sector, industry, marketCap, website } = body;

    if (!ticker || !nameEn || !market) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if ticker already exists
    const existing = await query('SELECT id FROM companies WHERE ticker = $1', [ticker]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ticker already exists' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO companies (ticker, name_en, name_ar, market, sector, industry, market_cap, website)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [ticker, nameEn, nameAr, market, sector, industry, marketCap || null, website]
    );

    return NextResponse.json({ 
      success: true, 
      company: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
