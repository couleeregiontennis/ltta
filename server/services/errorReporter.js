import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createErrorStore } from './error-store.js';
import { createJulesClient } from './jules.js';
import { childLogger } from '../lib/logger.js';

const log = childLogger('services/errorReporter');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createErrorReporter({
  enabled = process.env.JULES_ENABLED === 'true',
  onTrigger = null,
  storePath = path.join(__dirname, '../data/error-store.json'),
} = {}) {
  const jules = createJulesClient();
  const store = createErrorStore({
    filePath: storePath,
    onTrigger: enabled ? onTrigger || (async (report) => jules.createFixSession(report)) : null,
  });

  return {
    store,
    report(reportData) {
      const result = store.record(reportData);
      if (!enabled) {
        log.info({ fingerprint: result.fingerprint, source: reportData.source }, 'Error recorded (Jules disabled)');
        return { ...result, triggered: false };
      }
      log.info(
        { fingerprint: result.fingerprint, source: reportData.source, triggered: result.triggered, count: result.record.count },
        'Error reported'
      );
      return result;
    },
  };
}

export const errorReporter = createErrorReporter();

export function recordError(reportData) {
  try {
    return errorReporter.report(reportData);
  } catch (err) {
    log.error({ err: err.message }, 'recordError failed');
    return null;
  }
}
