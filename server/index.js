import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pinoHttp from 'pino-http';

import { logger } from './lib/logger.js';
import { requestContext } from './middleware/requestContext.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import DB
import { db } from './db.js';

// Import route files
import authRouter from './routes/auth.js';
import playersRouter from './routes/players.js';
import teamsRouter from './routes/teams.js';
import matchesRouter from './routes/matches.js';
import standingsRouter from './routes/standings.js';
import seasonsRouter from './routes/seasons.js';
import adminRouter from './routes/admin.js';
import aiRouter from './routes/ai.js';
import suggestionsRouter from './routes/suggestions.js';
import subRequestsRouter from './routes/subRequests.js';
import paymentsRouter from './routes/payments.js';
import locationsRouter, { courtsRouter } from './routes/locations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3010;

// Setup Express
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] || crypto.randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    autoLogging: {
      ignore: (req) => req.url.startsWith('/api/client-errors'),
    },
    customLogLevel: (req, res, err) =>
      err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
  })
);
app.use(requestContext);
app.use(express.json());
app.use(cookieParser());

// Serve static files from Vite dist
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/seasons', seasonsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/sub-requests', subRequestsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/courts', courtsRouter);

// SPA Fallback: Any GET or HEAD request that doesn't match an API route serves index.html
app.use((req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
