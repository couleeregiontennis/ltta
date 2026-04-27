import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Forgot Password Flow', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
    });

    test('should show forgot password link and handle reset request', async ({ page }) => {
        await page.goto('/login');

        // Check if forgot password link exists
        const forgotLink = page.getByRole('button', { name: /forgot password/i });
        await expect(forgotLink).toBeVisible();

        await forgotLink.click();

        // UI should change to reset mode
        await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
        await expect(page.locator('input#password')).toBeHidden();

        // Fill email and submit
        await page.getByLabel(/email/i).fill('reset-test@example.com');
        
        // Mock the Supabase call
        await page.route('**/auth/v1/recover*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({}),
            });
        });

        await page.getByRole('button', { name: /send reset link/i }).click();

        // Should show success message
        await expect(page.getByText(/instructions sent/i)).toBeVisible();
    });

    test('should allow password update on the update-password page', async ({ page }) => {
        // Mock session and user
        await mockSupabaseAuth(page, { id: 'test-user-id', email: 'test@example.com' });

        await page.route('**/auth/v1/user*', async (route) => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
                        error: null 
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/update-password');

        await expect(page.getByRole('heading', { name: 'Update Password' })).toBeVisible();

        await page.getByLabel('New Password', { exact: true }).fill('new-secure-password');
        await page.getByLabel('Confirm New Password', { exact: true }).fill('new-secure-password');

        await page.getByRole('button', { name: /update password/i }).click();

        // Check for the success message (using a more flexible locator)
        await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/password updated/i)).toBeVisible();
    });
});
