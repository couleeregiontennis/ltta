import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Rainout Handling @live', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
        });
        page.on('pageerror', err => {
            console.error(`BROWSER EXCEPTION: ${err.message}\nStack: ${err.stack}`);
            throw err;
        });
    });

    test('Captain should see Mark Rainout button on schedule', async ({ page }) => {
        await disableNavigatorLocks(page);
        await mockSupabaseAuth(page, { is_captain: true });

        // Mock team matches GET and PATCH
        let isRainedOut = false;
        await page.route('**/rest/v1/team_match*', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: 'match-1',
                            date: new Date().toISOString(),
                            time: '18:00',
                            status: isRainedOut ? 'rain_cancellation' : 'scheduled',
                            courts: '1',
                            home_team: { id: 't1', name: 'Home Team', number: 1 },
                            away_team: { id: 't2', name: 'Away Team', number: 2 }
                        }
                    ])
                });
            } else if (method === 'PATCH') {
                isRainedOut = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'match-1', status: 'rain_cancellation' })
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/schedule');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        // Toggle to List view
        await page.getByRole('button', { name: 'List', exact: true }).click();

        // Verify that 'Mark Rainout' is visible
        const markButton = page.getByRole('button', { name: 'Mark Rainout' });
        await expect(markButton).toBeVisible({ timeout: 10000 });

        // Click 'Mark Rainout'
        await markButton.click();

        // It should change to 'Undo Rainout'
        const undoButton = page.getByRole('button', { name: 'Undo Rainout' });
        await expect(undoButton).toBeVisible({ timeout: 10000 });
    });
});
