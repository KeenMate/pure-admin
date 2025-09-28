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
- CSS custom properties for theming system
- Flex-based card layout with proper header/body/footer distribution
- UTF-8 icons for better visual design (« ‹ › » for pagers)
- Grid column padding removed inside cards to prevent spacing conflicts

## Framework Structure
- **Server:** `server.js` - Express.js with EJS layouts
- **Views:** `views/` - EJS templates with shared layout and partials
- **Main SCSS:** `src/scss/main.scss` - Core framework styles
- **Utilities:** `src/scss/utilities.scss` - Spacing and utility classes
- **Themes:** `src/themes/` - Dark, minimal, corporate themes
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
1. **ONLY use `pa-` prefixed classes or PureCSS classes** - No demo-specific classes
2. **Follow BEM strictly** - Components must be reusable framework elements
3. **Grid columns inside cards have no bottom padding** - Prevents spacing conflicts
4. **All spacing uses consistent rem units** - Framework-wide consistency
5. **Use UTF-8 icons where appropriate** - Better visual design than HTML entities

## Recent Work
- Converted from static HTML to EJS with Express.js server
- Eliminated all demo-specific classes (button-demo-group → pa-btn-group)
- Implemented comprehensive table and pager components with UTF-8 icons
- Fixed grid column padding conflicts inside card bodies
- Achieved strict BEM naming convention compliance across all components
- **Composite Badges System:** Created three-part [icon][label][button] badges with:
  - Independent color control for each section
  - SCSS variables for configurable dimensions
  - CSS variables for theme compatibility (all colors use `var(--btn-*-bg)`)
  - Standard color variations (primary, secondary, success, etc.)
  - Advanced mixed-color examples and interactive demos
- **Modal Windows System:** Complete modal framework with:
  - CSS variables for theming (`--modal-overlay-bg`, `--modal-content-bg`, etc.)
  - Multiple sizes (sm: 20rem, md: 30rem, lg: 50rem, xl: 70rem)
  - Themed modal headers (primary, success, warning, danger)
  - Form modals with proper spacing and validation states
  - Confirmation dialogs and basic information modals
  - Smooth animations and responsive behavior
  - Full JavaScript interaction system for open/close functionality

Remember: User appreciates thorough, systematic work and clear communication! 🚀