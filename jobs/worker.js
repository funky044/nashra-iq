const { Worker, Queue } = require('bullmq');
const { Pool } = require('pg');
const Redis = require('redis');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect();

// Define queues
const dataIngestionQueue = new Queue('data-ingestion', {
  connection: redisClient,
});

const aiSummaryQueue = new Queue('ai-summary', {
  connection: redisClient,
});

const alertsQueue = new Queue('alerts', {
  connection: redisClient,
});

// Data Ingestion Worker
const dataIngestionWorker = new Worker(
  'data-ingestion',
  async (job) => {
    console.log(`Processing data ingestion job: ${job.id}`);
    
    const { source_type, source_id } = job.data;
    
    switch (source_type) {
      case 'market_data':
        await ingestMarketData(source_id);
        break;
      case 'news_api':
        await ingestNewsAPI(source_id);
        break;
      case 'rss':
        await ingestRSSFeed(source_id);
        break;
      default:
        console.log(`Unknown source type: ${source_type}`);
    }
    
    return { processed: true };
  },
  {
    connection: redisClient,
    concurrency: 5,
  }
);

// AI Summary Worker
const aiSummaryWorker = new Worker(
  'ai-summary',
  async (job) => {
    console.log(`Processing AI summary job: ${job.id}`);
    
    const { content_type, content_id, source_ids } = job.data;
    
    // Get content from database
    let content = '';
    let tableName = '';
    
    if (content_type === 'news') {
      tableName = 'news_items';
      const result = await pool.query(
        'SELECT title_en, summary_en, content_en FROM news_items WHERE id = $1',
        [content_id]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        content = `${row.title_en}\n\n${row.summary_en || ''}\n\n${row.content_en || ''}`;
      }
    }
    
    if (!content) {
      console.log('No content found for AI summary');
      return { processed: false };
    }
    
    // Generate AI summary (simplified - in production, call OpenAI API)
    const summary = await generateAISummary(content, source_ids);
    
    // Store AI summary
    await pool.query(`
      INSERT INTO ai_summaries (
        content_type, content_id, summary_en, confidence_score, 
        model_name, source_ids, is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (content_type, content_id) DO UPDATE
      SET summary_en = $3, confidence_score = $4, model_name = $5
    `, [
      content_type,
      content_id,
      summary.text,
      summary.confidence,
      'gpt-4-turbo',
      source_ids,
      summary.confidence > 0.8, // Auto-approve high-confidence summaries
    ]);
    
    // Add to moderation queue if confidence is low
    if (summary.confidence < 0.8) {
      await pool.query(`
        INSERT INTO moderation_queue (content_type, content_id, risk_level, flagged_reason)
        VALUES ($1, $2, $3, $4)
      `, [content_type, content_id, 'medium', 'Low AI confidence score']);
    }
    
    return { processed: true, confidence: summary.confidence };
  },
  {
    connection: redisClient,
    concurrency: 3,
  }
);

// Alerts Worker
const alertsWorker = new Worker(
  'alerts',
  async (job) => {
    console.log(`Processing alerts job: ${job.id}`);
    
    const { alert_type } = job.data;
    
    // Get all active alerts
    const result = await pool.query(`
      SELECT ua.*, u.email, u.full_name, c.ticker, c.name_en
      FROM user_alerts ua
      INNER JOIN users u ON ua.user_id = u.id
      INNER JOIN companies c ON ua.company_id = c.id
      WHERE ua.is_active = true AND ua.alert_type = $1
    `, [alert_type]);
    
    for (const alert of result.rows) {
      const triggered = await checkAlertCondition(alert);
      
      if (triggered) {
        // Send email notification (simplified)
        console.log(`Alert triggered for user ${alert.email}: ${alert.ticker}`);
        
        // Update last triggered timestamp
        await pool.query(
          'UPDATE user_alerts SET last_triggered_at = NOW() WHERE id = $1',
          [alert.id]
        );
      }
    }
    
    return { processed: true };
  },
  {
    connection: redisClient,
    concurrency: 2,
  }
);

// Helper Functions
async function ingestMarketData(sourceId) {
  console.log(`Ingesting market data from source ${sourceId}`);
  
  // In production, this would call the licensed market data API
  // For now, we'll just log
  console.log('Market data ingestion placeholder');
}

async function ingestNewsAPI(sourceId) {
  console.log(`Ingesting news from API source ${sourceId}`);
  
  // In production, this would call the licensed news API
  console.log('News API ingestion placeholder');
}

async function ingestRSSFeed(sourceId) {
  console.log(`Ingesting RSS feed from source ${sourceId}`);
  
  // In production, this would fetch and parse RSS
  console.log('RSS feed ingestion placeholder');
}

async function generateAISummary(content, sourceIds) {
  // In production, this would call OpenAI API with strict prompt:
  // "Summarize ONLY what exists in the following sources. No assumptions."
  
  // Simplified for demo
  const words = content.split(' ').slice(0, 50).join(' ');
  
  return {
    text: words + '...',
    confidence: 0.85,
  };
}

async function checkAlertCondition(alert) {
  // Get latest price for the company
  const result = await pool.query(`
    SELECT close_price FROM prices_ohlc
    WHERE company_id = $1
    ORDER BY trade_date DESC
    LIMIT 1
  `, [alert.company_id]);
  
  if (result.rows.length === 0) return false;
  
  const currentPrice = parseFloat(result.rows[0].close_price);
  const targetValue = parseFloat(alert.condition_value);
  
  switch (alert.condition_operator) {
    case 'gt':
      return currentPrice > targetValue;
    case 'lt':
      return currentPrice < targetValue;
    case 'eq':
      return Math.abs(currentPrice - targetValue) < 0.01;
    default:
      return false;
  }
}

// Schedule periodic jobs
async function scheduleJobs() {
  // Run data ingestion every 5 minutes
  await dataIngestionQueue.add(
    'market-data-sync',
    { source_type: 'market_data', source_id: 1 },
    { repeat: { pattern: '*/5 * * * *' } }
  );
  
  // Run news ingestion every 15 minutes
  await dataIngestionQueue.add(
    'news-sync',
    { source_type: 'news_api', source_id: 2 },
    { repeat: { pattern: '*/15 * * * *' } }
  );
  
  // Check price alerts every minute
  await alertsQueue.add(
    'price-alerts',
    { alert_type: 'price' },
    { repeat: { pattern: '* * * * *' } }
  );
  
  console.log('Scheduled jobs initialized');
}

// Error handlers
dataIngestionWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

aiSummaryWorker.on('failed', (job, err) => {
  console.error(`AI Summary job ${job.id} failed:`, err);
});

alertsWorker.on('failed', (job, err) => {
  console.error(`Alerts job ${job.id} failed:`, err);
});

// Start
console.log('Starting NashraIQ worker...');
scheduleJobs();

process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await dataIngestionWorker.close();
  await aiSummaryWorker.close();
  await alertsWorker.close();
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});
