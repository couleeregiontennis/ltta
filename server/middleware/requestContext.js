import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger.js';

// Attaches a per-request ID, echoes it to the client, and hangs a child
// logger scoped to the request off `req.log`.
export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  req.log = logger.child({ requestId: req.id });
  next();
}
