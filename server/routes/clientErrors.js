import { Router } from 'express';
import { errorReporter } from '../services/errorReporter.js';
import { childLogger } from '../lib/logger.js';

const log = childLogger('routes/clientErrors');
const router = Router();

// Simple in-memory per-IP rate limiter: 30 reports per minute.
const hits = new Map();
function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const windowStart = now - 60_000;
  const list = (hits.get(key) || []).filter((t) => t > windowStart);
  if (list.length >= 30) {
    return res.status(429).json({ error: 'Too many error reports' });
  }
  list.push(now);
  hits.set(key, list);
  next();
}

router.post('/', rateLimit, (req, res) => {
  const { message, stack, url, requestId } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  const report = {
    type: 'ClientError',
    message: String(message).slice(0, 2000),
    stack: String(stack || '').slice(0, 16000),
    source: 'client',
    url: String(url || '').slice(0, 500),
    requestId: String(requestId || '').slice(0, 100),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
  };
  log.warn({ message: report.message, url: report.url, requestId: report.requestId }, 'Client error reported');
  const result = errorReporter.report(report);
  res.json({ ok: true, fingerprint: result.fingerprint });
});

export default router;
