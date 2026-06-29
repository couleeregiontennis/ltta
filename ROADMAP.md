# LTTA Feature Roadmap

This document outlines planned features and enhancements for the Coulee Region Tennis Association application based on product planning discussions.

## Planned Features

### 1. Playoff Scenarios ("The Path to Victory")
*   **Goal:** Tell teams exactly what needs to happen for them to win/clinch.
*   **Logic:**
    *   Calculate "Magic Number" (wins needed to clinch).
    *   Simulate remaining matches based on win percentages.
    *   Determine status: "Clinched", "Control Destiny", "On the Hunt", "Eliminated".
*   **Implementation:**
    *   Use `standings_view` data.
    *   Ideally use a Supabase Edge Function for the math.
    *   Display on the Standings page.

### 2. Automated Notifications
*   **Goal:** Alert users immediately when there are disputes, score flags, sub requests, team join requests, and captain invitations.
*   **Implementation:**
    *   Use Supabase Webhooks or Edge Functions triggered by database inserts/updates.
    *   Integrate with an email provider (e.g., Resend) or SMS service.

### 3. Score Flagging & Dispute Resolution
*   **Problem:** Accidental incorrect score entries need a correction workflow to maintain Standings integrity.
*   **Solution:** Allow players to flag questionable scores for review.
*   **Key Requirements:**
    *   A "Flag Score" button on the `MatchSchedule` or `Standings` views.
    *   Status tracking for matches (e.g., pending, verified, disputed).
    *   Alert system for Admins and involved Captains to resolve the dispute via the `AddScore` component.

### 4. Player Registration & Payment Integration
*   **Goal:** Allow players to register for upcoming seasons and pay their dues directly through the platform.
*   **Implementation:**
    *   Stripe integration for payment processing.
    *   New database tables for `registrations` and `payments`.
    *   Admin dashboard for tracking registration status.

### 5. Staging & Demo Environment
*   **Goal:** Provide a safe, isolated clone of the application filled with fake data for stakeholders, QA, and potential users to test without altering real production data.
*   **Implementation:**
    *   Create a secondary Supabase project ("LTTA - Staging").
    *   Develop a `seed.sql` script to generate realistic fake matches, teams, and players.
    *   Deploy a separate frontend instance (e.g., `demo.couleeregiontennis.org`) pointed to the staging database.

### 6. Standings Calculation Transparency
*   **Problem:** Players may not understand complex tennis tie-breaker rules (H2H, Sets, Games), leading to confusion over standings.
*   **Solution:** Add explicit informational text/tooltips explaining the exact math.
*   **Key Requirements:**
    *   Ensure calculation logic perfectly matches CRTA official rules.
    *   Add a UI tooltip or legend below the `Standings` table explaining the tie-breaker hierarchy.

### 8. Admin Team Management
*   **Problem:** The `/admin/team-management` route is currently a placeholder saying "Team Management (Coming Soon)". Admins need a interface to assign players to teams, edit team numbers/names, and configure team play nights.
*   **Key Requirements:**
    *   Implement roster editing (add/remove players from a team).
    *   Implement team details editing (number, name, night of play).
    *   Secure access so only admins can view or edit.

### 9. Real-time Rainout Alerts
*   **Problem:** Players and captains need immediate notification when matches are rained out to avoid traveling to courts.
*   **Key Requirements:**
    *   Extend the existing rainout system to trigger automated SMS broadcasts.
    *   Broadcast to active captains and players scheduled for the canceled matches.
    *   Integrate with an SMS gateway (e.g. Twilio via Supabase Edge Function).

### 10. Offline Mode for Score Entry
*   **Problem:** Court-side cellular connection can be spotty or non-existent, causing captain score submissions to fail and frustrating users.
*   **Key Requirements:**
    *   Add service worker caching or IndexedDB/localStorage fallback to save score drafts locally.
    *   Allow offline draft entry and validation in the UI.
    *   Automatically sync with Supabase once network connection is restored.

## Recently Completed / In Progress

*   **Rainout & "No Reschedule" Handling:** Improved UI to handle and clearly communicate canceled matches with prominent badges and a schedule banner. Admins and Captains can mark existing matches as "Rained Out".
*   **The "Sub Board" (Substitute Player Management):** System for Captains to broadcast a need for a sub and for eligible registered players to claim the open spot. Including match details and skill level requirements.
*   **Player Skill Level Feedback System:** Add a restricted form for Captains/players to report rating inaccuracies. Integrate this data into the `PlayerManagement` admin screen as a "Rating Reviews" tab, allowing Admins to adjust self-ratings.
*   **New Player Onboarding Flow:** Force a "Welcome" or "Complete Profile" check upon first login for incomplete user profiles, redirecting to `PlayerProfile` setup.

*Note: The "Reliability Metric" was discussed but intentionally excluded from the roadmap per user request.*
