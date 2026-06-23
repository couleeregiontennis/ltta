# Fix E2E Test Failures (AuthProvider and Player Mocks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 26 E2E test failures by standardizing Supabase mocks, ensuring robust player and season data, and fixing common UI interaction issues like missing Loading clear checks and Strict Mode violations.

**Architecture:** Update central `auth-mock.js` utility and refactor tests to use it. Add consistent post-navigation checks for loading indicators.

**Tech Stack:** Playwright (E2E Testing), Supabase (Mocked)

---

### Task 1: Update auth-mock utility

**Files:**
- Modify: `tests/utils/auth-mock.js`

- [ ] **Step 1: Update mockSupabaseAuth to include robust player and season data**
Ensure `status: 'active'` is present for players and `season` mock is robust (handling both array and object responses via Accept header).

```javascript
// tests/utils/auth-mock.js

export async function mockSupabaseAuth(page, userDetails = {}) {
  const { 
    id = 'test-user-id', 
    email = 'test@example.com', 
    is_captain = false, 
    is_admin = false,
    first_name = 'Test',
    last_name = 'User'
  } = userDetails;

  // ... (previous mocks for session/user)

  // 3. Mock player record check (AuthProvider core)
  await page.route(url => url.pathname.includes('/rest/v1/player'), async (route) => {
    const method = route.request().method();
    const accept = route.request().headers()['accept'] || '';

    if (method === 'GET') {
      const data = { 
        id: 'p1', 
        user_id: id, 
        email, 
        first_name, 
        last_name, 
        is_captain, 
        is_admin,
        ranking: 3,
        status: 'active', // Added as requested
        is_active: true
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(accept.includes('vnd.pgrst.object') ? data : [data]),
      });
    } else {
      await route.continue();
    }
  });

  // 4. Mock season fetching (Required for AuthProvider initialization)
  await page.route(url => url.pathname.includes('/rest/v1/season'), async (route) => {
    if (route.request().method() === 'GET') {
      const data = { 
        id: 's1', 
        number: 1, 
        is_active: true, 
        is_current: true, // Added for robustness
        start_date: '2026-01-01', 
        end_date: '2026-12-31' 
      };
      const accept = route.request().headers()['accept'] || '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(accept.includes('vnd.pgrst.object') ? data : [data]),
      });
    } else {
      await route.continue();
    }
  });
  
  // ...
}
```

### Task 2: Refactor add-score.spec.js and add_score_security.spec.js

**Files:**
- Modify: `tests/e2e/add-score.spec.js`
- Modify: `tests/e2e/add_score_security.spec.js`

- [ ] **Step 1: Update add-score.spec.js**
Add 'Loading...' clear checks and ensure `mockSupabaseAuth` is used correctly.

- [ ] **Step 2: Update add_score_security.spec.js**
Add 'Loading...' clear checks.

### Task 3: Refactor rainout.spec.js

**Files:**
- Modify: `tests/e2e/rainout.spec.js`

- [ ] **Step 1: Simplify mocks in rainout.spec.js**
Remove manual `season` and `player` mocks that duplicate `mockSupabaseAuth`. Add `Loading...` clear checks.

### Task 4: Refactor suggestion-box.spec.js and sub-board.spec.js

**Files:**
- Modify: `tests/e2e/suggestion-box.spec.js`
- Modify: `tests/e2e/sub-board.spec.js`

- [ ] **Step 1: Simplify mocks in suggestion-box.spec.js**
Use `mockSupabaseAuth` and remove manual `player` mocks. Add `Loading...` clear checks.

- [ ] **Step 2: Simplify mocks in sub-board.spec.js**
Use `mockSupabaseAuth` and remove manual `player` mocks. Add `Loading...` clear checks.

### Task 5: Fix Password Field Strict Mode Violations

**Files:**
- Modify: `tests/e2e/login.spec.js`
- Modify: `tests/e2e/forgot-password.spec.js` (if applicable)

- [ ] **Step 1: Ensure unique Password selectors**
Update tests to use `page.locator('input#password')` or `page.getByLabel('Password', { exact: true })` to avoid conflicts with visibility toggle buttons.

### Task 6: Final Verification

- [ ] **Step 1: Run the affected tests**
Run: `npx playwright test tests/e2e/add-score.spec.js tests/e2e/rainout.spec.js tests/e2e/add_score_security.spec.js tests/e2e/suggestion-box.spec.js tests/e2e/sub-board.spec.js tests/e2e/login.spec.js`
Expected: PASS
