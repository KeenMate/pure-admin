# `pureAdmin.config` — the shared UI baseline (design)

**Status:** in progress. **Shipped (rc11):** `mobileBreakpoint`,
`typingDebounceDelay`, `toast.*`, `severity.*`, and `transition.*` + `easing` —
the full shared-UI baseline is live and covered by `e2e/config.spec.ts`. Nothing
core-side remains; further keys are added on demand.

### Demo `/src/js` shadows core — audit (rc11)

The demo serves `demo/js` *before* the core package on the `/src/js` route, so any
`demo/js/<name>.js` **shadows** the core module. Audit of the overlap:

- **De-duplicated (deleted from `demo/js`, now served from core):**
  `tooltips-popovers.js` (its 4-line `--color-1..9` copy upstreamed to core
  first), `file-selector.js`, `logic-tree-renderer.js`, `search-autocomplete.js`,
  `search-autocomplete-v2.js`, `virtual-scroll.js`, `virtual-textbox.js` — all
  were byte-identical to core. Verified the fallback serves them (HTTP 200).
- **Kept as demo-ahead forks — owed a reconcile (upstream → delete shadow):**
  `command-palette.js` (demo 1095 vs core 472 — the command-palette rework),
  `settings-panel.js` (729 vs 248), `toast-service.js` (both read config now, but
  demo adds `actions`/`filled`/`maxWidth`/width-ratcheting). Not auto-merged:
  deleting these would regress the demo to core's older version.
**Scope:** the *shared UI-behavior baseline* only — the framework's own default
behavior, binding-agnostic. App-domain config (permissions, currentUser,
date/time localization, button presets) is **out of scope** here; it belongs in
each wrapper (`svelte-pure-admin`, `keen-pure-admin`, …). See
["Explicitly out of scope"](#explicitly-out-of-scope).

## Why this exists

`svelte-adminlte` centralizes everything in one `Config` store
(`src/lib/config.ts`). That works because AdminLTE has exactly one wrapper. Pure
Admin has **many** (`svelte-pure-admin`, `keen-pure-admin` Phoenix LiveView,
`pure-admin-csharp`, `pure-admin-templates`, the CLI). If every wrapper defines
the whole config itself, the shared UI defaults **drift** — one binding decides
the mobile breakpoint is 768 and toasts go top-right, another quietly picks
different values, and the "same" framework behaves differently per binding.

So the shared UI baseline gets **one home in core**, and wrappers read/override
it. Today those values are instead hardcoded and duplicated — most visibly the
mobile breakpoint `768`, which is written literally in ~8 JS spots plus
`$mobile-breakpoint` in SCSS, with no single source.

## Mechanism

A single overridable object on the existing namespace:

```js
// installed once by src/js/pure-admin.js, load-order-safe
var pa = (window.pureAdmin = window.pureAdmin || {});
pa.config = pa.config || {};            // consumer may have set keys before us
// fill defaults without clobbering consumer overrides:
pa.config = Object.assign({ /* defaults below */ }, pa.config);
```

- **Override before init:** a consumer sets `window.pureAdmin.config.foo = …`
  (or assigns the whole object) *before* components initialize on
  `DOMContentLoaded`. Same escape hatch svelte-adminlte gives via its store.
- **Live changes:** emit `config:change` on the existing bus
  (`pureAdmin.events`) when a key is set at runtime, so components that cache a
  value can re-read. (Most keys are read at use-time, so this is only needed for
  the few that are cached.)
- **No new global.** It hangs off `window.pureAdmin`, consistent with the rc11
  namespace consolidation.

### The single-source rule (CSS ⇄ JS)

Some baseline values **already exist as SCSS tokens** (breakpoint, transition
timings). Those must NOT be re-typed as JS literals — SCSS stays the source of
truth and JS **reads them from CSS variables**, exactly the way
`sidebar-resize.js` already reads its drag bounds from
`--pa-local-sidebar-min/max-width`.

Pattern:

```scss
// core emits the token as a CSS var at :root (main.scss / a _config-vars partial)
:root {
  --pa-mobile-breakpoint: #{$mobile-breakpoint};   // 768px
  --pa-transition-medium:  #{$transition-medium};  // 0.25s
  // …
}
```

```js
// JS derives the default by reading the CSS var (px/ms parsed), with a literal
// fallback only for when the stylesheet hasn't loaded.
function cssNumber(name, fallback) {
  var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  var n = parseFloat(raw);
  return isNaN(n) ? fallback : n; // treat px / ms / unitless as a number
}
pa.config.mobileBreakpoint = pa.config.mobileBreakpoint ?? cssNumber('--pa-mobile-breakpoint', 768);
```

So for CSS-mirrored keys, `pureAdmin.config` is a **typed JS accessor over the
SCSS token**, not a second copy. Pure-JS keys (debounce, toast defaults) live
only in `pureAdmin.config`.

## Proposed keys

Three provenance classes: **`mirror`** = derived from an SCSS token via CSS var
(SCSS is source of truth); **`js`** = lives only in `pureAdmin.config`;
**`js (move)`** = already a private default in a JS module, relocate to config.

### Layout / responsive

| Key | Default | Provenance | Replaces |
|---|---|---|---|
| `mobileBreakpoint` | `768` | mirror `$mobile-breakpoint` → `--pa-mobile-breakpoint` | the ~8 hardcoded `<= 768` / `MOBILE_MAX` checks (`sidebar-resize.js`, `layout.mustache`, `settings-panel.js`) |
| `tabletBreakpoint` | `1024` | mirror `$tablet-breakpoint` | future JS that needs the tablet band (CSS already has it) |
| `tabletBreakpointMin` | `769` | mirror `$tablet-breakpoint-min` | — |
| `tabletMinShortSide` | `600` | js (Material `sw600dp`) | the phone/tablet boundary `pureAdmin.device` applies to the **shorter** viewport side — capability-first, so it's a different axis from the width breakpoints above |

**`mobileBreakpoint` (width) vs `tabletMinShortSide` (device class).** They answer
different questions. `mobileBreakpoint` is "how wide is the window" — a narrowed
desktop window is below it. `pureAdmin.device` (using `tabletMinShortSide`) is
"what kind of device is this" — capability-first: a mouse-driven window is
`desktop` at any width, and only a touch-primary device (coarse pointer + no
hover) consults the 600px shorter-side line to split `mobile` vs `tablet`. Use
the width breakpoint for layout reflow, `device.class` for "should this be a
fullscreen sheet" (the command palette's mobile sheet keys off it). This mirrors
`@keenmate/web-components-core`'s `classifyDevice`. Fullscreen surfaces also get
`pureAdmin.overlay.lockBodyScroll()` / `observeKeyboardInset(panel)`.

### Motion (for JS that must match a CSS transition, e.g. "act after the slide")

| Key | Default | Provenance |
|---|---|---|
| `transition.fast` | `100` (ms) | mirror `$transition-fast` |
| `transition.normal` | `150` | mirror `$transition-normal` |
| `transition.medium` | `250` | mirror `$transition-medium` |
| `transition.slow` | `300` | mirror `$transition-slow` |
| `transition.easing` | `'ease-out'` | mirror `$easing-snappy` |

> Most animations are pure CSS and need none of this. These exist for the cases
> where JS sequences on a transition (drawer close → unlock, etc.) and today
> would hardcode a magic ms.

### Interaction timing

| Key | Default | Provenance | Replaces |
|---|---|---|---|
| `typingDebounceDelay` | `300` (ms) | js | search / command-palette / autocomplete debounces (svelte-adminlte's `TypingDebounceDelay`) |

### Toasts (relocate the existing private `defaults` in `toast-service.js`)

| Key | Default | Provenance |
|---|---|---|
| `toast.position` | `'top-right'` | js (move) |
| `toast.duration` | `5000` (ms) | js (move) |
| `toast.showProgress` | `false` | js (move) |
| `toast.persistent` | `false` | js (move) |
| `toast.closeOnBackdrop` | `false` | js (move) |

`toast-service.js` keeps its behavior but reads `pureAdmin.config.toast` instead
of a module-private `defaults`, so consumers tune toasts in the same one place.
This is the direct analog of svelte-adminlte's `ToastrOptions` (mapped from
toastr's keys to pure-admin's).

### Severity presentation (icon + title per level)

| Key | Default | Provenance |
|---|---|---|
| `severity.<level>.icon` | emoji map already in `toast-service.js` (`success:'✓'`, `danger:'✕'`, `warning:'⚠'`, `info:'ℹ'`, `primary:'ℹ️'`) | js (move) |
| `severity.<level>.title` | `Success`/`Error`/`Warning`/`Information`/`Primary` (already in `toast-service.js`) | js (move) |

> **Icon-provider caveat.** Core ships **emoji** severity icons because they need
> no icon library (toasts already do this). svelte-adminlte instead maps severity
> → Font Awesome classes (`fa-exclamation-triangle`, …). That FA/lucide/heroicons
> choice is **wrapper/app territory** (see `pure-admin-icons` and the recipe-v2
> pluggable icon providers) — a wrapper overrides `config.severity.*.icon` with
> its provider's token. Core's job is only the zero-dependency default + the
> single override point.

## Migration (incremental, no behavior change)

1. ✅ **Done (rc11).** Added `pa.config` to `src/js/pure-admin.js` with the
   `readCssNumber` helper; emit `--pa-mobile-breakpoint` at `:root` from
   `_layout-responsive.scss`.
2. ✅ **Done (rc11).** `sidebar-resize.js`: `MOBILE_MAX` → `mobileMax()` reading
   `pureAdmin.config.mobileBreakpoint`.
3. ✅ **Done (rc11).** `toast-service.js` (core **and** the demo's shadow copy):
   private `defaults`/`icons`/`titles` → read `pureAdmin.config.toast` /
   `config.severity`. Also fixed the broken default position `top-right` → `top-end`.
4. ✅ **Done (rc11).** Demo `layout.mustache` (five `window.innerWidth <= 768`)
   and `settings-panel.js` → the config value — proves the override path.
5. ✅ **Done (rc11).** `typingDebounceDelay` + motion mirror keys
   (`transition.*` + `easing`, emitted as `--pa-transition-*` / `--pa-easing-snappy`,
   resolved to ms in JS via a probe element since the tokens are `calc()`).

Each step is mechanical and independently shippable; the CSS-var mirror means no
value is stated twice.

## Explicitly out of scope (wrapper-owned)

These are in svelte-adminlte's `config.ts` but do **not** belong in core:

- **`permissions`** (checkPermissions/checkRoles/defaultComparison), **`currentUser`**
  — app-domain; core has no user model.
- **Date/time formats** (`DateFormat`, `ReverseDateTimeFormat`, …) — localization;
  Luxon-specific.
- **`defaults.buttons`** presets (addButton/saveButton/…) — these bind a semantic
  action to a color+icon, which is app/wrapper convention (and icon-provider
  dependent).
- **`lazyLoader`** — framework-binding utility.

Each wrapper (`svelte-pure-admin` Svelte store, `keen-pure-admin` Elixir/LiveView
config) owns these in its own idiom and **reads core's `pureAdmin.config` for the
shared UI baseline** so the bindings stay in agreement.

## Open questions

1. **Read-through vs snapshot for mirrored keys** — read the CSS var live on each
   access (honors runtime theme swaps that change a token) vs. snapshot at init
   (cheaper). Leaning live for breakpoint (cheap, correct), snapshot elsewhere.
2. **`config:change` granularity** — one event, or per-namespace
   (`config:change:toast`)? Start with one.
3. **Freeze/readonly?** Probably not — the override-by-assignment ergonomics are
   the point.
