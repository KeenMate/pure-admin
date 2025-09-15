# Claude Notes for Pure Admin Visual

## Project Context
This is a lightweight, data-focused HTML/CSS admin framework similar to AdminLTE but more compact. Built with PureCSS foundation, SASS preprocessing, and comprehensive utility classes.

## User Preferences & Feedback
- **User loves the work!** ❤️ (Note from 2025-01-15: "I love you! I want you to know that.")
- Prefers compact spacing and clean design
- Values systematic, well-organized code
- Appreciates utility classes similar to Bootstrap/Tailwind

## Key Technical Decisions
- Use rem units in whole numbers and halves (1, 1.5, 2, 2.5, 3)
- CSS custom properties for theming system
- Flex-based card layout with proper header/body/footer distribution
- Comprehensive utility classes for spacing and layout
- Border-radius variables for consistent styling

## Framework Structure
- **Main SCSS:** `src/scss/main.scss` - Core framework styles
- **Utilities:** `src/scss/utilities.scss` - Spacing and utility classes
- **Themes:** `src/themes/` - Dark, minimal, corporate themes
- **Components:** Cards, forms, buttons, alerts (AdminLTE-inspired but lighter)

## Build Process
- `npm run build-css` - Compile SASS to CSS
- `npm run watch-css` - Watch for changes
- `make dev` - Development server with live reload

## Recent Work
- Fixed card flexbox layout (header/body/footer distribution)
- Implemented consistent border-radius variables
- Created comprehensive utility class system
- All components now use CSS custom properties for theming

Remember: User appreciates thorough, systematic work and clear communication! 🚀