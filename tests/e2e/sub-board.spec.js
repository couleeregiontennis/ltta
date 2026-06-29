import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Sub Board @live', () => {
    test('Player can see open requests', async ({ page }) => {
        await disableNavigatorLocks(page);
        await mockSupabaseAuth(page);
        await page.goto('/sub-board');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Sub Board' })).toBeVisible();
    });

    test('Captain sees autofilled match details on Create Sub Request', async ({ page }) => {
        await disableNavigatorLocks(page);
        
        // Mock captain session
        await mockSupabaseAuth(page, {
            id: 'cap-user-id',
            email: 'captain@ltta.com',
            is_captain: true,
            is_admin: false
        });

        // Mock teams list
        await page.route(/\/rest\/v1\/team($|\?)/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'team-uuid-1', name: 'Alphas', number: 101, play_night: 'Monday' }
                ])
            });
        });

        // Mock locations list
        await page.route(/\/rest\/v1\/location($|\?)/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'loc-uuid-1', name: 'Rec Center', address: '123 Main St' }
                ])
            });
        });

        // Mock player to team mapping
        await page.route(/\/rest\/v1\/player_to_team($|\?)/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        player: 'cap-user-id',
                        team: { id: 'team-uuid-1', name: 'Alphas', number: 101, play_night: 'Monday' }
                    }
                ])
            });
        });

        // Mock team matches
        await page.route(/\/rest\/v1\/team_match($|\?)/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'match-uuid-1',
                        date: '2026-07-15',
                        time: '18:30',
                        location_id: 'loc-uuid-1',
                        status: 'scheduled'
                    }
                ])
            });
        });

        await page.goto('/sub-board');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        // Navigate to My Requests
        await page.getByRole('button', { name: 'My Requests' }).click();

        // Open Form
        await page.getByRole('button', { name: '+ Create New Sub Request' }).click();

        // Verify that fields are autofilled!
        await expect(page.locator('select[required]')).toHaveValue('team-uuid-1');
        await expect(page.locator('input[type="date"]')).toHaveValue('2026-07-15');
        await expect(page.locator('input[type="time"]')).toHaveValue('18:30');
        await expect(page.locator('select').nth(1)).toHaveValue('loc-uuid-1');
    });
});
