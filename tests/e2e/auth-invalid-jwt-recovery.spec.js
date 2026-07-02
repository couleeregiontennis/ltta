import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Invalid JWT Recovery Flow', () => {
  test('should auto-refresh session when queries return 401/PGRST301 and recover without manual reload', async ({ page }) => {
    await disableNavigatorLocks(page);

    let authErrorReturned = false;

    // Log network requests for debugging
    page.on('request', req => {
      if (req.url().includes('supabase.co')) {
        console.log('[NET]', req.method(), req.url().substring(0, 140));
      }
    });

    // Also collect page console logs
    page.on('console', msg => {
      if (msg.text().includes('[CustomFetch]') || msg.text().includes('[AuthProvider]')) {
        console.log('[PAGE]', msg.text());
      }
    });

    // 1. Inject an expired-looking session token into localStorage
    await page.addInitScript(() => {
      const mockSession = {
        access_token: 'expired-bad-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token-for-test',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      window.localStorage.setItem('sb-shlcqztfdhfwkhijwgue-auth-token', JSON.stringify(mockSession));
      window.localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
    });

    // 2. Intercept auth token refresh — return a fresh session
    await page.route('**/auth/v1/token*', async (route) => {
      console.log('[ROUTE] token:', route.request().method());
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'refreshed-valid-jwt-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'new-refresh-token',
          user: { id: 'test-user-id', email: 'test@example.com', aud: 'authenticated', role: 'authenticated' }
        })
      });
    });

    // 3. Intercept player query: first call returns 401, subsequent return valid
    let playerCallCount = 0;
    await page.route('**/rest/v1/player*', async (route) => {
      if (route.request().method() === 'GET') {
        playerCallCount++;
        console.log('[ROUTE] player #' + playerCallCount);
        if (playerCallCount === 1) {
          authErrorReturned = true;
          return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ code: 'PGRST301', message: 'JWT expired' })
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'p1', user_id: 'test-user-id', email: 'test@example.com',
            first_name: 'Test', last_name: 'User',
            is_captain: false, is_admin: false, is_active: true
          })
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // 4. Intercept season query
    await page.route('**/rest/v1/season*', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('[ROUTE] season');
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 's1', number: 1, is_active: true, is_current: true }])
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // 5. Mock auth endpoints
    await page.route('**/auth/v1/user*', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id', email: 'test@example.com',
          aud: 'authenticated', role: 'authenticated'
        })
      });
    });

    // 6. Mock team_match queries
    await page.route('**/rest/v1/team_match*', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // 7. Navigate to the homepage
    await page.goto('/');

    // 8. Wait for the reconnecting banner — the custom fetch detects 401 and triggers recovery
    await page.waitForSelector('.reconnecting-banner', { state: 'visible', timeout: 10000 });
    console.log('[TEST] Banner appeared');

    // 9. Wait for recovery — banner auto-hides after successful reconnection
    await expect(page.locator('.reconnecting-banner')).not.toBeVisible({ timeout: 15000 });
    console.log('[TEST] Banner disappeared - recovery complete');

    // 10. Verify auth error was detected
    expect(authErrorReturned).toBe(true);

    // 11. Verify player was retried
    expect(playerCallCount).toBeGreaterThanOrEqual(2);

    // 12. Verify we're still on the same page
    await expect(page).toHaveURL('/');
  });
});
