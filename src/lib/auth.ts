import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User, UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'venulynx-secret-key-2024';
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  department: string | null;
  designation: string | null;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Get current user from cookies
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;
    
    const payload = verifyToken(token);
    if (!payload) return null;
    
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        designation: true,
      },
    });
    
    return user;
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// Role-based access check
export function hasAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    STUDENT: 0,
    TEACHER: 1,
    ADMIN: 2,
    REGISTRAR: 3,
    SUPER_ADMIN: 4,
  };
  
  return requiredRoles.some(role => roleHierarchy[userRole] >= roleHierarchy[role]);
}

// Check if user can approve at specific level
export function canApproveAtLevel(userRole: UserRole, bookingStatus: string): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  if (userRole === 'REGISTRAR' && bookingStatus === 'PENDING_REGISTRAR') return true;
  if (userRole === 'ADMIN' && bookingStatus === 'PENDING_ADMIN') return true;
  return false;
}
