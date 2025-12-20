# Modal Dialogs Fix - TODO

## Problem
The modal variant styling (colored headers like blue for primary, green for success, etc.) is not working in the Svelte version.

## Root Cause Found
The CSS expects the variant class on the PARENT modal element:
```css
.pa-modal--primary .pa-modal__header {
  background-color: #007bff;
}
```

But the visual version's `modal-dialogs.js` incorrectly applies the variant to the HEADER element:
```javascript
// WRONG (current code in visual)
const headerClass = variant
  ? `pa-modal__header pa-modal__header--${variant}`
  : 'pa-modal__header';
```

There is NO CSS for `.pa-modal__header--{variant}` - it doesn't exist!

## Fix Required

### 1. Fix visual version JS (`pure-admin-visual/src/js/modal-dialogs.js`)

In `createModal()` function (around line 38-55), change:
```javascript
// OLD (lines 38-41):
modal.className = position === 'top'
  ? 'pa-modal pa-modal--show pa-modal--top'
  : 'pa-modal pa-modal--show';

// NEW:
let modalClasses = 'pa-modal pa-modal--show';
if (variant) modalClasses += ` pa-modal--${variant}`;
if (position === 'top') modalClasses += ' pa-modal--top';
modal.className = modalClasses;
```

And remove/simplify the headerClass (lines 52-55):
```javascript
// OLD:
const headerClass = variant
  ? `pa-modal__header pa-modal__header--${variant}`
  : 'pa-modal__header';

// NEW:
const headerClass = 'pa-modal__header';
```

Also update the innerHTML template (line 60) to use just `pa-modal__header` instead of `${headerClass}`.

### 2. Same fix needed in `PureAdmin.custom()` function (around line 425-441)
Apply the same pattern - add variant to modal.className, remove from headerClass.

### 3. Svelte version is ALREADY CORRECT
The Svelte Modal.svelte already applies variant to the parent:
```svelte
const modalClasses = $derived(() => {
  const base = ['pa-modal'];
  if (show) base.push('pa-modal--show');
  if (variant) base.push(`pa-modal--${variant}`);  // <-- CORRECT!
  ...
});
```

The issue is that after fixing the visual JS, both versions should work.

### 4. Remove debug statement
After confirming fix works, remove `{@debug options}` from DialogContainer.svelte line 116.

## Files to Edit
1. `C:/Git/KM/pure-admin/pure-admin-visual/src/js/modal-dialogs.js` - Fix both createModal() and PureAdmin.custom()
2. `C:/Git/KM/svelte-pure-admin/src/lib/feedback/DialogContainer.svelte` - Remove debug line

## After Fix
1. Rebuild pure-admin-core: `cd pure-admin-core && npm run build`
2. Reinstall in svelte project: `cd svelte-pure-admin && npm install`
3. Test both visual and Svelte versions
