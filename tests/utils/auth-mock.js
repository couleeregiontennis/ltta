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

  await page.route('**/auth/v1/token*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }));
  await page.route('**/auth/v1/user', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(defaultUser) }));

  // GLOBAL DATA MOCKS
  
  // Mock current season - CRITICAL for MatchSchedule and Standings
  await page.route('**/rest/v1/season*', async (route) => {
    if (route.request().method() === 'GET') {
      const seasonData = {
        id: 's2026-uuid',
        number: 2026,
        name: 'Summer 2026',
        is_current: true,
        start_date: '2026-06-01',
        end_date: '2026-08-31'
      };
      
      // If the URL has limit=1 or is a single request, return object, else array
      const isSingle = route.request().url().includes('limit=1') || route.request().url().includes('maybeSingle');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? seasonData : [seasonData]),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/rest/v1/player*', async (route) => {
    if (route.request().method() === 'GET') {
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
          is_active: true,
          availability: { monday: true, tuesday: true }
        }]),
      });
    } else {
      await route.continue();
    }
  });

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

  // Mock team_match (the new relational table)
  await page.route('**/rest/v1/team_match*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { 
            id: 'm1-uuid', 
            date: '2026-05-12', 
            time: '18:00:00', 
            status: 'scheduled', 
            courts: '1-2',
            home_team: { id: 't1', name: 'Strikers', number: 1 },
            away_team: { id: 't2', name: 'Volleyers', number: 2 }
          }
        ]),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/rest/v1/standings*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 's1', team_id: 't1', team_number: 1, team_name: 'Strikers', wins: 5, losses: 1, ties: 0, points: 15, matches_played: 6, win_percentage: 83.3, sets_won: 12, sets_lost: 2, games_won: 72, games_lost: 40, play_night: 'Tuesday' },
          { id: 's2', team_id: 't2', team_number: 2, team_name: 'Volleyers', wins: 3, losses: 3, ties: 0, points: 9, matches_played: 6, win_percentage: 50.0, sets_won: 8, sets_lost: 8, games_won: 60, games_lost: 60, play_night: 'Tuesday' }
        ]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock location for Courts
  await page.route('**/rest/v1/location*', async (route) => {
    if (route.request().method() === 'GET') {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ id: 'l1', name: 'Green Island Park', address: '2312 7th St S, La Crosse, WI 54601', courts_count: 8 }])
        });
    } else {
        await route.continue();
    }
  });
}
