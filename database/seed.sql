-- Sample production data for NashraIQ

-- Insert major Saudi companies
INSERT INTO companies (ticker, name_en, name_ar, market, sector, industry, market_cap, website) VALUES
('2222.SR', 'Saudi Aramco', 'أرامكو السعودية', 'saudi', 'Energy', 'Oil & Gas', 7500000000000, 'https://www.aramco.com'),
('1120.SR', 'Al Rajhi Bank', 'مصرف الراجحي', 'saudi', 'Financials', 'Banking', 250000000000, 'https://www.alrajhibank.com.sa'),
('2010.SR', 'SABIC', 'سابك', 'saudi', 'Materials', 'Chemicals', 120000000000, 'https://www.sabic.com'),
('1180.SR', 'Al Raya Bank', 'مصرف الإنماء', 'saudi', 'Financials', 'Banking', 45000000000, 'https://www.alinma.com'),
('2030.SR', 'Saudi Telecom', 'الاتصالات السعودية', 'saudi', 'Communication', 'Telecommunications', 150000000000, 'https://www.stc.com.sa'),
('4061.SR', 'Jarir Marketing', 'جرير للتسويق', 'saudi', 'Consumer', 'Retail', 35000000000, 'https://www.jarir.com'),
('4280.SR', 'Kingdom Holding', 'المملكة القابضة', 'saudi', 'Financials', 'Investment', 28000000000, 'https://www.kingdom.com.sa'),
('2280.SR', 'Maaden', 'معادن', 'saudi', 'Materials', 'Mining', 95000000000, 'https://www.maaden.com.sa'),
('2223.SR', 'Al Othaim Markets', 'أسواق العثيم', 'saudi', 'Consumer', 'Retail', 18000000000, 'https://www.othaimmalls.com'),
('2040.SR', 'Saudi Electricity', 'الكهرباء السعودية', 'saudi', 'Utilities', 'Electric Utilities', 115000000000, 'https://www.se.com.sa')
ON CONFLICT (ticker) DO NOTHING;

-- Insert recent price data (last 30 days)
INSERT INTO prices_ohlc (company_id, trade_date, open_price, high_price, low_price, close_price, volume)
SELECT 
    c.id,
    CURRENT_DATE - (n || ' days')::INTERVAL,
    ROUND((28 + random() * 4)::NUMERIC, 2),
    ROUND((30 + random() * 4)::NUMERIC, 2),
    ROUND((27 + random() * 4)::NUMERIC, 2),
    ROUND((28.5 + random() * 3)::NUMERIC, 2),
    FLOOR(5000000 + random() * 10000000)::BIGINT
FROM companies c, generate_series(0, 30) AS n
WHERE c.ticker = '2222.SR'
ON CONFLICT (company_id, trade_date) DO NOTHING;

INSERT INTO prices_ohlc (company_id, trade_date, open_price, high_price, low_price, close_price, volume)
SELECT 
    c.id,
    CURRENT_DATE - (n || ' days')::INTERVAL,
    ROUND((85 + random() * 5)::NUMERIC, 2),
    ROUND((87 + random() * 5)::NUMERIC, 2),
    ROUND((84 + random() * 4)::NUMERIC, 2),
    ROUND((85.5 + random() * 4)::NUMERIC, 2),
    FLOOR(2000000 + random() * 5000000)::BIGINT
FROM companies c, generate_series(0, 30) AS n
WHERE c.ticker = '1120.SR'
ON CONFLICT (company_id, trade_date) DO NOTHING;

-- Insert market indices
INSERT INTO market_indices (name, market, value, change_value, change_percent, volume, timestamp) VALUES
('TASI', 'saudi', 12450.75, 125.32, 1.02, 8500000000, NOW()),
('NOMU', 'saudi', 25680.20, -85.45, -0.33, 450000000, NOW()),
('MT30', 'saudi', 1850.40, 15.80, 0.86, 3200000000, NOW())
ON CONFLICT (name) DO UPDATE SET
    value = EXCLUDED.value,
    change_value = EXCLUDED.change_value,
    change_percent = EXCLUDED.change_percent,
    volume = EXCLUDED.volume,
    timestamp = EXCLUDED.timestamp;

-- Insert sample news
INSERT INTO news (title_en, title_ar, content_en, summary_en, source, published_at, category, sentiment, is_breaking) VALUES
('Saudi Aramco Announces Strong Q4 Results', 'أرامكو السعودية تعلن نتائج قوية للربع الرابع', 
'Saudi Aramco today announced its financial results for Q4 2024, showing robust performance across all segments...', 
'Saudi Aramco reports strong quarterly performance with increased production and revenue.',
'Tadawul News', NOW() - INTERVAL '2 hours', 'Earnings', 'positive', true),

('Al Rajhi Bank Reports Digital Banking Growth', 'مصرف الراجحي يعلن نمو الخدمات المصرفية الرقمية',
'Al Rajhi Bank has reported significant growth in its digital banking services, with mobile app users increasing by 25%...',
'Al Rajhi Bank sees 25% increase in digital banking adoption.',
'Saudi Gazette', NOW() - INTERVAL '5 hours', 'Banking', 'positive', false),

('SABIC Signs Partnership Agreement for Circular Economy', 'سابك توقع اتفاقية شراكة للاقتصاد الدائري',
'SABIC announced today a strategic partnership aimed at advancing circular economy initiatives in petrochemicals...',
'SABIC partners to advance circular economy in petrochemicals sector.',
'Arab News', NOW() - INTERVAL '1 day', 'Corporate', 'positive', false),

('Saudi Market Indices Close Higher on Strong Trading', 'المؤشرات السعودية تغلق على ارتفاع بفعل تداولات قوية',
'Saudi stock market indices closed higher today driven by strong performance in banking and energy sectors...',
'TASI and other indices gain on strong sectoral performance.',
'Reuters', NOW() - INTERVAL '3 hours', 'Markets', 'positive', false)
ON CONFLICT DO NOTHING;

-- Link news to companies
INSERT INTO news_companies (news_id, company_id, relevance_score)
SELECT n.id, c.id, 0.95
FROM news n, companies c
WHERE n.title_en LIKE '%Aramco%' AND c.ticker = '2222.SR'
ON CONFLICT DO NOTHING;

INSERT INTO news_companies (news_id, company_id, relevance_score)
SELECT n.id, c.id, 0.95
FROM news n, companies c
WHERE n.title_en LIKE '%Al Rajhi%' AND c.ticker = '1120.SR'
ON CONFLICT DO NOTHING;

INSERT INTO news_companies (news_id, company_id, relevance_score)
SELECT n.id, c.id, 0.95
FROM news n, companies c
WHERE n.title_en LIKE '%SABIC%' AND c.ticker = '2010.SR'
ON CONFLICT DO NOTHING;
