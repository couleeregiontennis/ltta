import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Captain Dashboard Actions', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);

        // Mock auth as our test captain
        await mockSupabaseAuth(page, {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0301',
            email: 'captain@test.local'
        });

        await page.route('**/rest/v1/player*', async (route) => {
            const url = route.request().url();
            if (url.includes('id=eq')) {
                const playerObj = {
                    id: 'd290f1ee-6c54-4b01-90e6-d701748f0301',
                    first_name: '[TEST] Captain',
                    last_name: 'User',
                    is_captain: true,
                    is_admin: false
                };
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(playerObj) });
                return;
            }
            if (url.includes('is_active=eq.true')) {
                const pObj = {
                    id: 'd290f1ee-6c54-4b01-90e6-d701748f0303',
                    first_name: 'Available',
                    last_name: 'Agent',
                    email: 'free@agent.com',
                    ranking: 4
                };
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([pObj]) });
                return;
            }
            await route.continue();
        });

        await page.route('**/rest/v1/player_to_team*', async (route) => {
            const url = route.request().url();
            if (url.includes('player%3Aplayer') || url.includes('player:player')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{ player: { id: 'd290f1ee-6c54-4b01-90e6-d701748f0302', first_name: '[TEST] Regular', last_name: 'Player', is_captain: false } }])
                });
                return;
            }
            if (url.includes('player=eq')) {
                const teamLink = { player: 'd290f1ee-6c54-4b01-90e6-d701748f0301', team: 'd290f1ee-6c54-4b01-90e6-d701748f0101' };
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(teamLink) });
                return;
            }
            if (url.includes('select=player')) {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ player: 'd290f1ee-6c54-4b01-90e6-d701748f0304' }]) });
                return;
            }
            await route.continue();
        });

        await page.route('**/rest/v1/team*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'd290f1ee-6c54-4b01-90e6-d701748f0101', number: 1, name: '[TEST] Alpha', play_night: 'Monday' })
            });
        });

        // 5. Matches (season record, upcoming)
        await page.route('**/rest/v1/matches*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });
    });

    test('can load dashboard and view team info', async ({ page }) => {
        await page.goto('/captain-dashboard');

        await expect(page.getByRole('heading', { name: 'Captain Dashboard' })).toBeVisible();

        // Verify it loaded the seeded team data for the captain
        await expect(page.getByText('[TEST] Alpha')).toBeVisible();

        // Verify roster section
        await expect(page.getByRole('heading', { name: 'Team Roster Management' })).toBeVisible();
        await expect(page.locator('.roster-table').getByText('[TEST] Regular Player')).toBeVisible();
    });

    test('opens manage roster modal', async ({ page }) => {
        await page.goto('/captain-dashboard');

        // Click Manage Roster to open modal
        await page.getByRole('button', { name: 'Manage Roster' }).click();

        // Expect the Modal heading
        await expect(page.getByRole('heading', { name: 'Manage Team Roster' })).toBeVisible();

        // Verify the Free Agents section exists
        await expect(page.getByRole('heading', { name: 'Available Players' })).toBeVisible();
    });
});
