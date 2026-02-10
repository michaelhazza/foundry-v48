import { env } from '../lib/env';

export const corsOptions = {
  origin: env.NODE_ENV === 'production'
    ? env.APP_URL
    : true, // Reflect request origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
