const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Seeding database with demo data...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, subscription_tier)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@nashra-iq.com', adminPassword, 'Admin User', 'admin', 'pro']);
    
    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, subscription_tier)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['demo@nashra-iq.com', demoPassword, 'Demo User', 'registered', 'free']);
    
    // Insert source registry
    const sources = [
      { name: 'Tadawul Official', type: 'market_data', url: 'https://www.saudiexchange.sa', license: 'Licensed', note: 'Official Saudi Exchange data feed' },
      { name: 'Reuters Arabia', type: 'news_api', url: 'https://reuters.com', license: 'Licensed', note: 'Reuters news API for GCC markets' },
      { name: 'Arab News', type: 'rss', url: 'https://arabnews.com/rss', license: 'Permitted RSS', note: 'Arab News RSS feed' },
      { name: 'DEMO Data Provider', type: 'demo', url: null, license: 'Demo Only', note: 'Simulated data for demonstration' }
    ];
    
    for (const source of sources) {
      await client.query(`
        INSERT INTO source_registry (source_name, source_type, source_url, license_type, license_note)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [source.name, source.type, source.url, source.license, source.note]);
    }
    
    // Get demo source ID
    const demoSourceResult = await client.query(
      "SELECT id FROM source_registry WHERE source_name = 'DEMO Data Provider'"
    );
    const demoSourceId = demoSourceResult.rows[0]?.id || 4;
    
    // Insert demo companies (Saudi market)
    const companies = [
      { ticker: '2222', name_en: 'Saudi Aramco', name_ar: 'أرامكو السعودية', market: 'saudi', sector: 'Energy', industry: 'Oil & Gas' },
      { ticker: '1120', name_en: 'Al Rajhi Bank', name_ar: 'مصرف الراجحي', market: 'saudi', sector: 'Financials', industry: 'Banking' },
      { ticker: '2010', name_en: 'SABIC', name_ar: 'سابك', market: 'saudi', sector: 'Materials', industry: 'Chemicals' },
      { ticker: '2030', name_en: 'SABIC Agri-Nutrients', name_ar: 'سابك للمغذيات الزراعية', market: 'saudi', sector: 'Materials', industry: 'Fertilizers' },
      { ticker: '1180', name_en: 'National Commercial Bank', name_ar: 'البنك الأهلي التجاري', market: 'saudi', sector: 'Financials', industry: 'Banking' },
      { ticker: '4061', name_en: 'Etihad Etisalat (Mobily)', name_ar: 'اتحاد اتصالات (موبايلي)', market: 'saudi', sector: 'Communication Services', industry: 'Telecom' },
      { ticker: '2090', name_en: 'JESCO', name_ar: 'جيسكو', market: 'saudi', sector: 'Energy', industry: 'Power Generation' },
      { ticker: '4280', name_en: 'Kingdom Holding', name_ar: 'المملكة القابضة', market: 'saudi', sector: 'Financials', industry: 'Investment' },
    ];
    
    for (const company of companies) {
      await client.query(`
        INSERT INTO companies (ticker, name_en, name_ar, market, sector, industry, market_cap)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (ticker) DO NOTHING
      `, [company.ticker, company.name_en, company.name_ar, company.market, company.sector, company.industry, Math.random() * 500000000000]);
    }
    
    // Get company IDs
    const companiesResult = await client.query('SELECT id, ticker FROM companies');
    const companyMap = {};
    companiesResult.rows.forEach(row => {
      companyMap[row.ticker] = row.id;
    });
    
    // Insert demo price data (last 30 days)
    const today = new Date();
    for (const ticker in companyMap) {
      const companyId = companyMap[ticker];
      let basePrice = 30 + Math.random() * 150;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Skip weekends
        if (date.getDay() === 5 || date.getDay() === 6) continue;
        
        const change = (Math.random() - 0.5) * 5;
        basePrice += change;
        
        const open = basePrice + (Math.random() - 0.5) * 2;
        const close = basePrice + (Math.random() - 0.5) * 2;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.floor(1000000 + Math.random() * 5000000);
        
        await client.query(`
          INSERT INTO prices_ohlc (company_id, trade_date, open_price, high_price, low_price, close_price, volume, source_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (company_id, trade_date) DO NOTHING
        `, [companyId, date.toISOString().split('T')[0], open, high, low, close, volume, demoSourceId]);
      }
    }
    
    // Insert demo fundamentals
    for (const ticker in companyMap) {
      const companyId = companyMap[ticker];
      
      await client.query(`
        INSERT INTO fundamentals (
          company_id, period_type, fiscal_year, fiscal_quarter,
          revenue, net_income, total_assets, shareholders_equity, eps,
          source_id, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (company_id, period_type, fiscal_year, fiscal_quarter) DO NOTHING
      `, [
        companyId, 'quarterly', 2024, 3,
        5000000000 + Math.random() * 10000000000,
        500000000 + Math.random() * 2000000000,
        50000000000 + Math.random() * 100000000000,
        20000000000 + Math.random() * 50000000000,
        2.5 + Math.random() * 5,
        demoSourceId,
        new Date('2024-10-15')
      ]);
    }
    
    // Insert demo news
    const newsItems = [
      {
        title_en: 'Saudi Aramco Announces Q3 2024 Results',
        title_ar: 'أرامكو السعودية تعلن نتائج الربع الثالث 2024',
        summary_en: 'Saudi Aramco reported strong Q3 earnings with net income of $27.5B',
        summary_ar: 'أعلنت أرامكو السعودية عن أرباح قوية للربع الثالث بصافي دخل 27.5 مليار دولار',
        companies: ['2222'],
        category: 'earnings'
      },
      {
        title_en: 'Al Rajhi Bank Expands Digital Services',
        title_ar: 'مصرف الراجحي يوسع خدماته الرقمية',
        summary_en: 'Al Rajhi Bank launched new mobile banking features targeting young customers',
        summary_ar: 'أطلق مصرف الراجحي ميزات جديدة للخدمات المصرفية عبر الهاتف المحمول',
        companies: ['1120'],
        category: 'corporate'
      },
      {
        title_en: 'SABIC Signs Major Partnership in Petrochemicals',
        title_ar: 'سابك توقع شراكة كبرى في البتروكيماويات',
        summary_en: 'SABIC enters strategic partnership to expand production capacity',
        summary_ar: 'سابك تدخل في شراكة استراتيجية لتوسيع الطاقة الإنتاجية',
        companies: ['2010'],
        category: 'corporate'
      }
    ];
    
    for (const news of newsItems) {
      const newsResult = await client.query(`
        INSERT INTO news_items (
          title_en, title_ar, summary_en, summary_ar,
          source_id, source_name, published_at, language, category, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        news.title_en, news.title_ar, news.summary_en, news.summary_ar,
        demoSourceId, 'DEMO Data Provider',
        new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        'bilingual', news.category, true
      ]);
      
      const newsId = newsResult.rows[0].id;
      
      for (const ticker of news.companies) {
        const companyId = companyMap[ticker];
        if (companyId) {
          await client.query(`
            INSERT INTO news_companies (news_id, company_id, relevance_score)
            VALUES ($1, $2, $3)
          `, [newsId, companyId, 0.95]);
        }
      }
    }
    
    // Insert demo events
    const events = [
      { ticker: '2222', type: 'earnings', date: '2024-11-05', title_en: 'Q3 2024 Earnings Call', title_ar: 'مكالمة أرباح الربع الثالث 2024' },
      { ticker: '1120', type: 'dividend', date: '2024-12-15', title_en: 'Dividend Payment', title_ar: 'دفع الأرباح', amount: 1.5 },
      { ticker: '2010', type: 'agm', date: '2025-03-20', title_en: 'Annual General Meeting', title_ar: 'الجمعية العمومية السنوية' },
    ];
    
    for (const event of events) {
      const companyId = companyMap[event.ticker];
      if (companyId) {
        await client.query(`
          INSERT INTO events_calendar (
            company_id, event_type, event_date, title_en, title_ar, amount, currency, source_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [companyId, event.type, event.date, event.title_en, event.title_ar, event.amount || null, 'SAR', demoSourceId]);
      }
    }
    
    await client.query('COMMIT');
    console.log('✓ Database seeded successfully with demo data');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
