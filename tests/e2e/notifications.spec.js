import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

const makeNotification = (overrides = {}) => ({
  id: `n-${overrides.title || Math.random().toString(36).slice(2)}`,
  recipient_id: 'p1',
  type: 'sub_request',
  status: 'pending',
  is_read: false,
  title: 'New Sub Request',
  body: 'A captain is looking for a substitute.',
  metadata: {},
  created_at: new Date().toISOString(),
  ...overrides,
});

test.describe('Notifications', () => {
  test('shows notification bell with unread count badge', async ({ page }) => {
    const notifications = [
      makeNotification({ id: 'n1', title: 'New Sub Request', is_read: false }),
      makeNotification({ id: 'n2', title: 'Roster Invitation', is_read: true }),
    ];

    await mockSupabaseAuth(page, { id: 'test-user-id', email: 'test@example.com', notifications });
    await page.goto('/');

    const bell = page.getByTestId('notification-bell');
    await expect(bell).toBeVisible();

    const badge = page.getByTestId('notification-badge');
    await expect(badge).toHaveText('1');
  });

  test('opens dropdown and displays notification history', async ({ page }) => {
    const notifications = [
      makeNotification({ id: 'n1', title: 'Match Disputed', type: 'dispute' }),
      makeNotification({ id: 'n2', title: 'Roster Invitation', type: 'roster_invite', is_read: true }),
    ];

    await mockSupabaseAuth(page, { id: 'test-user-id', email: 'test@example.com', notifications });
    await page.goto('/');

    await page.getByTestId('notification-bell').click();

    const dropdown = page.getByTestId('notification-dropdown');
    await expect(dropdown).toBeVisible();

    const items = page.getByTestId('notification-item');
    await expect(items).toHaveCount(2);

    await expect(page.getByText('Match Disputed')).toBeVisible();
    await expect(page.getByText('Roster Invitation')).toBeVisible();
  });

  test('marks a notification as read when clicked', async ({ page }) => {
    const notifications = [
      makeNotification({ id: 'n1', title: 'New Sub Request' }),
    ];

    await mockSupabaseAuth(page, { id: 'test-user-id', email: 'test@example.com', notifications });
    await page.goto('/');

    await page.getByTestId('notification-bell').click();

    const item = page.locator('[data-testid="notification-item"]').first();
    await expect(item).toHaveClass(/notification-item-unread/);

    // Badge should show 1 unread before clicking
    await expect(page.getByTestId('notification-badge')).toHaveText('1');

    await item.click();

    // Item should now be styled as read and the badge should disappear
    await expect(item).toHaveClass(/notification-item-read/);
    await expect(page.getByTestId('notification-badge')).toBeHidden();
  });

  test('shows empty state when there are no notifications', async ({ page }) => {
    await mockSupabaseAuth(page, { id: 'test-user-id', email: 'test@example.com', notifications: [] });
    await page.goto('/');

    await page.getByTestId('notification-bell').click();

    await expect(page.getByTestId('notification-empty')).toBeVisible();
    await expect(page.getByText('No notifications')).toBeVisible();
  });
});
