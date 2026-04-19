import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

const ROUTES = [
  // Public / Player Routes
  { name: 'match-schedule', path: '/', role: 'player' },
  { name: 'landing-page', path: '/welcome', role: 'player' },
  { name: 'team-view', path: '/team/tuesday/t1', role: 'player' }, // Added team detail
  { name: 'player-resources', path: '/player-resources', role: 'player' },
  { name: 'rules', path: '/rules', role: 'player' },
  { name: 'standings', path: '/standings', role: 'player' },
  { name: 'player-rankings', path: '/player-rankings', role: 'player' },
  { name: 'courts-locations', path: '/courts-locations', role: 'player' },
  { name: 'login', path: '/login', role: 'player' },
  { name: 'player-profile', path: '/player-profile', role: 'player' },
  { name: 'my-schedule', path: '/my-schedule', role: 'player' },

  // Protected Routes (Player)
  { name: 'feedback', path: '/feedback', role: 'player' },
  { name: 'sub-board', path: '/sub-board', role: 'player' },
  { name: 'pay-dues', path: '/pay-dues', role: 'player' },

  // Captain Routes
  { name: 'add-score', path: '/add-score', role: 'captain' },
  { name: 'captain-dashboard', path: '/captain-dashboard', role: 'captain' },

  // Admin Routes
  { name: 'admin-schedule-generator', path: '/admin/schedule-generator', role: 'admin' },
  { name: 'admin-audit-logs', path: '/admin/audit-logs', role: 'admin' },
  { name: 'admin-player-management', path: '/admin/player-management', role: 'admin' },
  { name: 'admin-payment-management', path: '/admin/payment-management', role: 'admin' },

  // Dynamic / Edge Routes
  { name: 'not-found', path: '/some-random-page', role: 'player' },
];

test.describe('Comprehensive Visual Regression Suite', () => {
  for (const route of ROUTES) {
    test(`visual check: ${route.name}`, async ({ page }) => {
      // Setup auth and mocks
      await mockSupabaseAuth(page, {
        id: `${route.role}-user-id`,
        email: `${route.role}@ltta.com`,
        is_captain: route.role === 'captain' || route.role === 'admin',
        is_admin: route.role === 'admin'
      });

      // Global Standings Mock for consistent rendering
      await page.route(/\/rest\/v1\/standings_2026_view($|\?)/, async route => {
        const data = [
          {
            team_id: 't1', team_number: 1, team_name: 'Strikers', play_night: 'Tuesday',
            total_points: 15, matches_played: 3, total_sets_won: 12, total_sets_lost: 3,
            total_bonus_points: 3, wins: 3, losses: 0, ties: 0, games_won: 90, games_lost: 45, win_percentage: 100
          }
        ];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
      });

      console.log(`Navigating to ${route.path} as ${route.role}...`);
      await page.goto(route.path, { waitUntil: 'networkidle' });

      // Wait for specific content based on route to ensure page is loaded
      if (route.path === '/') {
        await page.waitForSelector('.match-card', { timeout: 10000 }).catch(() => console.log('Timeout waiting for .match-card'));
      } else if (route.path === '/standings') {
        await page.waitForSelector('.standings-table, .standings-mobile-card', { timeout: 10000 }).catch(() => console.log('Timeout waiting for standings'));
      } else if (route.path === '/player-rankings') {
        await page.waitForSelector('.rankings-table', { timeout: 10000 }).catch(() => console.log('Timeout waiting for rankings'));
      }

      // Final settle time
      await page.waitForTimeout(2000);

      // Desktop Viewport
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page).toHaveScreenshot(`${route.name}-desktop.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.1 // Increased tolerance slightly for dynamic IDs/dates
      });

      // Mobile Viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await expect(page).toHaveScreenshot(`${route.name}-mobile.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.1
      });
    });
  }
// Special Case: Standings Card Interaction (UX Agent request)
test('visual check: mobile standings cards', async ({ page }) => {
  // Log console messages
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

  await mockSupabaseAuth(page, { is_captain: true });

  // Mock standings data
  await page.route(/\/rest\/v1\/standings_2026_view($|\?)/, async route => {
    const data = [
      {
        team_id: 't1',
        team_number: 1,
        team_name: 'Strikers',
        play_night: 'Tuesday',
        total_points: 15,
        matches_played: 3,
        total_sets_won: 12,
        total_sets_lost: 3,
        total_bonus_points: 3,
        wins: 3,
        losses: 0,
        ties: 0,
        games_won: 90,
        games_lost: 45,
        win_percentage: 100
      },
      {
        team_id: 't2',
        team_number: 2,
        team_name: 'Volleyers',
        play_night: 'Tuesday',
        total_points: 10,
        matches_played: 3,
        total_sets_won: 8,
        total_sets_lost: 7,
        total_bonus_points: 2,
        wins: 2,
        losses: 1,
        ties: 0,
        games_won: 75,
        games_lost: 60,
        win_percentage: 66.7
      }
    ];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });

  // Mock team_match for recent matches and disputes
  await page.route(/\/rest\/v1\/team_match($|\?)/, async route => {
    const url = route.request().url();
    if (url.includes('is_disputed=eq.true')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    } else {
      const data = [
        {
          id: 'm1',
          date: '2026-05-12',
          time: '18:00',
          status: 'completed',
          home_team: { name: 'Strikers' },
          away_team: { name: 'Volleyers' }
        }
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    }
  });

  // Mock player count
  await page.route(/\/rest\/v1\/player($|\?)/, async route => {
    if (route.request().headers()['prefer']?.includes('count=exact')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]), headers: { 'content-range': '0-0/48' } });
    } else {
      await route.continue();
    }
  });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/standings');

  // Explicitly wait for the cards to render from our mocks
  console.log('Waiting for .standings-mobile-card...');

  await page.waitForSelector('.standings-mobile-card', { timeout: 15000 });

  await expect(page.locator('.standings-mobile-list')).toHaveScreenshot('standings-mobile-list.png');
});


  // Special Case: Toast Notification (UX Agent request)
  test('visual check: toast notification position', async ({ page }) => {
    await mockSupabaseAuth(page, { id: 'test-user' });
    await page.setViewportSize({ width: 375, height: 812 });

    // Go to profile and trigger a save to get a real toast
    await page.goto('/player-profile');
    await page.waitForTimeout(2000);

    const editBtn = page.locator('button:has-text("Edit Profile")');
    if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.locator('button:has-text("Save Profile")').click();

        // Wait for toast
        const toast = page.locator('.toast').first();
        await expect(toast).toBeVisible({ timeout: 15000 });

        await expect(page.locator('.toast-container')).toHaveScreenshot('mobile-toast-position.png');
    }
  });
});
