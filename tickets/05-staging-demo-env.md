# Ticket: Staging & Demo Environment Setup

## Why (Product Goal & Value)
Before rolling out new versions or onboarding captains, stakeholders want a sandbox filled with mock teams, matches, and players to play with the UI. Staging also prevents manual database testing on live tables, which runs the risk of corrupting real season standings or league archives.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Database Seed Script
We will create a robust `seed.sql` script containing PostgreSQL statements to construct a mock season.
*   **Path:** `supabase/seed.sql`
*   **Contents:**
    *   Initialize one Season (e.g. `2026 Season`).
    *   Create 6 Mock Teams with numbers 1 to 6.
    *   Insert 42 Mock Players (7 per team), setting 1 captain per team.
    *   Generate a full schedule of 5 weeks of matches (Tuesday/Wednesday play nights).
    *   Generate mock score entries for completed matches (weeks 1-3) and leave weeks 4-5 open.

### 2. Secondary Supabase Project ("LTTA - Staging")
1.  Initialize a new project in the Supabase Dashboard named "LTTA - Staging".
2.  Deploy the schema migrations to the staging project:
    ```bash
    supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
    ```
3.  Inject the seed data into the database:
    ```bash
    psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -f supabase/seed.sql
    ```

### 3. Frontend Staging Deployment & Configuration
*   We will deploy the staging app to Netlify or Vercel (e.g., linked to the `staging` git branch).
*   Create a `.env.staging` file which contains target parameters pointing to the Staging Supabase URL and Staging Anon Key.
*   Ensure that the staging builds use these environment variables.

---

## Step-by-Step Code Walkthrough for the Intern
1.  **Write `supabase/seed.sql`:**
    Make sure to write realistic insert queries that link everything properly using UUIDs.
    ```sql
    -- Insert a season
    INSERT INTO public.season (id, name, start_date, end_date)
    VALUES ('s1-uuid', 'Staging Season 2026', '2026-05-01', '2026-08-31');

    -- Insert a team
    INSERT INTO public.team (id, number, name, play_night)
    VALUES ('team-1', 1, 'Baseline Ballers', 'Tuesday');

    -- Insert a captain
    INSERT INTO public.player (id, first_name, last_name, email, is_captain, is_admin)
    VALUES ('capt-1', 'John', 'Doe', 'john.doe@example.com', true, false);

    -- Link captain to team
    INSERT INTO public.player_to_team (player, team, status)
    VALUES ('capt-1', 'team-1', 'active');
    ```
2.  **Add build scripts to `package.json`:**
    Add a command to load the staging database:
    ```json
    "db:staging:reset": "psql $STAGING_DB_URL -f supabase/seed.sql"
    ```

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [smoke.spec.js](file:///home/brett/Code/ltta/tests/e2e/smoke.spec.js)
2.  **Verification:**
    *   Confirm that compiling the staging environment displays a prominent header banner: "DEMO MODE - Using Simulated Staging Data".
    *   Verify the seed script runs cleanly on a blank database without foreign key constraint errors.

---

## Potential Gotchas & Intern Traps
*   **UUID Collisions:** When writing the seed script, ensure you don't hardcode duplicate primary keys. Using deterministic UUIDs is fine, but double check relationships.
*   **RLS Policies & Seed Script:** RLS policies might prevent normal users from running seed operations. Make sure seed queries run with `postgres` superuser privileges, not anonymized client connections.
