# Production Deployment Guide

## Prerequisites

1. Vercel Account
2. GitHub Account
3. Supabase Account (or Neon/Railway for PostgreSQL)
4. Upstash Account (for Redis)

## Step 1: Setup PostgreSQL Database

### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Create new project
3. Wait for database provisioning
4. Go to Settings → Database
5. Copy connection string (starts with `postgresql://`)

### Option B: Neon
1. Go to https://neon.tech
2. Create new project
3. Copy connection string

## Step 2: Setup Redis

1. Go to https://upstash.com
2. Create account
3. Create new Redis database
4. Select region closest to your Vercel deployment
5. Copy `REDIS_URL` from connection details

## Step 3: Initialize Database

### Using Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire content from `database/schema.sql`
4. Run query
5. Create another new query
6. Copy entire content from `database/seed.sql`
7. Run query

### Using psql command line:
```bash
# Set your database URL
export DATABASE_URL="postgresql://..."

# Run schema
psql $DATABASE_URL < database/schema.sql

# Run seed data
psql $DATABASE_URL < database/seed.sql
```

## Step 4: Configure Vercel

1. Push code to GitHub:
```bash
git add .
git commit -m "Production deployment"
git push origin main
```

2. Go to Vercel Dashboard
3. Import project from GitHub
4. Add Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://default:password@host:6379
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=NashraIQ
```

5. Deploy

## Step 5: Verify Deployment

Test these endpoints:

1. Homepage: `https://your-app.vercel.app`
2. Health: `https://your-app.vercel.app/api/health`
3. Market: `https://your-app.vercel.app/api/market`

## Step 6: Set Up Data Pipeline (Optional)

For real-time data updates, create a cron job or scheduled function:

```javascript
// api/cron/update-prices/route.ts
export async function GET() {
  // Fetch latest prices from data provider
  // Update database
  // Clear Redis cache
  return Response.json({ success: true });
}
```

Configure in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/update-prices",
    "schedule": "0 * * * *"
  }]
}
```

## Troubleshooting

### Database connection fails:
- Check DATABASE_URL is correct
- Verify IP whitelist in Supabase (allow all: 0.0.0.0/0)
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Redis connection fails:
- Check REDIS_URL format
- Verify Upstash database is active
- Test: `redis-cli -u $REDIS_URL PING`

### Build succeeds but pages empty:
- Check Vercel function logs
- Verify data exists in database: `SELECT COUNT(*) FROM companies`
- Check browser console for errors

## Production Checklist

- [ ] Database created and initialized
- [ ] Redis created
- [ ] Environment variables added in Vercel
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Health check returns 200
- [ ] Homepage loads with data
- [ ] Company pages work
- [ ] News feed shows articles

## Monitoring

1. Enable Vercel Analytics
2. Set up error tracking (Sentry)
3. Monitor database performance (Supabase dashboard)
4. Track API usage (Upstash dashboard)

## Scaling

As your app grows:
1. Upgrade Supabase tier for more connections
2. Add database read replicas
3. Implement CDN caching
4. Enable Vercel Edge Functions for static content
5. Add rate limiting to APIs
