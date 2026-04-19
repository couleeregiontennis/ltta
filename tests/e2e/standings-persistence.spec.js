import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Standings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);

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
  });

  test('persists league night filter selection', async ({ page }) => {
    // Mock standings view data
    await page.route('**/rest/v1/standings_2026_view*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            team_id: 't1',
            team_name: 'Team A',
            team_number: 1,
            play_night: 'Monday',
            total_points: 20,
            matches_played: 12,
            total_sets_won: 20,
            total_sets_lost: 4,
            win_percentage: 83.3,
            total_bonus_points: 2
          },
          {
            team_id: 't2',
            team_name: 'Team B',
            team_number: 2,
            play_night: 'Tuesday',
            total_points: 10,
            matches_played: 12,
            total_sets_won: 10,
            total_sets_lost: 14,
            win_percentage: 41.7,
            total_bonus_points: 1
          }
        ])
      });
    });

    // Mock matches for recent matches
    await page.route('**/rest/v1/team_match*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock disputed matches for the Standings component
    await page.route('**/rest/v1/team_match*is_disputed=eq.true*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock legacy matches table (Overview dates and recent matches)
    await page.route('**/rest/v1/matches*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock playoff scenarios
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
        await route.fulfill({
          status: 200,
          headers: { 'Content-Range': '0-10/10' }
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.goto('/standings');

    // Select 'Tuesday' filter
    const tuesdayButton = page.getByRole('button', { name: 'Tuesday' });
    await expect(tuesdayButton).toBeVisible();
    await tuesdayButton.click();

    // Verify filter is active
    await expect(tuesdayButton).toHaveClass(/active/);

    // Reload page
    await page.reload();

    // Verify 'Tuesday' filter is still active
    await expect(page.getByRole('button', { name: 'Tuesday' })).toHaveClass(/active/);
  });
});
