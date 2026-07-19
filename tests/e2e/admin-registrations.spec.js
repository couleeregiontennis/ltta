import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock.js';

test.describe('Admin Registration Dashboard', () => {
  const adminUser = {
    id: 'admin-user-id',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
  };

  const seasons = [
    { id: 'season-1', number: 1, start_date: '2026-01-01', end_date: '2026-03-31' },
    { id: 'season-2', number: 2, start_date: '2025-01-01', end_date: '2025-03-31' },
  ];

  const players = [
    { id: 'player-1', user_id: 'user-1', first_name: 'Alice', last_name: 'Anderson', email: 'alice@example.com' },
    { id: 'player-2', user_id: 'user-2', first_name: 'Bob', last_name: 'Brown', email: 'bob@example.com' },
    { id: 'player-3', user_id: 'user-3', first_name: 'Carol', last_name: 'Clark', email: 'carol@example.com' },
  ];

  // Registrations are scoped to a season; payments carry the financial status.
  const registrations = {
    'season-1': [
      {
        id: 'reg-1',
        player_id: 'player-1',
        season_id: 'season-1',
        status: 'completed',
        created_at: '2026-01-15T10:00:00Z',
        player: players[0],
        payments: [{ id: 'pay-1', registration_id: 'reg-1', status: 'paid', amount_cents: 3000 }],
      },
      {
        id: 'reg-2',
        player_id: 'player-2',
        season_id: 'season-1',
        status: 'pending',
        created_at: '2026-01-16T11:30:00Z',
        player: players[1],
        payments: [{ id: 'pay-2', registration_id: 'reg-2', status: 'pending', amount_cents: 3000 }],
      },
      {
        id: 'reg-3',
        player_id: 'player-3',
        season_id: 'season-1',
        status: 'pending',
        created_at: '2026-01-17T09:15:00Z',
        player: players[2],
        payments: [{ id: 'pay-3', registration_id: 'reg-3', status: 'failed', amount_cents: 3000 }],
      },
    ],
    'season-2': [
      {
        id: 'reg-4',
        player_id: 'player-1',
        season_id: 'season-2',
        status: 'completed',
        created_at: '2025-01-10T08:00:00Z',
        player: players[0],
        payments: [{ id: 'pay-4', registration_id: 'reg-4', status: 'paid', amount_cents: 2500 }],
      },
    ],
  };

  /**
   * Wire up mocks for an authenticated user. Specific route overrides must be
   * added after this helper because Playwright matches routes in reverse order.
   */
  async function setupAuth(page, { isAdmin = true } = {}) {
    page.on('console', msg => console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`BROWSER EXCEPTION: ${err.message}\nStack: ${err.stack}`));

    await mockSupabaseAuth(page, {
      id: isAdmin ? adminUser.id : 'regular-user-id',
      email: isAdmin ? adminUser.email : 'regular@example.com',
      is_admin: isAdmin,
      is_captain: false,
    });

    // Role check for the current user
    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
      const url = route.request().url();
      const accept = route.request().headers()['accept'] || '';
      const isSingle = accept.includes('vnd.pgrst.object') || url.includes('limit=1') || url.includes('user_id=eq.');

      const currentPlayer = {
        id: isAdmin ? 'admin-player-id' : 'regular-player-id',
        user_id: isAdmin ? adminUser.id : 'regular-user-id',
        first_name: isAdmin ? adminUser.first_name : 'Regular',
        last_name: isAdmin ? adminUser.last_name : 'User',
        email: isAdmin ? adminUser.email : 'regular@example.com',
        is_admin: isAdmin,
        is_captain: false,
        is_active: true,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? currentPlayer : [currentPlayer]),
      });
    });

    // All seasons for the selector
    await page.route('**/rest/v1/season*', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(seasons),
      });
    });
  }

  /**
   * Mock the registrations endpoint. The implementation is expected to query
   * registrations with embedded player and payment data for the selected season.
   */
  async function mockRegistrations(page, seasonId) {
    const data = registrations[seasonId] || [];
    await page.route('**/rest/v1/registrations*', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
  }

  test('Admin can view all registrations for a season with player details', async ({ page }) => {
    await setupAuth(page);
    await mockRegistrations(page, 'season-1');

    await page.goto('/admin/registrations');

    await expect(page.getByRole('heading', { name: /Registration Dashboard/i })).toBeVisible();
    await expect(page.locator('table.registrations-table')).toBeVisible();

    // Player details should be rendered from the embedded player object.
    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'alice@example.com' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Carol Clark' })).toBeVisible();

    // All season-1 rows should be present.
    const rows = page.locator('table.registrations-table tbody tr');
    await expect(rows).toHaveCount(3);
  });

  test('Registrations show correct payment status (pending/paid/failed)', async ({ page }) => {
    await setupAuth(page);
    await mockRegistrations(page, 'season-1');

    await page.goto('/admin/registrations');

    const rows = page.locator('table.registrations-table tbody tr');

    // Alice paid
    const aliceRow = rows.filter({ hasText: 'Alice Anderson' });
    await expect(aliceRow).toContainText('paid');

    // Bob pending
    const bobRow = rows.filter({ hasText: 'Bob Brown' });
    await expect(bobRow).toContainText('pending');

    // Carol failed
    const carolRow = rows.filter({ hasText: 'Carol Clark' });
    await expect(carolRow).toContainText('failed');
  });

  test('Filter by season works correctly', async ({ page }) => {
    await setupAuth(page);

    // Support fetching registrations for any season.
    await page.route('**/rest/v1/registrations*', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      const url = route.request().url();
      const match = url.match(/season_id=eq\.([^&]+)/);
      const seasonId = match ? match[1] : 'season-1';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(registrations[seasonId] || []),
      });
    });

    await page.goto('/admin/registrations');
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(3);

    // Default season selector should be present and changeable.
    await page.getByLabel('Season').selectOption('season-2');

    // After selecting season 2, only Alice's historical registration is shown.
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).not.toBeVisible();
  });

  test('Filter by payment status works correctly', async ({ page }) => {
    await setupAuth(page);
    await mockRegistrations(page, 'season-1');

    await page.goto('/admin/registrations');

    // All rows initially.
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(3);

    // Filter to paid only.
    await page.getByLabel('Payment Status').selectOption('paid');
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).not.toBeVisible();

    // Filter to pending only.
    await page.getByLabel('Payment Status').selectOption('pending');
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).toBeVisible();

    // Filter to failed only.
    await page.getByLabel('Payment Status').selectOption('failed');
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Carol Clark' })).toBeVisible();
  });


  test('Registration stats summary shows correct counts (total, paid, pending)', async ({ page }) => {
    await setupAuth(page);
    await mockRegistrations(page, 'season-1');

    await page.goto('/admin/registrations');

    // The dashboard should expose summary cards with these labels/values.
    await expect(page.getByTestId('stat-total-registrations')).toContainText('3');
    await expect(page.getByTestId('stat-paid')).toContainText('1');
    await expect(page.getByTestId('stat-pending')).toContainText('1');
    await expect(page.getByTestId('stat-failed')).toContainText('1');
  });

  test('Non-admin users cannot access the page (403/redirect)', async ({ page }) => {
    await setupAuth(page, { isAdmin: false });
    await page.goto('/admin/registrations');

    // Should be redirected away from the admin route.
    await expect(page).toHaveURL('/');

    // The dashboard heading and table should not be present.
    await expect(page.getByRole('heading', { name: /Registration Dashboard/i })).not.toBeVisible();
    await expect(page.locator('table.registrations-table')).not.toBeVisible();
  });

  test('Empty state when no registrations exist', async ({ page }) => {
    await setupAuth(page);

    await page.route('**/rest/v1/registrations*', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/admin/registrations');

    await expect(page.getByText(/No registrations found/i)).toBeVisible();
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(0);
  });

  test('Sortable columns work (by name, date, status)', async ({ page }) => {
    await setupAuth(page);
    await mockRegistrations(page, 'season-1');

    await page.goto('/admin/registrations');

    const rows = page.locator('table.registrations-table tbody tr');
    await expect(rows).toHaveCount(3);

    // Default order is created_at desc: Carol (Jan 17), Bob (Jan 16), Alice (Jan 15).
    await expect(rows.nth(0)).toContainText('Carol Clark');
    await expect(rows.nth(1)).toContainText('Bob Brown');
    await expect(rows.nth(2)).toContainText('Alice Anderson');

    // Sort by player name ascending.
    await page.getByRole('columnheader', { name: /Player/i }).click();
    await expect(rows.nth(0)).toContainText('Alice Anderson');
    await expect(rows.nth(1)).toContainText('Bob Brown');
    await expect(rows.nth(2)).toContainText('Carol Clark');

    // Sort by payment status ascending (alphabetical: failed, paid, pending).
    await page.getByRole('columnheader', { name: /Payment Status/i }).click();
    await expect(rows.nth(0)).toContainText('Carol Clark'); // failed
    await expect(rows.nth(1)).toContainText('Alice Anderson'); // paid
    await expect(rows.nth(2)).toContainText('Bob Brown'); // pending

    // Sort by date ascending.
    await page.getByRole('columnheader', { name: /Date/i }).click();
    await expect(rows.nth(0)).toContainText('Alice Anderson'); // Jan 15
    await expect(rows.nth(1)).toContainText('Bob Brown'); // Jan 16
    await expect(rows.nth(2)).toContainText('Carol Clark'); // Jan 17
  });

  test('RLS properly scopes data', async ({ page }) => {
    await setupAuth(page);

    // Simulate a strict RLS view: only the current admin's own registration is returned.
    await page.route('**/rest/v1/registrations*', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([registrations['season-1'][0]]),
      });
    });

    await page.goto('/admin/registrations');

    // The dashboard must render only the scoped data; it must not fabricate or
    // leak rows that the API did not return.
    await expect(page.locator('table.registrations-table tbody tr')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Alice Anderson' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob Brown' })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Carol Clark' })).not.toBeVisible();

    // Stats must reflect the scoped result set.
    await expect(page.getByTestId('stat-total-registrations')).toContainText('1');
    await expect(page.getByTestId('stat-paid')).toContainText('1');
    await expect(page.getByTestId('stat-pending')).toContainText('0');
    await expect(page.getByTestId('stat-failed')).toContainText('0');
  });
});

