import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null
      }
    });
  }

  // Handle other errors
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: {
      code: 'SERVER_INTERNAL_ERROR',
      message: 'Internal server error',
      details: null
    }
  });
};
