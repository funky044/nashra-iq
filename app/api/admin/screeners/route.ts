import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - List screener presets
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

    // Create table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS screener_presets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        criteria JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const result = await query('SELECT * FROM screener_presets ORDER BY created_at DESC');

    return NextResponse.json({ presets: result.rows });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json({ error: 'Failed to fetch presets' }, { status: 500 });
  }
}

// POST - Create preset
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
    const { name, description, criteria } = body;

    const result = await query(
      `INSERT INTO screener_presets (name, description, criteria)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, criteria]
    );

    return NextResponse.json({ success: true, preset: result.rows[0] });
  } catch (error) {
    console.error('Error creating preset:', error);
    return NextResponse.json({ error: 'Failed to create preset' }, { status: 500 });
  }
}
