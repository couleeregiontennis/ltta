import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Payment Management', () => {
  const adminUser = {
    id: 'admin-user-id',
    email: 'admin@example.com',
  };

  const mockSeasons = [
    { id: 'season-1', number: 1, start_date: '2026-01-01', end_date: '2026-03-31' },
    { id: 'season-2', number: 2, start_date: '2026-04-01', end_date: '2026-06-30' }
  ];

  const mockPlayers = [
    { id: 'player-1', first_name: 'John', last_name: 'Doe' },
    { id: 'player-2', first_name: 'Jane', last_name: 'Smith' }
  ];

  const mockTeams = [
    { id: 'team-1', name: 'Aces', number: 101 },
    { id: 'team-2', name: 'Backhands', number: 102 }
  ];

  const mockPayments = [
    {
      id: 'payment-1',
      season_id: 'season-2',
      player_id: 'player-1',
      team_id: null,
      amount_paid: 50.00,
      payment_method: 'zeffy',
      notes: 'Early bird',
      created_at: new Date().toISOString(),
      player: { first_name: 'John', last_name: 'Doe' },
      team: null
    }
  ];

  test.beforeEach(async ({ page }) => {
    // 1. Mock Auth
    await mockSupabaseAuth(page, adminUser);

    // 2. Mock Supabase REST calls
    await page.route('**/rest/v1/player*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'GET') {
        if (url.includes(`user_id=eq.${adminUser.id}`)) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              id: 'admin-p-id', 
              user_id: adminUser.id, 
              is_admin: true,
              is_captain: false,
              first_name: 'Admin',
              last_name: 'User'
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockPlayers),
          });
        }
      } else {
        await route.continue();
      }
    });

    await page.route('**/rest/v1/season*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSeasons),
      });
    });

    await page.route('**/rest/v1/team*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTeams),
      });
    });

    await page.route('**/rest/v1/season_payments*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockPayments),
        });
      } else if (method === 'POST') {
        const body = JSON.parse(route.request().postData());
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ...body, id: 'new-payment-id', created_at: new Date().toISOString() }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/payment-management');
  });

  test('should display payment list and summary', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Payment Management' })).toBeVisible();
    
    // Manually select a season to ensure fetch is triggered
    await page.locator('#season-select').selectOption({ label: 'Season 2 (2026)' });

    // Wait for the data to load in the table
    await expect(page.locator('.payment-table')).toContainText('John Doe');

    // Check summary
    await expect(page.locator('.summary-card .value').first()).toHaveText('$50.00');
    await expect(page.locator('.summary-card .value').last()).toHaveText('1');
  });

  test('should record a new payment', async ({ page }) => {
    await page.getByRole('button', { name: '+ Record Payment' }).click();
    await expect(page.getByRole('heading', { name: 'Record New Payment' })).toBeVisible();

    // Fill the form
    await page.getByLabel('Select Player').selectOption({ label: 'Smith, Jane' });
    await page.getByLabel('Amount ($)').fill('75.00');
    await page.getByLabel('Method').selectOption('cash');
    await page.getByLabel('Notes').fill('Paid at courts');

    // Record it - use exact: true or specific selector to avoid ambiguity
    await page.getByRole('button', { name: 'Record Payment', exact: true }).click();

    // Verify success
    await expect(page.getByText('Payment recorded successfully!')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Record New Payment' })).not.toBeVisible();
  });

  test('should switch between player and team payer types', async ({ page }) => {
    await page.getByRole('button', { name: '+ Record Payment' }).click();
    
    // Default is Player
    await expect(page.getByLabel('Select Player')).toBeVisible();
    
    // Switch to Team - Click the text label instead of the hidden input
    await page.getByText('Team', { exact: true }).click();
    
    await expect(page.getByLabel('Select Player')).not.toBeVisible();
    await expect(page.getByLabel('Select Team')).toBeVisible();
    
    await page.getByLabel('Select Team').selectOption({ label: 'Aces (#101)' });
  });
});
