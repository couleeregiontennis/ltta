import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Admin Registration Management', () => {
  const adminUser = {
    id: 'admin-user',
    email: 'admin@example.com',
    is_admin: true,
    is_captain: false,
    first_name: 'Admin',
    last_name: 'User',
  };

  const mockSeason = {
    id: 'season-1',
    number: 1,
    start_date: '2026-01-01',
    end_date: '2026-03-31',
    dues_amount_cents: 2500,
  };

  const mockRegistrations = [
    {
      id: 'reg-1',
      player_id: 'player-1',
      season_id: 'season-1',
      status: 'completed',
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-15T10:00:00Z',
      player: {
        id: 'player-1',
        first_name: 'Alice',
        last_name: 'Anderson',
        email: 'alice@example.com',
      },
      payments: [
        { id: 'pay-1', status: 'paid', created_at: '2026-01-15T10:05:00Z' },
      ],
    },
    {
      id: 'reg-2',
      player_id: 'player-2',
      season_id: 'season-1',
      status: 'pending',
      created_at: '2026-01-14T09:00:00Z',
      updated_at: '2026-01-14T09:00:00Z',
      player: {
        id: 'player-2',
        first_name: 'Bob',
        last_name: 'Brown',
        email: 'bob@example.com',
      },
      payments: [],
    },
    {
      id: 'reg-3',
      player_id: 'player-3',
      season_id: 'season-1',
      status: 'pending',
      created_at: '2026-01-13T08:00:00Z',
      updated_at: '2026-01-13T08:00:00Z',
      player: {
        id: 'player-3',
        first_name: 'Charlie',
        last_name: 'Clark',
        email: 'charlie@example.com',
      },
      payments: [
        { id: 'pay-3', status: 'failed', created_at: '2026-01-13T08:05:00Z' },
      ],
    },
  ];

  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page, adminUser);

    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
      const url = route.request().url();
      const accept = route.request().headers()['accept'] || '';
      const isSingle = accept.includes('vnd.pgrst.object') || url.includes('limit=1');

      if (url.includes('user_id=eq.admin-user') || url.includes('limit=1')) {
        const data = {
          id: 'admin-user',
          user_id: 'admin-user',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          is_captain: false,
          is_admin: true,
          is_active: true,
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(isSingle ? data : [data]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockSeason]),
      });
    });

    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRegistrations),
      });
    });
  });


  test('loads and displays registrations with stats for admin', async ({ page }) => {
    await page.goto('/admin/registration-management');

    await expect(page.getByRole('heading', { name: 'Registration Management' })).toBeVisible();

    // Summary stats
    await expect(page.locator('.summary-card', { hasText: 'Total Registered' }).locator('.value')).toHaveText('3');
    await expect(page.locator('.summary-card', { hasText: 'Total Paid' }).locator('.value')).toHaveText('1');
    await expect(page.locator('.summary-card', { hasText: 'Pending' }).locator('.value')).toHaveText('1');

    // Table rows
    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'alice@example.com' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Charlie Clark' })).toBeVisible();

    // Payment status badges
    await expect(page.locator('.status-badge.paid', { hasText: 'paid' })).toBeVisible();
    await expect(page.locator('.status-badge.pending', { hasText: 'pending' })).toHaveCount(1);
    await expect(page.locator('.status-badge.failed', { hasText: 'failed' })).toBeVisible();
  });

  test('filters registrations by payment status', async ({ page }) => {
    await page.goto('/admin/registration-management');

    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Charlie Clark' })).toBeVisible();

    await page.getByLabel('Payment Status').selectOption('paid');

    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Charlie Clark' })).not.toBeVisible();

    await page.getByLabel('Payment Status').selectOption('pending');

    await expect(page.getByRole('cell', { name: 'Bob Brown' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Charlie Clark' })).not.toBeVisible();
  });

  test('sorts registrations by player name', async ({ page }) => {
    await page.goto('/admin/registration-management');

    const firstRow = page.locator('.registration-table tbody tr').first();
    // Default sort is by registration date descending, so Alice (most recent) is first.
    await expect(firstRow).toContainText('Alice Anderson');

    await page.getByRole('columnheader', { name: 'Player Name' }).click();
    // First click sorts ascending alphabetically.
    await expect(firstRow).toContainText('Alice Anderson');

    await page.getByRole('columnheader', { name: 'Player Name' }).click();
    // Second click sorts descending alphabetically.
    await expect(firstRow).toContainText('Charlie Clark');
  });

  test('links to payment management', async ({ page }) => {
    await page.goto('/admin/registration-management');

    await page.getByRole('link', { name: 'View Payments' }).click();

    await expect(page).toHaveURL('/admin/payment-management');
  });

  test('access denied for non-admin user', async ({ page }) => {
    await mockSupabaseAuth(page, { id: 'regular-user', email: 'player@example.com', is_admin: false });

    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
      const url = route.request().url();
      const accept = route.request().headers()['accept'] || '';
      const isSingle = accept.includes('vnd.pgrst.object') || url.includes('limit=1');

      const data = {
        id: 'regular-user',
        user_id: 'regular-user',
        first_name: 'Regular',
        last_name: 'Player',
        email: 'player@example.com',
        is_captain: false,
        is_admin: false,
        is_active: true,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? data : [data]),
      });
    });

    await page.goto('/admin/registration-management');

    await expect(page).toHaveURL('/');
  });
});

