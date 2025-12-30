// scripts/create-admin.js
// Run with: node scripts/create-admin.js

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        language_preference VARCHAR(10) DEFAULT 'en',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Users table ready');

    // Hash password
    const password = 'admin123';
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Delete existing admin
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@nashra-iq.com']);
    console.log('✅ Removed old admin (if any)');

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      ['admin@nashra-iq.com', passwordHash, 'Administrator', 'admin', true]
    );

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════');
    console.log('Login credentials:');
    console.log('Email: admin@nashra-iq.com');
    console.log('Password: admin123');
    console.log('═══════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('');
    console.log('Access admin panel at:');
    console.log('http://localhost:3000/en/admin');
    console.log('or');
    console.log('https://your-app.vercel.app/en/admin');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    console.error('');
    console.error('Common issues:');
    console.error('1. DATABASE_URL not set in environment');
    console.error('2. Database server not running');
    console.error('3. Wrong database credentials');
    console.error('');
    console.error('Make sure you have .env.local with:');
    console.error('DATABASE_URL=postgresql://user:pass@host:5432/dbname');
  } finally {
    await pool.end();
  }
}

createAdmin();
