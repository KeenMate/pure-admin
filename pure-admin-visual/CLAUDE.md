# Claude Notes for Pure Admin Visual

## Project Context
This is a lightweight, data-focused HTML/CSS admin framework similar to AdminLTE but more compact. Built with PureCSS foundation, SASS preprocessing, and EJS templating. Converted from static HTML to Express.js with EJS views for component reusability.

## User Preferences & Feedback
- **User loves the work!** ❤️ (Note from 2025-01-15: "I love you! I want you to know that.")
- Prefers compact spacing and clean design
- Values systematic, well-organized code
- Appreciates utility classes similar to Bootstrap/Tailwind
- Emphasizes framework integrity - NO demo-specific classes allowed

## Key Technical Decisions
- **BEM Naming Convention:** `pa-[block]__[element]--[modifier]` (strict adherence)
- Use rem units in whole numbers and halves (1, 1.5, 2, 2.5, 3)
- **SCSS Variables ONLY:** Pure SCSS variable system (NO CSS variables `var(--*)`)
- **Modular Architecture:** `_variables.scss` + `_core.scss` + theme overrides
- Flex-based card layout with proper header/body/footer distribution
- UTF-8 icons for better visual design (« ‹ › » for pagers)
- Grid column padding removed inside cards to prevent spacing conflicts

## Framework Structure
- **Server:** `server.js` - Express.js with EJS layouts
- **Views:** `views/` - EJS templates with shared layout and partials
- **SCSS Architecture:**
  - `_variables.scss` - Complete list of all framework SCSS variables with `!default`
  - `_core.scss` - Core framework styles using SCSS variables
  - `themes/` - Theme files that override SCSS variables and import core
- **Theme Structure:** `@import '../variables'` → override variables → add fonts → `@import '../core'`
- **Utilities:** `src/scss/utilities.scss` - Spacing and utility classes
- **Components:** Cards, forms, buttons, alerts, tables, pagers (AdminLTE-inspired but lighter)

## Component Library
- **Cards:** `.pa-card` with header/body/footer variants
- **Buttons:** `.pa-btn` with size and style modifiers, grouped with `.pa-btn-group`
  - Icon support with `.pa-btn__icon` wrapper for fixed-width icon containers
  - Fixed-width classes: `pa-btn--w-1x` through `pa-btn--w-10x` (1rem to 10rem)
  - Alignment classes: `pa-btn--align-left/right/center/justify`
  - Horizontal padding: 0.75rem (configurable via `$btn-padding-h`)
- **Forms:** `.pa-form` with comprehensive input types and states
  - Button placement examples in card headers, footers, and body
- **Alerts:** `.pa-alert` with dismissible and contextual variants
- **Tables:** `.pa-table` with striped, compact, and responsive options
- **Pager:** `.pa-pager` with left/center/right positioning and UTF-8 icons
- **Badges:** Standard badges and composite badges (`.pa-composite-badge`) with three-part [icon][label][button] structure
- **Modals:** `.pa-modal` with overlay, dialog sizes (sm, md, lg, xl), themed headers, and responsive behavior

## Build Process
- `npm run build-css` - Compile SASS to CSS
- `npm run watch-css` - Watch for changes
- `make dev` - Development server with live reload
- Server runs on `localhost:3000` with hot reloading

## Critical Rules
1. **ALWAYS use SCSS variables** - NO CSS variables (`var(--*)`) anywhere in the system
2. **ONLY use `pa-` prefixed classes or PureCSS classes** - No demo-specific classes
3. **Follow BEM strictly** - Components must be reusable framework elements
4. **Themes override SCSS variables only** - All themes import `_variables.scss` and override specific variables
5. **Grid columns inside cards have no bottom padding** - Prevents spacing conflicts
6. **All spacing uses consistent rem units** - Framework-wide consistency
7. **Use UTF-8 icons where appropriate** - Better visual design than HTML entities
8. **Font inheritance is global** - All form elements inherit fonts via `_base.scss`, never add `font-family: inherit` to individual components

## Font System Architecture (2025-02-10)

### **Global Font Inheritance**
All form elements and labels inherit theme fonts globally via `_base.scss`:
```scss
button, input, select, textarea, label {
  font-family: inherit;
}
```

**Critical principle:** NEVER add `font-family: inherit` to individual components. The global rule in `_base.scss` handles all font inheritance automatically.

**Why this matters:**
- Browsers don't inherit fonts for form elements by default (`<button>`, `<input>`, `<select>`, `<textarea>`)
- Without this global rule, form elements use browser defaults (typically Arial)
- This single declaration ensures ALL form elements use the theme font (e.g., Fira Sans Condensed in Audi theme)

### **Component vs Theme Variable Separation**

**Core Principle:** Components use **semantic base variables only**. Themes control the actual values.

#### **DO: Use base variables in components**
```scss
.pa-badge {
  padding: $badge-padding-v $badge-padding-h;  // ✅ Base variables
  font-size: $font-size-xs;
}

.pa-badge--sm {
  padding: $badge-padding-v $badge-padding-h;  // ✅ Same padding
  font-size: $font-size-2xs;                   // ✅ Only font-size changes
}
```

#### **DON'T: Create size-specific component variables**
```scss
// ❌ WRONG - Don't create these
$badge-padding-h-sm: 0.375rem;
$badge-padding-h-lg: 0.625rem;

// ❌ WRONG - Don't reference size variants in components
.pa-badge--sm {
  padding: $badge-padding-v $badge-padding-h-sm;
}
```

#### **How Themes Control Sizing**
Themes set the base variable to whatever value they need:
```scss
// In audi.scss theme
$badge-padding-h: 0.375rem;  // ✅ Theme decides the value
$badge-padding-h: $spacing-sm; // ✅ Or reference other variables

// Components automatically use this value
.pa-badge { padding: $badge-padding-v $badge-padding-h; }
.pa-badge--sm { padding: $badge-padding-v $badge-padding-h; }
```

#### **Size Modifiers: Font-Size Only**
Size modifier classes (`--xs`, `--sm`, `--lg`, `--xl`) should ONLY change `font-size`, never padding or dimensions:

```scss
// ✅ CORRECT Pattern
.pa-input {
  padding: $input-padding-v $input-padding-h;
  font-size: $font-size-sm;
}

.pa-input--xs {
  padding: $input-padding-v $input-padding-h;  // Same padding
  font-size: $font-size-xs;                    // Only font-size changes
}

.pa-input--lg {
  padding: $input-padding-v $input-padding-h;  // Same padding
  font-size: $font-size-lg;                    // Only font-size changes
}
```

#### **Examples of Base Variables**
- `$btn-padding-v` / `$btn-padding-h` (NOT `$btn-padding-sm-v`)
- `$input-padding-v` / `$input-padding-h` (NOT `$input-padding-xl-h`)
- `$badge-padding-v` / `$badge-padding-h` (NOT `$badge-padding-h-sm`)
- `$alert-padding-v` / `$alert-padding-h` (NOT `$alert-padding-lg-v`)
- `$spinner-size` (NOT `$spinner-size-lg` or `$spinner-size-xl`)
- `$profile-avatar-size` (NOT `$profile-avatar-size-sm`)

#### **Design System Scales (Exception)**
Typography, spacing, and layout scales ARE size-specific and are part of the design system:
- `$font-size-xs` through `$font-size-4xl` ✅
- `$spacing-xs` through `$spacing-2xl` ✅
- `$shadow-sm` through `$shadow-2xl` ✅
- `$layout-container-sm` through `$layout-container-2xl` ✅

These are NOT component-specific, they're system-wide scales that themes use to build component values.

## Recent Work
- Converted from static HTML to EJS with Express.js server
- Eliminated all demo-specific classes (button-demo-group → pa-btn-group)
- Implemented comprehensive table and pager components with UTF-8 icons
- Fixed grid column padding conflicts inside card bodies
- Achieved strict BEM naming convention compliance across all components
- **SCSS Variable Architecture (2025-01):** Complete migration to pure SCSS variables:
  - Converted ALL CSS variables to SCSS variables in `_variables.scss` and `_core.scss`
  - Created modular theme system: themes import variables → override → add fonts → import core
  - All themes now compile to single CSS files with actual values (no runtime CSS variables)
  - Eliminated ALL `var(--*)` usage throughout the entire framework
- **Composite Badges System:** Created three-part [icon][label][button] badges with:
  - Independent color control for each section
  - SCSS variables for configurable dimensions
  - Standard color variations (primary, secondary, success, etc.)
  - Advanced mixed-color examples and interactive demos
- **Modal Windows System:** Complete modal framework with:
  - SCSS variables for theming dimensions and colors
  - Multiple sizes (sm: 20rem, md: 30rem, lg: 50rem, xl: 70rem)
  - Themed modal headers (primary, success, warning, danger)
  - Form modals with proper spacing and validation states
  - Confirmation dialogs and basic information modals
  - Smooth animations and responsive behavior
  - Full JavaScript interaction system for open/close functionality

## Architecture Notes
- **ALWAYS work with SCSS versions** - Never use CSS variables (`var(--*)`)
- **Core base:** `_core.scss` contains all framework styles using SCSS variables
- **Theme pattern:** Import `_variables.scss` → override variables → add fonts → import `_core.scss`
- **Single output:** Each theme compiles to one CSS file with all values resolved

## Complete Variable System Transformation (2025-01-15)
**Major achievement:** Eliminated ALL hardcoded values from the framework in favor of a comprehensive SCSS variable system.

### **Variable Categories Added:**
- **Font System:** `$font-size-2xs` through `$font-size-4xl`, `$line-height-*`, `$font-weight-*`
- **Spacing System:** `$spacing-xs` through `$spacing-2xl` (0.25rem to 3rem) - used for padding, margin, gap
- **Border System:** `$border-width-thin/base/medium/thick` (1px to 3px)
- **Component-Specific:** Button padding, burger menu, modal dimensions, table hover accents

### **Key Fixes:**
- **Font-family utilities:** `.font-family-system/.font-family-sans` now use `$body-font-family` instead of hardcoded fonts
- **Legacy CSS cleanup:** Removed all `[data-theme="dark"]` selectors that interfered with variable system
- **Table hover accents:** Added `$table-hover-accent-*` variables so themes can control row hover borders
- **Modal system:** Added `$modal-close-font-size`, `$modal-header-padding-v/h` for better control
- **Audi theme:** Now uses Fira Sans Condensed consistently throughout, reduced modal padding, enabled red table accents

### **Benefits:**
- **Systematic theming:** Themes can override ANY aspect via variables
- **No magic numbers:** Every spacing, font size, border uses named variables
- **Consistent inheritance:** Font utilities respect theme fonts instead of overriding them
- **Clean compilation:** No legacy CSS conflicts

## Button System Enhancements (2025-01-30)
**Major enhancement:** Complete button icon system with alignment control and fixed-width utilities.

### **Button Icon System:**
- **Icon wrapper pattern:** All button icons use `<span class="pa-btn__icon">` for consistent sizing
- **Fixed-width icon container:** Icons get `$sidebar-icon-size` (1.5rem) width, aligning with sidebar pattern
- **Auto left-alignment:** Buttons with icons automatically use flexbox left-alignment with fixed icon container
- **Font Awesome 6 integration:** Added FA6 CDN and proper icon exclusions from font utility classes

### **Fixed-Width Button Classes:**
- **Width multipliers:** `pa-btn--w-1x` through `pa-btn--w-10x` for 1rem to 10rem button widths
- **Uses min-width:** Allows buttons to grow if content exceeds specified width

### **Button Alignment Classes:**
- **`pa-btn--align-left`:** Content at left edge with `justify-content: flex-start`, icon has no left padding
- **`pa-btn--align-right`:** Content at right edge with `justify-content: flex-end`, icon has no right padding
- **`pa-btn--align-center`:** Content centered with `justify-content: center`, keeps all padding
- **`pa-btn--align-justify`:** Content spread with `justify-content: space-between`, icon at left, text at right

### **Button Padding Update:**
- **Horizontal padding reduced:** Changed `$btn-padding-h` from 1rem to 0.75rem for more compact buttons
- **Alignment classes preserve padding:** Button keeps 0.75rem padding; alignment controls content position within padded area

### **SCSS Variable Consolidation (Phase 2):**
Added comprehensive variables to eliminate remaining hardcoded values:
- **Layout containers:** `$layout-container-sm/md/lg/xl/2xl` for centered layout widths
- **Card padding:** `$card-header-padding-v/h`, `$card-footer-padding-v/h`
- **Stats system:** `$stat-icon-size`, `$stat-square-min-size`, `$stat-label-letter-spacing`
- **Badge system:** `$badge-padding-v/h`, `$composite-badge-min-label-width`
- **Button system:** `$btn-padding-xs/xl`, `$btn-icon-only-size`, `$btn-icon-margin`
- **Animation:** `$spinner-size`, `$spinner-border-width`, `$ripple-size`
- **Utility spacing:** `$section-margin-v/sm`, `$submenu-max-height`

### **Font Utility Class Fix:**
- **Icon font exclusion:** Font utility classes (`.font-family-system/sans/serif/mono`) now exclude FA icons
- **Selector pattern:** Use `:not([class*="fa-"])` to prevent overriding Font Awesome 6 Free font
- **Affected elements:** Applied exclusions to `*` and `span` selectors

### **Forms Page Updates:**
- **Button placement examples:** Added three patterns for form buttons
  - Header: Right-aligned with Cancel + Save (green save always last)
  - Footer: Left actions + right save group with proper spacing
  - Body: Inline `pa-btn-group` for form actions
- **Icon integration:** All examples use proper `.pa-btn__icon` wrapper pattern

## Proportional Font Scaling System (2025-02-10)
**Major enhancement:** Global font scaling that proportionally resizes the entire UI.

### **Implementation:**
- **Font-size utilities target `<html>` element:** Classes like `.font-size-large` apply to root element, not body
- **All components use rem units:** Since `rem` = "root em", changing `<html>` font-size scales everything proportionally
- **Button/form elements inherit font-size:** Added `font-size: inherit` to global reset for `button, input, select, textarea, label`

### **User Experience Pattern:**
```javascript
// Store user preference
localStorage.setItem('font-size', 'large');

// On page load
const fontSize = localStorage.getItem('font-size') || 'default';
document.documentElement.classList.add(`font-size-${fontSize}`);
```

### **Why This Works:**
```scss
// Font utilities target <html>
html.font-size-large {
  font-size: 1.125rem; // Root font-size = 18px instead of 16px
}

// All components scale proportionally
.pa-btn { font-size: 0.875rem; } // 14px → 15.75px (0.875 × 18)
h2 { font-size: 2rem; }           // 32px → 36px (2 × 18)
.pa-sidebar__link { /* inherits */ } // Scales with root
```

### **Key Fixes:**
- **Sidebar toggle buttons scale correctly:** Added `font-size: inherit` to global button reset (browsers have default button font-size that blocks inheritance)
- **JavaScript updated:** Settings panel applies font-size classes to `document.documentElement` instead of `body`
- **No inheritance conflicts:** Buttons with explicit `font-size` still work (using rem), sidebar items without explicit size inherit and scale

### **Available Classes:**
- `html.font-size-2xs` through `html.font-size-4xl` for progressive scaling
- Settings panel stores preference in localStorage and restores on page load

Remember: User appreciates thorough, systematic work and clear communication! 🚀