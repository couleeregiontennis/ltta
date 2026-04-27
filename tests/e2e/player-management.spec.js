import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Player Management @live', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { is_admin: true });
  });

  test('should display list of players', async ({ page }) => {
    await page.goto('/admin/players');
    await expect(page.getByText(/Loading player management/i)).toBeHidden({ timeout: 15000 });
    
    // Auth-mock.js returns "User, Test" format (last_name, first_name)
    await expect(page.getByText(/User, Test/i)).toBeVisible();
  });

  test('should filter players', async ({ page }) => {
    await page.goto('/admin/players');
    await expect(page.getByText(/Loading player management/i)).toBeHidden({ timeout: 15000 });

    const searchInput = page.locator('input#search-players');
    await searchInput.fill('NonExistentPlayer');
    
    await expect(page.getByText('No players found')).toBeVisible();
  });
});
