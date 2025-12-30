import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, comparePassword, generateToken } from '@/lib/auth';

// Force dynamic - prevent static generation of API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, fullName } = body;
    
    if (action === 'register') {
      // Validate input
      if (!email || !password || !fullName) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Check if user exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      
      // Create user
      const user = await createUser(email, password, fullName);
      
      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tier: user.subscription_tier,
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tier: user.subscription_tier,
        },
        token,
      });
    }
    
    if (action === 'login') {
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Missing email or password' },
          { status: 400 }
        );
      }
      
      // Get user
      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Verify password
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tier: user.subscription_tier,
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tier: user.subscription_tier,
        },
        token,
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
