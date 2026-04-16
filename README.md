# Pure Admin

Lightweight, data-focused HTML/CSS admin framework built with SCSS and a comprehensive component system.

[![npm version](https://img.shields.io/npm/v/@keenmate/pure-admin-core.svg)](https://www.npmjs.com/package/@keenmate/pure-admin-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Links

- **Live Demo** — [demo.pureadmin.io](https://demo.pureadmin.io) (try every theme in the browser)
- **Main Site** — [pureadmin.io](https://pureadmin.io) (themes catalog, CLI docs, project templates)
- **`pureadmin` CLI** — [npm](https://www.npmjs.com/package/@keenmate/pureadmin) (`npx pureadmin create`, `npx pureadmin themes add`)

## Features

- **Lightweight** - Minimal footprint, no JavaScript dependencies for styling
- **Data-focused** - Optimized for admin dashboards and data-heavy applications
- **RTL Support** - Full right-to-left language support using CSS Logical Properties
- **Themeable** - Multiple themes available, easy to create custom themes
- **Responsive** - Mobile-first responsive design
- **BEM Architecture** - Clean, maintainable CSS with `pa-` prefixed classes
- **10px rem base** - Simple calculations (1.6rem = 16px)

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@keenmate/pure-admin-core](https://www.npmjs.com/package/@keenmate/pure-admin-core) | ![npm](https://img.shields.io/npm/v/@keenmate/pure-admin-core.svg) | Core framework with default theme |
| [@keenmate/pure-admin-theme-audi](https://www.npmjs.com/package/@keenmate/pure-admin-theme-audi) | ![npm](https://img.shields.io/npm/v/@keenmate/pure-admin-theme-audi.svg) | Audi-inspired red theme |
| [@keenmate/pure-admin-theme-corporate](https://www.npmjs.com/package/@keenmate/pure-admin-theme-corporate) | ![npm](https://img.shields.io/npm/v/@keenmate/pure-admin-theme-corporate.svg) | Professional blue/gray theme |
| [@keenmate/pure-admin-theme-dark](https://www.npmjs.com/package/@keenmate/pure-admin-theme-dark) | ![npm](https://img.shields.io/npm/v/@keenmate/pure-admin-theme-dark.svg) | Dark theme with color variants |
| [@keenmate/pure-admin-theme-express](https://www.npmjs.com/package/@keenmate/pure-admin-theme-express) | ![npm](https://img.shields.io/npm/v/@keenmate/pure-admin-theme-express.svg) | Bold yellow/red logistics theme |
| [@keenmate/pure-admin-theme-minimal](https://www.npmjs.com/package/@keenmate/pure-admin-theme-minimal) | ![npm](https://img.shields.io/npm/v/@keenmate/pure-admin-theme-minimal.svg) | Clean minimal theme |

## Quick Start

### Installation

```bash
npm install @keenmate/pure-admin-core
```

### CSS Only

```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-admin-core/dist/css/main.css">
```

Or with a bundler:

```js
import '@keenmate/pure-admin-core/dist/css/main.css';
```

### With a Theme

```bash
npm install @keenmate/pure-admin-theme-audi
```

```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-admin-theme-audi/dist/audi.css">
```

### SCSS Customization

```scss
// Override variables before importing
$accent-color: #your-color;
$sidebar-width: 280px;

// Import the framework
@import '@keenmate/pure-admin-core/src/scss/main';
```

## Components

Pure Admin includes a comprehensive set of components:

- **Layout** - Header, sidebar, footer, responsive grid
- **Navigation** - Navbar, sidebar navigation, tabs, breadcrumbs
- **Content** - Cards, tables, lists, alerts, callouts
- **Forms** - Inputs, selects, checkboxes, validation states
- **Feedback** - Modals, toasts, tooltips, loaders
- **Data** - Statistics, badges, labels, timeline, data display patterns (fields, desc tables, banded rows, dot leaders, accent grids)
- **Interactive** - Command palette, detail panels, profile panel

### Component Example

```html
<div class="pa-card">
  <div class="pa-card__header">
    <h3>Card Title</h3>
  </div>
  <div class="pa-card__body">
    <p>Card content goes here.</p>
  </div>
  <div class="pa-card__footer">
    <button class="pa-btn pa-btn--primary">Save</button>
  </div>
</div>
```

## Grid System

Flexible grid system with responsive breakpoints:

```html
<div class="pa-row">
  <div class="pa-col-md-50">Half width on medium+</div>
  <div class="pa-col-md-50">Half width on medium+</div>
</div>
```

- `.pa-col-{5-100}` - Percentage widths (5% increments)
- `.pa-col-1-2`, `.pa-col-1-3`, `.pa-col-1-4` - Fraction widths
- `.pa-col-sm-*`, `.pa-col-md-*`, `.pa-col-lg-*`, `.pa-col-xl-*` - Responsive variants

## RTL Support

Full right-to-left language support. Simply add `dir="rtl"` to your HTML element:

```html
<html dir="rtl" lang="ar">
```

All components automatically mirror. Use logical utilities for RTL-aware spacing:

- `.ms-*` / `.me-*` - margin-inline-start/end
- `.ps-*` / `.pe-*` - padding-inline-start/end
- `.text-start` / `.text-end` - logical text alignment

## Layout Utilities

Height and flex utilities for dynamic layouts:

```html
<!-- Full height card in flex container -->
<div class="d-flex flex-column h-screen">
  <div class="pa-card flex-1 d-flex flex-column">
    <div class="pa-card__header">Fixed Header</div>
    <div class="pa-card__body flex-1 overflow-auto">Scrollable Content</div>
  </div>
</div>
```

- `.h-full`, `.h-screen` - 100% / 100vh height
- `.min-h-full`, `.min-h-screen` - Minimum heights
- `.flex-1`, `.flex-auto` - Flex grow/shrink utilities
- `.flex-grow`, `.flex-shrink-0` - Individual flex properties

## Theme Modes

Themes support light/dark modes via CSS classes:

```html
<body class="pa-mode-dark">
```

The Dark theme also supports color accent variants:

```html
<body class="pa-color-blue">
<!-- or pa-color-green, pa-color-red -->
```

## Docker Deployment

The demo server runs in Docker with themes baked in at build time. Themes not included in the image are downloaded on-demand from [pureadmin.io](https://pureadmin.io) when a user requests them.

```bash
make docker-build
docker compose up -d
```

Configure which themes are baked in via the `THEMES_URL` build arg in the Dockerfile. Additional themes are fetched lazily at runtime with a 10-minute negative cache for failed lookups.

## Development

### Prerequisites

- Node.js 18+
- npm 9+
- Make (recommended, or use npm commands directly)

### Setup

```bash
# Clone the repository
git clone https://github.com/KeenMate/pure-admin.git
cd pure-admin

# Install dependencies and build
make setup

# Build all packages (core + themes)
make build-all

# Run demo server
make dev
# Open http://localhost:3000
```

### Make Commands

```bash
make setup       # Install dependencies
make build       # Build core CSS
make build-all   # Build core + all themes
make dev         # Development mode with demo server
make watch       # Watch for changes
make clean       # Clean dist directories
make publish     # Publish to npm
```

### Without Make

If you don't have Make installed, use npm directly:

```bash
npm install                # Install dependencies
npm run build:all          # Build everything
npm run dev                # Development mode
```

## Repository Structure

```
pure-admin/
├── packages/
│   ├── core/           # @keenmate/pure-admin-core
│   ├── theme-audi/     # @keenmate/pure-admin-theme-audi
│   ├── theme-corporate/
│   ├── theme-dark/
│   ├── theme-express/
│   └── theme-minimal/
├── demo/               # Demo site (localhost:3000)
└── docs/               # Documentation
```

## Documentation

- **Component Examples**: Run the demo server and browse components
- **HTML Snippets**: See `packages/core/snippets/` for copy-paste examples
- **SCSS Variables**: See `packages/core/src/scss/variables/`

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Built with care by [KeenMate](https://keenmate.com).
