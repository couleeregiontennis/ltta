import { test } from '@playwright/test';
import { mockSupabaseAuth, disableNavigatorLocks } from '../utils/auth-mock';

const ROUTES = [
  { name: 'match-schedule', path: '/?date=2023-09-30' }, // Specific date with seed data
  { name: 'standings', path: '/standings' },
  { name: 'player-profile', path: '/player-profile' },
  { name: 'captain-dashboard', path: '/captain-dashboard', role: 'captain' },
  { name: 'add-score', path: '/add-score', role: 'captain' },
  { name: 'player-resources', path: '/player-resources' },
  { name: 'onboarding-wizard', path: '/welcome', role: 'new-user' },
  { name: 'update-password', path: '/update-password', role: 'player' },
];

test.describe('UX Audit Capture', () => {
  for (const route of ROUTES) {
    test(`capture ${route.name}`, async ({ page }) => {
      // Mock auth based on required role
      let userDetails;
      if (route.role === 'captain') {
        userDetails = { id: 'captain-user-id', email: 'captain@ltta.com' };
      } else if (route.role === 'new-user') {
        userDetails = { id: 'new-user-id', email: 'new@ltta.com' };
      } else {
        userDetails = { id: 'player-user-id', email: 'player@ltta.com' };
      }
      
      await mockSupabaseAuth(page, userDetails);
      
      // Mock player and team data for role-based pages
      if (route.role === 'captain') {
        await page.route(/\/rest\/v1\/player($|\?)/, async (r) => {
          if (r.request().method() === 'GET') {
            await r.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify([{
                id: 'captain-user-id',
                user_id: 'captain-user-id',
                is_captain: true,
                is_admin: true,
                first_name: 'Test',
                last_name: 'Captain'
              }]),
            });
          } else {
            await r.continue();
          }
        });

        await page.route('**/rest/v1/player_to_team*', async (r) => {
           await r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ team: 'team-id-123' }]),
          });
        });

        await page.route(/\/rest\/v1\/team($|\?)/, async (r) => {
           await r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{
              id: 'team-id-123',
              number: 1,
              name: 'Aces',
              play_night: 'Tuesday'
            }]),
          });
        });
      }

      if (route.role === 'new-user') {
        await page.route(/\/rest\/v1\/player($|\?)/, async (r) => {
          const method = r.request().method();
          const accept = r.request().headers()['accept'] || '';
          
          if (method === 'GET') {
            if (accept.includes('vnd.pgrst.object')) {
              await r.fulfill({
                status: 406,
                contentType: 'application/json',
                body: JSON.stringify({ code: "PGRST116", message: "Not Found" }),
              });
            } else {
              await r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            }
          } else {
            await r.continue();
          }
        });
      }

      await page.goto(route.path);
      
      // Wait for content to load
      await page.waitForTimeout(2000); // Wait for animations/transitions

      // Take desktop screenshot
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.screenshot({ 
        path: `verification/ux-audit/${route.name}-desktop.png`, 
        fullPage: true 
      });

      // Take mobile screenshot
      await page.setViewportSize({ width: 375, height: 812 });
      await page.screenshot({ 
        path: `verification/ux-audit/${route.name}-mobile.png`, 
        fullPage: true 
      });
    });
  }
});
