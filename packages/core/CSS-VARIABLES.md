# CSS Variables Reference

This document lists all CSS custom properties exported by Pure Admin for theming.

## `--base-*` Variables (Web Component Theming)

These variables are designed for web component integration and follow a semantic naming convention.

| Category | Variable | Purpose |
|----------|----------|---------|
| **Accent** | `--base-accent-color` | Primary accent color |
| | `--base-accent-color-hover` | Accent hover state |
| | `--base-accent-color-active` | Accent active state |
| | `--base-accent-color-light` | Light accent background |
| | `--base-accent-color-light-hover` | Light accent hover |
| **Text** | `--base-text-color-1` | Primary text (highest contrast) |
| | `--base-text-color-2` | Secondary text |
| | `--base-text-color-3` | Tertiary text |
| | `--base-text-color-4` | Disabled/muted text |
| | `--base-text-color-on-accent` | Text on accent backgrounds |
| **Background** | `--base-main-bg` | Cards, modals, content areas |
| | `--base-page-bg` | Page background, subtle sections |
| | `--base-subtle-bg` | Muted areas, dividers |
| | `--base-inverse-bg` | Inverse backgrounds (tooltips) |
| | `--base-overlay-bg` | Modal/popover overlays |
| | `--base-shadow-color` | Box shadow color |
| | `--base-hover-bg` | Hover state background |
| | `--base-active-bg` | Active/pressed state background |
| | `--base-disabled-bg` | Disabled element background |
| **Border** | `--base-border-color` | Standard border color |
| | `--base-border` | Full border shorthand |
| **Input** | `--base-input-bg` | Input background |
| | `--base-input-color` | Input text color |
| | `--base-input-border` | Input border |
| | `--base-input-border-hover` | Input border on hover |
| | `--base-input-border-focus` | Input border on focus |
| | `--base-input-placeholder-color` | Placeholder text |
| | `--base-input-bg-disabled` | Disabled input background |
| **Input Sizes** | `--base-input-size-xs-height` | XS input height |
| | `--base-input-size-sm-height` | SM input height |
| | `--base-input-size-md-height` | MD input height |
| | `--base-input-size-lg-height` | LG input height |
| | `--base-input-size-xl-height` | XL input height |
| **Dropdown** | `--base-dropdown-bg` | Dropdown background |
| | `--base-dropdown-border` | Dropdown border |
| | `--base-dropdown-box-shadow` | Dropdown shadow |
| **Tooltip** | `--base-tooltip-bg` | Tooltip background |
| | `--base-tooltip-text-color` | Tooltip text |
| **Success** | `--base-success-color` | Success color |
| | `--base-success-color-hover` | Success hover |
| | `--base-success-bg-light` | Light success background |
| | `--base-success-bg-subtle` | Subtle success background |
| | `--base-success-border` | Success border |
| | `--base-success-text` | Success text |
| | `--base-success-text-light` | Light success text |
| | `--base-text-on-success` | Text on success background |
| **Danger** | `--base-danger-color` | Danger color |
| | `--base-danger-color-hover` | Danger hover |
| | `--base-danger-bg-light` | Light danger background |
| | `--base-danger-bg-subtle` | Subtle danger background |
| | `--base-danger-border` | Danger border |
| | `--base-danger-text` | Danger text |
| | `--base-danger-text-light` | Light danger text |
| | `--base-text-on-danger` | Text on danger background |
| **Warning** | `--base-warning-color` | Warning color |
| | `--base-warning-color-hover` | Warning hover |
| | `--base-warning-bg-light` | Light warning background |
| | `--base-warning-bg-subtle` | Subtle warning background |
| | `--base-warning-border` | Warning border |
| | `--base-warning-text` | Warning text |
| | `--base-warning-text-light` | Light warning text |
| | `--base-text-on-warning` | Text on warning background |
| **Info** | `--base-info-color` | Info color |
| | `--base-info-color-hover` | Info hover |
| | `--base-info-bg-light` | Light info background |
| | `--base-info-bg-subtle` | Subtle info background |
| | `--base-info-border` | Info border |
| | `--base-info-text` | Info text |
| | `--base-info-text-light` | Light info text |
| | `--base-text-on-info` | Text on info background |
| **Interactive** | `--base-hover-overlay` | Hover overlay opacity |
| | `--base-active-overlay` | Active overlay opacity |
| | `--base-focus-ring-color` | Focus ring color |
| | `--base-focus-ring-width` | Focus ring width |
| **Typography** | `--base-font-family` | Primary font stack |
| | `--base-font-family-mono` | Monospace font stack |
| | `--base-font-size-2xs` | 10px |
| | `--base-font-size-xs` | 12px |
| | `--base-font-size-sm` | 14px |
| | `--base-font-size-base` | 16px |
| | `--base-font-size-lg` | 18px |
| | `--base-font-size-xl` | 20px |
| | `--base-font-size-2xl` | 24px |
| | `--base-font-weight-normal` | 400 |
| | `--base-font-weight-medium` | 500 |
| | `--base-font-weight-semibold` | 600 |
| | `--base-font-weight-bold` | 700 |
| | `--base-line-height-tight` | Tight line height |
| | `--base-line-height-normal` | Normal line height |
| | `--base-line-height-relaxed` | Relaxed line height |
| **Border Radius** | `--base-border-radius-sm` | Small radius |
| | `--base-border-radius-md` | Medium radius |
| | `--base-border-radius-lg` | Large radius |

---

## `--pc-*` Variables (Pure Admin Framework)

These variables control the appearance of Pure Admin framework components.

### Core Colors

| Variable | Purpose |
|----------|---------|
| `--pc-main-bg` | Main background (cards, modals) |
| `--pc-page-bg` | Page background |
| `--pc-subtle-bg` | Subtle/muted area background |
| `--pc-text-color-1` | Primary text color |
| `--pc-text-color-2` | Secondary text color |
| `--pc-accent` | Accent color |
| `--pc-accent-hover` | Accent hover |
| `--pc-accent-light` | Light accent background |
| `--pc-border-color` | Border color |

### Layout - Navbar

| Variable | Purpose |
|----------|---------|
| `--pc-navbar-bg` | Navbar background |
| `--pc-navbar-border-color` | Navbar border |
| `--pc-navbar-text` | Navbar text |
| `--pc-navbar-text-secondary` | Navbar secondary text |
| `--pc-navbar-profile-name-color` | Profile name color |

### Layout - Sidebar

| Variable | Purpose |
|----------|---------|
| `--pc-sidebar-bg` | Sidebar background |
| `--pc-sidebar-text` | Sidebar text |
| `--pc-sidebar-text-secondary` | Sidebar secondary text |
| `--pc-sidebar-submenu-bg` | Submenu background |
| `--pc-sidebar-submenu-hover-bg` | Submenu hover |
| `--pc-sidebar-submenu-active-bg` | Submenu active |

### Layout - Footer

| Variable | Purpose |
|----------|---------|
| `--pc-footer-bg` | Footer background |
| `--pc-footer-border-color` | Footer border |

### Buttons

| Variant | Variables |
|---------|-----------|
| **Primary** | `--pc-btn-primary-bg`, `--pc-btn-primary-bg-hover`, `--pc-btn-primary-bg-light`, `--pc-btn-primary-text` |
| **Secondary** | `--pc-btn-secondary-bg`, `--pc-btn-secondary-bg-hover`, `--pc-btn-secondary-text` |
| **Success** | `--pc-btn-success-bg`, `--pc-btn-success-bg-hover`, `--pc-btn-success-text` |
| **Danger** | `--pc-btn-danger-bg`, `--pc-btn-danger-bg-hover`, `--pc-btn-danger-text` |
| **Warning** | `--pc-btn-warning-bg`, `--pc-btn-warning-bg-hover`, `--pc-btn-warning-text` |
| **Info** | `--pc-btn-info-bg`, `--pc-btn-info-bg-hover`, `--pc-btn-info-text` |
| **Light** | `--pc-btn-light-bg`, `--pc-btn-light-bg-hover`, `--pc-btn-light-text` |
| **Dark** | `--pc-btn-dark-bg`, `--pc-btn-dark-bg-hover`, `--pc-btn-dark-text` |

### Contextual/Semantic Colors

| Variant | Variables |
|---------|-----------|
| **Success** | `--pc-success-bg`, `--pc-success-bg-hover`, `--pc-success-bg-light`, `--pc-success-bg-subtle`, `--pc-success-border`, `--pc-success-text`, `--pc-success-text-light` |
| **Danger** | `--pc-danger-bg`, `--pc-danger-bg-hover`, `--pc-danger-bg-light`, `--pc-danger-bg-subtle`, `--pc-danger-border`, `--pc-danger-text`, `--pc-danger-text-light` |
| **Warning** | `--pc-warning-bg`, `--pc-warning-bg-hover`, `--pc-warning-bg-light`, `--pc-warning-bg-subtle`, `--pc-warning-border`, `--pc-warning-text`, `--pc-warning-text-light` |
| **Info** | `--pc-info-bg`, `--pc-info-bg-hover`, `--pc-info-bg-light`, `--pc-info-bg-subtle`, `--pc-info-border`, `--pc-info-text`, `--pc-info-text-light` |

### Cards

| Variable | Purpose |
|----------|---------|
| `--pc-card-bg` | Card background |
| `--pc-card-header-bg` | Card header background |
| `--pc-card-footer-bg` | Card footer background |
| `--pc-card-tabs-bg` | Card tabs background |

Consumed with an inline fallback (`var(--pc-card-description-offset-y, <default>)`),
so it is **not** emitted by the `output-pc-css-variables` mixin — set it at `:root`,
on `.pc-mode-*`, or on any card ancestor to retune without a recompile.

| Variable | Purpose | Falls back to |
|----------|---------|---------------|
| `--pc-card-description-offset-y` | Vertical nudge dropping the header `.pa-card__description` (smaller font) onto the title's baseline under the header's center alignment. Font-metric dependent — retune per theme font, or set `0` to disable. | `$card-description-offset-y` (`1px`) |

### Forms - Input

| Variable | Purpose |
|----------|---------|
| `--pc-input-bg` | Input background |
| `--pc-input-border` | Input border |
| `--pc-input-text` | Input text |
| `--pc-input-focus-border-color` | Input focus border |
| `--pc-select-focus-border-color` | Select focus border |
| `--pc-textarea-focus-border-color` | Textarea focus border |

### Forms - Checkbox

| Variable | Purpose |
|----------|---------|
| `--pc-checkbox-border-color` | Checkbox border |
| `--pc-checkbox-border-color-hover` | Checkbox hover border |
| `--pc-checkbox-border-color-checked` | Checkbox checked border |
| `--pc-checkbox-bg` | Checkbox background |
| `--pc-checkbox-bg-checked` | Checkbox checked background |
| `--pc-checkbox-bg-indeterminate` | Checkbox indeterminate background |
| `--pc-checkbox-checkmark-color` | Checkmark color |
| `--pc-checkbox-focus-shadow` | Checkbox focus shadow |

### Forms - Input Group

| Variable | Purpose |
|----------|---------|
| `--pc-input-group-prepend-bg` | Prepend background |
| `--pc-input-group-prepend-text` | Prepend text |
| `--pc-input-group-append-bg` | Append background |
| `--pc-input-group-append-text` | Append text |

### Tables

| Variable | Purpose |
|----------|---------|
| `--pc-table-bg` | Table background |
| `--pc-table-header-bg` | Table header background |
| `--pc-table-stripe` | Striped row background |
| `--pc-table-hover-bg` | Row hover background |
| `--pc-table-hover-accent-color` | Row hover accent border |

### Modals

| Variable | Purpose |
|----------|---------|
| `--pc-modal-overlay-bg` | Modal overlay |
| `--pc-modal-content-bg` | Modal content background |

### Alerts

| Variant | Variables |
|---------|-----------|
| **Success** | `--pc-alert-success-bg`, `--pc-alert-success-border`, `--pc-alert-success-text` |
| **Danger** | `--pc-alert-danger-bg`, `--pc-alert-danger-border`, `--pc-alert-danger-text` |
| **Warning** | `--pc-alert-warning-bg`, `--pc-alert-warning-border`, `--pc-alert-warning-text` |
| **Info** | `--pc-alert-info-bg`, `--pc-alert-info-border`, `--pc-alert-info-text` |

### Badges

| Variant | Variables |
|---------|-----------|
| **Success** | `--pc-badge-success-bg`, `--pc-badge-success-text` |
| **Warning** | `--pc-badge-warning-bg`, `--pc-badge-warning-text` |
| **Info** | `--pc-badge-info-bg`, `--pc-badge-info-text` |
| **Danger** | `--pc-badge-danger-bg`, `--pc-badge-danger-text` |

### Composite Badges

| Variable | Purpose |
|----------|---------|
| `--pc-composite-badge-icon-bg` | Icon section background |
| `--pc-composite-badge-label-bg` | Label background |
| `--pc-composite-badge-label-text` | Label text |
| `--pc-composite-badge-label-hover-bg` | Label hover |

### Tooltips & Popovers

| Variable | Purpose |
|----------|---------|
| `--pc-tooltip-bg` | Tooltip background |
| `--pc-tooltip-text` | Tooltip text |
| `--pc-popover-content-bg` | Popover background |
| `--pc-popover-text-light` | Popover light text |
| `--pc-popover-text-dark` | Popover dark text |

### Loaders

| Variable | Purpose |
|----------|---------|
| `--pc-loader-overlay-bg` | Loader overlay |

### Profile Panel

| Variable | Purpose |
|----------|---------|
| `--pc-profile-overlay-bg` | Profile panel overlay |

### Command Palette

| Variable | Purpose |
|----------|---------|
| `--pc-command-palette-backdrop-bg` | Backdrop |
| `--pc-command-palette-item-hover-bg` | Item hover |
| `--pc-command-palette-item-active-bg` | Item active |
| `--pc-command-palette-highlight-bg` | Search highlight background |
| `--pc-command-palette-highlight-text` | Search highlight text |

**Runtime sizing** (not emitted by the theme mixins — each falls back to its
compile-time SCSS default, so setting one at `:root`, inline, or per-instance
resizes the palette without a recompile):

| Variable | Purpose | Default |
|----------|---------|---------|
| `--pc-command-palette-width` | Container max-width | `60.8rem` |
| `--pc-command-palette-offset-top` | Gap above the palette | `12.8rem` |
| `--pc-command-palette-results-max-height` | Results scroll height | `38.4rem` |

Size presets that set both width **and** results height for you (add on
`.pa-command-palette`): `--sm` (48 / 28.8rem), `--lg` (76.8 / 51.2rem),
`--xl` (89.6 / 64rem). Default (no modifier) is 60.8 / 38.4rem.

The results height is additionally clamped to the viewport
(`min(<results-max-height>, calc(100dvh − offset-top − chrome))`) so the palette
footer never scrolls off-screen on a short window, regardless of the value set.

### Search Match Highlight

Full-text match highlight (`<mark>`), shared by the `pa-search-results` page
(`.pa-search-results__mark`) **and** the `pa-search-autocomplete` popover (the
inline navbar search + palette-field autocomplete), so a query match looks the
same wherever it appears. Not emitted by the theme mixins — each falls back to
its default, so a theme (or a consumer) can retune the highlight at `:root`
without a recompile:

| Variable | Purpose | Default |
|----------|---------|---------|
| `--pc-search-mark-bg` | Highlight background | `color-mix(in srgb, var(--pc-accent) 15%, transparent)` |
| `--pc-search-mark-color` | Highlight text colour | `inherit` |
| `--pc-search-mark-weight` | Highlight font weight | `500` (medium) |

(The command palette's own result highlight is separate — see
`--pc-command-palette-highlight-bg/-text` above.)

### Multiselect

| Variable | Purpose |
|----------|---------|
| `--pc-multiselect-dropdown-bg` | Dropdown background |
| `--pc-multiselect-dropdown-border` | Dropdown border |
| `--pc-multiselect-dropdown-text` | Dropdown text |
| `--pc-multiselect-hint-bg` | Hint background |
| `--pc-multiselect-hint-border` | Hint border |
| `--pc-multiselect-option-hover-bg` | Option hover |
| `--pc-multiselect-pill-bg` | Selected pill background |
| `--pc-multiselect-pill-border` | Selected pill border |

### Range Group

Consumed with an inline fallback (`var(--pc-range-x, <default>)`), so these are
**not** emitted by the `output-pc-css-variables` mixin — set them at `:root`, on
`.pc-mode-*`, or on any `.pa-range` / `.pa-range-group` ancestor (or per-instance
`style="…"`) to retint/resize sliders without a recompile. Unset, each resolves
to the framework default shown, so a `var()` reference never collapses to nothing.

| Variable | Purpose | Falls back to |
|----------|---------|---------------|
| `--pc-range-track` | Slider track colour | `--pc-surface-track` |
| `--pc-range-fill` | Selected-range fill (and value readout) | `--pc-accent` |
| `--pc-range-thumb-bg` | Handle interior | `--pc-card-bg` |
| `--pc-range-thumb-border` | Handle ring / bar / chevron colour | `--pc-accent` |
| `--pc-range-thumb-border-hover` | Handle colour on hover | `--pc-accent-hover` |
| `--pc-range-focus-ring` | Thumb focus / active ring | `--pc-accent-light` |
| `--pc-range-tick` | Minor tick-mark colour | `--pc-border-color` |
| `--pc-range-tick-major` | Major tick-mark colour | `--pc-text-tertiary` |
| `--pc-range-track-height` | Track / fill thickness | `0.4rem` |
| `--pc-range-thumb-size` | Default round handle diameter | `1.6rem` |
| `--pc-range-group-panel-min-width` | Floating panel min width | `32rem` |

### Custom Theme Colors

| Variable | Purpose |
|----------|---------|
| `--pc-color-1` | Theme-defined branded color 1 |
| `--pc-color-2` | Theme-defined branded color 2 |
| `--pc-color-3` | Theme-defined branded color 3 |
| `--pc-color-4` | Theme-defined branded color 4 |
| `--pc-color-5` | Theme-defined branded color 5 |
| `--pc-color-6` | Theme-defined branded color 6 |
| `--pc-color-7` | Theme-defined branded color 7 |
| `--pc-color-8` | Theme-defined branded color 8 |
| `--pc-color-9` | Theme-defined branded color 9 |

### Data Display — Copy Hint (i18n)

Consumed with an English fallback, **not** emitted by the theme mixins — set them
yourself (on any ancestor; they inherit) to translate the copy affordance shared by
`pa-field` / `pa-desc-table` / `pa-banded` / `pa-accent-grid`. Unset → English.

| Variable | Purpose | Fallback |
|----------|---------|----------|
| `--pc-copy-hint-text` | `--copy-click` hover hint text | `'Click to copy'` |
| `--pc-copied-text` | `--copied` post-copy feedback text | `'Copied!'` |

---

## Summary

| Category | Count |
|----------|-------|
| `--base-*` variables | 71 |
| `--pc-*` variables | 124 |
| **Total** | **195** |

---

## Source Files

- **Mixin definitions:** `packages/core/src/scss/_base-css-variables.scss`
- **SCSS source variables:** `packages/core/src/scss/variables/_base.scss`
