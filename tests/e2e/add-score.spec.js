import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Add Score Page', () => {
  test('loads and allows match selection', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { is_captain: true });
    await page.goto('/add-score');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    const matchSelect = page.locator('select[name="matchId"]');
    await expect(matchSelect).toBeVisible();
    await matchSelect.selectOption('match-1');
    await expect(page.locator('body')).toContainText('Home Team');
  });
});
