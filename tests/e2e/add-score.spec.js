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

  test('multi-team captain sees matches from all teams', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, {
      is_captain: true,
      first_name: 'Multi',
      last_name: 'Captain',
      teams: [
        { team: 't1', status: 'active' },
        { team: 't3', status: 'active' }
      ]
    });
    await page.goto('/add-score');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

    // Dropdown should be visible
    const matchSelect = page.locator('select[name="matchId"]');
    await expect(matchSelect).toBeVisible();

    // Should see matches from team t1 (Home Team vs Away Team)
    await expect(matchSelect).toContainText('Home Team vs Away Team');

    // Should also see matches from team t3 (Team Four vs Third Team)
    await expect(matchSelect).toContainText('Team Four vs Third Team');

    // Select the t3 match and verify it works
    await matchSelect.selectOption('match-3');
    await expect(page.locator('body')).toContainText('Team Four');
  });

  test('user with no active teams sees helpful message', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, {
      is_captain: false,
      first_name: 'NoTeam',
      last_name: 'User',
      teams: []
    });
    await page.goto('/add-score');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

    // Should see the helpful message instead of an empty dropdown
    await expect(page.locator('body')).toContainText(
      'No teams with scheduled matches found. Please ask your captain to add you to a team.'
    );

    // The select dropdown should NOT be visible
    await expect(page.locator('select[name="matchId"]')).not.toBeVisible();
  });
});
