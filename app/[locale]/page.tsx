import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketOverview from '@/components/MarketOverview';
import TopMovers from '@/components/TopMovers';
import NewsCard from '@/components/NewsCard';
import { query } from '@/lib/db';

// Force dynamic - this page needs database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMarketData() {
  // Get latest market indices (simulated with aggregated data)
  const result = await query(`
    SELECT 
      'TASI' as name,
      12450.75 as value,
      125.32 as change,
      1.02 as change_percent
    UNION ALL
    SELECT 
      'NOMU' as name,
      25680.20 as value,
      -85.45 as change,
      -0.33 as change_percent
  `);
  
  return result.rows.map(row => ({
    name: row.name,
    value: parseFloat(row.value),
    change: parseFloat(row.change),
    changePercent: parseFloat(row.change_percent),
  }));
}

async function getTopMovers() {
  const result = await query(`
    WITH latest_prices AS (
      SELECT DISTINCT ON (company_id)
        company_id,
        close_price,
        trade_date
      FROM prices_ohlc
      ORDER BY company_id, trade_date DESC
    ),
    previous_prices AS (
      SELECT DISTINCT ON (p.company_id)
        p.company_id,
        p.close_price as prev_close
      FROM prices_ohlc p
      INNER JOIN latest_prices l ON p.company_id = l.company_id
      WHERE p.trade_date < l.trade_date
      ORDER BY p.company_id, p.trade_date DESC
    )
    SELECT 
      c.ticker,
      c.name_en,
      l.close_price,
      (l.close_price - p.prev_close) as change,
      ((l.close_price - p.prev_close) / p.prev_close * 100) as change_percent
    FROM companies c
    INNER JOIN latest_prices l ON c.id = l.company_id
    INNER JOIN previous_prices p ON c.id = p.company_id
    ORDER BY change_percent DESC
    LIMIT 10
  `);
  
  const allMovers = result.rows.map(row => ({
    ticker: row.ticker,
    name: row.name_en,
    price: parseFloat(row.close_price),
    change: parseFloat(row.change),
    changePercent: parseFloat(row.change_percent),
  }));
  
  return {
    gainers: allMovers.slice(0, 5),
    losers: allMovers.slice(-5).reverse(),
  };
}

async function getLatestNews() {
  const result = await query(`
    SELECT 
      n.id,
      n.title_en,
      n.summary_en,
      n.source_name,
      n.original_url,
      n.published_at,
      COALESCE(
        json_agg(
          json_build_object('ticker', c.ticker, 'name', c.name_en)
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'
      ) as companies
    FROM news_items n
    LEFT JOIN news_companies nc ON n.id = nc.news_id
    LEFT JOIN companies c ON nc.company_id = c.id
    WHERE n.is_published = true
    GROUP BY n.id
    ORDER BY n.published_at DESC
    LIMIT 6
  `);
  
  return result.rows.map(row => ({
    id: row.id,
    title: row.title_en,
    summary: row.summary_en,
    source_name: row.source_name,
    original_url: row.original_url,
    published_at: row.published_at,
    companies: row.companies,
  }));
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';
  
  const [marketData, topMovers, latestNews] = await Promise.all([
    getMarketData(),
    getTopMovers(),
    getLatestNews(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} user={null} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {locale === 'en' ? 'Professional Market Intelligence' : 'استخبارات السوق الاحترافية'}
              </h1>
              <p className="text-xl text-primary-100 mb-6">
                {locale === 'en' 
                  ? 'Real-time data and AI-powered insights for GCC financial markets'
                  : 'بيانات فورية ورؤى مدعومة بالذكاء الاصطناعي لأسواق دول مجلس التعاون الخليجي المالية'}
              </p>
              {process.env.ENABLE_DEMO_MODE === 'true' && (
                <div className="inline-flex items-center px-4 py-2 bg-amber-500 text-amber-900 rounded-lg font-semibold">
                  {locale === 'en' ? '📊 Demo Mode - Sample Data' : '📊 وضع تجريبي - بيانات نموذجية'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Market Overview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900">
            {locale === 'en' ? 'Market Overview' : 'نظرة عامة على السوق'}
          </h2>
          <MarketOverview locale={locale} data={marketData} />
        </section>

        {/* Top Movers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900">
            {locale === 'en' ? 'Top Movers' : 'الأكثر تحركاً'}
          </h2>
          <TopMovers locale={locale} gainers={topMovers.gainers} losers={topMovers.losers} />
        </section>

        {/* Latest News */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {locale === 'en' ? 'Latest News' : 'آخر الأخبار'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map(news => (
              <NewsCard key={news.id} locale={locale} news={news} />
            ))}
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
