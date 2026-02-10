import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/health', async (req, res) => {
  const startTime = Date.now();
  let dbConnected = false;
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const dbStartTime = Date.now();

    // Execute simple query with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });

    const queryPromise = db.execute(sql`SELECT 1 as health_check`);

    await Promise.race([queryPromise, timeoutPromise]);

    dbConnected = true;
    dbLatencyMs = Date.now() - dbStartTime;
  } catch (error: any) {
    dbConnected = false;
    dbError = error.message;
  }

  const responseTime = Date.now() - startTime;

  // Health check fails if database is not connected
  const isHealthy = dbConnected;
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    checks: {
      database: {
        status: dbConnected ? 'connected' : 'disconnected',
        latency: dbLatencyMs ? `${dbLatencyMs}ms` : null,
        error: dbError
      }
    }
  });
});

export default router;
