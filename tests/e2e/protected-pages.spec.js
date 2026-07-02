import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Protected Pages @live', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.error(`BROWSER EXCEPTION: ${err.message}\nStack: ${err.stack}`);
    });

    await mockSupabaseAuth(page);

    // Mock generic user data calls that might happen on any protected page load
    // We default to a user with NO special roles, unless overridden in specific tests
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        const url = route.request().url();
        const isList = url.includes('is_active=eq.true') || url.includes('order=last_name.asc');
        const baseData = {
          id: 'fake-user-id',
          first_name: 'Test',
          last_name: 'User',
          is_captain: false,
          is_admin: false
        };
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isList ? [baseData] : baseData),
        });
    });
  });

  test('Player Profile loads', async ({ page }) => {
    await page.goto('/player-profile');
    await expect(page.getByRole('heading', { name: 'Player Profile' })).toBeVisible();
    // Profile combines first and last name into Full Name field
    await expect(page.getByLabel('Full Name *')).toHaveValue('Test User');
  });

  test('My Schedule loads', async ({ page }) => {
    // Mock user's team
     await page.route('**/rest/v1/player_to_team*player=eq.fake-user-id*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
            {
                team: {
                    id: 'team-1',
                    name: 'My Team',
                    number: 5,
                    play_night: 'Monday'
                }
            }
        ]),
      });
    });

    // Mock matches (team_match table)
    await page.route('**/rest/v1/team_match*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                {
                    id: 1,
                    date: '2099-11-01', // Future date
                    time: '18:00',
                    home_team_id: 'team-1',
                    away_team_id: 'team-2',
                    home_team: { id: 'team-1', name: 'My Team', number: 5 },
                    away_team: { id: 'team-2', name: 'Rivals', number: 6 },
                    courts: '1-3',
                    status: 'scheduled',
                    line_results: [
                        {
                            line_number: 1,
                            match_type: 'singles',
                            home_player_1_id: 'fake-user-id',
                            home_player_2_id: null,
                            away_player_1_id: null,
                            away_player_2_id: null
                        }
                    ]
                }
            ]),
        });
    });

    await page.goto('/my-schedule');
    await expect(page.getByRole('heading', { name: 'My Schedule' })).toBeVisible();
    // Component displays "Team X - Name", not "My Team vs Rivals" directly
    await expect(page.getByText('Team 6 - Rivals')).toBeVisible();
    // "I'm Playing" indicator should show "Yes" since player is in a line result
    await expect(page.getByText('Yes')).toBeVisible();
  });

  test('My Schedule shows matches where player team is away', async ({ page }) => {
    // Mock user's team
     await page.route('**/rest/v1/player_to_team*player=eq.fake-user-id*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
            {
                team: {
                    id: 'team-2',
                    name: 'Rivals',
                    number: 6,
                    play_night: 'Tuesday'
                }
            }
        ]),
      });
    });

    // Mock matches where player's team is the AWAY team
    await page.route('**/rest/v1/team_match*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                {
                    id: 1,
                    date: '2099-11-01',
                    time: '18:00',
                    home_team_id: 'team-1',
                    away_team_id: 'team-2',
                    home_team: { id: 'team-1', name: 'My Team', number: 5 },
                    away_team: { id: 'team-2', name: 'Rivals', number: 6 },
                    courts: '1-3',
                    status: 'scheduled',
                    line_results: [
                        {
                            line_number: 1,
                            match_type: 'singles',
                            home_player_1_id: null,
                            home_player_2_id: null,
                            away_player_1_id: 'fake-user-id',
                            away_player_2_id: null
                        }
                    ]
                }
            ]),
        });
    });

    await page.goto('/my-schedule');
    await expect(page.getByRole('heading', { name: 'My Schedule' })).toBeVisible();
    // Should still find opponent and the "Playing" indicator
    await expect(page.getByText('Team 5 - My Team')).toBeVisible();
    await expect(page.getByText('Yes')).toBeVisible();
  });

  test('My Schedule shows "Not yet assigned" when player not in line results', async ({ page }) => {
    // Mock user's team
     await page.route('**/rest/v1/player_to_team*player=eq.fake-user-id*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
            {
                team: {
                    id: 'team-1',
                    name: 'My Team',
                    number: 5,
                    play_night: 'Monday'
                }
            }
        ]),
      });
    });

    // Mock match with line_results but player NOT in any line
    await page.route('**/rest/v1/team_match*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                {
                    id: 1,
                    date: '2099-11-01',
                    time: '18:00',
                    home_team_id: 'team-1',
                    away_team_id: 'team-2',
                    home_team: { id: 'team-1', name: 'My Team', number: 5 },
                    away_team: { id: 'team-2', name: 'Rivals', number: 6 },
                    courts: '1-3',
                    status: 'scheduled',
                    line_results: [
                        {
                            line_number: 1,
                            match_type: 'singles',
                            home_player_1_id: 'other-player-id',
                            home_player_2_id: null,
                            away_player_1_id: null,
                            away_player_2_id: null
                        }
                    ]
                }
            ]),
        });
    });

    await page.goto('/my-schedule');
    await expect(page.getByRole('heading', { name: 'My Schedule' })).toBeVisible();
    await expect(page.getByText('Not yet assigned')).toBeVisible();
  });

  test('Captain Dashboard loads', async ({ page }) => {
    // 1. Player check (needs is_captain=true)
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'fake-user-id',
              first_name: 'Test',
              last_name: 'User',
              is_captain: true,
              is_admin: true
            }),
        });
    });

    // 2. Player to Team (to find which team captain belongs to)
    await page.route('**/rest/v1/player_to_team*player=eq.fake-user-id*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ team: 'team-1' }),
        });
    });

    // 3. Team Details
    await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'team-1', number: 1, name: 'The Aces', play_night: 'Monday' }),
        });
    });

    // 4. Team Roster (player_to_team with players)
    await page.route('**/rest/v1/player_to_team?select=*%2Cplayer%28*%29&team=eq.team-1*', async (route) => {
         await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    // 5. Matches (season record, upcoming)
    await page.route('**/rest/v1/team_match*', async (route) => {
         await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.goto('/captain-dashboard');
    await expect(page.getByRole('heading', { name: 'Captain Dashboard' })).toBeVisible();
  });

  test('Admin: Schedule Generator loads', async ({ page }) => {
    // Mock captain for this route
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'fake-user-id',
              first_name: 'Admin',
              last_name: 'User',
              is_captain: true,
              is_admin: true
            }),
        });
    });
    await page.goto('/admin/schedule-generator');
    await expect(page.getByRole('heading', { name: 'Schedule Generator' })).toBeVisible();
  });

  test('Admin: Player Management loads', async ({ page }) => {
    // Mock admin/captain
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'fake-user-id',
              first_name: 'Admin',
              last_name: 'User',
              is_captain: true,
              is_admin: true
            }),
        });
    });
    // Mock list of players for the management page
    await page.route('**/rest/v1/player?select=*&order=last_name.asc', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.goto('/admin/player-management');
    await expect(page.getByRole('heading', { name: 'Player Management' })).toBeVisible();
  });

  test('Admin: Team Management loads', async ({ page }) => {
    // Mock admin/captain
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'fake-user-id',
              first_name: 'Admin',
              last_name: 'User',
              is_captain: true,
              is_admin: true
            }),
        });
    });
    await page.goto('/admin/team-management');
    await expect(page.locator('h2')).toContainText('Team Management');
  });

});
