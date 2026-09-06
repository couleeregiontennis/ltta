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
    let calls = 0;
    const reporter = createErrorReporter({
      enabled: false,
      storePath: null,
      onTrigger: () => { calls += 1; return { name: 's', url: 'u' }; },
    });
    const r = reporter.report(report());
    assert.equal(r.triggered, false);
    assert.equal(calls, 0, 'onTrigger must not be invoked when disabled');
    assert.equal(reporter.store.get(r.fingerprint).count, 1);
  });

  test('default singleton creation is safe without env config', async () => {
    const { createErrorReporter: fresh } = await import('../../server/services/errorReporter.js');
    const rep = fresh({ enabled: false, storePath: null });
    const r = rep.report(report());
    assert.equal(r.triggered, false);
  });
});
