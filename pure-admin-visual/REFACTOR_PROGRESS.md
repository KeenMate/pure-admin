# Pure Admin Foundation Refactor - Progress

## Overview
Two major changes to make Pure Admin fully independent and intuitive:
1. **10px rem base** - `1rem = 10px` for simpler sizing math
2. **Native grid system** - Remove PureCSS, use Milligram-style `.pa-col-*` naming

## Backup Commit
- **Commit:** `9646296`
- **Branch:** `prod`
- **Restore command:** `git reset --hard 9646296`

---

## Progress Checklist

- [x] **Step 0:** Create backup commit
- [x] **Step 1:** Create `_grid.scss` with native grid system
- [x] **Step 2:** Update `_core.scss` - remove PureCSS, add new grid
- [x] **Step 3:** Update `_base.scss` - add `html { font-size: 10px; }`
- [x] **Step 4:** Convert `_variables.scss` rem values (×1.6)
- [x] **Step 5:** Scan and convert hardcoded rem in component SCSS files
- [x] **Step 6:** Update `_web-components-theme.scss` for 10px base
- [x] **Step 7:** Update all `.mustache` templates (pure-* → pa-col-*)
- [x] **Step 8:** Remove PureCSS from `package.json`
- [x] **Step 9:** Build CSS and themes
- [x] **Step 10:** Visual testing and fixes
- [x] **Step 11:** Final commit (275c4a3)

---

## Detailed Steps

### Step 1: Create `_grid.scss`
**File:** `src/scss/core-components/_grid.scss`

Grid classes to create:
- `.pa-row` - flex container (replaces `.pure-g`)
- `.pa-col` - auto-equal width column
- `.pa-col-10` through `.pa-col-100` - percentage widths
- `.pa-col-33`, `.pa-col-67` - thirds
- `.pa-col-25`, `.pa-col-75` - quarters
- Responsive: `.pa-col-sm-*`, `.pa-col-md-*`, `.pa-col-lg-*`, `.pa-col-xl-*`
- Offsets: `.pa-offset-10` through `.pa-offset-90`

### Step 2: Update `_core.scss`
Remove PureCSS imports, add new grid import.

### Step 3: Update `_base.scss`
Add:
```scss
html {
  font-size: 10px;
}

body {
  font-size: 1.6rem; // 16px default text
}
```

### Step 4: Convert `_variables.scss`
All rem values × 1.6:
| Before (16px base) | After (10px base) | Pixels |
|--------------------|-------------------|--------|
| 0.25rem            | 0.4rem            | 4px    |
| 0.5rem             | 0.8rem            | 8px    |
| 0.75rem            | 1.2rem            | 12px   |
| 1rem               | 1.6rem            | 16px   |
| 1.5rem             | 2.4rem            | 24px   |
| 2rem               | 3.2rem            | 32px   |

### Step 5: Convert component SCSS files
Scan all `src/scss/core-components/*.scss` for hardcoded rem values.

### Step 6: Update web components theme
Convert all `--drp-*` variables to 10px-based values.

### Step 7: Update mustache templates
Replace all PureCSS classes:
- `pure-g` → `pa-row`
- `pure-u-1` → `pa-col-100`
- `pure-u-1-2` → `pa-col-50`
- `pure-u-1-3` → `pa-col-33`
- `pure-u-2-3` → `pa-col-67`
- `pure-u-1-4` → `pa-col-25`
- `pure-u-3-4` → `pa-col-75`
- `pure-u-1-5` → `pa-col-20`
- `pure-u-2-5` → `pa-col-40`
- `pure-u-3-5` → `pa-col-60`
- `pure-u-4-5` → `pa-col-80`
- Add responsive variants: `pure-u-md-*` → `pa-col-md-*`

### Step 8: Remove PureCSS
- Remove `purecss` from `package.json` dependencies
- Run `npm install` to update `package-lock.json`

### Step 9: Build
```bash
npm run build-css
npm run build-themes
```

### Step 10: Test
- Visual inspection of all pages
- Responsive testing
- Fix any issues found

### Step 11: Final commit
Commit all changes with descriptive message.

---

## Notes
- Conversion formula: `old_rem × 1.6 = new_rem`
- Example: `0.5rem × 1.6 = 0.8rem` (both = 8px)
