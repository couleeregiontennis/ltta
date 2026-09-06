# Logging & Auto-Jules Error Pipeline — Design

Date: 2026-09-06
Status: Approved (design discussion)

## Goal

Add comprehensive, correlated logging across the LTTA app (Express backend + React frontend) and automatically feed qualifying errors to Google's Jules coding agent, which opens a pull request with a fix.

## Scope

- Backend: structured logging with pino, request IDs, centralized error middleware.
- Frontend: global error/unhandledrejection capture, lightweight logger, error boundary, reporting endpoint.
- Jules bridge: error store with deduplication and a 10-sessions/day cap, direct Jules API integration.
- Out of scope: CI-failure triggers, third-party log aggregation, a separate worker service.

## Backend Logging

- Add `pino` as the logger and `pino-http` for request logging.
- Log level via `LOG_LEVEL` env var, default `info`.
- Request-ID middleware: every request gets an `x-request-id` (generated if absent). The ID appears in every log line for that request and is returned to the browser via response header, so frontend error reports can be correlated with server logs.
- Each route module uses `logger.child({ module: 'routes/<name>' })`; existing ad-hoc `console.error` calls in `server/` are replaced.
- Centralized error middleware (registered last) logs the full stack plus a request summary at `error` level and classifies errors (handled 4xx vs unhandled/500).

## Frontend Logging

- `src/lib/logger.js`: small `debug/info/warn/error` util (console-backed, includes timestamps and a module label).
- Global capture: `window.addEventListener('error')` and `('unhandledrejection')` in `src/main.jsx`.
- `ErrorBoundary` component wrapping the app to report React render crashes and show a fallback UI.
- All three report to `POST /api/client-errors` with `{message, stack, url, requestId, userAgent}`. Reporting is best-effort: failures are swallowed and never disrupt the UI.

## Client-Error Endpoint

- `POST /api/client-errors` accepts a bounded payload (message ≤ 2 KB, stack ≤ 16 KB), rate-limited per IP to prevent abuse, and requires no auth.
- The endpoint logs the report (including the correlated `requestId`) and hands qualifying crashes to the error store.

## Jules Bridge

### Error store (`server/services/error-store.js`)

- Fingerprint = SHA-256 of `errorType + topStackFrame + normalizedMessage` (numbers/IDs in the message normalized out).
- Persisted to `server/data/error-store.json`; records: fingerprint, count, first/last seen, sample report, Jules session info (id/PR URL/status) when triggered.
- Deduplication: a fingerprint triggers Jules once; reoccurrences increment the count and are logged.
- Rate cap: at most **10 new Jules sessions per UTC day**. Beyond the cap the error is stored and logged as `warn` and remains eligible for manual follow-up, but no API call is made.
- Eligibility: only unhandled/5xx server errors and frontend crashes are forwarded. Handled 4xx client mistakes are logged only.

### Jules client (`server/services/jules.js`)

- Thin client for the Jules API (`JULES_API_KEY` env var). Creates a session against this repo's GitHub origin, providing:
  - the error message, type, and stack,
  - the request ID and correlated recent server log lines,
  - file/line hints extracted from the stack,
  - instructions to diagnose, fix, add/adjust tests, and open a PR with a descriptive branch name (e.g. `jules/fix/<error-slug>`).
- Responses/errors from the API are logged with the fingerprint for traceability; session URL is recorded in the error store.

## Configuration

New entries in `.env.example`:

- `LOG_LEVEL` (default `info`)
- `JULES_API_KEY` (no default)
- `JULES_ENABLED` (default `false` — kill switch until the key is configured)

## Testing

- Unit tests for the error store: fingerprint stability/normalization, dedupe behavior, and the 10/day cap.
- Unit test for the Jules prompt builder (with the API client mocked).
- Test for `POST /api/client-errors`: stores a report and, with Jules mocked, triggers exactly one session for a duplicate-free error.

## Non-Goals

- No external log aggregation/retention service.
- No auto-merge of Jules PRs; PRs are opened for human review.
- No changes to CI for routing failures to Jules.
