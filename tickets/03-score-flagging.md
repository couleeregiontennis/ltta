# Ticket: Score Flagging & Dispute Resolution

## Why (Product Goal & Value)
If a team captain enters a score incorrectly (e.g. swap winner/loser or typo a set score), it immediately updates the standings. To prevent wrong scores from corrupting league standings, we need a dispute resolution flow. This ticket allows captains to flag a score, which changes the match status to `disputed` and freezes its standings impact until an admin or both captains reconcile it.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Schema Modifications
The `team_match` table needs a `status` column supporting the state `disputed` and an `is_disputed` boolean, plus tracking for dispute details:
```sql
ALTER TABLE public.team_match 
    ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'played', 'disputed', 'rained_out')),
    ADD COLUMN is_disputed BOOLEAN DEFAULT false,
    ADD COLUMN dispute_reason TEXT,
    ADD COLUMN dispute_reported_by UUID REFERENCES public.player(id);
```

### 2. Frontend UI updates (Match Cards)
*   **File to Modify:** [MatchSchedule.jsx](file:///home/brett/Code/ltta/src/components/MatchSchedule.jsx)
*   **Action:**
    *   For matches in the past that have a score entered (i.e. played), display a "Flag Score" button if the logged-in user is a captain of one of the competing teams.
    *   Clicking this button displays a modal prompt asking for the dispute reason.
*   **File to Modify:** [CaptainDashboard.jsx](file:///home/brett/Code/ltta/src/components/CaptainDashboard.jsx)
    *   Add a section "Disputed Matches" listing any matches where `is_disputed = true` and the captain's team is involved.
*   **File to Modify:** [AddScore.jsx](file:///home/brett/Code/ltta/src/components/AddScore.jsx)
    *   Allow captains to resolve the dispute by overwriting the scores, which resets `is_disputed` to `false` and status to `played`.

### 3. Step-by-Step Code Walkthrough for the Intern
1.  **Expose Flagging API Call:**
    In [MatchSchedule.jsx](file:///home/brett/Code/ltta/src/components/MatchSchedule.jsx), write a function `flagMatchScore`:
    ```javascript
    const flagMatchScore = async (matchId, reason) => {
      const { error } = await supabase
        .from('team_match')
        .update({
          status: 'disputed',
          is_disputed: true,
          dispute_reason: reason,
          dispute_reported_by: currentPlayer.id
        })
        .eq('id', matchId);

      if (error) {
        showToast('Error flagging match: ' + error.message, 'error');
      } else {
        showToast('Match flagged for review. Standings will freeze for this match.', 'success');
        refreshMatches();
      }
    };
    ```
2.  **Verify Standings Math Excludes Disputed Matches:**
    Ensure the `standings_view` calculations on the database exclude any matches where `status = 'disputed'`.
    Update the database View definition:
    ```sql
    CREATE OR REPLACE VIEW standings_2026_view AS
    SELECT ...
    FROM team_match
    WHERE status = 'played' -- Exclude 'disputed' and 'scheduled' and 'rained_out'
    ```

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [score-flagging.spec.js](file:///home/brett/Code/ltta/tests/e2e/score-flagging.spec.js)
2.  **Mocks:** Return a played match, mock user as captain.
3.  **UI Verification:**
    *   Check that "Flag Score" button is visible only to the participating team captains.
    *   Check that clicking the button opening the modal, inputting a reason, and saving successfully updates the database row.
    *   Ensure the Standings view hides/excludes this match's points until resolved.

---

## Potential Gotchas & Intern Traps
*   **Security Bypass:** Ensure there is a Supabase RLS policy or client-side check verifying that the player requesting the dispute is actually a captain of either the `home_team` or `away_team` in that match record. Do not trust user IDs passed blindly.
*   **Standings Rerender:** Once a match is flagged, the standings page must immediately reflect the subtracted points. Keep the state updated.
