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
│       │   ├── _variables.scss    # Framework variables with !default
│       │   ├── _core.scss         # Core framework imports
│       │   ├── main.scss          # Main entry point
│       │   ├── core-components/   # All framework components (31 files)
│       │   └── themes/            # 9 themes + _dark-base.scss
│       ├── dist/                  # Built files
│       │   ├── css/main.css       # Compiled default theme
│       │   ├── css/themes/        # All compiled themes
│       │   └── fonts/             # Font files
│       ├── snippets/              # HTML snippet library (30 files)
│       ├── fonts/                 # Source font files
│       ├── scripts/               # Build scripts
│       ├── package.json           # npm package configuration
│       └── README.md              # Package documentation
│
├── demo/                          # Demo site (NOT published to npm)
│   ├── server.js                  # Express.js server (port 3000)
│   ├── views/                     # Mustache templates (40+ files)
│   │   ├── layout.mustache        # Master layout
│   │   ├── dashboard.mustache     # Dashboard page
│   │   └── partials/              # Shared partials
│   ├── js/                        # Demo JavaScript (12 files)
│   │   ├── command-palette.js
│   │   ├── modal-dialogs.js
│   │   ├── toast-service.js
│   │   └── ...
│   ├── assets/                    # Demo assets
│   └── package.json               # Depends on @keenmate/pure-admin-core
│
├── pure-admin-visual/             # (Legacy - kept for reference)
├── pure-admin-core/               # (Legacy - kept for reference)
└── docs/                          # Documentation
```

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Build CSS
npm run build -w @keenmate/pure-admin-core

# Build all themes
npm run build:themes -w @keenmate/pure-admin-core

# Run demo server
npm run start -w demo
# → http://localhost:3000
```

## Makefile Commands

```bash
make install      # Install all workspace dependencies
make build        # Build main CSS
make build-themes # Build all theme CSS files
make build-all    # Build main CSS + all themes
make watch        # Watch SCSS files for changes
make demo         # Run demo server only
make dev          # Development mode
make clean        # Clean dist directories
make package      # Create npm tarball
make verify       # Clean, build, and verify package
make publish      # Publish to npm
```

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

**With Theme:**
```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-admin-core/dist/css/themes/audi.css">
```

**SCSS Customization:**
```scss
// Override variables BEFORE import
$primary-bg: #your-color;
$btn-primary-bg: #your-button-color;

@import '@keenmate/pure-admin-core/src/scss/main';
```

### Available Themes
- `main.css` - Default (Corporate)
- `themes/audi.css` - Audi red with Fira Sans Condensed
- `themes/audi-light.css` - Light Audi variant
- `themes/corporate.css` - Professional blue/gray
- `themes/express.css` - Bold yellow/red logistics
- `themes/dark.css` - Dark mode base
- `themes/dark-blue.css` - Dark with blue accent
- `themes/dark-green.css` - Dark with green accent
- `themes/dark-red.css` - Dark with red accent
- `themes/minimal.css` - Clean minimal

---

## Component System

### Core Components (packages/core/src/scss/core-components/)
- **Alerts** - Alert messages with variants and dismissible states
- **Badges** - Standard badges and composite badges with three-part structure
- **Buttons** - Complete button system with sizes, variants, icons, alignment
- **Cards** - Card layouts with header/body/footer
- **Forms** - Form elements with validation states
- **Grid** - Flexbox grid system (pa-row, pa-col-*)
- **Layout** - Header, sidebar, footer, responsive layouts
- **Lists** - List components
- **Loaders** - Loading spinners and animations
- **Modals** - Modal dialogs with sizes and themed headers
- **Pagers** - Pagination and load more components
- **Profile** - Profile panel components
- **Statistics** - Statistics display components
- **Tables** - Table variants (striped, hover, compact)
- **Toasts** - Toast notification system
- **Tooltips** - Tooltip and popover components
- **Command Palette** - Spotlight-style search (Ctrl+K)
- **Utilities** - Utility classes and helpers

### HTML Snippets
Clean HTML patterns for all components in `packages/core/snippets/`:
- alerts.html, badges.html, buttons.html, cards.html
- forms.html, grid.html, layout.html, modals.html
- tables.html, toasts.html, tooltips.html, etc.

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

### SCSS Variable System
Components use semantic base variables. Themes control the values.

```scss
// In component
.pa-badge {
  padding: $badge-padding-v $badge-padding-h;
  font-size: $font-size-xs;
}

// In theme
$badge-padding-h: 0.375rem;  // Theme decides the value
```

### Theme Architecture
```scss
// Theme file pattern (e.g., audi.scss)
@import '../variables';           // Load defaults

$primary-bg: #bb0a30;             // Override variables
$body-font-family: 'Fira Sans Condensed', sans-serif;

@import url('...');               // Add custom fonts
@import '../core';                // Import core with overrides
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

---

## Critical Rules

1. **ALWAYS use SCSS variables** - NO CSS variables (`var(--*)`) anywhere
2. **ONLY use `pa-` prefixed classes** - No demo-specific classes
3. **Follow BEM strictly** - Components must be reusable framework elements
4. **Themes override SCSS variables only** - All themes import `_variables.scss` and override
5. **Font inheritance is global** - Never add `font-family: inherit` to components

---

## Base CSS Variables for Web Components

Pure Admin exports `--base-*` CSS custom properties for web component theming.

```css
/* Web components consume via fallback chains */
--ms-accent-color: var(--base-accent-color, #3b82f6);
```

45 variables covering colors, inputs, dropdowns, typography, and border-radius.

---

## Resources

- **Detailed Documentation:** `demo/views/` (component demos)
- **Snippets Reference:** `packages/core/snippets/*.html`
- **Theme Examples:** `packages/core/src/scss/themes/*.scss`
- **Legacy Docs:** `pure-admin-visual/CLAUDE.md`

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

**Last Updated:** 2026-02-24
**Framework Version:** 2.0.2
**Default Theme:** Corporate
