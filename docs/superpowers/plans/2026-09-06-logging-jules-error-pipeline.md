# Logging & Auto-Jules Error Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured, request-correlated logging across the Express backend and React frontend, and automatically open Jules fix sessions (which produce PRs) for deduplicated unhandled errors, capped at 10 sessions/day.

**Architecture:** A pino-based logger with request-ID middleware feeds a centralized Express error handler. The frontend captures window errors, unhandled rejections, and React render crashes, reporting them to `POST /api/client-errors`. Both paths funnel into an error store that fingerprints, dedupes, and rate-caps errors before calling a thin Jules API client that creates a fix session against `couleeregiontennis/ltta`.

**Tech Stack:** Node ESM, Express 5, pino + pino-http, React 18, node:test for unit tests (native ESM, no config needed), Jules API (`https://jules.googleapis.com/v1alpha/sessions`).

**Spec:** `docs/superpowers/specs/2026-09-06-logging-jules-error-pipeline-design.md`

**Testing note:** Unit tests use Node's built-in runner (`node --test tests/unit/`) because the project is `"type": "module"` — Jest ESM would require extra config we don't need. Add this script to `package.json`:

```json
"test:unit": "node --test tests/unit/"
```

---

### Task 1: pino logger + request-ID middleware + error handler

**Files:**
- Create: `server/lib/logger.js`
- Create: `server/middleware/requestContext.js`
- Create: `server/middleware/errorHandler.js`
- Modify: `server/index.js`
- Modify: `package.json` (add deps + `test:unit` script)
- Modify: `.env.example`

- [ ] **Step 1: Install dependencies and add test script**

```bash
npm install pino pino-http
```

In `package.json` `scripts`, add:

```json
"test:unit": "node --test tests/unit/"
```

In `.env.example`, append:

```
# Log level: debug | info | warn | error (default info)
LOG_LEVEL=info
# Jules auto-fix integration
JULES_API_KEY=
JULES_ENABLED=false
```

- [ ] **Step 2: Create `server/lib/logger.js`**

```js
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function childLogger(module) {
  return logger.child({ module });
}
```

- [ ] **Step 3: Create `server/middleware/requestContext.js`**

```js
import { randomUUID } from 'node:crypto';

// Attaches a per-request ID, echoes it to the client, and hangs a child
// logger scoped to the request off `req.log`.
export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  req.log = logger.child({ requestId: req.id });
  next();
}

import { logger } from '../lib/logger.js';
```

Note: move the `import { logger }` line to the top of the file — it is shown at the bottom here only to keep the middleware body readable.

- [ ] **Step 4: Create `server/middleware/errorHandler.js`**

```js
import { recordError } from '../services/errorReporter.js';

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  req.log?.error(
    {
      err,
      status,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      userId: req.user?.id,
    },
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
  res
    .status(status)
    .json({ error: status >= 500 ? 'Internal Server Error' : err.message });
}
```

- [ ] **Step 5: Wire into `server/index.js`**

Add pino-http plus the new middleware. Replace lines 30 and 60–64:

```js
import pinoHttp from 'pino-http';
import { logger } from './lib/logger.js';
import { requestContext } from './middleware/requestContext.js';
import { errorHandler } from './middleware/errorHandler.js';

// after `const PORT = ...`:
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
```

(`import crypto from 'node:crypto'` at the top.) Replace the global error handler at lines 60–64 with:

```js
app.use(errorHandler);
```

Change `app.listen(...)` callback to `logger.info(...)` instead of `console.log`.

- [ ] **Step 6: Verify the server still boots**

```bash
LOG_LEVEL=debug timeout 5 node server/index.js
```

Expected: JSON log line `Server listening on port 3010`, no crash.

- [ ] **Step 7: Commit**

```bash
git checkout -b jules/feature/logging-jules-error-pipeline
git add package.json package-lock.json .env.example server/lib/logger.js server/middleware/requestContext.js server/middleware/errorHandler.js server/index.js
git commit -m "feat: add pino structured logging with request IDs and central error handler"
```

---

### Task 2: Replace ad-hoc console.error calls with child loggers

**Files:**
- Modify: `server/routes/ai.js` (lines ~84, ~284)
- Modify: `server/routes/auth.js` (lines ~44, ~75, ~99, ~125)
- Modify: `server/db.js` (line ~460)

- [ ] **Step 1: Add a module logger to each file**

At the top of `server/routes/ai.js`, `server/routes/auth.js`, and `server/db.js`:

```js
import { childLogger } from '../lib/logger.js';
const log = childLogger('routes/ai'); // adjust module name per file; use 'db' for db.js
```

(For `db.js` the import path is `./lib/logger.js`.)

- [ ] **Step 2: Replace each console.error**

Pattern — turn each `console.error('X error:', error)` into a structured call inside the existing catch blocks:

```js
log.error({ err: error }, 'Signup error');
```

Apply to all 7 sites (message strings preserved as the log message; `err` carries the stack).

- [ ] **Step 3: Grep verifies no server console.error remains**

```bash
grep -rn "console.error" server/ --include=*.js
```

Expected: no matches.

- [ ] **Step 4: Boot check and commit**

```bash
timeout 5 node server/index.js
git add server/routes/ai.js server/routes/auth.js server/db.js
git commit -m "refactor: replace console.error with structured child loggers"
```

---

### Task 3: Error store with fingerprinting, dedupe, and daily cap (TDD)

**Files:**
- Create: `server/services/error-store.js`
- Test: `tests/unit/error-store.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/unit/error-store.test.mjs`:

```js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fingerprintError, createErrorStore } from '../../server/services/error-store.js';

describe('fingerprintError', () => {
  test('same error produces same fingerprint', () => {
    const a = fingerprintError({ type: 'TypeError', message: 'Cannot read x of y', stack: 'TypeError: Cannot read x of y\n    at foo (/srv/a.js:1:1)' });
    const b = fingerprintError({ type: 'TypeError', message: 'Cannot read x of y', stack: 'TypeError: Cannot read x of y\n    at foo (/srv/a.js:1:1)' });
    assert.equal(a, b);
  });

  test('numbers in message are normalized (same fingerprint)', () => {
    const a = fingerprintError({ type: 'E', message: 'user 123 not found', stack: 'E\n at f' });
    const b = fingerprintError({ type: 'E', message: 'user 456 not found', stack: 'E\n at f' });
    assert.equal(a, b);
  });

  test('different errors differ', () => {
    const a = fingerprintError({ type: 'E', message: 'boom', stack: 'E\n at f' });
    const b = fingerprintError({ type: 'E', message: 'crash', stack: 'E\n at f' });
    assert.notEqual(a, b);
  });
});

describe('createErrorStore', () => {
  const report = () => ({ type: 'TypeError', message: 'boom', stack: 'TypeError: boom\n at f (/x.js:1:1)', source: 'server' });

  test('first report triggers Jules and stores session info', () => {
    const triggered = [];
    const store = createErrorStore({ now: () => new Date('2026-09-06T10:00:00Z'), onTrigger: async (r, rec) => { triggered.push(r); return { name: 's1', url: 'https://jules/x' }; } });
    const result = store.record(report());
    assert.equal(result.triggered, true);
    assert.deepEqual(triggered.length, 1);
    assert.equal(store.get(result.fingerprint).session.url, 'https://jules/x');
  });

  test('duplicate is deduped (counted, not re-triggered)', () => {
    const store = createErrorStore({ now: () => new Date('2026-09-06T10:00:00Z'), onTrigger: async () => ({ name: 's1', url: 'u' }) });
    const first = store.record(report());
    const dup = store.record(report());
    assert.equal(dup.triggered, false);
    assert.equal(store.get(first.fingerprint).count, 2);
  });

  test('stops triggering after 10 sessions in one UTC day', () => {
    let triggers = 0;
    const store = createErrorStore({ now: () => new Date('2026-09-06T10:00:00Z'), onTrigger: async () => { triggers++; return { name: 's', url: 'u' }; } });
    for (let i = 0; i < 12; i++) {
      store.record({ ...report(), message: `unique error number ${i}`, stack: `E: ${i}\n at f${i}` });
    }
    assert.equal(triggers, 10);
    const last = store.sessionsToday();
    assert.equal(last, 10);
  });

  test('cap resets on a new UTC day', () => {
    let day = 6;
    const store = createErrorStore({ now: () => new Date(`2026-09-0${day}T10:00:00Z`), onTrigger: async () => ({ name: 's', url: 'u' }) });
    for (let i = 0; i < 10; i++) store.record({ ...report(), message: `m${i}`, stack: `E\n at f${i}` });
    day = 7;
    const r = store.record({ ...report(), message: 'fresh day', stack: 'E\n at fresh' });
    assert.equal(r.triggered, true);
  });

  test('onTrigger failure still records the error', async () => {
    const store = createErrorStore({ now: () => new Date('2026-09-06T10:00:00Z'), onTrigger: async () => { throw new Error('api down'); } });
    const result = store.record(report());
    assert.equal(result.triggered, false);
    assert.equal(result.triggerError, 'api down');
    assert.equal(store.get(result.fingerprint).count, 1);
  });
});
```

- [ ] **Step 2: Run it to verify failure**

```bash
node --test tests/unit/
```

Expected: FAIL — cannot find module `error-store.js`.

- [ ] **Step 3: Implement `server/services/error-store.js`**

```js
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
        // onTrigger may be sync or async; we intentionally do not await here —
        // callers needing the result can inspect rec.session afterwards.
        const result = onTrigger(report, rec);
        if (result && typeof result.then === 'function') {
          result
            .then((session) => { rec.session = session; persist(); })
            .catch((err) => { log.error({ err: err.message, fingerprint: fp }, 'Jules trigger failed'); });
        } else if (result) {
          rec.session = result;
        }
        triggered = true;
      } catch (err) {
        triggerError = err.message;
        log.error({ err: err.message, fingerprint: fp }, 'Jules trigger failed');
      }
    } else if (rec.session || sessionsTodayCount >= maxSessionsPerDay) {
      log.info({ fingerprint: fp, count: rec.count, capped: sessionsTodayCount >= maxSessionsPerDay }, 'Error deduped/capped, not sent to Jules');
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
```

Note on the async-onTrigger test: in the failure case (`onTrigger` rejects) the rejection is handled asynchronously, so `triggerError` stays null in that path — the test above asserting `result.triggerError === 'api down'` only holds for a **sync throw**. Adjust the last test to use a sync throw: `onTrigger: () => { throw new Error('api down'); }` and add a separate async-failure test asserting the record still exists after awaiting a tick. Implementation must not change.

- [ ] **Step 4: Run tests until green**

```bash
node --test tests/unit/
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add server/services/error-store.js tests/unit/error-store.test.mjs
git commit -m "feat: error store with fingerprinting, dedupe, and daily Jules cap"
```

---

### Task 4: Jules client + prompt builder (TDD)

**Files:**
- Create: `server/services/jules.js`
- Test: `tests/unit/jules.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/unit/jules.test.mjs`:

```js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, createJulesClient } from '../../server/services/jules.js';

describe('buildPrompt', () => {
  test('includes error, stack, request id, and PR instructions', () => {
    const p = buildPrompt({
      type: 'TypeError',
      message: 'Cannot read x',
      stack: 'TypeError: Cannot read x\n    at doThing (/home/server/routes/matches.js:42:15)',
      source: 'server',
      requestId: 'abc-123',
      path: '/api/matches',
    });
    assert.match(p, /TypeError/);
    assert.match(p, /matches\.js:42/);
    assert.match(p, /abc-123/);
    assert.match(p, /pull request/i);
  });
});

describe('createJulesClient', () => {
  test('POSTs to the sessions endpoint with API key and repo context', async () => {
    let captured = {};
    const fakeFetch = async (url, opts) => {
      captured = { url, opts };
      return { ok: true, status: 200, json: async () => ({ name: 'sessions/42', url: 'https://jules.google.com/session/42' }) };
    };
    const client = createJulesClient({ apiKey: 'k', repo: 'couleeregiontennis/ltta', fetchImpl: fakeFetch });
    const s = await client.createFixSession({ type: 'E', message: 'm', stack: 's', source: 'server' });
    assert.equal(captured.url, 'https://jules.googleapis.com/v1alpha/sessions');
    assert.equal(captured.opts.headers['x-goog-api-key'], 'k');
    assert.deepEqual(captured.opts.body.sourceContext, { source: 'GITHUB', githubRepoContext: { startingBranch: 'main' } });
    assert.equal(s.url, 'https://jules.google.com/session/42');
  });

  test('throws with status text on API error', async () => {
    const client = createJulesClient({ apiKey: 'k', fetchImpl: async () => ({ ok: false, status: 429, text: async () => 'quota' }) });
    await assert.rejects(() => client.createFixSession({ type: 'E', message: 'm', stack: 's' }), /429/);
  });

  test('throws when no API key', async () => {
    const client = createJulesClient({ apiKey: null, fetchImpl: async () => { throw new Error('should not fetch'); } });
    await assert.rejects(() => client.createFixSession({ type: 'E', message: 'm', stack: 's' }), /JULES_API_KEY/);
  });
});
```

- [ ] **Step 2: Run it to verify failure**

```bash
node --test tests/unit/
```

Expected: FAIL — cannot find module `jules.js`.

- [ ] **Step 3: Implement `server/services/jules.js`**

```js
import { childLogger } from '../lib/logger.js';

const log = childLogger('services/jules');

const API_URL = 'https://jules.googleapis.com/v1alpha/sessions';

export function buildPrompt(report) {
  return [
    'You are fixing a production error in this repository (an Express + React app, Vite frontend in `src/`, backend in `server/`).',
    '',
    `## Error report (${report.source === 'client' ? 'frontend crash' : 'server error'})`,
    `- Type: ${report.type}`,
    `- Message: ${report.message}`,
    report.requestId ? `- Request ID: ${report.requestId}` : '',
    report.path ? `- Request path: ${report.path}` : '',
    report.url ? `- Page URL: ${report.url}` : '',
    '',
    '## Stack trace',
    '```',
    report.stack || '(none available)',
    '```',
    '',
    '## Instructions',
    '1. Locate the root cause using the stack trace and file hints above.',
    '2. Fix the bug with the smallest correct change.',
    '3. Add or adjust a unit test (node --test tests/unit/) covering the failure.',
    '4. Run `node --test tests/unit/` and ensure it passes.',
    '5. Open a pull request from a branch named `jules/fix/<short-error-slug>` with a clear title and a description containing the original error message.',
  ].filter(Boolean).join('\n');
}

export function createJulesClient({
  apiKey = process.env.JULES_API_KEY,
  repo = 'couleeregiontennis/ltta',
  branch = 'main',
  fetchImpl = fetch,
} = {}) {
  return {
    async createFixSession(report) {
      if (!apiKey) throw new Error('JULES_API_KEY not set');
      const body = {
        prompt: buildPrompt(report),
        sourceContext: { source: 'GITHUB', githubRepoContext: { startingBranch: branch } },
      };
      log.info({ type: report.type, path: report.path || report.url }, 'Creating Jules fix session');
      const res = await fetchImpl(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Jules API error ${res.status}: ${text.slice(0, 500)}`);
      }
      const data = await res.json();
      const session = {
        name: data.name,
        url: data.url || `https://jules.google.com/session/${String(data.name || '').split('/').pop()}`,
      };
      log.info({ session: session.url }, 'Jules session created');
      return session;
    },
  };
}
```

- [ ] **Step 4: Run tests until green**

```bash
node --test tests/unit/
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add server/services/jules.js tests/unit/jules.test.mjs
git commit -m "feat: Jules API client with fix-session prompt builder"
```

---

### Task 5: Error reporter wiring + `/api/client-errors` endpoint (TDD)

**Files:**
- Create: `server/services/errorReporter.js`
- Create: `server/routes/clientErrors.js`
- Modify: `server/index.js` (mount route)
- Test: `tests/unit/errorReporter.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/unit/errorReporter.test.mjs`:

```js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createErrorReporter } from '../../server/services/errorReporter.js';

const report = () => ({ type: 'TypeError', message: 'boom', stack: 'TypeError: boom\n at f (/x.js:1:1)', source: 'client' });

describe('createErrorReporter', () => {
  test('records and triggers when enabled', () => {
    const triggered = [];
    const reporter = createErrorReporter({
      enabled: true,
      onTrigger: async (r) => { triggered.push(r); return { name: 's', url: 'u' }; },
    });
    const r = reporter.report(report());
    assert.equal(r.triggered, true);
    assert.deepEqual(triggered.length, 1);
  });

  test('does not trigger when disabled (kill switch)', () => {
    const reporter = createErrorReporter({ enabled: false, onTrigger: async () => { throw new Error('must not call'); } });
    const r = reporter.report(report());
    assert.equal(r.triggered, false);
    assert.equal(reporter.store.get(r.fingerprint).count, 1);
  });
});
```

- [ ] **Step 2: Run it to verify failure**

```bash
node --test tests/unit/
```

Expected: FAIL — cannot find module `errorReporter.js`.

- [ ] **Step 3: Implement `server/services/errorReporter.js`**

```js
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
    onTrigger: onTrigger || (async (report) => jules.createFixSession(report)),
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

// Default singleton used by the error handler and the client-errors route.
import { createErrorReporter as _c } from './errorReporter.js';
export const errorReporter = _c();
```

Correction: a file cannot import from itself. Define the singleton directly instead — remove the last two lines and end the file with:

```js
export const errorReporter = createErrorReporter();
```

and export `recordError` used by the error handler as:

```js
export function recordError(reportData) {
  return errorReporter.report(reportData);
}
```

- [ ] **Step 4: Implement `server/routes/clientErrors.js`**

```js
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
```

- [ ] **Step 5: Mount in `server/index.js`**

With the other route imports/mounts:

```js
import clientErrorsRouter from './routes/clientErrors.js';
// ...
app.use('/api/client-errors', clientErrorsRouter);
```

- [ ] **Step 6: Run tests until green and boot check**

```bash
node --test tests/unit/
LOG_LEVEL=debug timeout 5 node server/index.js
curl -s -X POST http://localhost:3010/api/client-errors -H 'Content-Type: application/json' -d '{"message":"test crash","stack":"Error: test\n at x"}' || true
```

Expected: all tests PASS; curl returns `{"ok":true,"fingerprint":"..."}` if a server was left running (optional manual check — skip curl in CI).

- [ ] **Step 7: Commit**

```bash
git add server/services/errorReporter.js server/routes/clientErrors.js server/index.js tests/unit/errorReporter.test.mjs
git commit -m "feat: client-error reporting endpoint wired to error store and Jules"
```

---

### Task 6: Frontend logger, global handlers, ErrorBoundary

**Files:**
- Create: `src/lib/logger.js`
- Create: `src/lib/reportError.js`
- Create: `src/components/ErrorBoundary.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create `src/lib/logger.js`**

```js
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[import.meta.env.VITE_LOG_LEVEL || 'info'] ?? LEVELS.info;

function emit(level, module, args) {
  if (LEVELS[level] < threshold) return;
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${module}]`;
  // eslint-disable-next-line no-console
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
```

- [ ] **Step 2: Create `src/lib/reportError.js`**

```js
const ENDPOINT = '/api/client-errors';

function requestId() {
  // Best effort: the server stamps this on responses; keep the last one seen.
  return window.__dshRequestId || null;
}

export function installRequestIdCapture() {
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const res = await origFetch(...args);
    try {
      const id = res.headers.get('x-request-id');
      if (id) window.__dshRequestId = id;
    } catch { /* ignore */ }
    return res;
  };
}

export function reportError({ message, stack, extra = {} }) {
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        stack,
        url: window.location.href,
        requestId: requestId(),
        ...extra,
      }),
      keepalive: true,
    }).catch(() => { /* best-effort only */ });
  } catch { /* never disrupt the UI */ }
}
```

- [ ] **Step 3: Create `src/components/ErrorBoundary.jsx`**

```jsx
import React from 'react';
import { reportError } from '../lib/reportError';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError({
      message: error.message,
      stack: [error.stack, info.componentStack].filter(Boolean).join('\n'),
      extra: { type: 'ReactRenderError' },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>The error has been reported. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 4: Wire global handlers in `src/main.jsx`**

```jsx
import { logger } from './lib/logger';
import { reportError, installRequestIdCapture } from './lib/reportError';
import ErrorBoundary from './components/ErrorBoundary';

installRequestIdCapture();

window.addEventListener('error', (event) => {
  logger.error('Uncaught error:', event.message);
  reportError({ message: event.message, stack: event.error?.stack || '', extra: { type: 'WindowError' } });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  logger.error('Unhandled rejection:', reason?.message || String(reason));
  reportError({
    message: reason?.message || String(reason),
    stack: reason?.stack || '',
    extra: { type: 'UnhandledRejection' },
  });
});

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
```

- [ ] **Step 5: Build verification**

```bash
pnpm run build
```

Expected: build completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/logger.js src/lib/reportError.js src/components/ErrorBoundary.jsx src/main.jsx
git commit -m "feat: frontend error capture with reporting endpoint and error boundary"
```

---

### Task 7: Final verification

**Files:** none new.

- [ ] **Step 1: Full unit test run**

```bash
node --test tests/unit/
```

Expected: all PASS.

- [ ] **Step 2: Boot and smoke-test the pipeline end to end**

With `JULES_ENABLED=false` in `.env` (kill switch respected):

```bash
node server/index.js &
sleep 2
curl -s -X POST http://localhost:3010/api/client-errors -H 'Content-Type: application/json' \
  -d '{"message":"smoke test crash","stack":"Error: smoke\n at f (/src/x.js:1:1)","url":"http://localhost/test"}'
cat server/data/error-store.json
kill %1
```

Expected: curl returns `{"ok":true,...}`; `error-store.json` contains one record with count 1 and `session: null`.

- [ ] **Step 3: Run existing e2e suite if env allows**

```bash
pnpm run test:e2e
```

Expected: no new failures caused by logging changes (requires `.env` with Supabase dummy values per AGENTS.md).

- [ ] **Step 4: Commit any remaining changes and summarize**

```bash
git status
git add -A && git commit -m "chore: final integration of logging and Jules error pipeline" || true
```

---

## Self-Review Notes

- **Spec coverage:** backend logging (Tasks 1–2), frontend logging (Task 6), client-error endpoint (Task 5), error store/dedupe/cap (Task 3), Jules client + prompt (Task 4), config/env (Task 1), kill switch (Task 5), tests throughout. CI-failure triggers and log aggregation are explicitly out of scope per spec.
- **Placeholders:** none — all steps carry complete code or exact commands.
- **Type consistency:** `reporter.report()` / `errorReporter.report()` / `recordError()` all return `{fingerprint, record, triggered, triggerError?}`; store API (`record/get/all/sessionsToday`) used consistently across Tasks 3, 4, 5. The self-import bug in Task 5 Step 3 is flagged inline with the corrected code.
