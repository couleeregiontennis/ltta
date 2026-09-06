import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { childLogger } from '../lib/logger.js';

const log = childLogger('services/error-store');

export function normalizeMessage(msg) {
  return String(msg || '').replace(/\d+/g, '#').slice(0, 300);
}

export function topFrame(stack) {
  if (!stack) return '';
  const lines = String(stack).split('\n').filter((l) => l.trim().startsWith('at '));
  return (lines[0] || '').trim().slice(0, 200);
}

export function fingerprintError({ type, message, stack }) {
  return createHash('sha256')
    .update(`${type || 'Error'}\n${topFrame(stack)}\n${normalizeMessage(message)}`)
    .digest('hex')
    .slice(0, 16);
}

export function createErrorStore({
  filePath = null,
  now = () => new Date(),
  maxSessionsPerDay = 10,
  onTrigger = null,
} = {}) {
  const records = new Map();
  let sessionsTodayCount = 0;
  let sessionsDay = null;

  if (filePath) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const [fp, rec] of Object.entries(raw.records || {})) records.set(fp, rec);
      sessionsTodayCount = raw.sessionsTodayCount || 0;
      sessionsDay = raw.sessionsDay || null;
    } catch {
      // first run or unreadable file: start empty
    }
  }

  const utcDay = () => now().toISOString().slice(0, 10);

  function persist() {
    if (!filePath) return;
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(
        filePath,
        JSON.stringify({ records: Object.fromEntries(records), sessionsTodayCount, sessionsDay }, null, 2)
      );
    } catch (err) {
      log.warn({ err: err.message }, 'Failed to persist error store');
    }
  }

  function rollDay() {
    const day = utcDay();
    if (sessionsDay !== day) {
      sessionsDay = day;
      sessionsTodayCount = 0;
    }
  }

  function record(report) {
    const fp = fingerprintError(report);
    let rec = records.get(fp);
    let triggered = false;
    let triggerError = null;

    rollDay();
    if (!rec) {
      rec = {
        fingerprint: fp,
        type: report.type,
        message: report.message,
        sample: report,
        count: 0,
        firstSeen: now().toISOString(),
        lastSeen: now().toISOString(),
        session: null,
      };
      records.set(fp, rec);
    }
    rec.count += 1;
    rec.lastSeen = now().toISOString();

    if (!rec.session && onTrigger && sessionsTodayCount < maxSessionsPerDay) {
      sessionsTodayCount += 1;
      try {
        const result = onTrigger(report, rec);
        if (result && typeof result.then === 'function') {
          result
            .then((session) => { rec.session = session; persist(); })
            .catch((err) => {
              sessionsTodayCount = Math.max(0, sessionsTodayCount - 1);
              rec.session = null;
              persist();
              log.error({ err: err.message, fingerprint: fp }, 'Jules trigger failed');
            });
        } else if (result) {
          rec.session = result;
        }
        triggered = true;
      } catch (err) {
        sessionsTodayCount -= 1; // sync failure: refund the slot
        triggerError = err.message;
        log.error({ err: err.message, fingerprint: fp }, 'Jules trigger failed');
      }
    } else {
      log.info({ fingerprint: fp, count: rec.count, alreadyTracked: !!rec.session, capped: sessionsTodayCount >= maxSessionsPerDay }, 'Error deduped/capped, not sent to Jules');
    }

    persist();
    return { fingerprint: fp, record: rec, triggered, triggerError };
  }

  return {
    record,
    get: (fp) => records.get(fp) || null,
    all: () => [...records.values()],
    sessionsToday: () => { rollDay(); return sessionsTodayCount; },
  };
}
