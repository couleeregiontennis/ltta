# Ticket: Standings Calculation Transparency

## Why (Product Goal & Value)
Tennis standings are determined by a hierarchical series of tie-breakers: total matches won, head-to-head records, sets won percentage, and games won percentage. When teams have identical records, they are often confused about why they are ranked higher or lower than another team. This ticket introduces a clear rules breakdown and hoverable tooltips directly on the Standings screen.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Standings Data Enhancement
*   We must ensure the frontend has access to the tie-breaker metrics (Match Wins, Head-to-Head record, Set %, Game %).
*   **Source View:** `standings_2026_view` already compiles:
    *   `matches_played`
    *   `matches_won`
    *   `sets_won`
    *   `sets_lost`
    *   `games_won`
    *   `games_lost`
*   In the React view, we will compute and display the set percentage ($Sets Won / Total Sets$) and game percentage ($Games Won / Total Games$) as columns.

### 2. Tooltips & Legend Details
*   **File to Modify:** [Standings.jsx](file:///home/brett/Code/ltta/src/components/Standings.jsx)
*   **Column Tooltips:**
    *   **MW (Match Wins):** "Total matches won. The primary factor in standings."
    *   **Sets %:** "Sets Won / (Sets Won + Sets Lost). Used as the second tie-breaker."
    *   **Games %:** "Games Won / (Games Won + Games Lost). Used as the third tie-breaker."
*   **Tie-Breaker Rule Legend:**
    Add an informational card below the Standings table explaining the hierarchy:
    1.  **Match Wins:** Most wins ranks highest.
    2.  **Head-to-Head:** If two teams are tied, the winner of their head-to-head match ranks higher.
    3.  **Sets %:** If still tied, the team with the higher sets won percentage ranks higher.
    4.  **Games %:** If still tied, the team with the higher games won percentage ranks higher.

### 3. Step-by-Step Code Walkthrough for the Intern
1.  **Install Tooltip Library or Use Vanilla CSS:**
    Instead of installing heavy external packages, create a reusable tooltipped CSS wrapper:
    ```css
    .tooltip-container {
      position: relative;
      cursor: help;
      border-bottom: 1px dotted var(--text-color);
    }
    .tooltip-text {
      visibility: hidden;
      position: absolute;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--card-bg-secondary);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      width: 200px;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .tooltip-container:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
    ```
2.  **Add Columns and Render Tooltips in `Standings.jsx`:**
    ```jsx
    <thead>
      <tr>
        <th>Rank</th>
        <th>Team Name</th>
        <th>
          <div className="tooltip-container">
            MW
            <span className="tooltip-text">Match Wins: Total wins in the season</span>
          </div>
        </th>
        <th>
          <div className="tooltip-container">
            Sets %
            <span className="tooltip-text">Sets Won / Total Sets Played. Tiebreaker #2</span>
          </div>
        </th>
        {/* Games % ... */}
      </tr>
    </thead>
    ```

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [standings-persistence.spec.js](file:///home/brett/Code/ltta/tests/e2e/standings-persistence.spec.js)
2.  **Mocks:** Feed two teams with identical Match Wins but different Sets %.
3.  **UI Verification:**
    *   Verify the team with the higher Sets % is ranked higher.
    *   Ensure the tooltips appear when hovering over the table headers.
    *   Confirm the legend box is visible and legible in both light and dark modes.

---

## Potential Gotchas & Intern Traps
*   **Division by Zero:** If a team has played 0 matches, calculating set percentage ($0 / 0$) will output `NaN`. Ensure you handle this case:
    ```javascript
    const setRatio = totalSets > 0 ? (setsWon / totalSets) * 100 : 0;
    ```
*   **Responsive Width:** Standings tables are prone to overflowing on mobile screens. Wrap the standings table in a responsive div (`overflow-x: auto`) and verify that the tooltips do not clip off-screen.
