# Pure Admin Visual - Theming System

## Overview
Pure Admin Visual uses CSS Custom Properties (CSS Variables) to provide a flexible theming system. End users can create custom themes by overriding the CSS variables.

## How Themes Work

### 1. CSS Custom Properties
All colors and dimensions are defined as CSS custom properties in the `:root` selector:

```css
:root {
  --header-height: 2.5rem;
  --footer-height: 2rem;
  --sidebar-width: 12rem;
  --primary-bg: #f8f9fa;
  --header-bg: #ffffff;
  --sidebar-bg: #f1f3f4;
  --footer-bg: #ffffff;
  --border-color: #e1e5e9;
  --text-primary: #2c3e50;
  --text-secondary: #6c757d;
  --accent-color: #007bff;
  --accent-hover: rgba(0, 123, 255, 0.1);
  --accent-light: rgba(0, 123, 255, 0.05);
}
```

### 2. Theme Application
Themes are applied using data attributes on the `<body>` element:

```html
<body data-theme="dark">
```

## Creating Custom Themes

### Step 1: Create Theme CSS File
Create a new CSS file (e.g., `custom-theme.css`):

```css
/* Custom Theme */
[data-theme="custom"] {
  --primary-bg: #your-color;
  --header-bg: #your-color;
  --sidebar-bg: #your-color;
  --footer-bg: #your-color;
  --border-color: #your-color;
  --text-primary: #your-color;
  --text-secondary: #your-color;
  --accent-color: #your-color;
  --accent-hover: rgba(your-rgb, 0.1);
  --accent-light: rgba(your-rgb, 0.05);
}
```

### Step 2: Include Theme CSS
Include your theme file after the main stylesheet:

```html
<link rel="stylesheet" href="dist/css/main.css">
<link rel="stylesheet" href="path/to/custom-theme.css">
```

### Step 3: Apply Theme
Apply the theme using JavaScript:

```javascript
document.body.setAttribute('data-theme', 'custom');
```

## Built-in Themes

### Default Theme
- Light, clean appearance
- Blue accent color
- No data attribute needed

### Dark Theme (`data-theme="dark"`)
- Dark backgrounds
- Light text
- Blue accent color adapted for dark mode

### Minimal Theme (`data-theme="minimal"`)
- Ultra-clean grayscale appearance
- Minimal visual noise
- Subtle gray accents

### Corporate Theme (`data-theme="corporate"`)
- Professional blue/gray palette
- Dark header and footer
- Suitable for business applications

## Theme Switching

The framework includes a theme switcher component:

```html
<select onchange="switchTheme(this.value)">
  <option value="default">Default</option>
  <option value="dark">Dark</option>
  <option value="minimal">Minimal</option>
  <option value="corporate">Corporate</option>
</select>
```

### JavaScript Implementation
```javascript
function switchTheme(theme) {
  const body = document.body;
  body.removeAttribute('data-theme');

  if (theme !== 'default') {
    body.setAttribute('data-theme', theme);
  }

  // Save preference
  localStorage.setItem('preferred-theme', theme);
}
```

## Customizable Variables

### Layout Dimensions
- `--header-height`: Height of fixed header
- `--footer-height`: Height of fixed footer
- `--sidebar-width`: Width of fixed sidebar

### Background Colors
- `--primary-bg`: Main background color
- `--header-bg`: Header background
- `--sidebar-bg`: Sidebar background
- `--footer-bg`: Footer background

### Text Colors
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary/muted text color

### Accent Colors
- `--accent-color`: Primary accent color
- `--accent-hover`: Accent color for hover states
- `--accent-light`: Light accent color for subtle highlights

### Border
- `--border-color`: Border color for components

## Best Practices

1. **Maintain Contrast**: Ensure sufficient contrast between text and background colors
2. **Test Accessibility**: Verify themes meet WCAG guidelines
3. **Use rem Units**: Keep dimensions in rem units following the whole/half number system (0.5, 1, 1.5, 2, etc.)
4. **Consistent Alpha Values**: Use 0.1 for hover states and 0.05 for light accents
5. **Save Preferences**: Use localStorage to remember user theme choices