# Pure Admin - npm Workspace

## Project Overview

Pure Admin is a lightweight, data-focused HTML/CSS admin framework similar to AdminLTE but more compact. Built with PureCSS foundation, SASS preprocessing, and a comprehensive component system.

## Repository Structure (Workspace)

```
pure-admin/                        # Workspace root
├── package.json                   # Workspace config (private: true, workspaces)
├── Makefile                       # Build automation
├── CLAUDE.md                      # This file
│
├── packages/
│   └── core/                      # @keenmate/pure-admin-core (npm package)
│       ├── src/scss/              # SCSS source (single source of truth)
│       │   ├── variables/         # !default SCSS variables (base, typography,
│       │   │                      #   spacing, colors, layout, system, components)
│       │   ├── _core.scss         # Component imports — consumed by main.scss
│       │   │                      #   AND by themes via @import
│       │   ├── _base-css-variables.scss
│       │   │                      # Mixins: output-base-css-variables,
│       │   │                      #   output-pa-css-variables,
│       │   │                      #   output-pa-alert-variables-{light,dark}
│       │   ├── main.scss          # Unthemed bundle entry. Includes _core,
│       │   │                      #   utilities, AND emits the CSS variable
│       │   │                      #   defaults at :root.
│       │   ├── utilities.scss     # Utility classes
│       │   ├── _rtl-helpers.scss  # RTL transform/positioning mixins
│       │   ├── _fonts.scss        # Font face declarations
│       │   └── core-components/   # ~47 component partials
│       ├── dist/css/main.css      # Built unthemed bundle (Tailwind-default palette)
│       ├── snippets/              # HTML snippet library (~35 files)
│       ├── fonts/                 # Source font files
│       ├── scripts/               # Build scripts
│       ├── package.json           # npm package configuration
│       └── README.md              # Package documentation
│
├── demo/                          # Demo site (NOT published to npm)
│   ├── server.js                  # Express.js server (port 3000)
│   ├── views/                     # Mustache templates (~67 files)
│   ├── js/                        # Demo JavaScript (~20 files)
│   ├── assets/                    # Demo assets
│   └── package.json               # Depends on @keenmate/pure-admin-core
│
└── docs/                          # Documentation
```

Themes live in a **separate repository** at `../pure-admin-themes`, which
depends on `@keenmate/pure-admin-core` via `file:` link. See that repo's
CLAUDE.md for theme-specific guidance.

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Build CSS
npm run build -w @keenmate/pure-admin-core

# Run demo server
npm run start -w demo
# → http://localhost:3000
```

## Makefile Commands

```bash
make install      # Install all workspace dependencies
make build        # Build core CSS
make watch        # Watch SCSS files for changes
make demo         # Run demo server only
make dev          # Development mode
make clean        # Clean dist directories
make package      # Create npm tarball
make verify       # Clean, build, and verify package
make publish      # Publish to npm
```

**Note:** Theme packages have moved to the separate `pure-admin-themes` repo.

---

## Package: @keenmate/pure-admin-core

### Installation
```bash
npm install @keenmate/pure-admin-core
```

### Usage

**CSS Only:**
```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-admin-core/dist/css/main.css">
```

**With Theme:** Install themes via the `pureadmin` CLI and link the built theme CSS:
```bash
npm install -g @keenmate/pureadmin
pureadmin themes audi
```
```html
<link rel="stylesheet" href="static/themes/audi/audi.css">
```

**SCSS Customization:**
```scss
// Override SCSS variables BEFORE @import (legacy @import flow,
// matching how themes are written).
$base-accent-color: #your-color;
$btn-primary-bg: #your-button-color;

@import '@keenmate/pure-admin-core/src/scss/variables/index';
@import '@keenmate/pure-admin-core/src/scss/core';
@import '@keenmate/pure-admin-core/src/scss/utilities';

// Optional: emit --pa-* / --base-* defaults at :root for runtime theming.
@import '@keenmate/pure-admin-core/src/scss/base-css-variables';
:root {
  @include output-base-css-variables;
  @include output-pa-css-variables;
  @include output-pa-alert-variables-light;
}
```

### Available Themes
15 themes maintained in the separate `pure-admin-themes` repo:
audi, ayu, cafeindustrial, cobalt2, **corporate** (default), dark, darkmatter,
dracula, express, gruvbox, minimal, nato, night-owl, one-dark, tokyo-night.
Browse at [pureadmin.io](https://pureadmin.io).

---

## Component System

Component partials live in `packages/core/src/scss/core-components/` and are
imported in `_core.scss`. Categories (non-exhaustive):

- **Layout & structure** — base, layout (header/sidebar/footer), grid, scrollbars
- **Surfaces** — cards, modals, tabs, callouts, detail-panel, settings-panel
- **Forms** — forms, checkbox-lists, file-selector, filter-card, query-editor
- **Data display** — tables, comparison, lists, code, statistics, data-display, data-viz
- **KPI showcases** — kpi-base + seven designs (terminal, sparkline-list,
  comparison-gauges, hero-supporting, bento, numeric-strip, editorial-minimal)
- **Feedback** — alerts, toasts, notifications, popconfirm, tooltips, loaders
- **Interactive** — buttons, badges, command-palette, logic-tree, profile, timeline, pagers

Authoritative list: `ls packages/core/src/scss/core-components/`.

### Component Catalog (the pa-* inventory)

`packages/core/COMPONENTS.md` + `packages/core/components.json` are the
**authoritative, generated catalog** of every `pa-*` component: 67 components
across 9 categories, covering all ~170 blocks / ~655 class selectors. Each entry
lists the block, elements, modifiers, defining SCSS partial, and dedicated
snippet + demo. `components.json` is the machine-readable form (shipped in the
npm package) that the **svelte-pure-admin** and **keen-pure-admin** wrappers
validate their generated DOM against, and that drives snippet-coverage sweeps.

Regenerate after adding/removing any `pa-*` class:

```bash
npm run catalog -w @keenmate/pure-admin-core
```

The generator (`packages/core/scripts/build-components-catalog.mjs`) extracts
`.pa-*` selectors from the SCSS, groups them via a hand-authored block→component
taxonomy, and **fails if any discovered block is unassigned** — so the catalog
can't silently drift as new components land. Taxonomy grouping, descriptions,
and shared-file snippet/demo overrides (e.g. navbar/sidebar → `layout.html`) are
maintained inside that script. It also reports snippet gaps (currently 12
components documented only in demo mustaches, not in `snippets/`).

### HTML Snippets
Clean HTML patterns under `packages/core/snippets/` (~35 files). One file per
component category. Use them as the reference shape when generating markup
for a component.

---

## Architecture Principles

### BEM Naming Convention
**Pattern:** `pa-[block]__[element]--[modifier]`

```html
<button class="pa-btn pa-btn--primary pa-btn--lg">
  <span class="pa-btn__icon">🔍</span>
  Search
</button>
```

### One canonical markup structure per component (rigidity over flexibility)

Pure Admin is consumed by wrapper libraries — notably **svelte-pure-admin**,
whose components generate markup from props (`<Card title icon description>`).
A code generator can only emit ONE DOM tree per component. So when the CSS
accepts **two valid shapes for the same thing**, every consumer pays: the
wrapper must branch its template on which shape to emit, and hand-authored
markup drifts between the shapes with no single example to copy. Here **a
rigid, predictable structure beats a flexible one** — the opposite of the
usual "be liberal in what you accept" instinct.

Rule of thumb: **one blessed structure per slot — documented, and shown in the
snippet.** Older / shorthand forms may keep *rendering* as legacy tolerance,
but they are not a second documented option. Never present two ways to do the
same thing.

**Worked example — the card header (v2.9.0-rc05).** It used to bless two title
shapes: a bare `<h3>` (no icon) OR `.pa-card__title` + `.pa-card__title-icon`
+ `.pa-card__title-text` (with icon). That forced `<Card>` to branch on whether
an icon was passed — and because the two shapes even rendered at *different
weights* (bare `<h3>` = browser-bold 700 vs `.pa-card__title-text` = semibold
600), the demo was a visibly inconsistent mix. The fix made `.pa-card__title`
the single title contract for every card (icon optional inside
`.pa-card__title-icon`), promoted the description to a real
`.pa-card__description` element, and made `.pa-card__actions` the one actions
slot in **both** header and footer. Now a wrapper emits one tree with only the
icon `<span>` conditional. Bare `<h3>` / bare `<p>` / bare footer buttons still
render, but are legacy tolerance — not the documented shape.

### Two-layer token system: SCSS variables + `--pa-*` / `--base-*` CSS variables

Pure Admin uses **both** SCSS variables and CSS custom properties on purpose.
They serve different roles and components mix them freely:

- **SCSS variables (`$badge-padding-h`, `$font-size-xs`, etc.)** — compile-time
  tokens for structural and non-themeable values. Themes override via
  `!default` before `@import`-ing the framework.
- **CSS variables (`--pa-*` framework, `--base-*` web-component bridge)** —
  runtime theming surface. Components consume via `var(--pa-X)`. Themes emit
  values via `output-pa-css-variables` / `output-base-css-variables` mixins at
  `:root`. Enables runtime light/dark mode switching, data-driven colours
  (sparkline trend tints set inline by JS), and web-component theming
  (`<ms-multiselect>` etc. read `--base-*` from shadow DOM).

```scss
// In a component — both layers coexist
.pa-badge {
  padding: $badge-padding-v $badge-padding-h;        // SCSS — structural
  font-size: $font-size-xs;                          // SCSS — structural
  background-color: var(--pa-badge-success-bg);      // CSS var — themable at runtime
}
```

### Architectural split: `main.scss` vs `_core.scss`

- **`_core.scss`** — `@use`s every component partial. Consumed by both
  `main.scss` (the unthemed bundle) and themes (via legacy `@import`).
  Does NOT emit any `:root` block on its own — purely component CSS.
- **`main.scss`** — entry that compiles to `dist/css/main.css`. Calls the
  three emit mixins at `:root` so the unthemed bundle ships a complete set
  of neutral defaults. Consumers using `@keenmate/pure-admin-core/css`
  standalone get a working cascade; pages waiting for a theme link get
  reasonable FOUC values.
- **Themes** — written against the legacy `@import` flow:
  `@import core` + `@import base-css-variables` + their own `:root` block
  that re-emits the mixins with theme-overridden values.

**Why this split exists (v2.8.0):** before v2.8.0 the bundled
`dist/css/main.css` emitted no `:root` defaults at all — themes were
assumed to always supply them. Consumers importing
`@keenmate/pure-admin-core/css` standalone, or any page where the theme
stylesheet hadn't fully loaded yet (stale localStorage theme id producing
a 404, network race, FOUC window before the blocking `<link>` parses),
had every `var(--pa-*)` reference resolve to nothing. The resulting
`color:` declarations went invalid and fell back to inherited text colour
— canvas-based charts that captured `getComputedStyle(...).color` at draw
time rendered black, while SVG sparklines / banded sentiment cells /
delta chips silently lost their hues. The bug was hardest to spot on
runtime theme switches: charts built with the cascade resolved freeze
their colours into the Chart.js dataset and don't repaint until the
canvas is destroyed.

Emitting the mixins from `_core.scss` would have duplicated the entire
`:root` block in every theme build (themes `@import _core` and then emit
their own `:root` separately), bloating each theme CSS by ~200 lines and
forcing every theme to silently override the same neutral defaults.
Putting the emit in `main.scss` — which themes do NOT go through — gives
the unthemed bundle a working cascade while keeping all 15 theme outputs
byte-identical (verified at the 2.8.0 cut by rebuilding the
`pure-admin-themes` repo and diffing).

A first iteration (`a76d195`) emitted only the 5-step sentiment scale
defaults from `_core.scss` itself; the follow-up (`7076c2c`) moved the
emit to `main.scss` and widened it to the full
`output-base-css-variables` + `output-pa-css-variables` +
`output-pa-alert-variables-light` set so the unthemed bundle is a
complete usable baseline, not just a sentiment-colour patch.

### Theme file pattern (actual current syntax)

```scss
// theme.scss — e.g. ../pure-admin-themes/corporate/src/scss/corporate.scss

// 1. Override $base-* SCSS variables (single source of truth)
$base-accent-color: #0ea5e9;
$base-success-color: #10b981;
// ... other $base-* overrides

// 2. Import variables/index — !default flags skip already-set values
@import '@keenmate/pure-admin-core/src/scss/variables/index';

// 3. (Optional) override derived $* variables for layout-specific tuning
$main-bg: #f4f6f9;
$header-bg: #1e293b;
// ...

// 4. Import core (components) + utilities + base-css-variables (mixins)
@import '@keenmate/pure-admin-core/src/scss/core';
@import '@keenmate/pure-admin-core/src/scss/utilities';
@import '@keenmate/pure-admin-core/src/scss/base-css-variables';

// 5. Emit CSS variables at :root, light-mode by default
:root, .pa-mode-light {
  @include output-base-css-variables;
  @include output-pa-css-variables;
  @include output-pa-alert-variables-light;
}

// 6. Dark mode block — overrides --pa-* values at .pa-mode-dark
.pa-mode-dark {
  --pa-main-bg: #{$dark-bg};
  // ... per-token dark overrides
  @include output-pa-alert-variables-dark;
}
```

---

## Design System

### Spacing Scale
```scss
$spacing-xs:   0.25rem;  // 4px
$spacing-sm:   0.5rem;   // 8px
$spacing-md:   0.75rem;  // 12px
$spacing-base: 1rem;     // 16px
$spacing-lg:   1.5rem;   // 24px
$spacing-xl:   2rem;     // 32px
$spacing-2xl:  3rem;     // 48px
```

### Typography Scale (10px rem base)
```scss
// html { font-size: 10px } makes rem calculations simple: 1.6rem = 16px
$font-size-2xs:  1rem;      // 10px
$font-size-xs:   1.2rem;    // 12px
$font-size-sm:   1.4rem;    // 14px
$font-size-md:   1.5rem;    // 15px
$font-size-base: 1.6rem;    // 16px (body default)
$font-size-lg:   1.8rem;    // 18px
$font-size-xl:   2rem;      // 20px
$font-size-2xl:  2.4rem;    // 24px
```

### Native Grid System (pa-col-*)
```
.pa-row              → Flex container
.pa-col              → Auto-equal width (flex: 1)
.pa-col-auto         → Content-based width
.pa-col-{5-100}      → Percentage columns (5% increments)
.pa-col-1-2          → 50%
.pa-col-1-3, 2-3     → Thirds
.pa-col-1-4, 3-4     → Quarters
.pa-col-sm-*, md-*, lg-*, xl-*  → Responsive variants
```

### Card header icon alignment (FA glyph metrics)

`pa-card__title-icon` uses `font-size: $font-size-base` with `line-height: 1`,
which sets the icon's font-box height to 16px. Font Awesome glyphs sit ~1px
below the font-box center — so a "mathematically centered" icon (e.g. computed
from `(header-min-height − icon-size) / 2`) looks ~1px too high to the eye.

When you need pixel-perfect alignment (e.g. comparing icon position across two
header states like the splitter's expanded ↔ minimized rail), the cleanest
knob is **`$card-header-padding-v`** — bumping it by **0.05rem** shifts both
states down together by ½px, splitting the visual error symmetrically. Don't
hardcode a magic 0.8rem offset on a single child element; that creates a
debt that drifts when other header metrics change.

---

## Critical Rules

1. **Pick the right token layer.** Themable runtime values → `var(--pa-X)`
   (framework) or `var(--base-X)` (web-component bridge). Structural /
   compile-time values (spacing scales, font sizes, border radii on
   non-themable components) → SCSS variables. When in doubt: if a theme,
   a JS mode-switch, or inline data-driven styling would want to change
   it without a recompile, it's a CSS variable. Most role-coloured surfaces
   (`--pa-success`, `--pa-danger`, etc.) and the sentiment scale are CSS vars.
2. **Use `pa-` prefixed BEM classes only.** No demo-specific classes in core.
   Components must be reusable framework elements.
3. **Follow BEM strictly.** `pa-[block]__[element]--[modifier]`.
4. **Themes override BOTH SCSS variables and CSS variables.** SCSS overrides
   set values before `@import` (compile-time, via `!default`); the
   `output-pa-css-variables` / `output-base-css-variables` mixins emit them
   as `--pa-*` / `--base-*` at `:root` (runtime). Don't pick one or the
   other — both are part of the contract.
5. **Don't cross-reference component SCSS variables.** Each component owns
   its own variables; never reuse a sibling component's variable as a
   shortcut. Reuse via the shared `$base-*` / `$font-size-*` / `$spacing-*`
   tokens or via the runtime `--pa-*` cascade.
6. **No `min-height` on form elements** — causes inconsistent layouts.
7. **Font inheritance is global** — never add `font-family: inherit` to
   components.
8. **One canonical markup structure per component — rigidity over flexibility.**
   The framework is consumed by code generators (svelte-pure-admin) that emit
   one DOM tree per component, so never bless two valid shapes for the same
   slot. Pick one, document it, show it in the snippet; legacy forms may still
   render but aren't a second option. See the card-header worked example under
   Architecture Principles.

---

## Base CSS Variables for Web Components

`--base-*` CSS custom properties are the public theming API for the
`@keenmate/web-multiselect` and `@keenmate/web-daterangepicker` web
components (shadow-DOM children outside the SCSS compile boundary).

```css
/* Web components consume via fallback chains */
--ms-accent-color: var(--base-accent-color, #3b82f6);
```

~80 variables covering accent + text colours, semantic backgrounds, borders,
input fields + size heights, dropdowns, tooltip, contextual colours
(success/danger/warning/info × 8 each), focus ring, typography, and border
radii. Authoritative list and emit mixin: `_base-css-variables.scss`.

---

## Resources

- **Component catalog:** `packages/core/COMPONENTS.md` + `components.json`
  (generated — `npm run catalog -w @keenmate/pure-admin-core`)
- **Component demos:** `demo/views/` (mustache templates)
- **Snippets reference:** `packages/core/snippets/*.html`
- **Theme implementations:** `../pure-admin-themes` (separate repo)
- **CSS variable contract:** `packages/core/CSS-VARIABLES.md`
  + `_base-css-variables.scss`

---

## RTL (Right-to-Left) Support

Full RTL support using CSS Logical Properties. Add `dir="rtl"` to your HTML element:

```html
<html dir="rtl" lang="he">
```

All components automatically mirror. Use logical utilities for RTL-aware spacing:
- `.ms-*` / `.me-*` — margin-inline-start/end
- `.ps-*` / `.pe-*` — padding-inline-start/end
- `.text-start` / `.text-end` — logical text alignment

Toast positions use logical names: `top-start`, `top-end`, `bottom-start`, `bottom-end`, `top-center`, `bottom-center`

---

**Last Updated:** 2026-05-28
**Framework Version:** 2.8.0
**Default Theme:** Corporate
