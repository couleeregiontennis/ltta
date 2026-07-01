# Ticket: Offline Mode for Score Entry

## Why (Product Goal & Value)
Captains entering scores court-side often experience spotty cellular connections. If they hit "Submit" and the network fails, their inputs are lost, requiring them to type all set and tie-breaker scores again. This feature caches drafts in local storage and queues submission so captains can enter data offline and have it sync automatically once connectivity returns.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Offline Detection
*   Monitor connection state using React hooks tracking `navigator.onLine` and window events `online` / `offline`.
*   Maintain a local queue of pending submissions in `localStorage` under `ltta-offline-scores`.

### 2. Score Entry UI Adaptation
*   **File to Modify:** [AddScore.jsx](file:///home/brett/Code/ltta/src/components/AddScore.jsx)
*   **Changes:**
    *   If `navigator.onLine === false`, replace the "Submit Score" button with "Queue Offline Submission" and show a yellow status banner: `⚠️ Working Offline: Draft saved locally`.
    *   Save matches inputs to local storage on any numeric change.

### 3. Synchronization Flow
*   When the browser fires the `online` event, read the `ltta-offline-scores` array.
*   Submit each queued match score sequentially to Supabase.
*   Once successfully saved, clear the item from the queue and notify the user via a Toast.

---

## Step-by-Step Code Walkthrough for the Intern
1.  **Create a useOnlineStatus Hook:**
    Create `src/hooks/useOnlineStatus.js`:
    ```javascript
    import { useState, useEffect } from 'react';

    export const useOnlineStatus = () => {
      const [isOnline, setIsOnline] = useState(navigator.onLine);

      useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }, []);

      return isOnline;
    };
    ```
2.  **Integrate useOnlineStatus into `AddScore.jsx`:**
    ```jsx
    const isOnline = useOnlineStatus();
    const [offlineQueue, setOfflineQueue] = useState(() => 
      JSON.parse(localStorage.getItem('ltta-offline-scores') || '[]')
    );

    const handleSubmit = async (scoreData) => {
      if (!isOnline) {
        // Save to offline queue
        const newQueue = [...offlineQueue, { ...scoreData, queuedAt: Date.now() }];
        localStorage.setItem('ltta-offline-scores', JSON.stringify(newQueue));
        setOfflineQueue(newQueue);
        showToast('Saved offline. Will sync when network returns.', 'warning');
        return;
      }
      
      // Normal online submission logic...
    };
    ```
3.  **Automatic Sync Listener:**
    Add a listener in `App.jsx` or inside `AddScore` that detects online state and processes the local storage queue:
    ```javascript
    useEffect(() => {
      if (isOnline && offlineQueue.length > 0) {
        syncOfflineScores(offlineQueue);
      }
    }, [isOnline, offlineQueue]);
    ```

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [tiebreak-validation.spec.js](file:///home/brett/Code/ltta/tests/e2e/tiebreak-validation.spec.js) (or add test block)
2.  **Simulation:** Use Playwright's `context.setOffline(true)` to disconnect the browser context.
3.  **UI Verification:**
    *   Verify the banner "Working Offline: Draft saved locally" is displayed.
    *   Verify clicking submit puts the payload in local storage.
    *   Toggle network online (`context.setOffline(false)`) and confirm the API POST is fired and local storage is cleared.

---

## Potential Gotchas & Intern Traps
*   **Stale Auth Sessions:** If the captain was offline for a long period, their JWT might have expired by the time they go back online. Ensure you handle auth expiration errors gracefully during sync (see [auth-invalid-jwt-recovery.spec.js](file:///home/brett/Code/ltta/tests/e2e/auth-invalid-jwt-recovery.spec.js) recovery process).
*   **Conflict Resolution:** If Captain A submitted score offline, and Captain B submitted scores online during that interval, do not overwrite Captain B's values blindly. Show a conflict prompt or let the admin resolve.
