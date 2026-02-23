import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Player Profile Editing', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);

        // We mock the auth session to log in as our test player
        await mockSupabaseAuth(page, {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0302',
            email: 'regular@test.local'
        });

        // Mock getting the profile data on load
        await page.route('**/rest/v1/player*', async (route) => {
            const url = route.request().url();
            const isSingle = url.includes('eq');
            const playerObj = {
                id: 'd290f1ee-6c54-4b01-90e6-d701748f0302',
                first_name: '[TEST] Regular',
                last_name: 'Player',
                phone: '123-4567'
            };

            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(isSingle ? playerObj : [playerObj]),
                });
            } else if (route.request().method() === 'PATCH') {
                const patchedObj = {
                    id: 'd290f1ee-6c54-4b01-90e6-d701748f0302',
                    first_name: '[TEST] Regular',
                    last_name: 'Player',
                    phone: '555-0199'
                };
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(isSingle ? patchedObj : [patchedObj]),
                });
            } else {
                await route.continue();
            }
        });
    });

    test('can load and view profile data', async ({ page }) => {
        await page.goto('/player-profile');

        await expect(page.getByRole('heading', { name: 'Player Profile' })).toBeVisible();
        await expect(page.getByLabel('Full Name *')).toHaveValue('[TEST] Regular Player');
    });

    test('can edit phone number successfully', async ({ page }) => {
        await page.goto('/player-profile');

        await page.getByRole('button', { name: /Edit Profile/ }).click();

        // Find phone input and change it
        const phoneInput = page.getByRole('textbox', { name: 'Phone Number' });
        await phoneInput.fill('555-0199');

        // Save profile
        await page.getByRole('button', { name: 'Save Profile' }).click();

        // Expect success message
        await expect(page.getByText('Profile saved successfully!')).toBeVisible();
    });
});
