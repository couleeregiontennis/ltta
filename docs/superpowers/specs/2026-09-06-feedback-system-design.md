# Feedback / Bug / Feature Request System — Design

Date: 2026-09-06
Status: Approved (pending implementation)

## Overview

Upgrade the existing text-only SuggestionBox into a state-of-the-art feedback system.
A floating feedback widget on every page lets logged-in users submit **Bugs, Feature
Requests, and Feedback** with screenshot attachments and automatically captured
diagnostics. On submission, the server spawns the local `agy` CLI agent in a Product
Owner role to flesh out the requirements; the resulting spec is stored on the record
for admin review.

## Goals

- One-click, low-friction feedback from any page for logged-in users.
- Rich bug reports: screenshots, recent frontend errors, recent server errors.
- Every submission is enriched into a structured mini-spec by an AI Product Owner.
- Admins get a single review queue with approve / reject / re-run actions.

## Non-goals

- Anonymous submissions (existing Turnstile captcha flow is retired with SuggestionBox).
- GitHub issue creation or repo file writes by the agent.
- A separate worker process or external message queue.

## Architecture

Async, server-spawned agent approach (chosen over a dedicated worker process and over
synchronous invocation): submissions persist immediately and return `201`; agy runs in
the background; the admin UI reflects enrichment status.

### 1. Frontend widget

- New `FeedbackWidget` component: floating action button, bottom-right, modern glassy
  style, keyboard accessible, shown on all pages for logged-in users. Replaces the
  SuggestionBox page and route.
- Modal with:
  - Type selector: **Bug / Feature Request / Feedback** (segmented pills).
  - Title and description fields.
  - Screenshot attachments: drag-and-drop, file picker, and clipboard paste
    (`Ctrl+V`). Client-side downscale to max ~1600px. PNG/JPEG/WebP, max 3 images,
    5 MB each.
- On submit: optimistic confirmation — "Received — our product owner agent is drafting
  the spec."

### 2. Backend API

- Extend the `suggestions` table (SQLite migration):
  - New columns: `type` (bug|feature|feedback), `title`, `page_url`, `user_agent`,
    `spec` (JSON from agy), `spec_status` (pending|processing|ready|failed),
    `diagnostics` (JSON, bug reports only).
  - New table `suggestion_attachments` (id, suggestion_id, filename, mime, size, path).
- `POST /suggestions` accepts `multipart/form-data` (multer):
  - Validates mime (sniffed, not just declared) and size caps.
  - Saves images to `server/data/uploads/feedback/`.
  - Inserts row, snapshots server diagnostics (bugs only), fires async PO processing.
  - Returns `201` immediately.
- `GET /suggestions`: admins see all rows with attachment URLs and diagnostics; users
  see their own.
- `POST /suggestions/:id/respec` (admin): re-run agy enrichment.
- Attachment images served through an admin-auth-checked route, not public static
  files.
- Orphan-file cleanup when an insert fails after files were written.

### 3. Diagnostics capture (bug reports only)

Frontend — `src/scripts/errorJournal.js`:
- Ring buffer of the last ~50 events, in memory + `sessionStorage`.
- Captures: `window.onerror` / `unhandledrejection` (message, stack, location), failed
  fetch/API calls (via `apiClient` wrapper: URL, status, duration), route changes.
- Bug submissions attach the buffer plus viewport and browser/OS info.
- The modal shows a small, collapsible "includes N recent errors" note (privacy-honest
  preview).

Server:
- Lightweight in-memory ring buffer (~200 entries) of unhandled route errors, 5xx
  responses, and DB errors, via an Express error-middleware hook. No logging framework.
- On a bug submission, snapshot entries from the 15 minutes prior, filtered to the
  reporting user's requests where identifiable, stored in `diagnostics.server_log`.
- Diagnostics JSON capped at ~64 KB, truncated with a marker if larger.

### 4. agy Product Owner integration (`server/poAgent.js`)

- Spawns `agy --print --output-format json --json-schema <schema>` (binary path
  overridable via `AGY_BIN` env var; default `~/.local/bin/agy`).
- PO persona prompt receives type, title, description, page URL, user agent,
  frontend error journal, server-log snapshot, and attached screenshot file paths.
- Structured output schema:
  `{ user_story, acceptance_criteria[], priority, severity, category,
     questions_for_reporter[], assumptions[] }`.
- The repro/spec section cites actual captured errors (e.g. "`TypeError at
  Standings.jsx:112` occurred 40s before report").
- Result stored in `spec`; `spec_status` becomes `ready` or `failed` (with error note).
- Simple in-process queue, max 1 agy process at a time (follows the existing
  `llmQueue.js` pattern). 5-minute timeout → `failed`.
- If agy is missing or fails, the submission still succeeds; enrichment simply shows
  `failed`. The user is never blocked.

### 5. Admin review UI (`src/components/admin/`)

- New "Feedback" admin panel: list with type / status / priority filters.
- Expandable rows: reporter's raw input, screenshots, agy spec.
- Actions: approve, reject, re-run PO.
- Badge in admin nav when unseen items have `spec_status = 'ready'`.

## Error handling

- Upload validation with mime sniffing and size caps; 4xx with clear messages.
- agy timeouts and spawn failures mark `spec_status = 'failed'`; never surface agent
  errors to submitters.
- File writes cleaned up if the DB insert fails.

## Testing

- Jest: route logic, multipart handling, diagnostics snapshotting, queue behavior.
- Playwright E2E: widget happy path with agy mocked via `AGY_BIN` env override.
- Per AGENTS.md: before/after screenshots of affected UI.

## Migration / rollout

- One SQLite migration adding columns + attachment table; existing suggestions rows
  default to `type='feedback'`, `spec_status='pending'` (never re-enriched).
- SuggestionBox page/route removed after the widget ships.
