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

        // 2. Mock the query to the player table returning NO data (incomplete profile)
        await page.route('**/rest/v1/player?select=is_captain%2Cis_admin%2Cfirst_name%2Clast_name&user_id=eq.new-user-id', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 406, // PGRST116 (Not Found for .single())
                    contentType: 'application/json',
                    body: JSON.stringify({
                        code: "PGRST116",
                        details: "The result contains 0 rows",
                        message: "JSON object requested, multiple (or no) rows returned"
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock fetching the full profile for PlayerProfile returning NO data
        await page.route('**/rest/v1/player?select=*&user_id=eq.new-user-id', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 406,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        code: "PGRST116",
                        details: "The result contains 0 rows",
                        message: "JSON object requested, multiple (or no) rows returned"
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Mock fetching match history for PlayerProfile (Empty)
        await page.route('**/rest/v1/player_to_match*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });
    });

    test('should intercept an authenticated user without a profile and redirect to /welcome', async ({ page }) => {
        // Attempt to access a protected route that normally requires a profile
        await page.goto('/my-schedule');

        // We expect the app to evaluate hasProfile = false via ProtectedRoute and redirect to /welcome
        await page.waitForURL('**/welcome');

        // Due to hasProfile = false, LandingPage renders the Onboarding Header
        await expect(page.getByText('Welcome to LTTA!')).toBeVisible();
        await expect(page.getByText('Please complete your player profile to continue to your dashboard.')).toBeVisible();

        // Ensure the PlayerProfile component is rendered in edit mode implicitly
        await expect(page.getByRole('button', { name: '💾 Save Profile' })).toBeVisible();
        await expect(page.getByLabel(/Full Name/i)).toBeVisible();

        // Ensure Cancel button is hidden since no prior profile exists
        await expect(page.getByRole('button', { name: '❌ Cancel' })).toBeHidden();
    });
});
