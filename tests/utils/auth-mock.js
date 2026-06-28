// tests/utils/auth-mock.js

export async function disableNavigatorLocks(page) {
  await page.addInitScript(() => {
    if (navigator.locks) {
      try {
        navigator.locks.query = () => Promise.resolve({ held: [], pending: [] });
        navigator.locks.request = async (name, options, callback) => {
          const cb = typeof options === 'function' ? options : callback;
          if (cb) {
            return await cb();
          }
        };
      } catch (e) {
        console.error('Failed to mock navigator.locks:', e);
      }
    }
    // Hide umpire trigger in E2E tests to avoid intercepting clicks on other elements
    const style = document.createElement('style');
    style.innerHTML = '.umpire-trigger { display: none !important; }';
    const insertStyle = () => {
      if (document.head) {
        document.head.appendChild(style);
      } else {
        setTimeout(insertStyle, 1);
      }
    };
    insertStyle();
  });
}

export async function mockSupabaseAuth(page, userDetails = {}) {
  await disableNavigatorLocks(page);
  const { 
    id = 'test-user-id', 
    email = 'test@example.com', 
    is_captain = false, 
    is_admin = false,
    first_name = 'Test',
    last_name = 'User',
    startLoggedOut = false
  } = userDetails;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shlcqztfdhfwkhijwgue.supabase.co';
  const match = supabaseUrl.match(/https?:\/\/([^.]+)/);
  const projectRef = match ? match[1] : 'shlcqztfdhfwkhijwgue';

  // Inject session into localStorage for immediate auth recognition
  if (!startLoggedOut) {
    await page.addInitScript(({ id, email, projectRef }) => {
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
      window.localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(mockSession));
      window.localStorage.setItem(`sb-shlcqztfdhfwkhijwgue-auth-token`, JSON.stringify(mockSession));
      window.localStorage.setItem(`sb-localhost-auth-token`, JSON.stringify(mockSession));
      window.localStorage.setItem(`sb-localhost-54321-auth-token`, JSON.stringify(mockSession));
      // Also set generic key as fallback
      window.localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
    }, { id, email, projectRef });
  }
  await page.route(url => url.host.includes('supabase.co') || url.host.includes('localhost:54321'), async (route) => {
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
        
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSession) });
    }

    // 2. Data Service (Default fallbacks for common tables)
    if (url.includes('/rest/v1/')) {
        let data = [];
        
        if (url.includes('/player_to_team')) {
            data = [{ 
                team: 't1', 
                status: 'active', 
                player: { 
                    id: 'p1', 
                    user_id: id, 
                    email, 
                    first_name, 
                    last_name, 
                    is_captain, 
                    is_admin, 
                    is_active: true 
                } 
            }];
        } else if (url.includes('/player')) {
            const parsedUrl = new URL(url);
            const isActive = parsedUrl.searchParams.get('is_active');
            if (isActive === 'eq.true' || url.includes('select=id%2Cfirst_name%2Clast_name%2Cranking')) {
                data = [
                    { id: 'p1', first_name: 'Test', last_name: 'Player1', ranking: 3 },
                    { id: 'p2', first_name: 'Sub', last_name: 'One', ranking: 4 },
                    { id: 'p3', first_name: 'Sub', last_name: 'Two', ranking: 3 },
                    { id: 'p4', first_name: 'Sub', last_name: 'Three', ranking: 3 }
                ];
            } else {
                data = [{ 
                    id: 'p1', 
                    user_id: id, 
                    email, 
                    first_name, 
                    last_name, 
                    is_captain, 
                    is_admin, 
                    is_active: true,
                    player_to_team: [{ id: 'p1-t1', team: 't1', status: 'active' }]
                }];
            }
        } else if (url.includes('/season')) {
            data = [{ id: 's1', number: 1, is_active: true, is_current: true }];
        } else if (url.includes('/team_match')) {
            const todayStr = new Date().toISOString().split('T')[0];
            data = [
                { 
                    id: 'match-1', 
                    home_team_number: 1, 
                    away_team_number: 2, 
                    date: todayStr, 
                    status: 'scheduled',
                    home_team: { id: 't1', name: 'Home Team', number: 1 }, 
                    away_team: { id: 't2', name: 'Away Team', number: 2 }
                },
                { 
                    id: 'm1-uuid', 
                    home_team_number: 1, 
                    away_team_number: 2, 
                    date: todayStr, 
                    status: 'scheduled',
                    home_team: { id: 't1', name: 'Home Team', number: 1 }, 
                    away_team: { id: 't2', name: 'Away Team', number: 2 }
                }
            ];
        } else if (url.includes('/team')) {
            data = [{ id: 't1', name: 'Test Team', number: 1 }];
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
