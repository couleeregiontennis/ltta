// tests/utils/auth-mock.js

export async function disableNavigatorLocks(page) {
  // Disable navigator.locks to prevent Supabase client from hanging
  await page.addInitScript(() => {
    if (navigator.locks) {
      try {
        Object.defineProperty(navigator, 'locks', { value: undefined });
      } catch (e) {
        console.error('Failed to disable navigator.locks', e);
      }
    }

    // Inject CSS to hide global floating elements
    window.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.innerHTML = '.umpire-trigger { display: none !important; }';
      document.head.appendChild(style);
    });
  });
}

export async function mockSupabaseAuth(page, userDetails = {}) {
  await disableNavigatorLocks(page);

  const defaultUser = {
    id: userDetails.id || 'fake-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: userDetails.email || 'test@example.com',
    ...userDetails,
  };

  const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlLXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE5OTk5OTk5OTksImlhdCI6MTYwMDAwMDAwMCwiYXVkIjoiYXV0aGVudGljYXRlZCIsInR5cCI6ImFub24ifQ.fake-signature';

  const session = {
    access_token: validJwt,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'fake-refresh-token',
    user: defaultUser,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };

  // We MUST use the correct project ref for the storage key
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shlcqztfdhfwkhijwgue.supabase.co';
  let projectRef = 'shlcqztfdhfwkhijwgue';
  try {
    const hostname = new URL(supabaseUrl).hostname;
    projectRef = hostname.split('.')[0];
  } catch (e) {}
  
  const storageKey = `sb-${projectRef}-auth-token`;

  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, { key: storageKey, value: session });

  // Mock token and user endpoints
  await page.route('**/auth/v1/token*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }));
  await page.route('**/auth/v1/user', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(defaultUser) }));

  // GLOBAL DATA MOCKS
  
  // Mock player data - AuthProvider uses user_id
  await page.route('**/rest/v1/player*', async (route) => {
    if (route.request().method() === 'GET') {
      const url = new URL(route.request().url());
      const userIdFilter = url.searchParams.get('user_id');
      const idFilter = url.searchParams.get('id');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: defaultUser.id,
          user_id: defaultUser.id,
          first_name: 'Test',
          last_name: 'User',
          email: defaultUser.email,
          is_captain: userDetails.is_captain || false,
          is_admin: userDetails.is_admin || false,
          ranking: 3,
          is_active: true
        }]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock player_to_team data
  await page.route('**/rest/v1/player_to_team*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ team: 't1', player: defaultUser.id }]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock team data
  await page.route('**/rest/v1/team*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 't1', number: 1, name: 'Strikers', play_night: 'Tuesday' }]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock matches data
  await page.route('**/rest/v1/matches*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'm1', date: '2026-05-12', time: '6:00 PM', home_team_number: 1, away_team_number: 2, home_team_name: 'Strikers', away_team_name: 'Volleyers', courts: '1-2' }
        ]),
      });
    } else {
      await route.continue();
    }
  });
}
