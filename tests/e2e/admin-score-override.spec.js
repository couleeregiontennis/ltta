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
    await page.route('**/rest/v1/season*', async (route) => {
      const url = route.request().url();
      const isSingle = url.includes('is_current=eq.true') || url.includes('id=eq');
      const seasonObj = {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0001',
        name: 'Fall 2023',
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
    await page.route('**/rest/v1/player*', async (route) => {
      // Force return admin for any player query to rule out ID mismatch
      const url = route.request().url();
      const isSingle = url.includes('id=eq');
      const pObj = {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0301',
        name: 'Admin User',
        is_admin: true,
        is_captain: false
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? pObj : [pObj]),
      });
    });

    // 4. Mock teams
    await page.route('**/rest/v1/team*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'd290f1ee-6c54-4b01-90e6-d701748f0101', name: 'Home Team', number: 1, play_night: 'Tuesday' },
          { id: 'd290f1ee-6c54-4b01-90e6-d701748f0102', name: 'Away Team', number: 2, play_night: 'Tuesday' }
        ]),
      });
    });

    // 5. Mock matches - MatchSchedule.jsx uses team_match with nested relations
    await page.route('**/rest/v1/team_match*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0201',
            date: '2023-10-15',
            time: '18:00',
            status: 'completed', // Important: status completed
            courts: '1-3',
            home_team: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0101', name: 'Home Team', number: 1 },
            away_team: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0102', name: 'Away Team', number: 2 }
          }
        ]),
      });
    });
  });

  test('Admin sees Edit button on completed match results', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Month', exact: true }).click();

    // Wait for the match to be visible
    // Use first() or specific locator to avoid strict mode violation with the filter dropdown option
    await expect(page.locator('.team-name').getByText('Home Team')).toBeVisible();
    await expect(page.locator('.team-name').getByText('Away Team')).toBeVisible();
    await expect(page.getByText('Final score submitted')).toBeVisible();

    // Now check for the Edit button.
    // It should be visible because we are logged in as Admin.
    // Use the class selector as fallback if getByRole is strict/flaky for some reason,
    // although getByRole is preferred.
    await expect(page.locator('.edit-result-btn')).toBeVisible();
  });

  test('Non-Admin does NOT see Edit button', async ({ page }) => {
    // Re-mock auth as non-admin for this test
    const regularUser = { id: 'd290f1ee-6c54-4b01-90e6-d701748f0302', email: 'reg@example.com' };
    await mockSupabaseAuth(page, regularUser);

    await page.route('**/rest/v1/player*', async (route) => {
      // ... return non-admin
      const url = route.request().url();
      if (url.includes('id=eq.d290f1ee-6c54-4b01-90e6-d701748f0302')) {
        const isSingle = true;
        const pObj = {
          id: 'd290f1ee-6c54-4b01-90e6-d701748f0302',
          name: 'Reg User',
          is_admin: false,
          is_captain: false
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(isSingle ? pObj : [pObj]),
        });
      } else {
        // For .select() queries that might expect arrays (though .single might fail if called incorrectly)
        // But the else block here is generic. If AuthProvider calls it with .single(), this [] might fail it.
        // But for d290f1ee-6c54-4b01-90e6-d701748f0302 we are safe.
        await route.fulfill({ status: 200, body: '[]' });
      }
    });

    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    await expect(page.locator('.team-name').getByText('Home Team')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Result' })).not.toBeVisible();
  });
});
