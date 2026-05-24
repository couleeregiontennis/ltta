import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Login Page @live', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    // Generic wait for any loading indicator to clear
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    await page.getByLabel(/show password/i).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should successfully sign up (Mocked)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    await page.locator('button:has-text("Create an account")').click();

    await page.locator('input#email').fill('newuser@example.com');
    await page.locator('input#password').fill('Password123!');

    await page.route('**/auth/v1/signup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'new-id', email: 'newuser@example.com' }, session: null }),
      });
    });

    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('should successfully login (Mocked)', async ({ page }) => {
    await mockSupabaseAuth(page, { id: 'test-id', email: 'test@example.com', autoLogin: false });

    await page.goto('/login');
    
    // Wait for the UI to be ready
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    await expect(page.locator('input#email')).toBeVisible({ timeout: 10000 });
    
    await page.locator('input#email').fill('test@example.com');
    await page.locator('input#password').fill('Password123!');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/', { timeout: 15000 });
  });

  test('should fetch season ordered by end_date and limit 1 (no is_active filter)', async ({ page }) => {
    // Forward browser console logs to terminal
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    // 1. Log in the user via mocks
    await mockSupabaseAuth(page, { id: 'test-id', email: 'test@example.com' });

    // Intercept season fetch using regex
    await page.route(/\/rest\/v1\/season/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 's1', number: 1, end_date: '2026-12-31' }])
      });
    });

    await page.route(/\/rest\/v1\/player/, r => r.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([{ id: 'p1', first_name: 'Test', last_name: 'User' }]) 
    }));

    // Start waiting for the season fetch request in parallel *before* loading the page
    const seasonRequestPromise = page.waitForRequest(/\/rest\/v1\/season/, { timeout: 15000 });

    await page.goto('/');
    
    // Wait for the UI to be ready
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

    // Wait for the request promise to resolve
    const seasonRequest = await seasonRequestPromise;
    const seasonRequestUrl = seasonRequest.url();

    // Assert that the season request URL was captured and does NOT contain 'is_active'
    expect(seasonRequestUrl).not.toBeNull();
    const urlObj = new URL(seasonRequestUrl);
    
    // Should NOT contain the old nonexistent is_active column query
    expect(urlObj.search).not.toContain('is_active');
    
    // Should contain order and limit parameters
    expect(urlObj.search).toContain('order=end_date.desc');
    expect(urlObj.search).toContain('limit=1');
  });

  test('should redirect to login page even if signOut network request fails', async ({ page }) => {
    // 1. Log in the user via mocks
    await mockSupabaseAuth(page, { id: 'test-id', email: 'test@example.com' });
    
    await page.route(/\/rest\/v1\/player/, r => r.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([{ id: 'p1', first_name: 'Test', last_name: 'User' }]) 
    }));

    // Mock season query
    await page.route(/\/rest\/v1\/season/, r => r.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([{ id: 's1', number: 1, end_date: '2026-12-31' }]) 
    }));

    // Mock logout network request to fail with a 500 Server Error
    await page.route(/\/auth\/v1\/logout/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');
    
    // Wait for the UI to be ready
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

    // Open mobile menu if on mobile viewport
    const toggleButton = page.getByRole('button', { name: /Toggle navigation/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }

    // Click the logout button in the navigation
    const logoutBtn = page.locator('.navbar-logout-btn');
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    // Verify it successfully redirects back to /login page even after the 500 failure
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('input#email')).toBeVisible();
  });
});
