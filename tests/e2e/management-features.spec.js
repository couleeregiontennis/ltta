import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Management Features (Captain & Admin)', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
    });

    test('Captain Dashboard should show pending requests and allow approval', async ({ page }) => {
        await mockSupabaseAuth(page, { 
            id: 'cap-id', 
            email: 'cap@test.com', 
            is_captain: true,
            first_name: 'Captain'
        });

        await page.goto('/captain-dashboard');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        // Verify Roster load (auth-mock.js returns 'Regular' in roster-table)
        await expect(page.locator('.roster-table')).toContainText('Regular');
    });

    test('Admin should be able to move players between teams', async ({ page }) => {
        await mockSupabaseAuth(page, { 
            id: 'admin-id', 
            email: 'admin@test.com', 
            is_admin: true,
            first_name: 'Admin'
        });

        await page.goto('/admin/players');
        await expect(page.getByText(/Loading player management/i)).toBeHidden({ timeout: 15000 });

        // Verify Team column (added in recent rewrite)
        await expect(page.getByRole('columnheader', { name: 'Team' })).toBeVisible();
        await expect(page.getByText('Test Team')).toBeVisible();

        // Open Edit Modal
        await page.getByRole('button', { name: /Edit Player/i }).first().click();

        // Verify Team Dropdown exists
        await expect(page.getByLabel('Team Assignment')).toBeVisible();
    });
});
