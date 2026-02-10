# Foundry - Data Preparation & De-identification Platform

A full-stack TypeScript application for data preparation and de-identification, enabling non-technical users to transform raw data sources into clean, AI-ready datasets with privacy-preserving transformations.

## Architecture

- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Frontend**: React 18 + Vite + TailwindCSS + React Query
- **Authentication**: JWT-based (access + refresh tokens)
- **Database**: PostgreSQL 15+ with multi-tenant isolation
- **Type Safety**: Full TypeScript with strict mode

## Features

- Multi-tenant organization isolation
- File upload (CSV, Excel, JSON) up to 100MB
- API source connections
- Project-based workflow with canonical schemas
- Processing jobs with configuration snapshots
- Dataset generation with traceable lineage
- Soft delete with cascade behavior
- Role-based access control (admin/member)
- User invitation system

## Directory Structure

```
/
├── server/
│   ├── db/
│   │   ├── schema/           # Drizzle ORM schemas (7 tables)
│   │   ├── migrations/       # Database migrations
│   │   ├── index.ts          # Database connection
│   │   └── migrate.ts        # Migration runner
│   ├── lib/
│   │   ├── env.ts            # Environment validation
│   │   ├── auth.ts           # JWT utilities
│   │   ├── encryption.ts     # AES-256-GCM encryption
│   │   └── errors.ts         # Custom error classes
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── cors.ts           # CORS configuration
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── upload.ts         # File upload middleware
│   ├── routes/               # API routes (50+ endpoints)
│   ├── services/             # Business logic layer
│   └── index.ts              # Express server entry
├── client/
│   ├── src/
│   │   ├── pages/            # 20 React page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # API client & utilities
│   │   └── main.tsx          # React entry point
│   └── index.html
├── docs/                     # Architecture documentation
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── vite.config.ts
```

## Database Schema

### 7 Core Entities:

1. **organisations** - Tenant containers with complete data isolation
2. **users** - Authenticated individuals with role-based permissions
3. **canonicalSchemas** - Platform-level reusable data structure definitions
4. **projects** - Scoped AI initiatives grouping sources and outputs
5. **sources** - Origin of raw data (files, APIs)
6. **processingJobs** - Pipeline execution transforming inputs to outputs
7. **datasets** - Clean structured AI-ready output with lineage

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/foundry
JWT_SECRET=your-secret-key-minimum-32-characters-long
APP_URL=http://localhost:5000
```

Optional variables:

```env
ENCRYPTION_KEY=64-character-hex-string (required in production)
PORT=5000
LOG_LEVEL=info
MAX_FILE_SIZE_MB=100
SOURCE_RETENTION_DAYS=30
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Development

Run both frontend (Vite on port 5000) and backend (Express on port 3001):

```bash
npm run dev
```

The frontend will proxy `/api` requests to the backend.

### 5. Production Build

```bash
npm run build
npm start
```

In production, Express serves both the API and static frontend on port 5000.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (requires invite token)
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/session` - Get current user session

### Organisations
- `GET /api/organisations/me` - Get current organisation
- `PATCH /api/organisations/me` - Update organisation (admin only)

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/invite` - Create user invite (admin only)

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:projectId/sources` - Get project sources
- `GET /api/projects/:projectId/processing-jobs` - Get project jobs
- `GET /api/projects/:projectId/datasets` - Get project datasets

### Sources
- `POST /api/sources` - Create source (with file upload)
- `GET /api/sources` - List sources
- `GET /api/sources/:id` - Get source
- `PATCH /api/sources/:id` - Update source
- `DELETE /api/sources/:id` - Delete source

### Processing Jobs
- `POST /api/processing-jobs` - Create processing job
- `GET /api/processing-jobs` - List processing jobs
- `GET /api/processing-jobs/:id` - Get processing job
- `POST /api/processing-jobs/:id/retry` - Retry failed job

### Datasets
- `GET /api/datasets` - List datasets
- `GET /api/datasets/:id` - Get dataset
- `GET /api/datasets/:id/download` - Download dataset
- `DELETE /api/datasets/:id` - Delete dataset

### Canonical Schemas
- `GET /api/canonical-schemas` - List schemas
- `GET /api/canonical-schemas/:id` - Get schema
- `POST /api/canonical-schemas` - Create schema (admin only)
- `PATCH /api/canonical-schemas/:id` - Update schema (admin only)

### Health
- `GET /api/health` - Health check with database connectivity

## Frontend Pages

1. Login & Registration
2. Dashboard (overview with recent items)
3. User Settings
4. Organisation Settings (admin)
5. Users Management (admin)
6. Projects List & Create
7. Project Detail (with tabs)
8. Project-specific sources, jobs, datasets
9. Sources List & Create
10. Processing Jobs List & Detail
11. Datasets List & Detail
12. Canonical Schemas List & Detail

## Security Features

- JWT authentication with 15-minute access tokens
- Password hashing with bcrypt
- Multi-tenant data isolation via organisationId
- CORS configuration (reflect origin in dev, explicit APP_URL in prod)
- AES-256-GCM encryption for sensitive data (optional in dev, required in prod)
- Role-based access control (admin/member)
- Soft delete with cascade behavior
- SQL injection protection via Drizzle ORM

## Key Architecture Patterns

### Middleware Order (CRITICAL)
1. CORS
2. Body Parsers
3. Routes (with auth/validation per-route)
4. Error Handler (MUST be last)

### Soft Delete Cascade Rules
- Organisation → Users, Projects
- Project → Sources, ProcessingJobs, Datasets
- ProcessingJob → Datasets

### Environment Validation
All environment variables validated at startup with Zod. Application fails fast with clear error messages if validation fails.

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": null
  }
}
```

## Development Commands

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate database migrations
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Tech Stack Details

### Backend
- Express.js 4.21+
- Drizzle ORM 0.38+ with node-postgres driver
- JWT (jsonwebtoken 9.0.2)
- Bcrypt 2.4.3
- Multer for file uploads
- Zod for validation

### Frontend
- React 18.3+
- React Router v6
- TanStack Query (React Query) 5.59+
- Tailwind CSS 3.4+
- Vite 5.4+

### Database
- PostgreSQL 15+
- Drizzle Kit 0.30+ for migrations
- Support for both pg (local) and @neondatabase/serverless (production)

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Ensure `ENCRYPTION_KEY` is set (compliance requirement)
4. Run database migrations
5. Build the application
6. Start the server (serves both API and frontend on port 5000)

The application binds to `0.0.0.0` in production for container deployments.

## License

Proprietary - All rights reserved

## Support

For issues or questions, refer to:
- Architecture documentation: `docs/02-ARCHITECTURE.md`
- Entity contracts: `docs/data-relationships.json`
- API contracts: `docs/service-contracts.json`
- UI dependencies: `docs/ui-api-deps.json`
