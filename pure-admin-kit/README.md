# Pure Admin Kit

A modern Svelte component library for building admin dashboards with PureCSS.

## Installation

```bash
npm install pure-admin-kit
```

## Usage

```javascript
import { Header, Sidebar, StatCard, DataTable, ChartCard } from 'pure-admin-kit';
import 'pure-admin-kit/styles';

// Use components in your Svelte app
```

## Components

- **Header** - Top navigation bar with search, notifications, and user menu
- **Sidebar** - Collapsible sidebar navigation
- **StatCard** - Dashboard metric cards with icons and change indicators
- **DataTable** - Responsive data table component
- **ChartCard** - Container component for charts and visualizations

## Development

```bash
npm run dev      # Start development server
npm run build    # Build library for distribution
npm run package  # Package components for npm publishing
```

## Styling

The library uses PureCSS as a foundation and includes CSS custom properties for theming. Import the styles to get the complete design system:

```javascript
import 'pure-admin-kit/styles';
```

## License

ISC