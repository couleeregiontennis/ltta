import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Add Score Page @live', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.error(`BROWSER EXCEPTION: ${err.message}\nStack: ${err.stack}`);
      throw err;
    });
  });

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

  test('prefills match from query parameters', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { is_captain: true });
    await page.goto('/add-score?matchId=m1-uuid');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    await expect(page.locator('.match-prefilled-banner')).toBeVisible();
    await expect(page.locator('body')).toContainText('Home Team');
  });

  test('automatically preselects first upcoming match when no query parameters provided', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { is_captain: true });
    await page.goto('/add-score');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    
    // Verify match is automatically preselected (match-1 from mock)
    const matchSelect = page.locator('select[name="matchId"]');
    await expect(matchSelect).toHaveValue('match-1');
    await expect(page.locator('body')).toContainText('Home Team');
  });
});
