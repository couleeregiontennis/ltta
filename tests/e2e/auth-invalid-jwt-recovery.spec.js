import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Invalid JWT Recovery Flow', () => {
  test('should clear local storage and reload when queries return JWT expired/unauthorized', async ({ page }) => {
    await disableNavigatorLocks(page);

    // 1. Inject an initial mock session token in localStorage once
    await page.addInitScript(() => {
      if (window.sessionStorage.getItem('injected-bad-jwt')) {
        return;
      }
      window.sessionStorage.setItem('injected-bad-jwt', 'true');
      const mockSession = {
        access_token: 'expired-or-bad-jwt',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: {
          id: 'bad-user-id',
          email: 'bad-user@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      window.localStorage.setItem('sb-shlcqztfdhfwkhijwgue-auth-token', JSON.stringify(mockSession));
    });

    // 2. Intercept queries and return 401 / PGRST301
    await page.route('**/rest/v1/player*', async (route) => {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PGRST301',
          message: 'JWT expired'
        })
      });
    });

    await page.route('**/rest/v1/season*', async (route) => {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PGRST301',
          message: 'JWT expired'
        })
      });
    });

    // Navigate to homepage
    await page.goto('/');

    // Verify localStorage has been cleared of the bad session
    await expect.poll(async () => {
      try {
        return await page.evaluate(() => window.localStorage.getItem('sb-shlcqztfdhfwkhijwgue-auth-token'));
      } catch (err) {
        // If context was destroyed during reload, return non-null value to keep polling
        return 'context-destroyed-retry';
      }
    }, {
      timeout: 10000,
      intervals: [500]
    }).toBeNull();
  });
});
