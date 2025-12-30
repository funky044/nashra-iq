-- NashraIQ Production Database Schema

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    market VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT,
    shares_outstanding BIGINT,
    website VARCHAR(255),
    description_en TEXT,
    description_ar TEXT,
    logo_url VARCHAR(255),
    founded_year INTEGER,
    employees INTEGER,
    headquarters VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- OHLC Price data
CREATE TABLE IF NOT EXISTS prices_ohlc (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    trade_date DATE NOT NULL,
    open_price DECIMAL(10, 2) NOT NULL,
    high_price DECIMAL(10, 2) NOT NULL,
    low_price DECIMAL(10, 2) NOT NULL,
    close_price DECIMAL(10, 2) NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, trade_date)
);

-- Financial statements
CREATE TABLE IF NOT EXISTS financials (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4', 'annual'
    fiscal_year INTEGER NOT NULL,
    revenue BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    total_assets BIGINT,
    total_liabilities BIGINT,
    shareholders_equity BIGINT,
    operating_cash_flow BIGINT,
    investing_cash_flow BIGINT,
    financing_cash_flow BIGINT,
    eps DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, period_end, period_type)
);

-- News articles
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT,
    content_en TEXT NOT NULL,
    content_ar TEXT,
    summary_en TEXT,
    summary_ar TEXT,
    source VARCHAR(255) NOT NULL,
    source_url TEXT,
    published_at TIMESTAMP NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    sentiment_score DECIMAL(3, 2),
    confidence_score DECIMAL(3, 2),
    is_breaking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- News-Company associations
CREATE TABLE IF NOT EXISTS news_companies (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(news_id, company_id)
);

-- Market indices
CREATE TABLE IF NOT EXISTS market_indices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    market VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    change_value DECIMAL(10, 2) NOT NULL,
    change_percent DECIMAL(5, 2) NOT NULL,
    volume BIGINT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User watchlists
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prices_company_date ON prices_ohlc(company_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_financials_company ON financials(company_id, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_companies_news ON news_companies(news_id);
CREATE INDEX IF NOT EXISTS idx_news_companies_company ON news_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_market ON companies(market);
CREATE INDEX IF NOT EXISTS idx_market_indices_timestamp ON market_indices(timestamp DESC);
