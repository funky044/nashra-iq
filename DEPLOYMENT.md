# NashraIQ Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Code review and testing complete
- [ ] Database migrations tested
- [ ] Licensed API credentials obtained
- [ ] SSL certificates acquired
- [ ] Domain DNS configured
- [ ] CDN/edge caching configured
- [ ] Monitoring tools set up
- [ ] Backup strategy implemented

### Environment Configuration

#### 1. Database (PostgreSQL)

**Recommended:** Managed PostgreSQL service (AWS RDS, Supabase, DigitalOcean)

```bash
# Connection pooling recommended
DATABASE_URL=postgresql://user:password@host:5432/nashra_iq?sslmode=require
DATABASE_POOL_MAX=20
```

**Performance Tuning:**
```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '4GB';

-- Enable query planning
ALTER SYSTEM SET effective_cache_size = '12GB';

-- Optimize for analytics
ALTER SYSTEM SET work_mem = '256MB';
```

**Backup Strategy:**
- Daily full backups
- Point-in-time recovery enabled
- 30-day retention minimum
- Test restore quarterly

#### 2. Redis

**Recommended:** Managed Redis (AWS ElastiCache, Upstash, DigitalOcean)

```bash
REDIS_URL=rediss://user:password@host:6380
```

**Configuration:**
- Enable persistence (RDB + AOF)
- Memory: 2GB minimum
- Maxmemory policy: `allkeys-lru`

#### 3. Application

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://nashra-iq.com

# Security
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Licensed Data Providers
MARKET_DATA_API_KEY=<your-licensed-key>
MARKET_DATA_API_URL=https://api.provider.com/v1
NEWS_API_KEY=<your-news-key>
NEWS_API_URL=https://news-api.provider.com

# AI (OpenAI)
OPENAI_API_KEY=<your-openai-key>
OPENAI_MODEL=gpt-4-turbo-preview

# Email (Alerts)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-key>

# Feature Flags
ENABLE_DEMO_MODE=false
ENABLE_AI_SUMMARIES=true
ENABLE_REAL_TIME_DATA=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

4. Set up external database and Redis

**Pros:**
- Zero-config Next.js deployment
- Automatic SSL
- Global CDN
- Serverless functions

**Cons:**
- Background worker needs separate hosting
- Limited control over infrastructure

#### Option 2: AWS

**Architecture:**
- EC2/ECS for app servers
- RDS for PostgreSQL
- ElastiCache for Redis
- CloudFront for CDN
- Route 53 for DNS
- S3 for static assets

**Deployment:**
```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "nashra-iq" -- start
pm2 start jobs/worker.js --name "nashra-worker"
pm2 save
pm2 startup
```

#### Option 3: DigitalOcean App Platform

1. Create app from GitHub repo
2. Configure build command: `npm run build`
3. Configure run command: `npm start`
4. Add worker as separate service
5. Add managed PostgreSQL and Redis

#### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/nashra_iq
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  worker:
    build: .
    command: node jobs/worker.js
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/nashra_iq
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=nashra_iq
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Post-Deployment

#### 1. Run Migrations

```bash
npm run db:migrate
```

#### 2. Verify Services

```bash
# Check app
curl https://nashra-iq.com/api/health

# Check worker
pm2 status

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM companies;"

# Check Redis
redis-cli -u $REDIS_URL ping
```

#### 3. Set Up Monitoring

**Application Monitoring:**
- Sentry for error tracking
- LogRocket for user sessions
- Google Analytics for traffic

**Infrastructure Monitoring:**
- Datadog or New Relic for APM
- CloudWatch for AWS metrics
- Uptime monitoring (UptimeRobot, Pingdom)

**Example Sentry Setup:**
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: 'nashra-iq',
    project: 'web-app',
  }
);
```

#### 4. Configure CDN

**Cloudflare Setup:**
1. Add domain to Cloudflare
2. Enable Auto Minify (CSS, JS, HTML)
3. Enable Brotli compression
4. Set cache rules:
   - Static assets: 1 year
   - API responses: 1 minute
   - HTML pages: 5 minutes

**Cache Headers:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/market',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=30',
          },
        ],
      },
    ];
  },
};
```

#### 5. Security Hardening

**Headers:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

**Rate Limiting:**
```javascript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '15 m'),
});

export async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

### Scaling

#### Horizontal Scaling

**App Servers:**
- Use load balancer (AWS ALB, Nginx)
- Session state in Redis (stateless servers)
- Minimum 2 instances for HA

**Workers:**
- Scale based on queue depth
- Use separate queues for different job types
- Monitor with BullMQ dashboard

#### Database Scaling

**Read Replicas:**
```javascript
// lib/db.ts
const readPool = new Pool({
  connectionString: process.env.DATABASE_READ_URL,
});

const writePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function queryRead(sql, params) {
  return readPool.query(sql, params);
}

export async function queryWrite(sql, params) {
  return writePool.query(sql, params);
}
```

**Partitioning:**
```sql
-- Partition prices_ohlc by date
CREATE TABLE prices_ohlc_2024 PARTITION OF prices_ohlc
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Maintenance

#### Daily
- Monitor error logs
- Check queue depths
- Verify data freshness

#### Weekly
- Review slow queries
- Check disk usage
- Update dependencies

#### Monthly
- Security patches
- Database optimization
- Performance review

#### Quarterly
- DR test
- Capacity planning
- Security audit

### Rollback Plan

```bash
# Quick rollback with Vercel
vercel rollback

# With PM2
pm2 stop all
git checkout <previous-tag>
npm install
npm run build
pm2 restart all

# Database rollback
psql $DATABASE_URL < backup.sql
```

### Support Contacts

- **Infrastructure:** ops@nashra-iq.com
- **Database:** dba@nashra-iq.com
- **API Issues:** api@nashra-iq.com
- **Emergency:** +966-xxx-xxxx

### Compliance Reminders

- [ ] All data sources are licensed
- [ ] Source attribution is visible
- [ ] AI summaries cite sources
- [ ] Disclaimers are present
- [ ] User data is encrypted
- [ ] GDPR compliance verified
- [ ] Audit logs enabled
