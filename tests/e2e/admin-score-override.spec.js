import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Admin Match Result Override', () => {
  const adminUser = {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0301',
    email: 'admin@example.com',
  };

  test.beforeEach(async ({ page }) => {
    // Set the clock to Oct 2023 so the mocked match (Oct 1) is visible in the default "Month" view
    await page.clock.install({ time: new Date('2023-10-15T12:00:00') });

    // 1. Setup Auth (Admin)
    await mockSupabaseAuth(page, adminUser);

    // 2. Mock season
    await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
      const url = route.request().url();
      const isSingle = url.includes('is_current=eq.true') || url.includes('limit=1');
      const seasonObj = {
        id: 's2026-uuid',
        name: 'Summer 2026',
        is_current: true,
        start_date: '2023-09-01',
        end_date: '2023-12-31'
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? seasonObj : [seasonObj])
      });
    });

    // 3. Mock 'player' table to confirm Admin role
    await page.route('**/rest/v1/player?select=is_captain%2Cis_admin%2Cfirst_name%2Clast_name&user_id=eq.*', async (route) => {
      const pObj = {
        id: 'admin-1',
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true,
        is_captain: false
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pObj),
      });
    });

    // 4. Mock teams
    await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 't1', name: 'Home Team', number: 1, play_night: 'Tuesday' },
          { id: 't2', name: 'Away Team', number: 2, play_night: 'Tuesday' }
        ]),
      });
    });

    // 5. Mock matches
    await page.route('**/rest/v1/team_match*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'match-1',
            date: '2023-10-15',
            time: '18:00',
            status: 'completed',
            courts: '1-3',
            home_team: { id: 't1', name: 'Home Team', number: 1 },
            away_team: { id: 't2', name: 'Away Team', number: 2 },
            line_results: []
          }
        ]),
      });
    });
  });

  test('Admin sees Edit button on completed match results', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Month', exact: true }).click();

    // Wait for the match to be visible
    await expect(page.locator('.team').getByText('Home Team')).toBeVisible();
    await expect(page.locator('.team').getByText('Away Team')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();

    // Now check for the Edit button.
    await expect(page.locator('.edit-result-btn')).toBeVisible();
  });

  test('Non-Admin does NOT see Edit button', async ({ page }) => {
    // Re-mock player as non-admin
    await page.route('**/rest/v1/player?select=is_captain%2Cis_admin%2Cfirst_name%2Clast_name&user_id=eq.*', async (route) => {
      const pObj = {
        id: 'user-1',
        first_name: 'Regular',
        last_name: 'User',
        is_admin: false,
        is_captain: false
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pObj),
      });
    });

    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    await expect(page.locator('.team').getByText('Home Team')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).not.toBeVisible();
  });
});
