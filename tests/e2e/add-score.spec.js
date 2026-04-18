import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Add Score Page (Protected)', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: ${exception}`));

    // 1. Mock Auth (User Login)
    await mockSupabaseAuth(page, {
        id: 'fake-user-id',
        email: 'test@example.com',
        is_captain: true,
        is_admin: true
    });
  });

  test('loads and allows match selection', async ({ page }) => {
    await page.goto('/add-score');

    // Select match
    await page.selectOption('select[name="matchId"]', 'm1-uuid');
    
    // Check if match details show up in the dropdown selection
    const matchSelect = page.locator('select[name="matchId"]');
    await expect(matchSelect).toHaveValue('m1-uuid');
    
    // The Line switcher buttons should be visible (target the button specifically)
    await expect(page.getByRole('button', { name: 'Line 1' })).toBeVisible();
  });

  test('validates invalid tennis scores', async ({ page }) => {
    await page.goto('/add-score');

    // Select match
    await page.selectOption('select[name="matchId"]', 'm1-uuid');
    
    // Select match type
    await page.locator('select[name="matchType"]').selectOption('singles');

    // DO NOT select players
    
    // Set some scores
    const set1Home = page.locator('.score-group').nth(0).locator('select').nth(0);
    const set1Away = page.locator('.score-group').nth(0).locator('select').nth(1);
    
    await set1Home.selectOption({ label: '6' });
    await set1Away.selectOption({ label: '0' });

    // Try to submit
    await page.getByRole('button', { name: 'Save Line Results' }).click();

    // Check for validation message (missing players)
    const errorMsg = page.locator('.error-message');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    await expect(errorMsg).toContainText(/Select at least one player/i);
  });

  test('validates unique players', async ({ page }) => {
     await page.goto('/add-score');

     // Select match
     await page.selectOption('select[name="matchId"]', 'm1-uuid');
     
     // Select match type
     await page.locator('select[name="matchType"]').selectOption('singles');

     // Select same player for both sides
     const homePlayer1 = page.locator('select').filter({ hasText: 'Player 1' }).nth(0);
     const awayPlayer1 = page.locator('select').filter({ hasText: 'Player 1' }).nth(1);

     await homePlayer1.selectOption('Test User');
     await awayPlayer1.selectOption('Test User'); // Duplicate player

     // Fill required scores (can be valid)
     const set1Home = page.locator('.score-group').nth(0).locator('select').nth(0);
     const set1Away = page.locator('.score-group').nth(0).locator('select').nth(1);
     await set1Home.selectOption('6');
     await set1Away.selectOption('0');
     
     const set2Home = page.locator('.score-group').nth(1).locator('select').nth(0);
     const set2Away = page.locator('.score-group').nth(1).locator('select').nth(1);
     await set2Home.selectOption('6');
     await set2Away.selectOption('0');

     await page.getByRole('button', { name: 'Save Line Results' }).click();
     await expect(page.locator('.error-message')).toContainText(/Players cannot appear on both sides/);
  });

});
