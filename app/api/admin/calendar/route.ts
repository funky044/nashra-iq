import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - List calendar events
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
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(company_id, event_date, event_type)
      )
    `);

    const result = await query(
      `SELECT ce.*, c.name_en as company_name, c.ticker
       FROM calendar_events ce
       LEFT JOIN companies c ON ce.company_id = c.id
       ORDER BY ce.event_date DESC`
    );

    return NextResponse.json({ events: result.rows });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST - Create event
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
    const { companyId, eventType, title, eventDate, description } = body;

    const result = await query(
      `INSERT INTO calendar_events (company_id, event_type, title, event_date, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, eventType, title, eventDate, description]
    );

    return NextResponse.json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
