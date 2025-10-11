# Pure Admin Core - Project Context

## Overview

**@pure-admin/core** is a lightweight, data-focused HTML/CSS admin framework built on PureCSS foundation with SASS preprocessing and a comprehensive component system. Similar to AdminLTE but more compact and focused on clean, reusable patterns.

## Package Information

- **Name**: `@pure-admin/core`
- **Version**: 1.0.0
- **License**: MIT
- **Repository**: https://github.com/pure-admin/core
- **npm**: https://www.npmjs.com/package/@pure-admin/core

## What This Package Provides

### 1. Complete SCSS Framework
Full-featured admin framework with customizable SCSS variables:
```scss
// Custom theme
$primary-bg: #your-color;
$btn-primary-bg: #your-button-color;

@import '@pure-admin/core/scss';
```

### 2. Pre-built Corporate Theme
Production-ready CSS (123KB):
```html
<link rel="stylesheet" href="node_modules/@pure-admin/core/dist/css/main.css">
```

### 3. Component Library
- **Layout**: Header, sidebar, footer, responsive grid
- **Forms**: Input, select, textarea, checkbox, radio, validation states
- **Buttons**: Sizes (xs/sm/default/lg/xl), variants, icon buttons
- **Cards**: Header/body/footer layouts
- **Badges**: Standard and composite (three-part) badges
- **Alerts**: Success/info/warning/danger with dismissible option
- **Tables**: Striped, hover, compact variants
- **Modals**: Themed headers, multiple sizes
- **Toasts**: Notification system
- **Loaders**: Loading spinners and animations
- **Statistics**: Metric display components
- **Tooltips**: Tooltip and popover components
- **Pagers**: Pagination and load more patterns

### 4. HTML Snippets
Clean, copy-paste HTML patterns in `snippets/` directory - perfect reference for building framework wrappers (React, Vue, Svelte).

### 5. Font Assets
All required fonts included in `dist/fonts/`:
- Delivery Sans
- Google Fonts integration

## Architecture Principles

### BEM Naming Convention
**Pattern**: `pa-[block]__[element]--[modifier]`

```html
<!-- Block with modifier -->
<button class="pa-btn pa-btn--primary pa-btn--lg">
  <!-- Element -->
  <span class="pa-btn__icon">🔍</span>
  Search
</button>
```

**Rules**:
- `pa-` prefix for all framework classes
- Double underscore `__` for elements
- Double dash `--` for modifiers
- No demo-specific classes in framework

### SCSS Variable System

**Core Principle**: Components use semantic base variables only. Themes control values.

```scss
// ✅ Component uses base variables
.pa-badge {
  padding: $badge-padding-v $badge-padding-h;
  font-size: $font-size-xs;
}

// ✅ Theme defines the values
$badge-padding-h: 0.375rem;
$badge-padding-v: 0.25rem;

// ❌ NEVER create size-specific component variables
$badge-padding-sm-h: 0.25rem;  // Don't do this
```

**Variable Categories**:
1. **Colors**: `$primary-bg`, `$success-bg`, `$danger-bg`, etc.
2. **Typography**: `$font-size-*`, `$font-weight-*`, `$body-font-family`
3. **Spacing**: `$spacing-*` (xs/sm/md/base/lg/xl/2xl)
4. **Components**: `$btn-padding-*`, `$badge-border-radius`, etc.

All variables use `!default` flag for easy customization.

### Grid Architecture

**Critical**: PureCSS grid is imported in `_core.scss`, NOT in themes.

```scss
// _core.scss
@import 'purecss-grid';
@import 'purecss-grid-responsive';
@import 'variables';
// ... component imports
```

**Benefits**:
- ✅ `main.css` is fully functional standalone (includes grid)
- ✅ No code duplication across themes
- ✅ Core contains everything needed
- ✅ Themes only customize variables

### Theme Architecture

Themes import variables → override → add fonts → import core:

```scss
// audi.scss
@import '../variables';

// Override variables
$primary-bg: #bb0a30;
$body-font-family: 'Fira Sans Condensed', sans-serif;

// Add custom fonts
@import url('https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@300;400;500;700&display=swap');

// Import core (includes grid + all components with overridden values)
@import '../core';
```

### Font Inheritance

All form elements inherit fonts globally via `_base.scss`:
```scss
button, input, select, textarea, label {
  font-family: inherit;
  font-size: inherit;
}
```

**Rule**: NEVER add `font-family: inherit` to individual components - the global rule handles all inheritance.

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
// Size only changes font-size, NOT padding
xs:  ~28px height (compact for tables)
sm:  ~32px height
def: ~36px height
lg:  ~40px height
xl:  ~44px height
```

## File Structure

```
pure-admin-core/
├── src/scss/                    # SCSS source files
│   ├── core-components/         # Component partials
│   │   ├── _alerts.scss
│   │   ├── _badges.scss
│   │   ├── _base.scss
│   │   ├── _buttons.scss
│   │   ├── _cards.scss
│   │   ├── _forms.scss
│   │   ├── _grid.scss
│   │   ├── _layout.scss
│   │   ├── _lists.scss
│   │   ├── _loaders.scss
│   │   ├── _modals.scss
│   │   ├── _pagers.scss
│   │   ├── _profile.scss
│   │   ├── _statistics.scss
│   │   ├── _tables.scss
│   │   ├── _toasts.scss
│   │   ├── _tooltips.scss
│   │   └── _utilities.scss
│   ├── themes/                  # Theme variants
│   │   ├── audi.scss
│   │   ├── corporate.scss       # Default theme
│   │   ├── dark-blue.scss
│   │   ├── dark-green.scss
│   │   ├── dark-red.scss
│   │   └── express.scss
│   ├── _core.scss               # Core framework (grid + components)
│   ├── _purecss-grid.scss       # PureCSS grid
│   ├── _purecss-grid-responsive.scss
│   ├── _utilities.scss          # Utility classes (spacing, etc.)
│   ├── _variables.scss          # All SCSS variables with !default
│   └── main.scss                # Main entry point
├── dist/                        # Build output
│   ├── css/
│   │   └── main.css             # Compiled Corporate theme (123KB)
│   └── fonts/                   # Font files
├── snippets/                    # HTML component patterns
│   ├── alerts.html
│   ├── badges.html
│   ├── buttons.html
│   ├── cards.html
│   ├── forms.html
│   ├── loaders.html
│   ├── modals.html
│   ├── tables.html
│   └── toasts.html
├── scripts/
│   └── copy-fonts.js            # Font copying script
├── package.json
├── README.md
├── LICENSE
├── Makefile                     # Build tasks
└── CONTEXT.md                   # This file
```

## Package Exports

The package provides multiple entry points via `exports` field:

```json
{
  ".": "dist/js/index.esm.js",
  "./css": "dist/css/main.css",
  "./css/*": "dist/css/*",
  "./scss": "src/scss/main.scss",
  "./scss/*": "src/scss/*",
  "./fonts/*": "dist/fonts/*",
  "./snippets/*": "snippets/*"
}
```

### Usage Examples

```javascript
// CSS only
import '@pure-admin/core/css';

// SCSS with customization
@import '@pure-admin/core/scss/variables';
$primary-bg: #custom-color;
@import '@pure-admin/core/scss/core';

// Access specific snippet
// See: node_modules/@pure-admin/core/snippets/buttons.html
```

## Build System

### Scripts

```bash
npm run build          # Build SCSS + copy fonts
npm run build:scss     # Compile SCSS to CSS
npm run build:fonts    # Copy font files to dist
npm run watch          # Watch SCSS for changes
```

### Makefile Commands

```bash
make help              # Show all commands
make install           # Install dependencies
make build             # Build everything
make watch             # Watch mode (alias: make dev)
make clean             # Clean dist directory
make test              # Create package tarball for local testing
make prepublish        # Dry-run publish check
make publish           # Publish to npm
make verify            # Clean + build + test workflow
```

### SCSS Compilation

Uses Dart Sass with deprecation warnings suppressed:
```bash
sass src/scss/main.scss dist/css/main.css --no-source-map --silence-deprecation=import
```

**Note**: Framework uses `@import` (will migrate to `@use`/`@forward` in future for Dart Sass 3.0 compatibility).

## Installation & Usage

### Install Package

```bash
npm install @pure-admin/core
```

### Option 1: Use Pre-built CSS

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@pure-admin/core/dist/css/main.css">
</head>
<body>
  <button class="pa-btn pa-btn--primary">Click Me</button>
</body>
</html>
```

### Option 2: Customize with SCSS

```scss
// your-theme.scss

// Import framework variables
@import '@pure-admin/core/scss/variables';

// Override variables
$primary-bg: #007bff;
$secondary-bg: #6c757d;
$btn-primary-bg: $primary-bg;
$body-font-family: 'Inter', sans-serif;

// Import core framework
@import '@pure-admin/core/scss/core';
```

### Option 3: Use HTML Snippets

```bash
# Copy snippet patterns
cp node_modules/@pure-admin/core/snippets/buttons.html my-components/
```

## Development Workflow

### Local Package Development

1. Make changes to SCSS files
2. Run `make build` or `make watch`
3. Test changes in validation project:
   ```bash
   cd ../pure-admin-visual-2
   npm install
   npm start  # localhost:3001
   ```

### Testing Package Locally

```bash
# In pure-admin-core/
make test

# Creates: pure-admin-core-1.0.0.tgz

# In your test project:
npm install /path/to/pure-admin-core-1.0.0.tgz
```

## Publishing to npm

### First Time Setup

```bash
npm login
# Enter npm credentials
```

### Publish Workflow

```bash
# 1. Dry-run check
make prepublish

# 2. Publish (with confirmation prompt)
make publish

# Or manually:
npm publish
```

The `prepublishOnly` script ensures the package is built before publishing.

## Critical Rules for Contributors

1. **ALWAYS use SCSS variables** - NO CSS variables (`var(--*)`)
2. **ONLY use `pa-` prefixed classes** - No framework-external classes
3. **Follow BEM strictly** - Consistent naming across all components
4. **Themes override SCSS variables only** - No theme-specific CSS
5. **Grid imported in core** - NOT in themes (prevents duplication)
6. **All spacing uses rem units** - Framework-wide consistency
7. **Font inheritance is global** - Never add to individual components
8. **Size modifiers change font-size only** - Never modify padding
9. **Components use base variables** - Themes define values

## Future Roadmap

### Additional Theme Packages
- `@pure-admin/theme-audi`
- `@pure-admin/theme-express`
- `@pure-admin/theme-dark`

### Framework Wrappers
- `@pure-admin/react` - React component wrappers
- `@pure-admin/vue` - Vue component wrappers
- `@pure-admin/svelte` - Svelte component wrappers

Each wrapper should:
- Import CSS from `@pure-admin/core`
- Use `snippets/` as HTML structure reference
- Provide framework-specific props and events

### Sass Module System Migration
Migrate from `@import` to modern `@use`/`@forward` syntax for Dart Sass 3.0 compatibility.

## Related Packages

### pure-admin-visual
Original showcase/demo application with Express.js server.
- Location: `../pure-admin-visual/`
- Server: http://localhost:3000
- Purpose: Component development and documentation

### pure-admin-visual-2
Validation project testing `@pure-admin/core` package.
- Location: `../pure-admin-visual-2/`
- Server: http://localhost:3001
- Purpose: Package integration testing

## Support & Resources

- **Documentation**: See README.md
- **Issues**: https://github.com/pure-admin/core/issues
- **Monorepo Docs**: `../CLAUDE.md` and `../PACKAGE_CREATION_SUMMARY.md`
- **Snippets**: Check `snippets/` directory for copy-paste HTML patterns

## License

MIT License - See LICENSE file for details

---

**Last Updated**: 2025-10-03
**Package Version**: 1.0.0
**Default Theme**: Corporate (123KB compiled CSS)
