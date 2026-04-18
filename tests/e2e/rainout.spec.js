import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Rainout Handling Feature', () => {

    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
    });

    test.describe('As a Non-Captain Player', () => {
        test.beforeEach(async ({ page }) => {
            await mockSupabaseAuth(page, {
                id: 'player-user-id',
                email: 'player@example.com'
            });

            // Mock season
            await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
                const seasonObj = { id: 's2026-uuid', number: 2026, name: 'Summer 2026', is_current: true };
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(route.request().url().includes('limit=1') || route.request().url().includes('is_current=eq.true') ? seasonObj : [seasonObj])
                });
            });

            // Mock player record for userRole
            await page.route('**/rest/v1/player?select=is_captain%2Cis_admin%2Cfirst_name%2Clast_name&user_id=eq.player-user-id', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        is_captain: false,
                        is_admin: false,
                        first_name: 'Regular',
                        last_name: 'Player'
                    }),
                });
            });

            // Mock team matches with one rained out match
            await page.route('**/rest/v1/team_match*', async (route) => {
                const url = route.request().url();
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([
                            {
                                id: 'match-1',
                                date: new Date().toISOString(),
                                time: '18:00',
                                status: 'rain_cancellation',
                                courts: 'Central Courts',
                                is_rained_out: true,
                                home_team: { id: 'team-1', name: 'Team Alpha', number: 1 },
                                away_team: { id: 'team-2', name: 'Team Beta', number: 2 }
                            }
                        ])
                    });
                } else {
                    await route.continue();
                }
            });
            // Mock active teams format from schedule page
            await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
            });
        });

        test('should display Weather Policy banner and Rained Out status, without Mark Rainout button', async ({ page }) => {
            await page.goto('/schedule');

            // Click List view to avoid any date filtering issues on timezone mismatches
            await page.getByRole('button', { name: 'List', exact: true }).click();

            // Banner should be visible
            await expect(page.getByText('2026 Weather Policy:')).toBeVisible();

            // Card should show "Rained Out" badge
            await expect(page.getByText('Rained Out').first()).toBeVisible();

            // Since it is a regular player, the button should NOT exist
            await expect(page.getByRole('button', { name: 'Undo Rainout' })).not.toBeVisible();
            await expect(page.getByRole('button', { name: 'Mark Rainout' })).not.toBeVisible();
        });
    });

    test.describe('As a Captain', () => {
        test.beforeEach(async ({ page }) => {
            await mockSupabaseAuth(page, {
                id: 'captain-user-id',
                email: 'captain@example.com'
            });

            // Mock season
            await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
                const seasonObj = { id: 's2026-uuid', number: 2026, name: 'Summer 2026', is_current: true };
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(route.request().url().includes('limit=1') || route.request().url().includes('is_current=eq.true') ? seasonObj : [seasonObj])
                });
            });

            // Mock player record for userRole
            await page.route('**/rest/v1/player?select=is_captain%2Cis_admin%2Cfirst_name%2Clast_name&user_id=eq.captain-user-id', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        is_captain: true,
                        is_admin: false,
                        first_name: 'Cap',
                        last_name: 'Tain'
                    }),
                });
            });

            // Mock active teams for the schedule filter
            await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
                await route.fulfill({ status: 200, body: '[]' });
            });
        });

        test('should allow Captain to mark an upcoming match as rained out', async ({ page }) => {
            let status = 'scheduled';

            // Mock the GET and PATCH handlers for team_match
            await page.route('**/rest/v1/team_match*', async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([
                            {
                                id: 'match-1',
                                date: new Date().toISOString(),
                                time: '18:00',
                                status: status,
                                courts: 'Central Courts',
                                home_team: { id: 'team-1', name: 'Team Alpha', number: 1 },
                                away_team: { id: 'team-2', name: 'Team Beta', number: 2 }
                            }
                        ])
                    });
                } else if (route.request().method() === 'PATCH' || route.request().method() === 'UPDATE') {
                    // Update status
                    status = 'rain_cancellation';
                    await route.fulfill({ status: 204 });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/schedule');

            // Click List view
            await page.getByRole('button', { name: 'List', exact: true }).click();

            // Wait for load, the button should be Mark Rainout initially
            const markRainoutBtn = page.getByRole('button', { name: 'Mark Rainout' });
            await expect(markRainoutBtn).toBeVisible();

            // Click it
            await markRainoutBtn.click();

            // The button should change to Undo Rainout after refresh
            await expect(page.getByRole('button', { name: 'Undo Rainout' })).toBeVisible();
        });
    });
});
