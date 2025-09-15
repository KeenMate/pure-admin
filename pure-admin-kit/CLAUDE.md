# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **pure-admin-kit**, a Svelte component library for building admin dashboards with PureCSS. It provides reusable components for creating responsive admin interfaces.

## Development Commands

- `npm run dev` - Start development server (for development/testing)
- `npm run build` - Build library for distribution
- `npm run package` - Package components for npm publishing
- `npm run preview` - Preview production build

## Library Architecture

### Framework Stack
- **Svelte** - Component framework
- **SvelteKit** - Build tooling and packaging
- **PureCSS** - Minimal CSS framework for styling foundation
- **Vite** - Build tool and development server

### Project Structure
```
src/
├── app.css              # Global styles with CSS custom properties
└── lib/
    ├── index.js         # Main library entry point
    ├── package.json     # Library package config
    └── components/      # Reusable Svelte components
        ├── Header.svelte     # Top navigation bar
        ├── Sidebar.svelte    # Collapsible side navigation
        ├── StatCard.svelte   # Dashboard metric cards
        ├── DataTable.svelte  # Table component
        └── ChartCard.svelte  # Chart container
```

### Component Library Usage

#### Installation
```bash
npm install pure-admin-kit
```

#### Basic Import
```javascript
import { Header, Sidebar, StatCard, DataTable, ChartCard } from 'pure-admin-kit';
import 'pure-admin-kit/styles';
```

#### Component Props
- **Sidebar**: `sidebarCollapsed`, `sidebarOpen`, `toggleSidebar`, `currentPath`, `menuItems`
- **Header**: `toggleSidebar`
- **StatCard**: `label`, `value`, `icon`, `type`, `change`
- **DataTable**: `data`, `columns`
- **ChartCard**: Component wrapper for charts

### Styling Approach
- **CSS Custom Properties**: Defined in `:root` for consistent theming
- **PureCSS Foundation**: Uses Pure's grid system and base styles
- **Component-scoped CSS**: Svelte's scoped styling in `<style>` blocks
- **Responsive Design**: Mobile-first approach with breakpoints at 768px

### Key CSS Variables
```css
--sidebar-width: 250px
--sidebar-collapsed-width: 60px
--header-height: 60px
--primary-color: #3b82f6
--sidebar-bg: #1e293b
--body-bg: #f1f5f9
```

### Component Patterns
- All components are framework-agnostic (no SvelteKit dependencies)
- Props export for component configuration
- Event dispatching via `on:click` handlers
- Conditional rendering with `{#if}` blocks
- Customizable menu items and styling

### Package Distribution
- Built components go to `dist/` directory
- CSS styles exported separately as `pure-admin-kit/styles`
- TypeScript definitions included
- Peer dependency on Svelte ^5.0.0