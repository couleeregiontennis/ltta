import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createErrorReporter } from '../../server/services/errorReporter.js';

const report = () => ({ type: 'TypeError', message: 'boom', stack: 'TypeError: boom\n at f (/x.js:1:1)', source: 'client' });

describe('createErrorReporter', () => {
  test('records and triggers when enabled', () => {
    const triggered = [];
    const reporter = createErrorReporter({
      enabled: true,
      storePath: null,
      onTrigger: async (r) => { triggered.push(r); return { name: 's', url: 'u' }; },
    });
    const r = reporter.report(report());
    assert.equal(r.triggered, true);
    assert.equal(triggered.length, 1);
  });

  test('does not trigger when disabled (kill switch)', () => {
    const reporter = createErrorReporter({ enabled: false, storePath: null, onTrigger: async () => { throw new Error('must not call'); } });
    const r = reporter.report(report());
    assert.equal(r.triggered, false);
    assert.equal(reporter.store.get(r.fingerprint).count, 1);
  });
});
