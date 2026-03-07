import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test('dump network', async ({ page }) => {
  await disableNavigatorLocks(page);

  // 1. Mock team details
  await page.route('**/rest/v1/team*', async (route) => {
      await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
              id: 'team-uuid-1',
              name: '[TEST] Alpha',
              number: 9001,
              play_night: 'Monday'
          }),
      });
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('/team/Monday/9001');
  await page.waitForTimeout(3000);
});
