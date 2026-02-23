import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseData } from '../utils/auth-mock';

test.describe('Team View', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);

        // 1. Mock team details
        await page.route('**/rest/v1/team*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(
                    {
                        id: 'd290f1ee-6c54-4b01-90e6-d701748f0001',
                        name: '[TEST] Alpha',
                        number: 9001,
                        play_night: 'Monday'
                    }
                ),
            });
        });

        // 2. Mock schedule (matches table)
        await page.route('**/rest/v1/matches*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'match-uuid-1',
                        home_team_number: 9001,
                        home_team_name: '[TEST] Alpha',
                        away_team_number: 9002,
                        away_team_name: '[TEST] Beta',
                        date: '2099-12-31',
                        time: '18:00:00',
                        courts: '1, 2',
                        week: 1
                    }
                ]),
            });
        });

        // 3. Mock roster junction table
        await page.route('**/rest/v1/player_to_team*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { player: 'd290f1ee-6c54-4b01-90e6-d701748p0001', team: 'd290f1ee-6c54-4b01-90e6-d701748f0001' },
                    { player: 'd290f1ee-6c54-4b01-90e6-d701748p0002', team: 'd290f1ee-6c54-4b01-90e6-d701748f0001' }
                ]),
            });
        });

        // 4. Mock players
        await page.route('**/rest/v1/player*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'd290f1ee-6c54-4b01-90e6-d701748p0001', first_name: '[TEST] Captain', last_name: 'Test', is_captain: true },
                    { id: 'd290f1ee-6c54-4b01-90e6-d701748p0002', first_name: '[TEST] Regular', last_name: 'Player', is_captain: false }
                ]),
            });
        });

        // 5. Mock match results to prevent 400 Bad Request
        await page.route('**/rest/v1/team_match*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });
    });

    test('loads team roster and basic info correctly', async ({ page }) => {
        await page.goto('/team/Monday/9001');

        await expect(page).toHaveTitle(/LTTA/);
        await expect(page.getByRole('heading', { name: '[TEST] Alpha', exact: true })).toBeVisible();

        await expect(page.getByRole('heading', { name: 'Team Roster' })).toBeVisible();

        await expect(page.getByText('[TEST] Captain')).toBeVisible();
        await expect(page.getByText('[TEST] Regular')).toBeVisible();
    });

    test('displays schedule correctly', async ({ page }) => {
        await page.goto('/team/Monday/9001');

        await expect(page.getByRole('heading', { name: 'Match Schedule' })).toBeVisible();

        await expect(page.getByRole('link', { name: '[TEST] Beta' })).toBeVisible();
        await expect(page.getByText(/18:00/)).toBeVisible();
    });
});
