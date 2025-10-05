# Changelog

All notable changes to Pure Admin Visual will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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