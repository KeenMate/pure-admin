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

## Theme & Table System Enhancements (2025-02-10)
**Major updates:** Theme fixes, table system refinement, and button sizing progression.

### **New Themes:**
- **Express Theme:** Bold yellow header/footer with red accents (logistics-inspired design)
  - Primary button: Red with white text
  - Secondary button: Yellow with black text
  - Clean white/gray content area

### **Corporate Theme Fixes:**
- Updated accent color to vibrant sky blue (#0ea5e9)
- Fixed navbar visibility: white/light text on dark header (#1e293b)
- Burger menu and theme switcher properly styled for dark background

### **Audi Theme Fixes:**
- Fixed striped tables: Changed `$table-stripe` from `$audi-dark` to `$audi-gray` for visible zebra stripes
- Primary button: Red with white text (no uppercase)
- Danger button: Red with white text (WITH uppercase)

### **Table System Refinement:**
**Base padding:** `0.3rem 0.5rem` (38px rows with breathing room)
**Calculated spacing:**
```scss
$table-spacing-2x-multiplier: 2; // 0.6rem 1rem (~56px rows)
$table-spacing-3x-multiplier: 3; // 0.9rem 1.5rem (~74px rows)
```

**Striped tables fix:** Apply background to `td` instead of `tr` to prevent being covered by cell backgrounds
```scss
.pa-table--striped tbody tr:nth-child(even) td {
  background-color: $table-stripe;
}
```

**Button integration in tables:**
- Negative margin prevents row height growth: `.pa-table td .pa-btn { margin-top: -0.25rem; margin-bottom: -0.25rem; }`
- Button groups don't wrap: `.pa-table td .pa-btn-group { flex-wrap: nowrap; }`
- Helper class for compact columns: `.col-auto { width: 1%; white-space: nowrap; }`

### **Button System Enhancements:**

**Linear size progression** - All sizes now have dedicated padding variables:
```scss
xs:  0.25rem × 0.5rem   → ~28px height (compact for tables)
sm:  0.375rem × 0.625rem → ~32px height
def: 0.5rem × 0.75rem    → ~36px height
lg:  0.625rem × 0.875rem → ~40px height
xl:  0.75rem × 1rem      → ~44px height
```
Each step increases by 0.125rem (2px) for smooth progression.

**Icon-only button sizes:**
```scss
xs:  1.75rem × 1.75rem → ~28px square (table actions)
sm:  2rem × 2rem       → ~32px square
def: 2.5rem × 2.5rem   → ~40px square
lg:  3rem × 3rem       → ~48px square
xl:  3.5rem × 3.5rem   → ~56px square
```

**Button group gap:** Reduced from `0.5rem` to `0.2rem` (~3px) for tighter visual grouping

### **Usage Patterns:**

**Table with icon buttons:**
```html
<th class="col-auto">Actions</th>
<td class="col-auto">
  <div class="pa-btn-group">
    <button class="pa-btn pa-btn--xs pa-btn--icon-only pa-btn--primary">👁️</button>
    <button class="pa-btn pa-btn--xs pa-btn--icon-only pa-btn--secondary">✏️</button>
    <button class="pa-btn pa-btn--xs pa-btn--icon-only pa-btn--danger">🗑️</button>
  </div>
</td>
```

**Benefits:**
- ✅ Consistent row heights (~38px base, ~38-40px with buttons)
- ✅ Compact action columns that don't waste space
- ✅ Professional, data-dense table layouts
- ✅ True size variety across button system

Remember: User appreciates thorough, systematic work and clear communication! 🚀

## Comprehensive Component Snippets (2025-10-05)
**Major documentation improvement:** Complete snippet documentation for all framework components to prevent LLM assumptions.

### **Context:**
Another Claude instance assumed only 1-2 badge sizes existed because the snippets were incomplete. Created comprehensive documentation showing ALL available options for every component to prevent future misunderstandings.

### **New Snippet Files:**
- **`snippets/grid.html`** - Complete PureCSS grid reference
  - All fractions: halves, thirds, quarters, fifths, sixths, eighths, twelfths, twenty-fourths
  - All responsive variants: `pure-u-sm-*`, `pure-u-md-*`, `pure-u-lg-*`, `pure-u-xl-*`
  - Nested grid examples and dashboard layout patterns
- **`snippets/tooltips.html`** - Complete tooltip and popover documentation
  - All 4 positions: top, right, bottom, left
  - All 5 color variants: default, primary, success, warning, danger
  - Multiline tooltips (`pa-tooltip--multiline`)
  - Auto-flip smart positioning classes for collision detection
  - Popover component with all sizes (sm, md, lg) and positions
  - Rich content examples (lists, code, links)
  - Complete JavaScript API for toggling and positioning

### **Enhanced Existing Snippets:**
- **`alerts.html`** - Added missing `--lg` size (now shows sm, default, lg)
- **`badges.html`** - Added large badge example
- **`cards.html`** - Major additions:
  - `--warning` and `--stat` variants
  - `.pa-card__title` components (icon + text pattern)
  - `.pa-card__meta` for metadata display
  - Footer actions pattern
  - No-padding body variant (`.pa-card__body--no-padding`) for tables
  - Tab content areas with JavaScript example
  - Section component (`.pa-section`)
- **`tables.html`** - Major cleanup:
  - Fixed incorrect class names (removed non-existent `--hover`, `--bordered`, `--compact`)
  - Corrected spacing classes: `--spacing-2x/3x` → `--2x/3x`
  - Added `.pa-table-container` example
  - Added pager component (all 3 positions: left, center, right)
  - Added load more component (all states and positions)
  - Comprehensive modifier reference comment at end

### **Complete Snippet Library (14 files):**
All snippets now show complete component API surface:
- ✅ alerts.html - All sizes (sm, default, lg), all variants, dismissible
- ✅ badges.html - All sizes (sm, default, lg), all variants, pills, icons, fixed-width, composite badges, groups
- ✅ buttons.html - All 5 sizes (xs, sm, default, lg, xl), 8 variants, outlines, states, groups, icons, fixed-width, alignment
- ✅ cards.html - All variants, title components, metadata, footer actions, no-padding, tabs, sections
- ✅ forms.html - All input types, 5 sizes, states, validation, horizontal/vertical layouts
- ✅ grid.html - All PureCSS fractions, all responsive breakpoints, nested grids
- ✅ layout.html - Layout structure, width variants, sidebar menus, submenu patterns
- ✅ loaders.html - All spinner sizes/colors, advanced loaders (dots, bars, pulse, ring, wave), utilities, overlay
- ✅ modals.html - All sizes (sm, md, lg, xl, xxl, fw), themed variants (primary, success, warning, danger), form modals
- ✅ profile.html - Profile button, panel, navigation, actions
- ✅ tables.html - All modifiers, spacing variants, container, pager, load more
- ✅ toasts.html - All positions (6), all variants, progress bar, persistent
- ✅ tooltips.html - All positions, variants, multiline, popovers, smart positioning
- ✅ utilities.html - Font sizing, spacing, compact mode, display utilities

### **Purpose:**
Ensure LLMs see complete component API to prevent assumptions about limited options. Each snippet now serves as authoritative documentation of what's available.

## Performance Optimizations (2025-10-05)
**Focus:** Eliminate unnecessary delays and fix visual jumps during page load.

### **Page Loader Timing:**
- **Removed 100ms "font settle" delay** - Unnecessary wait after fonts loaded
- **Reduced timeout fallback:** 3s → 1s
- **Reduced DOM removal delays:** 150ms → 80ms
- **Total improvement:** ~100-200ms faster perceived load time
- **Kept necessary delays:**
  - 150ms transition (visual polish)
  - 50ms body.loaded delay (prevents layout jumps)

### **Fixed Font-Size FOUC:**
**Problem:** Page rendered at default size (16px), then jumped to saved size (18px), causing 1.15-1.25x visual jump

**Solution:** Apply font-size immediately in inline script (before rendering)
```javascript
// In FOUC prevention script (before DOM renders)
const savedFontSize = localStorage.getItem('font-size') || 'default';
if (savedFontSize !== 'default') {
    document.documentElement.classList.add(`font-size-${savedFontSize}`);
}
```

**Location:** `layout.ejs:104-107` - Matches pattern for sidebar-hidden and compact-mode

**Result:** No more size jump on page load

### **Fixed Scrollbar Layout Shift:**
**Problem:** Navigating from short pages (no scrollbar) to long pages (scrollbar) caused ~15px horizontal shift

**Solution:** Force scrollbar gutter to always be present
```scss
body {
  overflow-y: scroll; // Always show vertical scrollbar gutter
}
```

**Location:** `_base.scss:18`

**Result:** Consistent layout across all pages, no horizontal jumping

### **Profile Name Visibility Fix:**
**Problem:** "John Doe" profile name appearing gray/invisible on dark headers (Audi Light, Corporate themes)

**Solution:**
- Added `$header-profile-name-color` variable (`_variables.scss:275`)
- Default: `$text-primary` (for light headers)
- Dark header themes override to `#ffffff`
- Applied to `.pa-header__profile-name` (`_profile.scss:36`)

**Result:** Profile name visible on all themes