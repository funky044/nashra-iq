import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Load API settings
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

    // Load settings from database
    const result = await query(
      'SELECT key, value FROM system_settings WHERE key LIKE $1',
      ['api_%']
    );

    const apis: any = {};
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = JSON.parse(row.value);
      return acc;
    }, {});

    // Structure API configs
    apis.alphaVantage = settings.api_alpha_vantage || {
      name: 'Alpha Vantage (Stock Data)',
      key: process.env.ALPHA_VANTAGE_KEY || '',
      enabled: false,
      status: 'inactive',
      limit: 500
    };

    apis.newsApi = settings.api_news_api || {
      name: 'NewsAPI (News)',
      key: process.env.NEWS_API_KEY || '',
      enabled: false,
      status: 'inactive',
      limit: 100
    };

    apis.openai = settings.api_openai || {
      name: 'OpenAI (AI Analysis)',
      key: process.env.OPENAI_API_KEY || '',
      enabled: false,
      status: 'inactive'
    };

    apis.anthropic = settings.api_anthropic || {
      name: 'Anthropic Claude (AI)',
      key: process.env.ANTHROPIC_API_KEY || '',
      enabled: false,
      status: 'inactive'
    };

    apis.googleTranslate = settings.api_google_translate || {
      name: 'Google Translate',
      key: process.env.GOOGLE_TRANSLATE_KEY || '',
      enabled: false,
      status: 'inactive'
    };

    apis.argaam = settings.api_argaam || {
      name: 'Argaam (GCC News)',
      key: process.env.ARGAAM_API_KEY || '',
      enabled: false,
      status: 'inactive'
    };

    // Get cron config
    const cronResult = await query(
      "SELECT value FROM system_settings WHERE key = 'cron_config'"
    );
    
    const cron = cronResult.rows[0] 
      ? JSON.parse(cronResult.rows[0].value)
      : {
          enabled: true,
          frequency: 30,
          lastRun: '',
          nextRun: '',
          status: 'active'
        };

    return NextResponse.json({ apis, cron });
  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST - Save API settings
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
    const { apis, cron } = body;

    // Create settings table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Save each API config
    for (const [key, config] of Object.entries(apis)) {
      await query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [`api_${key}`, JSON.stringify(config)]
      );
    }

    // Save cron config
    if (cron) {
      await query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ('cron_config', $1, NOW())
         ON CONFLICT (key) 
         DO UPDATE SET value = $1, updated_at = NOW()`,
        [JSON.stringify(cron)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
