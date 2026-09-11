import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Captain Dashboard Actions @live', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
        await mockSupabaseAuth(page, {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0301',
            is_captain: true
        });
    });

    test('can load dashboard and view team info', async ({ page }) => {
        await page.goto('/captain-dashboard');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        await expect(page.locator('h1')).toContainText('Captain Dashboard');
        await expect(page.locator('body')).toContainText('Test Team');
        await expect(page.getByText('Team Roster Management')).toBeVisible();
    });

    test('opens manage roster modal', async ({ page }) => {
        await page.goto('/captain-dashboard');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        await page.getByRole('button', { name: 'Manage Roster' }).click();
        await expect(page.getByRole('heading', { name: 'Manage Team Roster' })).toBeVisible();
        await expect(page.getByText('Available Players')).toBeVisible();
    });
});
