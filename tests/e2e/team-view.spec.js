import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Team View', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await disableNavigatorLocks(page);

        // Mock season data (required for MatchSchedule to load)
        await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
            const seasonObj = {
                id: 'd290f1ee-6c54-4b01-90e6-d701748f0001',
                name: 'Summer 2026',
                start_date: '2026-06-01',
                end_date: '2026-08-31'
            };
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(route.request().url().includes('limit=1') || route.request().url().includes('is_current=eq.true') ? seasonObj : [seasonObj])
            });
        });

        // 1. Mock team data
        await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
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

        // 2. Mock schedule (team_match table)
        await page.route('**/rest/v1/team_match*', async (route) => {
            const url = route.request().url();
            if (url.includes('status=eq.completed')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: 'match-uuid-1',
                            home_team: { name: '[TEST] Alpha', number: 9001 },
                            away_team: { name: '[TEST] Beta', number: 9002 },
                            date: '2099-12-31',
                            time: '18:00:00',
                            courts: '1, 2',
                            week: 1,
                            status: 'scheduled'
                        }
                    ])
                });
            }
        });

        // 3. Mock roster junction table
        await page.route('**/rest/v1/player_to_team*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { player: { id: 'd290f1ee-6c54-4b01-90e6-d701748p0001', first_name: '[TEST] Captain', last_name: 'Test', is_captain: true } },
                    { player: { id: 'd290f1ee-6c54-4b01-90e6-d701748p0002', first_name: '[TEST] Regular', last_name: 'Player', is_captain: false } }
                ]),
            });
        });

        // 4. Mock players
        await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'd290f1ee-6c54-4b01-90e6-d701748p0001', first_name: '[TEST] Captain', last_name: 'Test', is_captain: true },
                    { id: 'd290f1ee-6c54-4b01-90e6-d701748p0002', first_name: '[TEST] Regular', last_name: 'Player', is_captain: false }
                ]),
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

        await expect(page.getByText('[TEST] Beta', { exact: true })).toBeVisible();
        await expect(page.getByText(/18:00/)).toBeVisible();
    });
});
