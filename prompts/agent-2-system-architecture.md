# Agent 2: System Architecture Agent

## Version Reference
- **This Document**: agent-2-system-architecture.md v44
- **Linked Documents**:
 - agent-0-constitution.md

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 44 | 2026-02 | **Production Build Feedback Integration (Implementation Patterns):** Applied learnings from Foundry v47 build (Issues #4, #12, #13). Added implementation layer to Architecture doc for patterns Claude Code needs. (1) **Added .env.example to output artifacts:** Generated from env-manifest.json to satisfy gate requirements and provide developer onboarding template. (2) **Added Middleware Stack section:** Explicit ordering diagram with rationale for each position (CORS → body parser → auth → validation → routes → error handler). (3) **Added Soft Delete Cascade Implementation:** Concrete code patterns for cascade behavior (auto-soft-delete children, query filtering with deletedAt). (4) **Added Error Response Format:** Standardized JSON structure for all error types with field specifications. (5) **Added Health Check DB Connectivity:** Implementation pattern with timeout thresholds and connection pool handling. (6) **Added File Upload Middleware Placement:** Stack position guidance (after auth, before validation) and multipart handling. Addresses "Architecture doc has great patterns but missing critical details" feedback. Provides Claude Code with unambiguous implementation contracts without losing application-agnosticism. |
| 43 | 2026-02 | Fixed @neondatabase/serverless version inconsistency: Dependency Requirements section now specifies ^0.10.0 (was ^0.9.0), matching the ADR and drizzle-orm peer dependency requirement. |
| 42 | 2026-02 | Added CORS configuration rule to ADR guidance (distinguishes literal wildcard `origin: '*'` from reflect-origin `origin: true`). Enhanced PORT cross-consistency rule with multi-service development setup guidance (primary external port vs backend API port). Updated PORT usage description for clarity in dual-server configurations (e.g., Vite + Express). Updated CORS gate to check for literal wildcard string only. Prevents CORS and PORT documentation ambiguity. |
| 41 | 2026-02 | Added Pre-Specification Compatibility Check to Dependency Management Standards. Includes npm install --dry-run validation pattern, explicit peer dependency verification guidance, and ADR template for dependency version decisions. Prevents package version conflicts before they reach build phase. |
| 40 | 2026-02 | Added database configuration standards for multi-environment deployments. Includes Drizzle Kit configuration requirements (dialect field), environment-specific driver selection (pg vs Neon), schema import standards (no .js extensions), and health check database verification. |
| 39 | 2026-02 | Added dependency management standards. Includes version pinning requirements (semantic versioning with caret ranges), conflict prevention protocols, lock file management, and Architecture Decision Log template for dependencies. |
| 38 | 2026-02 | Fixed 02-ARCHITECTURE.md Version Reference template: filename now includes .md extension (02-ARCHITECTURE.md v1.0) for consistency with Constitution Section Y filename requirement. |
| 37 | 2026-02 | Added 02-ARCHITECTURE.md Version Reference block requirement. Added conditionallyRequired runtime enforcement rule (fail in production when condition applies, warn-only in development). Added Environment Validation Pattern guidance section with explicit handling for conditionallyRequired variables. |
| 36 | 2026-02 | Governance reform: Replaced version-pinned dependencies with file-linked references per Constitution v7.0 Section Y. No structural changes. |
| 35 | 2026-02 | Added PORT cross-consistency rule: env-manifest PORT default must match production binding port in architecture ADR. Added env-manifest PORT guidance with multi-environment usage description. Added scope-manifest deference rule: architecture must not invent domain-specific names (e.g., canonical schema defaults) that originate from the scope-manifest. |
| 34 | 2026-02 | Added ADR port documentation rule (dev vs prod must be explicit). Added forward-reference attribution rule (enforcement mechanisms not yet generated must name the generating agent). Added encryption-vs-deidentification boundary clarification in Encryption Architecture guidance. |
| 33 | 2026-02 | Resolved ENCRYPTION_KEY contradiction: moved to conditionallyRequired with explicit trigger. Added APP_URL to required with full 6-field schema. Parameterised server port in health check gate. Strengthened script output guard. Fixed hygiene gate wording. |
| 32 | 2026-02 | Updated to Constitution v6.0 (subsequently pinned to v6.1). 02-ARCHITECTURE.md retained as sole human-readable spec (justified exception per Section AL Rule 3). No structural changes to outputs. |
| 31 | 2026-02 | FILE OUTPUT MANIFEST added per Constitution Section AK. |

---

## FILE OUTPUT MANIFEST

**Execution context:** GPT (specification agent). Output to `docs/` only.

| File | Path | Type | Required |
|------|------|------|----------|
| System Architecture | docs/02-ARCHITECTURE.md | Human-readable | NO (recommended) |
| Environment Manifest | docs/env-manifest.json | Machine artifact | YES |
| Environment Example | .env.example | Developer template | YES |

**Section AL Exception:** 02-ARCHITECTURE.md is retained because it contains ADRs, directory structure templates, and configuration guidance that do not map well to JSON. It is NOT a required build artifact - Claude Code can build without it - but it provides valuable context for implementation decisions.

**.env.example Generation (v44):** Generated from env-manifest.json to provide developer onboarding template and satisfy gate requirements. Contains all required and conditionallyRequired variables with placeholder values and usage comments. Located at repo root (not docs/) per standard convention.

**IMPORTANT - OUTPUT BOUNDARY:** This agent outputs ONLY the three files listed above. The bash script blocks in this document are **specifications for Agent 6 to extract and generate** as `scripts/verify-*.sh` files during the build. This agent MUST NOT create script files.

**FILE DELIVERY REQUIREMENT:** Every file listed above MUST be prepared as a downloadable file and presented to the user for download. Do NOT output file contents as inline code blocks in the chat - always create the actual file and offer it for download. If the platform supports file creation (e.g., ChatGPT file output, Claude artifacts), use that mechanism. The user should receive a clickable download link, not a code block they have to manually copy into a file.

---

## SECTION 1: ENVIRONMENT VARIABLES MANIFEST (SCHEMA LOCKED TO CONSTITUTION)

**File:** `docs/env-manifest.json`

**CRITICAL:** Each variable in `required[]` MUST include ALL 6 fields mandated by Constitution Section AJ.

### Schema

```json
{
 "$schema": "env-manifest-v1",
 "required": [
 {
 "name": "DATABASE_URL",
 "usage": "PostgreSQL connection string",
 "validation": "Must start with postgresql://",
 "validatedInFile": "server/lib/env.ts",
 "usedInFiles": ["server/db/index.ts"],
 "whyRequired": "Core database connectivity required for all operations"
 },
 {
 "name": "JWT_SECRET",
 "usage": "JWT signing key for access/refresh tokens",
 "validation": "Minimum 32 characters",
 "validatedInFile": "server/lib/env.ts",
 "usedInFiles": ["server/lib/auth.ts", "server/middleware/auth.ts"],
 "whyRequired": "Authentication security - tokens must be cryptographically signed"
 },
 {
 "name": "APP_URL",
 "usage": "Canonical application URL for CORS origin and callback URLs",
 "validation": "Must be a valid URL with scheme (e.g., https://app.example.com). No trailing slash.",
 "validatedInFile": "server/lib/env.ts",
 "usedInFiles": ["server/middleware/cors.ts", "server/lib/config.ts"],
 "whyRequired": "CORS origin must be explicit in production - wildcard is forbidden"
 }
 ],
 "conditionallyRequired": [
 {
 "name": "ENCRYPTION_KEY",
 "condition": "Required when the application stores or processes sensitive/PII data that must be encrypted at rest. Omit entirely if no fields require encryption.",
 "usage": "AES-256-GCM encryption for sensitive PII data",
 "validation": "Must be 32 bytes (64 hex chars)",
 "validatedInFile": "server/lib/env.ts",
 "usedInFiles": ["server/lib/encryption.ts"],
 "whyRequired": "Sensitive data must be encrypted at rest per compliance requirements"
 }
 ],
 "optional": [
 {
 "name": "PORT",
 "default": "5000",
 "usage": "Primary HTTP server listen port (externally-facing). Production: Express serves both SPA and API on this port (bound to 0.0.0.0). Development: When using dual-server setup (e.g., Vite + Express), PORT is the frontend dev server port (e.g., Vite on 5000) while the backend API runs on a different port (e.g., Express on 3001, not controlled by PORT). Frontend proxies /api requests to backend. Specify both ports in ADR when using multi-service development."
 },
 {
 "name": "LOG_LEVEL",
 "default": "info",
 "usage": "Logging verbosity (debug, info, warn, error)"
 }
 ]
}
```

### Section-Level Rules

**`required[]`** - Always present. Each variable uses the 6-field schema from Constitution Section AJ. Build fails if any are missing at startup.

**`conditionallyRequired[]`** - Present only when their `condition` is true for the application. Uses the same 6-field schema plus a `condition` field. When present, treated identically to `required[]` at runtime. When the condition does not apply, the variable and all associated code (e.g., encryption.ts) MUST be omitted entirely.

**`optional[]`** - Have sensible defaults. May use a reduced schema (name, default, usage).

### conditionallyRequired Runtime Enforcement Rule

Variables in `conditionallyRequired[]` have different enforcement based on environment:

| Environment | Behaviour When Missing | Rationale |
|-------------|------------------------|-----------|
| **Production** (`NODE_ENV=production`) | **Fail startup** with clear error message | Production deployments must have all security-critical configuration |
| **Development** (`NODE_ENV=development`) | **Warn only** - log warning but continue | Allows local dev without full security setup |
| **Test** (`NODE_ENV=test`) | **Warn only** - log warning but continue | Test suites may not need encryption |

**Implementation guidance for env.ts:** When a variable is in `conditionallyRequired[]` and present in the application's env-manifest (meaning the condition applies), the validation code MUST:
1. Check if the variable is present
2. If missing AND `NODE_ENV === 'production'`: throw an error that halts startup
3. If missing AND `NODE_ENV !== 'production'`: log a warning with the `whyRequired` text and continue

This prevents silent security gaps in production while allowing development convenience.

### Cross-Consistency Rules

**PORT default must match architecture:** The `PORT` variable's `default` value in env-manifest.json MUST match the production binding port documented in the architecture ADR for server binding. If the architecture says "Express serves on port 5000 in production", then `PORT.default` MUST be `"5000"`. A mismatch causes Agent 6 to generate conflicting run scripts or deployment configuration. The `usage` description MUST clarify both development and production behaviour to prevent ambiguity. **Multi-service development setups:** When development uses multiple services on different ports (e.g., Vite frontend on 5000, Express backend on 3001), the PORT variable represents the primary external-facing port (frontend), and the backend port should be specified either as a constant in the ADR or as a separate optional environment variable (e.g., API_PORT with default 3001). The env-manifest `usage` description must explicitly state: which service runs on PORT, which service runs on the secondary port, and how requests are routed between them (e.g., frontend proxies /api to backend).

**Scope-manifest deference:** When the architecture document references domain-specific concepts that originate from the scope-manifest (e.g., canonical schema names, entity names, processing stages), it MUST use the exact names from the scope-manifest. The architecture MUST NOT invent alternative names or introduce naming that differs from the scope-manifest's declared entities and contracts. If the scope-manifest has not yet been provided, use generic placeholders rather than inventing domain-specific terms.

---

## SECTION 2: ARCHITECTURE DOCUMENT CONTENT (02-ARCHITECTURE.md)

When producing 02-ARCHITECTURE.md, include:

**0. Version Reference Block (MANDATORY)**

The 02-ARCHITECTURE.md file MUST begin with a Version Reference block immediately after the document title. Even though this file is "non-required" for the build, it is a governed framework document and must comply with Constitution Section Y.

**Template:**
```markdown
# System Architecture

## Version Reference
- **This Document**: 02-ARCHITECTURE.md v1.0
- **Linked Documents**:
 - env-manifest.json

## Document Purpose
...
```

The version number starts at v1.0 for new applications. Increment when ADRs change.

**1. Architecture Decision Records (ADRs)** - numbered decisions (binding address, port config, ORM choice, auth strategy, etc.)
 - **Port configuration rule:** When the application uses different port assignments in development vs production (e.g., Vite dev server on one port, Express on another), the ADR MUST document both modes explicitly and unambiguously. State which process binds to which port in each environment. Do not describe a single port and then introduce a second port mid-paragraph - this creates contradictions that cause Agent 6 to generate conflicting start scripts or CORS defaults. When multiple services run on different ports in development, specify which port is considered the "primary" external port (typically the frontend dev server).
 - **CORS configuration rule:** When documenting CORS configuration, the ADR MUST distinguish between `origin: '*'` (literal wildcard string, FORBIDDEN in all environments) and `origin: true` (reflect request origin header, ALLOWED in development only). Development environments using `origin: true` should clearly state this is for local convenience and that production MUST use explicit origin(s) from environment variables (e.g., APP_URL). This prevents confusion about "wildcard is forbidden" applying to both patterns.
 - **Forward-reference attribution rule:** When an ADR references an enforcement mechanism that does not yet exist at the Agent 2 phase (e.g., a verification gate, a script, a runtime check), the ADR MUST attribute it to the agent that will generate it. Use the phrase: "Enforced by [Agent N] generated [mechanism] during [phase]." This prevents intermediate readers from assuming the mechanism is already present.

**2. Directory Structure Template** - canonical file layout for server/ and client/

**3. Required Config Files** - Tailwind, PostCSS, Vite, TypeScript configs as applicable

**4. Health Check Specification** - endpoint path, DB connectivity check, response schema

**5. CORS Production Defaults** - APP_URL required for explicit origin(s). Literal wildcard string `origin: '*'` is FORBIDDEN in all environments. Development may use `origin: true` (reflect request origin) for local convenience, but production MUST use explicit origins from APP_URL or similar environment variables.

**6. Encryption Architecture** - when ENCRYPTION_KEY is in `conditionallyRequired[]` and the condition applies: encryption.ts MUST exist and be used. When the condition does not apply: ENCRYPTION_KEY MUST be absent and no encryption code generated
 - **Encryption-vs-deidentification boundary:** The ADR covering encryption MUST clearly distinguish between two separate concerns: (a) encryption at rest, which protects sensitive raw/source data and configuration values within the retention window and is reversible via decrypt; and (b) de-identification, which produces irreversible outputs in datasets (mask, hash, redact, tokenise, drop). The ADR MUST state that dataset outputs should not require decryption of PII because PII should already be removed or irreversibly transformed during processing. This prevents downstream agents from building decrypt paths for dataset reads.

**7. Upload MIME Architecture** - MIME validation required, magic number optional

**8. Environment Validation Pattern** - Include a code example showing how `server/lib/env.ts` should validate environment variables, with explicit handling for:
 - `required[]` variables: always fail if missing
 - `conditionallyRequired[]` variables: fail in production, warn in development
 - `optional[]` variables: use defaults

**This document is for human and Claude Code reference. It is NOT a required build artifact.**

---

## SECTION 3: ENVIRONMENT VALIDATION PATTERN

The 02-ARCHITECTURE.md MUST include an environment validation pattern that correctly handles all three variable categories. This pattern is critical because it determines runtime behaviour.

**Reference implementation:**

```typescript
// server/lib/env.ts
import { z } from 'zod';

// Base schema for always-required variables
const baseSchema = z.object({
  DATABASE_URL: z.string().startsWith('postgresql://'),
  JWT_SECRET: z.string().min(32),
  APP_URL: z.string().url().refine(url => !url.endsWith('/'), 'No trailing slash'),
  PORT: z.string().default('5000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse base schema first
const baseEnv = baseSchema.parse(process.env);

// Conditionally required: ENCRYPTION_KEY
// - Production: MUST be present (fail if missing)
// - Development/Test: SHOULD be present (warn if missing)
let ENCRYPTION_KEY: string | undefined;

if (process.env.ENCRYPTION_KEY) {
  if (process.env.ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }
  ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
} else if (baseEnv.NODE_ENV === 'production') {
  throw new Error(
    'ENCRYPTION_KEY is required in production. ' +
    'Reason: Sensitive data must be encrypted at rest per compliance requirements.'
  );
} else {
  console.warn(
    '[WARN] ENCRYPTION_KEY not set - source file encryption disabled. ' +
    'This is acceptable in development but MUST be set in production.'
  );
}

export const env = {
  ...baseEnv,
  ENCRYPTION_KEY,
};
```

**Key points this pattern demonstrates:**
1. Required variables use Zod schema and fail immediately if invalid
2. Conditionally required variables are validated separately with environment-aware logic
3. Production mode enforces security requirements strictly
4. Development mode warns but allows startup for convenience
5. The warning message explains WHY the variable matters

---

## SECTION 3A: IMPLEMENTATION PATTERNS (v44 - Production Build Guidance)

This section provides concrete implementation patterns that Claude Code needs to generate correct, unambiguous code. These patterns address gaps identified in production builds where architectural guidance was insufficient.

### 1. Middleware Stack Ordering

**CRITICAL:** Middleware order is not arbitrary. Each position serves a specific purpose and wrong ordering causes runtime failures.

**Standard Stack (Express):**

```typescript
// server/index.ts or server/app.ts

import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/authenticate';
import { validateUuidParams } from './middleware/validateUuid';
import { errorHandler } from './middleware/errorHandler';
import { jsonParseErrorHandler } from './middleware/jsonParseErrorHandler';

const app = express();

// 1. CORS - MUST be first (before body parser)
// Rationale: Preflight requests have no body, must respond immediately
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : true, // Reflect origin in dev
  credentials: true
}));

// 2. Body Parser - MUST be before routes
// Rationale: Routes need req.body populated
app.use(express.json({ limit: '10mb' }));

// 3. JSON Parse Error Handler - MUST be immediately after body parser
// Rationale: Catches malformed JSON before routes see undefined req.body
app.use(jsonParseErrorHandler);

// 4. UUID Validation - MUST be after body parser, before routes
// Rationale: Can validate both params and body UUIDs
app.use(validateUuidParams);

// 5. Routes - Core application logic
app.use('/api', routes);

// 6. Error Handler - MUST be last
// Rationale: Express error middleware requires 4 params (err, req, res, next)
// Must come after all routes to catch errors from any handler
app.use(errorHandler);
```

**File Upload Middleware Placement:**
```typescript
// For endpoints that accept file uploads

import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// Route-specific middleware (not app-level)
router.post('/api/uploads',
  authenticate,           // 1. Auth first (check who you are)
  upload.single('file'),  // 2. File upload (process multipart)
  validateMultipart,      // 3. Validate file + form fields
  uploadController        // 4. Handle upload logic
);
```

**Why This Order Matters:**
- CORS first: Preflight requests bypass body parsing
- Body parser before routes: Routes expect req.body
- JSON error handler immediately after: Prevents undefined body confusion
- UUID validation after parser: Can validate body UUIDs
- Routes in middle: Application logic
- Error handler last: Catches all errors from above

### 2. Soft Delete Cascade Implementation

**Pattern:** When a parent entity is soft-deleted (deletedAt set), automatically soft-delete all child entities.

**Implementation (Service Layer):**

```typescript
// server/services/organisations.service.ts

export async function softDeleteOrganisation(organisationId: string) {
  const now = new Date();
  
  // Begin transaction
  await db.transaction(async (tx) => {
    // 1. Soft delete parent
    await tx.update(organisations)
      .set({ deletedAt: now })
      .where(eq(organisations.id, organisationId));
    
    // 2. Cascade to direct children
    await tx.update(projects)
      .set({ deletedAt: now })
      .where(eq(projects.orgId, organisationId));
    
    await tx.update(users)
      .set({ deletedAt: now })
      .where(eq(users.orgId, organisationId));
    
    // 3. Cascade to nested children (projects -> dataSources)
    const affectedProjects = await tx.select({ id: projects.id })
      .from(projects)
      .where(eq(projects.orgId, organisationId));
    
    const projectIds = affectedProjects.map(p => p.id);
    
    if (projectIds.length > 0) {
      await tx.update(dataSources)
        .set({ deletedAt: now })
        .where(inArray(dataSources.projectId, projectIds));
    }
  });
}
```

**Query Filtering Pattern:**

```typescript
// All queries MUST filter out soft-deleted records

// ✅ CORRECT
export async function listProjects(orgId: string) {
  return db.select()
    .from(projects)
    .where(
      and(
        eq(projects.orgId, orgId),
        isNull(projects.deletedAt)  // Filter soft-deleted
      )
    );
}

// ❌ WRONG - includes soft-deleted records
export async function listProjects(orgId: string) {
  return db.select()
    .from(projects)
    .where(eq(projects.orgId, orgId));
}
```

**Cascade Specification:**
- Read cascade rules from `data-relationships.json` → `softDeleteCascades[]`
- Implement cascades in parent entity's service file
- Use transactions to ensure atomicity
- Set same `deletedAt` timestamp for parent and all children

### 3. Error Response Format

**Standard JSON Structure:** All API errors must return consistent JSON structure.

```typescript
// server/middleware/errorHandler.ts

export interface ErrorResponse {
  error: string;          // Human-readable message
  type: string;           // Error class name (ValidationError, NotFoundError, etc.)
  statusCode: number;     // HTTP status code
  details?: unknown;      // Optional: validation errors, stack trace in dev
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error response
  const response: ErrorResponse = {
    error: err.message || 'Internal server error',
    type: err.constructor.name,
    statusCode: 500
  };
  
  // Typed error handling
  if (err instanceof ValidationError) {
    response.statusCode = 400;
    response.details = err.errors; // Zod validation errors
  } else if (err instanceof UnauthorizedError) {
    response.statusCode = 401;
  } else if (err instanceof ForbiddenError) {
    response.statusCode = 403;
  } else if (err instanceof NotFoundError) {
    response.statusCode = 404;
  } else if (err instanceof ConflictError) {
    response.statusCode = 409;
  }
  
  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      ...(response.details as object || {}),
      stack: err.stack
    };
  }
  
  res.status(response.statusCode).json(response);
}
```

**Error Classes Location:** `server/lib/errors.ts`

```typescript
export class ValidationError extends Error {
  constructor(public errors: unknown) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// ... other error classes
```

### 4. Health Check DB Connectivity

**Specification:** Health endpoint MUST verify database connectivity with timeout threshold.

```typescript
// server/services/health.service.ts

import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function checkHealth() {
  const result: {
    status: 'healthy' | 'unhealthy';
    database: 'connected' | 'disconnected';
    timestamp: string;
    error?: string;
  } = {
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Simple connectivity check with 5-second timeout
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );
    
    const query = db.execute(sql`SELECT 1 as health_check`);
    
    await Promise.race([query, timeout]);
    
    result.database = 'connected';
  } catch (error) {
    result.status = 'unhealthy';
    result.database = 'disconnected';
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return result;
}
```

**Route Handler:**

```typescript
// server/routes/health.routes.ts

import { Router } from 'express';
import { checkHealth } from '../services/health.service';

const router = Router();

router.get('/health', async (req, res) => {
  const health = await checkHealth();
  
  // Return 503 if unhealthy (load balancers use this)
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

export default router;
```

**Why DB Connectivity Matters:**
- Load balancers need to know if instance is healthy
- Database pool exhaustion detection
- Network partition detection
- 5-second timeout prevents hanging health checks

### 5. .env.example Generation Pattern

**Generate from env-manifest.json:**

```bash
#!/bin/bash
# This logic should be implemented by Agent 2 when generating .env.example

cat > .env.example << 'EOF'
# Environment Variables Template
# Generated from env-manifest.json
# Copy to .env and fill in actual values

# =============================================================================
# REQUIRED VARIABLES (must be set)
# =============================================================================

# Database connection string
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT secret for token signing (min 32 characters)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
JWT_SECRET=your_jwt_secret_here

# Application base URL (no trailing slash)
# Production: https://yourapp.com
# Development: http://localhost:5000
APP_URL=http://localhost:5000

# =============================================================================
# CONDITIONALLY REQUIRED (required in production)
# =============================================================================

# Encryption key for sensitive data at rest (64 hex characters = 32 bytes)
# Required when: Application handles PII or sensitive source files
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ENCRYPTION_KEY=your_encryption_key_here

# =============================================================================
# OPTIONAL (have defaults)
# =============================================================================

# Server port (default: 5000)
PORT=5000

# Logging level (default: info)
# Options: debug, info, warn, error
LOG_LEVEL=info

# Node environment (default: development)
# Options: development, production, test
NODE_ENV=development

EOF
```

**Structure Requirements:**
- Group by: REQUIRED → CONDITIONALLY REQUIRED → OPTIONAL
- Include generation commands for secrets
- Show example values (not placeholders like `<your-value-here>`)
- Add usage comments from env-manifest.json
- Location: Repo root (not docs/)

---

## SECTION 4: DEPENDENCY MANAGEMENT

### Version Specification Standards

**Pin Major and Minor Versions**:
- Use semantic versioning with caret ranges: `^0.9.0` not `latest`
- Lock transitive dependencies via package-lock.json (npm) or yarn.lock (yarn)
- Document version selection rationale in Architecture Decision Log

**Example**:
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.10.0",
    "express": "^4.18.0",
    "zod": "^3.22.0"
  }
}
```

**Rationale**: Pinning major/minor versions prevents breaking changes while allowing patch updates. `latest` introduces unpredictable behavior and version conflicts.

---

### Pre-Specification Compatibility Check

Before finalizing package.json dependencies in env-manifest.json, Agent 2 SHOULD verify version compatibility using one of these methods:

**Option 1: npm install --dry-run validation (preferred)**

Create a temporary package.json with proposed versions and test dependency resolution:

```bash
# Create test package.json
cat > /tmp/package-check.json << 'EOF'
{
  "name": "dependency-check",
  "dependencies": {
    "drizzle-orm": "^0.36.0",
    "@neondatabase/serverless": "^0.10.0",
    "express": "^4.18.0"
  }
}
EOF

# Test dependency resolution
cd /tmp && npm install --package-lock-only --dry-run

# If successful (exit code 0), versions are compatible
# If failed, examine error message for peer dependency conflicts
```

**Option 2: Explicit peer dependency checks**

When specifying a library with known peer dependencies (drizzle-orm, React, Express), verify the specified version's peer dependency requirements match other specified versions.

**Critical peer dependency relationships:**
- `drizzle-orm` v0.36.0 requires `@neondatabase/serverless` ^0.10.0 (not ^0.9.0)
- `React` v18.x requires `react-dom` v18.x (exact major version match)
- `@tanstack/react-query` v5.x requires `React` ^18.0.0
- `vite` v5.x requires specific `@vitejs/plugin-react` version ranges

**Verification process:**
1. Check package.json or npm registry for peer dependency declarations
2. Cross-reference with other packages in the dependency list
3. Document verification results in Architecture Decision Log

**Example ADR Entry:**
```markdown
### ADR: Dependency Version Selection

**Decision:** Use drizzle-orm ^0.36.0 and @neondatabase/serverless ^0.10.0

**Rationale:** 
- drizzle-orm v0.36.0 is the latest stable with dialect field support (required per DATABASE CONFIGURATION STANDARDS)
- @neondatabase/serverless ^0.10.0 is required peer dependency per drizzle-orm package.json
- Versions verified compatible via `npm install --dry-run` on 2026-02-05

**Alternatives Considered:**
- drizzle-orm ^0.35.x: lacks dialect field (breaking change in Drizzle Kit v0.20+)
- @neondatabase/serverless ^0.9.0: peer dependency mismatch with drizzle-orm v0.36+

**Verification Command:**
```bash
cd /tmp && cat > package.json << 'EOF'
{"dependencies":{"drizzle-orm":"^0.36.0","@neondatabase/serverless":"^0.10.0"}}
EOF
npm install --package-lock-only --dry-run
# Exit code: 0 (success)
```

**Status:** Approved
```

**When to skip pre-validation:**
- Well-established package combinations with no recent breaking changes
- Packages with no peer dependencies
- Time-constrained specification phases (document assumption and verify during build)

**Critical rule:** If pre-validation is skipped, document it in the Architecture Decision Log with a note: "Compatibility assumed - verify during build phase."

---

### Conflict Prevention

**Before Specifying Dependencies**:
1. **Test Compatibility**: Verify the selected versions work together in a minimal test environment
2. **Check Peer Dependencies**: Ensure peer dependency ranges allow flexibility
3. **Flag Known Conflicts**: Document incompatible package combinations in Architecture Decision Log

**Common Conflict Patterns to Avoid**:
- React 18 + React Router 5 (incompatible, use React Router 6)
- TypeScript 5.x + older type definition packages (update @types/* packages)
- Database clients with incompatible SSL/TLS requirements

---

### Lock File Management

**Required Files**:
- `package-lock.json` (npm) or `yarn.lock` (yarn)
- Commit to version control
- Update only through explicit dependency updates

**Update Protocol**:
```bash
# Update specific package
npm update <package-name>

# Regenerate lock file after dependency changes
npm install

# Verify no conflicts introduced
npm ls
```

---

### Dependency Categories

**Production Dependencies** (`dependencies`):
- Runtime requirements: Express, database clients, validation libraries
- Must be stable, well-maintained, and security-audited

**Development Dependencies** (`devDependencies`):
- Build tools: TypeScript, Vite, esbuild
- Testing: Jest, Vitest, testing libraries
- Linting: ESLint, Prettier
- Type definitions: @types/* packages

**Do Not Include**:
- Global tools (install separately)
- Platform-provided packages (Node.js core modules)
- Unused legacy dependencies

---

### Architecture Decision Log Template

For each major dependency, document:

```markdown
### Dependency: [Package Name]

**Version**: [Pinned version]
**Purpose**: [Why this package is needed]
**Alternatives Considered**: [Other options evaluated]
**Selection Rationale**: [Why this option was chosen]
**Known Limitations**: [Constraints, compatibility issues]
**Update Policy**: [When/how to update this dependency]
```

**Example**:
```markdown
### Dependency: @neondatabase/serverless

**Version**: ^0.10.0
**Purpose**: PostgreSQL client optimised for serverless environments (Replit, Vercel)
**Alternatives Considered**: node-postgres (pg), Prisma Client
**Selection Rationale**: Native serverless support, connection pooling, zero cold-start overhead
**Known Limitations**: Limited to PostgreSQL 14+, requires Neon-specific connection strings
**Update Policy**: Update to latest 0.x when security patches released; evaluate 1.x when stable
```

---

## SECTION 5: DATABASE CONFIGURATION STANDARDS

Database configuration must support multiple environments (local development, serverless deployment) with appropriate drivers for each.

### Environment-Specific Driver Selection

**Production/Serverless (Replit, Vercel, Netlify)**:
```typescript
// Use serverless-optimised drivers
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
```

**Local Development**:
```typescript
// Use standard PostgreSQL client
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
```

**Configuration Pattern**:
```typescript
// server/db/index.ts
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

let db;

if (isProduction || databaseUrl.includes('neon.tech')) {
  // Serverless environment
  const sql = neon(databaseUrl);
  db = drizzle(sql, { schema });
} else {
  // Local PostgreSQL
  const pool = new Pool({ connectionString: databaseUrl });
  db = drizzle(pool, { schema });
}

export { db };
```

---

### Drizzle Configuration Requirements

**File**: `drizzle.config.ts` (project root)

**Required Fields** (Drizzle Kit v0.20+):
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',  // REQUIRED: 'postgresql' | 'mysql' | 'sqlite'
  driver: 'pg',           // Local: 'pg' | Production: handled by connection string
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!
  }
} satisfies Config;
```

**Critical Notes**:
- `dialect` is REQUIRED in Drizzle Kit v0.20+
- Use `'pg'` driver for local development (requires `pg` package)
- Use `'neon-http'` or connection string detection for serverless
- Schema imports must NOT use `.js` extensions (breaks CJS resolver)

---

### Schema Import Standards

**Correct** (no file extensions):
```typescript
// server/db/schema/index.ts
export { organisations } from './organisations';
export { users, userRoleEnum } from './users';
export { projects, projectStatusEnum } from './projects';
```

**Incorrect** (will break Drizzle Kit):
```typescript
// âŒ Do not use .js extensions
export { organisations } from './organisations.js';
export { users } from './users.js';
```

**Rationale**: Drizzle Kit uses CommonJS module resolution which doesn't handle `.js` extensions in TypeScript imports. While these extensions work at runtime with TypeScript ESM, they break schema introspection.

---

### Dependency Requirements

**Production**:
```json
{
  "dependencies": {
    "drizzle-orm": "^0.36.0",
    "@neondatabase/serverless": "^0.10.0"
  }
}
```

**Development**:
```json
{
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "pg": "^8.11.0",
    "@types/pg": "^8.10.0"
  }
}
```

**Notes**:
- `pg` is listed as devDependency but is required at runtime for local development and QA (the dual-driver pattern imports it when DATABASE_URL does not point to Neon)
- `@neondatabase/serverless` is production dependency (needed for serverless runtime)
- Both must be available so local development can use `pg` while production uses Neon

---

### Environment Variable Standards

**Required Variables**:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Environment detection
NODE_ENV="development" | "production"
```

**Connection String Formats**:
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://foundry:password@localhost:5432/foundry"

# Neon (serverless)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require"

# Replit PostgreSQL
DATABASE_URL="postgresql://user:password@db.railway.app:5432/railway"
```

---

### Migration Strategy

**Local Development**:
```bash
# Push schema changes directly (no migration files)
npx drizzle-kit push

# Generate migration files
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

**Production Deployment**:
```bash
# Run migrations on deploy
npm run db:migrate

# Or push schema directly (if no production data)
npm run db:push
```

**Package.json Scripts**:
```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

---

### Health Check Integration

Database connection must be verified in health check endpoint:

```typescript
// server/routes/health.routes.ts
router.get('/health', async (req, res) => {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    const latencyMs = Date.now() - start;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'healthy', latencyMs }
      }
    });
  } catch (error) {
    const latencyMs = Date.now() - start;
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: { 
          status: 'unhealthy', 
          latencyMs,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    });
  }
});
```

---

## SECTION 6: VERIFICATION GATES

### Gate: env-manifest.json Schema Validation

```bash
#!/bin/bash
# scripts/verify-env-manifest-schema.sh
set -euo pipefail

echo "=== Verifying env-manifest.json Schema (6 Required Fields) ==="

if [ ! -f "docs/env-manifest.json" ]; then
 echo "[X] FAIL: env-manifest.json missing"
 exit 1
fi

jq empty docs/env-manifest.json || { echo "[X] FAIL: Invalid JSON"; exit 1; }

FAILURES=0

# Validate required[] variables (6 fields each)
while read -r var_json; do
 VAR_NAME=$(echo "$var_json" | jq -r '.name')

 for field in name usage validation validatedInFile usedInFiles whyRequired; do
 VALUE=$(echo "$var_json" | jq -r ".$field // empty")
 if [ -z "$VALUE" ]; then
 echo "[X] FAIL: $VAR_NAME missing required field: $field"
 FAILURES=$((FAILURES + 1))
 fi
 done

 # usedInFiles must have at least 1 entry
 USED_COUNT=$(echo "$var_json" | jq '.usedInFiles | length')
 if [ "$USED_COUNT" -lt 1 ]; then
 echo "[X] FAIL: $VAR_NAME has empty usedInFiles array"
 FAILURES=$((FAILURES + 1))
 fi

done < <(jq -c '.required[]' docs/env-manifest.json)

# Validate conditionallyRequired[] variables (6 fields + condition)
if jq -e '.conditionallyRequired' docs/env-manifest.json > /dev/null 2>&1; then
 while read -r var_json; do
 VAR_NAME=$(echo "$var_json" | jq -r '.name')

 CONDITION=$(echo "$var_json" | jq -r '.condition // empty')
 if [ -z "$CONDITION" ]; then
 echo "[X] FAIL: $VAR_NAME in conditionallyRequired missing 'condition' field"
 FAILURES=$((FAILURES + 1))
 fi

 for field in name usage validation validatedInFile usedInFiles whyRequired; do
 VALUE=$(echo "$var_json" | jq -r ".$field // empty")
 if [ -z "$VALUE" ]; then
 echo "[X] FAIL: $VAR_NAME missing required field: $field"
 FAILURES=$((FAILURES + 1))
 fi
 done

 done < <(jq -c '.conditionallyRequired[]' docs/env-manifest.json)
fi

if [ $FAILURES -gt 0 ]; then
 echo "[X] ENV MANIFEST SCHEMA FAILED: $FAILURES issues"
 exit 1
fi

echo "[OK] env-manifest.json schema validated (all required fields present)"
exit 0
```

### Gate: Health Endpoint DB Connectivity

```bash
#!/bin/bash
# scripts/verify-health-db-connectivity.sh
set -euo pipefail

echo "=== Verifying Health Endpoint DB Connectivity ==="

# Resolve server base URL from env or default
SERVER_PORT="${PORT:-5000}"
BASE_URL="${BASE_URL:-http://localhost:${SERVER_PORT}}"

HEALTH_PATH=$(jq -r '.endpoints[] | select(.path | contains("health")) | .path' docs/service-contracts.json 2>/dev/null | head -1)

if [ -z "$HEALTH_PATH" ]; then
 echo "[SKIP] No health endpoint defined in service-contracts.json"
 exit 0
fi

RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}${HEALTH_PATH}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" != "200" ]; then
 echo "[X] FAIL: Health check returned $HTTP_CODE (URL: ${BASE_URL}${HEALTH_PATH})"
 exit 1
fi

if ! echo "$BODY" | jq -e '.checks.database' >/dev/null; then
 echo "[X] FAIL: Missing .checks.database in health response"
 exit 1
fi

echo "[OK] Health endpoint validates DB connectivity"
exit 0
```

### Gate: No Wildcard CORS

```bash
#!/bin/bash
# scripts/verify-no-wildcard-cors.sh
set -euo pipefail

echo "=== Verifying No Wildcard CORS ==="

# Check for literal wildcard string origin: '*'
# Note: origin: true (reflect request origin) is allowed in development
if grep -r "origin.*['\"]\\*['\"]" server/ --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v "test"; then
 echo "[X] FAIL: Literal wildcard CORS (origin: '*') detected"
 echo "Use explicit origins from APP_URL in production."
 echo "Development may use origin: true (reflect request origin)."
 exit 1
fi

echo "[OK] No literal wildcard CORS in production code"
exit 0
```

---

## VERIFICATION COMMANDS

```bash
bash scripts/verify-env-manifest-schema.sh
bash scripts/verify-config-files-required.sh
bash scripts/verify-health-db-connectivity.sh
bash scripts/verify-no-wildcard-cors.sh
bash scripts/verify-encryption-binary.sh
```

---

## DOWNSTREAM HANDOFF

**To Agent 6 (Implementation):**
- Run all verification gates (Phase 2, BLOCKING)
- Use 02-ARCHITECTURE.md ADRs for implementation decisions
- Use env-manifest.json for environment variable setup
- If ENCRYPTION_KEY is in conditionallyRequired and the condition applies, generate encryption.ts
- Use the Environment Validation Pattern from 02-ARCHITECTURE.md to generate server/lib/env.ts with correct conditionallyRequired handling

---

## PROMPT HYGIENE GATE

- [OK] Version Reference block present (Section Y compliant)
- [OK] No dependency version pins outside Version Reference and VERSION HISTORY (Section Y compliant)
- [OK] Section AL exception documented for 02-ARCHITECTURE.md
- [OK] env-manifest schema locked to Constitution Section AJ (6 required fields)
- [OK] ENCRYPTION_KEY in conditionallyRequired (no spec contradiction)
- [OK] APP_URL in required with full 6-field schema
- [OK] Server port parameterised in health check gate (PORT env, default 5000)
- [OK] PORT cross-consistency rule: env-manifest PORT default must match architecture production port
- [OK] PORT example in schema includes multi-environment usage description
- [OK] PORT cross-consistency rule enhanced: multi-service development setup guidance included
- [OK] Scope-manifest deference rule: architecture must not invent names that originate from scope-manifest
- [OK] Output boundary: 2 files only, script blocks are specs for Agent 6
- [OK] ADR port configuration rule: dev vs prod ports must be explicit and unambiguous
- [OK] ADR port configuration rule enhanced: specifies "primary" external port identification
- [OK] ADR CORS configuration rule: distinguishes literal wildcard from reflect-origin
- [OK] Forward-reference attribution rule: enforcement mechanisms attributed to generating agent
- [OK] Encryption-vs-deidentification boundary: encryption at rest vs irreversible de-id clearly separated
- [OK] 02-ARCHITECTURE.md Version Reference block requirement: output file must include Version Reference
- [OK] 02-ARCHITECTURE.md Version Reference template: filename includes .md extension
- [OK] conditionallyRequired runtime enforcement rule: fail in production, warn in development
- [OK] Environment Validation Pattern section: explicit handling for all three variable categories
- [OK] CORS Production Defaults section: clarifies literal wildcard vs reflect-origin distinction
- [OK] CORS gate: checks for literal wildcard string only, allows reflect-origin in development
- [OK] All gates use set -euo pipefail

**Validation Date:** 2026-02-06
**Status:** Production Ready
