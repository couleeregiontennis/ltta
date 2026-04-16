# Border Radius Tokenization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor hardcoded border-radius values across several CSS files to use standardized CSS tokens.

**Architecture:** Replace literal pixel values with `var(--radius-*)` CSS variables defined in `src/styles/colors.css`.

**Tech Stack:** CSS

---

### Task 1: Refactor src/styles/SubBoard.css

**Files:**
- Modify: `src/styles/SubBoard.css`

- [ ] **Step 1: Replace 12px with var(--radius-lg) and 4px with var(--radius-sm)**

### Task 2: Refactor src/styles/AuditLogViewer.css

**Files:**
- Modify: `src/styles/AuditLogViewer.css`

- [ ] **Step 1: Replace 12px with var(--radius-lg) and 4px with var(--radius-sm)**

### Task 3: Refactor src/styles/PlayerResources.css

**Files:**
- Modify: `src/styles/PlayerResources.css`

- [ ] **Step 1: Replace 999px with var(--radius-full)**

### Task 4: Refactor src/styles/Standings.css

**Files:**
- Modify: `src/styles/Standings.css`

- [ ] **Step 1: Replace 9999px with var(--radius-full)**

### Task 5: Refactor src/styles/PlayerProfile.css

**Files:**
- Modify: `src/styles/PlayerProfile.css`

- [ ] **Step 1: Replace 4px with var(--radius-sm)**

### Task 6: Refactor src/styles/Team.css

**Files:**
- Modify: `src/styles/Team.css`

- [ ] **Step 1: Replace 4px with var(--radius-sm) and 8px with var(--radius-md)**

### Task 7: Refactor src/styles/LandingPage.css

**Files:**
- Modify: `src/styles/LandingPage.css`

- [ ] **Step 1: Replace 8px with var(--radius-md) and 4px with var(--radius-sm)**

### Task 8: Refactor src/styles/Style.css

**Files:**
- Modify: `src/styles/Style.css`

- [ ] **Step 1: Replace 5px with var(--radius-sm)**

### Task 9: Verification

- [ ] **Step 1: Grep for remaining hardcoded border-radius values**
