import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './lib/env';
import { corsOptions } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// 1. CORS (must be first to handle preflight requests)
app.use(cors(corsOptions));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Routes (auth, validation applied per-route)
app.use('/api', routes);

// 4. Serve static files in production
if (env.NODE_ENV === 'production') {
  const clientPath = path.join(process.cwd(), 'dist/client');
  app.use(express.static(clientPath));

  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// 5. Error Handler (MUST be last)
app.use(errorHandler);

// Start server
const PORT = env.NODE_ENV === 'production' ? parseInt(env.PORT) : 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔒 CORS origin: ${env.NODE_ENV === 'production' ? env.APP_URL : 'development (reflect origin)'}`);
});
