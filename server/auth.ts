import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; iat: number; exp: number };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function clearTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export async function getCurrentUser() {
  const token = await getTokenFromCookie();
  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded?.userId || null;
}
