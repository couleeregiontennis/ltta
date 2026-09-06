import { recordError } from '../services/errorReporter.js';

const SENSITIVE_KEY = /pass(word)?|token|secret|authorization|api[_-]?key/i;
const MAX_REDACT_DEPTH = 4;

// Deep-redacts values whose keys look sensitive, up to a bounded depth so
// cyclic or pathological payloads cannot blow up the error path.
function redact(value, depth = 0) {
  if (value === null || typeof value !== 'object' || depth >= MAX_REDACT_DEPTH) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(val, depth + 1);
  }
  return out;
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  req.log?.error(
    {
      err,
      status,
      method: req.method,
      path: req.originalUrl,
      body: redact(req.body),
      userId: req.user?.id,
    },
    'Request error'
  );
  if (status >= 500) {
    try {
      recordError({
        type: err.name || 'Error',
        message: err.message || 'Unknown server error',
        stack: err.stack,
        source: 'server',
        requestId: req.id,
        path: req.originalUrl,
      });
    } catch (reportErr) {
      req.log?.warn({ err: reportErr }, 'recordError failed; continuing');
    }
  }
  res.status(status).json({ error: status >= 500 ? 'Internal Server Error' : err.message });
}
