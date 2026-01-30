# Changelog

All notable changes to Pure Admin Visual will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-01-30

**Theme packages also updated to v1.2.0:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Added

#### Table Card Component (New)
- **New component**: `.pa-table-card` — Card container specifically designed for tables and web-grids
- **Structure**:
  - `.pa-table-card__header` — Header with title and actions (same styling as card header)
  - `.pa-table-card__body` — Body for table content (no padding, handles overflow)
  - `.pa-table-card__footer` — Footer with summary/actions (same styling as card footer)
  - `.pa-table-card__title` — Title with text truncation support
  - `.pa-table-card__actions` — Actions container for buttons
- **Color variants**: `--primary`, `--success`, `--warning`, `--danger` (colored header with matching border)
- **Theme color variants**: `--color-1` through `--color-9`
- **Plain variant**: `--plain` — Removes card visual styling (border, shadow, background) while keeping grid behavior
  - Tables work side by side with proper gaps
  - Optional header displays as plain text above table
  - Useful for embedding tables without card decoration
- **Features**:
  - First/last column padding aligned with header/footer for consistent visual alignment
  - Works with both `pa-table` and `web-grid` component
  - Web-grid handles its own scrolling without conflicting scrollbars
- **Demo page**: Added "Table Cards" section in `/tables` with examples:
  - Color variant table cards
  - Web-grid with paging inside table card
  - Plain table cards side by side (bordered, striped)
  - Plain table card with pagers (top and bottom)
  - Plain table card with web-grid and paging

#### Table Bordered Modifier (New)
- **New modifier**: `.pa-table--bordered` — Full cell borders on all sides
- Adds outer border to table and borders to all cells (th and td)
- Works with all other table modifiers (striped, size variants, etc.)

### Fixed

#### Grid System - Responsive Column Padding
- **Fixed**: Responsive columns (`.pa-col-md-*`, `.pa-col-lg-*`, etc.) were missing `padding-left` and `padding-right`
- **Impact**: Content in responsive columns now properly respects grid gutters
- **Result**: Cards and tables in grid rows now have correct gaps between them and don't extend beyond container bounds

#### Table Panel Modifier (New)
- **New modifier**: `.pa-table-container--panel` — Card-like visual containment for tables without wrapping in a card
- **Visual features**:
  - Box shadow matching cards (`$shadow-sm`, `$shadow-lg` on hover)
  - Larger border-radius (`$card-border-radius`)
  - Bottom margin (`$spacing-base`)
  - Hover shadow transition
- **New elements**:
  - `.pa-table-container__header` — Optional header row with title and actions
  - `.pa-table-container__title` — Title text styling (matches card header)
  - `.pa-table-container__actions` — Actions container for buttons in header
- **Use case**: Order detail pages with Customer Info card, Delivery Details card, and Order Items table - all with consistent visual treatment
- **Demo page**: Added "Panel Tables" section in `/tables` with examples

#### Data Display Component (New)
- **New component**: `_data-display.scss` — Read-only label-value field pairs for displaying structured data without form inputs
- **Core elements**:
  - `.pa-field` — Single label-value pair (stacked by default: label on top, value below)
  - `.pa-field__label` — Muted uppercase label with letter-spacing
  - `.pa-field__value` — Normal text value
  - `.pa-field--full` — Span full width in grid layouts
- **Container** (`.pa-fields`):
  - Flexbox column layout with left accent border
  - Gap between fields for visual grouping
  - Auto-spacing between consecutive `.pa-fields` blocks (`.pa-fields + .pa-fields`)
- **Field groups** (`.pa-field-group`):
  - Labeled sections with `__title` element (bordered bottom)
  - Auto-spacing between consecutive groups

#### Data Display Layout Modifiers
- `.pa-fields--cols-2/3/4` — CSS grid multi-column layouts (responsive, collapses on mobile)
- `.pa-fields--horizontal` — Label left, value right (side-by-side)
- `.pa-fields--table` — Consistent label widths, table-like appearance
- `.pa-fields--bordered` — Bottom border separators between fields
- `.pa-fields--striped` — Alternating background rows (uses `var(--pa-table-stripe)`)
- `.pa-fields--compact` — Tighter spacing
- `.pa-fields--relaxed` — Larger gap between fields
- `.pa-fields--inline` — Fields flow inline on one line
- `.pa-fields--row` — Equal-width columns (auto column count based on children)
- `.pa-fields--filled` — Subtle background panel for distinguishing data blocks

#### Data Display Color Variants
- `.pa-fields--color-{1-9}` — Theme color for left border (uses `--pa-color-{n}` CSS variables)
- Combined with `--filled`: tints background 10% with the color using `color-mix()`
- `.pa-fields--no-border` — Removes left border entirely

#### Data Display Copyable Fields
- `.pa-field--copy-btn` — Copy button always visible next to value (`.pa-field__copy` button element)
- `.pa-field--copy-click` — Entire value clickable, shows "Click to copy" hint on hover
- `.pa-field--copy-hover` — Copy button appears only on field hover
- `.pa-field--copied` — Feedback state showing "Copied!" (applied via JS after copy)
- Uses `navigator.clipboard.writeText()` for clipboard access
- Visual feedback: checkmark icon or "Copied!" text for 1.5 seconds

#### Data Display SCSS Variables
- `$field-label-font-size: $font-size-xs` — Label text size
- `$field-label-font-weight: $font-weight-semibold` — Label weight
- `$field-label-opacity: 0.55` — Label opacity (adapts to light/dark modes)
- `$field-value-font-size: $font-size-sm` — Value text size
- `$field-gap: $spacing-xs` — Gap between label and value within a field
- `$field-horizontal-label-width: 14rem` — Label width in horizontal/table modes
- `$fields-gap: $spacing-base` — Gap between consecutive fields
- `$fields-relaxed-gap: $spacing-lg` — Gap for `--relaxed` modifier
- `$fields-bordered-padding: $spacing-sm` — Padding for bordered/striped rows
- `$fields-border-left: 3px solid $accent-color` — Left accent border
- `$fields-padding-left: $spacing-base` — Left padding after border
- `$fields-filled-bg: rgba(128, 128, 128, 0.06)` — Filled background color
- `$fields-filled-padding: $spacing-base` — Filled variant padding
- `$field-group-gap: $spacing-sm` — Gap within field groups
- `$field-group-title-font-size: $font-size-sm` — Group title size
- `$field-group-title-font-weight: $font-weight-semibold` — Group title weight
- `$field-group-title-border-color: $border-color` — Group title underline
- `$field-group-spacing: $spacing-lg` — Spacing between consecutive groups

#### Data Display Demo Page
- **New demo page**: `/data-display` with multiple sections:
  1. **Multiple pa-fields Blocks** — Demonstrates auto-spacing between consecutive `.pa-fields` containers with different layouts (row, cols-2, stacked)
  2. **Multi-Column Grid** — `pa-fields--cols-2/3/4` with `pa-field--full` spanning
  3. **Field Groups** — Three groups in 1/3 columns (Personal, Employment, Emergency Contact)
  4. **Horizontal** | **Table-Style Bordered** | **Striped** — 1/3 each
  5. **Compact** | **Inline** | **Row** | **Relaxed** — 25% each
  6. **Filled Fields** (75%) | **Form vs Display** comparison (25%)
  7. **Color Variants** — Border colors, filled+color tints, no-border
  8. **Invoice Layout** — Real-world example with Customer, Receipt/Delivery addresses, items table, totals
  9. **User Profile** (1/3) | **CSS Reference** (2/3)
  10. **Detail Panel Integration (Inline)** — Headerless side panel with floating close button, orders table
  11. **Detail Panel Integration (Full-Screen Overlay)** — Products table with full-screen overlay panel
- Varied column layouts demonstrating grid system (50/50, 1/3 1/3 1/3, 25/25/25/25, 75/25, 1/3+2/3)
- Detail panel examples show headerless variant with floating X close button

#### Sidebar Navigation
- Added "Data Display" link in Components submenu with 👁️ icon

---

## [1.2.0] - 2026-01-26

### Added

#### Detail Panel Component (New)
- **New component**: `_detail-panel.scss` — inline split-view and overlay detail panels for master/detail layouts
- **Three display modes**:
  - **Inline split-view** (`.pa-detail-view`): Table shrinks, panel appears alongside
  - **Card overlay** (`.pa-detail-view--overlay`): Panel overlays the table within the card boundary
  - **Full-screen overlay** (`.pa-detail-panel--overlay`): Fixed-position panel slides in from right (like profile panel)
- **Panel structure** (`.pa-detail-panel__content`):
  - `__header` — Title, optional action buttons (`.pa-btn-group`), close button
  - `__tabs` — Optional tab navigation between header and body
  - `__body` — Scrollable content area
  - `__footer` — Optional action footer
- **Resize handle** (`.pa-detail-panel-resize`): Drag left edge to resize panel width, double-click to reset
- **Card overlay backdrop** (`.pa-detail-view__overlay`): Optional click-to-close backdrop with `--visible` modifier
- **Row selection highlight**: `.is-selected` on `<tr>` elements for accent-tinted background
- **Responsive**: Inline mode collapses to overlay on mobile (`< 768px`)
- **CSS custom properties** (runtime state):
  - `--pa-local-detail-panel-width` — Current panel width (set by JS resize, default `40rem`)
  - `--pa-local-detail-panel-max-width` — Max width (default `64rem`)
  - `--pa-detail-panel-overlay-bg` — Backdrop color
  - `--pa-detail-panel-selected-bg` — Selected row highlight color
  - `--pa-detail-panel-z-index` — Z-index for overlay modes (default `4500`, overridable by apps)

#### Detail Panel SCSS Variables
- `$detail-panel-width: 40rem` — Default panel width
- `$detail-panel-min-width: 28rem` — Minimum panel width
- `$detail-panel-max-width: 64rem` — Maximum panel width
- `$detail-panel-mobile-width: 90vw` — Mobile overlay width
- `$detail-panel-header-padding-v/h: 1.2rem / 1.6rem` — Header padding
- `$detail-panel-body-padding-v/h: 1.2rem / 1.6rem` — Body padding
- `$detail-panel-footer-padding-v/h: 1.2rem / 1.6rem` — Footer padding
- `$detail-panel-overlay-bg: rgba(0,0,0,0.3)` — Backdrop background
- `$detail-panel-z-index: 4500` — Z-index (below profile panel, above header)
- `$detail-panel-shadow: $shadow-profile-panel` — Box shadow for overlay mode
- `$detail-panel-close-size: 3.2rem` — Close button hit area
- `$detail-panel-resize-handle-width: 6px` — Resize drag handle width
- `$detail-panel-selected-bg: rgba($accent-color, 0.08)` — Selected row background

#### Detail Panel Snippet
- **New snippet**: `snippets/detail-panel.html` with three patterns:
  - Inline split-view with table and side panel
  - Card overlay with backdrop
  - Full-screen overlay (fixed position)

#### Detail Panel Demo Page
- **New demo page**: `/detail-panel` with 7 sections:
  1. **Inline Split-View** — Table shrinks to make room for panel
  2. **Card Overlay** — Panel overlays table with backdrop
  3. **Card Overlay — No Backdrop** — Panel stays open across row clicks, 600ms loading spinner
  4. **Tabbed Detail Panel** — Tabs inside panel (Details, Activity, Notes)
  5. **Header Actions — No Footer** — Icon buttons in header (edit, bookmark, delete)
  6. **Web-Grid Integration** — `<web-grid>` drives panel via `onrowfocus` event
  7. **Overlay Mode** — Full-screen slide-in panel (like profile panel)
- **CSS Reference tables** with all classes, SCSS variables, and CSS custom properties

#### Web-Grid Integration Demo (Section 6)
- `<web-grid>` drives detail panel via `onrowfocus` callback
- `onrowfocus` receives `{ rowIndex, row, previousRowIndex }` and opens/updates panel
- 6 read-only columns (ID, Name, Department, Salary, Status, Location), 10 sample rows
- `isHoverable = true`, `isRowNumbersVisible = true`
- 600ms spinner delay simulating server fetch
- Self-contained `<script type="module">` block

### Changed

#### Demo Dependency
- **Bumped `@keenmate/web-grid`**: `^1.0.0-rc11` → `^1.0.0-rc12` (adds `onrowfocus` event)

---

## [1.1.3] - 2026-01-24

### Added

#### Theme Color Contrast Text Variables
- **New SCSS variables** `$color-1-text` through `$color-9-text` in `variables/_colors.scss`:
  - Define text color to use when corresponding `$color-N` is used as a background
  - Default: `#ffffff` (white text), themes override for light backgrounds
- **New CSS variables** `--pa-color-1-text` through `--pa-color-9-text`:
  - Output via `output-pa-css-variables` mixin in `_base-css-variables.scss`
  - Enables runtime contrast text color for card headers and tooltips
- **Updated components** to use contrast variables instead of hardcoded `#ffffff`:
  - `_cards.scss`: Card header text in `.pa-card--color-N` variants
  - `_tooltips.scss`: Tooltip text in `.pa-tooltip--color-N` and floating tooltip variants
- **Theme-specific contrast colors** defined in all 5 theme packages:
  - **Corporate**: Dark text (`#1a1a1a`) for color-4 (amber)
  - **Audi**: Dark text for color-4 (gold)
  - **Dark**: Dark text for colors 2, 3, 6, 7, 8, 9 (all light/vibrant colors)
  - **Express**: Dark text for color-2 (yellow)
  - **Minimal**: Dark text for color-7 (light gray)
- **Demo page `/cards`**: Added "Theme Color Cards" section with color-1, color-2, color-3 examples
- **Use case**: Ensures readable text on colored card headers regardless of background brightness

#### Alert Color Derivation System
- **New SCSS variables** in `variables/_base.scss` for configurable alert color derivation:
  - `$alert-bg-opacity-light: 15` - Light mode background opacity (%)
  - `$alert-bg-opacity-dark: 45` - Dark mode background opacity (%)
  - `$alert-border-opacity-light: 30` - Light mode border opacity (%)
  - `$alert-border-opacity-dark: 70` - Dark mode border opacity (%)
  - `$alert-text-mix-light: 60%` - Light mode text mix with black
  - `$alert-text-mix-dark: 80%` - Dark mode text mix with white
- **New mixins** in `_base-css-variables.scss`:
  - `output-pa-alert-variables-light` - Derives alert colors using CSS `color-mix()` for light mode (dark text on subtle backgrounds)
  - `output-pa-alert-variables-dark` - Derives alert colors for dark mode (white text on tinted backgrounds)
- **Benefits**: Themes now define 0 alert colors instead of 12+ hardcoded CSS variables

### Changed

#### Theme Alert Color Architecture
- **All 5 themes updated** to use new derivation mixins instead of hardcoded alert CSS variables:
  - Corporate, Audi, Dark, Express, Minimal themes
  - Pattern: `@include output-pa-alert-variables-light;` in light mode, `@include output-pa-alert-variables-dark;` in dark mode
- **Express theme special handling**: Custom opacity overrides for saturated backgrounds
  - `$alert-bg-opacity-light: 68` (saturated)
  - `$alert-bg-opacity-dark: 30`
  - White text overrides for all alert types in light mode
- **Dark mode alert text**: Changed from `color-mix()` derivation to pure white (`#ffffff`) for all alert types
  - Fixes muddy/brownish text colors that resulted from mixing semantic colors with white

#### Input Group Border Colors
- **Prepend/append borders** now match their background colors instead of using generic border color
  - `border-color: var(--pa-input-group-prepend-bg)` for prepend
  - `border-color: var(--pa-input-group-append-bg)` for append
  - Provides visual cohesion when using colored prepend/append elements

### Fixed

#### Express Theme Dark Mode Input Groups
- **Fixed washed-out input group colors**: Increased append/prepend background opacity from 15% to 35%
  - `--pa-input-group-prepend-bg: rgba(255, 204, 0, 0.35)` (was 0.15)
  - `--pa-input-group-append-bg: rgba(255, 204, 0, 0.35)` (was 0.15)

### Removed

#### Deprecated Alert SCSS Variables
- **Removed 12 alert SCSS variables** from `variables/_components.scss` (now derived via CSS `color-mix()`):
  - `$alert-success-bg`, `$alert-success-border`, `$alert-success-text`
  - `$alert-danger-bg`, `$alert-danger-border`, `$alert-danger-text`
  - `$alert-warning-bg`, `$alert-warning-border`, `$alert-warning-text`
  - `$alert-info-bg`, `$alert-info-border`, `$alert-info-text`
- **Removed static alert output** from `output-pa-css-variables` mixin (replaced by dedicated alert mixins)

---

## [1.1.2] - 2026-01-22

### Added

#### Web Multiselect Group Label Styling
- **Added group label styling** to `_web-components-theme.scss` for better visibility
- **CSS variables set on `web-multiselect`**:
  - `--ms-group-label-color: var(--base-text-color-1)` - Uses primary text color instead of muted
  - `--ms-group-label-font-weight: 600` - Semibold for emphasis
- **Applies to all themes** - Included via `_core.scss` web-components-theme import

### Changed

#### Demo Page `/inputs` - Input Groups Section
- **Added width utility example** to "$" prepend element using `wr-3` class
- **Added tip note** explaining that width utilities (`wr-*`, `wp-*`) can be used on prepend/append elements

#### Demo Page `/multiselect` - Improved Examples
- **Grouped Options ("Technologies by Category")** - Now uses JavaScript initialization with `group` property and `group-member` attribute for proper group rendering
- **Disabled Options** - Now uses JavaScript initialization with `disabled: true` property and `disabled-member` attribute for proper disabled state
- **RTL Examples** - Added proper Arabic (`بحث...`) and Hebrew (`חיפוש...`) search placeholders using `search-placeholder` attribute

### Fixed

#### Link Utility Class Color
- **Fixed `.pa-link` class** - Changed from removed `$primary-bg` to `$accent-color` for proper link styling

### Removed

#### Unnecessary Web Component Variable Overrides
- **Removed `web-daterangepicker` CSS variable block** from `_web-components-theme.scss` (~280 lines)
  - The daterangepicker component now uses `--base-*` CSS variables with built-in fallback chains
  - Pure Admin only needs to set `--base-*` variables (via `output-base-css-variables` mixin)
  - Component automatically picks up theme colors from:
    1. External override: `--drp-accent-color: #custom`
    2. Theme base value: `var(--base-accent-color)`
    3. Hardcoded default: `#3b82f6`
- **Removed `web-daterangepicker` blocks from all theme files** (~70 lines each):
  - `packages/theme-express/src/scss/express.scss`
  - `packages/theme-audi/src/scss/audi.scss`
  - `packages/theme-corporate/src/scss/corporate.scss`
  - `packages/theme-dark/src/scss/dark.scss`
  - `packages/theme-minimal/src/scss/minimal.scss`
- **Removed `--ms-*` multiselect overrides from all theme files** (~26 lines each):
  - Same pattern as daterangepicker - component now reads from `--base-*` variables
  - Removed both `:root` level variables and `web-multiselect { }` selector blocks
- **Total reduction**: ~650 lines of unnecessary CSS variable overrides removed
- **Benefit**: Simpler theme maintenance - just set `--base-*` variables once and both web components inherit automatically

---

## [1.1.1] - 2026-01-19

### Added

#### Demo Pages - CSS Classes Reference
- **Added CSS Classes Reference sections** to all component demo pages for quick reference
  - Pages updated: `/alerts`, `/badges`, `/buttons`, `/callouts`, `/cards`, `/checkbox-lists`, `/code`, `/grid`, `/inputs`, `/lists`, `/loaders`, `/modals`, `/tabs`, `/tables`, `/toasts`, `/tooltips`
  - Consistent format using `pa-list-basic pa-list-basic--compact` for class documentation
- **New `/pagers` demo page** - Demonstrates pager and load-more components with examples and CSS reference
- **New `/helpers` demo page** - Comprehensive utility class reference with live examples
  - Spacing (margin/padding): numeric and semantic scales
  - Gap utilities: semantic and numeric
  - Width/height utilities: percentage, fraction, REM variants
  - Min/max sizing utilities
  - Display, flexbox, text, overflow, cursor, position, border, shadow utilities

#### Semantic Spacing Utility Classes
- **New `$semantic-spacers` map** in `variables/_spacing.scss` - Single source of truth for named spacing utilities
  - Values: `0`, `xs`, `sm`, `md`, `base`, `lg`, `xl`, `2xl` mapped to spacing variables
- **Semantic margin utilities**: `.m-xs`, `.m-sm`, `.m-md`, `.m-base`, `.m-lg`, `.m-xl`, `.m-2xl` (and all directional variants: `mt-*`, `mr-*`, `mb-*`, `ml-*`, `mx-*`, `my-*`)
- **Semantic padding utilities**: `.p-xs`, `.p-sm`, `.p-md`, `.p-base`, `.p-lg`, `.p-xl`, `.p-2xl` (and all directional variants)
- **Refactored gap utilities** to use `@each` loop over `$semantic-spacers`
  - Now generates `row-gap-xl`, `row-gap-2xl`, `column-gap-xl`, `column-gap-2xl` (previously missing)
- **Numeric gap classes preserved** for backwards compatibility (`.gap-1` through `.gap-20`)

### Added

#### Base Elevated Background Variable (`--base-elevated-bg`)
- **New CSS variable**: `--base-elevated-bg` for elevated surfaces like table headers, striped rows
- **SCSS variable**: `$base-elevated-bg: #f5f5f5 !default` in `variables/_base.scss`
- **CSS output**: Added to `output-base-css-variables` mixin in `_base-css-variables.scss`
- **Manifest**: Added to `base-variables.manifest.json` as required variable
- **Use case**: Web components (e.g., `@keenmate/web-grid`) use this for header rows and striped even rows
- **Problem solved**: Web-grid striped rows showed white background in dark mode because `--base-elevated-bg` was missing
- **Theme updates**: All themes now set appropriate dark values in their dark mode blocks:
  - Express: `#2a2a2a` (`$dark-surface`)
  - Corporate: `#334155` (`$dark-surface`)
  - Minimal: `#2e2e2e` (`$dark-surface`)
  - Dark: `#333333` (`$dark-bg-tertiary`) in dark mode, `#f1f5f9` in light mode
  - Audi: `#2a2a2a` (`$audi-gray`) in dark mode, `#f1f3f5` in light mode

### Added

#### Input Color Variants (`pa-input--color-1` through `--color-9`)
- **New color modifiers** for inputs, selects, and textareas using theme color slots
- **Classes**: `pa-input--color-1` through `pa-input--color-9` (same for `pa-select--*` and `pa-textarea--*`)
- **Styling**: Border color and focus ring use the theme's `--pa-color-*` CSS variables
- **Focus ring**: Uses `color-mix()` for 25% opacity version of the color
- **Use case**: Custom input accents beyond semantic success/warning/error states
- **Theme control**: Colors are `transparent` by default unless theme defines `$color-1` through `$color-9`
- **File**: `core-components/forms/_form-states.scss`

#### Form Help Text Color Variants (`pa-form-help--color-1` through `--color-9`)
- **New color modifiers** for help text using theme color slots
- **Classes**: `pa-form-help--color-1` through `pa-form-help--color-9`
- **Use case**: Match help text color to input color variant, or leave gray for neutral appearance
- **File**: `core-components/forms/_form-states.scss`

#### Missing Form Help Warning State
- **Added `pa-form-help--warning`** - was missing from the form states
- **Color**: Uses `--pa-warning-bg` to match input warning state

### Changed

#### Demo Page `/inputs` - Validation States Section
- **Added colored help text** to validation state examples (success, warning, error)
- **Added theme color variants section** showing `pa-input--color-1`, `--color-2`, `--color-3` with help text examples
- **Updated CSS Classes Reference** with new color variant classes for inputs, selects, textareas, and help text

#### Snippets `forms.html` Updates
- **Fixed class names**: Changed `pa-form-text` to correct `pa-form-help`
- **Added warning state example** with `pa-form-group--warning` and `pa-form-help--warning`
- **Added theme color variants section** with examples for inputs, selects, and textareas
- **Updated component reference** with all new classes

### Fixed

#### Textarea Size Modifiers Not Rendering Different Heights
- **Fixed textarea size modifiers** (`--xs`, `--sm`, `--lg`, `--xl`) all rendering at the same height
- **Root cause**: Modifiers only set `min-height`, which doesn't control actual rendered height
- **Solution**: Added `height` property alongside `min-height` for each size modifier
  - `height` sets the initial rendered size
  - `min-height` prevents shrinking below that size when user resizes
- **File**: `core-components/forms/_form-inputs.scss`

#### Notification Bell Color
- **Fixed notification bell color** - Changed `.pa-notifications__btn` to use `var(--pa-header-text)` instead of `var(--pa-text-primary)`

#### Header Profile Button Color
- **Fixed profile icon color** in header not matching header text color
- **Changed** `.pa-header__profile-btn` from `color: var(--pa-text-primary)` to `color: var(--pa-header-text)`
- **Changed** `.pa-header__profile-name` from SCSS variable to CSS variable `var(--pa-header-profile-name-color)`
- **Added `gap`** property to profile button for consistent icon/name spacing
- **Result**: Profile icon and name now correctly use header-specific text colors in all themes

### Changed

#### CSS Variable Naming Alignment
- **Renamed core CSS variables** to align with `--base-*` semantic naming:
  - `--pa-primary-bg` → `--pa-main-bg`
  - `--pa-bg-secondary` → `--pa-page-bg`
  - `--pa-content-bg` → `--pa-subtle-bg`
  - `--pa-text-primary` → `--pa-text-color-1`
  - `--pa-text-secondary` → `--pa-text-color-2`
- **Renamed SCSS variables** correspondingly:
  - `$primary-bg` → `$main-bg`
  - `$bg-secondary` → `$page-bg`
  - `$content-background-color` → `$subtle-bg`
  - `$text-primary` → `$text-color-1`
  - `$text-secondary` → `$text-color-2`

#### Body Font Uses CSS Variable
- **Changed `body` font-family** from SCSS variable to CSS variable: `font-family: var(--base-font-family)`
- **Problem**: SCSS module system (`@use`) caused themes' `$body-font-family` overrides to not propagate to `_base.scss`
- **Solution**: Body now uses CSS variable which is set via `output-base-css-variables` mixin in themes
- **Result**: Themes can set `$base-font-family` before importing variables, and it flows through to the body
- **File**: `core-components/_base.scss`

#### Typography Variables Derive from Base
- **Changed `$body-font-family`** to derive from `$base-font-family` instead of `$font-stack-system`
- **Before**: `$body-font-family: $font-stack-system !default;`
- **After**: `$body-font-family: $base-font-family !default;`
- **File**: `variables/_typography.scss`

### Removed

#### Delivery Font
- **Removed Delivery font** from framework (was unused, Express theme uses Fira Sans Condensed)
- **Deleted @font-face declaration** for Delivery font from `_fonts.scss`
- **Deleted `.font-family-delivery` class** from `_fonts.scss`
- **Deleted font files**: `fonts/Delivery/` directory (8 woff2 files)
- **Removed from settings panel**: Delivery option removed from font family selector in demo

### Added

#### Forms Page Size Reference Table
- **Added height columns** to Input Sizes Reference table on `/forms` page
- **Shows actual rendered height** (in pixels) for inputs and buttons at each size
- **JavaScript measurement**: Heights calculated via `offsetHeight` after page load
- **Use case**: Compare declared sizes with actual rendered dimensions

### Changed

#### Theme Architecture - Themes Moved to Separate Packages
- **Themes extracted from core**: All theme files removed from `packages/core/src/scss/themes/` and moved to dedicated theme packages
  - Deleted from core: `audi.scss`, `audi-light.scss`, `corporate.scss`, `dark.scss`, `dark-blue.scss`, `dark-green.scss`, `dark-red.scss`, `express.scss`, `minimal.scss`, `_dark-base.scss`
  - Themes now live in: `packages/theme-audi`, `packages/theme-dark`, `packages/theme-express`, etc.
- **Core package is now theme-agnostic**: Contains only the framework foundation, not specific themes
- **Benefits**: Smaller core package size, independent theme versioning, cleaner separation of concerns

#### Base CSS Variables - Semantic Naming
- **Category renamed**: `surface` → `background` in variable manifest
- **Variables renamed** with clearer semantic purpose:
  - `$base-surface-1` → `$base-main-bg` (Primary background: cards, modals, content)
  - `$base-surface-2` → `$base-page-bg` (Page background, subtle sections)
  - `$base-surface-3` → `$base-subtle-bg` (Muted areas, dividers)
  - `$base-surface-inverse` → `$base-inverse-bg` (Inverse background: tooltips, dark elements)
- **CSS variable output updated**: Both semantic (`--base-main-bg`) and legacy (`--base-surface-1`) variables exported

### Added

#### New Interactive State Background Variables
- `$base-hover-bg` - Hover state background (default: `$base-subtle-bg`)
- `$base-active-bg` - Active/pressed state background (default: 5% darker than subtle)
- `$base-disabled-bg` - Disabled element background (default: `$base-subtle-bg`)
- **Use case**: Consistent interactive state styling across web components

### Fixed

#### SCSS Variable Scoping for Themes
- **Changed module system**: `@forward` → `@import` in `_variables.scss` and `variables/_index.scss`
- **Problem**: `@forward` created isolated scopes, preventing themes from overriding `$base-*` variables before import
- **Solution**: `@import` ensures variables share global scope, allowing themes to set variables BEFORE importing and `!default` flags skip already-defined variables
- **Result**: Simpler theme authoring - just define your `$base-*` overrides, then `@import` variables

### Backward Compatibility
- **Legacy aliases maintained**: `$base-surface-1`, `$base-surface-2`, `$base-surface-3`, `$base-surface-inverse` still work
- **CSS variables**: Both old (`--base-surface-*`) and new (`--base-main-bg`, etc.) exported
- **No breaking changes**: Existing themes using old variable names continue to work

---

## [1.0.0] - 2026-01-13

**Pure Admin 1.0.0** is a lightweight, data-focused CSS/SCSS admin framework. This is the first production release.

### Release Highlights

- **Complete Component Library**: Buttons, cards, forms, tables, modals, toasts, tooltips, tabs, alerts, badges, notifications, profile panel, command palette, and more
- **Flexible Grid System**: 12-column grid with percentage (5% increments), fraction (halves, thirds, quarters), and responsive breakpoints (sm, md, lg, xl)
- **5 Themes**: Corporate (default), Audi, Express, Dark (with color variants), Minimal
- **Dark Mode Support**: Built-in light/dark mode switching with `data-theme` attribute for web component compatibility
- **Resizable Sidebar**: Opt-in drag-to-resize with localStorage persistence and utility class overrides
- **Three-Section Layouts**: Navbar and footer with left/center/right anchored sections
- **Comprehensive Utilities**: Spacing, sizing (rem and percentage), flexbox alignment, text truncation, gap utilities
- **HTML Snippets**: 30 ready-to-use component patterns for any frontend framework (React, Vue, Svelte, etc.)
- **SCSS Customization**: All variables use `!default` for easy theming

---

### Added

#### Extended Sizing Utility Classes
- **Width utilities extended to 50rem**: `.wr-30`, `.wr-35`, `.wr-40`, `.wr-45`, `.wr-50` (and corresponding `minwr-*`, `maxwr-*`)
- **Height utilities extended to 50rem**: `.hr-30`, `.hr-35`, `.hr-40`, `.hr-45`, `.hr-50` (and corresponding `minhr-*`, `maxhr-*`)
- **Fractional width utilities**: `.w-1-2`, `.w-1-4`, `.w-3-4` with matching `mw-*`, `maxw-*`, and `-fixed` variants
- **Fractional height utilities**: `.h-1-2`, `.h-1-3`, `.h-2-3`, `.h-1-4`, `.h-3-4` with matching `minh-*`, `maxh-*` variants

#### Resizable Sidebar (Opt-in)
- **New feature**: Drag-to-resize sidebar with mouse or touch
- **Opt-in via class**: Add `pa-layout__sidebar--resizable` to enable
- **Settings panel toggle**: New "Resizable" checkbox under Sidebar options
- **CSS variable for width**: `--pa-local-sidebar-width` allows dynamic width changes
- **Constraints**: Min 180px, max 500px width
- **localStorage persistence**: Width saved and restored across sessions
- **Early load**: Width applied in `<head>` before render to prevent flash
- **Double-click to reset**: Double-click the resize handle to restore default width (288px)
- **Visual feedback**: Accent-colored line appears on hover/drag
- **Smooth performance**: Uses `requestAnimationFrame` throttling for 60fps resize
- **Utility class override**: Width uses `:where()` for low specificity - `.wr-*` sets fixed width, `.minwr-*` sets minimum
- **Files**: `_sidebar.scss` (styles), `sidebar-resize.js` (functionality), `settings-panel.js` (toggle)

#### Profile Panel Width Override
- **CSS variables**: `--pa-local-profile-panel-width` (default 20vw) and `--pa-local-profile-panel-max-width` (default 48rem)
- **Utility class override**: Width uses `:where()` for low specificity - `.wr-*`, `.minwr-*`, `.maxwr-*` classes can override
- **Apply to `.pa-profile-panel__content`**: Add utility classes to the content element (e.g., `wr-25` for 250px)
- **Files**: `_profile.scss`

### Changed

#### Navbar Three-Section Layout (Left/Center/Right)
- **New structure**: Header content now organized into three explicit sections
  - `.pa-header__left` - Anchored to left edge (burger, brand, nav--left)
  - `.pa-header__center` - Flexible center section (title)
  - `.pa-header__right` - Anchored to right edge (nav--right, notifications, profile)
- **Robust layout**: Left/right sections stay in their corners regardless of center content
- **Mobile fix**: Notifications and profile no longer collapse to left when title is absent
- **Removed hacks**: Eliminated `margin-left: auto` workarounds from notifications and nav elements
- **Files updated**: `_navbar.scss`, `_navbar-elements.scss`, `_notifications.scss`, `navbar.mustache`, `layout.html` snippet

#### Footer Three-Section Layout (Left/Center/Right)
- **New structure**: Footer now mirrors navbar with three explicit sections
  - `.pa-footer__left` - Anchored to left edge (copyright)
  - `.pa-footer__center` - Flexible center section (optional content)
  - `.pa-footer__right` - Anchored to right edge (version info, links)
- **Expandable height**: Footer uses `min-height` instead of fixed `height`, allowing it to grow for multi-line content
- **Vertical modifier**: `.pa-footer__right--vertical` stacks items vertically with right-aligned text
- **Use case**: Display app/database versions and license links on the right while keeping copyright on left
- **Files updated**: `_layout-container.scss`, `layout.mustache`, `layout.html` snippet

#### Align-Self Utility Classes
- **New utilities**: Flexbox/grid child alignment classes
  - `.self-start` - Align to top (`align-self: flex-start`)
  - `.self-center` - Align to center (`align-self: center`)
  - `.self-end` - Align to bottom (`align-self: flex-end`)
  - `.self-stretch` - Stretch to fill (`align-self: stretch`)
  - `.self-baseline` - Align to baseline (`align-self: baseline`)
- **Use case**: Align individual flex children independently, e.g., copyright at top of expanded footer

### Fixed

#### Footer Mobile Responsive Layout
- **Wrap on narrow viewports**: Footer sections now wrap properly at mobile breakpoint (768px)
- **No overlap**: Left and right sections no longer overlap at narrow widths
- **Flexible sizing**: Sections can shrink on mobile (`flex-shrink: 1`, `min-width: 0`)
- **Center hidden**: Empty center section hidden on mobile to save space

#### Web Components Dark Mode Support
- **Added `data-theme` attribute**: Body element now receives `data-theme="dark"` or `data-theme="light"` when theme mode changes
- **Web-grid compatibility**: The `@keenmate/web-grid` component now properly displays in dark mode
- **Applies to all web components**: Any web component that looks for `data-theme` attribute on ancestors will now work
- **Files updated**: `layout.mustache` (FOUC prevention script), `settings-panel.js` (runtime mode switching)

### Added

#### Notifications Page View (`pa-notifications__list--page`)
- **New modifier**: `pa-notifications__list--page` for full-page notification listings
- **Larger display**: Increased padding, icon size, and font sizes for page context
- **Action buttons**: New `pa-notifications__actions` element with hover reveal
- **Select all**: Checkbox support for bulk selection
- **Bulk actions**: Mark as read, delete multiple notifications
- **Mobile responsive**: Actions always visible on mobile with separator border
- **Demo page**: New `/notifications` route with full working example
- **Files updated**: `_notifications.scss`, `notifications.mustache`, `server.js`, `sidebar.mustache`, `navbar.mustache`

#### Text Truncation Utility (`.text-truncate`)
- **New utility**: `.text-truncate` class for ellipsis text overflow
- **Properties**: `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`
- **Use case**: Truncate long text in buttons, badges, or any fixed-width container
- **Pair with width**: Combine with `.wr-*` classes for fixed width truncation
- **Files updated**: `_utilities.scss`

#### Grid Auto-Stack on Mobile
- **Mobile-first**: Base percentage and fraction columns auto-stack to 100% width below mobile breakpoint (768px)
- **Override with responsive classes**: Use `.pa-col-sm-*`, `.pa-col-md-*` etc. to maintain columns on mobile
- **Affected classes**: All `.pa-col-{n}` (5-95) and `.pa-col-{fraction}` classes
- **Files updated**: `_grid.scss`

#### Tabs as Card Header (`pa-tabs__container--card`)
- **New modifier**: `pa-tabs__container--card` makes tabs look like a card with tabs replacing the header
- **Height alignment**: Tabs row has explicit height matching card header (40px)
- **Use case**: Side-by-side layouts where tabs-card and regular card need aligned headers
- **Styling**: Same border, border-radius, background, and shadow as regular cards
- **Theme support**: Uses `$card-border-width` variable so themes control both

#### Tab Overflow Dropdown
- **New component**: `pa-tabs__overflow` with toggle button and dropdown menu
- **Overflow toggle**: Ellipsis button at end of tabs row for overflow tabs
- **Dropdown menu**: Hidden tabs appear in floating dropdown on click
- **Active indicator**: Toggle shows accent underline when active tab is in overflow
- **Click outside**: Dropdown closes when clicking outside
- **New classes**: `pa-tabs__overflow`, `pa-tabs__overflow-toggle`, `pa-tabs__overflow-menu`, `pa-tabs__overflow-toggle--has-active`

#### Inline Tabs in Card Headers (`pa-card__tabs--inline`)
- **New modifier**: `pa-card__tabs--inline` places tabs inside the card header row
- **Height alignment**: Cards with inline tabs have the same header height as cards without tabs
- **Styling**: Tabs appear as pill-style buttons with accent color on active state
- **New variables**: `$card-tab-inline-padding-v`, `$card-tab-inline-padding-h`

#### Card Border Width Variable
- **New variable**: `$card-border-width` controls card outer border (default: 1px)
- **Theme control**: Themes can override (e.g., Audi uses 2px via `$border-width-medium`)
- **Applied to**: Both `.pa-card` and `.pa-tabs__container--card`

#### Card Border Radius Variable
- **New variable**: `$card-border-radius` controls both card and header corner radius
- **Unified styling**: Card container and header now share the same border-radius value
- **Theme support**: Themes can set `$card-border-radius: 0` for square corners (e.g., Audi design language)
- **Audi theme**: Removed `!important` override, now uses variable

#### Tooltip Color Variants (color-1 through color-9)
- **New modifiers**: `pa-tooltip--color-1` through `pa-tooltip--color-9`
- **Theme-customizable**: Uses `--pa-color-*` CSS variables that themes can define
- **Floating UI support**: Works with both CSS-only and JavaScript floating tooltips
- **Default**: Colors are `transparent` unless theme defines `$color-1` through `$color-9`

#### Popover Alignment Modifiers
- **Default alignment**: Popover body now defaults to `text-align: left` (prevents inherited center alignment)
- **New modifiers**: `pa-popover--center` and `pa-popover--right` for explicit alignment control
- **Use case**: Rich content with lists now displays correctly regardless of parent alignment

#### Static Modal Modifier
- **New modifier**: `pa-modal--static` prevents closing via ESC key or backdrop click
- **Use case**: License agreements, critical confirmations, or required actions that must be explicitly acknowledged
- **Implementation**: Add class to modal wrapper, omit onclick from backdrop, optionally remove X button
- **JavaScript**: ESC handler must check for `--static` class before closing

### Changed

#### Unified Component Height System
- **Single source of truth**: All component heights now derive from `$base-input-size-*-height` variables in `_base.scss`
  - XS: 3.1rem (31px), SM: 3.3rem (33px), MD: 3.5rem (35px), LG: 3.8rem (38px), XL: 4.1rem (41px)
- **Explicit heights for inputs/selects**: `.pa-input` and `.pa-select` now have explicit `height` instead of padding-based sizing
- **Explicit heights for buttons**: `.pa-btn` and size variants now have explicit `height` matching input heights
- **Icon-only buttons aligned**: `$btn-icon-only-size-*` variables reference `$btn-height-*` which reference input heights
- **Result**: Inputs, buttons, and icon-only buttons at the same size variant are guaranteed to be the same height

#### Card Header Refinements
- **Reduced vertical padding**: `$card-header-padding-v` changed from 0.8rem to 0.5rem (8px → 5px)
- **Button negative margins**: Added `margin-top/bottom: -0.25rem` to buttons in card headers (same as table cells)
  - Prevents buttons from increasing header height beyond `min-height`
  - Card headers now maintain compact appearance with action buttons

### Fixed

#### Icon-Only Button Centering
- **Added `line-height: 1`** to `.pa-btn--icon-only`
  - Fixes vertical centering issues with icons and Unicode characters
  - Works with FontAwesome icons, Unicode symbols, and SVG icons
  - Standard practice for icon buttons across frameworks

---

## [1.0.0-rc04] - 2026-01-06

### Added

#### Sizing Utility Classes (Consolidation)
- **Rem-based utilities** (78 classes) - replaces component-specific `--w-1x` modifiers
  - Width: `.wr-1` to `.wr-10`, `.wr-15`, `.wr-20`, `.wr-25` (width in rem)
  - Min-width: `.minwr-1` to `.minwr-25` (min-width in rem)
  - Max-width: `.maxwr-1` to `.maxwr-25` (max-width in rem)
  - Height: `.hr-1` to `.hr-25` (height in rem)
  - Min-height: `.minhr-1` to `.minhr-25` (min-height in rem)
  - Max-height: `.maxhr-1` to `.maxhr-25` (max-height in rem)
- **Percentage min/max utilities** (88 classes) - extends existing `w-*` and `h-*`
  - Min-width: `.minw-5` to `.minw-100`, `.minw-1-3`, `.minw-2-3`
  - Max-width: `.maxw-5` to `.maxw-100`, `.maxw-1-3`, `.maxw-2-3`
  - Min-height: `.minh-5` to `.minh-100`, `.minh-1-3`, `.minh-2-3`
  - Max-height: `.maxh-5` to `.maxh-100`, `.maxh-1-3`, `.maxh-2-3`
- **Usage**: `<button class="pa-tabs__item minwr-6">` instead of `<button class="pa-tabs__item pa-tabs__item--w-6x">`

### Removed

#### Component-Specific Width Classes (Consolidated to Utilities)
- **Tabs**: Removed `pa-tabs__item--w-1x` to `--w-10x` and `--h-1x` to `--h-10x`
- **Badges**: Removed `pa-badge--w-1x` to `--w-10x` and auto-ellipsis selector
- **Buttons**: Removed `pa-btn--w-1x` to `--w-10x`
- **Migration**: Use new utility classes instead (e.g., `minwr-6` instead of `pa-tabs__item--w-6x`)

#### Button Group Gap Modifiers (Consolidated to Utilities)
- **Removed**: `pa-btn-group--compact` and `pa-btn-group--loose` modifiers
- **Removed variables**: `$btn-group-gap-compact`, `$btn-group-gap-loose`
- **Changed**: Default gap from 3.2px to 3px (`$btn-group-gap: 0.3rem`)
- **Migration**: Use `gap-*` utility classes instead (e.g., `gap-2` for compact, `gap-8` for loose)

#### Tabs Component
- **Border top variant**: New `.pa-tabs--border-top` modifier moves active indicator from bottom to top
  - Container border moves from bottom to top
  - Tab item active border moves from bottom to top
  - Useful for profile panel tabs and similar UI patterns

### Changed

#### Profile Panel Padding Architecture
- **Refactored to follow sidebar pattern**: Body now has vertical padding only, items handle horizontal
  - `__body` changed from `padding: $spacing-lg` to `padding: $spacing-lg 0`
  - Nav items extend edge-to-edge for proper hover backgrounds
  - Actions and favorites-add use `$profile-panel-content-padding` for horizontal padding
- **New variable**: `$profile-panel-content-padding: 1.6rem` - matches sidebar-padding horizontal (16px)
- **Updated tabs section**: Now uses `$profile-panel-content-padding` instead of `$spacing-lg`

### Fixed

#### Button/Input Size Alignment
- **Aligned button padding with input padding** - Buttons now match input heights at each size variant
  - XS: vertical padding 0.4rem → 0.6rem (matches input--xs)
  - SM: vertical padding 0.6rem → 0.8rem (matches input default)
  - LG: vertical padding 1.0rem → 0.8rem (matches input default)
  - XL: vertical padding 1.2rem → 0.8rem (matches input default)
- **Removed explicit min-height** from button size variants (natural sizing via padding)
- **Use case**: Buttons placed next to inputs of the same size now have matching heights

#### Profile Panel Theme Consistency
- **Header border**: Changed from `--pa-text-primary` to `--pa-border-color` (line 91)
- **Avatar icon color**: Changed from hardcoded `$accent-color` to `var(--pa-accent)` (line 118)
- **Tabs hover background**: Changed from hardcoded `rgba(255, 255, 255, 0.1)` to `var(--pa-accent-light)` (line 261)

---

## [1.0.0-rc03] - 2026-01-05

### Added

#### Profile Panel Enhancements
- **No-avatar variant**: New `.pa-profile-panel__header--no-avatar` modifier hides avatar for corporate apps without user photos
- **Text truncation**: Profile name now truncates with ellipsis for long display names
- **Close button spacing**: Added padding-right to info section to prevent text overlapping close button
- **Settings panel toggle**: Demo settings panel now includes "Hide Avatar" toggle to switch between avatar/no-avatar modes

---

## [1.0.0-rc02] - 2026-01-04

### Added

#### Profile Panel Favorites Feature
- **New favorites tab**: Profile panel now supports tabbed interface with Profile and Favorites tabs
- **Favorites section classes**: New dedicated classes for favorites list items
  - `.pa-profile-panel__favorites` - Favorites container
  - `.pa-profile-panel__favorite-item` - Clickable favorite item (uses `data-href` for navigation)
  - `.pa-profile-panel__favorite-icon` - Icon container
  - `.pa-profile-panel__favorite-label` - Text label
  - `.pa-profile-panel__favorite-remove` - Remove button (appears on hover)
  - `.pa-profile-panel__favorites-add` - Add button container
- **Profile panel tabs section**: `.pa-profile-panel__tabs` with themed styling
  - Uses existing `.pa-tabs` component
  - Tab switching via `data-profile-tab` and `data-profile-panel` attributes
- **Updated profile.html snippet**: Added "WITH TABS (PROFILE + FAVORITES)" section with complete example

#### Profile Panel Styling Alignment
- **Aligned profile nav items with sidebar**: Profile and Favorites items now match sidebar first-level links
  - Gap: `$sidebar-item-gap` (1.2rem = 12px)
  - Padding: `$sidebar-padding` (0.8rem 1.6rem = 8px 16px)
  - Icon font-size: `$font-size-base` (1.6rem = 16px)
  - Icon width: `$sidebar-icon-size` (2.4rem = 24px)
- **Increased favorite remove button hitbox**: Changed padding from `$spacing-xs` (2.5px) to `$spacing-sm` (5px)

#### Gap Utility Classes
- **New gap utilities**: Flexbox/grid gap classes to replace inline `style="gap: ..."`
  - Semantic: `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-base`, `.gap-lg`, `.gap-xl`, `.gap-2xl`
  - Numeric (10px rem base): `.gap-1` through `.gap-20` (1px to 20px)
  - Row-only: `.row-gap-xs`, `.row-gap-sm`, `.row-gap-md`, `.row-gap-base`, `.row-gap-lg`
  - Column-only: `.column-gap-xs`, `.column-gap-sm`, `.column-gap-md`, `.column-gap-base`, `.column-gap-lg`

#### Font-Size Utility Classes
- **New text-size utilities**: Direct font-size classes using typography variables (10px rem base)
  - `.text-2xs` (10px), `.text-xs` (12px), `.text-sm` (14px), `.text-md` (15px)
  - `.text-base` (16px), `.text-lg` (18px), `.text-xl` (20px)
  - `.text-2xl` (24px), `.text-3xl` (28px), `.text-4xl` (32px)

#### Width Utility Classes (Expanded)
- **New 5% increment widths**: `.w-5`, `.w-10`, `.w-15`, `.w-20`, `.w-30`, `.w-35`, `.w-40`, `.w-45`, `.w-55`, `.w-60`, `.w-65`, `.w-70`, `.w-80`, `.w-85`, `.w-90`, `.w-95`
- **Fraction widths with grid-consistent naming**: `.w-1-3` (33%), `.w-2-3` (66%)
- **Min-width fractions**: `.mw-1-3`, `.mw-2-3`
- **Fixed-width fractions**: `.w-1-3-fixed`, `.w-2-3-fixed`

#### Border Style Utilities
- **New border style classes**: `.border-solid`, `.border-dashed`, `.border-dotted`, `.border-none`

#### Text Color Utilities
- **Semantic text colors**: `.text-primary`, `.text-success`, `.text-danger`, `.text-warning`, `.text-info`
  - Fixed: now use proper `--pa-*-text` variables instead of `--pa-*-bg`
  - Moved from `_tables.scss` to `utilities.scss` (general-purpose)
- **Custom theme color slots**: `.text-color-1` through `.text-color-9`
  - Themes can override `$color-1` to `$color-9` to define branded colors
  - CSS variables: `--pa-color-1` through `--pa-color-9`

#### Callout Component (New)
- **Documentation-style callouts**: Left border accent with subtle background
  - Base: `.pa-callout`
  - Variants: `--primary`, `--secondary`, `--success`, `--danger`, `--warning`, `--info`
  - Sizes: `--sm`, `--lg`
  - Elements: `__icon`, `__heading`, `__content`
- **Use case**: Tips, notes, warnings in documentation and content areas
- **Variable**: `$callout-border-width` (default: 0.4rem / 4px)

### Changed

#### Card System Refinements
- **Reduced card header min-height**: `$card-header-min-height` changed from `5rem` (50px) to `4rem` (40px)
  - Header now fits xs buttons (32px) with 4px breathing room on each side
  - More compact card appearance while maintaining usability
- **Split card body padding into h/v variants**: `$card-body-padding` split into separate variables
  - `$card-body-padding-v: 1.6rem` (vertical padding, unchanged)
  - `$card-body-padding-h: 1rem` (horizontal padding, reduced from 1.6rem)
  - Allows independent control of horizontal and vertical body padding
- **Unified horizontal padding**: All card sections now use consistent 1rem horizontal padding
  - `$card-header-padding-h: 1rem` (reduced from 1.6rem)
  - `$card-body-padding-h: 1rem` (reduced from 1.6rem)
  - `$card-footer-padding-h: 1rem` (reduced from 1.6rem)
  - Content alignment now consistent across header, body, and footer

### Fixed

#### Card Title Vertical Alignment
- **Fixed icon/text misalignment in card headers**: Added `line-height: 1` to `.pa-card__title-text`
  - Icon had `line-height: 1` but title text did not, causing vertical misalignment
  - Both icon and text now vertically centered within card title

---

## [1.0.0-rc01] - 2026-01-01

First release candidate for Pure Admin v1.0.0.

### Fixed - 2026-01-01

#### Dark Mode Navbar Dropdown Visibility
- **Express theme**: Fixed dropdown items unreadable in dark mode
  - Changed `&__nav ul li a` to `&__nav > ul > li > a` (direct child selector)
  - Allows dropdown links to use CSS variables (`--pa-text-primary`) as intended
- **Corporate theme**: Added dark mode dropdown override
  - White text (`#f1f5f9`) on dark dropdown background
  - Blue hover state (`#38bdf8`) for consistency

#### Express Theme Dark Mode Fixes
- **Footer text**: Fixed white text on yellow background (unreadable)
  - Added `.pa-layout__footer` dark mode override with dark text color
- **Primary alert**: Fixed red text on red background (low contrast)
  - Added white text with semi-transparent red background in dark mode

#### Theme Manifest System
- **New JSON schema**: `packages/core/schemas/pure-admin-theme.schema.json`
  - Defines theme capabilities: modes, colorVariants, features, colors, fonts
- **Theme manifests**: Added `theme.json` to all 5 theme packages
  - Declares supported modes (light/dark), color variants, features
- **API endpoints**: `/api/themes/manifests`, `/api/themes/:theme/manifest`
- **Dynamic settings panel**: Reads theme capabilities from manifests
  - Mode selector shows/hides based on theme support
  - Color variant selector populated from manifest

#### Dark Theme Consolidation
- **Consolidated 4 files into 1**: Merged dark-blue, dark-green, dark-red into dark.scss
  - Color variants now use CSS classes: `.pa-color-blue`, `.pa-color-green`, `.pa-color-red`
- **Updated package exports**: Single CSS output with runtime color switching

### Fixed - 2025-12-25

#### Dark Theme Compatibility in Demo Views & Snippets
- **Fixed 78 inline styling issues** across demo views and snippets that broke dark theme support
- **Code blocks**: Replaced hardcoded `background: #f5f5f5` with `.pa-code` class
  - Files: comparison.mustache, smart-filters.mustache, file-selector.mustache, loaders.mustache, tables-sizing.mustache, tooltips.mustache
- **Text colors**: Replaced hardcoded `#666`, `#888` with `var(--base-text-color-3)`
  - Files: checkbox-lists.mustache, file-selector.mustache, smart-filters.mustache, table-filters.mustache
- **Background colors**: Replaced `white`, `#f8f9fa`, `#f9f9f9` with CSS variables
  - Files: date-picker.mustache, multiselect.mustache, table-multi-select.mustache, virtual-scroll.html
- **Border colors**: Replaced `#ddd`, `#e0e0e0` with `var(--base-border-color)`
  - Files: loaders.mustache, smart-filters.mustache, table-filters.mustache, theme-variables.mustache
- **Semantic colors**: Replaced hardcoded hex values with CSS variables
  - `#10b981` → `var(--base-success-color)` (comparison.mustache, virtual-scroll-code.mustache)
  - `#dc3545` → `var(--base-danger-color)` (loaders.mustache, grid.mustache)
  - `#28a745` → `var(--base-success-color)` (loaders.mustache, grid.mustache)
  - `#ffc107` → `var(--base-warning-color)` (loaders.mustache)
  - `#17a2b8` → `var(--base-info-color)` (loaders.mustache)
  - `#007bff` → `var(--base-primary-color)` (loaders.mustache)
- **Layout styles**: Converted inline flex/display styles to utility classes
  - `flex: 1` → `flex-grow-1` (tabs.html)
  - `text-align: center/right` → `text-center`/`text-right` (forms.html)
  - `width: 100%` → `w-100` (toasts.html)
  - `display: none` → `d-none` (virtual-scroll.html)

#### Invalid Column Class Names
- **Fixed 140+ occurrences** of non-existent column classes across all demo views
  - `pa-col-md-33` → `pa-col-md-1-3` (132 occurrences in 18 files)
  - `pa-col-md-67` → `pa-col-md-2-3` (8 occurrences in 5 files)
  - `pa-col-md-17` → `pa-col-md-15` (nearest 5% increment)
  - `pa-col-md-83` → `pa-col-md-85` (nearest 5% increment)
- **Grid system note**: Column classes use either 5% increments (5, 10, 15...100) or fractions (1-2, 1-3, 2-3, 1-4, 3-4)

#### Sidebar Active Item Shift (Audi Theme)
- **Fixed 3px horizontal shift** when selecting sidebar menu items in Audi theme
- **Root cause**: Audi theme added `border-left` on active state without reserving space in non-active state
- **Solution**: Added transparent left border to `.pa-sidebar__link` base state to reserve space
  - Non-active: `border-left: 3px solid transparent`
  - Active: `border-left-color: $accent-color` (only changes color, not width)
- **File**: `src/scss/themes/audi.scss`

#### SCSS Module Loop Errors
- **Fixed build-breaking module loops** caused by naming collisions between `_name.scss` files and `name/` directories
- **Pattern**: Aggregator files using `@forward 'name'` were ambiguous - SASS couldn't distinguish between the file and directory
- **Solution**: Changed to explicit paths using `@forward 'name/index'`
- **Files fixed**:
  - `_variables.scss` - `@forward 'variables'` → `@forward 'variables/index'`
  - `_core.scss` - `@forward 'variables'` → `@forward 'variables/index'`
  - `core-components/_layout.scss` - `@forward 'layout'` → `@forward 'layout/index'`
  - `core-components/_badges.scss` - `@forward 'badges'` → `@forward 'badges/index'`
  - `core-components/_forms.scss` - `@forward 'forms'` → `@forward 'forms/index'`

### Changed - 2025-12-20

#### Workspace Migration
- **Converted to npm workspace**: Restructured repository as npm workspace (like svelte-fluentui)
  - Root `package.json` with `"workspaces": ["packages/*", "demo"]`
  - Core package moved to `packages/core/`
  - Demo site moved to `demo/` (Express.js + Mustache)
  - Single `npm install` at root installs all dependencies
- **New directory structure**:
  ```
  pure-admin/
  ├── package.json          # Workspace root
  ├── Makefile              # Build commands
  ├── packages/core/        # @keenmate/pure-admin-core
  └── demo/                 # Demo site (not published)
  ```
- **Demo server path updates**: `server.js` now references `../packages/core/` for static files
- **Build scripts**: Added `build:themes` and `build:all` scripts
- **Legacy directories preserved**: `pure-admin-visual/` and `pure-admin-core/` kept for reference

### Added - 2025-10-08

#### Layout System Improvements
- **Footer height standardization**: Footer now uses `$footer-height: $header-height` (3rem/48px) for visual balance
- **Footer restructuring**: Moved footer outside `.pa-layout__inner` to fix positioning issues with short content
  - Footer always appears at bottom of viewport, even with minimal content
  - Changed from `min-height` to `height` for consistent sizing
  - Added `m-0` class to footer paragraph to prevent margin overflow

#### Timeline Block Component Enhancements
- **Independent layout modifiers**: Control alignment and responsive behavior separately
  - `--left`: All timeline items on left side
  - `--right`: All timeline items on right side
  - `--keep-layout`: Prevent mobile collapse, maintain desktop layout at all screen widths
- **Responsive behavior**: Automatic single-column layout on screens ≤767px (unless `--keep-layout` used)
- **Combination support**: Mix alignment + responsive modifiers (e.g., `--left --keep-layout`)
- **Padding optimization**: Removed redundant card body padding from aligned timelines
- **New examples**: Added comprehensive demonstration of all timeline modifiers on timeline-block page

#### Command Palette
- **Background fix**: Changed from `$primary-bg` to `$modal-content-bg` for better visibility in dark themes

### Fixed - 2025-10-08

#### Layout Issues
- **Sidebar restoration**: Fixed critical bug where sidebar styles were accidentally removed during layout consolidation
  - Restored all `.pa-sidebar__*` classes (item, link, toggle, icon, label, submenu, chevron)
  - Added sidebar hidden state styles (`.sidebar-hidden`)
  - Added icon-collapse mode styles with flyout menus
  - Added responsive mobile/tablet styles
- **Footer positioning**: Fixed footer appearing mid-screen with short content
  - Implemented flexbox-based layout: `.pa-layout` (flex column) → `.pa-layout__inner` (flex: 1) → `.pa-layout__footer` (flex-shrink: 0)
  - Footer now correctly positioned at bottom in both sticky and scroll modes

### Changed - 2025-10-08

#### File Consolidation
- **Layout files merged**: Consolidated `_layout.scss` and `_layout-v2.scss` into single file
  - Kept clean flexbox structure from v2 (removed complex absolute positioning)
  - Merged header/navbar styles from original file
  - Deleted backup files and updated imports in `_core.scss`

### Added - 2025-10-05

#### Comprehensive Component Snippets for LLM Consumption
- **Created comprehensive snippet documentation** for all framework components
  - **Purpose**: Prevent LLMs from making incorrect assumptions about available options
  - **Context**: Another Claude instance assumed only 1-2 badge sizes existed due to incomplete snippets
- **New snippet files**:
  - `snippets/grid.html` - Complete PureCSS grid reference
    - All fractions: halves, thirds, quarters, fifths, sixths, eighths, twelfths, twenty-fourths
    - All responsive variants: `pure-u-sm-*`, `pure-u-md-*`, `pure-u-lg-*`, `pure-u-xl-*`
    - Nested grid examples and dashboard layouts
  - `snippets/tooltips.html` - Complete tooltip and popover reference
    - All 4 positions: top, right, bottom, left
    - All 5 color variants: default, primary, success, warning, danger
    - Multiline tooltips
    - Auto-flip smart positioning classes
    - Popover component with all sizes (sm, md, lg) and positions
    - Rich content examples (lists, code blocks, links)
    - Complete JavaScript API reference
- **Enhanced existing snippets**:
  - `alerts.html` - Added missing `--lg` size (sm, default, lg now all documented)
  - `badges.html` - Added large badge example (was missing from snippet)
  - `cards.html` - Added missing variants and sub-components:
    - `--warning` variant (was undocumented)
    - `--stat` variant for statistics cards
    - `.pa-card__title` components (icon + text)
    - `.pa-card__meta` for metadata
    - Footer actions pattern
    - No-padding body variant for tables
    - Tab content areas with JavaScript
    - Section component
  - `tables.html` - Major cleanup and additions:
    - Fixed incorrect class names (`--hover`, `--bordered`, `--compact` removed as they don't exist)
    - Corrected spacing classes: `--spacing-2x/3x` → `--2x/3x`
    - Added table container (`.pa-table-container`)
    - Added pager component examples (all 3 positions)
    - Added load more component (all states and positions)
    - Comprehensive modifier reference at end
- **Status**: All 14 snippet files now comprehensive
  - ✅ alerts.html, badges.html, buttons.html, cards.html
  - ✅ forms.html, grid.html, layout.html, loaders.html
  - ✅ modals.html, profile.html, tables.html, toasts.html
  - ✅ tooltips.html, utilities.html

#### Performance Optimizations
- **Page loader timing improvements**:
  - Removed 100ms "font settle" delay (unnecessary wait after fonts load)
  - Reduced timeout fallback: 3s → 1s
  - Reduced DOM removal delays: 150ms → 80ms
  - **Total improvement**: ~100-200ms faster perceived load time
  - Kept necessary delays: 150ms transition, 50ms body.loaded (prevents layout jumps)
- **Fixed font-size FOUC** (Flash of Unstyled Content):
  - Font-size now applied immediately in inline script (before rendering)
  - Previously applied on DOMContentLoaded, causing 1.15-1.25x size jump
  - Moved from `loadSettings()` function to immediate FOUC prevention script
  - Matches pattern used for sidebar-hidden and compact-mode
- **Fixed scrollbar layout shift**:
  - Added `overflow-y: scroll` to body
  - Forces scrollbar gutter to always be present
  - Prevents ~15px horizontal shift when navigating between short/long pages
  - Consistent layout across all pages

### Added - 2025-10-05 (Afternoon Session)

#### Comparison Table Component
- **New component**: `.pa-comparison-table` for version control, data changes, and A/B comparisons
  - **Two-column layout**: Base vs New (version detail pattern)
  - **Three-column layout**: Base vs Change A vs Change B (A/B testing pattern)
  - **Change highlighting**: `.pa-comparison-table__changed` with pink background and left border accent
    - Background: `rgba(244, 114, 182, 0.15)`
    - Left border: 3px solid `#ec4899` (pink-500)
    - Solid variant: `--solid` modifier removes border, intensifies background
  - **Conflict highlighting**: `.pa-comparison-table__conflict` for conflicting changes
    - Background: `rgba(251, 146, 60, 0.15)`
    - Left border: 3px solid `#f97316` (orange-500)
    - Solid variant available
  - **Section headers**: Grouping rows by category (Address Data, Address Metadata, etc.)
  - **Copy-to-clipboard buttons**: Card header integration for copying table content
  - **Rich content support**: Icons, badges, status indicators in cells
  - **Works in cards**: `.pa-card__body--no-padding` for seamless integration
- **New page**: `/comparison` with comprehensive examples
- **SCSS Variables**:
  - Uses existing `$border-width-medium`, `$primary-bg`, `$text-secondary`
  - Change colors hardcoded (pink-500, orange-500) for consistency across themes
- **Snippet**: `snippets/comparison.html` with 2-column and 3-column patterns

#### Lists Component System
- **New component**: Styled HTML lists (ul, ol, dl) with multiple variants
  - **Basic lists**: `.pa-list-basic` with proper spacing and styling
  - **Ordered lists**: `.pa-list-ordered` with number/letter/roman variants
  - **Definition lists**: `.pa-list-definition` for term/description pairs
- **List modifiers**:
  - `.pa-list-basic--compact`: Reduced spacing for dense content
  - `.pa-list-basic--spacious`: Increased spacing
  - `.pa-list-basic--unstyled`: No bullets, no padding
  - `.pa-list-basic--inline`: Horizontal layout
  - `.pa-list-basic--bordered`: Add borders between items
  - `.pa-list-basic--striped`: Zebra striping
  - `.pa-list-basic--icon`: Checkmarks (combine with `--danger`, `--info`, `--warning` for variants)
  - `.pa-list-ordered--roman`: Roman numerals
  - `.pa-list-ordered--alpha`: Lowercase letters
  - `.pa-list-definition--inline`: Horizontal key-value pairs
- **Features**:
  - All spacing controlled by SCSS variables (`$spacing-sm`, `$spacing-base`, `$spacing-lg`)
  - Border colors use `$border-color` for theme consistency
  - Icon lists use `$success-bg` for checkmark color
  - Works in cards with no-padding modifier
- **New page**: `/lists` with comprehensive examples
- **Snippet**: `snippets/lists.html` with all list variants

#### Multilevel Flyout Menus
- **Enhanced sidebar**: Multilevel menus now display as flyouts when sidebar is in icon-collapse mode
  - **Hover activation**: Flyout menus appear on hover over parent items
  - **Cascading submenus**: Third-level menus fly out to the right from second-level
  - **Smart positioning**: Absolute positioning relative to parent items
  - **Visual styling**: Border, box shadow, and proper background colors
  - **Chevron direction**: Arrows point right (›) in flyouts instead of down
- **Implementation**:
  - Added `position: relative` to `.pa-sidebar__item` for flyout positioning
  - Flyout menus use `position: absolute`, `left: 100%`, `top: 0`
  - Min-width: 12rem for readable menu items
  - Z-index layering: level 2 (1001), level 3 (1002)
  - Removed transform rotation from chevrons in flyout mode
- **Demo content**: Added extensive demo menu items at levels 2 and 3 for testing
  - System Settings with 4 sub-items
  - User Settings with 3 sub-items
  - Advanced with 3 sub-items
  - Appearance and Integrations items
- **SCSS updates**: `src/scss/core-components/_layout.scss` with flyout-specific styles
- **Hover persistence**: Menus stay visible when hovering over submenu itself

### Changed - 2025-10-05 (Afternoon Session)

#### Page Title Styling
- **Enhanced navbar page title** to stand out more:
  - Font size: `$font-size-lg` (1.125rem / 18px)
  - Font weight: `$font-weight-semibold` (600)
  - Color: `$text-primary` (more prominent than previous secondary color)
- **Location**: `.pa-navbar__title` in `src/scss/core-components/_layout.scss`

#### Duplicate Page Titles Cleanup
- **Removed duplicate h1/h2 page titles** from multiple pages (title now shows in navbar):
  - `views/dashboard.ejs` - Removed "Dashboard" h2
  - `views/loaders.ejs` - Removed "Loaders & Spinners" h2
  - `views/tables-lazy.ejs` - Removed "Lazy Loading Tables" h2
  - `views/tables-sizing.ejs` - Removed "Table Sizing & Spacing" h2
  - `views/tooltips.ejs` - Removed "Tooltips & Popovers" h2
- **Result**: Cleaner page layout with title visible in fixed navbar

#### Sidebar Navigation
- **Updated Modal Windows icon**: Changed from 🪟 (missing icon) to 🔳 (visible square)
- **Added Lists menu item**: New sidebar link to `/lists` page (📃 icon)

### Fixed - 2025-10-05 (Afternoon Session)

#### Modal Layout Shift
- **Fixed horizontal shift** when modals open/close:
  - **Problem**: Opening modal hides scrollbar, causing ~15px horizontal layout shift
  - **Solution**: Calculate scrollbar width and compensate with padding
  - **Implementation**:
    ```javascript
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth + 'px';
    ```
  - **Location**: `views/modals.ejs` in `openModal()` and `closeModal()` functions
  - **Result**: Smooth modal transitions with no layout jump

#### Profile Name Visibility (Dark Themes)
- **Fixed gray text on dark background** in Dark Blue, Dark Green, Dark Red themes:
  - **Problem**: Profile name "John Doe" appeared gray on dark blue header (poor contrast)
  - **Solution**: Added `$header-profile-name-color: #ffffff` to all three dark themes
  - **Files**: `src/scss/themes/dark-blue.scss`, `dark-green.scss`, `dark-red.scss`
  - **Result**: White profile name text visible on all dark headers

#### Sidebar Icon-Collapse Mode
- **Fixed multiple issues** with "Show Icons Only" sidebar behavior:

  **Issue 1: Icons invisible in collapsed mode**
  - **Problem**: `.sidebar-hidden .pa-sidebar` set `opacity: 0`, hiding icons completely
  - **Solution**: Added `opacity: 1` to `.sidebar-hidden .pa-sidebar--icon-collapse` to override
  - **Location**: `src/scss/core-components/_layout.scss`

  **Issue 2: Burger menu icons inverted**
  - **Problem**: Hamburger (☰) showed when sidebar expanded, X showed when collapsed
  - **Expected**: Hamburger when collapsed, X when expanded
  - **Solution**: Rewrote `toggleSidebar()` function with correct logic
  - **Location**: `views/layout.ejs`

  **Issue 3: Body class "sidebar-hidden" added in icon-collapse mode**
  - **Problem**: Both `pa-sidebar--icon-collapse` and `sidebar-hidden` classes added, causing conflicts
  - **Solution**: Modified logic to only add `sidebar-hidden` when behavior is 'hide', not 'icon-collapse'
  - **Location**: `views/layout.ejs` in sidebar behavior initialization

  **Issue 4: Toggle behavior incorrect in icon-collapse mode**
  - **Problem**: Clicking burger in icon-collapse mode didn't properly toggle between icon bar and full width
  - **Solution**: Added dedicated icon-collapse logic in `toggleSidebar()` function
  - **Result**:
    - Icon-collapse mode: Toggle between narrow icon bar and full-width sidebar
    - Hide mode: Toggle between hidden and visible sidebar

- **Files modified**:
  - `src/scss/core-components/_layout.scss` - CSS fixes for opacity and icon visibility
  - `views/layout.ejs` - JavaScript fixes for burger menu and sidebar toggling

#### Comparison Table Solid Modifier
- **Fixed background color override**:
  - **Problem**: `.pa-table td` background was overriding `--solid` modifier
  - **Solution**: Added `!important` to `.pa-comparison-table__changed--solid` background-color
  - **Location**: `src/scss/core-components/_comparison.scss`
  - **Result**: Solid variant now displays intensified background instead of left border

### Fixed - 2025-10-05

#### Profile Name Visibility
- **Added `$header-profile-name-color` variable** (`_variables.scss:275`)
  - Default: `$text-primary` (works for light headers)
  - Audi Light override: `#ffffff` (light text on dark header)
  - Corporate override: `#ffffff` (light text on dark header)
- **Applied to `.pa-header__profile-name`** (`_profile.scss:36`)
- **Result**: "John Doe" profile name now visible on all themes

### Added - 2025-10-04

#### Audi Light Theme
- **New light theme variant**: `audi-light.scss` - Light version of Audi theme
  - Maintains Audi's signature elements:
    - Fira Sans Condensed font
    - Bright red accent color (#ff0000)
    - Sharp 1px border radius
    - Red primary/danger buttons
  - Light color scheme:
    - White cards and content areas
    - Light gray backgrounds (#f1f3f5)
    - Dark sidebar and header (#1a1a1a) for contrast
    - Dark text on light backgrounds
  - Red table hover accent (left border)
  - Available in theme selector dropdown

#### Horizontal Form Layouts
- **New form modifier**: `.pa-form-group--horizontal` for label-left, input-right layout
  - Labels automatically align with input top edge
  - Input/select/textarea uses `flex: 1` (fills remaining space)
  - No nested grids needed inside form groups
  - CSS-only solution (no complex HTML structure)
- **Comprehensive snippets**: Added horizontal form examples to `snippets/forms.html`
  - Single field examples (input, select, textarea)
  - Multi-column layouts with equal widths
  - Multi-column layouts with varying widths (1/4 + 5/12 + 1/3)
  - Complete form example with multiple rows
- **Clean pattern**:
  ```html
  <div class="pure-u-1 pure-u-md-1-3">
    <div class="pa-form-group pa-form-group--horizontal">
      <label>Label</label>
      <input class="pa-input">
    </div>
  </div>
  ```

### Changed - 2025-10-03

#### PureCSS Grid Architecture Refactor
- **Moved grid imports from themes to core**: PureCSS grid now imported in `_core.scss` instead of each theme file
  - **Before**: Each theme imported `purecss-grid` and `purecss-grid-responsive`, causing ~15KB duplication per theme
  - **After**: Grid imported once in `_core.scss`, all themes inherit from core
  - **Benefit**: Eliminates code duplication across 8 theme files (corporate, audi, express, minimal, dark, dark-blue, dark-green, dark-red)
- **Made main.css fully functional standalone**: `main.css` now includes grid foundation
  - Previously `main.css` referenced grid classes that didn't exist
  - Now core contains everything needed for complete functionality
- **Improved theme architecture**: Themes only override variables and import core
  - Aligns with design principle: "core contains everything, themes customize"
  - Cleaner separation of concerns: foundation → variables → components
- **Updated all 8 theme files**: Removed redundant grid imports
- **Verified builds**: Both `pure-admin-visual` and `pure-admin-core` compile successfully

### Added - 2025-10-03

#### Toast Notification System
- **New toast component**: `.pa-toast` with fixed-position containers and smooth animations
- **Toast containers**: `.pa-toast-container` with 6 position variants
  - Top: `--top-right`, `--top-center`, `--top-left`
  - Bottom: `--bottom-right`, `--bottom-center`, `--bottom-left`
  - Global containers placed at body level in `layout.ejs`
- **Toast variants**: 5 color styles matching button colors
  - Primary, Success, Danger, Warning, Info
  - Border-based styling with colored icon backgrounds
  - Colored progress bars for auto-dismiss feedback
- **Features**:
  - Smooth slide-in/out animations (directional based on position)
  - Auto-dismiss with configurable duration (default: 5 seconds)
  - **Persistent toasts**: Manual dismiss only variant (no auto-dismiss, no progress bar)
  - Progress bar showing time remaining before auto-dismiss
  - Icon + title + message structure
  - Close button with hover states
  - Automatic stacking with gap spacing
  - Responsive mobile behavior (full width with margin)
- **SCSS Variables**:
  - `$z-index-toast: 1200` (highest z-index, above header dropdowns)
  - `$toast-min-width: 20rem`, `$toast-max-width: 25rem`
  - `$toast-padding-v/h: $spacing-md`
  - `$toast-icon-size: 2rem`, `$toast-close-size: 1.5rem`
  - `$toast-progress-height: 3px`
- **JavaScript API**:
  - `createToast(position, variant, title, message, duration, showProgress, persistent)`
  - `dismissToast(toastId)` for manual dismissal
  - Helper functions for common toast patterns
- **Demo page**: `/toasts` with comprehensive examples
  - Position demonstrations
  - Variant buttons
  - Progress bar toast
  - Persistent toasts (warning, danger, info)
  - Action toasts (upload success, save error)
  - Multiple toast stacking demo
- **Navigation**: Added "Toasts" link to Components → More dropdown

### Fixed - 2025-10-03

#### Dark Theme Header Border Colors
- **Added `$header-border-color` to dark themes**: Dark Red, Dark Green, Dark Blue
  - Each theme now uses its respective border color variable
  - Consistent visual separation between header and sidebar
  - Matches existing border color scheme for each theme

#### Sidebar Mode Settings
- **Fixed cookie handling**: Sidebar mode now properly saves empty string for default mode
  - Changed from truthy check to explicit `!== undefined` check
  - Allows "Scrolls with Content" mode (empty string) to update cookie correctly
  - Prevents getting stuck in "Fixed + Auto-hide" mode
- **Fixed missing variable declaration**: Added `sidebarModeSelector` constant
- **Added reset functionality**: "Reset Settings" button now resets sidebar mode to default
- **Consistent pattern**: Uses dedicated `switchSidebarMode()` function like `switchTheme()`

#### Modal Z-Index Stacking
- **Fixed modal backdrop covering content**: Corrected z-index values
  - Backdrop: Changed from `$z-index-base` (1) to `$z-index-modal-backdrop` (1040)
  - Container: Changed from `$focus-outline-width` (2px) to `$z-index-modal` (1050)
  - Modal container now properly appears in front of backdrop

#### Toast Z-Index and Positioning
- **Fixed toast containers behind header**: Moved toast containers to body level in `layout.ejs`
  - **Problem**: Containers were nested in content area, creating separate stacking context
  - **Solution**: Moved to body level as siblings with header
  - Increased z-index from 1080 to 1200 to ensure visibility above header dropdown (1100)
  - Toast containers now global and work on all pages

### Added - 2025-10-02

#### Badge Group Component
- **New component**: `.pa-badge-group` for displaying collections of badges with automatic overflow handling
- **Features**:
  - Automatic limit on visible badges (default: 5 badges)
  - "More" indicator badge shows remaining count (e.g., "» 10 more")
  - Flexbox layout with wrapping support
  - Configurable gap between badges via `$badge-group-gap` (default: 0.5rem)
- **SCSS Variables**:
  - `$badge-group-gap`: Spacing between badges in group (default: 0.5rem)
  - `$badge-group-visible-limit`: Number of badges to show before hiding extras (default: 5)
- **Modifiers**:
  - `.pa-badge-group--show-all`: Override limit and display all badges (useful for expanded states)
- **Usage Pattern**:
  ```html
  <div class="pa-badge-group">
    <span class="pa-badge pa-badge--primary">Tag 1</span>
    <span class="pa-badge pa-badge--info">Tag 2</span>
    <!-- ... more badges ... -->
    <span class="pa-badge pa-badge--secondary">
      <span class="pa-badge__icon">»</span>
      10 more
    </span>
  </div>
  ```
- **Wrapping behavior**: Narrow container demo shows proper wrapping in constrained spaces (1/6 width example)
- **Future ready**: Designed for Svelte component with per-instance limit configuration

#### Fixed-Width Badges with Ellipsis
- **New badge width classes**: `pa-badge--w-1x` through `pa-badge--w-10x` (1rem to 10rem)
- **Features**:
  - Automatic text truncation with ellipsis (`...`) for overflow
  - Both `min-width` and `max-width` set to ensure consistent sizing
  - Vertical alignment preserved with `vertical-align: middle`
  - Works with all badge variants (sm, pill, colors)
- **Tooltip integration**:
  - Fixed-width badges wrapped in `.pa-tooltip` containers show full text on hover
  - Outer wrapper handles tooltip pseudo-elements with visible overflow
  - Inner badge handles text truncation with hidden overflow
  - Eliminates conflict between ellipsis and tooltip rendering
- **Usage Pattern**:
  ```html
  <span class="pa-tooltip pa-tooltip--bottom" data-tooltip="Full text here">
    <span class="pa-badge pa-badge--primary pa-badge--w-5x">Full text here</span>
  </span>
  ```
- **Examples**: Practical demonstrations of consistent-width tags, status badges, and technology tags
- **All spacing variable-controlled**: No hardcoded values, fully themeable

### Changed - 2025-02-10

#### SCSS Variable Consolidation - Complete Framework Audit
- **Eliminated all hardcoded values**: Audited and replaced 59 hardcoded values across 12 component files
- **Added 50+ new SCSS variables** for complete theme control:
  - **Breakpoints**: `$mobile-breakpoint` (768px), `$tablet-breakpoint` (1024px), `$tablet-breakpoint-min` (769px), `$sidebar-width-tablet` (10rem)
  - **Opacity values**: `$alert-secondary-bg-opacity`, `$alert-light-bg-opacity`, `$card-tab-hover-opacity`, `$bg-pattern-opacity`, `$popover-code-bg-opacity`, `$modal-warning-hover-bg-opacity`
  - **Background pattern**: `$bg-pattern-circle-1-x/y`, `$bg-pattern-circle-2-x/y`, `$bg-pattern-gradient-start/stop`
  - **Form system**: `$checkbox-margin-top`, `$form-group-margin-compact`
  - **Button widths**: `$btn-width-1x` through `$btn-width-10x` (1rem to 10rem)
  - **Loader animations**: `$loader-dots-delay-1/2`, `$loader-bars-delay-1` through `$loader-bars-delay-5`, `$loader-pulse-duration`, `$loader-pulse-easing`
  - **Loader sizes**: Consolidated to base `$spinner-size` variable
  - **Statistics**: `$stat-square-number-min/scale/max`, `$stat-square-symbol-min/scale/max`, `$stat-text-shadow-*`, `$stat-drop-shadow-*`
  - **Profile panel**: `$profile-role-letter-spacing`, `$profile-panel-mobile-max-width`
  - **Settings panel**: `$settings-panel-transition-duration`, `$settings-panel-transition-easing`
  - **Tables**: `$virtual-table-cell-padding-v/h`
  - **Tooltips**: `$popover-code-padding-v/h`, `$popover-code-font-scale`
  - **Badges**: Removed `$badge-padding-h-sm` (theme-controlled via base variable)

#### Component vs Theme Variable Separation
- **Removed all size-specific padding variables**: Components now use only base variables
  - Removed: `$input-padding-xs-v/h`, `$input-padding-sm-v/h`, `$input-padding-xl-v/h`
  - Removed: `$btn-padding-xs-v/h`, `$btn-padding-sm-v/h`, `$btn-padding-lg-v/h`, `$btn-padding-xl-v/h`
  - Removed: `$alert-padding-sm-v/h`, `$alert-padding-lg-v/h`
  - Removed: `$spinner-border-width-lg/xl`
  - Removed: `$loader-size-md/2xl`, `$loader-border-width-lg`, `$loader-dot-size-lg`, `$loader-bar-width-lg`
  - Removed: `$profile-avatar-size-sm`
- **Updated component size modifiers**: Size variants (`--xs`, `--sm`, `--lg`, `--xl`) now only change font-size
  - **Inputs**: All sizes use `$input-padding-v/h`, only font-size changes
  - **Buttons**: All sizes use `$btn-padding-v/h`, only font-size changes
  - **Alerts**: All sizes use `$alert-padding-v/h`, only font-size changes
  - **Badges**: `--sm` uses `$badge-padding-v/h`, only font-size changes
- **Removed spinner size modifiers**: Deleted `.pa-spinner--sm/md/lg/xl/2xl` classes
  - Themes control spinner size via `$spinner-size` variable
- **Pattern established**: Components use semantic base variables (e.g., `$badge-padding-h`), themes control actual values

#### Class Naming Consistency
- **Renamed layout classes** to use `pa-` prefix throughout:
  - `.admin-content` → `.pa-content`
  - `.admin-header` → `.pa-header`
  - All `.admin-header__*` subclasses → `.pa-header__*`
- **Updated files**:
  - SCSS: `core-components/_layout.scss`, `core-components/_profile.scss`
  - Views: `layout.ejs`, `partials/navbar.ejs`
- Framework now uses consistent `pa-` prefix for all classes

### Fixed - 2025-02-10

#### CSS Variable Violation
- **Removed CSS variable from _layout.scss**: Line 638 used `--sidebar-width: 10rem;`
  - Replaced with SCSS variable `$sidebar-width-tablet: 10rem`
  - Applied directly in media query instead of runtime CSS variable
  - Maintains framework's "SCSS variables only" architecture

#### Font Inheritance for Form Elements
- **Fixed button and form element font inheritance**:
  - Added `font-family: inherit` to `.pa-btn`, `.pa-input`, `.pa-select`, `.pa-textarea`
  - **Problem**: Buttons used browser default fonts (Arial) instead of theme fonts
  - **Solution**: Elements now inherit theme font (e.g., Fira Sans Condensed in Audi theme)
  - Affects all `<button>` elements which don't inherit fonts by default
  - `<a>` elements with `.pa-btn` were unaffected (already inherited correctly)

#### Page Loader Timing
- **Reduced loader fade duration**: Changed from 300ms to 150ms
  - Faster page reveal for better perceived performance
  - Still smooth enough to avoid jarring transitions

---

### Added - 2025-01-31

#### Tooltips Component & Page
- **New tooltip component**: `.pa-tooltip` with pure CSS hover effects
- **Position variants**: Top (default), right, bottom, left
  - Uses `data-tooltip` attribute for tooltip text
  - Smooth fade-in and translate animations
  - Arrow pointer automatically positioned
- **Color variants**: Default (dark), primary, success, warning, danger
  - All colors use framework button color variables
  - Warning variant uses dark text for better contrast
  - Dedicated tooltip colors (`$tooltip-bg`, `$tooltip-text`) for consistent appearance across all themes
- **Multiline tooltips**: `.pa-tooltip--multiline` modifier for longer explanations
  - Fixed width of 20rem with text wrapping
  - Left-aligned text for better readability
- **Features**:
  - Pure CSS implementation (no JavaScript)
  - Works on any element (buttons, text, icons)
  - Responsive with automatic positioning
  - Proper z-index layering (tooltips: 1100, content: 950, sidebar: 900)
  - `cursor: help` on hover
- **Comprehensive examples**:
  - Tooltip positions demonstration
  - Colored tooltip variants
  - Tooltips on buttons (with icons)
  - Icon-only buttons with tooltips
  - Tooltips on inline text
  - Combined positions and colors
  - Multiline tooltips with long text
  - Usage code examples

#### Loaders & Spinners Page
- **New dedicated page**: `/loaders` showcasing all spinner and loader variants
- **Standalone spinner component**: `.pa-spinner` with size and color modifiers
  - Size variants: `--xs`, `--sm` (default), `--md`, `--lg`, `--xl`, `--2xl`
  - Color variants: `--primary`, `--secondary`, `--success`, `--danger`, `--warning`, `--info`
- **Advanced loader types** (inspired by cssloaders.github.io):
  - `.pa-loader-dots`: Bouncing dots animation (3 dots with wave effect)
  - `.pa-loader-bars`: Vertical bars stretching animation (5 bars)
  - `.pa-loader-pulse`: Pulsing circle with scale and opacity animation
  - `.pa-loader-ring`: Double ring spinning animation
  - `.pa-loader-wave`: Wave-like vertical bars animation (5 bars)
  - All loaders support `--lg` size modifier
  - Color controlled via CSS `color` property
- **Loader utility classes**:
  - `.pa-loader-overlay`: Centered spinner with semi-transparent background overlay
  - `.pa-loader-center`: Flexbox container for centered spinners with optional text
- **Comprehensive examples**:
  - Spinner sizes (0.75rem to 4rem)
  - Colored spinners matching button colors
  - All 6 loader types showcased
  - Inline spinners for loading text
  - Centered loaders with overlay
  - Loaders with descriptive text
  - Card loading states
  - Usage code examples for all loader types

---

### Fixed - 2025-01-31

#### Button Loading State
- **Simplified loading implementation**: Loading state now directly replaces button content with spinner
  - Removed `.pa-btn__content` wrapper element (no longer needed)
  - Removed opacity-based content hiding in CSS
  - Cleaner HTML output during loading state
- **Fixed button width expansion during loading**: Removed `min-width: $btn-min-width` from `.pa-btn--loading`
  - JavaScript dimension lock now works correctly
  - Buttons maintain exact width during loading state
  - No more unexpected width changes when spinner appears

#### Utility Classes in Themes
- **Added utility class support**: All theme files now import `utilities.scss`
  - Spacing utilities: `mb-1` through `mb-20`, `mt-*`, `ml-*`, `mr-*`, `mx-*`, `my-*`, `p-*`, etc.
  - Display utilities: `d-none`, `d-flex`, `d-inline-block`, etc.
  - Flexbox utilities: `justify-content-*`, `align-items-*`, `flex-*`, etc.
  - Previously utilities were only available in main.scss

#### Icon-Only Button Examples
- **Added comprehensive icon-only button demonstrations**:
  - Basic icon-only buttons with text icons (✎, ⚙, ✓, etc.)
  - Font Awesome icon-only buttons (floppy-disk, search, check, etc.)
  - Interactive loading demo with icon-only buttons (ripple + loading states)

#### Tooltip Z-Index Layering
- **Fixed tooltip clipping and layering issues**:
  - Removed `overflow: hidden` from `.pa-layout-container` (was clipping tooltips)
  - Moved `overflow-x: hidden` to `body` element (hides sidebar on mobile without clipping tooltips)
  - Added `position: relative` and `z-index: 950` to `.admin-content`
  - Increased tooltip z-index from 1000 to 1100
  - **Z-index hierarchy**: tooltips (1100) > content (950) > sidebar (900)
  - Tooltips now properly appear above all content including sidebar and cards

---

### Added - 2025-01-30

#### Button System Enhancements
- **Icon wrapper pattern**: Added `.pa-btn__icon` component for consistent button icon sizing
  - Fixed-width container: 1.5rem (matches sidebar icon size)
  - Automatic left-alignment for buttons with icons using flexbox
- **Fixed-width button classes**: `pa-btn--w-1x` through `pa-btn--w-10x`
  - Width range: 1rem to 10rem
  - Uses `min-width` to allow content overflow
- **Button alignment modifiers**:
  - `pa-btn--align-left`: Left-aligned content, icon flush to left edge
  - `pa-btn--align-right`: Right-aligned content, icon flush to right edge
  - `pa-btn--align-center`: Centered content with full padding
  - `pa-btn--align-justify`: Space-between layout, icon at left, text at right

#### Font Awesome Integration
- Added Font Awesome 6 CDN to layout template
- Updated button examples with Font Awesome 6 icons (solid style)
- Icon classes: `fa-solid fa-*` (FA6 syntax)

#### Forms Page Enhancements
- Added comprehensive button placement examples:
  - **Header placement**: Right-aligned buttons with green save as last button
  - **Footer placement**: Left utility buttons + right save group
  - **Body placement**: Inline button groups within form content
- All examples use proper `.pa-btn__icon` wrapper pattern

#### SCSS Variable Consolidation (Phase 2)
Added 30+ new SCSS variables to eliminate hardcoded values:

**Layout System**:
- `$layout-container-sm`: 48rem (768px)
- `$layout-container-md`: 64rem (1024px)
- `$layout-container-lg`: 80rem (1280px)
- `$layout-container-xl`: 100rem (1600px)
- `$layout-container-2xl`: 120rem (1920px)

**Card System**:
- `$card-header-padding-v/h`: 0.5rem / 1rem
- `$card-footer-padding-v/h`: 0.75rem / 1rem

**Stats System**:
- `$stat-icon-size`: 3rem
- `$stat-square-min-size`: 8rem
- `$stat-label-letter-spacing`: 0.05em
- `$stat-change-margin-bottom`: 0.25rem

**Badge System**:
- `$badge-padding-v/h`: 0.125rem / 0.5rem
- `$composite-badge-min-label-width`: 3rem

**Button System**:
- `$btn-padding-xs-v/h`: 0.125rem / 0.5rem
- `$btn-padding-xl-v/h`: 1rem / 2rem
- `$btn-icon-only-size`: 2.5rem
- `$btn-icon-margin`: 0.5rem

**Animation System**:
- `$spinner-size`: 1rem
- `$spinner-border-width`: 2px
- `$ripple-size`: 300px

**Utility Spacing**:
- `$section-margin-v`: 2rem
- `$section-margin-sm`: 1.5rem
- `$submenu-max-height`: 500px

### Changed - 2025-01-30

#### Button System
- **Horizontal padding reduced**: `$btn-padding-h` changed from 1rem to 0.75rem
  - More compact button appearance
  - Alignment classes work within this padded area
- **Button icon behavior**: Buttons with `.pa-btn__icon` now automatically:
  - Display as `inline-flex` instead of `inline-block`
  - Use left alignment with `justify-content: flex-start`
  - Give icons fixed width of 1.5rem with proper spacing

#### Core SCSS Updates
- Replaced hardcoded `1px` borders with `$border-width-base` throughout `_core.scss`
- Replaced hardcoded layout widths with `$layout-container-*` variables
- Replaced hardcoded padding values with respective component variables
- Replaced hardcoded border radius with `$border-radius` variables

### Fixed - 2025-01-30

#### Font Awesome Icon Display
- **Font utility classes**: Updated `.font-family-system`, `.font-family-sans`, `.font-family-serif`, `.font-family-mono`
  - Added `:not([class*="fa-"])` selectors to exclude Font Awesome elements
  - Prevents framework fonts from overriding Font Awesome 6 Free font
  - Fixed issue where FA icons showed as empty boxes `[]`

#### Button Group Alignment
- **Vertical button groups**: Changed `align-items: stretch` to `align-items: flex-start`
  - Allows fixed-width buttons to maintain their specified width
  - Prevents buttons from being forced to container width

#### Audi Theme
- Updated border values to use `$border-width-thick` variable
- Updated secondary button border color to use `$audi-gray-lightest` variable

### Documentation - 2025-01-30

#### Buttons Page
- Reorganized alignment section into two-column layout
- Left column: Text icon examples (✓, →, ×)
- Right column: Font Awesome icon examples
- All four alignment types demonstrated: left, right, center, justify
- Reduced button examples for more compact presentation

---

## [Previous Work] - 2025-01-15

### Complete Variable System Transformation
- Eliminated ALL hardcoded values from framework
- Added comprehensive font system variables (`$font-size-*`, `$line-height-*`, `$font-weight-*`)
- Added spacing system variables (`$spacing-xs` through `$spacing-2xl`)
- Added border system variables (`$border-width-*`)
- Component-specific variables for buttons, modals, tables, badges
- Font utility classes now use theme variables
- Table hover accent system with configurable borders
- Modal padding system with vertical/horizontal control
- Audi theme with Fira Sans Condensed integration

### Major Features
- SCSS-only variable system (no CSS variables)
- Modular theme architecture
- Composite badge system with three-part structure
- Modal windows with multiple sizes and themed headers
- Complete EJS template conversion with Express.js
- Centered layout container system with multiple breakpoints
- Dashboard with KPI cards, charts, and D3.js integration