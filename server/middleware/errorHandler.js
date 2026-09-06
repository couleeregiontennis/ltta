import { recordError } from '../services/errorReporter.js';

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  req.log?.error(
    { err, status, method: req.method, path: req.originalUrl, body: req.body, userId: req.user?.id },
    'Request error'
  );
  if (status >= 500) {
    recordError({
      type: err.name || 'Error',
      message: err.message || 'Unknown server error',
      stack: err.stack,
      source: 'server',
      requestId: req.id,
      path: req.originalUrl,
    });
  }
  res.status(status).json({ error: status >= 500 ? 'Internal Server Error' : err.message });
}
