import { test, expect } from '@playwright/test';
<<<<<<< HEAD
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Player Management', () => {
  const adminUser = {
    id: 'admin-user-id',
    email: 'admin@example.com',
  };

  const players = [
    {
      id: 'player-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      ranking: 3,
      is_captain: false,
      is_active: true,
      day_availability: { monday: true },
    },
    {
      id: 'player-2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      ranking: 4,
      is_captain: true,
      is_active: true,
      day_availability: { tuesday: true },
    },
  ];

  let mockPayments = [
    {
      id: 'payment-1',
      player_id: 'player-2',
      season_id: 'season-1',
      zeffy_payment_id: 'zeffy-1',
      amount: 50.00,
      payer_email: 'jane@example.com'
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Enable browser console logging in terminal output for debugging
    page.on('console', msg => {
      console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.error(`BROWSER EXCEPTION: ${err.message}\nStack: ${err.stack}`);
    });

    // Reset payments state per test
    mockPayments = [
      {
        id: 'payment-1',
        player_id: 'player-2',
        season_id: 'season-1',
        zeffy_payment_id: 'zeffy-1',
        amount: 50.00,
        payer_email: 'jane@example.com'
      }
    ];

    // 1. Mock Auth
    await mockSupabaseAuth(page, adminUser);

    // 2. Mock 'season' table requests (returning single object for .single() queries)
    await page.route('**/rest/v1/season*', async (route) => {
      const method = route.request().method();
      console.log(`Mocking season request: ${method} ${route.request().url()}`);
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'season-1', number: 1, start_date: '2026-01-01', end_date: '2026-12-31' }),
        });
        return;
      }
      await route.continue();
    });

    // 3. Mock 'player_payment' table requests
    await page.route('**/rest/v1/player_payment*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      console.log(`Mocking player_payment request: ${method} ${url}`);

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockPayments),
        });
        return;
      }

      if (method === 'POST') {
        const body = JSON.parse(route.request().postData());
        console.log('Mock received player_payment INSERT:', body);
        const newPayment = { id: `mock-manual-${Date.now()}`, ...body };
        mockPayments.push(newPayment);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newPayment),
        });
        return;
      }

      if (method === 'DELETE') {
        const match = url.match(/player_id=eq\.([^&]+)/);
        const playerId = match ? match[1] : null;
        console.log('Mock received player_payment DELETE for playerId:', playerId);
        if (playerId) {
          mockPayments = mockPayments.filter(p => p.player_id !== playerId);
        }
        await route.fulfill({
          status: 204,
          body: '',
        });
        return;
      }

      await route.continue();
    });

    // 4. Mock 'player' table requests (use regex to avoid intercepting player_payment)
    await page.route(/\/rest\/v1\/player(\?|$)/, async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      console.log(`Mocking player request: ${method} ${url}`);

      // Check if it's a request for the current user's profile (role check)
      if (method === 'GET' && url.includes(`user_id=eq.${adminUser.id}`)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: adminUser.id,
            user_id: adminUser.id,
            is_captain: true,
            is_admin: true,
            first_name: 'Admin'
          }),
        });
        return;
      }

      // Check if it's the request for all players
      if (method === 'GET' && !url.includes('user_id=eq.')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(players),
        });
        return;
      }

      // Check for Update (PATCH)
      if (method === 'PATCH') {
        const body = JSON.parse(route.request().postData());
        console.log('Mock received player PATCH:', body);
        const match = url.match(/id=eq\.([^&]+)/);
        const id = match ? match[1] : null;

        if (id) {
          const idx = players.findIndex(p => p.id === id);
          if (idx !== -1) {
            players[idx] = { ...players[idx], ...body };
          }
          const original = players.find(p => p.id === id) || {};
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ...original, ...body }),
          });
          return;
        }
      }

      await route.continue();
    });

    await page.goto('/admin/player-management');
  });

  test('should display list of players with payment status', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Player Management' })).toBeVisible();
    await expect(page.getByText('Doe, John')).toBeVisible();
    await expect(page.getByText('Smith, Jane')).toBeVisible();

    const rows = page.locator('table.player-table tbody tr');
    
    // First row John Doe: should show ❌ for payment in column 6 (0-indexed)
    const johnRow = rows.first();
    await expect(johnRow.locator('td').nth(6)).toHaveText('❌');

    // Second row Jane Smith: should show ✅ for payment in column 6 (0-indexed)
    const janeRow = rows.nth(1);
    await expect(janeRow.locator('td').nth(6)).toHaveText('✅');
  });

  test('should edit a player and toggle payment status', async ({ page }) => {
    const johnRow = page.locator('table.player-table tbody tr').first();
    
    // Click edit on the first player (John Doe)
    await johnRow.locator('button.edit-btn').click();

    await expect(page.getByRole('heading', { name: 'Edit Player: John Doe' })).toBeVisible();

    // Change first name
    await page.getByLabel('First Name').fill('Johnny');

    // Verify paid checkbox is not checked
    const paidCheckbox = page.locator('input#edit-is-paid');
    await expect(paidCheckbox).not.toBeChecked();

    // Click label to check/uncheck (since input has opacity 0 / display none traits)
    await page.locator('label[for="edit-is-paid"]').click();

    // Save
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify success
    await expect(page.getByText('Player updated successfully!')).toBeVisible();

    // Verify list is updated (UI updates first name to Johnny, and Paid status to check)
    await expect(page.getByText('Doe, Johnny')).toBeVisible();
    await expect(johnRow.locator('td').nth(6)).toHaveText('✅');
  });

  test('should filter players', async ({ page }) => {
    await page.getByPlaceholder('Search by name or email...').fill('Jane');
    await expect(page.getByText('Smith, Jane')).toBeVisible();
    await expect(page.getByText('Doe, John')).not.toBeVisible();
  });
});
