import jwt from 'jsonwebtoken';
import { env } from './env';
import { AuthenticationError } from './errors';

export interface TokenPayload {
  userId: string;
  organisationId: string;
  role: 'admin' | 'member';
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'foundry-api',
    subject: payload.userId
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'foundry-api',
    subject: payload.userId
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}
