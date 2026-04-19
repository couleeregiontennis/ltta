import { test, expect } from '@playwright/test';

test.describe('Playoff Scenarios UI', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await page.setViewportSize({ width: 1280, height: 720 });
        // Mock season data
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

        // Intercept specific Supabase Edge Function calls
        await page.route('**/functions/v1/playoff-scenarios', async route => {
            const json = {
                "1": { "magicNumber": 0, "status": "Clinched", "matchesRemaining": 0, "maxPossibleWins": 10 },
                "2": { "magicNumber": 2, "status": "Control Destiny", "matchesRemaining": 4, "maxPossibleWins": 11 },
                "3": { "magicNumber": 4, "status": "On the Hunt", "matchesRemaining": 5, "maxPossibleWins": 9 },
                "4": { "magicNumber": 0, "status": "Eliminated", "matchesRemaining": 1, "maxPossibleWins": 5 }
            };
            await route.fulfill({ json });
        });

        await page.route('**/rest/v1/team_match*is_disputed=eq.true*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        // Mock standings view data
        await page.route('**/rest/v1/standings_2026_view*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { team_id: 't1', team_name: 'Team A', team_number: 1, play_night: 'Monday', total_points: 20, matches_played: 12, total_sets_won: 20, total_sets_lost: 4, win_percentage: 83.3, wins: 10, losses: 2, games_won: 120, games_lost: 40, total_bonus_points: 2 },
                    { team_id: 't2', team_name: 'Team B', team_number: 2, play_night: 'Tuesday', total_points: 10, matches_played: 12, total_sets_won: 10, total_sets_lost: 14, win_percentage: 41.7, wins: 5, losses: 7, games_won: 60, games_lost: 70, total_bonus_points: 1 },
                    { team_id: 't3', team_name: 'Team C', team_number: 3, play_night: 'Tuesday', total_points: 10, matches_played: 12, total_sets_won: 10, total_sets_lost: 14, win_percentage: 41.7, wins: 5, losses: 7, games_won: 60, games_lost: 70, total_bonus_points: 1 },
                    { team_id: 't4', team_name: 'Team D', team_number: 4, play_night: 'Tuesday', total_points: 10, matches_played: 12, total_sets_won: 10, total_sets_lost: 14, win_percentage: 41.7, wins: 5, losses: 7, games_won: 60, games_lost: 70, total_bonus_points: 1 }
                ])
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

        // Mock matches for recent matches
        await page.route('**/rest/v1/team_match*', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });

        await page.route('**/rest/v1/matches*', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });

        await page.goto('/standings');
    });

    test('should display playoff status column correctly', async ({ page }) => {
        // Verify the "Status" column header exists
        await expect(page.locator('th >> text=Status')).toBeVisible();

        // Verifybadges are visible
        // The table is sortable, so they should be there.
        await expect(page.locator('.standings-table')).toBeVisible();

        // Check for statuses in the table
        await expect(page.locator('.standings-table >> text=Clinched')).toBeVisible();
        await expect(page.locator('.standings-table >> text=Control Destiny')).toBeVisible();
        await expect(page.locator('.standings-table >> text=Magic #:')).toBeVisible();
        await expect(page.locator('.standings-table >> text=Eliminated')).toBeVisible();
    });
});
