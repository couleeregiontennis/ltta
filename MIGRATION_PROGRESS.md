# Local Hosting & Supabase/GitHub Pages Migration Tracker

This document tracks progress, architecture decisions, and remaining tasks for migrating the LTTA tennis platform off Supabase and GitHub Pages onto a fully local self-hosted stack (Express + SQLite + Ollama/Qdrant + systemd).

## Worktree & Branch Details
- **Branch**: `feature/local-hosting-migration`
- **Worktree Directory**: `/home/brett/Code/ltta-local`
- **Primary Repo**: `/home/brett/Code/ltta` (clean on `main`)

---

## 1. Architectural Blueprint
- **Frontend**: React (Vite SPA) served directly by Express static middleware with client-side SPA routing fallback (`/*` -> `index.html`).
- **Backend API**: Express.js server on port 3010 (`server/index.js`), using `/api/*` prefix.
- **Database**: SQLite database using `better-sqlite3` located at `server/ltta.db` (WAL mode enabled, foreign keys enforced).
- **Authentication**: Native bcrypt password hashing + JWT authentication via HTTP-only cookies (`/api/auth/*`).
- **AI & Vector Integration**:
  - Voice score parsing: `/api/ai/parse-score` -> Local Ollama (`gemma4:4b` / `qwen3.5-cpu` or configured local Ollama instance).
  - Rules assistant: `/api/ai/ask-umpire` -> Ollama embeddings (`nomic-embed-text`) + Qdrant search + Ollama answer generation.
- **Process Management**: Systemd user service (`ltta.service`), mirroring MoneyBoard setup.
- **Authorization & Ownership Rules**:
  - `player`: Players can only modify their own profile record (`PUT /api/players/me`), with fields like `is_admin` and `is_captain` restricted from user modification. Admins can update any player via `/api/admin/players/:id`.
  - `matches` & `line_results`: Non-admin captains can only submit scores, line results, or toggle roster status for matches that directly involve their team (`home_team_id` or `away_team_id`). Attempting to edit other teams' matches returns `403 Forbidden`. Regular players cannot submit scores.
  - `teams` & `player_to_team`: Captains can only invite, approve, or remove players for their own assigned team (`POST/PATCH/DELETE /api/teams/:id/roster`).
  - `sub_request`: Captains can only cancel or delete requests they created. Any authenticated user can claim an open sub request.
  - `season_payments`: Regular users can only create and view their own payments (`player_id = req.player.id`). Only admins can modify or delete payment records or inspect payments across all players.
  - `admin`: Audit logs, player role promotions, and suggestion triage strictly require `req.player.is_admin == 1`.

---

## 2. Migration Phase Status

### Phase 1: Local Backend & Database Architecture
- [x] Create SQLite schema and DB manager (`server/db.js`)
  - [x] All 19 tables mapped (users, season, location, team, player, matches, line_results, etc.)
  - [x] Indexes created
  - [x] Audit logging helper implemented
- [x] Create Express entry point (`server/index.js`)
- [x] Implement Auth middleware (`server/middleware/auth.js`)
  - [x] JWT token generation & verification
  - [x] Cookie parser & Bearer header support
  - [x] `requireAuth`, `requireCaptain`, `requireAdmin`, `loadPlayer`
- [x] Implement Express route handlers:
  - [x] `server/routes/auth.js` (signup, login, logout, session, reset-password, update-password)
  - [x] `server/routes/players.js` (CRUD, /me, /me/team, /me/matches)
  - [x] `server/routes/teams.js` (CRUD, /roster, /matches)
  - [x] `server/routes/matches.js` (listing, single, status update, flagging, line results upsert, batch scores/lines, roster status)
  - [x] `server/routes/standings.js` (2026 rule standings CTE calculation, recent matches, league overview)
  - [x] `server/routes/seasons.js` (list, active season, single)
  - [x] `server/routes/locations.js` (list, single)
  - [x] `server/routes/subRequests.js` (list, create, claim, cancel, delete)
  - [x] `server/routes/payments.js` (list, create, update, delete with permissions)
  - [x] `server/routes/suggestions.js` (list, create, status patch)
  - [x] `server/routes/admin.js` (audit-logs, players listing, player edit, player role assignment)
  - [x] `server/routes/ai.js` (parse-score via Ollama, ask-umpire via Ollama + Qdrant)

### Phase 2: Frontend Data Layer & Component Migration
- [x] Central API Client (`src/scripts/apiClient.js`) created with HTTP-only cookie support
- [x] `src/context/AuthProvider.jsx` updated to use `/api/auth/session` and native session management
- [x] Hooks updated:
  - [x] `src/hooks/useSeason.js`
  - [x] `src/hooks/useVoiceScoreInput.js`
  - [x] `src/hooks/useTeamStatsData.js`
- [x] Component migrations off Supabase:
  - [x] `Login.jsx`
  - [x] `UpdatePassword.jsx`
  - [x] `MatchSchedule.jsx`
  - [x] `Standings.jsx`
  - [x] `Team.jsx`
  - [x] `MySchedule.jsx`
  - [x] `PlayerRankings.jsx`
  - [x] `LandingPage.jsx`
  - [x] `AddScore.jsx`
  - [x] `CaptainDashboard.jsx`
  - [x] `PlayerProfile.jsx`
  - [x] `OnboardingWizard.jsx`
  - [x] `SubBoard.jsx`
  - [x] `PayDues.jsx`
  - [x] `CourtsLocations.jsx`
  - [x] `AskTheUmpire.jsx`
  - [x] `SuggestionBox.jsx`
  - [x] `admin/ScheduleGenerator.jsx`
  - [x] `admin/AuditLogViewer.jsx`
  - [x] `admin/PlayerManagement.jsx`
  - [x] `admin/PaymentManagement.jsx`

### Phase 3: Dependencies, Package Configuration & Build Verification
- [x] Add missing runtime packages (`better-sqlite3`, `express`, `cookie-parser`, `bcrypt`, `jsonwebtoken`) to `package.json`
- [x] Add backend start scripts (`npm run server`, `npm start`, `npm run db:seed`)
- [x] Seed script or test data generator for local `ltta.db` (`scripts/seed-local-db.js`)
- [x] Build verification (`npm run build` verified in worktree)
- [x] Verify Express server startup and API responses (tested `/api/auth/*`, `/api/teams`, `/api/standings`, `/api/players/me/team`, SPA fallback)

### Phase 4: Clean Up Cloud Artifacts & Service Setup
- [x] Remove unused Supabase keepalive GitHub workflows:
  - `.github/workflows/keep-supabase-active-prod.yml`
  - `.github/workflows/keep-supabase-active-staging.yml`
  - `.github/workflows/supabase-migrations.yml`
  - `.github/workflows/supabase-migrations-staging.yml`
  - `.github/workflows/deploy-pages.yml`
- [x] Remove `netlify.toml` and `.netlifyignore`
- [x] Create systemd service template (`ltta.service`)
- [x] Installed, enabled, and started user systemd service `ltta.service` (running persistently on port 3010, auto-restarts, user lingering enabled)
- [x] Installed and enabled `homebrew.ollama.service` with `gemma2:2b` and `nomic-embed-text`
- [x] Uninstalled unused `n8n`, local `supabase` (11 containers), and `cline-kanban` to optimize host RAM and CPU headroom

---

## 3. Resume / Pause Quick Reference
To pause or resume:
- Work is isolated in `/home/brett/Code/ltta-local` on branch `feature/local-hosting-migration`.
- Any progress updates must be committed to git and logged here.
