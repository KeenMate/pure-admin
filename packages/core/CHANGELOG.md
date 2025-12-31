# Changelog

All notable changes to Pure Admin Visual will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
  - `.pa-list-basic--icon`: Replace bullets with checkmarks or custom icons
  - `.pa-list-basic--bordered`: Add borders between items
  - `.pa-list-basic--compact`: Reduced spacing for dense content
  - `.pa-list-basic--inline`: Horizontal layout with separators
  - `.pa-list-ordered--compact`: Reduced spacing for numbered lists
  - `.pa-list-definition--horizontal`: Side-by-side term/description layout
  - `.pa-list-definition--striped`: Alternating row backgrounds
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