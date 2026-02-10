import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { AuthenticationError, UnauthorizedError } from '../lib/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organisationId: string;
    role: 'admin' | 'member';
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(new AuthenticationError('Not authenticated'));
  }

  if (req.user.role !== 'admin') {
    return next(new UnauthorizedError('Admin access required'));
  }

  next();
}
