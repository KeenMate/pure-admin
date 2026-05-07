# Pure Admin Core

Lightweight, data-focused CSS/SCSS admin framework with Corporate theme as default.

## What's New in 2.6.0

- **Seven KPI showcase designs** under the new `KPI` sidebar group — Terminal grid (Bloomberg-style dense panel with view-mode toggle), Sparkline list (one-row-per-KPI with filled-area chart), Comparison gauges (progress bars with target tick), Hero + supporting (big focal metric + side rail), Bento (asymmetric grid with sparklines behind values), Numeric strip (tabular spreadsheet-style), and Editorial minimal (light-weight typography with hairline rules). Each page ships with a Usage Guide + CSS Classes Reference card so the markup is documented in-place.
- **Framework token consolidation** — single source of truth for role colours (`--pa-success / --pa-warning / --pa-danger / --pa-info`), a new 5-step sentiment scale (`--pa-very-positive` through `--pa-very-negative`), text-contrast tiers (`--pa-text-strong / -secondary / -tertiary`), surface tints (`--pa-surface-hover / -track`), popover chrome (`--pa-detail-*`), and chart trendline tokens (`--pa-chart-trendline-height / -stroke`). Button + contextual surfaces rewired so a single override of `--pa-success` cascades through everything.
- **Role colours migrated to Tailwind palette (Visual breaking)** — `$base-success-color` → `#22c55e`, `$base-warning-color` → `#f97316` (most visible: warning yellow → orange), `$base-danger-color` → `#ef4444`. Themes that override these via `!default` still win; consumers using stock defaults will see the shift on buttons, alerts, and contextual chips.
- **`pa-stat--square` redesigned (Visual breaking)** — `__symbol` is now an inline 50%-sized companion next to `__number` (was a giant 12%-opacity watermark), markup order drives prefix-vs-suffix layout (`<symbol><number>` for `$847K`, `<number><symbol>` for `87%`), and font sizes are container-relative (`cqi`) so values track tile width instead of viewport. Multi-character units like `°C`, `¥`, `M` now render correctly at any tile size.
- **Theme-aware dashboard chart + new `pa:theme-change` event** — the demo's D3 chart was reading CSS custom properties from `<html>` (always returned `:root` defaults) and snapshotting them once at draw time. Fixed both bugs and introduced a `pa:theme-change` window event that any consumer code with cached theme-dependent values can listen to and re-render.
- **Progress ring / gauge dark-theme fixes** — `__inner` mask switched from compile-time `$card-bg` to runtime `var(--pa-card-bg)` so the percentage value stays readable in dark themes; track colours moved from `rgba(0,0,0,0.08)` to a `color-mix(... var(--pa-text-color-1) 12%, transparent)` so the unfilled portion is visible on both light and dark surfaces.

## What's New in 2.5.0

- **Form Demo showcase page** (`/showcases/form-demo`) — Vanilla-JS CRUD form mirroring the LiveView form demo from `keen-pure-admin`: inline validation slots, edit/update flow, optimistic delete with toast-undo, and a `simulateServerSave()` failure path so error states are exercisable without any tooling.
- **Alert system overhaul** — `pa-alert__heading` is now the single heading element (compact default + new `--lg` modifier for punchy presentation), default alignment flipped to `align-items: center` so icons sit nicely with single-line content (new `pa-alert--multiline` opt-out for icon + multi-line stacks), real size scale on `--sm` / `--lg` (both padding *and* font now step in 0.25rem / 0.2rem increments), and `__actions` renders with a toast-style separator. Multi-element layouts (heading + list + actions) stack reliably now via `flex-basis: 100%` on structural children.
- **Snippets audit + gap pass** — Every snippet under `snippets/` cross-checked against its SCSS source (27 audit commits, tracked in `snippets/AUDIT.md`). Wrong attribute names, dead classes, and structural omissions corrected across the board. Four new gap-pass snippets: `filter-card`, `statistics`, `notifications`, `data-display`.
- **Popconfirm position classes renamed (Breaking)** — `pa-popconfirm--right` / `--left` → `pa-popconfirm--end` / `--start`. SCSS uses logical properties so the popconfirm and its arrow mirror in `dir="rtl"`. No backwards-compatibility aliases — update markup directly.
- **`pa-alert__heading` size now opt-in (Breaking)** — Was hardcoded `font-size-lg`; defaults to the alert's body font-size now. Add `pa-alert__heading--lg` on existing alerts to keep the previous bigger treatment.

## Installation

```bash
npm install @keenmate/pure-admin-core
```

## Quick Start

### CSS Only (Corporate Theme - Default)

```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-admin-core/dist/css/main.css">
```

Or with a bundler:

```js
import '@keenmate/pure-admin-core/dist/css/main.css';
```

### Using a Theme

Download themes via the CLI and link the CSS:

```bash
npm install -g @keenmate/pureadmin
pureadmin themes audi
```

```html
<link rel="stylesheet" href="static/themes/audi/audi.css">
```

Browse all themes at [pureadmin.io](https://pureadmin.io). Keep them updated with `pureadmin update`.

### SCSS Customization

```scss
// Override variables before importing
$main-bg: #your-color;
$btn-primary-bg: #your-button-color;

// Import the framework
@import '@keenmate/pure-admin-core/src/scss/main';
```

## Using HTML Snippets

The `snippets/` directory contains clean HTML patterns for all components:

- `alerts.html` - Alert components
- `badges.html` - Badge and composite badge patterns
- `buttons.html` - All button variants and patterns
- `callouts.html` - Documentation-style callouts with left border accent
- `cards.html` - Card layouts
- `checkbox-lists.html` - Checkbox list patterns
- `code.html` - Code display blocks
- `command-palette.html` - Command palette (Ctrl+K)
- `comparison.html` - Comparison tables
- `customization.html` - Theme customization examples
- `forms.html` - Form elements and validation
- `grid.html` - Grid system layouts
- `layout.html` - Page layout structure
- `lists.html` - Styled lists (ul, ol, dl)
- `loaders.html` - Loading spinners and animations
- `modal-dialogs.html` - Confirmation dialogs
- `modals.html` - Modal windows
- `popconfirm.html` - Popconfirm component
- `profile.html` - Profile panel with tabs and favorites
- `tables.html` - Table variants
- `tabs.html` - Tab components
- `timeline.html` - Timeline components
- `toasts.html` - Toast notifications
- `tooltips.html` - Tooltips and popovers
- `typography.html` - Typography styles and headings
- `utilities.html` - Utility classes
- `virtual-scroll.html` - Virtual scrolling
- `web-daterangepicker.html` - Date range picker web component
- `detail-panel.html` - Detail panel (inline, overlay, full-screen)
- `web-multiselect.html` - Multiselect web component

These snippets are the canonical reference for building framework components in any frontend framework (React, Vue, Svelte, etc.).

## Themes

Themes are maintained in the separate [`pure-admin-themes`](https://github.com/KeenMate/pure-admin-themes) repo and available as a bundle from [pureadmin.io](https://pureadmin.io).

| Theme | Description |
|-------|-------------|
| Audi | Audi red with Fira Sans Condensed |
| Corporate | Professional blue/gray (default) |
| Dark | Dark mode with color variants |
| Express | Bold yellow/red logistics |
| Minimal | Clean minimal design |

### Theme Setup

Themes are managed via the [`pureadmin` CLI](https://www.npmjs.com/package/@keenmate/pureadmin):

```bash
npm install -D @keenmate/pureadmin

npx pureadmin themes list                    # browse all themes available on pureadmin.io
npx pureadmin themes add audi corporate      # download + register themes in this project
npx pureadmin themes update                  # re-download only themes whose content changed
npx pureadmin themes list --local            # show themes configured in this project
```

The CLI extracts theme ZIPs into `static/themes/{name}/` (configurable via `--dir`) and tracks each one in `pureadmin.json` with version + content hash for change detection. See `npx pureadmin help themes` for the full subcommand reference.

For local development against a sibling theme repo, you can hand-edit `.pureadmin.json` (gitignored) and point a slug at a filesystem path:

```json
{
  "themes": {
    "corporate": "../pure-admin-themes/corporate"
  }
}
```

### pureadmin.io Theme API

- `GET /api/theme/{name}` — download a specific theme (e.g. `/api/theme/audi`)
- `GET /api/bundle` — download all themes as a zip bundle
- `GET /api/version` — get the current theme bundle version

### Docker / CI

In Docker builds, themes are automatically fetched via `/api/bundle`. No local theme packages needed. The URL is configurable via the `THEMES_URL` build arg.

### Theme Modes & Variants

Themes support light/dark modes via CSS classes on `<body>`:
- `.pa-mode-light` - Force light mode
- `.pa-mode-dark` - Force dark mode

The Dark theme supports color accent variants:
- `.pa-color-blue` - Blue accent
- `.pa-color-green` - Green accent
- `.pa-color-red` - Red accent

### Web Component Dark Mode Support

When switching theme modes, also set `data-theme` attribute on `<body>` for web component compatibility:
```js
document.body.dataset.theme = 'dark'; // or 'light'
```
This enables dark mode support for web components like `@keenmate/web-grid` that look for `data-theme` attribute.

### RTL (Right-to-Left) Support

Pure Admin fully supports RTL languages (Arabic, Hebrew, Persian, etc.) using CSS Logical Properties. Simply add `dir="rtl"` to your HTML element:

```html
<html dir="rtl" lang="he">
```

All components automatically mirror:
- Sidebar appears on the right
- Text aligns to the right
- Margins/paddings flip appropriately
- Animations slide from the correct direction

**Logical spacing utilities** for RTL-aware layouts:
- `.ms-{size}` — margin-inline-start (left in LTR, right in RTL)
- `.me-{size}` — margin-inline-end (right in LTR, left in RTL)
- `.ps-{size}` — padding-inline-start
- `.pe-{size}` — padding-inline-end
- `.text-start` — aligns to start (left in LTR, right in RTL)
- `.text-end` — aligns to end (right in LTR, left in RTL)

Sizes: `0`, `xs`, `sm`, `md`, `base`, `lg`, `xl`, `2xl`, `auto`

## Component Classes

### Grid System
- `.pa-row` - Flex container for columns
- `.pa-col` - Auto-equal width column (flex: 1)
- `.pa-col-auto` - Content-based width
- **Percentage columns (5% increments):** `.pa-col-5`, `.pa-col-10`, ... `.pa-col-100`
- **Fraction columns:**
  - `.pa-col-1-2` (50%), `.pa-col-1-3` (33.3%), `.pa-col-2-3` (66.7%)
  - `.pa-col-1-4` (25%), `.pa-col-3-4` (75%)
  - `.pa-col-1-5` (20%), `.pa-col-2-5` (40%), `.pa-col-3-5` (60%), `.pa-col-4-5` (80%)
  - `.pa-col-1-6` (16.7%), `.pa-col-5-6` (83.3%)
  - `.pa-col-1-12` (8.3%), `.pa-col-5-12` (41.7%), `.pa-col-7-12` (58.3%), `.pa-col-11-12` (91.7%)
- **Responsive breakpoints (container-query based):** `.pa-col-sm-*`, `.pa-col-md-*`, `.pa-col-lg-*`, `.pa-col-xl-*`
  - These respond to the **container width**, not the viewport. Requires a containment context ancestor: `.pa-layout__main` (automatic) or `.pa-cq`
- **Offsets:** `.pa-offset-5`, `.pa-offset-10`, ... `.pa-offset-95`
- **Row modifiers:**
  - `.pa-row--no-gutter` - Remove column gutters
  - `.pa-row--center` - Center columns horizontally
  - `.pa-row--end` - Align columns to end
  - `.pa-row--between` - Space between columns
  - `.pa-row--around` - Space around columns
  - `.pa-row--top` - Align columns to top
  - `.pa-row--middle` - Align columns to middle
  - `.pa-row--bottom` - Align columns to bottom
  - `.pa-row--stretch` - Stretch columns to equal height

### Buttons
- `.pa-btn` - Base button
- `.pa-btn--primary/secondary/success/danger/warning/info` - Variants
- `.pa-btn--xs/sm/lg/xl` - Sizes
- `.pa-btn--outline-*` - Outline variants
- `.pa-btn--block` - Full width
- `.pa-btn--icon-only` - Icon only buttons

### Cards
- `.pa-card` - Base card
- `.pa-card__header` - Card header
- `.pa-card__body` - Card body
- `.pa-card__footer` - Card footer
- **Semantic variants:** `.pa-card--primary/success/danger/warning`
- **Theme color variants:** `.pa-card--color-1` through `.pa-card--color-9`
  - Uses `--pa-color-N` for header background and border
  - Text color automatically adjusts via `--pa-color-N-text` for readability
- `.pa-card--ghost` - Invisible container (no background, border, or shadow) — layout wrapper only
- `.pa-card--stat` - Compact padding for stat cards
- **Live-data states** (persistent tinted background for real-time dashboards):
  - `.pa-card--live-up` - Green tint (value increased)
  - `.pa-card--live-down` - Red tint (value decreased)
  - `.pa-card--live-neutral` - Returns to default card background
  - Smooth 0.3s transition between states; JS swaps the class on each data update
- **Card tabs:**
  - `.pa-card__tabs` - Tab navigation below header
  - `.pa-card__tab` / `.pa-card__tab--active` - Tab buttons
  - `.pa-card__tab-content` / `.pa-card__tab-content--active` - Tab panels
  - `.pa-card__tabs--inline` - Pill-style tabs inside header

### Layout & Sidebar
- `.pa-layout` - Main layout container
- `.pa-layout__inner` - Inner wrapper for sidebar + content
- `.pa-layout__content` - Content wrapper
- `.pa-layout__main` - Main content area
- `.pa-layout__sidebar` - Sidebar navigation
- `.pa-layout__sidebar--icon-collapse` - Icon-only collapse mode (icons maintain fixed position when collapsed)
- `.sidebar-hidden` - Body class to toggle sidebar visibility

### Navbar (Header)
- `.pa-navbar` - Fixed navbar container
- `.pa-navbar__inner` - Inner content wrapper
- **Three-section layout:**
  - `.pa-header__start` - Start section (burger, brand, nav) - stays anchored to start
  - `.pa-header__center` - Center section (page title) - flexible
  - `.pa-header__end` - End section (notifications, profile) - stays anchored to end
- `.pa-header__burger` - Hamburger menu button
- `.pa-header__brand` - Brand/logo container
- `.pa-header__nav` - Navigation links container
- `.pa-header__nav--start/--end` - Navigation position
- `.pa-header__title` - Page title
- `.pa-header__profile-btn` - Profile button

### Footer
- `.pa-layout__footer` - Footer container (uses `min-height`, can expand)
- **Three-section layout:**
  - `.pa-footer__start` - Start section (copyright) - stays anchored to start
  - `.pa-footer__center` - Center section (optional) - flexible
  - `.pa-footer__end` - End section (version info, links) - stays anchored to end
  - `.pa-footer__end--vertical` - Stack items vertically

### Forms
- `.pa-input` - Text inputs
- `.pa-select` - Select dropdowns
- `.pa-textarea` - Textareas
- `.pa-checkbox` - Checkboxes
- `.pa-radio` - Radio buttons
- **Size modifiers:** `--xs`, `--sm`, `--lg`, `--xl`
- **Validation states:** `--success`, `--warning`, `--error`
- **Color variants:** `--color-1` through `--color-9` (theme color slots)
- `.pa-form-group` - Form group wrapper
- `.pa-form-group--horizontal` - Horizontal label/input layout
- `.pa-form-help` - Help text below inputs
  - `--success`, `--warning`, `--error` - Validation state colors
  - `--color-1` through `--color-9` - Theme color variants

### Tables
- `.pa-table` - Base table
- `.pa-table--striped` - Striped rows
- `.pa-table--bordered` - Full cell borders on all sides
- `.pa-table--hover` - Row hover effects
- `.pa-table--compact` - Reduced padding

### Table Cards
Card container specifically designed for tables and web-grids:
- `.pa-table-card` - Base table card container
- `.pa-table-card__header` - Header with title and actions
- `.pa-table-card__body` - Body for table/grid content (no padding)
- `.pa-table-card__footer` - Footer with summary/actions
- `.pa-table-card__title` - Title element
- `.pa-table-card__actions` - Actions container for buttons
- **Semantic variants:** `.pa-table-card--primary/success/danger/warning`
- **Theme color variants:** `.pa-table-card--color-1` through `.pa-table-card--color-9`
- **Plain variant:** `.pa-table-card--plain` - No border/shadow/background, keeps grid behavior

Works with both `pa-table` and `web-grid` component. First/last columns automatically align with header/footer padding.

### Alerts
- `.pa-alert` - Base alert
- `.pa-alert--primary/success/danger/warning/info` - Variants
- `.pa-alert--dismissible` - Closeable alerts

### Callouts
- `.pa-callout` - Base callout (documentation-style with left border)
- `.pa-callout--primary/secondary/success/danger/warning/info` - Variants
- `.pa-callout--sm/lg` - Sizes
- `.pa-callout__icon` - Icon container
- `.pa-callout__heading` - Callout heading
- `.pa-callout__content` - Content wrapper (for icon + text layout)

### Modals
- `.pa-modal` - Base modal
- `.pa-modal__container--sm/md/lg/xl/xxl` - Sizes
- `.pa-modal--primary/success/danger/warning` - Themed headers

### Command Palette

macOS Spotlight-style search with multi-step commands, context search, and global search. Opens with `Ctrl+K` / `Cmd+K`.

#### Behavior

**Home Screen** — On open, displays a categorized list of available commands (with hotkey badges) and search contexts. Items are clickable. Typing immediately filters or switches to the appropriate mode.

**Three Input Modes:**

| Prefix | Mode | Behavior |
|--------|------|----------|
| `/` | Commands | Shows matching commands. Exact match + space enters the command wizard. |
| `:` | Context search | Shows matching search contexts. Exact match + space enters scoped search with debounced filtering. |
| (none) | Global search | Searches across all categories (commands, contexts, and data). Results limited to ~3 per category. |

**Multi-step Commands** — Commands define an array of `steps`. Each step has `getOptions(query, previousSelections)` returning filterable options. Steps can be conditional (`shouldShow(selections)`), support free-text entry (`freeText: true`), and have prompts displayed between selections (e.g., "in", "to", "as"). The command's `onComplete(selections)` fires after all steps.

**Fuzzy Matching** — Commands and contexts match on `shortcut`, `aliases`, and `name`. Matching is bidirectional: typing `/d` finds `/deploy`, and typing `/deploy` finds `/d`.

**Form Codes** — Step options can have a `code` property (e.g., `"24"` for Alerts). The `filterOpts` helper matches on `label`, `description`, and exact `code` — enabling quick navigation by numeric codes common in business applications.

**Display Styles:**

- **Inline** — Everything in one input: `/deploy in Production branch main`. The input shows the full command string with prompts and selected values concatenated.
- **Tokens** — Selections render as `pa-badge` chips in `__tokens` container above the input. Each badge has a `×` remove button to rewind to that step. The input only contains the current step's query. The command shortcut is the first badge.

**Hotkeys** — Commands can define a `hotkey` (e.g., `"Alt+D"`). These work globally (palette closed) and inside the palette (on the home screen). The hotkey opens the palette and enters the command directly, skipping the command list.

**Context Label** — `__context` element shows the active command name (e.g., "Assign to User") or search context (e.g., "Searching in Products"). Positioned inside `__input-wrapper` relative to the input.

**Search Highlighting** — Matching text in result titles is wrapped in `<mark>` elements, styled with `--pa-command-palette-highlight-bg` and `--pa-command-palette-highlight-text`. Highlights persist during keyboard navigation.

**Keyboard:** `↑↓` navigate, `Enter`/`Tab` select (or submit free text), `Esc` close, `Alt+key` command hotkeys.

#### CSS Classes

- `.pa-command-palette` - Base container (`--active` to show)
- `.pa-command-palette__backdrop` - Overlay backdrop
- `.pa-command-palette__container` - Modal dialog
- `.pa-command-palette__search` - Search area (tokens + input-wrapper)
- `.pa-command-palette__tokens` - Token badges container (hidden when empty via `:empty`)
- `.pa-command-palette__input-wrapper` - Wraps input + context label (positioning anchor)
- `.pa-command-palette__input` - Search input
- `.pa-command-palette__context` - Context label (`--visible` to show)
- `.pa-command-palette__results` - Scrollable results area (`--loading` for overlay)
- `.pa-command-palette__home` - Home screen container
- `.pa-command-palette__home-section` - Section with border-top separator
- `.pa-command-palette__home-heading` - Uppercase section heading
- `.pa-command-palette__item` - Result row (`--active` for keyboard highlight)
- `.pa-command-palette__item-icon` - Item icon
- `.pa-command-palette__item-content` - Title + subtitle wrapper
- `.pa-command-palette__item-title` - Title (supports `<mark>` for highlights)
- `.pa-command-palette__item-meta` - Subtitle/metadata (shows `[code]` prefix when present)
- `.pa-command-palette__shortcut` - Hotkey badge group (flex container)
- `.pa-command-palette__key` - Keyboard key badge (themeable via `--pa-command-palette-key-bg/key-text`)
- `.pa-command-palette__token-prompt` - Step prompt text between token badges
- `.pa-command-palette__footer` - Keyboard hints bar
- `.pa-command-palette__empty` - Empty state message
- `.pa-command-palette__loader` - Loading spinner + text

### Toasts
- `.pa-toast` - Base toast
- `.pa-toast--primary/success/danger/warning/info` - Variants
- `.pa-toast--filled-primary/success/danger/warning/info` - Filled variants (full-color background)
- `.pa-toast--color-{1-9}` / `.pa-toast--filled-color-{1-9}` - Theme color slot variants
- `.pa-toast__actions` - Action button row with border-top separator
- `.pa-toast__progress` - Auto-dismiss progress bar (5px, 0.6 opacity)
- Positions (RTL-aware): `top-end`, `top-center`, `top-start`, `bottom-end`, `bottom-center`, `bottom-start`

### Tooltips & Popovers
- `.pa-tooltip` - Base tooltip (pure CSS, no JS required)
- `.pa-tooltip--top/end/bottom/start` - Positioning (RTL-aware: end = right in LTR, left in RTL)
- `.pa-tooltip--primary/success/warning/danger` - Semantic variants
- `.pa-tooltip--color-1` through `.pa-tooltip--color-9` - Theme color variants
  - Text color automatically adjusts via `--pa-color-N-text` for readability
- `.pa-tooltip--multiline` - Multiline tooltips
- `.pa-popover` - Base popover (requires JavaScript)
- `.pa-popover--sm/md/lg` - Sizes
- `data-placement="top|end|bottom|start"` - Popover position (RTL-aware)
- **JavaScript Required**: Popovers require `tooltips-popovers.js` and Floating UI library for positioning

### Tabs
- `.pa-tabs` - Base tabs container
- `.pa-tabs__item` - Tab button
- `.pa-tabs__item--active` - Active tab state
- `.pa-tabs__content` - Content wrapper
- `.pa-tabs__panel` - Tab panel (use `--active` to show)
- **Variants:**
  - `.pa-tabs--pills` - Pill-style tabs
  - `.pa-tabs--boxed` - Boxed tabs with background
  - `.pa-tabs--vertical` - Vertical tab layout
  - `.pa-tabs--scrollable` - Horizontally scrollable with arrows
  - `.pa-tabs--collapse` - Icon-only tabs (active shows text)
  - `.pa-tabs--full` - Full-width tabs
  - `.pa-tabs--border-top` - Active indicator on top
  - `.pa-tabs--centered` - Center-aligned tabs
  - `.pa-tabs--nowrap` - Prevent wrapping
- **Sizes:** `.pa-tabs--sm`, `.pa-tabs--lg`
- **Containers:**
  - `.pa-tabs__container--bordered` - Card-like border wrapper
  - `.pa-tabs__container--card` - Card header style
  - `.pa-tabs__vertical-layout` - Wrapper for vertical tabs + content

### Pagers
- `.pa-pager` - Pagination container
- `.pa-pager__container` - Inner container with controls and info
- `.pa-pager__controls` - Navigation buttons wrapper
- `.pa-pager__info` - Page info display
- `.pa-pager__input` - Page number input
- `.pa-pager__text` - Text labels
- `.pa-pager--start/center/end` - Alignment modifiers

### Load More
- `.pa-load-more` - Load more container
- `.pa-load-more__button` - Load more button
- `.pa-load-more__button--loading` - Loading state
- `.pa-load-more__spinner` - Loading spinner
- `.pa-load-more__text` - Button text
- `.pa-load-more__count` - Item count display
- `.pa-load-more--start/center/end` - Alignment modifiers

### Statistics
- `.pa-stat` - Base statistics component
- `.pa-stat__icon` - Icon container with color variants (`--primary/success/warning/info`)
- `.pa-stat__content` - Content wrapper
- `.pa-stat__number` - Large number display
- `.pa-stat__label` - Label text
- **Hero variant:** `.pa-stat--hero` - Compact centered stat with large number (~45px), tight padding, and change indicator
  - `.pa-stat__value` - Hero number
  - `.pa-stat__change` - Change indicator (`--positive/negative/neutral`)
  - `.pa-stat--hero-compact` - Alias (identical to `--hero`)
- **Square variant:** `.pa-stat--square` - Colored square KPI card
  - `.pa-stat__symbol` - Background symbol
  - Color modifiers: `.pa-stat--primary/success/info/warning/danger/secondary`
- `.pa-kpi-grid` - Grid container for square stats

### Notifications
- `.pa-notifications` - Notification bell container
- `.pa-notifications__btn` - Bell button
- `.pa-notifications__icon` - Bell icon
- `.pa-notifications__badge` - Unread count badge
- `.pa-notifications__panel` - Dropdown panel (add `.is-open` to show)
- `.pa-notifications__header` - Panel header
- `.pa-notifications__list` - Notification list
- `.pa-notifications__item` - Individual notification (`--unread` for unread state)
- `.pa-notifications__icon-wrapper` - Item icon with variants (`--primary/success/warning/danger/secondary`)
- `.pa-notifications__content` - Item content (title, message)
- `.pa-notifications__time` - Timestamp
- `.pa-notifications__footer` - Panel footer with "View all" link

### Detail Panel
- `.pa-detail-view` - Flex wrapper for inline split-view (table + panel side by side)
- `.pa-detail-view__main` - Left side (table area), `flex: 1`
- `.pa-detail-view__panel` - Right side panel, hidden by default (`width: 0`)
- `.pa-detail-view__panel--open` - Shows panel with configured width
- `.pa-detail-view--overlay` - Card overlay modifier (panel overlays table within card)
- `.pa-detail-view__overlay` - Backdrop element (click to close), use `--visible` to show
- `.pa-detail-panel--overlay` - Full-screen overlay mode (fixed position, like profile panel)
- `.pa-detail-panel--open` - Makes overlay panel visible with slide-in transition
- `.pa-detail-panel__content` - Panel content wrapper (flex column: header/body/footer)
- `.pa-detail-panel__header` - Panel header with title, optional action buttons, close button
- `.pa-detail-panel__title` - Truncated panel title
- `.pa-detail-panel__close` - Close button
- `.pa-detail-panel__tabs` - Optional tab navigation (between header and body)
- `.pa-detail-panel__body` - Scrollable body area
- `.pa-detail-panel__footer` - Fixed footer with action buttons
- `.pa-detail-panel__overlay` - Backdrop (overlay mode, click to close)
- `.pa-detail-panel-resize` - Drag handle on left edge for resizing
- `.is-selected` - Applied to `<tr>` to highlight selected row

### Profile Panel
- `.pa-profile-panel` - Slide-in profile panel
- `.pa-profile-panel--open` - Open state
- `.pa-profile-panel__header` - Header with avatar and user info
- `.pa-profile-panel__header--no-avatar` - Header variant without avatar (for corporate apps)
- `.pa-profile-panel__tabs` - Tab navigation (Profile/Favorites)
- `.pa-profile-panel__nav-item` - Navigation link
- `.pa-profile-panel__favorite-item` - Favorite link (with remove button)
- `.pa-profile-panel__actions` - Action buttons (Sign Out, etc.)

### Data Display

Read-only label-value patterns for displaying structured data. All patterns support RTL via CSS logical properties and respond to container width via CSS Container Queries.

#### Fields (label-value pairs)
- `.pa-field` - Single label-value pair
- `.pa-field__label` - Label element
- `.pa-field__value` - Value element
- `.pa-fields` - Container for multiple fields (stacked list)
- `.pa-fields--cols-2/3/4` - Multi-column grid layout
- `.pa-fields--horizontal` - Side-by-side label/value layout
- `.pa-fields--table` - Table-like alignment with fixed label width
- `.pa-fields--bordered` - Bottom borders between fields
- `.pa-fields--striped` - Alternating row backgrounds
- `.pa-fields--compact` - Reduced spacing
- `.pa-fields--inline` - Inline horizontal flow
- `.pa-fields--relaxed` - Extra spacing
- `.pa-fields--row` - Horizontal row with wrapping
- `.pa-fields--filled` - Tinted label backgrounds
- `.pa-fields--no-border` - Remove all borders
- `.pa-fields--linear` - Underline-style fields (label above, value with bottom border)
- `.pa-fields--chips` - Chip/tag style values with color variants
- `.pa-fields--color-1` through `--color-9` - Theme color accents
- `.pa-field--full` - Full-width field spanning all columns
- `.pa-field--copy-btn/--copy-click/--copy-hover` - Copy-to-clipboard patterns
- `.pa-field-group` - Group fields under a titled section
- `.pa-field__value--success/warning/danger` - Semantic chip color variants (with `--chips`)

#### Desc Table (CSS Grid description list)
- `.pa-desc-table` - Grid-based label-value table (auto label width)
- `.pa-desc-table--cols-2` - Two-column layout
- `.pa-desc-table--fixed` - Fixed label width (configurable via `--label-width`)
- `.pa-desc-table--middle` - Vertically center labels and values
- `.pa-desc-table--label-end` - Right-align labels
- `.pa-desc-table--label-center` - Center-align labels
- `.pa-desc-table--truncate` - Truncate overflow with ellipsis
- `.pa-desc-table__label` - Label cell
- `.pa-desc-table__value` - Value cell
- `.pa-desc-table__value--full` - Value spanning full row width

#### Dot Leaders (receipt/invoice style)
- `.pa-dot-leaders` - Container for dot-leader items
- `.pa-dot-leaders__item` - Single row
- `.pa-dot-leaders__item--total` - Bold total row with top border
- `.pa-dot-leaders__label` - Label text
- `.pa-dot-leaders__leader` - Dotted fill between label and value
- `.pa-dot-leaders__value` - Right-aligned value

#### Property Card (grouped key-value card)
- `.pa-prop-card` - Self-contained card with header + rows
- `.pa-prop-card__header` - Colored header bar
- `.pa-prop-card__row` - Key-value row with bottom border
- `.pa-prop-card__label` - Row label
- `.pa-prop-card__value` - Row value
- `.pa-prop-card__value--bold` - Bold value text

#### Banded (label column with tinted background)
- `.pa-banded` - Container for banded rows
- `.pa-banded__row` - Horizontal label-value row
- `.pa-banded__label` - Label with tinted background band
- `.pa-banded__value` - Value cell
- `.pa-banded--narrow` - Narrower label column
- `.pa-banded--wide` - Wider label column
- `.pa-banded--middle` - Vertically center content
- `.pa-banded--label-end` - Right-align labels
- `.pa-banded--label-center` - Center-align labels
- `.pa-banded--truncate` - Truncate overflow with ellipsis

#### Accent Grid (color-coded items)
- `.pa-accent-grid` - Grid container with color-coded left borders
- `.pa-accent-grid__item` - Grid item with accent border
- `.pa-accent-grid__item--success/warning/danger/info` - Semantic color variants
- `.pa-accent-grid__label` - Item label
- `.pa-accent-grid__value` - Item value

#### Bar List (horizontal bar chart)
- `.pa-bar-list` - Container for labeled horizontal bar chart items
- `.pa-bar-list__item` - Single row (header + bar)
- `.pa-bar-list__header` - Flex row with label and value
- `.pa-bar-list__label` - Left-aligned label text
- `.pa-bar-list__value` - Right-aligned value text
- `.pa-bar-list__bar` - Proportional bar (set width via `style="--value: 75%"`)
- `.pa-bar-list--compact` - Tighter spacing and smaller text
- Color variants: `.pa-bar-list--success/warning/danger/info`

#### Container Query Wrappers
Wrap data display components in these containers to enable responsive behavior based on the container width (not viewport):
- `.pa-fields-container` - Container for `.pa-fields` (collapses multi-column to single column)
- `.pa-desc-container` - Container for `.pa-desc-table` (collapses to narrower layout)
- `.pa-banded-container` - Container for `.pa-banded` (stacks label above value)
- `.pa-cq` - General-purpose container query utility (`container-type: inline-size`)

## Utility Classes

### Flexbox Alignment
- `.self-start` - Align item to top (`align-self: flex-start`)
- `.self-center` - Align item to center (`align-self: center`)
- `.self-end` - Align item to bottom (`align-self: flex-end`)
- `.self-stretch` - Stretch item to fill (`align-self: stretch`)
- `.self-baseline` - Align item to baseline (`align-self: baseline`)

### Spacing (Margin & Padding)
- **Semantic:** `.m-xs`, `.m-sm`, `.m-md`, `.m-base`, `.m-lg`, `.m-xl`, `.m-2xl`
- **Directional:** `.mt-*`, `.mr-*`, `.mb-*`, `.ml-*`, `.mx-*`, `.my-*`
- **Padding:** `.p-xs`, `.p-sm`, `.p-md`, `.p-base`, `.p-lg`, `.p-xl`, `.p-2xl` (and directional variants)
- **Numeric:** `.m-0` through `.m-20`, `.p-0` through `.p-20` (in px-equivalent rem units)

### Spacing (Gap)
- **Semantic:** `.gap-0`, `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-base`, `.gap-lg`, `.gap-xl`, `.gap-2xl`
- **Numeric:** `.gap-1` through `.gap-20` (in px-equivalent rem units)
- **Row gap:** `.row-gap-0` through `.row-gap-2xl`
- **Column gap:** `.column-gap-0` through `.column-gap-2xl`

### Text Size
- `.text-2xs` through `.text-4xl` - Font size utilities

### Theme Colors
- `.pa-bg-color-1` through `.pa-bg-color-9` - Background color slots
- `.pa-text-color-1` through `.pa-text-color-9` - Text color slots
- `.pa-border-color-1` through `.pa-border-color-9` - Border color slots
- **CSS Variables:**
  - `--pa-color-1` through `--pa-color-9` - Background colors (theme-defined)
  - `--pa-color-1-text` through `--pa-color-9-text` - Contrast text colors for readability on colored backgrounds

## SCSS Variables

All components use SCSS variables with `!default` flags, making them fully customizable:

- **Colors**: `$main-bg`, `$page-bg`, `$subtle-bg`, `$accent-color`, `$text-color-1`, `$text-color-2`, etc.
- **Theme Color Slots**: `$color-1` through `$color-9` (background colors), `$color-1-text` through `$color-9-text` (contrast text colors)
- **Spacing**: `$spacing-xs` through `$spacing-2xl`
- **Typography**: `$font-size-*`, `$line-height-*`, `$font-weight-*`
- **Components**: `$btn-*`, `$card-*`, `$table-*`, etc.

See `src/scss/variables/` for the complete list.

## Base CSS Variables (Web Components)

Pure Admin exports `--base-*` CSS custom properties for theming web components (datepickers, multiselects, grids, etc.).

### Background Colors (Semantic)
| Variable | Default | Usage |
|----------|---------|-------|
| `--base-main-bg` | `#ffffff` | Cards, modals, primary content |
| `--base-page-bg` | `#f8f9fa` | Page background, subtle sections |
| `--base-subtle-bg` | `#e9ecef` | Muted areas, dividers |
| `--base-inverse-bg` | `#2c3e50` | Tooltips, dark elements |
| `--base-overlay-bg` | `rgba(0,0,0,0.5)` | Modal overlays, backdrops |
| `--base-hover-bg` | (subtle-bg) | Hover state background |
| `--base-active-bg` | (darker) | Active/pressed state |
| `--base-disabled-bg` | (subtle-bg) | Disabled elements |

### Accent Colors
| Variable | Default | Usage |
|----------|---------|-------|
| `--base-accent-color` | `#3b82f6` | Primary accent |
| `--base-accent-color-hover` | (lighter) | Hover state |
| `--base-accent-color-active` | (darker) | Active state |
| `--base-accent-color-light` | (10% opacity) | Subtle highlights |

### Text Colors
| Variable | Default | Usage |
|----------|---------|-------|
| `--base-text-color-1` | `#1f2937` | Primary text |
| `--base-text-color-2` | `#4b5563` | Secondary text |
| `--base-text-color-3` | `#6b7280` | Tertiary/muted text |
| `--base-text-color-4` | `#a3b1bf` | Disabled text |
| `--base-text-color-on-accent` | `#ffffff` | Text on accent backgrounds |

### Input Fields
| Variable | Usage |
|----------|-------|
| `--base-input-background` | Input background |
| `--base-input-color` | Input text color |
| `--base-input-border` | Border shorthand |
| `--base-input-border-hover` | Hover border |
| `--base-input-border-focus` | Focus border |
| `--base-input-placeholder-color` | Placeholder text |

### Legacy Aliases (Backward Compatibility)
The following legacy variables are still exported for backward compatibility:
- `--base-surface-1` → `--base-main-bg`
- `--base-surface-2` → `--base-page-bg`
- `--base-surface-3` → `--base-subtle-bg`
- `--base-surface-inverse` → `--base-inverse-bg`

### Usage in Web Components
```css
/* Web components consume via fallback chains */
.my-component {
  background: var(--base-main-bg, #ffffff);
  color: var(--base-text-color-1, #1f2937);
  border: 1px solid var(--base-border-color, #e5e7eb);
}

.my-component:hover {
  background: var(--base-hover-bg, var(--base-subtle-bg, #e9ecef));
}
```

## License

MIT
