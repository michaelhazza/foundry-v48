# System Architecture Documentation

## Version Reference
- **This Document**: 02-ARCHITECTURE.md v1.0
- **Linked Documents**:
  - agent-0-constitution.md
  - scope-manifest.json

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Decision Records](#architecture-decision-records)
4. [Directory Structure](#directory-structure)
5. [Database Configuration](#database-configuration)
6. [Middleware Stack](#middleware-stack)
7. [Error Response Format](#error-response-format)
8. [Environment Validation Pattern](#environment-validation-pattern)
9. [Soft Delete Cascade Implementation](#soft-delete-cascade-implementation)
10. [Health Check Implementation](#health-check-implementation)
11. [CORS Configuration](#cors-configuration)
12. [File Upload Implementation](#file-upload-implementation)
13. [Security Patterns](#security-patterns)

---

## System Overview

### Application Purpose

Foundry is a data preparation and de-identification platform that enables non-technical users to transform raw data sources (files, APIs, databases) into clean, AI-ready datasets with privacy-preserving transformations.

### Core Capabilities

- **Multi-tenant Organization Isolation**: Complete data isolation per organization with organisationId filtering
- **Source-Agnostic Processing**: Files, APIs, and databases flow through identical pipeline
- **Schema-First Normalization**: Output structure determined by canonical schemas, not source format
- **Privacy-by-Design**: De-identification as first-class feature with traceable lineage
- **Configuration-Over-Code**: Projects defined through UI configuration, no custom development required

### Architectural Invariants

1. **Source-Agnostic Processing**: All data sources pass through identical pipeline regardless of origin
2. **Schema-First Normalization**: Canonical schemas determine output structure independently of source format
3. **Configuration-Over-Code**: Projects are configuration-driven, enabling non-technical users
4. **Privacy-by-Design**: De-identification with traceable lineage is built-in, not bolted-on

---

## Technology Stack

### Backend

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM (^0.38.0) with @neondatabase/serverless driver (^0.10.0)
- **Authentication**: JWT-based (access + refresh tokens)
- **Validation**: Zod
- **Type Safety**: TypeScript (strict mode)

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

### Development

- **Port Configuration**:
  - Development frontend (Vite): 5000
  - Development backend (Express): 3001
  - Production (Express serves both): 5000
- **Database Migrations**: Drizzle Kit
- **Linting**: ESLint
- **Formatting**: Prettier

---

## Architecture Decision Records

### ADR-001: Multi-Tenant Isolation Strategy

**Context**: Platform must support multiple organizations with complete data isolation.

**Decision**: Organisation-scoped filtering at query level using organisationId foreign key on all tenant-scoped tables.

**Implementation**:
- All tenant-scoped entities include `organisationId` foreign key
- Every query filters by `organisationId` extracted from authenticated user's JWT
- Database-level row-level security policies enforce isolation
- UI enforces organisation context through authenticated session

**Rationale**: Query-level filtering provides flexibility while maintaining strict isolation. Alternative approaches (separate databases, separate schemas) add operational complexity without security benefit.

**Status**: Accepted

---

### ADR-002: Soft Delete Pattern with Cascade Behavior

**Context**: Data retention requirements mandate audit trail preservation while supporting user-initiated deletion.

**Decision**: Soft delete with `deletedAt` timestamp and automatic cascade to child entities.

**Implementation**:
- All entities include `deletedAt` timestamp (nullable)
- Deletion sets `deletedAt = NOW()` instead of hard delete
- Child entities auto-cascade soft delete when parent is deleted
- Query filters include `WHERE deletedAt IS NULL` by default
- Special endpoints for viewing deleted items (admin only)

**Cascade Rules**:
```
Organisation → cascades to → Users, Projects
Project → cascades to → Sources, ProcessingJobs, Datasets
Source → no cascade (independent lifecycle)
ProcessingJob → cascades to → Datasets
```

**Rationale**: Preserves audit trail for compliance while maintaining referential integrity. Hard deletes prevent recovery and complicate audit requirements.

**Status**: Accepted

---

### ADR-003: Authentication Strategy

**Context**: Secure user authentication with session management across web and mobile clients.

**Decision**: JWT-based authentication with access + refresh token pattern.

**Implementation**:
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- HttpOnly secure cookies for refresh tokens
- Bearer token in Authorization header for access tokens
- Token payload includes: userId, organisationId, role

**Token Storage**:
- Access token: localStorage (short TTL acceptable risk)
- Refresh token: HttpOnly cookie (prevents XSS)

**Rationale**: JWTs are stateless, scalable, and widely supported. Dual-token pattern balances security (short access token) with UX (long refresh token).

**Status**: Accepted

---

### ADR-004: Port Configuration (Development vs Production)

**Context**: Development requires separate frontend (Vite) and backend (Express) servers, while production runs unified deployment.

**Decision**:
- **Development**:
  - Frontend (Vite): PORT 5000 (proxies /api to backend)
  - Backend (Express): PORT 3001
- **Production**:
  - Express serves both SPA and API: PORT 5000
  - Bind to 0.0.0.0 for container deployments

**Implementation**:
- `vite.config.ts` includes proxy configuration: `/api → http://localhost:3001`
- Production build serves static frontend from `dist/` via Express
- Environment variable `PORT` controls external listen port (default: 5000)

**Rationale**: Vite dev server provides hot reload for frontend development. Production unified deployment simplifies infrastructure and reduces latency.

**Status**: Accepted

---

### ADR-005: CORS Configuration (Development vs Production)

**Context**: Cross-origin requests required in development (Vite on 5000, Express on 3001). Production requires explicit origin restriction.

**Decision**:
- **Development**: Use `origin: true` (reflect request origin) for local development flexibility
- **Production**: Use explicit `APP_URL` environment variable as CORS origin

**Never Use**: Literal wildcard string `origin: '*'` is forbidden in all environments.

**Implementation**:
```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : true, // Reflect request origin in development
  credentials: true
};
```

**Rationale**: Reflects request origin (`origin: true`) allows development flexibility while explicit APP_URL in production prevents CSRF and maintains security posture.

**Status**: Accepted

---

### ADR-006: Encryption at Rest Strategy

**Context**: Platform handles PII and sensitive data (customer identifiers, commercial sensitive information) requiring compliance with GDPR and SOC2.

**Decision**: Field-level AES-256-GCM encryption for specific sensitive fields before database storage.

**Encrypted Fields**:
- Source data that contains PII before de-identification
- Customer identifiers in metadata
- Commercial sensitive information flagged by user

**NOT Encrypted**:
- Already de-identified/anonymized data
- Non-sensitive metadata (project names, timestamps)
- Derived datasets (post-processing output)

**Implementation**:
- `ENCRYPTION_KEY` environment variable (conditionally required)
- `server/lib/encryption.ts` provides encrypt/decrypt utilities
- Service layer handles encryption before DB write
- Query layer handles decryption after DB read

**Key Management**:
- Production: ENCRYPTION_KEY must be present (startup fails if missing)
- Development: ENCRYPTION_KEY optional (warns if missing, continues)
- Key rotation: Not in MVP scope

**Rationale**: Field-level encryption targets sensitive data only, reducing performance overhead. AES-256-GCM provides authenticated encryption preventing tampering.

**Important**: This is encryption for data **at rest**, not de-identification. De-identification (masking, hashing, redaction) happens during processing and is irreversible.

**Status**: Accepted

---

### ADR-007: Database Driver Configuration (Development vs Production)

**Context**: Drizzle ORM supports multiple PostgreSQL drivers. Development and production environments have different requirements.

**Decision**:
- **Development**: Use standard `pg` driver (node-postgres) for local PostgreSQL
- **Production**: Use `@neondatabase/serverless` driver (^0.10.0) for serverless/edge deployments

**Configuration** (`server/db/index.ts`):
```typescript
import { drizzle } from 'drizzle-orm/node-postgres'; // Development
// OR
import { drizzle } from 'drizzle-orm/neon-http'; // Production (Neon)
```

**Drizzle Kit Configuration** (`drizzle.config.ts`):
```typescript
export default {
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  dialect: 'postgresql', // REQUIRED field
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
};
```

**Critical Requirements**:
1. Schema imports must NOT include `.js` extensions (use `./server/db/schema` not `./server/db/schema.js`)
2. `dialect: 'postgresql'` field is REQUIRED in drizzle.config.ts
3. Driver version must match Drizzle ORM peer dependency: @neondatabase/serverless ^0.10.0

**Rationale**: Standard pg driver works well for local development. Neon driver optimizes for serverless with connection pooling and HTTP-based queries.

**Status**: Accepted

---

### ADR-008: Dependency Version Management

**Context**: Package version conflicts cause build failures and runtime errors.

**Decision**: Use semantic versioning with caret ranges (^) for minor/patch flexibility, pin exact versions for critical security dependencies.

**Rules**:
1. **Drizzle Ecosystem**: Pin compatible versions
   - drizzle-orm: ^0.38.0
   - drizzle-kit: ^0.30.0
   - @neondatabase/serverless: ^0.10.0 (peer dependency requirement)

2. **Framework Dependencies**: Caret ranges for flexibility
   - react: ^18.3.0
   - express: ^4.21.0

3. **Security Dependencies**: Exact pins for audit trail
   - jsonwebtoken: 9.0.2
   - bcryptjs: 2.4.3

4. **Pre-Specification Compatibility Check**: Run `npm install --dry-run` to validate versions before committing to specification

**Lock File Management**:
- Commit `package-lock.json` to repository
- Run `npm ci` in CI/CD (not `npm install`)
- Update lock file with `npm update` only when explicitly upgrading

**Rationale**: Caret ranges allow automated security patches while maintaining compatibility. Exact pins for security-critical packages create audit trail. Dry-run validation catches conflicts early.

**Status**: Accepted

---

## Directory Structure

```
/
├── server/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── index.ts                 # Schema barrel export
│   │   │   ├── organisations.ts
│   │   │   ├── users.ts
│   │   │   ├── projects.ts
│   │   │   ├── sources.ts
│   │   │   ├── processingJobs.ts
│   │   │   ├── datasets.ts
│   │   │   └── canonicalSchemas.ts
│   │   ├── migrations/                  # Drizzle migrations
│   │   ├── index.ts                     # Database connection setup
│   │   └── migrate.ts                   # Migration runner
│   ├── lib/
│   │   ├── env.ts                       # Environment variable validation
│   │   ├── auth.ts                      # JWT utilities
│   │   ├── encryption.ts                # AES-256-GCM encryption (if ENCRYPTION_KEY present)
│   │   ├── config.ts                    # Application configuration
│   │   └── logger.ts                    # Winston logger setup
│   ├── middleware/
│   │   ├── auth.ts                      # Authentication middleware
│   │   ├── cors.ts                      # CORS configuration
│   │   ├── errorHandler.ts              # Global error handler
│   │   ├── validation.ts                # Zod validation middleware
│   │   └── upload.ts                    # Multer file upload middleware
│   ├── routes/
│   │   ├── index.ts                     # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── organisations.routes.ts
│   │   ├── users.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── sources.routes.ts
│   │   ├── processing.routes.ts
│   │   ├── datasets.routes.ts
│   │   ├── schemas.routes.ts
│   │   └── health.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── organisation.service.ts
│   │   ├── user.service.ts
│   │   ├── project.service.ts
│   │   ├── source.service.ts
│   │   ├── processing.service.ts
│   │   ├── dataset.service.ts
│   │   ├── schema.service.ts
│   │   └── invite.service.ts
│   └── index.ts                         # Express app entry point
├── client/
│   ├── src/
│   │   ├── pages/                       # Route components
│   │   ├── components/                  # Reusable UI components
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # API client, utilities
│   │   ├── types/                       # TypeScript types
│   │   └── main.tsx                     # React entry point
│   ├── index.html
│   └── vite.config.ts
├── scripts/
│   ├── run-all-gates.sh                 # Master verification script
│   └── verify-*.sh                      # Individual verification gates
├── docs/
│   ├── scope-manifest.json
│   ├── env-manifest.json
│   ├── data-relationships.json
│   ├── service-contracts.json
│   ├── ui-api-deps.json
│   ├── build-gate-results.json
│   ├── build-transcript.md
│   └── 02-ARCHITECTURE.md               # This file
├── .env.example                         # Environment template
├── .env                                 # Local environment (git-ignored)
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── README.md
```

---

## Database Configuration

### Drizzle ORM Setup

**Installation**:
```bash
npm install drizzle-orm@^0.38.0 @neondatabase/serverless@^0.10.0
npm install -D drizzle-kit@^0.30.0
```

**Configuration File** (`drizzle.config.ts`):
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  dialect: 'postgresql', // REQUIRED field
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
} satisfies Config;
```

### Database Connection Setup

**Development** (`server/db/index.ts`):
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
```

**Production (Neon)** (`server/db/index.ts`):
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Migration Management

**Generate Migration**:
```bash
npm run db:generate
# Runs: drizzle-kit generate
```

**Apply Migration**:
```bash
npm run db:migrate
# Runs: tsx server/db/migrate.ts
```

**Migration Runner** (`server/db/migrate.ts`):
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './server/db/migrations' });
  console.log('Migrations complete');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

---

## Middleware Stack

The Express middleware stack MUST be applied in this exact order for correct behavior:

```
Request
  ↓
1. CORS Middleware (cors.ts)
  ↓
2. Body Parsers (express.json, express.urlencoded)
  ↓
3. Authentication Middleware (auth.ts) [protected routes only]
  ↓
4. File Upload Middleware (upload.ts) [upload endpoints only]
  ↓
5. Request Validation (validation.ts) [validated routes only]
  ↓
6. Route Handlers (routes/*.ts)
  ↓
7. Error Handler (errorHandler.ts)
  ↓
Response
```

### Position Rationale

1. **CORS First**: Must handle preflight OPTIONS requests before any other middleware
2. **Body Parser Second**: Parse request body for downstream middleware and validation
3. **Auth Third**: Authenticate user, attach to req.user for authorization checks
4. **Upload Fourth (after auth)**: File uploads should be authenticated to prevent abuse
5. **Validation Fifth**: Validate already-parsed, authenticated requests
6. **Routes Sixth**: Business logic with fully authenticated, validated requests
7. **Error Handler Last**: Catch all errors from any previous middleware

### Implementation Example

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import { corsOptions } from './middleware/cors';
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// 1. CORS
app.use(cors(corsOptions));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3-6. Routes (auth and validation applied per-route)
app.use('/api', routes);

// 7. Error Handler (MUST be last)
app.use(errorHandler);
```

---

## Error Response Format

All API errors MUST return responses in this standardized JSON format:

```typescript
{
  "error": {
    "code": string,          // Machine-readable error code (e.g., "AUTH_INVALID_TOKEN")
    "message": string,       // Human-readable error message
    "details": object | null // Optional additional context
  }
}
```

### HTTP Status Code Mapping

| Status | Code Prefix | Example Codes |
|--------|-------------|---------------|
| 400 | VALIDATION_ | VALIDATION_INVALID_EMAIL, VALIDATION_REQUIRED_FIELD |
| 401 | AUTH_ | AUTH_INVALID_TOKEN, AUTH_EXPIRED_TOKEN, AUTH_MISSING_TOKEN |
| 403 | PERMISSION_ | PERMISSION_DENIED, PERMISSION_INSUFFICIENT_ROLE |
| 404 | NOT_FOUND_ | NOT_FOUND_PROJECT, NOT_FOUND_USER |
| 409 | CONFLICT_ | CONFLICT_DUPLICATE_EMAIL, CONFLICT_RESOURCE_EXISTS |
| 429 | RATE_LIMIT_ | RATE_LIMIT_EXCEEDED |
| 500 | SERVER_ | SERVER_INTERNAL_ERROR, SERVER_DATABASE_ERROR |

### Implementation Example

```typescript
// server/middleware/errorHandler.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'SERVER_INTERNAL_ERROR';
  
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || 'Internal server error',
      details: err.details || null
    }
  });
};
```

### Custom Error Classes

```typescript
// server/lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTH_INVALID_TOKEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `NOT_FOUND_${resource.toUpperCase()}`, `${resource} not found`);
  }
}
```

---

## Environment Validation Pattern

All environment variables MUST be validated at application startup in `server/lib/env.ts`. The validation layer provides type safety and fail-fast behavior.

### Implementation Pattern

```typescript
// server/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required variables
  DATABASE_URL: z.string()
    .startsWith('postgresql://', 'DATABASE_URL must start with postgresql://'),
  
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  
  APP_URL: z.string()
    .url('APP_URL must be a valid URL')
    .refine((url) => !url.endsWith('/'), 'APP_URL must not have trailing slash'),
  
  // Optional variables with defaults
  PORT: z.string().default('5000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  MAX_FILE_SIZE_MB: z.string().default('100'),
  SOURCE_RETENTION_DAYS: z.string().default('30'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

// Conditionally required variables handling
const encryptionKeySchema = z.string()
  .length(64, 'ENCRYPTION_KEY must be exactly 64 hexadecimal characters')
  .regex(/^[0-9a-f]{64}$/i, 'ENCRYPTION_KEY must be valid hexadecimal');

function validateEnv() {
  // Validate base environment
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
    // Missing ENCRYPTION_KEY handling
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

// Export validated environment
export const env = validateEnv();
```

### Three-Category Handling

| Category | Behavior When Missing |
|----------|----------------------|
| **required** | Always fail startup with error |
| **conditionallyRequired** | Production: Fail startup. Development/Test: Warn only |
| **optional** | Use default value, never fail |

---

## Soft Delete Cascade Implementation

Soft delete behavior must cascade from parent to child entities following the cascade rules in ADR-002.

### Implementation Pattern

```typescript
// server/services/project.service.ts
import { db } from '../db';
import { projects, sources, processingJobs, datasets } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function softDeleteProject(projectId: string, organisationId: string) {
  const now = new Date();
  
  // Soft delete the project
  await db.update(projects)
    .set({ deletedAt: now })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organisationId, organisationId),
        isNull(projects.deletedAt)
      )
    );
  
  // Cascade soft delete to processing jobs
  await db.update(processingJobs)
    .set({ deletedAt: now })
    .where(
      and(
        eq(processingJobs.projectId, projectId),
        isNull(processingJobs.deletedAt)
      )
    );
  
  // Cascade soft delete to datasets (via processing jobs)
  await db.update(datasets)
    .set({ deletedAt: now })
    .where(
      and(
        eq(datasets.projectId, projectId),
        isNull(datasets.deletedAt)
      )
    );
  
  // Note: Sources are NOT cascaded (independent lifecycle per ADR-002)
}
```

### Query Filtering Pattern

All queries MUST filter out soft-deleted records by default:

```typescript
// Default query - excludes soft deleted
const activeProjects = await db.select()
  .from(projects)
  .where(
    and(
      eq(projects.organisationId, organisationId),
      isNull(projects.deletedAt) // CRITICAL: Always include
    )
  );

// Admin query - include soft deleted
const allProjects = await db.select()
  .from(projects)
  .where(eq(projects.organisationId, organisationId));
  // No deletedAt filter
```

### Restore Pattern

```typescript
export async function restoreProject(projectId: string, organisationId: string) {
  await db.update(projects)
    .set({ deletedAt: null })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organisationId, organisationId)
      )
    );
  
  // Note: Child entities remain deleted and must be restored explicitly if needed
}
```

---

## Health Check Implementation

The `/health` endpoint MUST verify database connectivity with timeout thresholds and connection pool handling.

### Implementation Pattern

```typescript
// server/routes/health.routes.ts
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
      setTimeout(() => reject(new Error('Database query timeout')), 5000); // 5 second timeout
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
```

### Health Check Response Format

**Healthy** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-02-08T10:30:00.000Z",
  "uptime": 3600.5,
  "responseTime": "45ms",
  "checks": {
    "database": {
      "status": "connected",
      "latency": "12ms",
      "error": null
    }
  }
}
```

**Unhealthy** (503 Service Unavailable):
```json
{
  "status": "unhealthy",
  "timestamp": "2024-02-08T10:30:00.000Z",
  "uptime": 3600.5,
  "responseTime": "5002ms",
  "checks": {
    "database": {
      "status": "disconnected",
      "latency": null,
      "error": "Database query timeout"
    }
  }
}
```

### Connection Pool Handling

For production deployments with connection pooling:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000 // Fail after 5 seconds
});

// Health check should test pool connectivity
const client = await pool.connect();
try {
  await client.query('SELECT 1');
  dbConnected = true;
} finally {
  client.release();
}
```

---

## CORS Configuration

CORS configuration must distinguish between development and production environments per ADR-005.

### Production Implementation

**NEVER use literal wildcard** (`origin: '*'`) in production:

```typescript
// server/middleware/cors.ts - CORRECT PRODUCTION
import cors from 'cors';

export const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.APP_URL  // Explicit origin from environment
    : true,                // Reflect request origin in development
  credentials: true,       // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Development Configuration

Development may use `origin: true` (reflect request origin) for flexibility with Vite dev server:

```typescript
// When NODE_ENV !== 'production'
origin: true  // ✅ ALLOWED - reflects request origin
```

### Forbidden Pattern

```typescript
// ❌ NEVER DO THIS
origin: '*'  // Literal wildcard string - FORBIDDEN
```

### Verification

The `verify-no-wildcard-cors.sh` gate checks for literal wildcard string `origin: '*'` only. Using `origin: true` (reflect-origin) in development will pass verification.

---

## File Upload Implementation

File upload functionality requires coordination across multiple layers per Constitution Section AN.

### Middleware Configuration

File upload middleware must be positioned AFTER authentication but BEFORE validation:

```typescript
// server/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import { env } from '../lib/env';

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Create upload middleware with limits from service-contracts.json
export const createUploadMiddleware = (options: {
  allowedMimeTypes: string[];
  maxSizeMb: number;
}) => {
  return multer({
    storage,
    limits: {
      fileSize: options.maxSizeMb * 1024 * 1024 // Convert MB to bytes
    },
    fileFilter: (req, file, cb) => {
      if (options.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${options.allowedMimeTypes.join(', ')}`));
      }
    }
  });
};
```

### Route Implementation Pattern

```typescript
// server/routes/sources.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createUploadMiddleware } from '../middleware/upload';

const router = Router();

// File upload endpoint
const uploadMiddleware = createUploadMiddleware({
  allowedMimeTypes: ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxSizeMb: 100
});

router.post('/sources/upload',
  authenticate,                     // 1. Authenticate first
  uploadMiddleware.single('file'),  // 2. Handle file upload
  async (req, res) => {              // 3. Business logic
    const file = req.file;
    // Store file metadata in database per Agent 3 schema
    // Return response matching Agent 4 contract
  }
);

export default router;
```

### Storage Service Pattern

```typescript
// server/services/storage.service.ts
import { db } from '../db';
import { uploadedFiles } from '../db/schema';
import fs from 'fs/promises';
import path from 'path';

export async function storeUploadedFile(
  file: Express.Multer.File,
  uploadedBy: string
) {
  // Generate storage key
  const storageKey = path.basename(file.path);
  
  // Store metadata in database per Agent 3 schema
  const [stored] = await db.insert(uploadedFiles)
    .values({
      filename: storageKey,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey: storageKey,
      uploadedBy: uploadedBy,
      uploadedAt: new Date()
    })
    .returning();
  
  return stored;
}

export async function deleteUploadedFile(fileId: string) {
  // Get file record
  const [file] = await db.select()
    .from(uploadedFiles)
    .where(eq(uploadedFiles.id, fileId));
  
  if (!file) throw new Error('File not found');
  
  // Delete physical file
  const filePath = path.join('./uploads/', file.storageKey);
  await fs.unlink(filePath);
  
  // Delete database record
  await db.delete(uploadedFiles)
    .where(eq(uploadedFiles.id, fileId));
}
```

---

## Security Patterns

### JWT Token Generation

```typescript
// server/lib/auth.ts
import jwt from 'jsonwebtoken';
import { env } from './env';

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
```

### Authentication Middleware

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { AuthenticationError } from '../lib/errors';

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
```

### Authorization Helpers

```typescript
// server/middleware/auth.ts (continued)
export function authorize(allowedRoles: ('admin' | 'member')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Not authenticated'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'PERMISSION_DENIED', 'Insufficient permissions'));
    }
    
    next();
  };
}

// Usage in routes
router.delete('/users/:id',
  authenticate,
  authorize(['admin']), // Only admins can delete users
  deleteUserHandler
);
```

### Encryption Utilities

```typescript
// server/lib/encryption.ts (generated only if ENCRYPTION_KEY present)
import crypto from 'crypto';
import { env } from './env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function encrypt(text: string): string {
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }
  
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }
  
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const [ivHex, tagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## End of Architecture Documentation

This architecture document provides implementation guidance for Agent 6 (Implementation Orchestrator) and serves as a reference for development and deployment decisions.

For questions or clarifications, refer to:
- **scope-manifest.json**: Business requirements and entity contracts
- **agent-0-constitution.md**: Framework rules and governance
- **env-manifest.json**: Environment variable specifications
