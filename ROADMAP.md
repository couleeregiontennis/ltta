# Future Features & Roadmap

## Playoff Scenarios ("The Path to Victory")
*   **Goal:** Tell teams exactly what needs to happen for them to win/clinch.
*   **Logic:**
    *   Calculate "Magic Number" (wins needed to clinch).
    *   Simulate remaining matches based on win percentages.
    *   Determine status: "Clinched", "Control Destiny", "On the Hunt", "Eliminated".
*   **Implementation:**
    *   Use `standings_view` data.
    *   Ideally use a Supabase Edge Function for the math.
    *   Display on the Standings page.

## Automated Notifications
*   **Goal:** Alert users immediately when there are disputes, score flags, or sub requests.
*   **Implementation:**
    *   Use Supabase Webhooks or Edge Functions triggered by database inserts/updates.
    *   Integrate with an email provider (e.g., Resend) or SMS service.

## Player Registration & Payment Integration
*   **Goal:** Allow players to register for upcoming seasons and pay their dues directly through the platform.
*   **Implementation:**
    *   Stripe integration for payment processing.
    *   New database tables for `registrations` and `payments`.
    *   Admin dashboard for tracking registration status.

## Staging & Demo Environment
*   **Goal:** Provide a safe, isolated clone of the application filled with fake data for stakeholders, QA, and potential users to test without altering real production data.
*   **Implementation:**
    *   Create a secondary Supabase project ("LTTA - Staging").
    *   Develop a `seed.sql` script to generate realistic fake matches, teams, and players.
    *   Deploy a separate frontend instance (e.g., `demo.couleeregiontennis.org`) pointed to the staging database.
