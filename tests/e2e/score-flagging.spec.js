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
            await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
                const seasonObj = {
                  id: 's2026-uuid',
                  number: 2026,
                  name: 'Summer 2026',
                  is_current: true,
                  start_date: '2026-06-01'
                };
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(route.request().url().includes('limit=1') || route.request().url().includes('is_current=eq.true') ? seasonObj : [seasonObj])
                });
            });

            // Mock team_match consolidated
            let isDisputed = false;
            await page.route('**/rest/v1/team_match*', async (route) => {
                const url = route.request().url();
                if (route.request().method() === 'GET') {
                    if (/[?&]is_disputed=eq\.true(&|$)/.test(url)) {
                      await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([{ home_team_id: 'team-1', away_team_id: 'team-2' }])
                      });
                    } else if (/[?&]id=eq\./.test(url)) {
                      await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            id: 'match-1',
                            date: new Date().toISOString(),
                            time: '18:00',
                            status: 'completed',
                            courts: '1, 2',
                            is_rained_out: false,
                            is_disputed: isDisputed,
                            home_team: { id: 'team-1', name: 'Home Team', number: 1 },
                            away_team: { id: 'team-2', name: 'Away Team', number: 2 },
                            line_results: []
                        })
                      });
                    } else {
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
                            away_team: { id: 'team-2', name: 'Away Team', number: 2 },
                            line_results: []
                        }])
                      });
                    }
                } else {
                    await route.continue();
                }
            });

            // Mock legacy matches table
            await page.route('**/rest/v1/matches*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                });
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
            await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
                await route.fulfill({ 
                  status: 200, 
                  contentType: 'application/json',
                  body: JSON.stringify([{ id: 'team-1', name: 'Home Team', number: 1 }]) 
                });
            });

            // Mock standings requests
            await page.route('**/rest/v1/standings_2026_view*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{
                        team_id: 'team-1',
                        team_number: 1,
                        team_name: 'Home Team',
                        total_points: 1,
                        matches_played: 1,
                        total_sets_won: 3,
                        total_sets_lost: 0,
                        win_percentage: 100
                    }])
                });
            });

            await page.route('**/functions/v1/playoff-scenarios', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({})
                });
            });
            
            // Mock player count
            await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
              if (route.request().method() === 'HEAD') {
                await route.fulfill({ status: 200, headers: { 'Content-Range': '0-10/10' } });
              } else {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
              }
            });

            await page.route('**/functions/v1/playoff-scenarios', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({})
                });
            });
        });

        test('should allow flagging a completed score, changing the button to a warning badge', async ({ page }) => {
            await page.goto('/schedule');

            // Click List view for safer testing
            await page.getByRole('button', { name: 'List', exact: true }).click();

            // Expect the Flag Score button to be visible initially
            const flagBtn = page.locator('button.flag-score-btn');
            await expect(flagBtn).toBeVisible();

            // Click the flag score button
            await flagBtn.click();

            // Button should disappear and a "Score Disputed ⚠️" badge should appear
            await expect(flagBtn).not.toBeVisible();
            await expect(page.getByText('Score Disputed ⚠️')).toBeVisible();
        });

        test('should show warning badge in Standings for team with disputed match', async ({ page }) => {
            await page.goto('/standings');
            // Give it a moment to settle
            await page.waitForTimeout(1000);

            // Check for the team and dispute badge in either desktop or mobile view
            const isMobile = await page.evaluate(() => window.innerWidth <= 768);
            let teamContainer;

            if (isMobile) {
              teamContainer = page.locator('.standings-mobile-card').filter({ hasText: 'Home Team' }).first();
            } else {
              teamContainer = page.locator('.standings-table td').filter({ hasText: 'Home Team' }).first();
            }

            await expect(teamContainer).toBeVisible({ timeout: 10000 });
            
            // Check for the dispute badge within that container
            const badge = teamContainer.locator('.dispute-badge');
            await expect(badge).toBeVisible();
            await expect(badge).toHaveText('⚠️');
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

            // Mock season data
            await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
              const seasonObj = { id: 's2026-uuid', number: 2026, name: 'Summer 2026', is_current: true };
              await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(route.request().url().includes('limit=1') || route.request().url().includes('is_current=eq.true') ? seasonObj : [seasonObj]) });
            });

            // Combined player mock to handle varying select combinations without fallthrough
            await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
                const url = route.request().url();
                if (route.request().method() === 'HEAD') {
                   await route.fulfill({ status: 200, headers: { 'Content-Range': '0-1/1' } });
                   return;
                }
                if (url.includes('select=is_captain') || url.includes('select=*')) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ id: 'admin-1', first_name: 'Admin', last_name: 'User', is_captain: false, is_admin: true })
                    });
                } else {
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
            await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'team-1', name: 'Home Team', number: 1 })
                });
            });

            // Mock team_match consolidated for Admin
            await page.route('**/rest/v1/team_match*', async (route) => {
                const url = route.request().url();
                if (route.request().method() === 'GET') {
                    if (/[?&]is_disputed=eq\.true(&|$)/.test(url)) {
                      await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([{ home_team_id: 'team-1', away_team_id: 'team-2' }])
                      });
                    } else if (/[?&]id=eq\./.test(url)) {
                      await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            id: 'match-1',
                            home_team_id: 'team-1',
                            away_team_id: 'team-2',
                            home_team: { name: 'Home Team', number: 1 },
                            away_team: { name: 'Away Team', number: 2 },
                            is_disputed: true,
                            status: 'completed'
                        })
                      });
                    } else {
                      await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([{
                            id: 'match-1',
                            home_team_id: 'team-1',
                            away_team_id: 'team-2',
                            home_team: { name: 'Home Team', number: 1 },
                            away_team: { name: 'Away Team', number: 2 },
                            is_disputed: true,
                            status: 'completed'
                        }])
                      });
                    }
                } else if (route.request().method() === 'PATCH') {
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
        });

        test('should show displacement banner and allow resolving dispute when editing match', async ({ page }) => {
            await page.goto('/add-score');

            // Select the match from the dropdown
            await page.selectOption('select[name="matchId"]', 'match-1');

            // The Warning Banner should show up
            await expect(page.getByText('⚠️ Score Disputed')).toBeVisible();
            await expect(page.getByText('A player has flagged this match score for review.')).toBeVisible();
        });
    });
});
