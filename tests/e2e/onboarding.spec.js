import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('New Player Onboarding Flow', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
        
        // 1. Establish mocked auth session for a "new" user
        await mockSupabaseAuth(page, {
            id: 'new-user-id',
            email: 'newplayer@example.com'
        });

        // 2. Comprehensive mock for rest calls
        await page.route('**/rest/v1/*', async (route) => {
            const url = route.request().url();
            const method = route.request().method();
            const accept = route.request().headers()['accept'] || '';
            
            if (method === 'GET') {
                if (url.includes('/player?')) {
                    if (accept.includes('vnd.pgrst.object')) {
                        return route.fulfill({
                            status: 406,
                            contentType: 'application/json',
                            body: JSON.stringify({ code: "PGRST116", message: "Not Found" }),
                        });
                    } else {
                        return route.fulfill({
                            status: 200,
                            contentType: 'application/json',
                            body: JSON.stringify([]),
                        });
                    }
                }
                return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            }
            await route.continue();
        });
    });

    test('should intercept an authenticated user without a profile and redirect to /welcome', async ({ page }) => {
        // Start at a protected route
        await page.goto('/my-schedule');

        // Should redirect to /welcome
        await page.waitForURL('**/welcome', { timeout: 15000 });

        // Wait for any loading indicator to clear
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        // Verify the wizard content
        await expect(page.getByRole('heading', { name: 'Welcome to LTTA!', exact: true })).toBeVisible({ timeout: 15000 });
        
        // Verify Step 1 is rendering
        await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
        await expect(page.locator('input#first-name')).toBeVisible();
    });
});
