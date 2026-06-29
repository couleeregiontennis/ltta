# Ticket: Playoff Scenarios ("The Path to Victory")

## Why (Product Goal & Value)
Captains and players want to know exactly what needs to happen for their team to clinch a spot in the playoffs. Without this, they must manually calculate standings, match records, and potential tie-breakers, which is complex and error-prone. This feature displays team statuses ("Clinched", "Control Destiny", "On the Hunt", or "Eliminated") directly on the Standings page.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Database & Edge Function Integration
We will calculate playoff math using a Supabase Edge Function to avoid bloating client-side logic.
*   **Edge Function Path:** `supabase/functions/playoff-scenarios/index.ts`
*   **Trigger:** Invoked via an HTTP POST request from the client when viewing the Standings page.
*   **Inputs:** `season_id`
*   **Outputs:** A JSON object mapping `team_id` to its playoff status and magic number details:
    ```json
    {
      "team-id-abc": {
        "status": "Clinched",
        "magicNumber": 0,
        "explanation": "Cannot fall below 4th place."
      },
      "team-id-xyz": {
        "status": "Control Destiny",
        "magicNumber": 2,
        "explanation": "2 wins out of 3 remaining matches guarantees a playoff spot."
      }
    }
    ```

### 2. Playoff Logic Math
For a league where the top `N` teams (e.g., top 4) make the playoffs:
1.  **Extract Current Record:** Query `standings_2026_view` to get wins ($W_i$) and losses ($L_i$) for each team.
2.  **Calculate Remaining Matches:** Find scheduled matches from `team_match` where `status = 'scheduled'`.
3.  **Worst-Case / Best-Case Scenarios:**
    *   **Clinched:** A team's worst possible final wins (current wins + 0 more) is greater than the best possible final wins of the $(N+1)$-th place team.
    *   **Control Destiny:** A team's current position is within the top $N$, and if they win their remaining matches, no combination of other results can drop them out.
    *   **On the Hunt:** The team is outside the top $N$ but can mathematically still reach the top $N$ if they win and other teams lose.
    *   **Eliminated:** Even if they win all remaining matches, they cannot reach the $N$-th place win threshold.

### 3. Frontend UI Updates
*   **File to Modify:** [Standings.jsx](file:///home/brett/Code/ltta/src/components/Standings.jsx)
*   **UI Changes:**
    *   Add a new column "Playoff Status" to the standings table.
    *   Render a badge representing the status:
        *   `Clinched`: Green badge.
        *   `Control Destiny`: Blue badge.
        *   `On the Hunt`: Yellow/orange badge.
        *   `Eliminated`: Gray badge.
    *   Hovering over the badge should display a tooltip explaining the math (e.g., "Magic Number: 2").

### 4. Step-by-Step Code Walkthrough for the Intern
1.  **Define the Edge Function:**
    Create `supabase/functions/playoff-scenarios/index.ts`. Use the Supabase client wrapper to query standings:
    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

    serve(async (req) => {
      const { season_id } = await req.json()
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      // 1. Fetch current standings
      const { data: standings } = await supabaseClient
        .from('standings_2026_view')
        .select('*')
      
      // 2. Perform playoff math...
      // 3. Return mapping of team_id -> status
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } })
    })
    ```
2.  **Call from React:**
    In [Standings.jsx](file:///home/brett/Code/ltta/src/components/Standings.jsx), execute the function call within a `useEffect` block when the season is loaded:
    ```javascript
    const fetchPlayoffs = async () => {
      const { data, error } = await supabase.functions.invoke('playoff-scenarios', {
        body: { season_id: currentSeason.id }
      });
      if (!error) setPlayoffData(data);
    };
    ```
3.  **Update Table rendering:**
    Inject the playoff status column directly to the right of the Team Name.

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [playoff-scenarios.spec.js](file:///home/brett/Code/ltta/tests/e2e/playoff-scenarios.spec.js)
2.  **Mocks:** Intercept `/functions/v1/playoff-scenarios` and return mock statuses.
3.  **UI Verification:**
    *   Verify that badges display the correct colors (`Clinched` is green, `Eliminated` is gray).
    *   Ensure tooltips display on hover.
    *   Verify the page behaves correctly and does not crash when the edge function returns an empty set or error.

---

## Potential Gotchas & Intern Traps
*   **Supabase Edge Function Local Development:** To test this locally, you must run `supabase start` and invoke using the local URL or use `supabase functions serve`.
*   **RLS (Row Level Security):** The edge function uses the `service_role` key or executes queries on behalf of the user. Ensure user JWT is forwarded in headers if needed.
*   **Loading State Sync:** Standings data might load before the playoff scenarios fetch completes. Ensure a skeleton or localized loading spinner is placed in the playoff status column so the layout doesn't jump.
