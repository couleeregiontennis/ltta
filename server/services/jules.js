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
