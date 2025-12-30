import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  subscription_tier: string;
  language_preference: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  tier: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  const result = await query(
    'SELECT id, email, full_name, role, subscription_tier, language_preference FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<any | null> {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function createUser(email: string, password: string, fullName: string): Promise<User> {
  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role, subscription_tier)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, role, subscription_tier, language_preference`,
    [email, passwordHash, fullName, 'registered', 'free']
  );
  return result.rows[0];
}

export function hasPermission(user: User | null, requiredRole: string): boolean {
  if (!user) return false;
  
  const roleHierarchy: { [key: string]: number } = {
    guest: 0,
    registered: 1,
    pro: 2,
    admin: 3,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}
