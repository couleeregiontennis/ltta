// tests/utils/auth-mock.js

export async function disableNavigatorLocks(page) {
  await page.addInitScript(() => {
    if (navigator.locks) {
      try {
        navigator.locks.query = () => Promise.resolve({ held: [], pending: [] });
        navigator.locks.request = () => new Promise(() => {});
      } catch (e) {
        console.warn('Failed to mock navigator.locks', e);
      }
    }
  });
}

/**
 * Legacy mock for data tables. 
 * Better to use mockSupabaseAuth for full system mocks.
 */
export async function mockSupabaseData(page, table, data) {
  await page.route(new RegExp(`/rest/v1/${table}(\\?|$)`), async (route) => {
    const accept = route.request().headers()['accept'] || '';
    const isSingle = accept.includes('vnd.pgrst.object');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isSingle ? (Array.isArray(data) ? data[0] : data) : (Array.isArray(data) ? data : [data])),
    });
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

  await page.route(url => url.href.includes('.supabase.co'), async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const accept = route.request().headers()['accept'] || '';
    const isSingle = accept.includes('vnd.pgrst.object');
    
    // 1. Auth Service
    if (url.includes('/auth/v1/')) {
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                access_token: 'mock-t',
                user: { id, email, aud: 'authenticated', app_metadata: {}, user_metadata: {} }
            })
        });
    }

    // 2. Data Service
    if (url.includes('/rest/v1/')) {
        let data = [];
        
        if (url.includes('/player_to_team')) {
            data = [{ team: 't1', status: 'active', player: id }];
        } else if (url.includes('/player')) {
            data = { id: 'p1', user_id: id, email, first_name, last_name, is_captain, is_admin, is_active: true };
        } else if (url.includes('/season')) {
            data = { id: 's1', number: 1, is_active: true, is_current: true };
        } else if (url.includes('/team_match')) {
            data = [{ id: 'm1', home_team_number: 1, away_team_number: 2, date: '2023-01-01', home_team: { name: 'Home' }, away_team: { name: 'Away' } }];
        } else if (url.includes('/team')) {
            data = [{ id: 't1', name: 'Test Team', number: 1 }];
        }
        
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(isSingle ? (Array.isArray(data) ? data[0] : data) : (Array.isArray(data) ? data : [data]))
        });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}
