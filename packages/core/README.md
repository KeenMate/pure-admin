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
$primary-bg: #your-color;
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

### Layout & Sidebar
- `.pa-layout` - Main layout container
- `.pa-layout__sidebar` - Sidebar navigation
- `.pa-layout__sidebar--icon-collapse` - Icon-only collapse mode (icons maintain fixed position when collapsed)
- `.sidebar-hidden` - Body class to toggle sidebar visibility

### Forms
- `.pa-input` - Text inputs
- `.pa-select` - Select dropdowns
- `.pa-textarea` - Textareas
- `.pa-checkbox` - Checkboxes
- `.pa-radio` - Radio buttons

### Tables
- `.pa-table` - Base table
- `.pa-table--striped` - Striped rows
- `.pa-table--hover` - Row hover effects
- `.pa-table--compact` - Reduced padding

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
- `.pa-tooltip--primary/success/warning/danger` - Variants
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

### Profile Panel
- `.pa-profile-panel` - Slide-in profile panel
- `.pa-profile-panel--open` - Open state
- `.pa-profile-panel__header` - Header with avatar and user info
- `.pa-profile-panel__header--no-avatar` - Header variant without avatar (for corporate apps)
- `.pa-profile-panel__tabs` - Tab navigation (Profile/Favorites)
- `.pa-profile-panel__nav-item` - Navigation link
- `.pa-profile-panel__favorite-item` - Favorite link (with remove button)
- `.pa-profile-panel__actions` - Action buttons (Sign Out, etc.)

## SCSS Variables

All components use SCSS variables with `!default` flags, making them fully customizable:

- **Colors**: `$primary-bg`, `$accent-color`, `$text-primary`, etc.
- **Spacing**: `$spacing-xs` through `$spacing-2xl`
- **Typography**: `$font-size-*`, `$line-height-*`, `$font-weight-*`
- **Components**: `$btn-*`, `$card-*`, `$table-*`, etc.

See `src/scss/_variables.scss` for the complete list.

## License

MIT
