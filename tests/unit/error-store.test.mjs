import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

  test('first report triggers and stores session info (sync onTrigger)', () => {
    const store = createErrorStore({
      now: () => new Date('2026-09-06T10:00:00Z'),
      onTrigger: () => ({ name: 's1', url: 'https://jules/x' }),
    });
    const result = store.record(report());
    assert.equal(result.triggered, true);
    assert.equal(store.get(result.fingerprint).session.url, 'https://jules/x');
  });

  test('duplicate is deduped (counted, not re-triggered)', () => {
    const store = createErrorStore({ now: () => new Date('2026-09-06T10:00:00Z'), onTrigger: () => ({ name: 's1', url: 'u' }) });
    const first = store.record(report());
    const dup = store.record(report());
    assert.equal(dup.triggered, false);
    assert.equal(store.get(first.fingerprint).count, 2);
  });

  test('stops triggering after 10 sessions in one UTC day', () => {
    let triggers = 0;
    const store = createErrorStore({
      now: () => new Date('2026-09-06T10:00:00Z'),
      onTrigger: () => { triggers++; return { name: 's', url: 'u' }; },
    });
    for (let i = 0; i < 12; i++) {
      store.record({ ...report(), message: `unique error number ${i}`, stack: `E: ${i}\n at f${i}` });
    }
    assert.equal(triggers, 10);
    assert.equal(store.sessionsToday(), 10);
  });

  test('cap resets on a new UTC day', () => {
    let day = 6;
    const store = createErrorStore({
      now: () => new Date(`2026-09-0${day}T10:00:00Z`),
      onTrigger: () => ({ name: 's', url: 'u' }),
    });
    for (let i = 0; i < 10; i++) store.record({ ...report(), message: `m${i}`, stack: `E\n at f${i}` });
    day = 7;
    const r = store.record({ ...report(), message: 'fresh day', stack: 'E\n at fresh' });
    assert.equal(r.triggered, true);
  });

  test('sync onTrigger failure still records the error', () => {
    const store = createErrorStore({
      now: () => new Date('2026-09-06T10:00:00Z'),
      onTrigger: () => { throw new Error('api down'); },
    });
    const result = store.record(report());
    assert.equal(result.triggered, false);
    assert.equal(result.triggerError, 'api down');
    assert.equal(store.get(result.fingerprint).count, 1);
  });

  test('async onTrigger failure still records the error', async () => {
    const store = createErrorStore({
      now: () => new Date('2026-09-06T10:00:00Z'),
      onTrigger: async () => { throw new Error('async down'); },
    });
    const result = store.record(report());
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(store.get(result.fingerprint).count, 1);
  });

  test('persists and reloads records from filePath', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'estore-'));
    const file = path.join(dir, 'store.json');
    const mk = () => createErrorStore({ filePath: file, now: () => new Date('2026-09-06T10:00:00Z'), onTrigger: () => ({ name: 's', url: 'u' }) });
    const first = mk().record(report());
    const second = mk(); // fresh store instance reloading from disk
    const dup = second.record(report());
    assert.equal(dup.triggered, false, 'reloaded record must be deduped');
    assert.equal(second.get(first.fingerprint).count, 2);
  });
});
