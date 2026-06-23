# Design Spec: Zeffy Registration & Donation Integration

This document outlines the implementation of "Pay Registration" and "Donate" features using Zeffy, a zero-fee platform for nonprofits.

## 1. Components

### `ZeffyModal.jsx`
- **Purpose**: Inform users about why Zeffy is used and warn them about the "voluntary contribution" default.
- **State**: Controlled by `isOpen` and `onClose` props.
- **Content**:
    - Explanation of Zeffy's 100% fee pass-through model.
    - **Warning**: High-visibility note about Zeffy's default "voluntary contribution" at checkout and how to set it to $0.
    - **Primary Action**: Link to the 2026 La Crosse Team Tennis ticketing page on Zeffy.
- **Visuals**: Centered modal, semi-transparent backdrop blur, mobile-responsive.

### `Navigation.jsx` (Integration)
- **New State**: `showZeffyModal` (boolean).
- **New Buttons**:
    1. **Pay Registration Online**: Opens the `ZeffyModal`.
    2. **Donate ❤️**: Links directly to the Zeffy donation form.

## 2. Styling (`ZeffyModal.css` and `Navigation.css`)

### Navbar Buttons
- **Professional Blue**: Use `--secondary` (#1e3a8a) for background or borders.
- **Donate Button**: Add a subtle `2px solid #FFD700` (gold) border.
- **Interactive**: Hover states with transitions consistent with existing navbar buttons.

### Modal
- **Overlay**: `rgba(0, 0, 0, 0.5)` with `backdrop-filter: blur(8px)`.
- **Card**: Rounded corners (`--radius-lg`), padding (`--space-lg`).
- **Warning Box**: Background using `--warning-bg` to make the Zeffy contribution tip notice stand out.
- **Dark Mode**: High-contrast text on dark backgrounds using project variables.

## 3. External Assets
- **Zeffy Script**: `<script src="https://zeffy-scripts.s3.ca-central-1.amazonaws.com/embed-form-script.min.js"></script>` added to `index.html` <head>.

## 4. URLs
- **Donation**: `https://www.zeffy.com/en-US/donation-form/donate-to-coulee-region-tennis-association`
- **Registration**: `https://www.zeffy.com/en-US/ticketing/2026-la-crosse-team-tennis`
