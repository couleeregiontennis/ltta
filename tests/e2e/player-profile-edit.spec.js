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

        // Register test-specific player mock AFTER mockSupabaseAuth so it takes
        // priority (Playwright uses last-registered-wins for route handlers).
        await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
            const url = route.request().url();
            const isSingle = url.includes('eq');
            const playerObj = {
                id: 'd290f1ee-6c54-4b01-90e6-d701748f0302',
                first_name: '[TEST] Regular',
                last_name: 'Player',
                phone: '123-4567',
                day_availability: {
                    monday: true,
                    tuesday: false,
                    wednesday: true,
                    thursday: false,
                    friday: false,
                    saturday: false,
                    sunday: false
                },
                ranking: 3
            };

            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(isSingle ? playerObj : [playerObj]),
                });
            } else if (route.request().method() === 'PATCH') {
                let requestBody = {};
                try {
                    requestBody = JSON.parse(route.request().postData() || '{}');
                } catch (_) { /* ignore parse errors */ }
                const patchedObj = {
                    id: 'd290f1ee-6c54-4b01-90e6-d701748f0302',
                    first_name: '[TEST] Regular',
                    last_name: 'Player',
                    phone: requestBody.phone || '555-0199',
                    day_availability: requestBody.day_availability || playerObj.day_availability,
                    ranking: requestBody.ranking || 3
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

    test('day_availability checkboxes load and persist after save', async ({ page }) => {
        await page.goto('/player-profile');
        await expect(page.getByRole('heading', { name: 'Player Profile' })).toBeVisible();

        // Verify initial state: Monday and Wednesday checked, Tuesday unchecked
        const mondayItem = page.locator('.day_availability-item').filter({ hasText: 'Monday' });
        const tuesdayItem = page.locator('.day_availability-item').filter({ hasText: 'Tuesday' });
        const wednesdayItem = page.locator('.day_availability-item').filter({ hasText: 'Wednesday' });
        const mondayCheckbox = mondayItem.locator('input[type="checkbox"]');
        const tuesdayCheckbox = tuesdayItem.locator('input[type="checkbox"]');
        const wednesdayCheckbox = wednesdayItem.locator('input[type="checkbox"]');

        await expect(mondayCheckbox).toBeChecked();
        await expect(tuesdayCheckbox).not.toBeChecked();
        await expect(wednesdayCheckbox).toBeChecked();

        // Enter edit mode
        await page.getByRole('button', { name: /Edit Profile/ }).click();

        // Toggle Tuesday on and Monday off by clicking the parent .day_availability-item divs
        // (the native checkbox is visually hidden by CSS)
        await tuesdayItem.click();
        await mondayItem.click();

        // Save profile
        await page.getByRole('button', { name: 'Save Profile' }).click();
        await expect(page.getByText('Profile saved successfully!')).toBeVisible();

        // After save, checkboxes should reflect the changes
        await expect(tuesdayCheckbox).toBeChecked();
        await expect(mondayCheckbox).not.toBeChecked();
    });

    test('ranking levels display in correct order (1=Expert to 5=Beginner)', async ({ page }) => {
        await page.goto('/player-profile');

        await page.getByRole('button', { name: /Edit Profile/ }).click();

        const rankingSelect = page.locator('#ranking');

        // Verify all 5 options are present
        await expect(rankingSelect.locator('option')).toHaveCount(5);

        // Verify correct label order: 1=Expert, 2=Advanced, 3=Intermediate, 4=Novice, 5=Beginner
        await expect(rankingSelect.locator('option').nth(0)).toHaveText('1 - Expert');
        await expect(rankingSelect.locator('option').nth(1)).toHaveText('2 - Advanced');
        await expect(rankingSelect.locator('option').nth(2)).toHaveText('3 - Intermediate');
        await expect(rankingSelect.locator('option').nth(3)).toHaveText('4 - Novice');
        await expect(rankingSelect.locator('option').nth(4)).toHaveText('5 - Beginner');
    });
});
