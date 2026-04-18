import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Add Score Security Checks', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Mock Auth (User Login)
    await mockSupabaseAuth(page, {
        id: 'fake-user-id',
        email: 'test@example.com',
        is_captain: true,
        is_admin: true
    });
  });

  test('enforces input limits on notes field', async ({ page }) => {
    await page.goto('/add-score');

    // Select match to reveal form
    await page.selectOption('select[name="matchId"]', 'm1-uuid');

    const notesArea = page.locator('textarea[name="notes"]');
    await expect(notesArea).toBeVisible();

    // Check for maxLength
    await expect(notesArea).toHaveAttribute('maxLength', '500');

    // Check for aria-describedby
    await expect(notesArea).toHaveAttribute('aria-describedby', 'notes-counter');

    // Check for counter
    const counter = page.locator('#notes-counter');
    await expect(counter).toBeVisible();
    await expect(counter).toContainText('0 / 500 characters');

    // Type some text and check counter updates
    await notesArea.fill('Hello');
    await expect(counter).toContainText('5 / 500 characters');
  });

});
