---
name: Coulee Region Tennis Association
description: Contemporary sports league and tournament operations platform
colors:
  primary: "#15803d"
  primary-light: "#22c55e"
  primary-dark: "#14532d"
  accent-lime: "#84cc16"
  accent-lime-light: "#a3e635"
  secondary: "#0f172a"
  surface: "#ffffff"
  surface-muted: "#f8fafc"
  surface-alt: "#f1f5f9"
  border: "#e2e8f0"
  text-primary: "#0f172a"
  text-muted: "#475569"
  text-inverse: "#ffffff"
  success: "#16a34a"
  warning: "#d97706"
  error: "#dc2626"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
---

## Overview

The visual design system for the Coulee Region Tennis Association (CRTA / LTTA) embodies a high-craft contemporary sports league aesthetic. It replaces cluttered generic card borders with clean, high-contrast tournament cards, Wimbledon forest greens, and electric optic lime accents.

## Colors

- **Primary Green (`#15803d` / `#22c55e`)**: Athletic lawn tennis forest green, representing active competition and official league authority.
- **Optic Lime (`#84cc16` / `#a3e635`)**: Energetic tennis ball optic yellow-lime highlight for active pills, scores, and focal moments.
- **Slate Ground (`#0f172a` / `#090d16` in dark mode)**: Deep, calm athletic contrast background ensuring readability under bright outdoor sun and night stadium lighting.
- **Surface Neutrals (`#ffffff`, `#f8fafc`, `#f1f5f9`)**: Clean, crisp cards with subtle borders (`#e2e8f0`).

## Typography

- **Font Family**: Modern system athletic stack (`-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif`).
- **Headings**: Tight tracking (`-0.025em`), bold weights (700-800), unambiguous scale hierarchy.
- **Tabular Data & Match Times**: Sized with tabular numeric alignment for clear score parsing.

## Layout & Mobile Ergonomics

- **Touch Targets**: Minimum 44x44px touch targets on buttons, nav toggles, and filter pills.
- **Rhythm**: Generous spacing between content blocks, compact grouping within cards.
- **Responsive Navigation**: Sticky top navbar with glassmorphism blur and mobile hamburger drawer.

## Elevation & Depth

- Multi-layer diffuse shadows (`0 1px 3px rgba(15, 23, 42, 0.08)`) with zero-offset halos avoided.
- Dark mode utilizes subtle white opacity borders (`rgba(148, 163, 184, 0.16)`) instead of heavy artificial glows.

## Do's and Don'ts

- **Do** use rounded pill filters and concise badge status pills (`Completed`, `Pending Result`, `Upcoming`).
- **Do** ensure 44px minimum touch targets on all interactive controls for courtside mobile usability.
- **Don't** use 4px colored side-tab borders on cards (AI-generated slop tell).
- **Don't** rely on Unicode emoji when SVG icons or clean typographic badges can be used.
