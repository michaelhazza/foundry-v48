import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string()
    .startsWith('postgresql://', 'DATABASE_URL must start with postgresql://'),

  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),

  APP_URL: z.string()
    .url('APP_URL must be a valid URL')
    .refine((url) => !url.endsWith('/'), 'APP_URL must not have trailing slash'),

  PORT: z.string().default('5000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  MAX_FILE_SIZE_MB: z.string().default('100'),
  SOURCE_RETENTION_DAYS: z.string().default('30'),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const encryptionKeySchema = z.string()
  .length(64, 'ENCRYPTION_KEY must be exactly 64 hexadecimal characters')
  .regex(/^[0-9a-f]{64}$/i, 'ENCRYPTION_KEY must be valid hexadecimal');

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Environment validation failed:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  const env = parsed.data;

  // Handle conditionally required ENCRYPTION_KEY
  if (process.env.ENCRYPTION_KEY) {
    const encKeyResult = encryptionKeySchema.safeParse(process.env.ENCRYPTION_KEY);

    if (!encKeyResult.success) {
      console.error('❌ ENCRYPTION_KEY validation failed:');
      console.error(encKeyResult.error.flatten().fieldErrors);
      process.exit(1);
    }
  } else {
    if (env.NODE_ENV === 'production') {
      console.error('❌ FATAL: ENCRYPTION_KEY is required in production');
      console.error('Reason: Compliance requirement (GDPR, SOC2) - sensitive data must be encrypted at rest');
      process.exit(1);
    } else {
      console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in development environment');
      console.warn('Sensitive data encryption will be disabled. This is acceptable for development only.');
    }
  }

  return {
    ...env,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
  };
}

export const env = validateEnv();
