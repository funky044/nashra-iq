import { Pool } from 'pg';

// Mock database for static/serverless deployments
const mockDbEnabled = !process.env.DATABASE_URL;

let pool: Pool | null = null;

if (!mockDbEnabled && process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  });
}

export async function query(text: string, params?: any[]) {
  if (mockDbEnabled || !pool) {
    // Return empty mock data for static builds
    return {
      rows: [],
      rowCount: 0,
      command: '',
      oid: 0,
      fields: [],
    };
  }

  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  
  return res;
}

export async function getClient() {
  if (mockDbEnabled || !pool) {
    throw new Error('Database not available in static mode');
  }
  return await pool.connect();
}

export default pool;
