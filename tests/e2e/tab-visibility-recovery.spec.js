import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

// Regression test for the "leave tab and return -> app stuck on Loading..." bug.
//
// Root cause: when the browser tab regains focus and the Supabase access token is
// within the 90s expiry margin, @supabase/auth-js refreshes the token inside its
// auth lock and awaits the app's onAuthStateChange callback *within that lock*.
// The app's callback awaited prefetchCoreData(), which issues Supabase REST
// queries. Each REST query calls auth.getSession() -> _acquireLock(), which
// re-enters the lock and waits on the outer operation -> circular wait (deadlock).
// The lock is then held forever, so every subsequent page's data fetch hangs and
// the UI stays on "Loading..." indefinitely.
//
// This test forces a token refresh by marking the stored session as near-expiry,
// simulates the tab going hidden then visible, and verifies that data still
// rehydrates afterwards (without a manual page refresh).

test.describe('Tab visibility recovery', () => {
  test('rehydrates data after leaving and returning to the tab (token refresh on focus)', async ({ page }) => {
    await mockSupabaseAuth(page, { is_captain: true });

    // 1. Load a protected page and confirm data is shown.
    await page.goto('/my-schedule');
    await expect(page.getByRole('heading', { name: 'My Schedule' })).toBeVisible({ timeout: 15000 });

    // 2. Force the stored session to be near expiry so returning to the tab
    //    triggers @supabase/auth-js' visibility-based token refresh.
    await page.evaluate(() => {
      const nearExpiry = Math.floor(Date.now() / 1000) + 30; // 30s < 90s expiry margin
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && /^sb-.*-auth-token$/.test(k)) {
          try {
            const v = JSON.parse(localStorage.getItem(k));
            if (v && typeof v === 'object') {
              v.expires_at = nearExpiry;
              localStorage.setItem(k, JSON.stringify(v));
            }
          } catch (e) {
            /* ignore non-JSON entries */
          }
        }
      }
    });

    // 3. Simulate leaving (hidden) and returning (visible) to the tab.
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      window.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(150);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      window.dispatchEvent(new Event('visibilitychange'));
    });

    // 4. Allow the visibility-triggered token refresh + auth state change to settle.
    await page.waitForTimeout(500);

    // 5. Client-side navigate (no full reload, so the in-memory auth client persists)
    //    to another protected page. Before the fix the auth lock was deadlocked and
    //    this page would hang on "Loading captain dashboard..." forever.
    await page.evaluate((path) => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, '/captain-dashboard');

    // 6. The new page must recover and render its content without a manual refresh.
    await expect(page.getByRole('heading', { name: 'Captain Dashboard' })).toBeVisible({ timeout: 15000 });
  });
});
