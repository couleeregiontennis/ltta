// scripts/capture-nav-screenshots.js
//
// Captures before/after screenshots of the reorganized header navigation
// for desktop and mobile viewports across the key user roles
// (visitor, player, captain, admin).
//
// Usage:
//   node scripts/capture-nav-screenshots.js before    # checks out commit 2f1d10e (pre-zeffy)
//   node scripts/capture-nav-screenshots.js after     # current working tree
//
// Output:
//   verification/navigation/<phase>-<role>-<viewport>.png
//   verification/navigation/<phase>-<role>-mobile-menu-open.png
//   verification/navigation/<phase>-<role>-desktop-dropdown-open.png

import { chromium, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'verification', 'navigation');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5180';
const BEFORE_COMMIT = '2f1d10e';
const NAV_FILES = ['src/components/Navigation.jsx', 'src/styles/Navigation.css'];

const disableNavigatorLocks = async (page) => {
  await page.addInitScript(() => {
    if (navigator.locks) {
      try {
        navigator.locks.query = () => Promise.resolve({ held: [], pending: [] });
        navigator.locks.request = async (name, options, callback) => {
          const cb = typeof options === 'function' ? options : callback;
          if (cb) return await cb();
        };
      } catch (e) {}
    }
    const style = document.createElement('style');
    style.innerHTML = '.umpire-trigger { display: none !important; }';
    const insertStyle = () => {
      if (document.head) document.head.appendChild(style);
      else setTimeout(insertStyle, 1);
    };
    insertStyle();
  });
};

const injectMockSession = async (page, userDetails) => {
  if (!userDetails) return;
  const {
    id = 'test-user-id',
    email = 'test@example.com',
  } = userDetails;
  // The browser will derive the Supabase storage key from the URL the
  // app is configured with. Read .env so we set the right key in localStorage.
  let supabaseUrl =
    process.env.VITE_SUPABASE_URL || 'https://shlcqztfdhfwkhijwgue.supabase.co';
  try {
    const fs = await import('fs');
    const envText = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = envText.match(/VITE_SUPABASE_URL=["']?([^"'\s]+)/);
    if (m) supabaseUrl = m[1];
  } catch (_) {}
  const urlObj = new URL(supabaseUrl);
  const supabaseHost = urlObj.hostname;
  // Supabase v2 derives storage key as sb-<hostname.split('.')[0]>-auth-token
  // and the app also uses sb-<projectRef>-auth-token as a legacy fallback.
  const hostRef = supabaseHost.split('.')[0];
  await page.addInitScript(
    ({ id, email, hostRef }) => {
      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: {
          id,
          email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          created_at: new Date().toISOString(),
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
      const json = JSON.stringify(mockSession);
      window.localStorage.setItem(`sb-${hostRef}-auth-token`, json);
      window.localStorage.setItem('sb-shlcqztfdhfwkhijwgue-auth-token', json);
      window.localStorage.setItem('supabase.auth.token', json);
    },
    { id, email, hostRef }
  );
};

const mockSupabaseRoutes = async (page, userDetails = {}) => {
  const { id = 'test-user-id', is_captain = false, is_admin = false } = userDetails;

  await page.route(
    (url) => url.host.includes('supabase.co') || url.host.includes('localhost:54321'),
    async (route) => {
      const url = route.request().url();
      const accept = route.request().headers()['accept'] || '';
      const isSingle = accept.includes('vnd.pgrst.object');

      if (url.includes('/auth/v1/')) {
        const mockUser = {
          id,
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          created_at: new Date().toISOString(),
        };
        const mockSession = {
          access_token: 'mock-t',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-r',
          user: mockUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        if (url.includes('/user')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSession) });
      }

      if (url.includes('/rest/v1/')) {
        let data = [];
        if (url.includes('/player_to_team')) {
          data = [
            {
              team: 't1',
              status: 'active',
              player: {
                id: 'p1',
                user_id: id,
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                is_captain,
                is_admin,
                is_active: true,
              },
            },
          ];
        } else if (url.includes('/player')) {
          const parsed = new URL(url);
          const isList =
            parsed.searchParams.get('is_active') === 'eq.true' ||
            url.includes('order=last_name.asc');
          if (isList) {
            data = [{ id: 'p1', first_name: 'Test', last_name: 'User', ranking: 3 }];
          } else {
            data = [
              {
                id: 'p1',
                user_id: id,
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                is_captain,
                is_admin,
                is_active: true,
                player_to_team: [{ id: 'p1-t1', team: 't1', status: 'active' }],
              },
            ];
          }
        } else if (url.includes('/season')) {
          data = [{ id: 's1', number: 1, is_active: true, is_current: true }];
        } else if (url.includes('/team_match')) {
          data = [];
        } else if (url.includes('/team')) {
          data = [{ id: 't1', name: 'Test Team', number: 1 }];
        }
        const body = isSingle ? (data.length > 0 ? data[0] : null) : data;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  );
};

const ROLES = [
  { name: 'visitor', user: null },
  { name: 'player', user: { id: 'player-id', email: 'player@test.com', is_captain: false, is_admin: false } },
  { name: 'captain', user: { id: 'captain-id', email: 'captain@test.com', is_captain: true, is_admin: false } },
  { name: 'admin', user: { id: 'admin-id', email: 'admin@test.com', is_captain: false, is_admin: true } },
];

const VIEWPORTS = [
  { name: 'desktop', options: { viewport: { width: 1280, height: 800 } } },
  { name: 'mobile', options: { ...devices['Pixel 5'] } },
];

async function captureForRole(browser, viewport, role, phase) {
  const ctx = await browser.newContext({
    ...viewport.options,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await disableNavigatorLocks(page);
  if (role.user) await injectMockSession(page, role.user);
  await mockSupabaseRoutes(page, role.user || {});

  const errors = [];
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  try {
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('.navbar', { timeout: 10000 });
    // Wait for the auth state to settle (no more "Loading...")
    await page
      .waitForFunction(
        () => {
          const body = document.body ? document.body.innerText : '';
          return !body.includes('Loading...') || body.includes('Logout') || body.includes('Login');
        },
        { timeout: 8000 }
      )
      .catch(() => {});
    await page.waitForTimeout(500);

    const out = path.join(OUT_DIR, `${phase}-${role.name}-${viewport.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`  + ${path.relative(ROOT, out)}`);

    if (viewport.name === 'desktop') {
      try {
        const leagueBtn = page.getByRole('button', { name: /^League/ });
        if ((await leagueBtn.count()) > 0) {
          await leagueBtn.first().click();
          await page.waitForTimeout(300);
          const dropdownOut = path.join(
            OUT_DIR,
            `${phase}-${role.name}-${viewport.name}-dropdown-open.png`
          );
          await page.screenshot({ path: dropdownOut, fullPage: false });
          console.log(`  + ${path.relative(ROOT, dropdownOut)}`);
        }
      } catch (e) {
        console.log(`  ! Could not open League dropdown for ${role.name}: ${e.message}`);
      }
    }

    if (viewport.name === 'mobile') {
      try {
        const toggle = page.getByRole('button', { name: /Toggle navigation/i });
        if ((await toggle.count()) > 0) {
          await toggle.first().click();
          await page.waitForTimeout(300);
          const menuOut = path.join(
            OUT_DIR,
            `${phase}-${role.name}-${viewport.name}-menu-open.png`
          );
          await page.screenshot({ path: menuOut, fullPage: false });
          console.log(`  + ${path.relative(ROOT, menuOut)}`);
        }
      } catch (e) {
        console.log(`  ! Could not open mobile menu for ${role.name}: ${e.message}`);
      }
    }
  } catch (e) {
    console.error(`  X Failed ${phase}/${role.name}/${viewport.name}: ${e.message}`);
    if (errors.length) console.error('    errors:', errors.slice(0, 5).join(' | '));
    throw e;
  } finally {
    await ctx.close();
  }
}

async function main() {
  const phase = process.argv[2] || 'after';
  if (!['before', 'after'].includes(phase)) {
    console.error('Usage: node capture-nav-screenshots.js <before|after>');
    process.exit(1);
  }

  if (phase === 'before') {
    console.log(`Checking out pre-reorganization commit ${BEFORE_COMMIT} for nav files only...`);
    execSync(
      `git checkout ${BEFORE_COMMIT} -- ${NAV_FILES.join(' ')}`,
      { cwd: ROOT, stdio: 'inherit' }
    );
  } else {
    console.log('Restoring current working tree state for after-state capture...');
    try {
      execSync(
        `git checkout HEAD -- ${NAV_FILES.join(' ')}`,
        { cwd: ROOT, stdio: 'inherit' }
      );
    } catch (e) {
      console.error('Could not restore files:', e.message);
    }
  }

  console.log('Waiting 3s for Vite HMR to apply file changes...');
  await new Promise((r) => setTimeout(r, 3000));

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`\n--- Capturing screenshots (phase=${phase}) ---`);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of VIEWPORTS) {
      for (const role of ROLES) {
        await captureForRole(browser, viewport, role, phase);
      }
    }
  } finally {
    await browser.close();
  }

  if (phase === 'before') {
    console.log('\nRestoring Navigation files to working tree state...');
    execSync(`git checkout HEAD -- ${NAV_FILES.join(' ')}`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
  }

  console.log('\nDone. Output:', OUT_DIR);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
