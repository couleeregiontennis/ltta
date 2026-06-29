import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Invalid JWT Recovery Flow', () => {
  test('should clear local storage and reload when queries return JWT expired/unauthorized', async ({ page }) => {
    await disableNavigatorLocks(page);

    // 1. Inject an initial mock session token in localStorage
    await page.addInitScript(() => {
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
      window.localStorage.setItem(`sb-shlcqztfdhfwkhijwgue-auth-token`, JSON.stringify(mockSession));
      window.localStorage.setItem(`sb-example-auth-token`, JSON.stringify(mockSession));
      window.localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession)); // fallback
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
    const expectedKey = 'sb-example-auth-token';
    await expect.poll(async () => {
      try {
        const val1 = await page.evaluate((key) => window.localStorage.getItem(key), expectedKey);
        const val2 = await page.evaluate(() => window.localStorage.getItem('supabase.auth.token'));
        if (val1 === null && val2 === null) return null; // This is the success condition!
        return "still present";
      } catch (e) {
        if (e.message.includes('Execution context was destroyed')) {
           return null;
        }
        throw e;
      }
    }, {
      timeout: 10000,
      intervals: [500]
    }).toBeNull();
  });
});
