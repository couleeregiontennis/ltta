# LTTA UX/UI Improvement Backlog

This document tracks identified UX and UI issues for future remediation, as identified during the April 2026 Audit.

## Phase 2: Spacing & Design Harmony (April 2026 Audit)

- [x] **Dashboard Vertical Rhythm:** Standardized section margins to `var(--space-2xl)` for better visual separation.
- [x] **Mobile Standings Card Proportions:** Reduced rank box width (40px) to provide more space for team names.
- [x] **Toast Overlap on Mobile:** Added `bottom: 80px` offset to clear floating action buttons.
- [x] **Overview Card Alignment:** Standardized on center-alignment for summary cards.
- [x] **Table Header Contrast:** Dark mode standings headers still need a contrast boost for better accessibility. (Standardized globally via --table-header-bg)

## Completed (April 2026 Audit)

- [x] **Hardcoded Season References:** Updated `AnnouncementBar.jsx` to use dynamic data from `useSeason`. Updated all markdown documentation to 2026.
- [x] **Standings Page Mobile Responsiveness:** Implemented a new Card layout for mobile screens to replace horizontal scrolling.
- [x] **Captain Dashboard Hierarchy:** Reordered sections to prioritize "Upcoming Matches" and "Roster Management".
- [x] **Technical Debt - Season Filtering:** Refactored `useTeamStatsData` to use `team_match` table and filter by the current season ID.
- [x] **Navigation Polish:** Reduced excessive backdrop-filter blur (180px -> 16px) for better mobile performance.
- [x] **Standardized Loading States:** Added `LoadingSpinner` to `CourtsLocations.jsx` and other components.
- [x] **Toast Notifications:** Implemented a global Toast system for user feedback (saving profiles, submitting scores).
- [x] **Branded Empty States:** Created `EmptyState` component for consistent "no data" views in Standings and Schedules.
- [x] **Design Token Consistency:** Batch refactored hardcoded border-radius values to use CSS variables.
