const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = `
-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'registered',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  language_preference VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Companies/Tickers
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(20) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  market VARCHAR(50) NOT NULL,
  sector VARCHAR(100),
  industry VARCHAR(100),
  description_en TEXT,
  description_ar TEXT,
  website VARCHAR(255),
  founded_year INTEGER,
  employees INTEGER,
  market_cap DECIMAL(20, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_market ON companies(market);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- Price Data (OHLCV)
CREATE TABLE IF NOT EXISTS prices_ohlc (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  open_price DECIMAL(12, 4),
  high_price DECIMAL(12, 4),
  low_price DECIMAL(12, 4),
  close_price DECIMAL(12, 4),
  volume BIGINT,
  value DECIMAL(20, 2),
  trades_count INTEGER,
  source_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, trade_date)
);

CREATE INDEX IF NOT EXISTS idx_prices_company_date ON prices_ohlc(company_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices_ohlc(trade_date DESC);

-- Fundamentals
CREATE TABLE IF NOT EXISTS fundamentals (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER,
  revenue DECIMAL(20, 2),
  net_income DECIMAL(20, 2),
  ebitda DECIMAL(20, 2),
  total_assets DECIMAL(20, 2),
  total_liabilities DECIMAL(20, 2),
  shareholders_equity DECIMAL(20, 2),
  operating_cash_flow DECIMAL(20, 2),
  free_cash_flow DECIMAL(20, 2),
  eps DECIMAL(12, 4),
  book_value_per_share DECIMAL(12, 4),
  source_id INTEGER,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, period_type, fiscal_year, fiscal_quarter)
);

CREATE INDEX IF NOT EXISTS idx_fundamentals_company ON fundamentals(company_id, fiscal_year DESC, fiscal_quarter DESC);

-- Source Registry
CREATE TABLE IF NOT EXISTS source_registry (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  source_url VARCHAR(500),
  license_type VARCHAR(100),
  license_note TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News Items
CREATE TABLE IF NOT EXISTS news_items (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  summary_en TEXT,
  summary_ar TEXT,
  content_en TEXT,
  content_ar TEXT,
  source_id INTEGER REFERENCES source_registry(id),
  source_name VARCHAR(255),
  original_url VARCHAR(500),
  published_at TIMESTAMP NOT NULL,
  language VARCHAR(10),
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_items(source_id);

-- News-Company Relations
CREATE TABLE IF NOT EXISTS news_companies (
  news_id INTEGER REFERENCES news_items(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3, 2),
  PRIMARY KEY (news_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_news_companies_company ON news_companies(company_id);

-- AI Summaries
CREATE TABLE IF NOT EXISTS ai_summaries (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id INTEGER NOT NULL,
  summary_en TEXT,
  summary_ar TEXT,
  confidence_score DECIMAL(3, 2),
  model_name VARCHAR(100),
  source_ids INTEGER[],
  prompt_used TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  is_approved BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ai_summaries_content ON ai_summaries(content_type, content_id);

-- Events Calendar
CREATE TABLE IF NOT EXISTS events_calendar (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  title_en VARCHAR(255),
  title_ar VARCHAR(255),
  description_en TEXT,
  description_ar TEXT,
  amount DECIMAL(12, 4),
  currency VARCHAR(10),
  source_id INTEGER REFERENCES source_registry(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events_calendar(event_date);
CREATE INDEX IF NOT EXISTS idx_events_company ON events_calendar(company_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events_calendar(event_type);

-- User Watchlists
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Items
CREATE TABLE IF NOT EXISTS watchlist_items (
  watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (watchlist_id, company_id)
);

-- User Alerts
CREATE TABLE IF NOT EXISTS user_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  condition_field VARCHAR(100),
  condition_operator VARCHAR(20),
  condition_value DECIMAL(12, 4),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_company ON user_alerts(company_id);

-- Moderation Queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  risk_level VARCHAR(20),
  flagged_reason TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation_queue(status);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  default_language VARCHAR(10) DEFAULT 'en',
  default_market VARCHAR(50) DEFAULT 'saudi',
  email_alerts_enabled BOOLEAN DEFAULT true,
  email_frequency VARCHAR(20) DEFAULT 'daily',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');
    await client.query(schema);
    console.log('✓ Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
