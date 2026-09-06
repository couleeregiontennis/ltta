import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger.js';

// Thin defensive backstop: pino-http's genReqId is the sole owner of request
// ID creation (and sets req.id, req.log, and the x-request-id header). This
// middleware only backfills anything missing and re-asserts the header.
export function requestContext(req, res, next) {
  if (!req.id) {
    req.id = randomUUID();
  }
  if (!req.log) {
    req.log = logger.child({ requestId: req.id });
  }
  if (!res.getHeader('x-request-id')) {
    res.setHeader('x-request-id', req.id);
  }
  next();
}
