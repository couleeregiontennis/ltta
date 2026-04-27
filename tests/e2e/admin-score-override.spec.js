import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Admin Match Result Override', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  test('Admin sees Edit button on completed match results', async ({ page }) => {
    await mockSupabaseAuth(page, { is_admin: true });

    await page.goto('/');
    // Wait for the general match schedule to load
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });

    // Verify the match result from the mock is visible
    await expect(page.locator('body')).toContainText('Home', { timeout: 10000 });

    // The Edit button should be visible for admins on completed matches
    const editBtn = page.locator('.edit-result-btn').first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
  });

  test('Non-Admin does NOT see Edit button', async ({ page }) => {
    await mockSupabaseAuth(page, { is_admin: false });
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });
    await expect(page.locator('.edit-result-btn')).toBeHidden();
  });
});
