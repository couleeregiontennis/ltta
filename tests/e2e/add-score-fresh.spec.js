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
});
