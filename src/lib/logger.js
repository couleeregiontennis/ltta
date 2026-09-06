const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[import.meta.env.VITE_LOG_LEVEL || 'info'] ?? LEVELS.info;

function emit(level, module, args) {
  if (LEVELS[level] < threshold) return;
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${module}]`;
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(prefix, ...args);
}

export function createLogger(module = 'app') {
  return {
    debug: (...a) => emit('debug', module, a),
    info: (...a) => emit('info', module, a),
    warn: (...a) => emit('warn', module, a),
    error: (...a) => emit('error', module, a),
  };
}

export const logger = createLogger('app');
