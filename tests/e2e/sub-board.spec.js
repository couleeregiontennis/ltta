import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Sub Board @live', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
    });

    test('should allow a player to see and claim an open sub request', async ({ page }) => {
        // 1. Log in via mock
        await mockSupabaseAuth(page, { id: 'player-user-id', email: 'sub@example.com' });

        // Mock state to track if request has been filled
        let subRequestStatus = 'open';

        // 2. Intercept GET and PATCH for sub_request table
        await page.route(/\/rest\/v1\/sub_request/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();

            if (method === 'GET') {
                if (subRequestStatus === 'open') {
                    // Return one open sub request card
                    const openRequest = {
                        id: 'sub-req-1',
                        captain_user_id: 'captain-1',
                        team_id: 't1',
                        match_date: '2026-06-15',
                        match_time: '18:30',
                        location_id: 'loc-1',
                        required_ranking: 3,
                        notes: 'Need a consistent baseline player.',
                        status: 'open',
                        team: { name: 'Test Home Team' },
                        location: { name: 'Local Park Courts' }
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([openRequest])
                    });
                } else {
                    // Re-fetched after claim, return empty since status is no longer 'open'
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([])
                    });
                }
            } else if (method === 'PATCH') {
                const postData = route.request().postData();
                const patchData = JSON.parse(postData || '{}');
                
                // Assert that the request status is being set to filled and sub_user_id is logged
                expect(patchData.status).toBe('filled');
                expect(patchData.sub_user_id).toBe('player-user-id');
                
                subRequestStatus = 'filled';
                
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{ id: 'sub-req-1', status: 'filled' }])
                });
            } else {
                await route.continue();
            }
        });

        // Mock player profile retrieve so hasProfile is true
        await page.route(/\/rest\/v1\/player/, async (route) => {
            const url = route.request().url();
            const accept = route.request().headers()['accept'] || '';
            const isSingle = accept.includes('vnd.pgrst.object');
            
            const profile = { id: 'p1', user_id: 'player-user-id', first_name: 'Sub', last_name: 'Player', is_captain: false, is_admin: false };
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(isSingle ? profile : [profile])
            });
        });

        // 3. Navigate to Sub Board page
        await page.goto('/sub-board');

        // 4. Verify UI matches mocked open request
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Sub Board' })).toBeVisible();

        const requestCard = page.locator('.request-card');
        await expect(requestCard).toBeVisible({ timeout: 10000 });
        await expect(requestCard.locator('.team-name')).toHaveText('Test Home Team');
        await expect(requestCard.locator('.status-badge')).toHaveText('OPEN');
        await expect(requestCard).toContainText('Required Skill: 3.0+');
        await expect(requestCard).toContainText('Need a consistent baseline player.');

        // 5. Claim the spot
        const acceptBtn = requestCard.locator('.accept-btn');
        await expect(acceptBtn).toBeVisible();
        await expect(acceptBtn).toHaveText('Accept Spot');
        
        await acceptBtn.click();

        // 6. Verify that it was successfully claimed (UI shows empty state because it was removed from 'available' list)
        await expect(requestCard).not.toBeVisible({ timeout: 10000 });
        await expect(page.getByText('No open sub requests at this time.')).toBeVisible();
    });
});
