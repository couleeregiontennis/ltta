import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseData } from '../utils/auth-mock';

test.describe('Player Rankings', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);

        await page.route('**/rest/v1/player*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'p1', first_name: '[TEST]', last_name: 'Captain', is_active: true, ranking: 5, player_to_team: [{ team: { name: 'Alpha', play_night: 'tuesday' } }] },
                    { id: 'p2', first_name: '[TEST]', last_name: 'Regular', is_active: true, ranking: 4, player_to_team: [{ team: { name: 'Beta', play_night: 'wednesday' } }] }
                ]),
            });
        });
    });

    test('loads player rankings page', async ({ page }) => {
        await page.goto('/player-rankings');

        // Verify title
        await expect(page.getByRole('heading', { name: 'Player Rankings' })).toBeVisible();

        // Check for the night filter dropdown
        const filterDropdown = page.locator('#night-filter');
        await expect(filterDropdown).toBeVisible();

        // Verify test data appears
        await expect(page.getByText('[TEST] Captain')).toBeVisible();
        await expect(page.getByText('[TEST] Regular')).toBeVisible();
    });

    test('can filter players by play night', async ({ page }) => {
        await page.goto('/player-rankings');

        const filterDropdown = page.locator('#night-filter');

        // Select a specific night (Tuesday) to filter
        await filterDropdown.selectOption('tuesday');

        // The Captain (Tuesday) should remain visible
        await expect(page.getByText('[TEST] Captain')).toBeVisible();

        // The Regular player (Wednesday) should disappear
        await expect(page.getByText('[TEST] Regular')).not.toBeVisible();
    });
});
