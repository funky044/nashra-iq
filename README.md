# NashraIQ - Financial Intelligence Platform

Professional bilingual (Arabic/English) market intelligence platform for GCC financial markets with AI-assisted automation, licensed data sources, and compliance-first publishing.

## 🚀 Features

### Core Functionality
- **Real-time Market Dashboards** - Live indices, top movers, sector performance
- **Company Profiles** - Comprehensive ticker pages with financials and news
- **Financial Data** - Quarterly & annual statements, key ratios, earnings calendar
- **News Aggregation** - Licensed feeds with proper attribution
- **AI Summaries** - Source-based only, with confidence scores and citations
- **Alerts & Watchlists** - Personalized notifications and portfolio tracking
- **Bilingual Support** - Full Arabic RTL and English LTR

### User Tiers
- **Guest** - Delayed data, limited access
- **Registered** - Full company pages, alerts, watchlists
- **Pro** - Advanced screeners, exports, real-time data (if licensed)
- **Admin** - Source registry, moderation queue, audit logs

### Technical Highlights
- Mobile-first responsive design
- Professional financial UI with Arabic RTL excellence
- Near-zero human operations via automation
- Compliance-first architecture
- Edge caching for ultra-fast loading
- Source transparency on every AI item

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- (Optional) OpenAI API key for AI summaries

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd nashra-iq
npm install
```

### 2. Database Setup

Create PostgreSQL database:

```bash
createdb nashra_iq
```

Copy environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nashra_iq
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production

# Optional: Add your licensed API keys
MARKET_DATA_API_KEY=your-api-key
NEWS_API_KEY=your-news-api-key
OPENAI_API_KEY=your-openai-key
```

Run migrations:

```bash
npm run db:migrate
```

Seed demo data:

```bash
npm run db:seed
```

### 3. Start Services

**Development mode:**

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start background worker
npm run jobs:start

# Terminal 3: Start Redis (if not already running)
redis-server
```

**Production mode:**

```bash
npm run build
npm start
```

Application will be available at `http://localhost:3000`

## 📁 Project Structure

```
nashra-iq/
├── app/                      # Next.js app directory
│   ├── [locale]/            # Localized routes
│   │   ├── page.tsx         # Homepage
│   │   ├── companies/       # Company pages
│   │   ├── markets/         # Market pages
│   │   ├── news/            # News pages
│   │   └── calendar/        # Calendar pages
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication
│   │   ├── market/          # Market data
│   │   └── companies/       # Company search
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Header.tsx           # Navigation header
│   ├── Footer.tsx           # Footer
│   ├── MarketOverview.tsx   # Market dashboard
│   ├── TopMovers.tsx        # Top gainers/losers
│   └── NewsCard.tsx         # News item card
├── lib/                     # Utilities
│   ├── db.ts               # Database client
│   ├── redis.ts            # Redis client
│   ├── auth.ts             # Authentication
│   └── utils.ts            # Helper functions
├── jobs/                    # Background workers
│   └── worker.js           # BullMQ worker
├── scripts/                 # Utility scripts
│   ├── migrate.js          # Database migrations
│   └── seed.js             # Seed demo data
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and authentication
- `companies` - Company/ticker information
- `prices_ohlc` - OHLCV price data
- `fundamentals` - Financial statements
- `news_items` - News articles
- `source_registry` - Data source tracking
- `ai_summaries` - AI-generated summaries
- `events_calendar` - Earnings, dividends, AGMs
- `moderation_queue` - Content review queue

### User Features
- `watchlists` - User watchlists
- `watchlist_items` - Watchlist contents
- `user_alerts` - Price/news alerts
- `user_preferences` - User settings

## 🤖 Automation Pipeline

### Data Ingestion (Cron/Webhooks)
1. Licensed market data API integration
2. News API and RSS feed processing
3. Normalization and deduplication
4. Company/sector classification

### AI Processing
1. Extract content from licensed sources
2. Generate summaries with strict prompts:
   - "Summarize ONLY what exists in sources. No assumptions."
3. Calculate confidence scores
4. Store source citations

### Publishing
- Auto-publish high-confidence (>0.8) content
- Queue low-confidence items for review
- Full audit trail with timestamps

## 🔒 Compliance & Legal

### Data Sourcing Rules
- **NO web scraping** - Only licensed APIs and permitted RSS
- Every record stores: `source_id`, `source_name`, `original_url`, `license_note`
- Headlines + snippets + links by default
- Full articles only if licensed

### AI Summary Rules
- No invented facts
- Always show citations
- Confidence score displayed
- Full audit log

### Disclaimers
- "Not investment advice" on every page
- Clear demo mode badges
- Source attribution required

## 🔧 Configuration

### Environment Variables

```env
# Core
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...

# Market Data (replace with licensed provider)
MARKET_DATA_API_KEY=...
MARKET_DATA_API_URL=...

# News (replace with licensed providers)
NEWS_API_KEY=...
NEWS_API_URL=...

# AI (optional)
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4-turbo-preview

# Feature Flags
ENABLE_DEMO_MODE=true
ENABLE_AI_SUMMARIES=true
ENABLE_REAL_TIME_DATA=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Language Support

Routes are automatically localized:
- English: `/en/markets`
- Arabic: `/ar/markets` (with RTL layout)

## 📊 API Endpoints

### Public Endpoints

```bash
# Get market data
GET /api/market?market=saudi

# Search companies
GET /api/companies/search?q=aramco&market=saudi&limit=20

# Authentication
POST /api/auth
{
  "action": "login",
  "email": "user@example.com",
  "password": "password"
}
```

### Protected Endpoints (require JWT)

```bash
# Get user watchlists
GET /api/watchlists
Headers: Authorization: Bearer <token>

# Create alert
POST /api/alerts
Headers: Authorization: Bearer <token>
Body: {
  "company_id": 1,
  "alert_type": "price",
  "condition_operator": "gt",
  "condition_value": 150.00
}
```

## 🧪 Demo Mode

Demo mode is enabled by default with seed data:

**Demo Users:**
- Admin: `admin@nashra-iq.com` / `admin123`
- User: `demo@nashra-iq.com` / `demo123`

**Demo Companies:**
- Saudi Aramco (2222)
- Al Rajhi Bank (1120)
- SABIC (2010)
- And more...

All demo data is clearly labeled with badges.

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to strong random value
3. Configure licensed data API keys
4. Set `ENABLE_DEMO_MODE=false`
5. Configure email SMTP for alerts
6. Set up SSL/TLS certificates
7. Enable rate limiting
8. Configure CDN/edge caching
9. Set up monitoring and logging
10. Review security headers

### Recommended Stack

- **Hosting**: Vercel, AWS, or DigitalOcean
- **Database**: Managed PostgreSQL (RDS, Supabase)
- **Cache**: Managed Redis (ElastiCache, Upstash)
- **CDN**: Cloudflare or AWS CloudFront
- **Monitoring**: Sentry, DataDog

## 📝 License & Attribution

This platform requires:
- Licensed market data provider
- Licensed news API subscriptions
- Proper source attribution on all content
- Compliance with financial data regulations

## 🤝 Contributing

When adding new features:
1. Maintain source attribution
2. Follow compliance requirements
3. Add proper error handling
4. Update documentation
5. Test both English and Arabic

## 🆘 Support

For issues or questions:
1. Check documentation
2. Review audit logs
3. Check background worker status
4. Verify API credentials

## 📋 TODO / Future Enhancements

- [ ] Advanced screeners (valuation, growth, momentum)
- [ ] Real-time WebSocket data feeds
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced charting (TradingView integration)
- [ ] Portfolio tracking
- [ ] Research reports
- [ ] API for third-party developers
- [ ] Multi-market expansion (UAE, Qatar, Kuwait)

---

**Built with:** Next.js 14, TypeScript, PostgreSQL, Redis, Tailwind CSS, BullMQ

**Compliance:** Licensed data only, AI with source citations, full audit trail
