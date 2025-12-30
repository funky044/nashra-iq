import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { aiDataService } from '@/lib/ai-data-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    await aiDataService.generateScreenerData();

    return NextResponse.json({ success: true, count: 4 }); // 4 default presets
  } catch (error) {
    console.error('Error generating presets:', error);
    return NextResponse.json({ error: 'Failed to generate presets' }, { status: 500 });
  }
}
