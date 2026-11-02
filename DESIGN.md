---
name: "People"
description: "A charcoal team space with clear portraits, soft contours and deliberate color."
colors:
  primary: "#1666df"
  primary-hover: "#2470e8"
  page: "#141416"
  frame: "#141416"
  panel: "#232227"
  panel-hover: "#26242b"
  sheet: "#232027"
  text: "#f5f5f7"
  on-primary: "#ffffff"
  muted: "#b1aebc"
  faint: "#93909f"
  line: "#414047"
  card-line: "#403c46"
  brand-dot: "#f0a4ca"
  selected: "#f2eff6"
  on-selected: "#242028"
  secondary: "#302e36"
  secondary-hover: "#3d3945"
  on-secondary: "#ece8f1"
  field: "#242128"
  field-line: "#48404f"
  field-text: "#f6effa"
  focus: "#99beff"
  field-focus: "#8bb5ff"
  error: "#ffabc3"
  error-line: "#e08aa3"
  design-surface: "#49303f"
  design-text: "#f6acd0"
  development-surface: "#293954"
  development-text: "#a9c8ff"
  marketing-surface: "#3c354f"
  marketing-text: "#d1c1f5"
  department-surface: "#3d3b40"
  department-text: "#e0d9e7"
typography:
  display:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "54px"
    fontWeight: 450
    lineHeight: 1.15
    letterSpacing: "-2px"
  headline:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "46px"
    fontWeight: 450
    lineHeight: 1.2
    letterSpacing: "-1.8px"
  form-title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-1px"
  title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "20px"
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: "-0.45px"
  sheet-title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    letterSpacing: "-0.3px"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  button:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 550
  caption:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "11px"
    fontWeight: 400
  brand:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "34px"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.04em"
rounded:
  field: "12px"
  search: "14px"
  list-row: "16px"
  badge: "20px"
  panel: "24px"
  button: "28px"
  filter: "30px"
  shell: "32px"
  circle: "50%"
spacing:
  compact: "8px"
  control-gap: "10px"
  label-gap: "9px"
  related: "12px"
  form-columns: "14px"
  small: "16px"
  section: "20px"
  panel: "24px"
  sheet: "30px"
  header-gap: "32px"
  heading-bottom: "36px"
  shell: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 22px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.circle}"
    size: "40px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.field-text}"
    typography: "{typography.label}"
    rounded: "{rounded.field}"
    padding: "14px 15px"
    height: "50px"
  search:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.search}"
    padding: "0 17px"
    height: "54px"
  filter:
    backgroundColor: "transparent"
    typography: "{typography.label}"
    rounded: "{rounded.filter}"
    padding: "0 15px"
    height: "40px"
  filter-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.on-selected}"
  department-design:
    backgroundColor: "{colors.design-surface}"
    textColor: "{colors.design-text}"
    rounded: "{rounded.badge}"
    padding: "6px 10px"
  department-development:
    backgroundColor: "{colors.development-surface}"
    textColor: "{colors.development-text}"
    rounded: "{rounded.badge}"
    padding: "6px 10px"
  department-marketing:
    backgroundColor: "{colors.marketing-surface}"
    textColor: "{colors.marketing-text}"
    rounded: "{rounded.badge}"
    padding: "6px 10px"
  department-default:
    backgroundColor: "{colors.department-surface}"
    textColor: "{colors.department-text}"
    rounded: "{rounded.badge}"
    padding: "6px 10px"
  auth-navigation:
    backgroundColor: "{colors.field}"
    rounded: "{rounded.filter}"
    padding: "4px"
  employee-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "25px 25px 0"
  employee-card-hover:
    backgroundColor: "{colors.panel-hover}"
  detail-sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "24px 0 0 24px"
    width: "480px"
    height: "100dvh"
---

# Design System: People

## Overview

**Creative North Star: "The Charcoal Team Space"**

People uses near-black ground, charcoal surfaces and warm white Manrope to make a working team feel approachable. Portraits supply the human detail; blue actions and soft pink, blue and lilac department markers provide clear points of attention. The user’s dark reference establishes the material character and generous rounding.

The interface balances open page spacing with compact labels and contact details. Panels are mostly flat, separated by tonal shifts and thin borders. Forms and profiles share a focused side sheet, while authentication introduces the same palette through a restrained portrait composition.

**Key Characteristics:**
- Near-black ground and charcoal panels with warm, lavender-tinted neutrals.
- Self-hosted Manrope with light large headings and firmer controls.
- Circular portraits, pill controls and generous panel corners.
- Blue primary actions; pastel department labels retain their visible text.
- Flat resting surfaces, explicit keyboard focus and brief state transitions.

This is a scan of the implemented system in `src/styles.css`, `src/App.tsx` and `src/components/`. Frontmatter records the reusable values; the sidecar carries motion, focus, shadow and responsive details. Local responsive overrides remain authoritative in the stylesheet.

## Colors

The palette combines deep charcoal with warm lavender-gray text, deliberate action blue and restrained pastel department accents.

### Primary

- **Action Blue** (`primary` / `primary-hover`): authentication, add and contact actions; white text remains readable in both states.
- **Focus Blue** (`focus` / `field-focus`): keyboard outlines and the field border, separate from selection or hover color.

### Secondary

- **Rose Department** (`design-surface` / `design-text`): design labels; the small brand dot also uses a softer pink.
- **Blue Department** (`development-surface` / `development-text`): development labels, quieter than the action color.
- **Lilac Department** (`marketing-surface` / `marketing-text`): marketing labels. Unmapped departments use the neutral department pairing.
- **Rose Validation** (`error` / `error-line`): inline validation text and invalid field borders, accompanied by an explanatory message.

### Neutral

- **Near-black Ground** (`page` / `frame`): a continuous charcoal canvas at every viewport width, including the top and bottom scroll edges. Shells have no vertical outer margin.
- **Charcoal Panel** (`panel` / `panel-hover`): employee surfaces and the search area; hovering a card makes its surface slightly lighter.
- **Plum Charcoal** (`sheet` / `field`): sheets and inset form controls.
- **Warm White** (`text`): dominant reading color. **Lavender Gray** (`muted`) and **Quiet Gray** (`faint`) support secondary information.
- **Soft White Selection** (`selected` / `on-selected`): active department filter with dark text.
- **Charcoal Rules** (`line`, `card-line`, `field-line`): context-specific separators and outlines.

**The Action Blue Rule.** Use primary blue for the main action and preserve white button text in both default and hover states. Department blues use their separate muted surface and light text pairing.

## Typography

**Display Font:** Manrope Variable, with sans-serif fallback.
**Body Font:** Manrope Variable, with sans-serif fallback.

Self-hosted Manrope supplies the whole interface. Large, relatively light headings contrast with compact labels and medium button text; there is no separate display or monospace family. The scale is role-based rather than a fixed modular ratio.

### Hierarchy

- **Display:** the authentication introduction; responsive sizes step down through 46, 36, 38 and 35 px as the layout narrows.
- **Headline:** the directory heading; steps down to 40 px at 1000 px and 36 px at 700 px.
- **Form title:** the authentication form heading; 28 px on mobile.
- **Title:** employee names; the card layout adjusts them between 18 and 22 px, and the compact list uses 17 or 16 px.
- **Sheet title:** the fixed panel header; profile identity uses a larger 27 px treatment, 26 px on mobile.
- **Body:** explanatory prose, with a relaxed line height. Operational form copy also uses 12–13 px according to context.
- **Label / button:** field labels, filter labels and actions. Do not turn the smaller metadata styles into default reading text.
- **Caption:** contacts and contextual details. Existing footer and badge variants reach 9–10 px; these are dense secondary treatments, not a new minimum type scale.
- **Brand:** the lowercase wordmark, reduced to 29 px on mobile. Preserve its moderate negative tracking.

**The Human Hierarchy Rule.** Let portraits and names lead. Use weight and scale to distinguish headings, labels and supporting details without adding decorative uppercase eyebrows.

## Layout

The directory occupies a centered shell with a maximum width of 1480 px, a 32 px outer corner and 48 px side padding. Its standard desktop outer margin is 36 px vertically. At 1600 px and above the vertical margin becomes 56 px, inner padding 55 px, and card gap 24 px. At 1300 px and below the shell has 24 px margins and 32 px inner padding. At 700 px and below it fills the viewport with 20 px side padding and no outer corner.

The default card grid has three equal columns with a 20 px gap. It becomes two columns at 1000 px and one at 560 px; the gap becomes 15 px at 700 px. List mode stays one column and changes card contents into aligned rows. On mobile, list rows hide contact metadata and retain the identity, department and profile action. Filters overflow horizontally instead of compressing their labels. The add action fills the available width on mobile.

Authentication uses a two-panel shell, up to 1280 px wide, with the introduction and form side by side. At 700 px and below it stacks and hides the decorative portrait composition; the form is capped at 400 px. Detail and form sheets use 480 and 540 px widths respectively, becoming full-width at 700 px. Sheet content scrolls independently, with a sticky heading and sticky form actions.

The spacing vocabulary is pragmatic: compact 8–12 px relationships, 20–24 px group gaps and 30–48 px structural space. Preserve the established component measurements rather than forcing every value onto a new mathematical scale.

## Elevation & Depth

The resting interface is flat. Subtle charcoal changes, thin borders and open spacing separate content. The only structural shadow belongs to the modal side sheet; toasts carry a smaller diffuse shadow. Focus rings mark interaction rather than elevation. The authentication portrait tiles may overlap and rotate; that composition is native to the implemented world and is not a general card treatment.

### Shadow Vocabulary

- **Side sheet** (`-20px 0 70px #0005`): isolates the modal panel from the dimmed directory.
- **Toast** (`0 8px 30px #0005`): lifts a transient message from the page.
- **Field focus** (`0 0 0 3px #2779fc26`): soft control focus ring; the search wrapper uses the lighter `#2779fc1a` version.

**The Flat Resting Surface Rule.** Separate resting panels with tone and thin borders. Reserve diffuse shadows for overlays and transient notifications.

## Shapes

Fields and search controls use modest rounded rectangles. Resting cards and empty states use the larger panel radius, while list rows reduce the corner. Primary and secondary actions, department filters and badges are pills; portraits and icon buttons are circles. The desktop side sheet rounds only its left corners, and the mobile sheet is flush to the viewport.

Thin solid outlines express normal containment. A dashed outline identifies the add-person tile. The authentication portraits use an arched top and softly rounded lower corners; retain that treatment only where the portrait composition calls for it.

## Components

### Buttons

Confident pills with a clear action hierarchy. The shared primary and secondary button has a minimum height of 48 px, horizontal padding of 22 px and a 10 px icon gap. The add and authentication variants reach 50 px. Secondary controls pair a charcoal fill with a quiet border. Circular icon controls are normally 40 px; compact header controls use smaller variants.

Background and text changes take 160 ms with `ease`. Disabled buttons reduce opacity to 0.6 and use a wait cursor. All buttons and links receive a 2 px blue keyboard outline with a 4 px offset. Keep the existing SVG icon vocabulary.

### Chips

Filters are outlined pills with a count bubble and a distinct near-white active state. Preserve `aria-pressed` when changing selection. Department badges are informational: a small dot and a readable department name share one of the observed color pairings. Do not use color alone as the label.

### Cards / Containers

Employee cards place a circular portrait and department badge above the name, role and contact details. Their bottom profile action has a thin separator and a circular arrow. Hover changes both border and surface over 180 ms. Cards have no resting shadow. The initials avatar is the real fallback when a portrait is missing or fails.

The add-person tile uses a dashed outline, a circular plus and a short call to action. Empty, error and skeleton states retain the same charcoal material and panel radius.

### Inputs / Fields

Fields place a persistent label above a dark inset control with a thin outline and 12 px corners. Normal height is at least 50 px. Focus shifts the border and adds a soft blue ring. Validation uses a rose border plus a nearby error message; hints and errors are associated through `aria-describedby`. Search uses a 54 px wrapper, leading SVG icon and an optional clear button; its focus treatment belongs to the wrapper.

### Navigation

The current directory appears as a quiet rounded header indicator alongside the account controls. Authentication mode and grid/list mode use grouped buttons with a filled active segment and `aria-pressed`. The compact header hides account copy while retaining the account avatar and logout action. Avoid adding navigation styles that imply unsupported destinations.

### Side Sheet

A native modal dialog anchors profile and add-person tasks to the right side of the directory. It dims the background, locks page scrolling, accepts Escape through the close handler and restores focus to the prior control. Entry and exit use an interruptible **280 ms** transition with `cubic-bezier(0.32, 0.72, 0, 1)` between `translateX(100%)` and `translateX(0)`. Panel opacity and backdrop fade over 200 ms. The dialog stays mounted until transitions finish, then restores focus and scrolling. Reduced-motion preference removes all animations and transitions. Employee placeholders match the current grid or list layout and use the Unlumen Shimmer Skeleton sweep (1.6 s ease-in-out); they become static under reduced motion. The initial session check retains its 1.4 s loading-line pulse.

## Do's and Don'ts

### Do:

- Do reuse the existing primary button, field, filter and sheet treatments before introducing a new variant.
- Do retain visible labels alongside department colors and accessible names for icon-only buttons.
- Do preserve full-name wrapping and the avatar initials fallback for long names or unavailable portraits.
- Do keep keyboard focus visible and disable animation and transitions under reduced-motion preference.
- Do retain the rounded, portrait-led material language across authentication and directory surfaces.

### Don't:

- Don't add uppercase eyebrows, hard offset shadows, or glyph characters in place of the existing SVG icon language.
- Don't use muted metadata colors for primary labels or lower the contrast of blue actions.
- Don't promote every compact metadata size into a body-copy role; reuse the larger body and label roles for reading and input.
- Don't add gradients or ornamental depth to the flat charcoal panel treatment.
