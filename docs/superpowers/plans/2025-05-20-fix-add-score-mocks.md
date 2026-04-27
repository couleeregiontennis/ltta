# Fix Add Score E2E Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix timeout in 'Add Score' E2E tests by ensuring Supabase mocks return expected single objects and matching team records.

**Architecture:** Update `auth-mock.js` to support PostgREST object responses for single row queries and update the E2E test to provide the specific data required by `AddScore.jsx`.

**Tech Stack:** Playwright, Supabase (PostgREST)

---

### Task 1: Update auth-mock.js for Single Object Responses

**Files:**
- Modify: `tests/utils/auth-mock.js`

- [ ] **Step 1: Ensure `player` and `season` mocks return objects when requested**
Check the `Accept` header for `vnd.pgrst.object`.

- [ ] **Step 2: Update `player_to_team` mock in `auth-mock.js`**
The default mock for `player_to_team` currently returns `[]`. It should probably return a default record if requested, and handle `vnd.pgrst.object`.

### Task 2: Update add-score.spec.js with Correct Mocks

**Files:**
- Modify: `tests/e2e/add-score.spec.js`

- [ ] **Step 1: Update `mockSupabaseAuth` call and add required mocks**
Update the ID to `captain-user-id` and mock `player_to_team`, `team`, and `team_match`.

- [ ] **Step 2: Fix `team_match` mock path**
The current test mocks `**/rest/v1/matches*`, but the component uses `team_match`.

### Task 3: Verify Fix

- [ ] **Step 1: Run the tests**
Run: `npx playwright test tests/e2e/add-score.spec.js`

- [ ] **Step 2: Confirm 'Loading...' clears and 'matchId' select is visible**
