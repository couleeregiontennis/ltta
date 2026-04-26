import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Management Features (Captain & Admin)', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
    });

    test('Captain Dashboard should show pending requests and allow approval', async ({ page }) => {
        await mockSupabaseAuth(page, { 
            id: 'cap-user-id', 
            email: 'cap@test.com', 
            is_captain: true,
            first_name: 'Captain'
        });

        // Mock player record for AuthProvider - be flexible with select params
        await page.route(url => url.pathname.includes('/rest/v1/player') && url.searchParams.get('user_id') === 'eq.cap-user-id', async (route) => {
            const data = { id: 'cap-player-id', user_id: 'cap-user-id', first_name: 'Captain', last_name: 'User', is_captain: true, is_admin: false };
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
        });

        // Mock team link for CaptainDashboard
        await page.route('**/rest/v1/player_to_team?select=team&player=eq.cap-player-id*', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ team: 't1' }) });
        });

        // Mock team data
        await page.route('**/rest/v1/team?select=*&id=eq.t1', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 't1', name: 'Team One', number: 1, play_night: 'tuesday' }) });
        });

        // Mock roster with pending request
        await page.route('**/rest/v1/player_to_team?select=status%2Cplayer%3Aplayer%28*%29&team=eq.t1', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { status: 'active', player: { id: 'p1', first_name: 'Active', last_name: 'Player', ranking: 3, is_active: true, email: 'p1@test.com' } },
                    { status: 'pending', player: { id: 'p2', first_name: 'Pending', last_name: 'User', ranking: 4, is_active: true, email: 'p2@test.com' } }
                ])
            });
        });

        // Mock other dependencies to avoid 401s
        await page.route('**/rest/v1/match_scores*', r => r.fulfill({ status: 200, body: '[]' }));
        await page.route('**/rest/v1/matches*', r => r.fulfill({ status: 200, body: '[]' }));
        await page.route('**/rest/v1/rpc/get_team_match_stats*', r => r.fulfill({ status: 200, body: '[]' }));

        await page.goto('/captain-dashboard');

        await expect(page.getByText('Pending Join Requests')).toBeVisible({ timeout: 20000 });
        await expect(page.getByText('Pending User')).toBeVisible();

        // Mock approval
        await page.route('**/rest/v1/player_to_team?player=eq.p2&team=eq.t1', async (route) => {
            await route.fulfill({ status: 204 });
        });

        await page.getByRole('button', { name: 'Approve' }).click();
        await expect(page.locator('.success-message')).toContainText(/approved/i);
    });

    test('Admin should be able to move players between teams', async ({ page }) => {
        await mockSupabaseAuth(page, { 
            id: 'admin-user-id', 
            email: 'admin@test.com', 
            is_admin: true,
            first_name: 'Admin'
        });

        // Mock admin player record - be flexible with the select parameters
        await page.route(url => url.pathname.includes('/rest/v1/player') && url.searchParams.get('user_id') === 'eq.admin-user-id', async (route) => {
            const data = { id: 'admin-player-id', user_id: 'admin-user-id', first_name: 'Admin', last_name: 'User', is_captain: true, is_admin: true };
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
        });

        // Mock teams list - be flexible with params
        await page.route(url => url.pathname.includes('/rest/v1/team') && url.searchParams.has('select'), async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 't1', name: 'Team A', number: 1, play_night: 'tuesday' },
                    { id: 't2', name: 'Team B', number: 2, play_night: 'wednesday' }
                ])
            });
        });

        // Mock players list for admin - be flexible with params
        await page.route(url => url.pathname.includes('/rest/v1/player') && url.searchParams.get('select')?.includes('player_to_team'), async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { 
                        id: 'p1', 
                        first_name: 'Test', 
                        last_name: 'Player', 
                        email: 'test@test.com', 
                        ranking: 3, 
                        is_active: true, 
                        player_to_team: [{ team: 't1', status: 'active' }] 
                    }
                ])
            });
        });

        await page.goto('/admin/players');
        
        // Wait for loading to disappear
        await expect(page.getByText(/Loading player management/)).not.toBeVisible({ timeout: 10000 });

        const content = await page.content();
        if (content.includes('Access Denied')) {
            console.log('BROWSER: ACCESS DENIED - Check userRole.isAdmin');
        }

        await expect(page.getByRole('columnheader', { name: 'Team' })).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Team A')).toBeVisible();

        // Use more specific selector for the edit button
        await page.getByRole('button', { name: /Edit Test Player/i }).click();
        
        await page.getByLabel('Team Assignment').selectOption({ label: 'Team B (wednesday)' });
        
        // Mock the update calls
        await page.route(url => url.pathname.includes('/rest/v1/player'), async (route) => {
            if (route.request().method() === 'PATCH') {
                await route.fulfill({ status: 200, body: '{}' });
            } else {
                await route.continue();
            }
        });
        await page.route(url => url.pathname.includes('/rest/v1/player_to_team'), async (route) => {
            await route.fulfill({ status: 200 });
        });

        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByText(/updated successfully/i)).toBeVisible();
    });
});
;
