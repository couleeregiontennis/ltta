import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Rainout Handling @live', () => {
    test('Captain should see Mark Rainout button', async ({ page }) => {
        await disableNavigatorLocks(page);
        await mockSupabaseAuth(page, { is_captain: true });
        await page.goto('/captain-dashboard');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
        await expect(page.getByRole('button', { name: 'Mark Rainout' })).toBeVisible({ timeout: 10000 });
    });
});
