# **App Name**: Smart Dice Multi-Section App

## Core Features:

- Interactive Dice Rolling: Visualize dice with actual dot patterns and custom 3D-style shake/tumble animations, a 5-second cooldown with an animated circular timer, and subtle visual feedback on roll completion.
- Sectional Navigation & Themes: Horizontal swipeable sections (Game, Lucky, Decision, Yoga) each with unique theme colors, titles, background gradients, and specific dice result interpretations (e.g., text descriptions instead of numbers).
- Local Multiplayer Setup: An intuitive modal setup allowing selection of 1-10 local players with optional names and distinct color assignments for identification throughout the game session.
- Dynamic Turn Management: Clearly display the current player's name with a color-coded outline around the dice. Manage and animate turn transitions, showing a scrollable player list with the active player highlighted.
- Session History & Reset: Maintain a local history of the last 10 rolls per section, accessible via a dedicated view, and provide a global reset option to clear all session data and player information.
- Persistent User Preferences: Toggle controls for sound and haptic/visual feedback (for web) that persist across sessions using local storage, alongside responsive design for various screen sizes.

## Style Guidelines:

- Light scheme background: A very pale amber hue, giving a subtle warmth. Hex: #F9F4EE.
- Primary color: A vibrant, engaging amber for key interactive elements. Hex: #CF8012.
- Accent color: A lively coral-red, providing contrast and visual pop. Hex: #F46659.
- Headings: 'Poppins' (geometric sans-serif) for a modern and precise feel. Body text: 'Roboto' (neo-grotesque sans-serif) for clear readability. Note: currently only Google Fonts are supported.
- Vector-based icons for all interactive elements, dice dot patterns, countdowns, and status indicators (e.g., lock icon). Icons should be clear and minimalist to complement the modern aesthetic.
- Responsive layout employing CSS Flexbox or Grid, adapting gracefully to different screen sizes. Horizontal swipeable sections will be implemented with visual dot indicators and touch-friendly controls.
- All transitions, dice rolls, cooldown timers, player turn changes, and highlights should use smooth easing functions like 'ease-in-out' with well-defined durations to create a polished and responsive user experience.