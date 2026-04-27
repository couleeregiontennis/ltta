import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Add Score Security Checks', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { is_captain: true });

    // Mock match list for selection
    await page.route('**/rest/v1/matches*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'm1-uuid', date: new Date().toISOString(), home_team_number: 1, away_team_number: 2 }]),
      });
    });
  });

  test('enforces input limits on notes field', async ({ page }) => {
    await page.goto('/add-score');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

    // Select match to reveal form
    await page.selectOption('select[name="matchId"]', 'm1-uuid');

    const notesArea = page.locator('textarea[name="notes"]');
    await expect(notesArea).toBeVisible();

    // Fill with very long text
    const longText = 'A'.repeat(1001);
    await notesArea.fill(longText);

    // Verify it capped at 1000
    const value = await notesArea.inputValue();
    expect(value.length).toBeLessThanOrEqual(1000);
  });
});
