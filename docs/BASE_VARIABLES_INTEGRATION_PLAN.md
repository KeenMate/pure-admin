# Plan: Base CSS Variables Integration for Pure Admin

## Overview

Make Pure Admin the authoritative source of truth for `--base-*` CSS custom properties, enabling web components (web-daterangepicker, web-multiselect, etc.) to inherit theming automatically.

**Architecture:**
1. Pure Admin defines `$base-*` SCSS variables (source of truth)
2. Themes override these SCSS variables as needed
3. Output mixin converts SCSS → `--base-*` CSS custom properties
4. Web components consume CSS variables via fallback chains

---

## Current State

### Pure Admin
- 600+ SCSS variables with `!default` flags
- 9 themes using import → override → core pattern
- 10px rem base (`1rem = 10px`)
- No CSS custom properties exported

### Web Components
- Reference `--base-*` via: `var(--base-accent-color, #3b82f6)`
- Use unitless multipliers for font sizes
- Expect ~40 base variables

---

## Implementation Architecture

### Data Flow
```
_variables.scss          themes/express.scss           Output CSS
────────────────        ─────────────────────        ─────────────
$base-accent-color:     $base-accent-color:          :root {
  #3b82f6 !default;  →    #dc2626;               →    --base-accent-color: #dc2626;
                        @include output-base-vars;     ...
                                                     }
```

### File Structure
```
src/scss/
├── _variables.scss              # Add $base-* SCSS variables
├── _base-css-variables.scss     # NEW: Mixin to output CSS vars
├── _core.scss                   # Unchanged
└── themes/
    ├── corporate.scss           # Override $base-*, @include output
    ├── express.scss             # Override $base-*, @include output
    └── ...                      # All themes
```

---

## Required `$base-*` SCSS Variables

### Colors (add to _variables.scss)
```scss
// Base theme variables (source of truth for web components)
$base-accent-color: $accent-color !default;
$base-accent-color-hover: lighten($base-accent-color, 10%) !default;
$base-accent-color-active: lighten($base-accent-color, 20%) !default;
$base-primary-bg: $card-bg !default;
$base-primary-bg-hover: darken($base-primary-bg, 5%) !default;
$base-text-color-1: $text-primary !default;
$base-text-color-2: $text-secondary !default;
$base-text-color-3: $text-muted !default;
$base-text-color-4: $text-placeholder !default;
$base-text-on-accent: #ffffff !default;  // or computed contrast
$base-border-color: $border-color !default;
```

### Input Fields
```scss
$base-input-background: $input-bg !default;
$base-input-color: $input-text !default;
$base-input-border: 1px solid $input-border !default;
$base-input-border-hover: 1px solid darken($input-border, 10%) !default;
$base-input-border-focus: 1px solid $base-accent-color !default;
$base-input-placeholder-color: $text-placeholder !default;
$base-input-background-disabled: rgba($input-bg, 0.5) !default;
```

### Input Size Heights (unitless multipliers for × 10px)
```scss
$base-input-size-xs-height: 3.1 !default;  // 31px
$base-input-size-sm-height: 3.3 !default;  // 33px
$base-input-size-md-height: 3.5 !default;  // 35px
$base-input-size-lg-height: 3.8 !default;  // 38px
$base-input-size-xl-height: 4.1 !default;  // 41px
```

### Dropdown/Popover
```scss
$base-dropdown-background: $card-bg !default;
$base-dropdown-border: 1px solid $border-color !default;
$base-dropdown-box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !default;
```

### Tooltip
```scss
$base-tooltip-background: $tooltip-bg !default;
$base-tooltip-text-color: $tooltip-text !default;
```

### Typography (unitless multipliers)
```scss
$base-font-family: $body-font-family !default;
$base-font-size-2xs: 1.0 !default;   // × 10px = 10px
$base-font-size-xs: 1.2 !default;    // × 10px = 12px
$base-font-size-sm: 1.4 !default;    // × 10px = 14px
$base-font-size-base: 1.6 !default;  // × 10px = 16px
$base-font-size-lg: 1.8 !default;    // × 10px = 18px
$base-font-size-xl: 2.0 !default;    // × 10px = 20px
$base-font-size-2xl: 2.4 !default;   // × 10px = 24px
$base-font-weight-normal: $font-weight-normal !default;
$base-font-weight-medium: $font-weight-medium !default;
$base-font-weight-semibold: $font-weight-semibold !default;
$base-line-height-tight: $line-height-tight !default;
$base-line-height-normal: $line-height-base !default;
$base-line-height-relaxed: $line-height-relaxed !default;
```

### Border Radius (unitless multipliers)
```scss
$base-border-radius-sm: 0.4 !default;  // × 10px = 4px
$base-border-radius-md: 0.6 !default;  // × 10px = 6px
$base-border-radius-lg: 0.8 !default;  // × 10px = 8px
```

---

## Output Mixin (_base-css-variables.scss)

```scss
// _base-css-variables.scss
// Outputs all $base-* SCSS variables as --base-* CSS custom properties

@mixin output-base-css-variables {
  // Colors
  --base-accent-color: #{$base-accent-color};
  --base-accent-color-hover: #{$base-accent-color-hover};
  --base-accent-color-active: #{$base-accent-color-active};
  --base-primary-bg: #{$base-primary-bg};
  --base-primary-bg-hover: #{$base-primary-bg-hover};
  --base-text-color-1: #{$base-text-color-1};
  --base-text-color-2: #{$base-text-color-2};
  --base-text-color-3: #{$base-text-color-3};
  --base-text-color-4: #{$base-text-color-4};
  --base-text-on-accent: #{$base-text-on-accent};
  --base-border-color: #{$base-border-color};

  // Input fields
  --base-input-background: #{$base-input-background};
  --base-input-color: #{$base-input-color};
  --base-input-border: #{$base-input-border};
  --base-input-border-hover: #{$base-input-border-hover};
  --base-input-border-focus: #{$base-input-border-focus};
  --base-input-placeholder-color: #{$base-input-placeholder-color};
  --base-input-background-disabled: #{$base-input-background-disabled};

  // Input size heights
  --base-input-size-xs-height: #{$base-input-size-xs-height};
  --base-input-size-sm-height: #{$base-input-size-sm-height};
  --base-input-size-md-height: #{$base-input-size-md-height};
  --base-input-size-lg-height: #{$base-input-size-lg-height};
  --base-input-size-xl-height: #{$base-input-size-xl-height};

  // Dropdown
  --base-dropdown-background: #{$base-dropdown-background};
  --base-dropdown-border: #{$base-dropdown-border};
  --base-dropdown-box-shadow: #{$base-dropdown-box-shadow};

  // Tooltip
  --base-tooltip-background: #{$base-tooltip-background};
  --base-tooltip-text-color: #{$base-tooltip-text-color};

  // Typography
  --base-font-family: #{$base-font-family};
  --base-font-size-2xs: #{$base-font-size-2xs};
  --base-font-size-xs: #{$base-font-size-xs};
  --base-font-size-sm: #{$base-font-size-sm};
  --base-font-size-base: #{$base-font-size-base};
  --base-font-size-lg: #{$base-font-size-lg};
  --base-font-size-xl: #{$base-font-size-xl};
  --base-font-size-2xl: #{$base-font-size-2xl};
  --base-font-weight-normal: #{$base-font-weight-normal};
  --base-font-weight-medium: #{$base-font-weight-medium};
  --base-font-weight-semibold: #{$base-font-weight-semibold};
  --base-line-height-tight: #{$base-line-height-tight};
  --base-line-height-normal: #{$base-line-height-normal};
  --base-line-height-relaxed: #{$base-line-height-relaxed};

  // Border radius
  --base-border-radius-sm: #{$base-border-radius-sm};
  --base-border-radius-md: #{$base-border-radius-md};
  --base-border-radius-lg: #{$base-border-radius-lg};
}
```

---

## Theme Usage Example

```scss
// themes/express.scss
@import '../variables';

// Override base variables for Express theme
$base-accent-color: #dc2626;           // Express red
$base-accent-color-hover: #ef4444;
$base-primary-bg: #fef3c7;             // Express yellow tint
$base-text-on-accent: #ffffff;

// Also override existing Pure Admin variables
$header-bg: #fbbf24;
$accent-color: $base-accent-color;
// ...

@import '../core';
@import '../base-css-variables';

// Output CSS variables on :root
:root {
  @include output-base-css-variables;
}
```

---

## Files to Modify

### 1. `src/scss/_variables.scss`
Add ~40 new `$base-*` variables at the end with `!default` flags.

### 2. `src/scss/_base-css-variables.scss` (NEW)
Create mixin that outputs all `--base-*` CSS custom properties.

### 3. `src/scss/themes/*.scss` (9 files)
Add to each theme:
```scss
@import '../base-css-variables';

:root {
  @include output-base-css-variables;
}
```

### 4. Sync to pure-admin-core
Copy changes to `pure-admin-core/src/scss/`.

### 5. Documentation
- Update `CLAUDE.md` with base variables section
- Update `theme-designer/base_variables.md` to reference Pure Admin

---

## Implementation Steps

1. [ ] Add `$base-*` SCSS variables to `_variables.scss` (~40 variables)
2. [ ] Create `_base-css-variables.scss` with output mixin
3. [ ] Update `corporate.scss` theme as prototype
4. [ ] Build and verify CSS output has `:root { --base-* }` block
5. [ ] Test with web-multiselect component
6. [ ] Update remaining 8 themes
7. [ ] Sync changes to pure-admin-core
8. [ ] Update documentation

---

## Expected Output (CSS)

After building corporate theme:
```css
/* ... existing Pure Admin CSS ... */

:root {
  --base-accent-color: #0ea5e9;
  --base-accent-color-hover: #38bdf8;
  --base-accent-color-active: #7dd3fc;
  --base-primary-bg: #ffffff;
  --base-primary-bg-hover: #f2f2f2;
  --base-text-color-1: #111827;
  --base-text-color-2: #374151;
  --base-text-color-3: #6b7280;
  --base-text-color-4: #9ca3af;
  --base-text-on-accent: #ffffff;
  --base-border-color: #e5e7eb;
  --base-input-background: #ffffff;
  --base-input-color: #111827;
  --base-input-border: 1px solid #d1d5db;
  /* ... all 40 variables ... */
}
```

---

## Variable Count Summary

| Category | Count |
|----------|-------|
| Colors | 11 |
| Input Fields | 7 |
| Input Sizes | 5 |
| Dropdown | 3 |
| Tooltip | 2 |
| Typography | 14 |
| Border Radius | 3 |
| **Total** | **45** |

---

## Status

- Created: 2025-12-13
- Status: Planning complete, ready for implementation
