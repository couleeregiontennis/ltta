import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Add Score Security Checks @live', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { is_captain: true });
  });

  test('enforces input limits on notes field', async ({ page }) => {
    await page.goto('/add-score');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

    // Select match to reveal form
    await page.selectOption('select[name="matchId"]', 'match-1');

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
