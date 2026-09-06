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
    assert.deepEqual(JSON.parse(captured.opts.body).sourceContext, { source: 'GITHUB', githubRepoContext: { startingBranch: 'main' } });
    assert.equal(s.url, 'https://jules.google.com/session/42');
  });

  test('falls back to derived URL when API returns no url', async () => {
    const client = createJulesClient({ apiKey: 'k', fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ name: 'sessions/77' }) }) });
    const s = await client.createFixSession({ type: 'E', message: 'm', stack: 's' });
    assert.equal(s.url, 'https://jules.google.com/session/77');
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
