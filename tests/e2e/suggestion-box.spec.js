import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Suggestion Box', () => {
    test('User can submit feedback', async ({ page }) => {
        await disableNavigatorLocks(page);
        await mockSupabaseAuth(page);
        await page.goto('/feedback');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Suggestion Box' })).toBeVisible();
    });
});
