import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// This endpoint creates the admin user
// Visit: /api/setup to run it
export async function GET(request: NextRequest) {
  try {
    // Create users table if not exists
    await query(`
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

    // Delete existing admin
    await query('DELETE FROM users WHERE email = $1', ['admin@nashra-iq.com']);

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Create admin user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      ['admin@nashra-iq.com', passwordHash, 'System Administrator', 'admin', true]
    );

    const admin = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      credentials: {
        email: 'admin@nashra-iq.com',
        password: 'admin123',
        note: 'CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN'
      },
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        error: 'Setup failed', 
        details: error.message,
        hint: 'Make sure DATABASE_URL is set in your environment variables'
      },
      { status: 500 }
    );
  }
}
