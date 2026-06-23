import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, mockSupabaseData, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Access Control Verification @live', () => {

  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: ${exception}`));

    await mockSupabaseAuth(page);
    await mockSupabaseData(page, 'matches', []);
    await mockSupabaseData(page, 'team', []);

    // Default: Mock generic user data - NOT admin, NOT captain
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        const data = {
          id: 'p1',
          user_id: 'test-user-id',
          first_name: 'Regular',
          last_name: 'User',
          is_captain: false,
          is_admin: false
        };
        const isSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object');
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isSingle ? data : [data]),
        });
    });
  });

  test('Non-Admin accessing Schedule Generator redirects to Home', async ({ page }) => {
    await page.goto('/admin/schedule-generator');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Match Schedule')).toBeVisible();
  });

  test('Non-Captain accessing Captain Dashboard redirects to Home', async ({ page }) => {
    await page.goto('/captain-dashboard');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Match Schedule')).toBeVisible();
  });

  test('Admin CAN access Schedule Generator', async ({ page }) => {
    // Override player mock
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        const data = {
          id: 'p-admin',
          user_id: 'test-user-id',
          first_name: 'Admin',
          last_name: 'User',
          is_captain: true,
          is_admin: true
        };
        const isSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object');
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isSingle ? data : [data]),
        });
    });

    await page.goto('/admin/schedule-generator');
    // URL should be preserved
    expect(page.url()).toContain('/admin/schedule-generator');
    // Content should be visible
    await expect(page.getByRole('heading', { name: 'Schedule Generator' })).toBeVisible();
  });

  test('Captain CAN access Captain Dashboard', async ({ page }) => {
     // Override player mock
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
        const data = {
          id: 'p-captain',
          user_id: 'test-user-id',
          first_name: 'Captain',
          last_name: 'User',
          is_captain: true,
          is_admin: false
        };
        const isSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object');
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isSingle ? data : [data]),
        });
    });

    // Mock specific dashboard data to avoid errors
    await page.route('**/rest/v1/player_to_team*', async route => {
      const data = [{ team: 'team-1', player: { id: 'p-captain', first_name: 'Captain', last_name: 'User', ranking: 1, is_active: true } }];
      const isSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? data[0] : data) });
    });
    await page.route(/\/rest\/v1\/team($|\?)/, async route => route.fulfill({ status: 200, body: JSON.stringify([{ id: 'team-1', number: 1, name: 'Test Team', play_night: 'Tuesday' }]) }));

    await page.goto('/captain-dashboard');
    expect(page.url()).toContain('/captain-dashboard');
    await expect(page.getByRole('heading', { name: 'Captain Dashboard' })).toBeVisible();
  });

});
