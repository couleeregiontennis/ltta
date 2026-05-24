// tests/utils/auth-mock.js

export async function disableNavigatorLocks(page) {
  await page.addInitScript(() => {
    try {
      Object.defineProperty(navigator, 'locks', {
        get: () => undefined,
        configurable: true
      });
    } catch (e) {
      console.error('Failed to disable navigator.locks:', e);
    }
  });
}

export async function mockSupabaseAuth(page, userDetails = {}) {
  const { 
    id = 'test-user-id', 
    email = 'test@example.com', 
    is_captain = false, 
    is_admin = false,
    first_name = 'Test',
    last_name = 'User',
    autoLogin = true
  } = userDetails;

  // Automatically disable navigator locks to prevent hangs in headless browsers
  await disableNavigatorLocks(page);

  if (autoLogin) {
    // Inject session into localStorage for immediate auth recognition
    await page.addInitScript(({ id, email }) => {
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
          created_at: new Date().toISOString()
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      
      // Standard Supabase localStorage key format: sb-[PROJECT_REF]-auth-token
      // Using current project ref: shlcqztfdhfwkhijwgue
      const projectRef = 'shlcqztfdhfwkhijwgue';
      window.localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(mockSession));
      // Also set generic key as fallback
      window.localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
    }, { id, email });
  }

  await page.route('**/*.supabase.co/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const accept = route.request().headers()['accept'] || '';
    const isSingle = accept.includes('vnd.pgrst.object');

    console.log(`[MOCK] ${method} ${url}`);

    // 1. Auth Service
    if (url.includes('/auth/v1/')) {
        const mockUser = { 
            id, 
            email, 
            aud: 'authenticated', 
            role: 'authenticated',
            app_metadata: { provider: 'email' }, 
            user_metadata: {},
            created_at: new Date().toISOString()
        };
        
        const mockSession = {
            access_token: 'mock-t',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-r',
            user: mockUser,
            expires_at: Math.floor(Date.now() / 1000) + 3600
        };

        if (url.includes('/user')) {
             return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) });
        }
        
        if (url.includes('/logout')) {
             return route.fulfill({ status: 204 });
        }
        
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSession) });
    }

    // 2. Data Service (Default fallbacks for common tables)
    if (url.includes('/rest/v1/')) {
        let data = [];
        
        if (url.includes('/player_to_team')) {
            const hasTeamSelect = url.includes('select=team%28') || url.includes('select=team(');
            data = [{ 
                team: hasTeamSelect ? { id: 't1', number: 1, name: 'Home Team' } : 't1',
                status: 'active', 
                player: { id: 'p1', user_id: 'regular-user-id', email: 'regular@example.com', first_name: 'Regular', last_name: 'Player', is_captain: false, is_admin: false, ranking: 3, is_active: true }
            }];
        } else if (url.includes('/player')) {
            data = [{ 
                id: 'p1', 
                user_id: id, 
                email, 
                first_name, 
                last_name, 
                is_captain, 
                is_admin, 
                is_active: true,
                player_to_team: [{ id: 'pt-1', team: 't1', status: 'active' }]
            }];
        } else if (url.includes('/season')) {
            data = [{ id: 's1', number: 1, is_active: true, is_current: true }];
        } else if (url.includes('/team_match')) {
            data = [{
                id: 'match-1',
                home_team_id: 't1',
                away_team_id: 't2',
                home_team: { id: 't1', name: 'Home Team', number: 1 },
                away_team: { id: 't2', name: 'Away Team', number: 2 },
                date: new Date().toISOString().split('T')[0],
                time: '18:00',
                status: 'scheduled',
                courts: '1, 2',
                is_rained_out: false,
                is_disputed: false,
                line_results: []
            }];
        } else if (url.includes('/team')) {
            data = [{ id: 't1', name: 'Home Team', number: 1 }];
        } else if (url.includes('/matches')) {
            data = [{
                id: 'match-1',
                home_team_name: 'Home Team',
                home_team_number: 1,
                away_team_name: 'Away Team',
                away_team_number: 2,
                date: new Date().toISOString().split('T')[0],
                time: '18:00',
                status: 'scheduled',
                courts: '1, 2',
                is_rained_out: false
            }];
        } else if (url.includes('/line_results')) {
            data = [];
        }
        
        const responseBody = isSingle ? (data.length > 0 ? data[0] : null) : data;
        
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responseBody)
        });
    }

    // Fallback for any other Supabase call
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

export async function mockSupabaseData(page, table, data) {
  await page.route(`**/rest/v1/${table}*`, async (route) => {
    const accept = route.request().headers()['accept'] || '';
    const isSingle = accept.includes('vnd.pgrst.object');
    
    if (route.request().method() === 'GET') {
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isSingle ? (Array.isArray(data) ? data[0] : data) : (Array.isArray(data) ? data : [data]))
        });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}
