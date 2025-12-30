import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get stats
    const companiesResult = await query('SELECT COUNT(*) FROM companies');
    const newsResult = await query('SELECT COUNT(*) FROM news');
    const usersResult = await query('SELECT COUNT(*) FROM users');
    const activeUsersResult = await query(
      'SELECT COUNT(*) FROM users WHERE is_active = true'
    );

    return NextResponse.json({
      companies: parseInt(companiesResult.rows[0].count),
      news: parseInt(newsResult.rows[0].count),
      users: parseInt(usersResult.rows[0].count),
      activeUsers: parseInt(activeUsersResult.rows[0].count),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
