import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Schedule Generator Admin Flow', () => {
    test.beforeEach(async ({ page }) => {
        await disableNavigatorLocks(page);
        
        // 1. Authenticate as Admin
        await mockSupabaseAuth(page, { 
            id: 'admin-user-id',
            email: 'admin@test.com',
            is_admin: true,
            first_name: 'Admin'
        });

        // 2. Mock teams query (needs at least 2 teams on Tuesday to generate schedule)
        await page.route('**/rest/v1/team*', async (route) => {
            const teams = [
                { id: 'team-1', number: 1, name: 'Aces', play_night: 'Tuesday' },
                { id: 'team-2', number: 2, name: 'Faults', play_night: 'Tuesday' }
            ];
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(teams)
            });
        });

        // 3. Mock existing schedule checks in matches / team_match
        await page.route('**/rest/v1/team_match*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        // 4. Mock the backend schedule generation / API endpoint
        await page.route('**/api/generate-schedule', async (route) => {
            const method = route.request().method();
            const body = JSON.parse(route.request().postData());

            if (body.preview) {
                // Return preview data
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        matches: [
                            { week: 1, home_team_name: 'Aces', away_team_name: 'Faults', date: '2026-06-02', time: '18:00', court: '1' }
                        ],
                        teams: ['team-1', 'team-2'],
                        weeks: 1
                    })
                });
            } else {
                // Return successful save status
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true })
                });
            }
        });
    });

    test('should allow configuring, previewing, and saving a schedule', async ({ page }) => {
        await page.goto('/admin/schedule-generator');
        await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });

        // Verify loaded state
        await expect(page.getByRole('heading', { name: 'Schedule Generator' })).toBeVisible();
        await expect(page.getByText('Schedule Configuration')).toBeVisible();

        // 1. Select Night (Tuesday)
        await page.locator('#night').selectOption('tuesday');

        // Verify Tuesday teams are auto-checked
        await expect(page.locator('#team-team-1')).toBeChecked();
        await expect(page.locator('#team-team-2')).toBeChecked();
        await expect(page.getByText('Selected: 2 teams')).toBeVisible();

        // 2. Select Start Date
        await page.locator('#startDate').fill('2026-06-02');

        // 3. Click Generate Preview
        const previewBtn = page.getByRole('button', { name: 'Generate Preview' });
        await expect(previewBtn).toBeEnabled();
        await previewBtn.click();

        // 4. Assert preview loads correctly
        await expect(page.getByRole('heading', { name: 'Schedule Preview' })).toBeVisible();
        await expect(page.locator('.preview-stats')).toContainText('1 total matches');
        await expect(page.locator('.matches-table')).toContainText('Team Aces');
        await expect(page.locator('.matches-table')).toContainText('Team Faults');

        // 5. Save the generated schedule
        const saveBtn = page.getByRole('button', { name: 'Save Schedule' });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        // 6. Assert success notification
        await expect(page.getByText('Schedule generated successfully!')).toBeVisible();
        
        // Assert modal goes back to configuration form
        await expect(page.getByRole('heading', { name: 'Schedule Configuration' })).toBeVisible();
    });
});
