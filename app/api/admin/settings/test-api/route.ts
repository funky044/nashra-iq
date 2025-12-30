import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

    const body = await request.json();
    const { apiKey } = body;

    // Test different APIs based on key
    let result;
    
    switch (apiKey) {
      case 'alphaVantage':
        result = await testAlphaVantage(body.key);
        break;
      case 'newsApi':
        result = await testNewsAPI(body.key);
        break;
      case 'openai':
        result = await testOpenAI(body.key);
        break;
      case 'anthropic':
        result = await testAnthropic(body.key);
        break;
      case 'googleTranslate':
        result = await testGoogleTranslate(body.key);
        break;
      default:
        return NextResponse.json({ error: 'Unknown API' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function testAlphaVantage(apiKey: string) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data['Global Quote']) {
    return { success: true, message: 'Alpha Vantage connected successfully' };
  } else if (data['Note']) {
    return { success: false, error: 'API rate limit exceeded' };
  } else {
    return { success: false, error: 'Invalid API key' };
  }
}

async function testNewsAPI(apiKey: string) {
  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'ok') {
    return { success: true, message: 'NewsAPI connected successfully' };
  } else {
    return { success: false, error: data.message || 'Invalid API key' };
  }
}

async function testOpenAI(apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  if (response.ok) {
    return { success: true, message: 'OpenAI connected successfully' };
  } else {
    const error = await response.json();
    return { success: false, error: error.error?.message || 'Invalid API key' };
  }
}

async function testAnthropic(apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    })
  });
  
  if (response.ok) {
    return { success: true, message: 'Anthropic Claude connected successfully' };
  } else {
    const error = await response.json();
    return { success: false, error: error.error?.message || 'Invalid API key' };
  }
}

async function testGoogleTranslate(apiKey: string) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: 'test',
      target: 'ar'
    })
  });
  
  if (response.ok) {
    return { success: true, message: 'Google Translate connected successfully' };
  } else {
    const error = await response.json();
    return { success: false, error: error.error?.message || 'Invalid API key' };
  }
}
