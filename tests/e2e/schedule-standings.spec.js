import { test, expect } from '@playwright/test';
import { disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Match Schedule Page', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  test('displays upcoming matches', async ({ page }) => {
    // Set fixed time so the month view shows the mocked matches
    await page.clock.install({ time: new Date('2023-10-01T12:00:00') });

    // Mock season data (required for MatchSchedule to load)
    await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
      const url = route.request().url();
      const seasonObj = {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0001',
        name: 'Fall 2023',
        start_date: '2023-09-01',
        end_date: '2023-12-31'
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(url.includes('is_current=eq.true') || url.includes('id=eq') ? seasonObj : [seasonObj])
      });
    });

    // Mock team data (required for filter dropdown, otherwise fetch fails)
    await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'd290f1ee-6c54-4b01-90e6-d701748f0101', name: 'Aces', number: 1 },
          { id: 'd290f1ee-6c54-4b01-90e6-d701748f0102', name: 'Faults', number: 2 },
          { id: 'd290f1ee-6c54-4b01-90e6-d701748f0103', name: 'Netters', number: 3 },
          { id: 'd290f1ee-6c54-4b01-90e6-d701748f0104', name: 'Lobbers', number: 4 }
        ])
      });
    });

    // Mock the matches data (team_match table with relations)
    await page.route('**/rest/v1/team_match*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0201',
            date: '2023-10-15',
            time: '18:00',
            status: 'upcoming',
            courts: '1-3',
            home_team: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0101', name: 'Aces', number: 1 },
            away_team: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0102', name: 'Faults', number: 2 }
          },
          {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0202',
            date: '2023-10-16',
            time: '18:00',
            status: 'upcoming',
            courts: '4-6',
            home_team: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0103', name: 'Netters', number: 3 },
            away_team: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0104', name: 'Lobbers', number: 4 }
          }
        ]),
      });
    });

    await page.goto('/'); // Root is MatchSchedule
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    // Check for team names individually as they might stack on mobile or have different layout
    await expect(page.locator('.team').getByText('Aces', { exact: true })).toBeVisible();
    await expect(page.locator('.team').getByText('Faults', { exact: true })).toBeVisible();
    await expect(page.locator('.team').getByText('Netters', { exact: true })).toBeVisible();
    await expect(page.locator('.team').getByText('Lobbers', { exact: true })).toBeVisible();
  });

  test('displays standings', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // Mock season data (required for Standings to load)
    await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
      const seasonObj = {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0001',
        name: 'Fall 2023',
        start_date: '2023-09-01',
        end_date: '2023-12-31'
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(route.request().url().includes('limit=1') || route.request().url().includes('is_current=eq.true') ? seasonObj : [seasonObj])
      });
    });

    // Mock standings_2026_view data (correct endpoint for Standings.jsx)
    await page.route('**/rest/v1/standings_2026_view*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            team_id: '1',
            team_number: 1,
            team_name: 'Team A',
            play_night: 'Tuesday',
            total_points: 10,
            matches_played: 12,
            total_sets_won: 20,
            total_sets_lost: 4,
            set_win_percentage: 83.3,
            games_won: 120,
            games_lost: 50,
            bonus_points: 2
          },
          {
            team_id: '2',
            team_number: 2,
            team_name: 'Team B',
            play_night: 'Wednesday',
            total_points: 5,
            matches_played: 12,
            total_sets_won: 10,
            total_sets_lost: 14,
            set_win_percentage: 41.7,
            games_won: 80,
            games_lost: 100,
            bonus_points: 1
          }
        ])
      });
    });

    // Mock player count (required for League Overview)
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
      if (route.request().url().includes('count=exact')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'content-range': '0-0/100' }, // Mock total count
          body: JSON.stringify([])
        });
      } else {
        await route.continue();
      }
    });

    // Mock matches for recent matches in Overview
    await page.route('**/rest/v1/team_match*status=eq.completed*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/rest/v1/matches*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock playoff scenarios for the Standings component
    await page.route('**/functions/v1/playoff-scenarios', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
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

    await page.goto('/standings');
    await expect(page.getByRole('heading', { name: 'Team Standings' })).toBeVisible();

    // Assert visibility of team names - support both desktop table and mobile cards
    const isMobile = await page.evaluate(() => window.innerWidth <= 768);
    let teamA, teamB;

    if (isMobile) {
      teamA = page.locator('.standings-mobile-card').filter({ hasText: 'Team A' }).first();
      teamB = page.locator('.standings-mobile-card').filter({ hasText: 'Team B' }).first();
    } else {
      teamA = page.locator('.standings-table').getByText('Team A');
      teamB = page.locator('.standings-table').getByText('Team B');
    }
    
    await expect(teamA).toBeVisible();
    await expect(teamB).toBeVisible();
  });

});
