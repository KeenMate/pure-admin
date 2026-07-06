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

## `--pa-*` Variables (Pure Admin Framework)

These variables control the appearance of Pure Admin framework components.

### Core Colors

| Variable | Purpose |
|----------|---------|
| `--pa-main-bg` | Main background (cards, modals) |
| `--pa-page-bg` | Page background |
| `--pa-subtle-bg` | Subtle/muted area background |
| `--pa-text-color-1` | Primary text color |
| `--pa-text-color-2` | Secondary text color |
| `--pa-accent` | Accent color |
| `--pa-accent-hover` | Accent hover |
| `--pa-accent-light` | Light accent background |
| `--pa-border-color` | Border color |

### Layout - Header

| Variable | Purpose |
|----------|---------|
| `--pa-header-bg` | Header background |
| `--pa-header-border-color` | Header border |
| `--pa-header-text` | Header text |
| `--pa-header-text-secondary` | Header secondary text |
| `--pa-header-profile-name-color` | Profile name color |

### Layout - Sidebar

| Variable | Purpose |
|----------|---------|
| `--pa-sidebar-bg` | Sidebar background |
| `--pa-sidebar-text` | Sidebar text |
| `--pa-sidebar-text-secondary` | Sidebar secondary text |
| `--pa-sidebar-submenu-bg` | Submenu background |
| `--pa-sidebar-submenu-hover-bg` | Submenu hover |
| `--pa-sidebar-submenu-active-bg` | Submenu active |

### Layout - Footer

| Variable | Purpose |
|----------|---------|
| `--pa-footer-bg` | Footer background |
| `--pa-footer-border-color` | Footer border |

### Buttons

| Variant | Variables |
|---------|-----------|
| **Primary** | `--pa-btn-primary-bg`, `--pa-btn-primary-bg-hover`, `--pa-btn-primary-bg-light`, `--pa-btn-primary-text` |
| **Secondary** | `--pa-btn-secondary-bg`, `--pa-btn-secondary-bg-hover`, `--pa-btn-secondary-text` |
| **Success** | `--pa-btn-success-bg`, `--pa-btn-success-bg-hover`, `--pa-btn-success-text` |
| **Danger** | `--pa-btn-danger-bg`, `--pa-btn-danger-bg-hover`, `--pa-btn-danger-text` |
| **Warning** | `--pa-btn-warning-bg`, `--pa-btn-warning-bg-hover`, `--pa-btn-warning-text` |
| **Info** | `--pa-btn-info-bg`, `--pa-btn-info-bg-hover`, `--pa-btn-info-text` |
| **Light** | `--pa-btn-light-bg`, `--pa-btn-light-bg-hover`, `--pa-btn-light-text` |
| **Dark** | `--pa-btn-dark-bg`, `--pa-btn-dark-bg-hover`, `--pa-btn-dark-text` |

### Contextual/Semantic Colors

| Variant | Variables |
|---------|-----------|
| **Success** | `--pa-success-bg`, `--pa-success-bg-hover`, `--pa-success-bg-light`, `--pa-success-bg-subtle`, `--pa-success-border`, `--pa-success-text`, `--pa-success-text-light` |
| **Danger** | `--pa-danger-bg`, `--pa-danger-bg-hover`, `--pa-danger-bg-light`, `--pa-danger-bg-subtle`, `--pa-danger-border`, `--pa-danger-text`, `--pa-danger-text-light` |
| **Warning** | `--pa-warning-bg`, `--pa-warning-bg-hover`, `--pa-warning-bg-light`, `--pa-warning-bg-subtle`, `--pa-warning-border`, `--pa-warning-text`, `--pa-warning-text-light` |
| **Info** | `--pa-info-bg`, `--pa-info-bg-hover`, `--pa-info-bg-light`, `--pa-info-bg-subtle`, `--pa-info-border`, `--pa-info-text`, `--pa-info-text-light` |

### Cards

| Variable | Purpose |
|----------|---------|
| `--pa-card-bg` | Card background |
| `--pa-card-header-bg` | Card header background |
| `--pa-card-footer-bg` | Card footer background |
| `--pa-card-tabs-bg` | Card tabs background |

### Forms - Input

| Variable | Purpose |
|----------|---------|
| `--pa-input-bg` | Input background |
| `--pa-input-border` | Input border |
| `--pa-input-text` | Input text |
| `--pa-input-focus-border-color` | Input focus border |
| `--pa-select-focus-border-color` | Select focus border |
| `--pa-textarea-focus-border-color` | Textarea focus border |

### Forms - Checkbox

| Variable | Purpose |
|----------|---------|
| `--pa-checkbox-border-color` | Checkbox border |
| `--pa-checkbox-border-color-hover` | Checkbox hover border |
| `--pa-checkbox-border-color-checked` | Checkbox checked border |
| `--pa-checkbox-bg` | Checkbox background |
| `--pa-checkbox-bg-checked` | Checkbox checked background |
| `--pa-checkbox-bg-indeterminate` | Checkbox indeterminate background |
| `--pa-checkbox-checkmark-color` | Checkmark color |
| `--pa-checkbox-focus-shadow` | Checkbox focus shadow |

### Forms - Input Group

| Variable | Purpose |
|----------|---------|
| `--pa-input-group-prepend-bg` | Prepend background |
| `--pa-input-group-prepend-text` | Prepend text |
| `--pa-input-group-append-bg` | Append background |
| `--pa-input-group-append-text` | Append text |

### Tables

| Variable | Purpose |
|----------|---------|
| `--pa-table-bg` | Table background |
| `--pa-table-header-bg` | Table header background |
| `--pa-table-stripe` | Striped row background |
| `--pa-table-hover-bg` | Row hover background |
| `--pa-table-hover-accent-color` | Row hover accent border |

### Modals

| Variable | Purpose |
|----------|---------|
| `--pa-modal-overlay-bg` | Modal overlay |
| `--pa-modal-content-bg` | Modal content background |

### Alerts

| Variant | Variables |
|---------|-----------|
| **Success** | `--pa-alert-success-bg`, `--pa-alert-success-border`, `--pa-alert-success-text` |
| **Danger** | `--pa-alert-danger-bg`, `--pa-alert-danger-border`, `--pa-alert-danger-text` |
| **Warning** | `--pa-alert-warning-bg`, `--pa-alert-warning-border`, `--pa-alert-warning-text` |
| **Info** | `--pa-alert-info-bg`, `--pa-alert-info-border`, `--pa-alert-info-text` |

### Badges

| Variant | Variables |
|---------|-----------|
| **Success** | `--pa-badge-success-bg`, `--pa-badge-success-text` |
| **Warning** | `--pa-badge-warning-bg`, `--pa-badge-warning-text` |
| **Info** | `--pa-badge-info-bg`, `--pa-badge-info-text` |
| **Danger** | `--pa-badge-danger-bg`, `--pa-badge-danger-text` |

### Composite Badges

| Variable | Purpose |
|----------|---------|
| `--pa-composite-badge-icon-bg` | Icon section background |
| `--pa-composite-badge-label-bg` | Label background |
| `--pa-composite-badge-label-text` | Label text |
| `--pa-composite-badge-label-hover-bg` | Label hover |

### Tooltips & Popovers

| Variable | Purpose |
|----------|---------|
| `--pa-tooltip-bg` | Tooltip background |
| `--pa-tooltip-text` | Tooltip text |
| `--pa-popover-content-bg` | Popover background |
| `--pa-popover-text-light` | Popover light text |
| `--pa-popover-text-dark` | Popover dark text |

### Loaders

| Variable | Purpose |
|----------|---------|
| `--pa-loader-overlay-bg` | Loader overlay |

### Profile Panel

| Variable | Purpose |
|----------|---------|
| `--pa-profile-overlay-bg` | Profile panel overlay |

### Command Palette

| Variable | Purpose |
|----------|---------|
| `--pa-command-palette-backdrop-bg` | Backdrop |
| `--pa-command-palette-item-hover-bg` | Item hover |
| `--pa-command-palette-item-active-bg` | Item active |
| `--pa-command-palette-highlight-bg` | Search highlight background |
| `--pa-command-palette-highlight-text` | Search highlight text |

### Multiselect

| Variable | Purpose |
|----------|---------|
| `--pa-multiselect-dropdown-bg` | Dropdown background |
| `--pa-multiselect-dropdown-border` | Dropdown border |
| `--pa-multiselect-dropdown-text` | Dropdown text |
| `--pa-multiselect-hint-bg` | Hint background |
| `--pa-multiselect-hint-border` | Hint border |
| `--pa-multiselect-option-hover-bg` | Option hover |
| `--pa-multiselect-pill-bg` | Selected pill background |
| `--pa-multiselect-pill-border` | Selected pill border |

### Range Group

Consumed with an inline fallback (`var(--pa-range-x, <default>)`), so these are
**not** emitted by the `output-pa-css-variables` mixin — set them at `:root`, on
`.pa-mode-*`, or on any `.pa-range` / `.pa-range-group` ancestor (or per-instance
`style="…"`) to retint/resize sliders without a recompile. Unset, each resolves
to the framework default shown, so a `var()` reference never collapses to nothing.

| Variable | Purpose | Falls back to |
|----------|---------|---------------|
| `--pa-range-track` | Slider track colour | `--pa-surface-track` |
| `--pa-range-fill` | Selected-range fill (and value readout) | `--pa-accent` |
| `--pa-range-thumb-bg` | Handle interior | `--pa-card-bg` |
| `--pa-range-thumb-border` | Handle ring / bar / chevron colour | `--pa-accent` |
| `--pa-range-thumb-border-hover` | Handle colour on hover | `--pa-accent-hover` |
| `--pa-range-focus-ring` | Thumb focus / active ring | `--pa-accent-light` |
| `--pa-range-tick` | Minor tick-mark colour | `--pa-border-color` |
| `--pa-range-tick-major` | Major tick-mark colour | `--pa-text-tertiary` |
| `--pa-range-track-height` | Track / fill thickness | `0.4rem` |
| `--pa-range-thumb-size` | Default round handle diameter | `1.6rem` |
| `--pa-range-group-panel-min-width` | Floating panel min width | `32rem` |

### Custom Theme Colors

| Variable | Purpose |
|----------|---------|
| `--pa-color-1` | Theme-defined branded color 1 |
| `--pa-color-2` | Theme-defined branded color 2 |
| `--pa-color-3` | Theme-defined branded color 3 |
| `--pa-color-4` | Theme-defined branded color 4 |
| `--pa-color-5` | Theme-defined branded color 5 |
| `--pa-color-6` | Theme-defined branded color 6 |
| `--pa-color-7` | Theme-defined branded color 7 |
| `--pa-color-8` | Theme-defined branded color 8 |
| `--pa-color-9` | Theme-defined branded color 9 |

---

## Summary

| Category | Count |
|----------|-------|
| `--base-*` variables | 71 |
| `--pa-*` variables | 124 |
| **Total** | **195** |

---

## Source Files

- **Mixin definitions:** `packages/core/src/scss/_base-css-variables.scss`
- **SCSS source variables:** `packages/core/src/scss/variables/_base.scss`
