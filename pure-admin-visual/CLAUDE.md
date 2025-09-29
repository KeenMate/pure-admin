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
- **Forms:** `.pa-form` with comprehensive input types and states
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

Remember: User appreciates thorough, systematic work and clear communication! 🚀