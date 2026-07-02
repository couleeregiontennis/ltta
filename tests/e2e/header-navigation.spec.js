import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

// =============================================================================
// Reorganized Header Navigation - Regression Test Suite
// =============================================================================
//
// Covers the navigation refactor that introduced:
//   1. New "Pay Registration Online" button (opens ZeffyModal)
//   2. New "Donate" button (Zeffy donation form link)
//   3. Conditional rendering of Sub-Board (logged-in only)
//   4. Conditional rendering of Pay Dues / Feedback (logged-in only)
//   5. Role-based dropdowns (League, My Hub, Resources, Admin)
//   6. Mobile hamburger menu opens/closes
//   7. Theme toggle coexistence with hamburger on mobile
//
// Roles tested: visitor, player, captain, admin
// Viewports:    desktop, mobile (Pixel 5)
// =============================================================================

// All in-app link targets declared in Navigation.jsx (excluding external CRTA link)
const TARGETS_FOR_ROLE = {
  visitor: ['/schedule', '/standings', '/player-rankings', '/rules', '/courts-locations', '/player-resources', '/login'],
  player: [
    '/schedule', '/standings', '/player-rankings', '/sub-board', '/rules',
    '/courts-locations', '/player-resources', '/pay-dues', '/feedback',
    '/player-profile', '/my-schedule',
  ],
  captain: [
    '/schedule', '/standings', '/player-rankings', '/sub-board', '/rules',
    '/courts-locations', '/player-resources', '/pay-dues', '/feedback',
    '/player-profile', '/my-schedule', '/captain-dashboard', '/add-score',
  ],
  admin: [
    '/schedule', '/standings', '/player-rankings', '/sub-board', '/rules',
    '/courts-locations', '/player-resources', '/pay-dues', '/feedback',
    '/player-profile', '/my-schedule', '/captain-dashboard', '/add-score',
    '/admin/schedule-generator', '/admin/audit-logs', '/admin/player-management',
    '/admin/payment-management', '/admin/team-management',
  ],
};

const mockRole = async (page, role) => {
  if (role === 'visitor') return;
  const config = {
    player: { id: 'player-id', email: 'player@test.com', is_captain: false, is_admin: false },
    captain: { id: 'captain-id', email: 'captain@test.com', is_captain: true, is_admin: false },
    admin: { id: 'admin-id', email: 'admin@test.com', is_captain: false, is_admin: true },
  }[role];
  if (!config) throw new Error(`Unknown role: ${role}`);
  await mockSupabaseAuth(page, config);
};

async function openLeagueDropdownDesktop(page) {
  await page.getByRole('button', { name: /^League/ }).first().click();
  await page.locator('.dropdown-menu.show').first().waitFor({ state: 'visible' });
}

test.describe('Reorganized Header Navigation - Role Visibility (Desktop)', () => {
  test.describe.configure({ mode: 'parallel' });

  test.skip(({ isMobile }) => isMobile, 'Desktop only');

  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  test('Visitor sees only public navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');

    for (const label of ['Schedule']) {
      await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
    }
    // League and Resources are dropdown buttons
    for (const label of ['League', 'Resources']) {
      await expect(page.getByRole('button', { name: new RegExp(`^${label}`) }).first()).toBeVisible();
    }
    // New Zeffy CTAs are always visible
    await expect(page.getByRole('button', { name: 'Pay Registration Online' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Donate/ })).toBeVisible();

    // Logged-in-only items must NOT appear
    await expect(page.getByRole('link', { name: 'My Hub', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Sub Board', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Pay Dues', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Feedback', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Admin/ })).toHaveCount(0);

    // Login link must be present (not Logout)
    await expect(page.getByRole('link', { name: /Login/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
  });

  test('Player sees public + My Hub, no Admin', async ({ page }) => {
    await mockRole(page, 'player');
    await page.goto('/');
    await page.waitForSelector('.navbar');

    await expect(page.getByRole('button', { name: /^My Hub/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Admin/ })).toHaveCount(0);

    // Logout present, no Login
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Login/ })).toHaveCount(0);

    // Sub-Board should be in the League dropdown (logged-in only)
    await openLeagueDropdownDesktop(page);
    await expect(page.getByRole('link', { name: 'Sub Board', exact: true })).toBeVisible();
  });

  test('Captain sees My Hub with Captain Dashboard, no Admin', async ({ page }) => {
    await mockRole(page, 'captain');
    await page.goto('/');
    await page.waitForSelector('.navbar');

    await expect(page.getByRole('button', { name: /^My Hub/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Admin/ })).toHaveCount(0);

    // Open My Hub to confirm captain-specific items
    await page.getByRole('button', { name: /^My Hub/ }).first().click();
    await page.locator('.dropdown-menu.show').first().waitFor({ state: 'visible' });
    await expect(page.getByRole('link', { name: 'Captain Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Submit Scores' })).toBeVisible();
    // Admin links should never be in My Hub
    await expect(page.getByRole('link', { name: 'Schedule Generator' })).toHaveCount(0);
  });

  test('Admin sees the Admin dropdown with all admin entries', async ({ page }) => {
    await mockRole(page, 'admin');
    await page.goto('/');
    await page.waitForSelector('.navbar');

    await expect(page.getByRole('button', { name: /^Admin/ })).toBeVisible();

    // Open Admin dropdown
    await page.getByRole('button', { name: /^Admin/ }).first().click();
    await page.locator('.dropdown-menu.show').first().waitFor({ state: 'visible' });

    const adminLinks = [
      'Schedule Generator',
      'Audit Logs',
      'Player Management',
      'Payment Management',
      'Team Management',
    ];
    for (const label of adminLinks) {
      await expect(page.getByRole('link', { name: label })).toBeVisible();
    }
  });
});


test.describe('Reorganized Header Navigation - Mobile Menu', () => {
  test.describe.configure({ mode: 'parallel' });

  test.skip(({ isMobile }) => !isMobile, 'Mobile only');

  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  test('Mobile hamburger toggles the menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');

    const toggle = page.getByRole('button', { name: /Toggle navigation/i });
    const menu = page.locator('.navbar-menu');

    await expect(menu).not.toHaveClass(/active/);
    await toggle.click();
    await expect(menu).toHaveClass(/active/);

    // Close it again
    await toggle.click();
    await expect(menu).not.toHaveClass(/active/);
  });

  test('Clicking a link inside the mobile menu closes it', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');

    const toggle = page.getByRole('button', { name: /Toggle navigation/i });
    const menu = page.locator('.navbar-menu');

    await toggle.click();
    await expect(menu).toHaveClass(/active/);

    // Click "Schedule" - should close menu (closeMenu handler)
    await page.getByRole('link', { name: 'Schedule' }).click();
    await expect(menu).not.toHaveClass(/active/);
  });

  test('Theme toggle remains accessible alongside hamburger on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');

    const themeToggle = page.getByRole('button', { name: /Toggle color theme/i });
    const hamburger = page.getByRole('button', { name: /Toggle navigation/i });

    // Both must be visible at the same time (regression: 0634a19 fixed overlap)
    await expect(themeToggle).toBeVisible();
    await expect(hamburger).toBeVisible();

    // Their bounding boxes must not overlap significantly
    const tBox = await themeToggle.boundingBox();
    const hBox = await hamburger.boundingBox();
    expect(tBox).not.toBeNull();
    expect(hBox).not.toBeNull();
    const horizontalGap = hBox.x - (tBox.x + tBox.width);
    expect(horizontalGap).toBeGreaterThanOrEqual(-1);
  });

  test('Mobile menu shows all role-appropriate links (admin)', async ({ page }) => {
    await mockRole(page, 'admin');
    await page.goto('/');
    await page.waitForSelector('.navbar');

    await page.getByRole('button', { name: /Toggle navigation/i }).click();
    await page.locator('.navbar-menu.active').waitFor({ state: 'visible' });

    // Admin should see: League, My Hub, Resources, Admin, Pay Reg, Donate
    for (const label of ['League', 'My Hub', 'Resources', 'Admin']) {
      await expect(
        page.locator('.navbar-menu.active').getByRole('button', { name: new RegExp(`^${label}`) })
      ).toBeVisible();
    }
    await expect(
      page.locator('.navbar-menu.active').getByRole('button', { name: 'Pay Registration Online' })
    ).toBeVisible();
  });
});


test.describe('Reorganized Header Navigation - Target Pages Load', () => {
  test.describe.configure({ mode: 'parallel' });

  // Admin has 19 targets - default 30s budget is too tight when running
  // in parallel with other tests. Give the suite a bit more headroom.
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  for (const role of Object.keys(TARGETS_FOR_ROLE)) {
    test(`${role}: every navigation target loads (no 404/500)`, async ({ page }) => {
      await mockRole(page, role);
      // Track 4xx/5xx responses
      const failures = [];
      page.on('response', (resp) => {
        const status = resp.status();
        const url = resp.url();
        // Only consider app page navigations
        if (status >= 400 && !url.includes('supabase.co') && !url.includes('localhost:54321')) {
          failures.push(`${status} ${url}`);
        }
      });

      for (const target of TARGETS_FOR_ROLE[role]) {
        // 15s per-target budget. Some admin pages make many parallel queries.
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15000 });
        // Either the page renders or we are redirected (auth required pages
        // for visitor will redirect to /login). Either way: not a 404/500.
        const url = page.url();
        expect(url, `URL after navigating to ${target}`).not.toContain('undefined');
        // No "404" or "Server Error" headings
        const bodyText = await page.locator('body').innerText();
        expect(bodyText, `404 heading on ${target}`).not.toMatch(/^404\s+This page could not be found/i);
        expect(bodyText, `Server error on ${target}`).not.toMatch(/^500\s+Server Error/i);
      }

      expect(failures, `4xx/5xx responses for ${role}`).toEqual([]);
    });
  }
});

test.describe('Reorganized Header Navigation - Zeffy Buttons', () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  test('"Pay Registration Online" opens the ZeffyModal with Zeffy explanation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');
    await page.getByRole('button', { name: 'Pay Registration Online' }).click();

    // Modal should be visible with explanatory content
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Zeffy/i);
    // The modal has a "Continue to Registration" CTA
    await expect(dialog.getByRole('button', { name: /Continue to Registration/i })).toBeVisible();
    // And a Close button
    await expect(dialog.getByRole('button', { name: /Close modal/i })).toBeVisible();

    // Close via X button
    await dialog.getByRole('button', { name: /Close modal/i }).click();
    await expect(dialog).toBeHidden();
  });

  test('"Donate" button has the correct Zeffy donation form link', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');
    const donate = page.locator('button[zeffy-form-link]').first();
    await expect(donate).toBeVisible();
    const link = await donate.getAttribute('zeffy-form-link');
    expect(link).toContain('zeffy.com');
    expect(link).toContain('donate');
  });
});

test.describe('Reorganized Header Navigation - Dropdown Behaviour (Desktop)', () => {
  test.describe.configure({ mode: 'parallel' });

  test.skip(({ isMobile }) => isMobile, 'Desktop only');

  test.beforeEach(async ({ page }) => {
    await disableNavigatorLocks(page);
  });

  test('Clicking outside closes any open dropdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');

    await openLeagueDropdownDesktop(page);
    await expect(page.locator('.dropdown-menu.show').first()).toBeVisible();

    // Click outside the nav
    await page.locator('main').click({ position: { x: 5, y: 200 } });
    await page.waitForTimeout(200);
    await expect(page.locator('.dropdown-menu.show')).toHaveCount(0);
  });

  test('Opening a different dropdown closes the previous one', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');

    await openLeagueDropdownDesktop(page);
    await expect(page.locator('.dropdown-menu.show').first()).toBeVisible();

    // Now open Resources
    await page.getByRole('button', { name: /^Resources/ }).first().click();
    // The League dropdown should no longer be marked .show
    const leagueDropdown = page
      .locator('li.dropdown')
      .filter({ has: page.getByRole('button', { name: /^League/ }) })
      .locator('.dropdown-menu');
    await expect(leagueDropdown).not.toHaveClass(/show/);
  });

  test('External CRTA Website link opens in a new tab (target=_blank)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.navbar');
    await openLeagueDropdownDesktop(page);

    const crta = page.getByRole('link', { name: 'CRTA Website' });
    await expect(crta).toHaveAttribute('target', '_blank');
    await expect(crta).toHaveAttribute('rel', /noopener/);
  });
});






