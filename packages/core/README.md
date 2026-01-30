# Pure Admin Core

Lightweight, data-focused CSS/SCSS admin framework with Corporate theme as default.

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

Themes are separate packages. Install and import:

```bash
npm install @keenmate/pure-admin-theme-audi
```

```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-admin-theme-audi/dist/audi.css">
```

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

Themes are available as separate npm packages:

| Theme | Package | Description |
|-------|---------|-------------|
| Audi | `@keenmate/pure-admin-theme-audi` | Audi red with Fira Sans Condensed |
| Corporate | `@keenmate/pure-admin-theme-corporate` | Professional blue/gray |
| Dark | `@keenmate/pure-admin-theme-dark` | Dark mode with color variants |
| Express | `@keenmate/pure-admin-theme-express` | Bold yellow/red logistics |
| Minimal | `@keenmate/pure-admin-theme-minimal` | Clean minimal design |

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
- **Responsive breakpoints:** `.pa-col-sm-*`, `.pa-col-md-*`, `.pa-col-lg-*`, `.pa-col-xl-*`
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
  - `.pa-header__left` - Left section (burger, brand, nav) - stays anchored left
  - `.pa-header__center` - Center section (page title) - flexible
  - `.pa-header__right` - Right section (notifications, profile) - stays anchored right
- `.pa-header__burger` - Hamburger menu button
- `.pa-header__brand` - Brand/logo container
- `.pa-header__nav` - Navigation links container
- `.pa-header__nav--left/--right` - Navigation position
- `.pa-header__title` - Page title
- `.pa-header__profile-btn` - Profile button

### Footer
- `.pa-layout__footer` - Footer container (uses `min-height`, can expand)
- **Three-section layout:**
  - `.pa-footer__left` - Left section (copyright) - stays anchored left
  - `.pa-footer__center` - Center section (optional) - flexible
  - `.pa-footer__right` - Right section (version info, links) - stays anchored right
  - `.pa-footer__right--vertical` - Stack items vertically with right-aligned text

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

### Toasts
- `.pa-toast` - Base toast
- `.pa-toast--primary/success/danger/warning/info` - Variants
- Positions: `top-right`, `top-center`, `top-left`, `bottom-right`, `bottom-center`, `bottom-left`

### Tooltips & Popovers
- `.pa-tooltip` - Base tooltip (pure CSS, no JS required)
- `.pa-tooltip--top/right/bottom/left` - Positioning
- `.pa-tooltip--primary/success/warning/danger` - Semantic variants
- `.pa-tooltip--color-1` through `.pa-tooltip--color-9` - Theme color variants
  - Text color automatically adjusts via `--pa-color-N-text` for readability
- `.pa-tooltip--multiline` - Multiline tooltips
- `.pa-popover` - Base popover (requires JavaScript)
- `.pa-popover--sm/md/lg` - Sizes
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
- `.pa-pager--left/center/right` - Alignment modifiers

### Load More
- `.pa-load-more` - Load more container
- `.pa-load-more__button` - Load more button
- `.pa-load-more__button--loading` - Loading state
- `.pa-load-more__spinner` - Loading spinner
- `.pa-load-more__text` - Button text
- `.pa-load-more__count` - Item count display
- `.pa-load-more--left/center/right` - Alignment modifiers

### Statistics
- `.pa-stat` - Base statistics component
- `.pa-stat__icon` - Icon container with color variants (`--primary/success/warning/info`)
- `.pa-stat__content` - Content wrapper
- `.pa-stat__number` - Large number display
- `.pa-stat__label` - Label text
- **Hero variant:** `.pa-stat--hero` - Large centered stat with value and change indicator
  - `.pa-stat__value` - Hero number
  - `.pa-stat__change` - Change indicator (`--positive/negative/neutral`)
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
