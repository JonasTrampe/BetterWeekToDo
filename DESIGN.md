---
name: BetterWeekToDo
description: A calm weekly planner composed as a warm, editorial garden journal.
colors:
  paper-ground: "#faf7f0"
  paper-panel: "rgba(252, 249, 242, 0.93)"
  plot-surface: "rgba(255, 255, 255, 0.47)"
  plot-input: "rgba(255, 255, 255, 0.68)"
  moss-ink: "#263a2d"
  editorial-moss: "#334235"
  muted-leaf: "#657466"
  quiet-copy: "#697869"
  paper-rule: "#d8d5ca"
  plot-rule: "#dedbd1"
  selected-sage: "#879987"
  navigation-sage: "#aebba7"
  hover-sage: "#c9ddc5"
  terracotta: "#c86d3e"
  deep-terracotta: "#b85c35"
  completed-sage: "#829582"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Garden Serif, Noto Serif Display, serif"
    fontSize: "clamp(1.55rem, 2.4vw, 2.25rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Garden Serif, Noto Serif Display, serif"
    fontSize: "clamp(1.45rem, 2vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Garden Serif, Noto Serif Display, serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.07em"
rounded:
  check: "3px"
  control: "8px"
  plot: "9px"
  selected-day: "10px"
  card: "12px"
  large-surface: "16px"
spacing:
  hairline: "4px"
  compact: "8px"
  card: "12px"
  standard: "16px"
  generous: "24px"
  page: "32px"
components:
  date-selected:
    backgroundColor: "{colors.selected-sage}"
    textColor: "{colors.white}"
    typography: "{typography.title}"
    rounded: "{rounded.selected-day}"
    height: "7rem"
  navigation-active:
    backgroundColor: "{colors.navigation-sage}"
    textColor: "{colors.editorial-moss}"
    rounded: "{rounded.control}"
    padding: "10px 28px"
    height: "44px"
  task-plot:
    backgroundColor: "{colors.plot-surface}"
    textColor: "{colors.moss-ink}"
    rounded: "{rounded.plot}"
    padding: "4px 11px"
  task-input:
    backgroundColor: "{colors.plot-input}"
    textColor: "{colors.moss-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.plot}"
    padding: "11px"
    height: "44px"
  period-card-mobile:
    backgroundColor: "{colors.paper-panel}"
    textColor: "{colors.moss-ink}"
    rounded: "{rounded.card}"
    padding: "9px"
  completed-tray:
    backgroundColor: "{colors.plot-surface}"
    textColor: "{colors.quiet-copy}"
    rounded: "{rounded.plot}"
    padding: "16px 19px"
---

# Design System: BetterWeekToDo

## Overview

**Creative North Star: "The Focus Garden"**

BetterWeekToDo is a quiet working garden laid out on warm, uncoated paper. It combines the composure of an editorial journal with the practical clarity of a weekly planner: dates establish orientation, user-selected time-of-day plots divide the work into manageable zones, and generous emptiness keeps the interface usable when attention or energy is limited.

The botanical identity lives at the edges. Watercolor leaves, herbs, flowers, pots, and garden tools frame the desktop shell in deliberately reserved gutters; they never sit behind task text, controls, or the active planning grid. Sage marks place and completion, while terracotta is a small, warm signal for time, focus, and action.

**Key Characteristics:**

- Warm paper ground with restrained, hairline structure.
- Noto Serif Display, exposed as Garden Serif, for editorial orientation and hierarchy.
- System sans serif for task content, utility labels, and controls.
- Sage selection and completion states with sparing terracotta accents.
- A user-configured set of task plots, chosen from Morning, Midday, Afternoon, Evening, and Night.
- Botanical edge plates on desktop; content-first cards and bottom navigation on mobile.

## Colors

The palette is a low-contrast garden journal: paper neutrals carry most of the screen, moss provides readable text, sage communicates state, and terracotta is the scarce accent.

### Primary

- **Moss Ink:** The principal text and control color on the planner field; dark enough to anchor the light paper without reading as hard black.
- **Selected Sage:** The filled state for the current date, with white text and a quiet sense of placement rather than urgency.
- **Terracotta:** The signature accent for time-of-day icons, the current-date underline, focus rings, and botanical emphasis.

### Secondary

- **Navigation Sage:** The broad, muted fill used for the active navigation destination.
- **Hover Sage:** A lighter leaf-green response for hoverable navigation surfaces.
- **Completed Sage:** The compact fill for checked task marks and completed states.
- **Deep Terracotta:** A stronger warm tone reserved for task times and other small informational accents.

### Neutral

- **Paper Ground:** The full application canvas and sidebar surface.
- **Paper Panel:** A nearly opaque warm panel that keeps the task planner readable over the shell.
- **Plot Surface and Plot Input:** Translucent white layers that separate task areas without breaking the paper character.
- **Editorial Moss:** The slightly softer green used for sidebar display copy and navigation text.
- **Muted Leaf and Quiet Copy:** Supporting text colors for eyebrows, notes, helper copy, and placeholders.
- **Paper Rule and Plot Rule:** Warm gray-green hairlines for week boundaries, plot dividers, and field edges.

### Named Rules

**The Terracotta Pin Rule.** Terracotta is a small orientation signal, not a surface fill; use it for icons, time, underline, and focus, never for large panels.

**The Paper Majority Rule.** Warm paper and translucent paper layers must occupy the overwhelming majority of the interface so the garden accents remain calm.

## Typography

**Display Font:** Garden Serif, backed by the bundled Noto Serif Display Regular and Medium faces, with generic serif fallback.

**Body Font:** The native system UI sans-serif stack.

**Character:** The serif gives dates and headings the considered cadence of a garden journal. The sans serif keeps task entry, navigation, time ranges, and supporting copy familiar and fast to scan.

### Hierarchy

- **Display:** Medium serif with a fluid desktop scale and tight leading; used for the week range and other top-level orientation.
- **Headline:** Medium serif with a fluid scale; used for the full selected date and primary section headings.
- **Title:** Medium serif at a compact size; used for completed-task headings and short editorial emphasis.
- **Body:** Regular system sans with open leading; used for task text, helper copy, navigation labels, and input content.
- **Label:** Small system sans with tracked uppercase styling; used for weekdays, the selected-day eyebrow, and time-of-day names.
- **Calendar Numeral:** Regular Garden Serif at a larger size than its weekday label, keeping dates readable at a glance.

### Named Rules

**The Serif Orients Rule.** Use Garden Serif for where and when the user is; use the system sans for what the user can read or do.

**The Quiet Caps Rule.** Uppercase labels stay small and gently tracked. Never use large blocks of all-caps copy.

## Layout

Desktop is an edge-framed composition. A fixed-width left rail (21rem) holds the editorial introduction, navigation, and the left botanical plates. The planner expands through the center on the unmuted warm-paper ground. The right botanical plate remains clearly visible beneath the planning plane with only a soft left-edge fade and slight blur; date controls, task wells, add rows, and the completed tray stay opaque warm paper so artwork never reduces their legibility.

The planner header uses a centered week range between 44px previous/next controls. Beneath it, five or seven equal date cells establish the week according to the **Workweek only** setting; the selected day grows vertically into a sage tab. A Day/Week switch changes between the selected date's configured time-of-day plots and a five- or seven-column weekly summary with the same plot grouping, per-day counts, task states, and direct navigation back into a chosen day. Users choose any non-empty subset of Morning, Midday, Afternoon, Evening, and Night in Settings; blocks are ordered naturally and an explicit task time remains optional metadata rather than the primary organiser. When Workweek only is enabled, weekend date selections move forward to Monday so the selected day always remains visible. The selected-date heading separates orientation from work. The detailed planning area uses as many equal columns as the user has chosen (up to the configured column limit), followed by a full-width completed tray.

At 900px and below—or whenever the viewport is 760px tall or shorter—the edge artwork disappears and the desktop rail becomes a fixed bottom navigation bar with safe-area padding. Between 901px and 1200px on taller viewports, the rail narrows but remains present and the five time periods stay side by side. At 900px and below, the five columns become vertically stacked period cards: a compact time label sits at left and the task plot sits at right. At 600px and below, the date strip becomes horizontally scrollable, the focus aphorism is hidden, card labels tighten, and the planner gains enough bottom padding to clear navigation. Interactive targets in the compact shell remain at least 44px.

Spacing follows a compact 4/8/12/16/24/32px rhythm. Use generous page padding and whitespace for orientation; keep denser spacing inside task plots and mobile cards.

### Named Rules

**The Subordinate Garden Rule.** Decorative botany may sit beneath the planning plane or navigation rail, but every interactive surface remains opaque warm paper and the foliage fades before it can compete with task text or controls.

**The Intentional Plots Rule.** Time-of-day structure is always expressed as the user's chosen named periods, never collapsed into an ambiguous undifferentiated list.

## Elevation & Depth

The system is flat by default. Depth comes from translucent paper layers, fine rules, the selected sage fill, and nested plot geometry. The active date alone receives a soft ambient shadow (`0 8px 22px rgba(55, 74, 57, 0.13)`), briefly settling from a slightly higher shadow on entry. Dialogs may use the existing soft modal shadow when they must separate from a blurred backdrop; task plots and navigation do not float.

### Shadow Vocabulary

- **Selected Date:** A low, diffuse green-black shadow that marks the current date as the one raised element in the weekly strip.
- **Dialog:** A soft ambient shadow for modal separation; use only above an obscured or blurred application surface.

### Named Rules

**The One Raised Marker Rule.** Within the planner, only the selected date may appear elevated; all task surfaces remain paper-flat.

## Shapes

Shapes are gently cultivated rather than pill-like. Hairline borders define the weekly grid. Task plots use compact 9px corners, selected date controls use 10px corners, stacked mobile period cards use 12px corners, and large legacy planning groups may reach 16px. Task checkboxes are deliberately squarer at 3px, preserving the familiar semantics of a checklist.

Joined task plots are one composed form: the task list owns the upper corners and the add field owns the lower corners. Avoid rounding every internal row or turning controls into capsules.

## Components

### Week Header and Date Strip

- **Character:** Editorial orientation with calendar precision.
- **Week navigation:** Center the serif week range between transparent 44px arrow buttons.
- **Date cells:** Pair a tracked sans weekday with a large serif numeral, divided by warm hairlines.
- **Selected state:** Fill the taller date tab with sage, switch its text to white, add a short terracotta underline, and use the one permitted ambient shadow.
- **Focus:** Use a 3px terracotta outline with a 2px offset.

### Time-of-Day Task Plots

- **Character:** Five calm planting beds that make an otherwise open day concrete.
- **Header:** Use a terracotta line icon, tracked uppercase period label, and compact time range.
- **Plot:** Use a translucent white surface, warm 1px border, compact 9px upper corners, and flexible empty height on desktop.
- **Task row:** Pair a small square check control with task copy; place an optional time beneath the copy in deep terracotta.
- **Completed state:** Fill the check control with completed sage, switch its mark to white, and strike through the task text in a muted leaf tone.

### Add Task Field

- **Style:** Join the field directly to the bottom of its task plot with matching border and lower corners.
- **Input:** Use transparent input chrome, concise contextual placeholder copy, and compact body type.
- **Action:** Keep the plus action visually quiet until text is present; maintain a 44px minimum target even when the icon is small.
- **Focus:** Apply the shared terracotta focus outline to both field and action.

### Completed Tray

- **Character:** Quiet evidence of progress, not a celebratory dashboard.
- **Style:** A full-width translucent paper tray with a warm hairline and compact rounded corners.
- **Empty state:** Use concise muted copy.
- **Completed items:** Present compact sage checks with readable task labels; allow wrapping rather than clipping.

### Navigation

- **Desktop:** A 21rem botanical rail combines an editorial intro with vertically stacked icon-and-label actions. The active destination is a broad sage rectangle; hover uses the lighter sage response.
- **Mobile:** The same destinations become a fixed bottom bar. Hide the editorial introduction, labels, overflow menu, logo, and all botanical plates. Preserve safe-area padding and 44px minimum targets.

### Dialogs and Fields

- **Dialogs:** Use softly rounded corners, a blurred darkened backdrop, and the modal shadow only for necessary separation.
- **Fields:** Keep borders thin, labels explicit, and focus visible. Existing settings and task dialogs should inherit the paper, moss, sage, and terracotta language when touched.

### Interaction and Motion

- **Focus:** Every date, arrow, check control, task field, and add action must expose the 3px terracotta `:focus-visible` treatment.
- **Touch:** Core mobile actions must not depend on hover and must provide at least a 44px target.
- **Motion:** The selected date may settle into place over 450ms with an ease-out curve. Disable that animation when `prefers-reduced-motion: reduce` is active.

## Do's and Don'ts

### Do:

- **Do** preserve the warm paper ground and keep the active plan immediately legible.
- **Do** use Garden Serif for date and section orientation, and system sans for task work.
- **Do** reserve physical gutters for botanical plates on spacious desktop viewports and remove the plates below 1100px or at 760px tall and shorter.
- **Do** keep every enabled period visually distinct in both the day and week layouts.
- **Do** preserve visible keyboard focus, 44px touch targets, safe-area padding, and reduced-motion behavior.
- **Do** use whitespace as functional structure around dates, periods, and completion.

### Don't:

- **Don't** place botanical imagery behind tasks, fields, navigation labels, or any other reading surface.
- **Don't** turn the planner into a dense productivity dashboard, a colorful calendar matrix, or a decorative scrapbook.
- **Don't** use terracotta as a large background or spread equal visual emphasis across every color.
- **Don't** add hard offset shadows, gradients that imitate gloss, heavy borders, or excessive floating cards.
- **Don't** rely on hover, color alone, or motion alone to communicate state.
- **Don't** shrink the desktop five-column layout onto mobile; transform it into stacked period cards with bottom navigation.
