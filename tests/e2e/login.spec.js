import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
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
    await mockSupabaseAuth(page, { id: 'test-id', email: 'test@example.com' });
    
    await page.route('**/rest/v1/player?*', r => r.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([{ id: 'p1', first_name: 'Test', last_name: 'User' }]) 
    }));

    await page.goto('/login');
    
    // Wait for the UI to be ready
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
    await expect(page.locator('input#email')).toBeVisible({ timeout: 10000 });
    
    await page.locator('input#email').fill('test@example.com');
    await page.locator('input#password').fill('Password123!');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/', { timeout: 15000 });
  });
});
