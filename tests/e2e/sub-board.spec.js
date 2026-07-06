import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Sub Board @live', () => {
    test('Player can see open requests', async ({ page }) => {
        await disableNavigatorLocks(page);
        await mockSupabaseAuth(page);
        await page.goto('/sub-board');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Sub Board' })).toBeVisible();
    });
});
