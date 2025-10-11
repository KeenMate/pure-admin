# Pure Admin - Multi-Package Monorepo

## Project Overview

Pure Admin is a lightweight, data-focused HTML/CSS admin framework similar to AdminLTE but more compact. Built with PureCSS foundation, SASS preprocessing, and a comprehensive component system.

## Repository Structure

```
C:\Git\KM\pure-admin/
├── pure-admin-visual/           # Original showcase/demo application
│   ├── src/scss/                # Original SCSS development source
│   ├── views/                   # EJS templates for demo
│   ├── snippets/                # ✅ HTML snippet library (canonical reference)
│   ├── server.js                # Express.js demo server (port 3000)
│   └── CLAUDE.md                # Detailed project documentation
│
├── pure-admin-core/             # ✅ npm package (@pure-admin/core)
│   ├── src/scss/                # Complete SCSS framework (copied from visual)
│   │   ├── core-components/     # All framework components
│   │   ├── themes/              # Corporate (default), Audi, Express, Dark variants
│   │   ├── _variables.scss      # Framework variables with !default
│   │   ├── _core.scss           # Core framework imports
│   │   └── main.scss            # Main entry point
│   ├── dist/                    # Built files
│   │   ├── css/main.css         # Compiled Corporate theme (default)
│   │   └── fonts/               # Font files
│   ├── snippets/                # HTML snippet library (copied from visual)
│   ├── package.json             # npm package configuration
│   └── README.md                # Package usage documentation
│
├── pure-admin-visual-2/         # ✅ Validation project
│   ├── views/                   # EJS templates using @pure-admin/core
│   ├── server.js                # Express.js validation server (port 3001)
│   └── package.json             # Depends on @pure-admin/core via file:
│
├── pure-admin-kit/              # (Legacy/POC?)
├── poc/                         # (Proof of concept files)
│
└── PACKAGE_CREATION_SUMMARY.md  # Detailed package creation documentation
```

## Key Packages

### 1. pure-admin-visual (Demo/Reference)
**Purpose:** Original showcase application and development environment

**Key Features:**
- Express.js + EJS templating for component demos
- Complete theme showcase (Corporate, Audi, Express, Dark variants)
- Canonical snippet library in `snippets/` directory
- Development server on `localhost:3000`

**Run:**
```bash
cd pure-admin-visual
npm install
npm start  # or make dev
```

**Important Files:**
- `CLAUDE.md` - Comprehensive project documentation, architecture notes, design decisions
- `snippets/*.html` - Clean HTML patterns for all components (buttons, alerts, badges, cards, forms, modals, toasts, tables, loaders)

---

### 2. pure-admin-core (npm Package)
**Purpose:** Distributable npm package for use in other projects

**Package Name:** `@pure-admin/core`

**What's Included:**
- Complete SCSS framework with all components
- Corporate theme as default (compiles to `dist/css/main.css`)
- All font files
- HTML snippet library
- Full SCSS variable system with `!default` flags for customization

**Installation:**
```bash
npm install @pure-admin/core
```

**Usage:**
```html
<!-- CSS Only -->
<link rel="stylesheet" href="node_modules/@pure-admin/core/dist/css/main.css">
```

```scss
// SCSS Customization
$primary-bg: #your-color;
$btn-primary-bg: #your-button-color;

@import '@pure-admin/core/scss';
```

**Build:**
```bash
cd pure-admin-core
npm run build          # Build SCSS + copy fonts
npm run watch          # Watch mode
```

---

### 3. pure-admin-visual-2 (Validation)
**Purpose:** Test project to validate `@pure-admin/core` package works independently

**Key Features:**
- Uses `@pure-admin/core` as dependency (`file:../pure-admin-core`)
- Minimal Express.js server
- Demonstrates package integration
- Validation server on `localhost:3001`

**Run:**
```bash
cd pure-admin-visual-2
npm install
npm start
```

---

## Component System

### Core Components (in pure-admin-core/src/scss/core-components/)
- **Alerts** - Alert messages with variants and dismissible states
- **Badges** - Standard badges and composite badges with three-part structure
- **Buttons** - Complete button system with sizes, variants, icons, alignment
- **Cards** - Card layouts with header/body/footer
- **Forms** - Form elements with validation states
- **Grid** - Grid system and layouts
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
- **Utilities** - Utility classes and helpers

### HTML Snippets
Clean HTML patterns for all components are available in:
- `pure-admin-visual/snippets/` (source)
- `pure-admin-core/snippets/` (distributed with package)

These snippets are the canonical reference for building framework wrappers (React, Vue, Svelte).

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
**Core principle:** Components use semantic base variables only. Themes control the values.

```scss
// In component
.pa-badge {
  padding: $badge-padding-v $badge-padding-h;  // Base variables
  font-size: $font-size-xs;
}

// In theme
$badge-padding-h: 0.375rem;  // Theme decides the value
```

**No size-specific component variables:**
- ✅ Use: `$btn-padding-v`, `$btn-padding-h`
- ❌ Don't: `$btn-padding-sm-v`, `$btn-padding-lg-h`

Size modifiers (`--xs`, `--sm`, `--lg`, `--xl`) should ONLY change `font-size`, never padding.

### Grid Architecture
**Core principle:** PureCSS grid is imported in `_core.scss`, not in themes.

```scss
// _core.scss
// 0. Import PureCSS foundation FIRST (before variables)
@import 'purecss-grid';
@import 'purecss-grid-responsive';

@import 'variables';
// ... component imports
```

**Benefits:**
- ✅ `main.css` is fully functional standalone (includes grid)
- ✅ No code duplication across themes
- ✅ Core contains everything needed for complete functionality
- ✅ Themes only customize variables and styling

**Historical note:** Prior to 2025-10-03, each theme imported the grid, causing ~15KB duplication per theme and making `main.css` non-functional.

### Theme Architecture
**Pattern:** Import variables → override → add fonts → import core (which includes grid)

```scss
// In theme file (e.g., audi.scss)
@import '../variables';

// Override variables
$primary-bg: #bb0a30;
$body-font-family: 'Fira Sans Condensed', sans-serif;

// Add custom fonts
@import url('https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@300;400;500;700&display=swap');

// Import core (compiles with overridden variables + includes grid)
@import '../core';
```

**Import flow:**
```
Core Entry (_core.scss):
  → PureCSS Grid
  → Variables
  → Components

Theme Entry (e.g., corporate.scss):
  → Variables (loads defaults)
  → Override variables
  → Add fonts
  → Core (brings grid + all components with overridden values)
```

### Font Inheritance
All form elements inherit fonts globally via `_base.scss`:
```scss
button, input, select, textarea, label {
  font-family: inherit;
  font-size: inherit;
}
```

**Never add `font-family: inherit` to individual components** - the global rule handles all inheritance automatically.

---

## Development Workflow

### Working on Components (pure-admin-visual)
```bash
cd pure-admin-visual
npm run watch-css    # Watch SCSS changes
npm start            # Run demo server (port 3000)
```

### Building Core Package
```bash
cd pure-admin-core
npm run build        # Compile SCSS + copy fonts
```

### Validating Package
```bash
cd pure-admin-visual-2
npm install          # Reinstall to pick up core changes
npm start            # Test package integration (port 3001)
```

---

## Next Steps / Future Work

### npm Publishing
1. Test package locally: `npm pack` in `pure-admin-core/`
2. Publish to npm: `npm publish --access public`
3. Create separate theme packages:
   - `@pure-admin/theme-audi`
   - `@pure-admin/theme-express`
   - `@pure-admin/theme-dark`

### Framework Wrappers
Create component libraries for popular frameworks:
- `@pure-admin/svelte` - Svelte component wrappers
- `@pure-admin/react` - React component wrappers
- `@pure-admin/vue` - Vue component wrappers

Each wrapper should:
- Import CSS from `@pure-admin/core`
- Use `snippets/` as HTML structure reference
- Provide framework-specific props and events

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

### Typography Scale
```scss
$font-size-2xs:  0.625rem;  // 10px
$font-size-xs:   0.75rem;   // 12px
$font-size-sm:   0.875rem;  // 14px
$font-size-base: 1rem;      // 16px
$font-size-lg:   1.125rem;  // 18px
$font-size-xl:   1.25rem;   // 20px
$font-size-2xl:  1.5rem;    // 24px
$font-size-3xl:  2rem;      // 32px
$font-size-4xl:  2.5rem;    // 40px
```

### Button Size Progression
```scss
xs:  0.25rem × 0.5rem   → ~28px height (compact for tables)
sm:  0.375rem × 0.625rem → ~32px height
def: 0.5rem × 0.75rem    → ~36px height
lg:  0.625rem × 0.875rem → ~40px height
xl:  0.75rem × 1rem      → ~44px height
```

---

## Critical Rules

1. **ALWAYS use SCSS variables** - NO CSS variables (`var(--*)`) anywhere
2. **ONLY use `pa-` prefixed classes** - No demo-specific classes
3. **Follow BEM strictly** - Components must be reusable framework elements
4. **Themes override SCSS variables only** - All themes import `_variables.scss` and override specific variables
5. **Grid columns inside cards have no bottom padding** - Prevents spacing conflicts
6. **All spacing uses consistent rem units** - Framework-wide consistency
7. **Font inheritance is global** - Never add `font-family: inherit` to components

---

## Resources

- **Main Documentation:** `pure-admin-visual/CLAUDE.md` (comprehensive architecture notes)
- **Package Summary:** `PACKAGE_CREATION_SUMMARY.md` (package creation phases)
- **Snippets Reference:** `pure-admin-visual/snippets/*.html` or `pure-admin-core/snippets/*.html`
- **Theme Examples:** `pure-admin-core/src/scss/themes/*.scss`

---

## Quick Reference

| Task | Command | Port |
|------|---------|------|
| **Run demo** | `cd pure-admin-visual && npm start` | 3000 |
| **Watch SCSS** | `cd pure-admin-visual && npm run watch-css` | - |
| **Build core** | `cd pure-admin-core && npm run build` | - |
| **Validate package** | `cd pure-admin-visual-2 && npm start` | 3001 |
| **Build all themes** | `cd pure-admin-visual && npm run build-all` | - |

---

**Last Updated:** 2025-10-03
**Framework Version:** 1.0.0
**Default Theme:** Corporate
