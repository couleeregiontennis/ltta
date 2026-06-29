# Ticket: Mobile Optimization for Score Entry

## Why (Product Goal & Value)
Captains enter match scores directly from their cell phones while sitting at the courts. The existing [AddScore.jsx](file:///home/brett/Code/ltta/src/components/AddScore.jsx) component uses tiny text inputs, which frequently lead to "fat-finger" typos. By replacing these inputs with large, touch-friendly tap dials, we can reduce score submission errors and improve the user experience on mobile screens.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Viewport & Input Target Sizes
*   All interactive elements must respect a minimum touch target size of $48px \times 48px$.
*   Use specific input fields that trigger mobile numeric keypads (`type="number"` or `inputMode="numeric"`).
*   Add increase (+) and decrease (-) buttons next to inputs to allow quick adjustments without opening the on-screen keyboard.

### 2. UI Layout Overhaul
*   **File to Modify:** [AddScore.jsx](file:///home/brett/Code/ltta/src/components/AddScore.jsx)
*   **Structure:**
    *   Group score entry by individual Line matches (Line 1 Singles, Line 2 Doubles, etc.).
    *   For each set, display two large numbers side-by-side: Home Score and Away Score.
    *   Integrate a stepper/wizard flow where captains fill out set 1, set 2, and a tiebreaker (if needed) sequentially.

### 3. Step-by-Step Code Walkthrough for the Intern
1.  **Build a Touch-Friendly Number Input Component:**
    Create a sub-component `TapNumberInput` that handles increment and decrement:
    ```jsx
    const TapNumberInput = ({ value, onChange, min = 0, max = 10 }) => {
      const increment = () => { if (value < max) onChange(value + 1); };
      const decrement = () => { if (value > min) onChange(value - 1); };

      return (
        <div className="tap-input-group">
          <button type="button" onClick={decrement} className="tap-btn">-</button>
          <input 
            type="number" 
            pattern="[0-9]*" 
            inputMode="numeric" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="tap-field"
          />
          <button type="button" onClick={increment} className="tap-btn">+</button>
        </div>
      );
    };
    ```
2.  **Add CSS for Mobile Touch Targets:**
    Add styles to ensure buttons are large, clear, and spaced out:
    ```css
    .tap-input-group {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }
    .tap-btn {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background-color: var(--card-bg-secondary);
      border: 1px solid var(--border-color);
      font-size: var(--font-lg);
      display: flex;
      justify-content: center;
      align-items: center;
      touch-action: manipulation;
    }
    .tap-field {
      width: 60px;
      height: 48px;
      text-align: center;
      font-size: var(--font-md);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }
    ```

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [tiebreak-validation.spec.js](file:///home/brett/Code/ltta/tests/e2e/tiebreak-validation.spec.js) & [mobile-navigation.spec.js](file:///home/brett/Code/ltta/tests/e2e/mobile-navigation.spec.js)
2.  **Viewport Simulation:** Configure the test to run using the `mobile-chrome` project configuration.
3.  **UI Verification:**
    *   Confirm that clicking the "+" and "-" buttons increments/decrements the score correctly.
    *   Verify that entering a tiebreaker score loads the tiebreaker detail block cleanly without clipping text on Pixel 5 viewport simulations.

---

## Potential Gotchas & Intern Traps
*   **Form Submissions on Enter:** Pressing the Enter key inside number inputs might accidentally submit the entire parent form. Ensure you prevent this behavior by trapping keypresses or using a strict `<button type="button">` for increments.
*   **State Reset:** If the captain accidentally switches tabs or lines, don't clear the entered scores. Store the local draft state in the parent container until they click the final "Submit Match Scores" button.
