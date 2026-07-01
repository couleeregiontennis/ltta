import { test, expect } from '@playwright/test';

test.describe('Automated Notifications', () => {

  test('Notification tray is not visible for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.notification-tray')).not.toBeVisible();
  });

});
