// scripts/create-admin.js
// Run with: node scripts/create-admin.js

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Hash password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = $2
       RETURNING id, email, full_name, role`,
      ['admin@nashra-iq.com', passwordHash, 'Administrator', 'admin', true]
    );

    console.log('✅ Admin user created/updated successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@nashra-iq.com');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('');
    console.log('Access admin panel at: https://your-app.vercel.app/en/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
