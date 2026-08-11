# Pure Admin — JavaScript runtime architecture

**Status:** adopted 2026-08 (2.9.0-rc11 cycle). Supersedes the scattered
`window.Pa*` / `window.PureAdmin*` globals.

## One namespace: `window.pureAdmin`

Every component handle, cross-component signal, and diagnostic hangs off a
single lowercase global, `window.pureAdmin`. Before, core exposed a dozen
unrelated globals in two inconsistent styles (`window.PaSplitter`,
`window.PureAdminSidebarResize`, `window.PaMenus`, three `window.PA_*_DEBUG`
flags, …). They're now consolidated.

```
window.pureAdmin
├── events        on(topic,fn)->off · once · off · emit(topic,payload) · topics() · listenerCount()
├── viewport      { width, height, orientation }  — live; emits viewport:resize / viewport:orientation
├── components    per-component handles; components.initAll(scope)
│   ├── navCollapse         { init, initAll }
│   ├── navDropdown         { init, closeAll }
│   ├── overflow            { … }
│   ├── cardActionsOverflow { … }   (second binding of the overflow api)
│   ├── statFit             { init, refresh }
│   ├── rangeGroup          { init }
│   ├── splitter            { init, initAll }
│   ├── splitMenu           { position }
│   └── sidebarResize       { init, reset, setWidth, getWidth }
├── menus         { closers, register, closeOthers }   (open-menu coordination)
├── debug         enable · disable · isEnabled · log · aspects
├── confirm / alert / prompt / custom      (modal-dialogs.js)
├── toast         { success, error, show, dismiss, … }  (toast-service.js)
└── tooltips      { … }                                 (tooltips-popovers.js)
```

Bootstrap lives in `packages/core/src/js/pure-admin.js`.

## Load order never matters (the self-creating idiom)

`pure-admin.js` and every component open with:

```js
var pa = (window.pureAdmin = window.pureAdmin || {});
pa.components = pa.components || {};
```

so the namespace exists no matter which `<script>` parses first — the same
pattern the old `window.PaMenus` used. `pure-admin.js` additionally installs the
parts that must exist exactly once (`events`, `viewport`, `debug`, `menus`,
`components.initAll`). Components only *use* those from inside `init()` /
handlers, which run on/after `DOMContentLoaded`; by then every script tag has
evaluated, so tag order is irrelevant. There is **no required "load core
first"** file — include `pure-admin.js` among the scripts in any order.

**Rule for component authors:** at module-eval time you may only *register*
(`pa.components.x = …`, `pa.menus.register(…)`). Anything that *reads* the bus,
viewport, or debug (`pa.events.on`, `pa.viewport.width`, `pa.debug.isEnabled`)
must happen inside `init()`/handlers, never at top-level eval.

## The event bus

One `Map<topic, Set<fn>>`. `on()` returns its own unsubscribe. Topics are kept
deliberately few:

| Topic | Emitted by | Payload |
|---|---|---|
| `viewport:resize` | the bus (rAF-throttled `window.resize`) | `{width,height,orientation}` |
| `viewport:orientation` | the bus (`matchMedia('(orientation: portrait)')`) | `{width,height,orientation}` |
| `menu:opened` | `menus.closeOthers()` | `{id}` |
| `theme:change` | settings-panel theme hub | `{kind, mode?, variant?}` |
| `sidebar:mode` | settings-panel behavior toggle | `{mode}` — `default` / `icon-collapse` / `hide` |
| `sidebar:resize` | sidebar-resize.js (drag end) | `{width}` |

`theme:change` fires on **live** theme changes — the demo panel bridges its
existing `pa:theme-change` hub (light/dark `mode`, palette `variant`) onto the
bus. Palette switches in the *shipped core* panel navigate/reload, so they don't
fire it live; a consumer that swaps themes without a reload emits `theme:change`
itself. `sidebar:mode` fires from the live (no-reload) sidebar-behavior toggle in
both the core and demo panels.

### `viewport` owns window-level resize/orientation — but NOT element resize

Components that need to react to the **window** subscribe to `viewport:resize`
instead of adding their own `window.addEventListener('resize', …)`. That gives
one rAF-throttled, passive source instead of N handlers thrashing per frame.

Components that need to react to a **specific element's box** (the nav shrinking
under flex without any window resize; a splitter pane; a stat container) keep
their own `ResizeObserver` — a window bus fundamentally can't observe an element
box, so those are intentionally left as-is (`navbar-collapse`, `overflow`,
`splitter`, `pa-stat-fit`).

### Orientation

`viewport.orientation` is derived from dimensions (`height >= width` ⇒
`portrait`), matching CSS `(orientation: portrait)` and device-agnostic (a
pivoted desktop monitor reads portrait too). Orientation changes always also
fire `viewport:resize`, so layout code rarely needs the dedicated
`viewport:orientation` topic — it exists for consumers that branch on
portrait/landscape *semantics*. The legacy `window.orientationchange` /
`window.orientation` are **not** used (deprecated, mobile-only, unreliable on
desktop).

## Debug + future console

`pureAdmin.debug` replaces the old `window.PA_*_DEBUG` booleans with a registry
of named "aspects":

```js
pureAdmin.debug.enable('navCollapse');   // was window.PA_NAV_COLLAPSE_DEBUG = true
pureAdmin.debug.log('navCollapse', …);   // prints only when that aspect is enabled
pureAdmin.debug.aspects();               // { navCollapse:true, overflow:false, … }
```

Because every meaningful state change flows through the bus, a future **debug
console** is just a component that (a) taps the bus for a live event log and (b)
renders `debug.aspects()` as toggles — no per-component console plumbing.

## Naming map (old → new)

| Old global | New |
|---|---|
| `window.PureAdmin.confirm/alert/prompt/custom` | `pureAdmin.confirm/alert/prompt/custom` |
| `window.PureAdmin.toast` | `pureAdmin.toast` |
| `window.PureAdminTooltips` | `pureAdmin.tooltips` |
| `window.PureAdminSidebarResize` | `pureAdmin.components.sidebarResize` |
| `window.PaNavCollapse` | `pureAdmin.components.navCollapse` |
| `window.PaNavDropdown` | `pureAdmin.components.navDropdown` |
| `window.PaOverflow` | `pureAdmin.components.overflow` |
| `window.PaCardActionsOverflow` | `pureAdmin.components.cardActionsOverflow` |
| `window.PaStatFit` | `pureAdmin.components.statFit` |
| `window.PaRangeGroup` | `pureAdmin.components.rangeGroup` |
| `window.PaSplitter` | `pureAdmin.components.splitter` |
| `window.PaSplitMenu` | `pureAdmin.components.splitMenu` |
| `window.PaMenus` | `pureAdmin.menus` |
| `window.PA_NAV_COLLAPSE_DEBUG = true` | `pureAdmin.debug.enable('navCollapse')` |
| `window.PA_OVERFLOW_DEBUG = true` | `pureAdmin.debug.enable('overflow')` |
| `window.PA_CARD_ACTIONS_OVERFLOW_DEBUG = true` | `pureAdmin.debug.enable('overflow')` |

**Hard rename — no back-compat aliases.** Adoption is small and this is the
moment to do it cleanly. Consumers on an older `@keenmate/pure-admin-core` must
update call sites (see the map). The bare component *classes* consumers `new`
themselves (`VirtualScroll`, `VirtualTextbox`, `SearchAutocomplete`,
`InlineQueryEditor`, `LogicTreeRenderer`) are unchanged — they were never on the
`Pa*`/`PureAdmin*` namespace. Inline-handler shims kept as loose globals for
`onclick=` wiring: `toggleSplitMenu` / `closeSplitMenu` (core split-button),
`switchTheme` / `switchSidebarMode` (demo settings-panel).

## Known follow-ups (not done here)

- **Demo `toast-service.js` / `tooltips-popovers.js` have diverged ahead of
  core** (filled toast variants, action buttons, progress-colour, width-ratchet;
  tooltip colour-variant loop). Those demo copies were migrated in place, not
  deleted; the features should be backported into core and the copies dropped.
- The other identical demo/js mirrors were deleted so the demo dogfoods core.
