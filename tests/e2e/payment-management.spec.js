import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Payment Management', () => {
  const normalUser = {
    id: 'user-123',
    email: 'user@example.com',
  };

  const mockSeason = { id: 'season-1', number: 1, start_date: '2026-01-01', end_date: '2026-03-31' };

  const mockPlayer = { id: 'player-1', user_id: 'user-123', first_name: 'John', last_name: 'Doe' };

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    await mockSupabaseAuth(page, normalUser);

    await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPlayer),
      });
    });

    await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSeason),
      });
    });
  });

  test('should display unpaid status and checkout button', async ({ page }) => {
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'pending' }),
      });
    });

    await page.goto('/pay-dues');
    await expect(page.getByRole('heading', { name: 'Pay Season Dues' })).toBeVisible();
    await expect(page.getByText('$25.00', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay Roster Dues' })).toBeVisible();
  });

  test('should display paid status', async ({ page }) => {
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'completed' }),
      });
    });

    await page.goto('/pay-dues');
    await expect(page.getByRole('heading', { name: 'Payment Complete' })).toBeVisible();
    await expect(page.getByText('Thank you! Your dues')).toBeVisible();
  });

  test('should initiate checkout session via edge function', async ({ page }) => {
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'pending' }),
          });
      } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });

    await page.route('**/functions/v1/stripe-checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/mock-session' }),
      });
    });

    await page.goto('/pay-dues');
    
    // Intercept navigation
    await page.route('https://checkout.stripe.com/mock-session', async (route) => {
      await route.fulfill({ status: 200, body: 'Mock Stripe Checkout Page' });
    });

    await page.getByRole('button', { name: 'Pay Roster Dues' }).click();
    
    // We expect the page to redirect, so we just wait for the button to change state or URL to change
    await expect(page.getByRole('button', { name: 'Preparing Checkout...' })).toBeVisible();
  });

  test('should confirm payment when registration completed after redirect', async ({ page }) => {
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'completed' }),
      });
    });

    await page.goto('/pay-dues?success=true');
    await expect(page.getByRole('heading', { name: 'Payment Complete' })).toBeVisible();
  });

  test('should never claim payment complete when webhook has not confirmed', async ({ page }) => {
    // Registration stays pending forever (webhook never confirms).
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'pending' }),
      });
    });

    await page.goto('/pay-dues?success=true');

    // After the poll budget is exhausted the UI must show a processing state,
    // NOT the paid screen, even though ?success=true is in the URL.
    await expect(page.getByRole('heading', { name: 'Processing Payment' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Payment Complete' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Check status again' })).toBeVisible();
  });

  test('should re-check status when clicking Check status again', async ({ page }) => {
    let registrationStatus = 'pending';
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: registrationStatus }),
      });
    });

    await page.goto('/pay-dues?success=true');
    await expect(page.getByRole('heading', { name: 'Processing Payment' })).toBeVisible({ timeout: 20000 });

    // Webhook confirms late; the manual re-check should pick it up.
    registrationStatus = 'completed';
    await page.getByRole('button', { name: 'Check status again' }).click();
    await expect(page.getByRole('heading', { name: 'Payment Complete' })).toBeVisible();
  });

  test('should show canceled message when checkout was canceled', async ({ page }) => {
    await page.route(/\/rest\/v1\/registrations($|\?)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'pending' }),
      });
    });

    await page.goto('/pay-dues?canceled=true');
    await expect(page.getByText('Payment was canceled. You can try again below.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay Roster Dues' })).toBeVisible();
  });
});
