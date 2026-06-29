import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('New Player Onboarding Flow @live', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
        
        // 1. Mock auth as our test user
        await mockSupabaseAuth(page, {
            id: 'new-user-id',
            email: 'new@test.local'
        });

        // 2. Comprehensive mock using Regex for robustness
        await page.route(/\/rest\/v1\/.*/, async (route) => {
            const url = route.request().url();
            const method = route.request().method();
            const accept = route.request().headers()['accept'] || '';
            
            if (method === 'GET') {
                if (url.includes('/player')) {
                    // Profile check for AuthProvider (MUST return 406 or empty for NO profile)
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
                // Default empty for other fetches
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

        // Wait for Wizard UI
        await expect(page.getByRole('heading', { name: /Welcome to LTTA/i })).toBeVisible({ timeout: 15000 });
        
        // Verify Step 1 content
        await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
        await expect(page.locator('input#first-name')).toBeVisible();
    });

    test('should autofill first and last name from email name parts', async ({ page }) => {
        // Mock session with structured email address
        await mockSupabaseAuth(page, {
            id: 'new-user-id2',
            email: 'john.doe@test.local'
        });

        // Re-register the profile 406 mock so it overrides mockSupabaseAuth's default profile mock
        await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
            const accept = route.request().headers()['accept'] || '';
            if (accept.includes('vnd.pgrst.object')) {
                return route.fulfill({
                    status: 406,
                    contentType: 'application/json',
                    body: JSON.stringify({ code: "PGRST116", message: "Not Found" }),
                });
            }
            return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        });

        // Navigate to protected page to trigger session load and correct redirect to onboarding
        await page.goto('/my-schedule');
        await page.waitForURL('**/welcome', { timeout: 15000 });

        await page.waitForSelector('input#first-name', { timeout: 15000 });
        await expect(page.locator('input#first-name')).toHaveValue('John');
        await expect(page.locator('input#last-name')).toHaveValue('Doe');
    });
});
