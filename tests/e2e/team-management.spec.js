import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Admin Team Management', () => {
  const adminUser = {
    id: 'admin-user-id',
    email: 'admin@example.com',
  };

  const nonAdminUser = {
    id: 'player-user-id',
    email: 'player@example.com',
  };

  const mockTeams = [
    { id: 'team-1', name: 'Alpha', number: 1, play_night: 'Tuesday' },
    { id: 'team-2', name: 'Bravo', number: 2, play_night: 'Wednesday' },
  ];

  const mockAllPlayers = [
    { id: 'p1', first_name: 'John', last_name: 'Doe', is_active: true, is_captain: false },
    { id: 'p2', first_name: 'Jane', last_name: 'Smith', is_active: true, is_captain: true },
    { id: 'p3', first_name: 'Unassigned', last_name: 'Player', is_active: true, is_captain: false },
  ];

  const mockPlayerToTeam = [
    { id: 'ptt-1', player: 'p1', team: 'team-1', player_table: { id: 'p1', first_name: 'John', last_name: 'Doe', is_captain: false } },
    { id: 'ptt-2', player: 'p2', team: 'team-1', player_table: { id: 'p2', first_name: 'Jane', last_name: 'Smith', is_captain: true } },
  ];

  test('redirects non-admin users', async ({ page }) => {
    // Attempt to access without logging in
    await page.goto('/admin/team-management');
    await expect(page).toHaveURL(/.*login/);

    // Login as non-admin player
    await mockSupabaseAuth(page, nonAdminUser);
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      const accept = route.request().headers()['accept'] || '';
      const isSingle = accept.includes('vnd.pgrst.object') || url.includes('limit=1');

      if (method === 'GET' && url.includes(`user_id=eq.${nonAdminUser.id}`)) {
          const data = {
            id: 'player-p-id',
            user_id: nonAdminUser.id,
            is_admin: false,
            is_captain: false,
            first_name: 'Player',
            last_name: 'User'
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isSingle ? data : [data]),
          });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/team-management');
    // The redirect goes to / not /schedule (based on ProtectedRoute.jsx)
    await expect(page).toHaveURL(new RegExp(`${process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173'}/$`));
  });

  test.describe('Admin Access', () => {
    test.beforeEach(async ({ page }) => {
      await mockSupabaseAuth(page, adminUser);

      await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        const url = route.request().url();
        const method = route.request().method();
        const accept = route.request().headers()['accept'] || '';
        const isSingle = accept.includes('vnd.pgrst.object') || url.includes('limit=1');

        if (method === 'GET') {
          if (url.includes(`user_id=eq.${adminUser.id}`)) {
            const data = {
              id: 'admin-p-id',
              user_id: adminUser.id,
              is_admin: true,
              is_captain: false,
              first_name: 'Admin',
              last_name: 'User'
            };
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(isSingle ? data : [data]),
            });
          } else if (url.includes('is_active=eq.true')) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockAllPlayers),
            });
          } else {
            await route.continue();
          }
        } else if (method === 'PATCH') { // intercept captain updates
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        } else {
          await route.continue();
        }
      });

      await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockTeams),
          });
        } else if (route.request().method() === 'PATCH') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        } else {
           await route.continue();
        }
      });

      await page.route(/\/rest\/v1\/player_to_team($|\?)/, async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
           const url = route.request().url();
           if(url.includes('select=player')) {
             await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{player: 'p1'}, {player: 'p2'}]),
              });
           } else {
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockPlayerToTeam),
              });
           }
        } else if (method === 'POST' || method === 'DELETE') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/admin/team-management');
    });

    test('admin can access and see teams', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Team Management');
      await expect(page.locator('.team-list li')).toHaveCount(2);
      await expect(page.locator('.team-list li').first()).toContainText('Alpha');
    });

    test('admin can select a team, see roster, add/remove player, and edit team', async ({ page }) => {
      // Select first team
      await page.locator('.team-list li button', { hasText: 'Select' }).first().click();

      // Roster view should be visible
      await expect(page.locator('.right-column h3')).toContainText('Roster');
      await expect(page.locator('.roster-list li')).toHaveCount(2);
      await expect(page.locator('.roster-list li').first()).toContainText('John Doe');

      // Test add player if unassigned players exist
      const unassignedPlayerSelect = page.locator('.add-player-section select');
      await expect(unassignedPlayerSelect).toBeVisible();

      await unassignedPlayerSelect.selectOption({ label: 'Unassigned Player' });
      await expect(page.locator('.toast').filter({ hasText: 'Player added successfully' })).toBeVisible();

      // Test remove player
      await page.locator('.roster-list li').first().locator('button', { hasText: 'Remove' }).click();
      await expect(page.locator('.toast').filter({ hasText: 'Player removed successfully' })).toBeVisible();

      // Test edit team - verify form exists and can be updated
      await page.locator('.team-list li').first().locator('button', { hasText: 'Edit' }).click();
      await page.locator('input.edit-team-name').fill('Alpha Edited');
      await page.locator('select.edit-team-night').selectOption('Wednesday');
      await page.locator('button', { hasText: 'Save' }).click();
      await expect(page.locator('.toast').filter({ hasText: 'Team updated successfully' })).toBeVisible();

      // Test toggle captain
      await page.locator('.roster-list li').last().locator('button', { hasText: 'Toggle Captain' }).click();
      await expect(page.locator('.toast').filter({ hasText: 'Captain status updated' })).toBeVisible();
    });
  });
});
