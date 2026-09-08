import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

const CAPTAIN_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0301';
const TEAM_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0101';
const PLAYER2_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0302';
const SEASON_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0001';

test.describe('Captain Dashboard Actions @live', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);

        await mockSupabaseAuth(page, {
            id: CAPTAIN_ID,
            is_captain: true,
            is_admin: true
        });

        // Intercept Express API and Supabase REST routes
        await page.route('**/*', async (route) => {
            const url = route.request().url();

            if (url.includes('/api/auth/session')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        session: { user: { id: CAPTAIN_ID, email: 'captain@test.local' } },
                        player: {
                            id: CAPTAIN_ID,
                            user_id: CAPTAIN_ID,
                            first_name: '[TEST] Captain',
                            last_name: 'Player',
                            email: 'captain@test.local',
                            is_captain: true,
                            is_admin: true,
                            is_active: true
                        },
                        season: {
                            id: SEASON_ID,
                            number: 1,
                            name: 'Summer 2026',
                            is_active: true
                        }
                    })
                });
            }

            if (url.includes('/api/seasons/active')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: SEASON_ID,
                        number: 1,
                        name: 'Summer 2026',
                        is_active: true
                    })
                });
            }

            if (url.includes('/api/players/me/team')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: TEAM_ID,
                        team: TEAM_ID,
                        player: CAPTAIN_ID,
                        status: 'active'
                    })
                });
            }

            if (url.includes(`/api/teams/${TEAM_ID}/roster`)) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: CAPTAIN_ID,
                            first_name: '[TEST] Captain',
                            last_name: 'Player',
                            email: 'captain@test.local',
                            ranking: 1,
                            is_captain: true,
                            is_active: true,
                            status: 'active',
                            player: {
                                id: CAPTAIN_ID,
                                first_name: '[TEST] Captain',
                                last_name: 'Player',
                                email: 'captain@test.local',
                                ranking: 1,
                                is_captain: true,
                                is_active: true
                            }
                        },
                        {
                            id: PLAYER2_ID,
                            first_name: '[TEST] Regular',
                            last_name: 'Player 2',
                            email: 'player2@test.local',
                            ranking: 2,
                            is_captain: false,
                            is_active: true,
                            status: 'active',
                            player: {
                                id: PLAYER2_ID,
                                first_name: '[TEST] Regular',
                                last_name: 'Player 2',
                                email: 'player2@test.local',
                                ranking: 2,
                                is_captain: false,
                                is_active: true
                            }
                        }
                    ])
                });
            }

            if (url.includes(`/api/teams/${TEAM_ID}`)) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: TEAM_ID,
                        number: 1,
                        name: 'Test Team',
                        play_night: 'Monday',
                        season_id: SEASON_ID
                    })
                });
            }

            if (url.includes('/api/players')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: CAPTAIN_ID,
                            first_name: '[TEST] Captain',
                            last_name: 'Player',
                            ranking: 1,
                            is_active: true
                        },
                        {
                            id: PLAYER2_ID,
                            first_name: '[TEST] Regular',
                            last_name: 'Player 2',
                            ranking: 2,
                            is_active: true
                        },
                        {
                            id: 'd290f1ee-6c54-4b01-90e6-d701748f0303',
                            first_name: '[TEST] Free',
                            last_name: 'Agent',
                            ranking: 3,
                            is_active: true
                        }
                    ])
                });
            }

            if (url.includes('/api/matches') || url.includes('/api/scores')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
            }

            if (url.includes('/rest/v1/player')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: CAPTAIN_ID,
                        user_id: CAPTAIN_ID,
                        first_name: '[TEST] Captain',
                        last_name: 'Player',
                        email: 'captain@test.local',
                        is_captain: true,
                        is_admin: true
                    })
                });
            }

            if (url.includes('/rest/v1/player_to_team')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ team: TEAM_ID })
                });
            }

            if (url.includes('/rest/v1/team')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: TEAM_ID, number: 1, name: 'Test Team', play_night: 'Monday' })
                });
            }

            return route.continue();
        });
    });

    test('can load dashboard and view team info', async ({ page }) => {
        await page.goto('/captain-dashboard');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        await expect(page.locator('h1')).toContainText('Captain Dashboard');
        await expect(page.locator('body')).toContainText('Test Team');
        await expect(page.getByText('Team Roster Management')).toBeVisible();
    });

    test('opens manage roster modal', async ({ page }) => {
        await page.goto('/captain-dashboard');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        await page.getByRole('button', { name: 'Manage Roster' }).click();
        await expect(page.getByRole('heading', { name: 'Manage Team Roster' })).toBeVisible();
        await expect(page.getByText('Available Players')).toBeVisible();
    });
});
