---
name: WeekToDoOnline
description: A calm, accessible weekly planner framed like a personal garden journal.
colors:
  garden-ground: "#faf7f0"
  garden-bed: "#eef2e8"
  moss-ink: "#314236"
  leaf-border: "#d8ddd0"
  warm-soil: "#c96b3d"
  deep-moss: "#334638"
  night-bed: "#435a49"
typography:
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
---

# Design System: WeekToDoOnline

## Overview

**Creative North Star: "The Focus Garden"**

WeekToDoOnline is a quiet working space rather than a command dashboard. The interface should feel like tending a personal garden journal: each day has a defined place, empty space reduces cognitive load, and completion is visible without becoming loud.

The garden metaphor is expressed through warm editorial paper, restrained botanical framing, rounded planting-bed groupings, and moss and terracotta accents. Botanical illustrations may frame the page edges, but never obscure task content or reduce readability.

## Colors

Warm paper and pale leaf greens form the daytime ground. Deep moss carries text and navigation in dark mode; terracotta is reserved for action and attention states.

### Primary
- **Moss ink** (#334235): Primary text and controls on light surfaces.
- **Warm soil** (#c17a55): Reserved action and attention accent.

### Secondary
- **Leaf border** (#c5d6c1): Dividers and plot boundaries.
- **Garden bed** (#e2ecde): Main planning surface.

### Neutral
- **Garden ground** (#f7f3e9): Light page background.
- **Deep moss** (#354235): Dark page background.
- **Night bed** (#405843): Dark planning surface.

## Typography

**Body Font:** system UI sans-serif stack.

**Character:** Plain, familiar, and readable. Typography should support quick scanning rather than perform a decorative identity.

## Layout

The planner uses a persistent navigation rail on desktop and a bottom navigation bar on mobile. Week view presents a seven-day header and five time-of-day columns (morning, midday, afternoon, evening, night); Day view promotes one selected day to the available width. Mobile uses swipeable day panels and touch targets of at least 44px.

## Elevation & Depth

Depth is conveyed primarily through tonal layering, thin rules, and paper-like grouping. Avoid hard offset shadows and decorative gradients. Dialogs may use the existing soft ambient shadow only when they need separation from the planner.

## Shapes

Planning surfaces use rounded 12–16px corners. Controls use compact rounded shapes, with visible keyboard focus rings. Borders are thin and low-contrast, never heavy side rails.

## Components

### Cards / Containers
- **Background:** Garden ground or garden bed in light mode; deep moss and night bed in dark mode.
- **Corner Style:** 12–16px for day plots and dialogs.
- **Border:** Thin leaf-border divider where separation is needed.

### Navigation
- **Desktop:** Narrow vertical rail with generous icon targets.
- **Mobile:** Fixed bottom navigation with safe-area padding and 44px targets.

### Inputs / Fields
- **Style:** Clear, low-noise fields integrated into the plot surface.
- **Focus:** Strong visible outline with sufficient contrast.

## Do's and Don'ts

- Do keep the current week and current task state immediately legible.
- Do use empty space as structure, not as decoration.
- Do distinguish current, in-progress, and completed tasks with contrast and concise labels.
- Don't use camouflage, military styling, noisy botanical illustrations, or ornamental textures.
- Don't rely on hover for core actions.
- Don't make the garden metaphor compete with the plan itself.
