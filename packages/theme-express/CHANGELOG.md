# Changelog

All notable changes to @keenmate/pure-admin-theme-express will be documented in this file.

## [1.5.1] - 2026-02-15 ✅ Published

Rebuilt with `@keenmate/pure-admin-core@1.5.1` — includes 7 new data display components, CSS container query support, ghost card variant, and dark mode shadow fix.

---

## [1.0.1] - 2026-01-17

### Changed
- **Font changed from Delivery to Fira Sans Condensed** - Theme now uses Fira Sans Condensed font (same as Audi theme)
- **Updated theme.json** - Font family declaration updated to match actual SCSS

### Removed
- **Removed Delivery font reference** - Was declared in `theme.json` but never actually used in SCSS

## [1.0.0-rc01] - 2026-01-01

First release candidate.

### Added
- Bold yellow and red theme inspired by logistics brands
- Light/dark mode support via `.pa-mode-light` / `.pa-mode-dark` classes
- Fira Sans Condensed font integration
- Theme manifest (`theme.json`) declaring capabilities

### Fixed
- Dark mode navbar dropdown visibility (changed to direct child selector)
- Dark mode footer text color (dark text on yellow background)
- Dark mode primary alert contrast (white text on red background)
