// tests/utils/auth-mock.js

export async function disableNavigatorLocks(page) {
  await page.addInitScript(() => {
    if (navigator.locks) {
      try {
        navigator.locks.query = () => Promise.resolve({ held: [], pending: [] });
        navigator.locks.request = () => new Promise(() => {});
      } catch (e) {
        console.error('Failed to mock navigator.locks:', e);
      }
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
    last_name = 'User'
  } = userDetails;

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
        
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSession) });
    }

    // 2. Data Service (Default fallbacks for common tables)
    if (url.includes('/rest/v1/')) {
        let data = [];
        
        if (url.includes('/player_to_team')) {
            data = [{ team: 't1', status: 'active', player: id }];
        } else if (url.includes('/player')) {
            data = [{ id: 'p1', user_id: id, email, first_name, last_name, is_captain, is_admin, is_active: true }];
        } else if (url.includes('/season')) {
            data = [{ id: 's1', number: 1, is_active: true, is_current: true }];
        } else if (url.includes('/team_match')) {
            data = [];
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
