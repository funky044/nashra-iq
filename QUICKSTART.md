# NashraIQ - Quick Start Guide

Get NashraIQ up and running in 5 minutes!

## Prerequisites

Make sure you have:
- Node.js 18+ installed
- PostgreSQL 14+ running
- Redis 6+ running

## Quick Setup

### 1. Install Dependencies

```bash
cd nashra-iq
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nashra_iq
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-secret-key
```

### 3. Setup Database

```bash
# Create database
createdb nashra_iq

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Start the Application

Open 3 terminal windows:

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Background Worker:**
```bash
npm run jobs:start
```

**Terminal 3 - Redis (if not already running):**
```bash
redis-server
```

### 5. Open Your Browser

Navigate to: **http://localhost:3000**

## Demo Login

The seed script creates demo users:

**Admin Account:**
- Email: `admin@nashra-iq.com`
- Password: `admin123`

**Regular User:**
- Email: `demo@nashra-iq.com`
- Password: `demo123`

## What's Included in Demo Mode

✅ 8 Saudi market companies (Aramco, Al Rajhi Bank, SABIC, etc.)  
✅ 30 days of price history  
✅ Sample financial statements  
✅ Demo news articles  
✅ Earnings calendar events  
✅ Full bilingual support (English/Arabic)

## Explore Features

1. **Homepage** - Market overview and top movers
2. **Company Pages** - Click any ticker (e.g., 2222 for Aramco)
3. **Language Toggle** - Switch to Arabic (العربية) in header
4. **News** - Browse attributed news with AI summaries
5. **Calendar** - View upcoming earnings and dividends

## Next Steps

### Add Licensed Data

Replace demo API keys in `.env` with your licensed providers:

```env
MARKET_DATA_API_KEY=your-actual-key
NEWS_API_KEY=your-actual-news-key
```

### Enable AI Summaries

Add OpenAI API key:

```env
OPENAI_API_KEY=sk-...
ENABLE_AI_SUMMARIES=true
```

### Turn Off Demo Mode

When ready for production:

```env
ENABLE_DEMO_MODE=false
```

## Common Issues

### Database Connection Error

**Problem:** Can't connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Redis Connection Error

**Problem:** Can't connect to Redis

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (macOS)
brew services start redis

# Start Redis (Linux)
sudo systemctl start redis
```

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## File Structure Overview

```
nashra-iq/
├── app/                    # Next.js pages
│   ├── [locale]/          # Localized routes (en/ar)
│   └── api/               # API endpoints
├── components/            # React components
├── lib/                   # Utilities & database
├── jobs/                  # Background workers
├── scripts/               # Database scripts
└── README.md             # Full documentation
```

## Development Tips

### Watch Database Changes

```bash
# Open PostgreSQL console
psql $DATABASE_URL

# List tables
\dt

# View companies
SELECT ticker, name_en FROM companies;

# View latest prices
SELECT c.ticker, p.close_price, p.trade_date 
FROM prices_ohlc p 
JOIN companies c ON p.company_id = c.id 
ORDER BY p.trade_date DESC 
LIMIT 10;
```

### Monitor Background Jobs

```bash
# View worker logs
tail -f logs/worker.log

# Monitor Redis queues
redis-cli
> KEYS *queue*
> LLEN bull:data-ingestion:waiting
```

### Test API Endpoints

```bash
# Market data
curl http://localhost:3000/api/market?market=saudi

# Search companies
curl http://localhost:3000/api/companies/search?q=aramco

# Login
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"demo@nashra-iq.com","password":"demo123"}'
```

## Resources

- **Full Documentation:** [README.md](README.md)
- **API Documentation:** [API_DOCS.md](API_DOCS.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

## Support

Having issues? Check:
1. Node version: `node --version` (should be 18+)
2. PostgreSQL version: `psql --version` (should be 14+)
3. Redis version: `redis-server --version` (should be 6+)

For detailed troubleshooting, see the full README.

---

**Ready to build!** 🚀

Start exploring at: **http://localhost:3000**
