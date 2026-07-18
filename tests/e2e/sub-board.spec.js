import { test, expect } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

test.describe('Sub Board @live', () => {

    test.describe('Player View', () => {
        test('Player can see open requests', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page);
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await expect(page.getByRole('heading', { name: 'Sub Board' })).toBeVisible();
        });

        test('Request cards are visible for players', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page);
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            const cards = page.locator('.request-card');
            await expect(cards.first()).toBeVisible({ timeout: 10000 });
        });

        test('Player profile card shows name and rating', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { first_name: 'Jane', last_name: 'Player', is_captain: false });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            const profileCard = page.locator('.player-profile-card');
            await expect(profileCard).toBeVisible({ timeout: 10000 });
            await expect(profileCard).toContainText('Jane Player');
            await expect(profileCard).toContainText('Rating: 3.0');
        });
    });

    test.describe('Captain View', () => {
        test('Captain can see My Requests tab', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { is_captain: true, first_name: 'Captain', last_name: 'User' });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await expect(page.getByRole('button', { name: 'Available Requests' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'My Requests' })).toBeVisible();
        });

        test('Captain can open create sub request form', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { is_captain: true, first_name: 'Captain', last_name: 'User' });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await page.getByRole('button', { name: 'My Requests' }).click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '+ Create New Sub Request' }).click();
            await expect(page.getByRole('heading', { name: 'Create Sub Request' })).toBeVisible({ timeout: 10000 });
        });

        test('Captain form auto-fills team when single team assigned', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { is_captain: true, first_name: 'Captain', last_name: 'User' });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await page.getByRole('button', { name: 'My Requests' }).click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '+ Create New Sub Request' }).click();
            const teamSelect = page.locator('.sub-request-form select').first();
            await expect(teamSelect).toBeVisible({ timeout: 10000 });
            await expect(teamSelect).toHaveValue('t1');
        });

        test('Captain form auto-fills rating from profile', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { is_captain: true, first_name: 'Captain', last_name: 'User' });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await page.getByRole('button', { name: 'My Requests' }).click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '+ Create New Sub Request' }).click();
            const rankingSelect = page.getByTestId('ranking-select');
            await expect(rankingSelect).toBeVisible({ timeout: 10000 });
            await expect(rankingSelect).toHaveValue('3');
        });

        test('Captain sees match quick-suggestions', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { is_captain: true, first_name: 'Captain', last_name: 'User' });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await page.getByRole('button', { name: 'My Requests' }).click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '+ Create New Sub Request' }).click();
            await expect(page.locator('.match-suggestions')).toBeVisible({ timeout: 10000 });
        });

        test('Clicking match suggestion auto-fills date, time, and location', async ({ page }) => {
            await disableNavigatorLocks(page);
            await mockSupabaseAuth(page, { is_captain: true, first_name: 'Captain', last_name: 'User' });
            await page.goto('/sub-board');
            await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 15000 });
            await page.getByRole('button', { name: 'My Requests' }).click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '+ Create New Sub Request' }).click();
            const firstSuggestion = page.locator('.match-suggestion-btn').first();
            await expect(firstSuggestion).toBeVisible({ timeout: 10000 });
            await firstSuggestion.click();
            const todayStr = new Date().toISOString().split('T')[0];
            await expect(page.getByTestId('match-date-input')).toHaveValue(todayStr);
            await expect(page.getByTestId('match-time-input')).toHaveValue('18:00');
            await expect(page.getByTestId('location-select')).toHaveValue('loc-1');
        });
    });
});
