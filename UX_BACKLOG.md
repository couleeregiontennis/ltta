# LTTA UX/UI Improvement Backlog

This document tracks identified UX and UI issues for future remediation, as identified during the April 2026 Audit.

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

## High Priority

*(No high priority items remaining)*

## Medium Priority

*(No medium priority items remaining)*

## Low Priority

*(No low priority items remaining)*
