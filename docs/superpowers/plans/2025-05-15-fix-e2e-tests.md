# Fix E2E Test Failures - Profile Logic and Robust Mocks

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 29 failing E2E tests by improving Auth mocks, updating test data, fixing Strict Mode violations, and ensuring loading states are handled.

**Architecture:** 
1. Improve `tests/utils/auth-mock.js` to provide realistic player data.
2. Update `tests/e2e/` files to match the new mock expectations.
3. Fix label/input selector conflicts for 'Password'.
4. Add wait-for-loading logic to tests.

**Tech Stack:** Playwright, React, Supabase

---

### Task 1: Improve `tests/utils/auth-mock.js`

**Files:**
- Modify: `tests/utils/auth-mock.js`

- [ ] **Step 1: Update `mockSupabaseAuth` default player data**
Include `first_name`, `last_name` by default. Update `player_to_team` to include `status: 'active'`.

```javascript
// In mockSupabaseAuth
  const playerData = [
    {
      id: defaultUser.id,
      user_id: defaultUser.id,
      first_name: userDetails.first_name || 'Test',
      last_name: userDetails.last_name || 'User',
      // ...
    },
    // ...
  ];

  // In player_to_team mock results
  result.player = {
    // ...
    status: 'active'
  };
```

- [ ] **Step 2: Ensure 'Loading...' handling is robust in the mock if applicable**
Actually, loading is handled in tests, so we just need the data to be there.

### Task 2: Fix 'Strict Mode' violations for Password field

**Files:**
- Modify: `tests/e2e/login.spec.js` (and others as found)

- [ ] **Step 1: Replace ambiguous 'Password' selectors**
Replace `page.getByLabel('Password')` or similar with `page.locator('input#password')` if it conflicts with a toggle button.

### Task 3: Iteratively update failing tests in `tests/e2e/`

**Files:**
- Modify: `tests/e2e/add-score.spec.js`
- Modify: `tests/e2e/sub-board.spec.js`
- Modify: `tests/e2e/rainout.spec.js`
- Modify: `tests/e2e/player-management.spec.js`
- Modify: `tests/e2e/admin-score-override.spec.js`
- Others as identified.

- [ ] **Step 1: Fix `add-score.spec.js`**
Ensure it waits for loading to clear and uses robust mock data.

- [ ] **Step 2: Fix `sub-board.spec.js`**
Ensure it waits for loading to clear and uses robust mock data.

- [ ] **Step 3: Fix `rainout.spec.js`**
Ensure it waits for loading to clear and uses robust mock data.

- [ ] **Step 4: Fix `player-management.spec.js`**
Ensure it waits for loading to clear and uses robust mock data.

- [ ] **Step 5: Fix `admin-score-override.spec.js`**
Ensure it waits for loading to clear and uses robust mock data.

### Task 4: Global Verification

- [ ] **Step 1: Run all tests to ensure they pass**
Run: `npx playwright test`
Expected: 0 failures
