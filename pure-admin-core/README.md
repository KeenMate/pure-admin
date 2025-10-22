# Pure Admin Core

Lightweight, data-focused CSS/SCSS admin framework with Corporate theme as default.

## Installation

```bash
npm install @pure-admin/core
```

## Quick Start

### CSS Only (Corporate Theme - Default)

```html
<link rel="stylesheet" href="node_modules/@pure-admin/core/dist/css/main.css">
```

Or with a bundler:

```js
import '@pure-admin/core/dist/css/main.css';
```

### SCSS Customization

```scss
// Override variables before importing
$primary-bg: #your-color;
$btn-primary-bg: #your-button-color;

// Import the framework
@import '@pure-admin/core/scss';
```

### JavaScript Utilities

```js
import { createToast, openModal, closeModal } from '@pure-admin/core';

// Show a success toast
createToast('top-right', 'success', 'Success!', 'Operation completed');

// Open a modal
openModal('myModal');
```

## Using HTML Snippets

The `snippets/` directory contains clean HTML patterns for all components:

- `snippets/buttons.html` - All button variants and patterns
- `snippets/alerts.html` - Alert components
- `snippets/badges.html` - Badge and composite badge patterns
- `snippets/cards.html` - Card layouts
- `snippets/forms.html` - Form elements and validation
- `snippets/modals.html` - Modal dialogs
- `snippets/toasts.html` - Toast notifications
- `snippets/tables.html` - Table variants
- `snippets/loaders.html` - Loading spinners and animations

These snippets are the canonical reference for building framework components in any frontend framework (React, Vue, Svelte, etc.).

## Framework Integration

### Svelte

See `@pure-admin/svelte` package for Svelte component wrappers.

### React

See `@pure-admin/react` package for React component wrappers.

### Vue

See `@pure-admin/vue` package for Vue component wrappers.

## Themes

This core package includes the **Corporate theme** as default. Additional themes are available as separate packages:

- `@pure-admin/theme-audi` - Audi brand theme with Fira Sans Condensed
- `@pure-admin/theme-express` - Express delivery theme with Delivery font
- `@pure-admin/theme-dark` - Dark theme variants (red, green, blue)

## Component Classes

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

## SCSS Variables

All components use SCSS variables with `!default` flags, making them fully customizable:

- **Colors**: `$primary-bg`, `$accent-color`, `$text-primary`, etc.
- **Spacing**: `$spacing-xs` through `$spacing-2xl`
- **Typography**: `$font-size-*`, `$line-height-*`, `$font-weight-*`
- **Components**: `$btn-*`, `$card-*`, `$table-*`, etc.

See `src/scss/_variables.scss` for the complete list.

## License

MIT
