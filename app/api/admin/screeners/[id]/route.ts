import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const presetId = parseInt(params.id);

    await query('DELETE FROM screener_presets WHERE id = $1', [presetId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json({ error: 'Failed to delete preset' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const presetId = parseInt(params.id);
    const body = await request.json();
    const { name, description, criteria } = body;

    const result = await query(
      `UPDATE screener_presets 
       SET name = $1, description = $2, criteria = $3
       WHERE id = $4
       RETURNING *`,
      [name, description, criteria, presetId]
    );

    return NextResponse.json({ success: true, preset: result.rows[0] });
  } catch (error) {
    console.error('Error updating preset:', error);
    return NextResponse.json({ error: 'Failed to update preset' }, { status: 500 });
  }
}
