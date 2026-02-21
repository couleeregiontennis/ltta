# LTTA Feature Roadmap

This document outlines planned features and enhancements for the Coulee Region Tennis Association application based on product planning discussions.

## Planned Features

### 1. The "Sub Board" (Substitute Player Management)
*   **Problem:** Captains struggle to find substitute players when team members are unavailable.
*   **Solution:** A streamlined system for Captains to broadcast a need for a sub and for eligible registered players to claim the open spot.
*   **Key Requirements:**
    *   Ability to specify match details (date, time, location, required skill level).
    *   Notification system (or view) for available players.
    *   Mechanism for players to accept the request.

### 2. Rainout & "No Reschedule" Handling
*   **Problem:** The league has a strict "No Reschedule" policy for rainouts, which needs to be clearly communicated to prevent player confusion.
*   **Solution:** Improve UI to handle and clearly communicate canceled matches.
*   **Key Requirements:**
    *   Admin/Captain ability to mark a match as "Rained Out" (Canceled).
    *   Clear visual indicator on the `MatchSchedule` page for these matches.
    *   Ensure rained-out matches do not negatively impact standings.
    *   Prominent display of the "No Reschedule" policy throughout the app (e.g., on the `Rules` page or a schedule banner).

### 3. Score Flagging & Dispute Resolution
*   **Problem:** Accidental incorrect score entries need a correction workflow to maintain Standings integrity.
*   **Solution:** Allow players to flag questionable scores for review.
*   **Key Requirements:**
    *   A "Flag Score" button on the `MatchSchedule` or `Standings` views.
    *   Status tracking for matches (e.g., pending, verified, disputed).
    *   Alert system for Admins and involved Captains to resolve the dispute via the `AddScore` component.

## Recently Completed / In Progress

*   **Player Skill Level Feedback System:** Add a restricted form for Captains/players to report rating inaccuracies. Integrate this data into the `PlayerManagement` admin screen as a "Rating Reviews" tab, allowing Admins to adjust self-ratings.
*   **New Player Onboarding Flow:** Force a "Welcome" or "Complete Profile" check upon first login for incomplete user profiles, redirecting to `PlayerProfile` setup.

## Usability & Workflow Improvements



### 5. Standings Calculation Transparency
*   **Problem:** Players may not understand complex tennis tie-breaker rules (H2H, Sets, Games), leading to confusion over standings.
*   **Solution:** Add explicit informational text/tooltips explaining the exact math.
*   **Key Requirements:**
    *   Ensure calculation logic perfectly matches CRTA official rules.
    *   Add a UI tooltip or legend below the `Standings` table explaining the tie-breaker hierarchy.

### 6. Mobile Optimization for Score Entry
*   **Problem:** The `AddScore` component is heavily used on mobile devices court-side, making standard text inputs prone to "fat-finger" errors.
*   **Solution:** Overhaul the `AddScore` form specifically for mobile viewports.
*   **Key Requirements:**
    *   Convert standard text inputs to large, tap-friendly number dials, specific `type="number"` inputs, or dropdowns.
    *   Ensure the transition between sets and tiebreakers is intuitive on small screens.

*Note: The "Reliability Metric" was discussed but intentionally excluded from the roadmap per user request.*
