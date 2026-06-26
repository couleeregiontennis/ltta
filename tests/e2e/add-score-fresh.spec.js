import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Add Score Page (New) @live', () => {
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
    await mockSupabaseAuth(page, { 
        id: 'cap-id', 
        is_captain: true,
        first_name: 'Test',
        last_name: 'Captain'
    });

    await page.goto('/add-score');
    
    // Ensure the loading indicator clears
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });
    
    // Check for correct heading
    await expect(page.locator('h1')).toContainText('Submit Match Scores');
    
    const matchSelect = page.locator('select[name="matchId"]');
    await expect(matchSelect).toBeVisible({ timeout: 10000 });
    
    // Select option (match-1 is default from auth-mock.js)
    await matchSelect.selectOption('match-1');
    
    // Verify match details appeared
    await expect(page.locator('body')).toContainText('Home Team');
  });

  test('loads score page for non-team/admin users successfully via URL prefill', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
        id: 'admin-id', 
        is_captain: false,
        is_admin: true,
        first_name: 'Test',
        last_name: 'Admin'
    });

    // Mock empty team assignments for this admin user
    await page.route('**/rest/v1/player_to_team*', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]' // empty array - no team link
        });
      }
      return route.continue();
    });

    // Go to add-score page directly with prefill matchId
    await page.goto('/add-score?matchId=match-1');
    
    // Ensure the loading indicator clears
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });
    
    // Expect score submission interface elements to be visible for the prefilled match
    await expect(page.locator('h1')).toContainText('Submit Match Scores');
    await expect(page.locator('body')).toContainText('Home Team');
    await expect(page.locator('body')).toContainText('Away Team');
  });

  test('regression: navigating back to schedule from score page does not render empty matches list', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
        id: 'cap-id', 
        is_captain: true,
        first_name: 'Test',
        last_name: 'Captain'
    });

    // Navigate to add-score page first
    await page.goto('/add-score?matchId=match-1');
    await expect(page.locator('h1')).toContainText('Submit Match Scores');

    // Find and click the navbar brand/logo or home button to go back to schedule (/)
    const homeLink = page.locator('a.navbar-brand, a:has-text("LTTA"), a[href="/"]');
    await homeLink.first().click();

    // Verify we land on schedule page and it loads the match card successfully instead of showing empty state
    await expect(page.locator('h1')).toContainText('Match Schedule');
    await expect(page.locator('.match-card').first()).toBeVisible({ timeout: 15000 });
  });
});
