import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Captain Dashboard Actions', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);

        // 1. Mock auth as our test captain
        await mockSupabaseAuth(page, {
            id: 'cap-user-id',
            email: 'captain@test.local',
            is_captain: true
        });

        // 2. Comprehensive mock for all rest calls
        await page.route('**/rest/v1/*', async (route) => {
            const url = route.request().url();
            const method = route.request().method();
            const accept = route.request().headers()['accept'] || '';
            
            if (method === 'GET') {
                // Profile check for AuthProvider (MUST return first_name for hasProfile=true)
                if (url.includes('/player?')) {
                    const data = { id: 'cap-p', first_name: 'Captain', last_name: 'User', is_captain: true, is_admin: false };
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(accept.includes('vnd.pgrst.object') ? data : [data]) });
                }
                // Team link check
                if (url.includes('/player_to_team?select=team')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(accept.includes('vnd.pgrst.object') ? { team: 't1' } : [{ team: 't1' }]) });
                }
                // Roster load (IMPORTANT: handle nested selection)
                if (url.includes('player_to_team') && (url.includes('player:player') || url.includes('player%3Aplayer'))) {
                    const roster = [
                        { status: 'active', player: { id: 'p1', first_name: '[TEST] Regular', last_name: 'Player', ranking: 3, is_active: true } }
                    ];
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(roster) });
                }
                // Team details
                if (url.includes('/team?')) {
                    const teamData = { id: 't1', name: '[TEST] Alpha', number: 1, play_night: 'tuesday' };
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(accept.includes('vnd.pgrst.object') ? teamData : [teamData]) });
                }
                // Default empty
                return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            }
            await route.continue();
        });
    });

    test('can load dashboard and view team info', async ({ page }) => {
        await page.goto('/captain-dashboard');

        // Verify Dashboard Header
        await expect(page.locator('h1')).toContainText('Captain Dashboard', { timeout: 15000 });

        // Verify Team Name
        await expect(page.locator('main')).toContainText('[TEST] Alpha', { timeout: 10000 });

        // Verify Roster
        await expect(page.locator('.roster-table')).toContainText('[TEST] Regular', { timeout: 10000 });
    });

    test('opens manage roster modal', async ({ page }) => {
        await page.goto('/captain-dashboard');
        await page.getByRole('button', { name: 'Manage Roster' }).click();
        await expect(page.getByRole('heading', { name: 'Manage Team Roster' })).toBeVisible();
        await expect(page.getByText('Available Players')).toBeVisible();
    });
});
