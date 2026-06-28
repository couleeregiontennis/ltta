import { test, expect } from '@playwright/test';
import { disableNavigatorLocks, mockSupabaseAuth } from '../utils/auth-mock';

test.describe('Add Score Page (New) @live', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.error(`BROWSER EXCEPTION: ${err.message}\nStack: ${err.stack}`);
      throw err;
    });
  });

  test('loads and allows match selection', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
        id: 'cap-id', 
        is_captain: true,
        first_name: 'Test',
        last_name: 'Captain'
    });

    await page.goto('/add-score');
    
    // Ensure the loading indicator clears
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });
    
    // Check for correct heading
    await expect(page.locator('h1')).toContainText('Submit Match Scores');
    
    const matchSelect = page.locator('select[name="matchId"]');
    await expect(matchSelect).toBeVisible({ timeout: 10000 });
    
    // Select option (match-1 is default from auth-mock.js)
    await matchSelect.selectOption('match-1');
    
    // Verify match details appeared
    await expect(page.locator('body')).toContainText('Home Team');
  });

  test('loads score page for non-team/admin users successfully via URL prefill', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
        id: 'admin-id', 
        is_captain: false,
        is_admin: true,
        first_name: 'Test',
        last_name: 'Admin'
    });

    // Mock empty team assignments for this admin user
    await page.route('**/rest/v1/player_to_team*', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]' // empty array - no team link
        });
      }
      return route.continue();
    });

    // Go to add-score page directly with prefill matchId
    await page.goto('/add-score?matchId=match-1');
    
    // Ensure the loading indicator clears
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });
    
    // Expect score submission interface elements to be visible for the prefilled match
    await expect(page.locator('h1')).toContainText('Submit Match Scores');
    await expect(page.locator('body')).toContainText('Home Team');
    await expect(page.locator('body')).toContainText('Away Team');
  });

  test('regression: navigating back to schedule from score page does not render empty matches list', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
        id: 'cap-id', 
        is_captain: true,
        first_name: 'Test',
        last_name: 'Captain'
    });

    // Navigate to add-score page first
    await page.goto('/add-score?matchId=match-1');
    await expect(page.locator('h1')).toContainText('Submit Match Scores');

    // Find and click the navbar brand/logo or home button to go back to schedule (/)
    const homeLink = page.locator('a.navbar-brand, a:has-text("LTTA"), a[href="/"]');
    await homeLink.first().click();

    // Verify we land on schedule page and it loads the match card successfully instead of showing empty state
    await expect(page.locator('h1')).toContainText('Match Schedule');
    await expect(page.locator('.match-card').first()).toBeVisible({ timeout: 15000 });
  });

  test('supports selecting substitutes, displays progress, and checkmarks completed lines', async ({ page }) => {
    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
        id: 'cap-id', 
        is_captain: true,
        first_name: 'Test',
        last_name: 'Captain'
    });

    // Mock initial existing scores to be Court 1 (recorded)
    await page.route('**/rest/v1/line_results*', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'score-1',
              match_id: 'match-1',
              line_number: 1,
              match_type: 'doubles',
              home_player_1_id: 'p1',
              home_player_2_id: 'p2',
              away_player_1_id: 'p3',
              away_player_2_id: 'p4',
              home_set_1: 6,
              away_set_1: 4,
              home_set_2: 6,
              away_set_2: 4,
              home_won: true
            }
          ])
        });
      }
      return route.continue();
    });

    await page.goto('/add-score?matchId=match-1');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });

    // Verify progress bar is visible and says "1 of 4"
    const progressContainer = page.locator('.score-progress-container');
    await expect(progressContainer).toBeVisible();
    await expect(progressContainer).toContainText('1 of 4');

    // Verify Court 1 button has a checkmark (or is completed)
    const court1Btn = page.locator('.line-switcher-button', { hasText: 'Court 1' });
    await expect(court1Btn).toContainText('✓');

    // Verify player dropdown contains optgroup with substitutes
    const homePlayer1Select = page.locator('.form-group:has-text("Home Players") select').first();
    await expect(homePlayer1Select).toBeVisible();

    // Check if the optgroup is present
    const optgroup = homePlayer1Select.locator('optgroup[label="Subs / Other Players"]');
    await expect(optgroup).toBeAttached();

    // Verify we can see the mock sub names
    const subOption = optgroup.locator('option[value="Sub One"]');
    await expect(subOption).toBeAttached();
  });

  test('records score via voice and parses with AI', async ({ page }) => {
    // 1. Inject Mock SpeechRecognition before navigation
    await page.addInitScript(() => {
      class MockSpeechRecognition {
        constructor() {
          this.continuous = false;
          this.interimResults = false;
          this.lang = 'en-US';
        }
        start() {
          if (this.onstart) this.onstart();
          setTimeout(() => {
            if (this.onresult) {
              const event = {
                resultIndex: 0,
                results: [
                  [
                    { transcript: 'Court 2 doubles, we won 6-4, 3-6, 10-8' }
                  ]
                ]
              };
              event.results[0].isFinal = true;
              this.onresult(event);
            }
            if (this.onend) this.onend();
          }, 100);
        }
        stop() {
          if (this.onend) this.onend();
        }
      }
      window.SpeechRecognition = MockSpeechRecognition;
      window.webkitSpeechRecognition = MockSpeechRecognition;
    });

    await disableNavigatorLocks(page);
    await mockSupabaseAuth(page, { 
      id: 'cap-id', 
      is_captain: true,
      first_name: 'Test',
      last_name: 'Captain'
    });

    // 2. Mock Edge Function API call
    let edgeFunctionCalled = false;
    await page.route('**/functions/v1/parse-score', async (route) => {
      expect(route.request().method()).toBe('POST');
      const payload = JSON.parse(route.request().postData());
      expect(payload.transcript).toBe('Court 2 doubles, we won 6-4, 3-6, 10-8');
      edgeFunctionCalled = true;

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          lineNumber: 2,
          matchType: 'doubles',
          homeSet1: 6,
          awaySet1: 4,
          homeSet2: 3,
          awaySet2: 6,
          homeSet3: 10,
          awaySet3: 8,
          notes: 'Spoken via voice'
        })
      });
    });

    // 3. Go to Add Score page
    await page.goto('/add-score?matchId=match-1');
    await expect(page.locator('body')).not.toContainText('Loading...', { timeout: 20000 });

    // 4. Click the voice record button
    const recordBtn = page.locator('button:has-text("Record Score")');
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // 5. Verify the transcript display is visible
    await expect(page.locator('.voice-transcript-box')).toContainText('Court 2 doubles, we won 6-4, 3-6, 10-8');

    // 6. Verify that it switched to Court 2
    const activeCourtBtn = page.locator('.line-switcher-button.is-active');
    await expect(activeCourtBtn).toContainText('Court 2');

    // 7. Verify the scores have been filled correctly
    const homeSet1Select = page.locator('.score-group:has-text("Set 1") select').nth(0);
    const awaySet1Select = page.locator('.score-group:has-text("Set 1") select').nth(1);
    const homeSet2Select = page.locator('.score-group:has-text("Set 2") select').nth(0);
    const awaySet2Select = page.locator('.score-group:has-text("Set 2") select').nth(1);
    const homeSet3Select = page.locator('.score-group:has-text("Tiebreak") select').nth(0);
    const awaySet3Select = page.locator('.score-group:has-text("Tiebreak") select').nth(1);
    
    await expect(homeSet1Select).toHaveValue('6');
    await expect(awaySet1Select).toHaveValue('4');
    await expect(homeSet2Select).toHaveValue('3');
    await expect(awaySet2Select).toHaveValue('6');
    await expect(homeSet3Select).toHaveValue('10');
    await expect(awaySet3Select).toHaveValue('8');

    // Winner radio check
    const winnerHomeRadio = page.locator('input[name="winner"][value="home"]');
    await expect(winnerHomeRadio).toBeChecked();

    expect(edgeFunctionCalled).toBe(true);
  });
});
