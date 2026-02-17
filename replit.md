# Foundry - Data Preparation & De-identification Platform

## Overview
A full-stack TypeScript application for data preparation and de-identification. Enables non-technical users to transform raw data into clean, AI-ready datasets with privacy-preserving transformations.

## Architecture
- **Backend**: Express.js (port 3001 in dev, port 5000 in production) + Drizzle ORM + PostgreSQL
- **Frontend**: React 18 + Vite (port 5000 in dev) + TailwindCSS + React Query
- **Authentication**: JWT-based (access + refresh tokens)
- **Database**: PostgreSQL (Replit built-in, Neon-backed)
- **Type Safety**: Full TypeScript with strict mode

## Project Structure
```
/
├── server/                  # Express backend
│   ├── db/
│   │   ├── schema/          # Drizzle ORM schemas (7 tables)
│   │   ├── migrations/      # Database migrations
│   │   ├── index.ts         # Database connection
│   │   └── migrate.ts       # Migration runner
│   ├── lib/                 # Utilities (env, auth, encryption, errors)
│   ├── middleware/           # Auth, CORS, error handler, uploads
│   ├── routes/              # API routes (50+ endpoints)
│   ├── services/            # Business logic layer
│   └── index.ts             # Express server entry
├── client/                  # React frontend
│   ├── index.html
│   └── src/
│       ├── pages/           # 20 React page components
│       ├── components/      # Shared components
│       └── lib/             # API client, utilities
├── vite.config.ts           # Vite config (root: client/)
├── drizzle.config.ts        # Drizzle ORM config
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS config
└── postcss.config.js        # PostCSS config
```

## Key Configuration
- Vite is configured with `root: 'client'` since index.html is in client/
- Vite proxies `/api` requests to Express backend at localhost:3001
- Production server serves static files from `dist/client`
- Database migrations managed via Drizzle Kit

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `APP_URL` - Application URL (no trailing slash)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ENCRYPTION_KEY` - Optional AES-256 key (required in production)

## Scripts
- `npm run dev` - Start both server and client concurrently
- `npm run build` - Build client and server for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations

## Recent Changes
- Fixed Drizzle schema: replaced `unique().on().where()` with `uniqueIndex().on().where()` for partial unique index support
- Fixed typo in NewSourcePage.tsx import (`@tantml:react-query` -> `@tanstack/react-query`)
- Added Vite `root: 'client'` config, `host: '0.0.0.0'`, `allowedHosts: true` for Replit compatibility
- Generated and ran initial database migration
