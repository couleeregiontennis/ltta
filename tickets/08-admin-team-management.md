# Ticket: Admin Team Management

## Why (Product Goal & Value)
The `/admin/team-management` route is currently a static placeholder displaying "Team Management (Coming Soon)". When players register, admins need a centralized dashboard to group players into teams, assign captains, modify team names, and set play nights (Tuesdays vs. Wednesdays). Without this, admins must edit PostgreSQL tables directly in the Supabase Dashboard, which is dangerous.

---

## Technical Architecture & Implementation Plan ("How")

### 1. File Structure
*   Create a new file: `src/components/admin/TeamManagement.jsx`
*   Register it in [App.jsx](file:///home/brett/Code/ltta/src/App.jsx) (replace the placeholder route).

### 2. Database Queries
This panel needs to execute four major operations:
1.  **List Teams:** `SELECT * FROM public.team ORDER BY number ASC`
2.  **List Team Rosters:** `SELECT ptt.*, p.* FROM public.player_to_team ptt JOIN public.player p ON ptt.player = p.id WHERE ptt.team = $1`
3.  **Assign Player to Team:** Insert a new row into `player_to_team`.
4.  **Remove Player / Change Captain Status:** Update/delete in `player_to_team` or `player` tables.

### 3. UI/UX Specifications
*   **Split Panel Layout:**
    *   **Left Column:** List of Teams with edit buttons (rename, change night) and select buttons.
    *   **Right Column ( Roster View ):** When a team is selected on the left:
        *   Display list of players.
        *   Provide a toggle to mark/unmark a player as Captain.
        *   Provide a "Remove from Team" button.
        *   Provide an "Add Player" dropdown listing registered players who aren't currently assigned to a team.

---

## Step-by-Step Code Walkthrough for the Intern
1.  **Create the Component File:**
    Write the React boilerplate inside `src/components/admin/TeamManagement.jsx`:
    ```jsx
    import React, { useState, useEffect } from 'react';
    import { supabase } from '../../scripts/supabaseClient';

    export const TeamManagement = () => {
      const [teams, setTeams] = useState([]);
      const [selectedTeam, setSelectedTeam] = useState(null);
      const [roster, setRoster] = useState([]);
      const [unassignedPlayers, setUnassignedPlayers] = useState([]);

      useEffect(() => {
        fetchTeams();
        fetchUnassignedPlayers();
      }, []);

      const fetchTeams = async () => {
        const { data } = await supabase.from('team').select('*').order('number');
        setTeams(data || []);
      };

      // ... Implement fetchRoster, addPlayer, removePlayer, updateTeam details
      
      return (
        <div className="admin-container">
          <h2>Team Management</h2>
          {/* Layout ... */}
        </div>
      );
    };
    ```
2.  **Update Routing in `App.jsx`:**
    Import and replace:
    ```diff
    -                 <Route
    -                   path="/admin/team-management"
    -                   element={
    -                     <ProtectedRoute requireAdmin>
    -                       <div>Team Management (Coming Soon)</div>
    -                     </ProtectedRoute>
    -                   }
    -                 />
    +                 <Route
    +                   path="/admin/team-management"
    +                   element={
    +                     <ProtectedRoute requireAdmin>
    +                       <TeamManagement />
    +                     </ProtectedRoute>
    +                   }
    +                 />
    ```

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [team-management.spec.js](file:///home/brett/Code/ltta/tests/e2e/team-management.spec.js) (create new file under `tests/e2e/`)
2.  **Verification:**
    *   Verify that only users with `is_admin = true` can access this route (others redirected to schedule/login).
    *   Verify that adding a player to a team inserts the record in `player_to_team` and displays the name on the active roster list immediately.
    *   Verify that promoting a player to captain successfully updates `is_captain = true` on the `player` table.

---

## Potential Gotchas & Intern Traps
*   **Active Player Integrity:** Removing a player from a team should not delete their match history. Check that deletes cascade on `player_to_team` but do not affect past match scores where the player participated.
*   **State Stale Warning:** When switching between teams in the Left Column, make sure you clear the old `roster` state immediately and show a Loading spinner, preventing the intern from accidentally adding a player to Team B while Team A's roster is still loading.
