import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.beforeEach(async ({ page }) => {
  await disableNavigatorLocks(page);
});

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/LTTA App/);
});

test('loads the app', async ({ page }) => {
  await page.goto('/');

  // Expect the root element to be visible
  await expect(page.locator('#root')).toBeVisible();
});


test('demo banner is visible when VITE_IS_STAGING is true', async ({ page }) => {
  test.skip(process.env.VITE_IS_STAGING !== 'true', 'Only runs when VITE_IS_STAGING is true');
  await page.goto('/');
  await expect(page.locator('.staging-demo-banner')).toBeVisible();
});
