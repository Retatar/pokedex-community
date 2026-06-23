import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export function generateAccessToken(payload: { id: number; role: string }): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { id: number }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { id: number; role: string } {
  return jwt.verify(token, ACCESS_SECRET) as { id: number; role: string };
}

export function verifyRefreshToken(token: string): { id: number } {
  return jwt.verify(token, REFRESH_SECRET) as { id: number };
}
