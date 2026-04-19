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

export async function mockSupabaseData(page, table, data) {
  await page.route(`**/rest/v1/${table}*`, async (route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('vnd.pgrst.object') || url.includes('limit=1');
      
      if (isSingle) {
        console.log(`MOCK: Returning SINGLE object (Accept: ${acceptHeader}, URL: ${url})`);
      }
      const responseData = (isSingle && Array.isArray(data)) ? data[0] : data;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    } else {
      await route.continue();
    }
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

  const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlLXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE5OTk5OTk5OTksImlhdCI6MTYwMDAwMDAwMCwiYXVkIjoiYXV0aGVudGljYXV0aGVudGljYXRlZCJ9.fake-signature';

  const session = {
    access_token: validJwt,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'fake-refresh-token',
    user: defaultUser,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
  let projectRef = 'example';
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
  
  // Mock current season - use regex to avoid matching other tables
  await page.route(/\/rest\/v1\/season($|\?)/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const seasonData = {
        id: 's2026-uuid',
        number: 2026,
        name: 'Summer 2026',
        is_current: true,
        start_date: '2026-06-01',
        end_date: '2026-08-31'
      };
      const isSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object') || url.includes('limit=1') || url.includes('maybeSingle');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? seasonData : [seasonData]),
      });
    } else {
      await route.continue();
    }
  });

  // Robust player mock - use regex to avoid matching player_to_team
  await page.route(/\/rest\/v1\/player($|\?)/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('vnd.pgrst.object') || url.includes('limit=1');
      
      const playerData = [
        {
          id: defaultUser.id,
          user_id: defaultUser.id,
          first_name: userDetails.first_name || 'Test',
          last_name: userDetails.last_name || 'User',
          email: defaultUser.email,
          is_captain: userDetails.is_captain ?? false,
          is_admin: userDetails.is_admin ?? false,
          ranking: 3,
          is_active: true
        },
        {
          id: 'other-player-id',
          user_id: 'other-user-id',
          first_name: 'Other',
          last_name: 'Player',
          email: 'other@test.com',
          is_captain: false,
          is_admin: false,
          ranking: 4,
          is_active: true
        }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? playerData[0] : playerData),
      });
    } else {
      await route.continue();
    }
  });

  // Robust player_to_team mock
  await page.route(/\/rest\/v1\/player_to_team($|\?)/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('vnd.pgrst.object') || url.includes('limit=1');
      
      let filtered = [
        { team: 't1', player: defaultUser.id },
        { team: 't1', player: 'other-player-id' }
      ];

      // Filter by team if requested
      if (url.includes('team=eq.t2')) {
        filtered = [
          { team: 't2', player: defaultUser.id },
          { team: 't2', player: 'other-player-id' }
        ];
      } else if (url.includes(`player=eq.${defaultUser.id}`)) {
        filtered = [
          { team: 't1', player: defaultUser.id }
        ];
      }

      // Handle joins
      const results = filtered.map(link => {
        const result = { ...link };
        // Check for any variant of player join
        if (url.includes('player') && (url.includes('(') || url.includes('%28') || url.includes(':'))) {
          const isMe = result.player === defaultUser.id;
          result.player = {
            id: result.player,
            first_name: isMe ? (userDetails.first_name || 'Test') : (result.player === 'p1' ? 'Player' : 'Other'),
            last_name: isMe ? (userDetails.last_name || 'User') : (result.player === 'p1' ? 'One' : (result.player === 'p2' ? 'Two' : 'Player')),
            ranking: isMe ? 3 : (result.player === 'p1' ? 1 : (result.player === 'p2' ? 2 : 4)),
            is_active: true
          };
        }
        if (url.includes('team') && (url.includes('(') || url.includes('%28') || url.includes(':'))) {
          result.team = {
            id: result.team,
            number: result.team === 't1' ? 1 : 2,
            name: result.team === 't1' ? 'Strikers' : 'Volleyers',
            play_night: 'Tuesday'
          };
        }
        return result;
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? results[0] : results),
      });
    } else {
      await route.continue();
    }
  });

  // Team mock - use regex to avoid matching team_match
  await page.route(/\/rest\/v1\/team($|\?)/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('vnd.pgrst.object') || url.includes('limit=1');
      
      let teamData = { id: 't1', number: 1, name: 'Strikers', play_night: 'tuesday' };
      if (url.includes('number=eq.2') || url.includes('id=eq.t2')) {
        teamData = { id: 't2', number: 2, name: 'Volleyers', play_night: 'tuesday' };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? teamData : [teamData]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock team_match (the new relational table)
  await page.route(/\/rest\/v1\/team_match($|\?)/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      const acceptHeader = route.request().headers()['accept'] || '';
      const isSingle = acceptHeader.includes('vnd.pgrst.object') || url.includes('limit=1');
      
      // Robust team_match mock
      const matchData = { 
        id: 'm1-uuid', 
        date: '2026-05-12', 
        time: '18:00:00', 
        status: 'scheduled', 
        courts: '1-2',
        is_disputed: false,
        home_team_id: 't1',
        away_team_id: 't2',
        home_full_roster: false,
        away_full_roster: false,
        home_team: { id: 't1', name: 'Strikers', number: 1, play_night: 'tuesday' },
        away_team: { id: 't2', name: 'Volleyers', number: 2, play_night: 'tuesday' }
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isSingle ? matchData : [matchData]),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/rest/v1/line_results*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    } else {
      await route.continue();
    }
  });
}
