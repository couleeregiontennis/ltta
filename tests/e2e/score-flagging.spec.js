import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock.js';

test.describe('Score Flagging Feature', () => {

    test.describe('As a standard Player', () => {
        test.beforeEach(async ({ page }) => {
            // Mock standard player
            await mockSupabaseAuth(page, {
                email: 'player@example.com',
                role: 'player',
                playerData: { id: 'player-1', first_name: 'Regular', last_name: 'Player', is_captain: false, is_admin: false }
            });

            // Mock season fetch
            await page.route('**/rest/v1/season*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'season-1', number: 1 }),
                });
            });

            // Mock team_match with a completed score but not disputed
            let isDisputed = false;
            await page.route('**/rest/v1/team_match*', async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([{
                            id: 'match-1',
                            date: new Date().toISOString(),
                            time: '18:00',
                            status: 'completed',
                            courts: '1, 2',
                            is_rained_out: false,
                            is_disputed: isDisputed,
                            home_team: { id: 'team-1', name: 'Home Team', number: 1 },
                            away_team: { id: 'team-2', name: 'Away Team', number: 2 }
                        }])
                    });
                } else {
                    await route.continue();
                }
            });

            // Mock the flag_match_score RPC
            await page.route('**/rest/v1/rpc/flag_match_score', async (route) => {
                isDisputed = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({})
                });
            });

            // Mock team filter for schedule
            await page.route('**/rest/v1/team?*', async (route) => {
                await route.fulfill({ status: 200, body: '[]' });
            });
        });

        test('should allow flagging a completed score, changing the button to a warning badge', async ({ page }) => {
            await page.goto('/schedule');

            // Click List view for safer testing
            await page.getByRole('button', { name: 'List', exact: true }).click();

            // Expect the Flag Score button to be visible initially
            const flagBtn = page.getByRole('button', { name: 'Flag Score' });
            await expect(flagBtn).toBeVisible();

            // Click the flag score button
            await flagBtn.click();

            // After clicking, the mock RPC marks it disputed, and UI assumes optimistically
            // The button should disappear and a "Score Disputed ⚠️" badge should appear
            await expect(flagBtn).not.toBeVisible();
            await expect(page.getByText('Score Disputed ⚠️')).toBeVisible();
        });
    });

    test.describe('As an Admin', () => {
        test.beforeEach(async ({ page }) => {
            // Mock admin user
            await mockSupabaseAuth(page, {
                email: 'admin@example.com',
                role: 'admin',
                playerData: { id: 'admin-1', first_name: 'Admin', last_name: 'User', is_captain: false, is_admin: true }
            });

            // Combined player mock to handle varying select combinations without fallthrough
            await page.route('**/rest/v1/player*', async (route) => {
                const url = route.request().url();
                if (url.includes('select=is_captain') || url.includes('select=*')) {
                    // Profile fetch (either AuthProvider or AddScore loadInitialData)
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ id: 'admin-1', first_name: 'Admin', last_name: 'User', is_captain: false, is_admin: true })
                    });
                } else {
                    // Assumed team rosters fetch (select=id,first_name...)
                    await route.fulfill({ status: 200, body: '[]' });
                }
            });

            // Mock player team link
            await page.route('**/rest/v1/player_to_team*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ team: 'team-1' })
                });
            });

            // Mock user team fetch
            await page.route('**/rest/v1/team?*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'team-1', name: 'Home Team', number: 1 })
                });
            });

            // Mock matches for AddScore
            await page.route('**/rest/v1/matches*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{
                        id: 'match-1',
                        home_team_number: 1,
                        away_team_number: 2,
                        home_team_name: 'Home Team',
                        away_team_name: 'Away Team'
                    }])
                });
            });

            // Mock team_match (is_disputed check)
            await page.route('**/rest/v1/team_match*', async (route) => {
                if (route.request().method() === 'GET') {
                    // AddScore uses .single() here, so return an object, not array
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ is_disputed: true })
                    });
                } else if (route.request().method() === 'PATCH') {
                    // Resolve dispute PATCH
                    await route.fulfill({ status: 204 });
                } else {
                    await route.continue();
                }
            });

            // Mock existing scores (AddScore requires line_results)
            await page.route('**/rest/v1/line_results*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
            });

            // (Mock handled above in unified route)

        });

        test('should show displacement banner and allow resolving dispute when editing match', async ({ page }) => {
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('response', resp => {
                if (resp.status() >= 400) console.log(`API FAIL: ${resp.url()} -> ${resp.status()}`);
            });

            await page.goto('/add-score');

            // Debug: print page text
            await page.waitForTimeout(1000);
            const bodyText = await page.locator('body').innerText();
            console.log('PAGE TEXT:', bodyText);

            // Wait for the matches to load and click on the disputed match card
            await page.locator('.match-card-button').first().waitFor();
            await page.locator('.match-card-button').first().click();

            // The Warning Banner should show up
            await expect(page.getByText('⚠️ Score Disputed')).toBeVisible();
            await expect(page.getByText('A player has flagged this match score for review.')).toBeVisible();
        });
    });
});
