# Changelog

All notable changes to Pure Admin Visual will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.0-rc13] - 2026-08-21 [PUBLISHED]

### Changed

- **Burger moved out of `.pa-header__start` to be `.pa-navbar__inner`'s first child.** The burger toggle carries no `data-pa-fit`, so it never participates in the header's priority collapse — yet it lived *inside* `.pa-header__start`, one of the three degradable zones the fit engine measures and shrinks. It's now a **fixed anchor sibling** of the zones (`__inner` → `[burger] [start] [center] [end]`), which matches the model: a fixed control belongs outside the collapsible zones, not smuggled into one. Spacing is unchanged — the burger→brand gap is now the `.pa-navbar__inner` flex `gap` (the same `$spacing-base` as `.pa-header__start`'s own gap). No SCSS behavior change; the canonical snippet (`snippets/layout.html`) and the demo header were updated. Legacy tolerance: a burger left inside `.pa-header__start` still renders (it's just measured as part of the start zone), so this isn't a hard break for existing consumers.

## [2.9.0-rc12] - 2026-08-20 [PUBLISHED]

### Added

- **Navbar Fit (`navbar-fit.js`) — priority-driven degradation for the WHOLE header, not just menu items.** Generalises the priority/collapse idea from `navbar-collapse.js` (which only folds nav `<li>`s) to every header slot — brand, version, page title, a search box, anything. When the row can't fit, slots degrade one at a time, **lowest priority first**, each using a declared strategy, until it fits; when space returns, everything restores. Attribute API (mirrors `data-pa-nav-*`):
  - **`data-pa-fit`** = `hide` (remove the slot) | `steps` (the slot holds ranked variants — show the largest that fits, degrading step 0 → 1 → 2 … → hidden) | `sidebar` (relocate into the sidebar, restored on widen).
  - **`data-pa-fit-priority`** — degrade order, lower first.
  - **`data-pa-fit-step`** — on a `steps` slot's direct children; `0` = largest/default, ascending = smaller. This is the "big logo → wordmark → monogram" / "search pill → just its icon" pattern (a superset of "shrink to an icon").
  - Measurement handles the flex-growing centre slot correctly: a growing slot masks slack (it inflates to fill, so `scrollWidth` reads the box, not the content), so the engine measures such slots by their **content** — otherwise hiding the title would make the empty centre grow and the engine would fight itself. The pass is **reset-then-degrade**, so the settled state is a pure function of the width (no hysteresis/oscillation). It folds any `data-pa-nav-collapse` nav first (new `navFit`→`navCollapse.relayoutAll()` coordination) so it doesn't over-degrade to make room for items that were about to fold anyway. Slots hide via a `.pa-fit-hidden` class (`display:none !important`, beats component `display:flex`); author non-first steps with that class for a no-JS-safe first paint. On `window.pureAdmin.components.navFit` (`init`/`initAll`/`relayoutAll`). The demo header wires it: version (pri 10) → title (20) → search (25) → wordmark "Pure Admin" → "PA" (30).
- **`pureAdmin.device` — capability-first device classification, and a mobile fullscreen command palette.** The vanilla-JS analog of `@keenmate/web-components-core`'s `classifyDevice()`, so pure-admin and the KM web components agree on "what kind of device is this" instead of each re-deriving it. It's a **distinct axis from viewport width**: capability decides first — a non-touch-primary pointer (a real mouse) is always `desktop` at *any* width, so a narrowed desktop window keeps a floating dialog and never a fullscreen sheet. Only touch-primary devices (coarse pointer **and** no hover — the honest phone/tablet signal that holds in landscape) consult the size line: the **shorter** viewport side below `config.tabletMinShortSide` (600px, Material `sw600dp`) ⇒ `mobile`, else `tablet`. Installed as a single owner in `pure-admin.js` (like `viewport` / `colorScheme`): a live `{ class, isTouchPrimary }` snapshot that re-derives off the shared viewport source + pointer/hover `matchMedia` and emits `device:change`. Feature detection, not UA sniffing.
  - **Command palette → full-viewport sheet on phones.** On a `mobile` device the command palette (search dialog) now opens as a full-viewport sheet — 100vw × 100dvh, no radius, a pinned title bar with a close button (the touch close affordance, since there's no visible backdrop or Esc), the results list as the sole flex-fill scroller, and a pinned footer — instead of the floating Spotlight dialog. Mirrors `@keenmate/web-multiselect`'s mobile fullscreen overlay. A narrowed *desktop* window is unaffected (stays floating) — the split is by capability, not a width media query.
  - **`pureAdmin.overlay`** — `lockBodyScroll()` (ref-counted, so a drawer + the palette don't unbalance each other) and `observeKeyboardInset(panel)` (pins a fixed fullscreen sheet above the soft keyboard via `visualViewport`). Vanilla ports of web-components-core's overlay primitives, consumed by the palette and available to any fullscreen surface.
  - **`config.tabletMinShortSide`** (600) added to the shared UI baseline. New CSS: `.pa-command-palette--fullscreen` + `__fullscreen-bar` / `__fullscreen-title` / `__close`. The close button uses the `.pa-icon--x` masked-icon primitive. Themes must be rebuilt.
- **Search entry-point patterns: `.pa-navbar-search--field` (inline live search) and `.pa-sidebar__search` (sidebar search trigger).** The framework already shipped the `.pa-navbar-search` pill (a *trigger* that opens the palette); these add the two other shapes an admin shell typically wants, so a consumer can place search wherever fits. `.pa-navbar-search--field` turns the pill into a real `<input>` with an anchored `.pa-search-autocomplete` results dropdown — a **live** search box (its own results) rather than a palette trigger. `.pa-sidebar__search` is a framed faux-input row for the top of the sidebar that collapses to an icon in `--icon-collapse` mode, wired by the consumer to open a palette or their own search. Behavior stays consumer-owned (this is an HTML/CSS template); the command palette also now exposes `pureAdmin.commandPalette.open()/close()` so any trigger can drive it. The demo showcases all three placements with a **Search Box** position selector in the settings panel.

### Fixed

- **Brand/version no longer collide with the centre page title in a tight header.** `.pa-header__title` sat unshrinkable next to the brand, so on a narrow bar the wordmark + `.pa-header__version` tag overlapped the centred title (e.g. "Pure Admin v2.9.0-rc11" running into "Dashboard"). This is now owned by the new Navbar Fit engine (see Added): the version (priority 10) and title (20) are `data-pa-fit="hide"` slots that degrade out — at the exact width they'd otherwise collide, not a blanket mobile breakpoint — so the space is reclaimed responsively instead of the title always vanishing on mobile.
- **`.pa-navbar-search` and `.pa-sidebar__search` now honor the standard HTML `hidden` attribute.** Both set `display: flex`, which overrides the UA `[hidden] { display: none }` rule — so `<button class="pa-navbar-search" hidden>` still rendered. Added `&[hidden] { display: none }` to each so the attribute works as authored (this is how the demo toggles between search placements).

- **Navbar search overflow protection now survives a wrapper element (hardening the rc11 fix).** rc11's reserve rule aimed its shrink at `.pa-navbar-search` by *descendant* selector, but the `min-width:0` flexbox needs has to land on the *direct flex child* of `.pa-header__center`. When a consumer (svelte-pure-admin) wrapped the pill in its own element, the pill shrank but the wrapper — the actual flex item — stayed at `min-width:auto`, refused to collapse, and overflowed onto the brand + version tag. Two position-agnostic guards replace the by-name selector: the slot now shrinks its direct child generically (`:has(.pa-navbar-search) > * { min-width: 0 }`), and the pill defends itself (`min-width: 0; max-width: 100%`) so it can never exceed its container at any nesting depth. Consumers no longer have to mirror core's exact markup to get overflow safety. Themes must be rebuilt.

## [2.9.0-rc11] - 2026-08-19 [PUBLISHED]

### Added

- **Masked icon primitive (`.pa-icon` / `.pa-icon--x`) — provider-agnostic icons; the profile close/remove X is now a real icon.** Close/remove affordances used inconsistent **text glyphs** (`✕` U+2715 / `×` U+00D7) that render differently across platforms and fonts. New `.pa-icon` primitive draws an SVG in `currentColor` via `mask-image` — so it inherits the button's colour and scales with `--pa-icon-size` (default `1em`) — with each glyph a single `--pa-icon-*` swap point, keeping the framework **icon-set-agnostic** (override `--pa-icon-x` to swap providers; ships the Lucide "x" as a data-URI mask by default, no icon library or asset needed). **Every** close/remove/clear affordance in the framework now uses `<span class="pa-icon pa-icon--x">` — the profile close + favourite-remove, modal closes, alert dismisses, toast closes, composite-badge / `pa-badge__remove` / search-token removes, `pa-input-wrapper__clear`, popover closes, file-selector popover close + remove, and notification delete — converted across snippets, demo views, and JS-generated markup (`toast-service.js`, `file-selector.js`, `search-autocomplete.js`). Pure-CSS glyphs that can't carry a `<span>` (file-selector image/preview `::before` remove buttons) use a new `pa-icon-mask` Sass mixin that paints the same mask in `currentColor`. Only **semantic status marks** (toast/alert severity icons) and genuine **multiplication signs** (`1920×1080`, KPI ratios) remain as text — those aren't dismiss affordances. Themes must be rebuilt.
- **`pureAdmin.config` — a shared UI-behavior baseline.** Introduces one overridable object on the runtime namespace for the framework's binding-agnostic defaults, so components stop hardcoding constants and every wrapper (svelte-pure-admin, keen-pure-admin's Phoenix LiveView hooks, …) inherits the same baseline instead of drifting. Consumers override any key by setting it on `window.pureAdmin.config` before init (honoured, not clobbered by the default). App-domain config (permissions, currentUser, date/time formats, button presets) is deliberately **out of scope** for core and belongs in the wrappers; the full key plan + core-vs-wrapper split is in `docs/config-shared-ui-baseline.md`. Keys shipped:
  - **`mobileBreakpoint`** (`768`) — the value previously written as a literal in ~8 JS spots (`sidebar-resize.js`'s `MOBILE_MAX`, the demo's `window.innerWidth <= 768` checks) *and* as `$mobile-breakpoint` in SCSS, with no single source. It's now emitted once as a `--pa-mobile-breakpoint` CSS variable (from `$mobile-breakpoint`, in both `main.css` and every theme) and **read from there by JS** — the same idiom `sidebar-resize.js` already uses to read its drag bounds from CSS vars — so the CSS media query and the JS guard can't disagree.
  - **`typingDebounceDelay`** (`300` ms) — one debounce for search / autocomplete / filter inputs that the wrappers' search components read.
  - **`toast.*`** (`position`, `duration`, `showProgress`, `persistent`, `closeOnBackdrop`) and **`severity.*`** (per-level `icon` + `title`) — relocated from the private consts in `toast-service.js`, so toasts are tuned in one place. Core ships **emoji** severity icons (zero-dependency); a wrapper overrides a level with its FA/lucide token. Both the core toast-service and the demo's feature-ahead copy now read these.
  - **`transition.{fast,normal,medium,slow}`** (ms) + **`transition.easing`** — the SCSS motion scale, now also emitted as `--pa-transition-*` / `--pa-easing-snappy` CSS vars (giving CSS consumers runtime motion tokens too) and read into config for the rare JS that must sequence on a CSS transition instead of hardcoding a magic ms.
  - Themes must be rebuilt to emit the CSS vars.
- **`.pa-header__version` — muted version tag beside the brand wordmark.** A small, secondary-coloured inline span (`<h1>Pure Admin <span class="pa-header__version">v2.9.0</span></h1>`) for showing a product/framework version next to the name without it reading as part of the name. (The demo wires it to the live core package version.)
- **`pureAdmin.colorScheme` + `colorscheme:change` event — one owner for the OS light/dark preference.** The framework now watches `prefers-color-scheme` in exactly one place, mirroring how `pureAdmin.viewport` owns the single window-resize / orientation source: `pure-admin.js` opens one `matchMedia('(prefers-color-scheme: dark)')` (with the `addListener` Safari-<14 fallback), exposes a live snapshot `pureAdmin.colorScheme = { mode: 'light' | 'dark' }`, and emits `colorscheme:change` on the bus when the OS flips. This gives any consumer a "follow the OS" / **auto** theme mode without each component opening its own query — the JS-detection foot-gun the web-component color-scheme guideline warns about. Because the auto bridge sets both `.pa-mode-{light,dark}` and `body[data-theme]`, shadow-DOM web components (`<ms-multiselect>` et al.) that key off `:host-context([data-theme="dark"])` follow along live. The demo settings panel's new **Auto** mode option (shown only for themes that define both a light and a dark mode) is the first consumer.
- **Touch-grabbable sidebar resize handle.** The `.pa-sidebar-resize` handle was a 6px strip whose grip only appeared on `:hover` — invisible and far below the ~44px touch target on a finger. On coarse pointers (`@media (pointer: coarse)`) it now widens its hit area to 24px and shows a persistent, high-contrast grip knob painted over the sidebar's edge line (vertical dots + shadow, so it reads as `──[handle]──`; both knob and line turn accent while dragging), so a resizable sidebar is actually grabbable by touch. The knob is centred exactly on the edge line (via a `translateX(50%)` straddle) and takes the theme's surface radius (`--pa-border-radius-lg`), so it matches each theme's chrome. It's `position: sticky` at mid-viewport, so on a long page it rides along on screen instead of sitting at 50% of the (page-tall) sidebar; in sticky-layout mode it falls back to absolute-centred where the sidebar is already viewport-height. Pure CSS — the same `.pa-sidebar-resize` element adapts, no markup or class change needed.
- **Tooltip floating element now carries the `pa-tooltip--color-1..9` variants.** `tooltips-popovers.js` copied only the semantic variant classes (`--primary`/`--success`/…) onto the generated floating tooltip, not the numeric color scale — so a `pa-tooltip--color-5` trigger rendered an unstyled tooltip. It now copies `--color-1` through `--color-9` too. (Upstreamed from the demo's copy while de-duplicating the shadowed JS modules; see `docs/config-shared-ui-baseline.md`.)
- **`.pa-table-card__description` — optional subtitle for table cards.** A canonical subtitle element mirroring `.pa-card__description`: it sits between the title and `__actions`, flexes into the free space of the header row, truncates with ellipsis, and shares the `--pa-card-description-offset-y` baseline nudge. `.pa-table-card__title` now uses `flex: 0 1 auto` (like `.pa-card__title`) so the description gets the free space. This closes a gap in the rc10 consolidation: `.pa-table-card` couldn't express a subtitle, so it wasn't a strict superset of the (now-deprecated) bare-`.pa-table`-in-a-`.pa-card` shape, which could carry one via `.pa-card__description`. `.pa-table-card` is now a true superset, making that deprecation honest and letting wrappers migrate 1:1.
- **Onboarding: `QUICKSTART.md` + a runnable `starter/` page.** The published tarball unpacked to a bare pile of `dist/` / `src/` / `snippets/` with no "start here". Added a short `QUICKSTART.md` (2-minute tour: link the CSS, use the layout shell, drop in components, add a theme, JS + SCSS notes) and a self-contained `starter/index.html` — a complete admin page (navbar + sidebar + stat row + table card + footer) that links this package's own `dist/css/main.css` via a relative path, so it runs straight from the unzipped package with no install, build, or network. Both are shipped via the `files` array and linked from the top of `README.md`.
- **`sidebar-resize.js` now ships in core (`src/js/sidebar-resize.js`).** The drag-to-resize driver lived only in the demo folder, even though the `.pa-sidebar-resize` handle, `--pa-local-sidebar-width`, and the `--pa-local-sidebar-min-width` / `--pa-local-sidebar-max-width` bounds are all core CSS — consumers had to reach into `demo/` to vendor it. It's now a first-class core module (`window.PureAdminSidebarResize`) next to `navbar-collapse.js`. It also **reads its drag bounds from the CSS variables** instead of hardcoding them: the previous copy baked in `180`/`500`/`288` px and a `/10` rem factor, which could silently drift from the `--pa-local-sidebar-min/max-width` vars and the root font-size; it now derives min/max/conversion from CSS (re-read at drag start, so a runtime theme switch that changes the bounds is honoured), and reset (double-click) drops the inline override so the stylesheet default — including the tablet cap — reapplies. (Reported by a consumer, keen-docs.)

### Changed

- **Sidebar resize handle and splitter gutter now share one grab-knob.** The two drag-to-resize affordances looked nothing alike: the splitter gutter showed a thin centred grip pill, while the sidebar handle showed a hover-only edge line on desktop and a bulky protruding ⋮ knob on coarse pointers — visibly out of sync when both were on screen. They're now a single control, driven by one shared mixin (new `core-components/_resize-handle.scss`, `@include`d by `_sidebar.scss` and `_splitter.scss` so neither cross-references the other's variables): a rounded tab with a ⋮ (vertical handles / the sidebar) or ⋯ (a vertical split's horizontal gutter) grip, in `--pa-card-bg` with a `--pa-border-color` border + shadow, accenting on hover/drag. The knob's **width is viewport-responsive** — slim on desktop (`14×44`), chunkier at `≤ $tablet-breakpoint` (`20×48`) — so there's no oversized knob on a wide screen; the sidebar knob is now shown in **every** viewport (was coarse-pointer only) and stays `position: sticky` at mid-viewport so it doesn't sink below the fold on long page-height sidebars. Its corner radius follows the theme (`var(--pa-border-radius-lg)`, same token as cards) but is **capped** (`min(…, 4px)` desktop / `6px` larger) so the `-lg` radius doesn't read as a pill on the slim knob — square themes (radius 0) stay square. Themes must be rebuilt to pick this up.
- **Mobile sidebar drawer now slides in/out, in sync with the profile panel.** The mobile sidebar snapped open by toggling between `width: 0` and a `position: fixed` 90vw overlay — it popped in with no animation, while the profile panel (opened from the same header) slid. Inconsistent for two drawers on the same screen. The mobile sidebar is now a proper off-canvas drawer: always `position: fixed` at the drawer size, parked `translateX(-100%)` (RTL: `+100%`) and sliding to `translateX(0)` on `.sidebar-visible`, with the **same `$transition-medium` / `$easing-snappy`** the profile panel uses. Its backdrop moved from a `.sidebar-visible::before` (which could only pop in, never fade out) to an always-present `body::before` that fades its opacity in/out with the drawer, and the drawer is `visibility: hidden` while closed so its links aren't focusable off-canvas. Both transitions are gated behind `body.loaded` so nothing animates on first paint. Themes must be rebuilt to pick this up.
- **BREAKING: all JS globals consolidated under one `window.pureAdmin` namespace.** The framework exposed a dozen ad-hoc globals in two inconsistent styles (`window.PaSplitter`, `window.PaOverflow`, `window.PaMenus`, `window.PureAdmin.confirm/toast`, `window.PureAdminSidebarResize`, `window.PureAdminTooltips`, three `window.PA_*_DEBUG` flags, …). They're now a single lowercase `window.pureAdmin` with: an **event bus** (`pureAdmin.events.on/once/off/emit`), a **viewport** source (`pureAdmin.viewport` + throttled `viewport:resize` / `viewport:orientation` events — one shared, rAF-throttled, passive `window.resize` owner; element-box `ResizeObserver`s stay per-component), a **components** registry (`pureAdmin.components.{navCollapse,navDropdown,overflow,cardActionsOverflow,statFit,rangeGroup,splitter,splitMenu,sidebarResize}` + `components.initAll(scope)`), **menu** coordination (`pureAdmin.menus`, formerly `PaMenus`), a **debug** registry (`pureAdmin.debug.enable/isEnabled/log/aspects`, replacing the `PA_*_DEBUG` booleans), and the services `pureAdmin.confirm/alert/prompt/custom`, `pureAdmin.toast`, `pureAdmin.tooltips`. Load-order-safe via the self-creating `window.pureAdmin = window.pureAdmin || {}` idiom (bootstrap: new `src/js/pure-admin.js`). **No back-compat aliases** — update call sites per the naming map in `docs/js-architecture.md`. The bare component classes consumers `new` themselves (`VirtualScroll`, `SearchAutocomplete`, …) and the inline-handler shims (`toggleSplitMenu`, `switchTheme`, …) are unchanged. Initial bus emitters wired: `sidebar:resize` (drag end), `menu:opened` (open-menu coordination), `sidebar:mode` (live sidebar-behavior toggle), and `theme:change` (live light/dark + palette-variant changes, bridged from the settings panel).

### Fixed

- **Doubled gap between the burger and the brand wordmark on desktop.** `.pa-header__start` already separates its children with a flex `gap: $spacing-base`, but `.pa-header__brand` *also* carried `padding-inline-start: $header-brand-padding-left` (2.1rem) — a leftover from before the start/center/end flex layout — so the two stacked into a ~3.1rem gap. (The mobile layout only looked right because it zeroed the brand padding back out.) Removed the redundant brand padding so the `.pa-header__start` gap is the single burger→brand separator at every breakpoint, and dropped the now-moot mobile override. Themes must be rebuilt.
- **Profile panel close button was near-invisible on dark/coloured headers.** `.pa-profile-panel__close` used the content token `--pa-text-color-2`, but it sits in the panel header (`--pa-header-bg`), which is dark in many themes (e.g. NATO's navy bar) — so a dark secondary-text colour rendered the button almost invisible. It now uses `--pa-header-profile-name-color` (the header-aware colour the name/email/tabs already use, theme-guaranteed to contrast the header). This was pre-existing with the old `✕` glyph; the thin masked `.pa-icon--x` strokes made it obvious. Since the icon paints with `currentColor`, one colour token fixes both.
- **Toast service default position `'top-right'` had no matching container CSS.** `toast-service.js` defaulted to the legacy *physical* position `'top-right'`, but the framework standardizes on *logical*, RTL-aware position names and only ships `.pa-toast-container--top-{start,end,center}` / `--bottom-*` styles — so a default-position toast landed in a dynamically-created `#toast-container-top-right` with no positioning CSS. The default is now `'top-end'` (which the demo's copy already used), matching the shipped container styles and mirroring correctly under RTL. Now sourced from `pureAdmin.config.toast.position`. With a `.pa-navbar-search` in `.pa-header__center`, narrowing the window let the pill overflow onto the `start`/`end` slots while `navbar-collapse.js` kept thinking everything fit. The search's `min-width` sits on a child, which flexbox ignores, so `.pa-header__center` (`min-width: 0`) collapsed to a sliver and the pill overflowed — and because the deficit never shrank the nav's own slot, the collapse loop (which measures `nav.clientWidth`) never saw it. `.pa-header__center:has(.pa-navbar-search)` now reserves a real width floor (and lets the pill itself shrink), so the squeeze lands on the shrinkable `.pa-header__start`, the nav narrows, and items fold honestly. (Reported by a consumer, keen-docs.)
- **Tablet sidebar width discarded any resize/theme width.** In the 769–1024px band, `.pa-layout__sidebar { width: $sidebar-width-tablet }` — a hard `16rem` literal at specificity `(0,1,0)` — overrode the var-based base rule and snapped every sidebar to 16rem, silently discarding a user-resized or theme-set width. It now uses `min(var(--pa-local-sidebar-width), 16rem)`, so a resize/theme narrower than the cap is respected and only widths above it are clamped (so content still gets room on tablets). (Reported by a consumer, keen-docs.)
- **Icon-collapse sidebar couldn't be drag-resized.** When a sidebar was both `--icon-collapse` and resizable, the expanded-state rule `body:not(.sidebar-hidden) .pa-layout__sidebar--icon-collapse` hard-coded `width: $sidebar-width`. Its `(0,3,0)` specificity beat the zero-specificity `:where(.pa-layout__sidebar){ width: var(--pa-local-sidebar-width) }` base rule, so the resize JS updated the variable but the width never moved (the handle highlighted on hover but dragging did nothing). It now reads `var(--pa-local-sidebar-width)` too — identical default width, but resizing works. Themes must be rebuilt to pick this up.
- **Sidebar resize handle intermittently "hovered but wouldn't drag" on touch.** `.pa-sidebar-resize` had no `touch-action`, so the browser's gesture-intent heuristic could interpret a drag as a scroll/pan and **cancel the touch sequence right after `touchstart`** — `touchmove` never reached the resize handler and the drag silently died (reproducible in DevTools device mode / on coarse pointers, notably after focus had been elsewhere). Hover worked because it's pure CSS; only the touch drag was stolen. Added `touch-action: none` to the handle so it owns the gesture (mouse path unaffected), plus a `touchcancel` listener so a cancelled touch cleans up its drag state instead of leaving `isResizing` stuck true.
- **Sidebar resize indicator line floated a few px inside the edge.** The hover/active line (`.pa-sidebar-resize::after`) was centred in the 6px grab strip (`inset-inline-start: 50%; translateX(-50%)`), but the strip is `inset-inline-end: 0` — its right edge is the sidebar's padding edge (inside the 1px border) — so the 2px line landed ~3–4px in from the visual edge instead of on it (most noticeable on crisp themes like NATO). The line is now `inset-inline-end: 0` so it sits on the sidebar's border, matching the coarse-pointer treatment; the 6px strip stays the grab area.
- **Sidebar resize did nothing in the 769–1024px tablet band.** The tablet width rule caps at `min(var(--pa-local-sidebar-width), 16rem)`, but the drag floor `--pa-local-sidebar-min-width` is **18rem** — above the 16rem cap — so every width the drag produced was clamped by `min()` and the sidebar never visibly moved (the handle looked dead, e.g. in DevTools responsive mode at a tablet width). The rc11 "honour a narrower resize" intent was unreachable because you can't drag below 18rem. `sidebar-resize.js` now flags `body.pa-sidebar-resized` whenever a width is applied (drag or restored-from-storage) and clears it on reset; the tablet band honours that width **without** the cap once the user has actually resized, while un-resized sidebars keep the narrow 16rem tablet default. Themes must be rebuilt to pick up the CSS half.
- **Mobile sidebar overlay didn't lock background scroll.** The open mobile drawer is a `position: fixed` 90vw sheet with a scrim, but the page behind it stayed scrollable — dragging the scrim strip scrolled the content under the fixed drawer (exposing that the drawer is only viewport-high) and, combined with tap-outside-to-close, read as a glitch. Standard modal-drawer behavior is now in place: inside the mobile media query, `body.sidebar-visible` gets `overflow: hidden` and `.pa-layout__sidebar` gets `overscroll-behavior: contain` (drawer's own scroll no longer chains to the page). This covers desktop + Android; iOS Safari ignores `body { overflow: hidden }` for touch scroll, so the demo's mobile toggle (`layout.mustache`) additionally pins `<body>` with `position: fixed` + scroll-restore while open — the JS half lives in the demo because core ships no mobile-sidebar toggler. See `docs/mobile-sidebar-overlay.md`. Themes must be rebuilt to pick up the CSS half.
- **Sidebar resize handle showed as a dead affordance on mobile.** Below the mobile breakpoint the sidebar is a fixed 90vw overlay and `sidebar-resize.js` already refuses to drag (`window.innerWidth <= MOBILE_MAX`), but the CSS handle had no matching guard: the new touch grip is gated on `@media (pointer: coarse)` — *pointer type, not width* — so on a phone the persistent grip knob + full-height edge line still painted, riding the overlay's inline-end edge (where they also straddle the backdrop-dismiss tap zone) while doing nothing. `.pa-sidebar-resize` is now `display: none` inside the `max-width: $mobile-breakpoint` overlay query, so CSS and JS agree on the same 768px threshold. Touch resize is unaffected in the tablet band above the breakpoint, where the sidebar is an in-flow column and the coarse-pointer affordance is kept. Themes must be rebuilt to pick this up.
- **Mobile sidebar drawer couldn't be dismissed by tapping the scrim** (demo). The tap-outside-to-close handler (`closeMobileSidebar`, `layout.mustache`) only fired when `event.target === document.body`, but the backdrop is a CSS `::before` on `body.sidebar-visible`, so a tap on the scrim strip lands on the pseudo-element and can report the underlying `.pa-layout` element as the target instead of `body` — the check missed it and the drawer stayed stuck open (you had to reopen the burger to toggle it shut). Rewritten to the same "click outside the panel" model the profile/notifications panels use: close on any tap that isn't inside `.pa-layout__sidebar` and isn't on the burger toggle (excluded so the opening tap doesn't immediately re-close). Demo-only fix; core ships no mobile-sidebar toggler.
- **Mobile profile panel had no working scrim and let the page scroll behind it — now a full drawer consistent with the sidebar overlay.** Two defects compounded into an inconsistent mess (one drawer — the sidebar — opened to 90vw *with* a scrim; the other — profile — to 85vw with *no* scrim): (1) **The profile scrim never rendered, on any viewport.** `.pa-profile-panel` is `position: fixed; inset-inline-end: 0` with **no width / no `inset-inline-start`** and all its children are `position: absolute`, so it shrink-to-fits to **0 width pinned at the inline-end edge** — and its `&__overlay` (`inset-inline-start: 0; width: 100vw`) then started at that edge and extended 100vw entirely **off-screen**. (2) The demo scroll-lock was the broken `body.pa-scroll-lock` (`overflow-y: scroll`, which forces a scrollbar but never stops scrolling). On mobile the panel now spans the viewport (`inset-inline-start: 0`, so the abspos scrim has a full-width containing block), matches the sidebar's width (`$mobile-sidebar-width`, 90vw — the desktop 400px cap is dropped) and its backdrop (`$mobile-backdrop-bg`), and the demo toggle uses the robust `lockBodyScroll()` / `unlockBodyScroll()` (pin `<body>` `position: fixed` + restore scroll, iOS-Safari-safe). **All of this is scoped to the `max-width: $mobile-breakpoint` query** — on tablet/desktop the panel stays a narrow side sheet with no scrim and no scroll-lock (its overlay stays off-screen and dismissal is the existing click-outside handler), matching the sidebar, which is only an overlay on mobile too. The shared lock also compensates for the vanishing desktop scrollbar (`padding-inline-end`) so pinning the body doesn't reflow the page sideways, and `toggleNotifications` now closes the profile panel via `closeProfilePanel()` so the lock is always released. CSS half is core (themes must be rebuilt); the scroll-lock + tap-to-dismiss halves are demo.

## [2.9.0-rc10] - 2026-08-09 [PUBLISHED]

### Fixed

- **`.pa-table-card` header showed a white wedge at each top corner.** `.pa-table-card__header` set its own `border-top-{left,right}-radius`, so it curved at the full radius while the card's *inner* corner is ~1px smaller (outer radius minus the 1px border) — leaving a sliver of card background at each top corner (most visible on the coloured `--primary`/`--success`/… header variants). Removed the header's own radius and let the card's `overflow: hidden` clip the corners, mirroring the same fix already on `.pa-card__header`. (Surfaced by the table-wrapper consolidation below, which moved tables like the Forms "Input Sizes Reference" from `.pa-card` onto `.pa-table-card`.)

### Changed

- **Tighter header brand spacing on mobile.** The burger→brand gap (`$header-brand-padding-left`, 2.1rem) is now dropped to `0` below the mobile breakpoint, so the wordmark doesn't waste scarce width next to the hamburger (and leaves room for the collapsing nav on the same row); the burger's own margin still separates the two. Desktop spacing is unchanged.
- **Responsive navbar collapse no longer pins the active item.** The current-page (`.pa-header__nav-item--active`) item used to be hard-pinned to the bar (effective priority 1000) so it never collapsed. It's now treated like any other item — when the row runs out of room it folds into the "More" menu / sidebar by normal priority order (and, in sidebar mode, its branch is still injected pre-opened/active). To keep a specific item on the bar longest, give it an explicit high `data-pa-nav-priority`. (`navbar-collapse.js`.)
- **Table-in-container wrappers consolidated to two blessed shapes.** Putting a table in a "box" had grown four overlapping shapes; there are now two documented ones: `.pa-table-container` (bare — a card-less, framed, horizontally-scrollable wrapper with **no** header) and `.pa-table-card` (the full card — header/body/footer/actions slots, colour variants, `--plain`, and `__body--scrollable` for wide tables). `.pa-table-card` is the single blessed shape for any table that needs a header/actions/footer or card chrome. The snippet (`snippets/tables.html`) now shows only these two, and the main table demo pages (tables, tables-responsive, tables-sizing, dashboard, cards) plus the Forms "Input Sizes Reference" table were migrated. As a direct consequence, the Forms sizes table (and any wide table) no longer gets silently clipped inside a plain `.pa-card` body — `.pa-table-card__body--scrollable` provides horizontal scroll while the card keeps its rounded-corner clipping.

### Deprecated

- **`.pa-table-container--panel`** (and its `__header` / `__title` / `__actions` sub-elements) — a near-duplicate of `.pa-table-card`. Use `.pa-table-card` instead. The CSS still renders (legacy tolerance) but is no longer documented and is slated for removal in a future major.
- **Hosting a `.pa-table` directly in a generic `.pa-card` body** ("Approach A", typically with `.pa-card__body--no-padding`) is no longer a documented shape; use `.pa-table-card`. Still renders, but a generic card gives no table-aware body (no column-edge alignment, no last-row border trim, no `--scrollable`), and its `overflow: hidden` clips wide tables. (`.pa-card__body--no-padding` itself is unchanged — it stays valid for non-table content.)

## [2.9.0-rc09] - 2026-08-07 [PUBLISHED]

### Added

- **`.pa-header__nav-item--active` — active state for top-navbar nav items.** The top nav previously had no "current section" style (only the sidebar's `.pa-sidebar__link--active` existed). Add the modifier to the current item's `<li>` and its link gets a held pill: text brightened to `--pa-header-text` + semibold + a translucent `currentColor` tint for the pill background. The background is derived from `currentColor` (the link's own rendered text colour) rather than `--pa-accent` so it stays visible on every header — including themes that give the header a dark/accent background and force the nav text light with `!important` while leaving `--pa-header-text` dark (e.g. NATO's navy bar), where an accent (or header-text) tint would be dark-on-dark and vanish. The navbar hover background was moved to the same `currentColor` model for the same reason. Scoped through the `nav > ul > li` chain so it outweighs the base link colour.
- **`.pa-sidebar__divider` — thin horizontal rule between sidebar groups.** An `<li class="pa-sidebar__divider">` that draws a `--pa-border-color` line (no text), for separating blocks of items. Sidebar collapse mode injects one at the bottom of the folded-in navbar group, so the moved nav items are visually divided from the sidebar's own links.
- **`.pa-sidebar__section` — flat, non-interactive sidebar group heading.** A small uppercase label (`PROJECT`, `GUIDES`, …) for grouping nav links when the groups are always visible, as an `<li class="pa-sidebar__section">` sibling to the items. Fills the gap between "no grouping" and the collapsible `__toggle` + `__submenu` groups — docs-style sidebars that want static section labels no longer need a bespoke class.
- **Touch support for navbar dropdowns (`navbar-dropdown.js`).** Navbar dropdowns (`.pa-header__nav-item--has-dropdown`) opened only on `:hover`, which never fires on touch — so a dropdown parent that is *also* a real link (e.g. Components → `/components/overview`) was a trap on mobile: tapping it just followed the href and the submenu could never be reached. New always-on module uses **first-tap-opens, second-tap-navigates**: on `(hover: none)` devices the first tap on a parent's own link opens its submenu (navigation suppressed, sibling branches close), and a second tap on the now-open parent follows the link; a bare toggler (`href="#"`) is a pure toggle whose second tap closes it. Tap-outside / Escape close all; nested submenus keep their ancestors open. Nested (level-2+) submenus, which are sideways `inset-inline-start: 100%` flyouts on hover, would run straight off a narrow screen on touch — so on `(hover: none)` they instead stack **inline** (accordion: static box, indented, no shadow) inside the level-1 panel, opened per-branch by the same `.is-open` toggle. Hover-capable input is untouched (native navigation + CSS hover). The CSS hover-reveal in `_navbar-elements.scss` is now gated behind `@media (hover: hover)` (so it can't sticky-hover-fight the JS on touch) with an `.is-open` class reveal driving the open state. Skips the collapse "More" panel (submenus are already flattened inline there) and its trigger. Adds `aria-haspopup` / `aria-expanded` to parent links. New standalone module `src/js/navbar-dropdown.js` (`window.PaNavDropdown`, auto-inits).
- **Responsive navbar collapse (`navbar-collapse.js` + `data-pa-nav-collapse`).** The top nav no longer just `display:none`s on mobile — opt in with `data-pa-nav-collapse` on `.pa-header__nav` and it progressively folds the lowest-priority items out as the header narrows (restoring them as it widens), the same priority-driven collapse idea as the `.pa-overflow` toolbar. Two configurable targets: `menu` folds items into a generated "More" dropdown (self-contained; needs no sidebar; nested nav dropdowns render **flat** inside the panel, so no cascading fly-outs), and `sidebar` **builds genuine `.pa-sidebar__*` markup** from each item and injects it under a `.pa-sidebar__section` heading (the original nav `<li>` is kept detached and re-inserted on restore). A leaf becomes a `.pa-sidebar__link` (icon + label spans); a dropdown parent becomes a collapsible `.pa-sidebar__toggle` group — chevron, self-wired, **starts closed** — whose first child is the parent's own destination ("Overview" model), recursing to nested groups at any depth. The navbar and sidebar are different DOM shapes (bare `<a>` vs icon/label spans; hover dropdown vs toggle accordion), so a mere className swap produced link-shaped, icon-less, always-open items visibly "in their own style" — building real markup fixes that. Icons default to a bullet, set per item with `data-pa-nav-icon="🏠"` or globally with `data-pa-nav-collapse-icon` (`""` to omit). The active branch is injected pre-opened. A per-item `data-pa-nav-collapse="hide"` opts an `<li>` out of relocation entirely — it's simply hidden when it doesn't fit (and re-shown as space returns), useful for low-value links that shouldn't clutter the menu/sidebar; it still participates in the priority order and is skipped if active/pinned. (The strategies now reveal the "More" trigger / sidebar heading lazily on the first real relocation, so a round resolved purely by hiding doesn't leave an empty trigger or heading behind.) Priority via `data-pa-nav-priority` per `<li>` (lowest drops first); the `--active` item is hard-pinned so the current page's nav item **never** collapses — even at extreme narrow widths where the row overflows slightly, hiding the current page is worse than a tight fit (set an explicit `data-pa-nav-priority` on the active item to opt out). New standalone module `src/js/navbar-collapse.js` (`window.PaNavCollapse`, auto-inits) — kept separate from `overflow.js` since the collapsed-item transforms differ entirely. Unlike the toolbar it measures overflow by **summing item widths** (not `scrollWidth`+`overflow:hidden`): the nav stays `overflow:visible` so the nav items' own hover dropdowns aren't clipped, and the "More" panel is parented to `<body>` and click-toggled for the same reason. A legacy nav without the attribute still hard-hides on mobile.

### Changed

- **Reset/reboot and scrollbar styling single-sourced from `@keenmate/pure-css`.** The 10px rem base (`html { font-size: 10px }`), the `box-sizing: border-box` reset, neutral base styling for standard elements (headings, paragraphs, links, lists, blockquotes, `hr`, `figure`), the `body` font/colour, the `button/input/select/textarea/label { font: inherit }` reset, and the global themed scrollbars all moved into the foundation as `reboot.scss` + `scrollbars.scss`. Core's `core-components/_base.scss` and `_scrollbars.scss` are now thin `@forward` shims, so the reset lives with the rem-scale variables that depend on it — a standalone `@keenmate/pure-css` consumer now gets the 10px base and box-sizing reset too (before, they lived only here, so a page linking the foundation on its own inherited the browser's 16px root and rendered every rem 1.6× too large). The admin-specific base rules stay in core deliberately (`body` overflow handling, the decorative `::before` background pattern, `body.sidebar-sticky`) — a generic foundation shouldn't impose them. Compiled `main.css` is functionally identical to rc08 (only the source order of the non-overlapping `body` base / form-inherit blocks shifts).
- **`@keenmate/pure-css` dependency floor raised to `^1.0.0-rc02`** — reboot/scrollbars require it; rc01 lacks them and would break the build.

### Fixed

- **Sidebar chevron rotation leaked into nested groups.** The open-state rotation used a descendant selector (`.pa-sidebar__item--open .pa-sidebar__chevron`), so opening a parent group rotated the chevrons of every collapsed sub-group inside it too — a closed sub-group wrongly showed a "down" (open) chevron while its own `<li>` had no `--open`. Scoped to the item's own toggle child (`.pa-sidebar__item--open > .pa-sidebar__toggle > .pa-sidebar__chevron`), so each chevron reflects only its own group's state.

## [2.9.0-rc08] - 2026-08-04 [PUBLISHED]

### Changed

- **Foundation single-sourced from `@keenmate/pure-css`.** The `--base-*` / `--pa-*` variable system, the `output-*` emit mixins, the utility classes, and the native `.pa-row` / `.pa-col` grid now live in the standalone [`@keenmate/pure-css`](https://github.com/KeenMate/pure-css) package and are consumed here via thin `@import` / `@forward` shims (`variables/index`, `_base-css-variables.scss`, `utilities.scss`, `core-components/_grid.scss`). Core's duplicate copies were deleted, so the two packages can no longer drift. Public SCSS import paths (`@keenmate/pure-admin-core/src/scss/{variables/index,core,utilities,base-css-variables}`) are unchanged, so themes and `@import` consumers need no edits. `@keenmate/pure-css` (`^1.0.0-rc01`) is a new dependency, and the SCSS build gains `--load-path=node_modules` so the shims resolve. The `base-css-variables` shim intentionally uses `@import` (not `@forward`) so a theme's `$base-*` overrides — set before the import — still reach the emit mixins; `@forward` would load the foundation as a hermetic module and silently drop every override. Compiled `main.css` is byte-identical to rc07 apart from the additions and fixes below.

### Added

- **`.gap-*` / `.gap-x-*` / `.gap-y-*` utilities** — flex/grid gap on the same spacing scale as the margin/padding helpers (the one spacing family the utilities lacked).
- **`.font-family-system` / `.font-family-sans`** join the existing `.font-family-serif` / `-mono`, now single-sourced from the foundation's `_fonts.scss`.
- **`--pa-border-color` runtime-links `--base-border-color`** — emitted as `var(--base-border-color, <literal>)` instead of a baked literal, so a runtime `--base-*` override (a theme or dark-mode class toggling it at `:root` / `.pa-mode-dark`) flows through to `--pa-border-color` and everything that reads it.

### Fixed

- **`.border` / `.rounded` utilities were inert — now render.** `.border` / `.border-{top,right,bottom,left}` and `.rounded` / `.rounded-{lg,top,…}` referenced bare `--border-color` / `--border-radius` variables the framework never emits, so `.border*` fell back to a `currentColor` (text-colored) border and `.rounded*` produced no radius. Repointed at the emitted `--pa-border-color` / `--pa-border-radius(-lg)`, so they now draw the theme's border and radius like every other component. **Behavior change:** markup that leaned on these utilities being no-ops will now show a real border / radius.
- **Form-group first/last-child margin reset in grid columns.** The card-body margin-collapse selectors in `_form-layout.scss` targeted the long-dead PureCSS `.pure-g` / `.pure-u-*` grid; modernized to `.pa-row` / `.pa-col`, so a form group that's the first/last child of a grid column inside a card now correctly loses its edge margin.

### Removed

- **Legacy PureCSS `.pure-g` / `.pure-u-*` grid.** Orphaned since the native `.pa-col` grid replaced it; its source moved into `@keenmate/pure-css` (where it too is superseded by `.pa-row` / `.pa-col`). Core never emitted these classes and no markup used them — only the inert forms selector above referenced them.

## [2.9.0-rc07] - 2026-07-30 [PUBLISHED]

### Fixed

- **Buttons — `.text-truncate` on a button stopped ellipsing after the 2.9 flex model.** `text-overflow: ellipsis` needs a block container laying out inline text; it does **not** apply to the anonymous text item of a flex container. When `.pa-btn` became a single `inline-flex` row (rc06's unified inner-content model), a bare `.pa-btn.text-truncate` no longer truncated — the label just clipped, centered, on both ends with no ellipsis. Restored the pre-2.9 `inline-block` for the one shape that needs it (a text-only button used directly as the truncation target, `.text-truncate:not(:has(> *))`), so that markup ellipses again. This is legacy tolerance, not a second documented pattern — the canonical way to truncate remains `.text-truncate` on an inner `<span>` (a flex item), which works with or without an icon and is what the snippet shows. Demo "Text Truncation" example updated to the inner-`<span>` shape.
- **Overflow — the `[⋮]` "more" trigger was clipped when a sibling title was long.** `.pa-overflow` (and its card alias `.pa-card__actions--overflow`) needs `flex-shrink: 1` + `overflow: hidden` so the wrapper can shrink below its content and `scrollWidth > clientWidth` stays a truthful "needs overflow" signal — but the shrink floor was `min-width: 0`. In a tight header (a long `.pa-card__title` next to the actions), flex distributed the negative space and shaved the wrapper a few px *below* the 31px trigger, so `overflow: hidden` clipped the trigger's right edge — and the JS couldn't recover, because once every button has collapsed into the menu only the trigger remains and there's nothing left to move. The floor is now the trigger's own footprint (`$base-input-size-xs-height`, 3.1rem / 31px — the shared base token, not the button component's variable) instead of `0`, so the wrapper still shrinks far below the full button row (overflow detection intact) but can never clip the one thing that must stay visible.

## [2.9.0-rc06] - 2026-07-26 [PUBLISHED]

### Added

- **Split button — `[data-pa-keep-open]` opt-out on menu items.** `split-button.js` closes the menu on any `.pa-btn-split__item` click via a `document` click listener. A menu item (or an ancestor of the click target) marked `data-pa-keep-open` now keeps the menu **open** instead — for items that open a popconfirm / sub-panel anchored to the item, which must stay visible. This unblocks framework wrappers (svelte-pure-admin): Svelte 5 delegates `click` to one root listener and only *simulates* propagation, so a wrapper's `stopPropagation()` can't reach this document-level handler — previously the only fix was attaching a native `addEventListener`. With the opt-out, a normal delegated `onclick` works and the item just carries `data-pa-keep-open`. Backward compatible — no attribute means today's close-on-click behavior.
- **Overflow — a `.pa-btn-split` child collapses as an atomic labeled group.** The generic overflow primitive (`.pa-overflow` / `overflow.js`, with its dedicated `[⋮]` "more" trigger) previously flattened *every* child into a single `.pa-btn-split__item` row — which destroyed a split-button child (stripping its wrapper and orphaning its primary + toggle + submenu). It now detects a `.pa-btn-split` child and moves the **whole split button** into the "more" menu as one group: a section label (`.pa-btn-split__group-label`, derived from the primary's text or a `data-pa-overflow-label` override) + the primary action + the split's own menu items, kept together and unfolded in place via the new `.pa-btn-split--in-overflow` modifier. So a split button's options stay attached to its own label, while unrelated toolbar buttons collapse into the same "more" menu as plain rows — nothing foreign is poured into a domain dropdown. Restore is fully reversible — widening returns the split button to a normal inline `.pa-btn-split` with its primary class and icon class restored. A split button whose own menu rows carry inline action buttons (`.pa-btn-split__item-row`, e.g. a per-member delete) keeps those action buttons through the collapse — the rows travel intact into the "more" menu and the actions still fire (and don't dismiss the menu). This makes `.pa-overflow` the canonical progressive-collapse toolbar: a dedicated "more" affordance plus split buttons that stay intact (see the matching Removal below).
- **Overflow — the `[⋮]` "more" trigger is a standard bordered button, with a ghost opt-in.** The auto-appended trigger now ships as `pa-btn pa-btn--xs pa-btn--icon-only pa-btn--secondary` — a normal bordered square button (31px at xs, matching a split-button toggle) that reads as a member of the button family instead of a faint chromeless glyph, and it gets that appearance from the button variant classes alone (no dependency on a theme-specific `.pa-overflow__trigger` rule existing). Opt into the chromeless look per wrapper with `data-pa-overflow-trigger="ghost"`, which swaps in `pa-btn--ghost`. The `.pa-overflow__trigger` class remains as a stable retheming hook but carries no appearance of its own.

### Changed

- **Buttons — one unified inner-content model; content is centered by default.** `.pa-btn` is now a single `inline-flex` row (`align-items: center; justify-content: center; gap: $spacing-sm`) for *every* button type. Previously text-only buttons used `inline-block` + `text-align: center` while icon+label buttons used a separate `:has(.pa-btn__icon)` path (`inline-flex` + `text-align: start` + a fixed `$sidebar-icon-size` icon column), so the same component centered or left-aligned depending on whether it had an icon, and an icon glyph — centered in the 24px column — sat ~5px past the padding edge where a text-only label started (visible as an icon split button like *Share* not lining up with a text-only one like *Upload*). Now: the default is **center**; the existing `.pa-btn--align-start / -end / -center / -justify` modifiers ("Button Text Alignment") are the single switch that works identically on all types; the fixed icon column and the per-side `$btn-icon-margin` on `.pa-btn__icon` are dropped for natural icon width + the parent `gap`, so an icon sits at the padding edge exactly like a text-only label; and `--block` keeps the flex model (was `display: block`) so full-width buttons still space icon+label. **Behavior change:** icon+label buttons that are full-width / stretched used to left-align (they mimicked sidebar rows) and now center — add `--align-start` where the old look is wanted. Auto-width buttons (the vast majority) are visually unchanged.
- **`.pa-btn-split__item` + `__group-label` now use the button padding tokens.** Menu rows were `padding: $spacing-sm $spacing-base` (8 / **16px**) — a different horizontal origin than a `.pa-btn` (8 / **12px**, from `$btn-padding-v` / `$btn-padding-h`), so a button's content shifted inward when it collapsed into a menu. Both now use `$btn-padding-v $btn-padding-h` (the `RUN`-style group label matching horizontally), so a button reads identically whether it's inline in a toolbar or collapsed into the `[⋮]` menu.
- **Overflow menu reuses the split-button dropdown logic instead of a parallel copy.** `split-button.js` exposes its positioner as `window.PaSplitMenu.position`, and `overflow.js` now calls it — so the "more" menu opens with the same `offset` / `flip` / `shift` / min-width as a split-button dropdown (it previously hand-rolled `offset(4)`, sitting a few px closer). A shared dismissal registry, `window.PaMenus` (both modules register their close fn; opening any menu closes the others), means a split-button dropdown and an overflow "more" menu — or two overflow menus — can no longer hang open over each other.

### Removed

- **`.pa-btn-split--auto-absorb` + `.pa-btn-toolbar` — the split-button auto-absorb mechanism (added in rc04) is removed.** It made a domain split button double as the overflow sink: overflowing sibling buttons folded *into the split button's own dropdown*, so unrelated commands (a `Refresh` / `Call Mom` button) ended up under a semantic menu like `Export ▾`. `.pa-overflow` supersedes it with the correct model — a dedicated `[⋮]` "more" menu for the overflow, and split-button children that collapse as self-contained labeled groups (see Added above). Removed: `packages/core/src/js/btn-split-auto-absorb.js`, the `.pa-btn-toolbar` host block and `.pa-btn-split--collapsed` state in `_buttons.scss`, and the `:has(.pa-btn-toolbar)` title-yield / shrink rules in `_cards.scss` (the `.pa-card__actions--overflow` equivalents remain). **Migration:** replace `.pa-btn-toolbar` with `.pa-overflow` (or, in a card header, `.pa-card__actions--overflow`), drop the `--auto-absorb` modifier from the split button, rename `data-pa-absorb-priority` → `data-pa-actions-priority` and `data-pa-absorb-from` → `data-pa-actions-overflow-from`. Only ever shipped in 2.9.0 pre-releases (rc04–rc05) — no stable release contained it.

### Fixed

- **Overflow — plain toolbar buttons collapsed into the "more" menu had zig-zag labels.** A plain `.pa-btn` moved into the menu was reclassed to `.pa-btn-split__item` but its inner `.pa-btn__icon` was left as-is, so it missed the fixed icon column and each row's label started at a different x. `overflow.js` now runs the same `rewriteIcons` normalization (`.pa-btn__icon` → `.pa-btn-split__item-icon`) on plain buttons that it already applied to a collapsed split primary, so every menu row's icon shares one column and the labels line up. Reversed on restore.
- **Overflow — a collapsed split-button group read tighter than the rest of the menu.** `.pa-btn-split--in-overflow` was `display: block`, so its label / primary / unfolded rows packed at 0px while the surrounding menu spaced rows by `$spacing-xs` via flex `gap`. It's now `display: flex; flex-direction: column; gap: $spacing-xs`, giving the whole "more" menu one uniform vertical rhythm.

### Internal

- Demo `buttons.mustache` — the **Overflow Toolbar** example gained a **Members** split button whose menu rows carry inline delete buttons (`.pa-btn-split__item-row`), demonstrating that per-row action buttons survive the atomic collapse into `[⋮]`; the resizable box `min-width` was lowered (200 → 64px) so the split button itself can be dragged all the way into the "more" menu.

## [2.9.0-rc05] - 2026-07-07 [PUBLISHED]

### Added

- **Card header — `.pa-card__title` is now the single canonical title structure, plus a new `.pa-card__description` element.** The header previously offered two blessed title shapes — a bare `<h3>` for the no-icon case and `.pa-card__title` (+ `.pa-card__title-icon` / `.pa-card__title-text`) when an icon was needed — which forced a `<Card>` wrapper (svelte-pure-admin) to branch its markup on whether an icon was passed, and let hand-written demos drift between both. `.pa-card__title` is now *the* title contract for every card (icon optional inside the `.pa-card__title-icon` slot), so a component emits one DOM tree with only the icon `<span>` conditional. The bare-`<h3>`-in-header rules stay in the stylesheet as legacy tolerance, but are no longer a documented option. The description is likewise promoted from a bare `<p>` to a real BEM element **`.pa-card__description`** (bare `> p` kept as tolerance) so the header is fully `title` / `description` / `actions`. The `--wrap` modifier was extended to un-truncate the canonical `.pa-card__title-text` as well as bare headings, so titles wrap (not ellipsis) in wrap mode regardless of shape.
- **Card footer — `.pa-card__actions` is the canonical footer actions slot, auto-pinned to the trailing edge.** A footer-scoped `.pa-card__actions { margin-inline-start: auto }` makes the actions cluster hug the right edge whether or not there's leading content (text / `.pa-card__meta`) on the left — so an actions-only footer no longer needs an empty spacer `<div>` to fight `justify-content: space-between`. Footer buttons now live in the same `.pa-card__actions` slot as the header (one concept for both), which also stops bare footer buttons scattering to opposite corners. `space-between` is retained, so the change is purely additive and no existing footer regresses.
- **`--pa-card-description-offset-y` runtime token (default `$card-description-offset-y: 1px`) — header description baseline nudge.** Under the header's `align-items: center`, a 16px title and 14px description don't share a baseline and the smaller description rides ~1px high. Rather than baseline-aligning (which the header's `min-height` breaks — baseline-aligned items pin to the *top* of the taller line), the description is nudged down onto the title baseline via `position: relative; top: var(--pa-card-description-offset-y, …)`. The correction is font-metric dependent, so it's a variable themes with a different font can retune (or set to `0` to disable) instead of a hardcoded px.

### Fixed

- **Card title glyph descenders were clipped.** `.pa-card__title-text` used `line-height: 1`, which with `overflow: hidden` shaved the tails off descenders (g / y / p). Bumped to `1.4` (the room bare headings already leave); icon centring is via flex `align-items: center`, so it's unaffected.

### Changed

- **`.pa-card__title` flex `1` → `0 1 auto`.** It now takes natural width like a bare heading, so a sibling `.pa-card__description` gets the free space instead of the title hogging half the header row. In the title+actions case it's identical to before (the header's `space-between` already pinned actions right).

### Internal

- Demo `cards.mustache` + `buttons.mustache` card headers migrated to the canonical `.pa-card__title` / `.pa-card__description` structure (three-part, long-description, tooltip, wrap, ghost, underlined, and the auto-absorb toolbar-in-header examples); FA icons added to the demo three-part cards via the `.pa-card__title-icon` slot. Snippet `snippets/cards.html` footers formalized (buttons wrapped in `.pa-card__actions`, spacer `<div>` removed) and the footer reference block documents the canonical model.

## [2.9.0-rc04] - 2026-07-06 [PUBLISHED]

### Added

- **Range Group — compact multi-range filter (`.pa-range-group`) + a reusable slider primitive (`.pa-range`).** One toggle summarises several numeric range filters inline (`AGE 25–60 / SALARY $40,000–$200,000 / CHILDREN 2+`) and expands into a Floating-UI panel with one slider per dimension — so a "search people by age / salary / children" filter bar spends one control's worth of width instead of three stacked sliders. Lives in `core-components/_range-group.scss` (registered in `_core.scss` after `filter-card`), snippet at `snippets/range-group.html`, behaviour published in `src/js/range-group.js` (exposed via the `./js/*` export, `window.PaRangeGroup` for re-init; a byte-identical copy lives in `demo/js/` for the demo server), demo at `/components/range-group`. **Two blocks ship together on purpose:** `.pa-range` is a standalone slider (single- OR dual-thumb) and `.pa-range-group` is the compact toggle-+-floating-panel wrapper around N rows. **Per-row config via data attributes on each `[data-range]` row** — `data-mode="range"` (dual-thumb min–max, default) or `"single"` (a one-handle threshold, `data-bound="gte"` → "`value+`" / `"lte"` → "`≤ value`"); `data-min`/`-max`/`-step`, `data-value` (single) or `data-value-min`/`-max` (range), plus number formatting via `data-prefix` / `data-suffix` / `data-thousands` — so rows of different kinds and units coexist in one panel. **Positioning is RTL-correct by construction:** thumbs and fill are placed in 0–100% of the rail via private CSS custom properties (`--_pos`, `--_fill-start`/`--_fill-end`) fed to **logical** inset properties (`inset-inline-*`), so the JS only ever deals in left-to-right percentages and the whole control mirrors under `dir="rtl"` with no branch (the pointer→value ratio is the one place that reads `direction` and inverts). **Interaction** (pointer drag with `setPointerCapture`, keyboard `↑↓←→` / `PageUp/Down` / `Home` / `End`, thumbs clamp against each other) is handled by `range-group.js`, which also anchors the panel by **reusing the split-button dropdown pattern** (`window.FloatingUIDOM`, panel reparented to `<body>` to escape overflow clipping, outside-click / Escape close) rather than introducing a parallel positioning stack. The panel carries a **Reset** and **Apply** and the group emits bubbling `CustomEvent`s — `pa-range-group:change` (live), `:apply`, `:reset` — with a `values` payload keyed by `data-key` where a bound sitting at its extent reports `null` (i.e. "Any"), so consumers get a clean "unset vs set" signal instead of raw min/max. The toggle summary is a **single line** (`LABEL value / …`, ellipsis-truncated) built by JS from each row's `data-label` + current value, sized to sit at the same height as sibling `.pa-input` / `.pa-select` in a `.pa-filter-card__filters` row.
  - **Selectable handle shapes** via a cosmetic modifier on any `.pa-range` (no JS, mix per row): default round, `--handle-rect` (rounded rectangle), `--handle-bar` (thin solid-accent vertical bar `|`), `--handle-arrow` (chevron handles `‹ ›`), `--handle-needle` (a downward triangle balancing its point on the track, like a gauge needle — thumb box goes invisible but stays the full-height grab/focus target, triangle drawn via a `clip-path` `::before`, apex at the track centre, again pure CSS with no glyph/SVG). Thumb dimensions come from private `--_thumb-w` / `--_thumb-h` props so a shape modifier just overrides those two (+ `border-radius`) and the RTL-safe centring margin follows automatically; `.pa-range` reserves the tallest shape's height so none clip the adjacent row. **The chevron is drawn in pure CSS — empty `::before` (`content: ""`) + two logical borders rotated 45° — deliberately not a font glyph, character entity, or SVG**, so there's no font-load / codepoint / encoding failure surface (the min handle mirrors the rotation to point the other way). A 2-border corner only inks half its box, so after rotation the glyph drifted toward its point; it's nudged back to centre by `size / (2·√2)` applied as the **outermost** (screen-space) translate so the inner rotation doesn't skew it, tied to a `$range-chevron-size` token so the nudge tracks the size.
  - **Tick marks (`data-ticks` / `data-ticks-minor` / `data-tick-labels`) + click-to-seek track.** A row draws evenly-spaced tick marks when given `data-ticks` (major interval, in value units); `data-ticks-minor` adds a finer set and `data-tick-labels` prints the major values in a reserved band beneath the track. Marks are built by `range-group.js` into a `.pa-range__ticks` container that is the **rail's first child**, so they paint *behind* the track/fill and show only as protruding ends — major ticks (`.pa-range__tick--major`) reach further out than minor — which sidesteps any contrast problem over the accent fill and needs no z-index juggling. A coincident minor tick is skipped so a major never doubles up. Labelling adds `.pa-range--ticks-labeled` to the row, which grows its height by a fixed band and re-anchors the rail to the top so the sibling rows' tracks stay aligned. Marks/labels are `pointer-events: none`, which lets the second feature work through them: **the whole track is now click-to-seek** — a `pointerdown` anywhere on a `.pa-range` off the handles moves the *nearest* thumb to that point and continues the drag from there (single-thumb rows always move their lone handle; range rows pick the closer thumb, biased so a click beyond a thumb grabs that thumb). The drag driver was refactored into one shared `beginDrag(row, which, e)` used by both thumb-grabs and track-seeks, following the pointer via document-level listeners so a drag survives the pointer leaving the handle. Two new colour tokens — `--pa-range-tick` (→ `--pa-border-color`) and `--pa-range-tick-major` (→ `--pa-text-tertiary`) — retint the marks. **Opt-in `data-snap-ticks`** makes the thumbs settle on the *nearest tick* rather than the (possibly finer) `data-step` grid — tick values are computed before the initial-value snap so a row loads already on-tick, drag/click-seek round to the nearest tick, and keyboard nav switches to tick-to-tick (arrows ±1 tick, Page ±3) so a sub-tick step delta can't get swallowed by the snap and freeze the handle. Demoed in a new "Ticks & click-to-seek" card (major+minor+labels, major-only, a `snap-ticks` 0–100-by-10 row, and a labelled single-thumb rating row).
  - **Dedicated `--pa-range-*` runtime token namespace** (9 tokens: `-track`, `-fill`, `-thumb-bg`, `-thumb-border`, `-thumb-border-hover`, `-focus-ring`, `-track-height`, `-thumb-size`, `--pa-range-group-panel-min-width`) so a theme or per-instance `style` can retint/resize a slider independently of the global `--pa-accent` — no recompile, no modifier class. Consumed via inline fallback (`var(--pa-range-x, <default>)`, mirroring `--pa-splitter-gutter-size`): colour tokens fall back to the shared cascade (`--pa-surface-track`, `--pa-accent`, `--pa-card-bg`, …), dimension tokens to their SCSS defaults, so **they are not emitted by `output-pa-css-variables` and a reference never collapses to nothing** (kept out of the mixin to avoid ~9 lines × every theme). Documented in `CSS-VARIABLES.md`. One authoring caveat, called out in the source + snippet + demo: the `__panel` reparents to `<body>` while open, so a per-instance override must sit on the `__panel` / the `.pa-range` rows (which travel with it) or at `:root` / theme level — not on the `.pa-range-group` root. **Also fixed while wiring this: three `var(--pa-text-color)` references resolved to nothing** (the framework emits `--pa-text-color-1` / `-2`, never the bare name) and only rendered correctly by inheriting body text — repointed to `--pa-text-color-1`.
- **The package now ships the components' JavaScript (`src/js/`).** Previously the npm tarball was CSS + SCSS + snippets only — every interactive behavior (split-button dropdowns, splitter drag, tooltips/popovers, toasts, command palette, the new auto-absorb toolbar, …) referenced JS that lived in `packages/core/src/js/` (or, for the split button, only in the demo) but was **never published**, so a consuming app got markup like `onclick="toggleSplitMenu(event)"` with no implementation. `package.json` now includes `src/js/` in `files` and exposes it via a `"./js/*": "./src/js/*"` export, so consumers can `import '@keenmate/pure-admin-core/js/split-button.js'` (or script-tag `src/js/*.js`). Each file is a self-contained IIFE. **`split-button.js` was promoted from `demo/js/` into `packages/core/src/js/`** — it was the split-button dropdown's actual implementation (`toggleSplitMenu` + Floating UI positioning) and the auto-absorb toolbar depends on it, yet it only existed in the demo. README gains a "JavaScript (Interactive Components)" section mapping each component to its file(s) and noting the `window.FloatingUIDOM` (Floating UI) dependency for split-button / tooltip positioning.
- **Stat square — fit-to-box + progressive-disclosure mode (`pa-stat--square[data-pa-stat-fit]` + `pa-stat-fit.js`).** Opt-in attribute that solves the "one tile, many viewport sizes" problem by priority instead of by compromise. The primary `__number` is sized to fill the tile at the largest font that still fits — never overflowing, independent of character count (a pure-CSS `cqi` clamp can't guarantee this because font-size-by-container-width doesn't know how many glyphs the string has). Below it, a priority ladder reveals rows as the tile earns **both** width and height: `__number` (P0, always) → `__symbol` (P1) → `__label` (P2) → `__change` (P3) → `__context` (P4, new element). Gated on width *and* height via `@container … and …` so a wide-but-short banner doesn't surface the tall-only tiers. Disclosure is pure CSS (`container-type: size` + eight `$stat-square-fit-*` threshold variables); the only JS is the fit step — a small `ResizeObserver` hook (`pa-stat-fit.js`, exposes `window.PaStatFit.init` / `.refresh`) that also wraps the authored-flat `__number` + `__symbol` into the `__slot` > `__group` structure at runtime, so consumer markup stays minimal (5 flat children). **Requires a height source on the tile** (grid cell with a set height / explicit height / aspect-ratio): `container-type: size` makes the box size independently of its content, falling back to the `$stat-square-min-size` floor otherwise; the base square's `max-height` cap is lifted in fit mode so taller tiles are container-driven. **Layout auto-switches by width**: narrow tiles stack vertically (number on top, metadata below); once a tile is ≥ `$stat-square-fit-horizontal-min-w` (default `32rem`) wide, `pa-stat-fit.js` toggles a `.pa-stat--fit-wide` class and it flips to a horizontal banner — the number fills the left at `$stat-square-fit-number-width` (44%) while the metadata stacks in a column to its right, so the number stays dominant and the width isn't wasted. The **metadata is subordinate to the hero number**: `pa-stat-fit.js` sets the `__meta` column's font-size to a small fraction of the **tile height** (`META_RATIO`, default `0.10`) and the `__label` / `__change` / `__context` rows are `em`-relative, so the supporting text stays "supersmall" and — because tile height is uniform across a row — **consistent across tiles**, while still scaling if the tile itself grows/shrinks. (Sizing it off the fitted number instead looked right on a single tile but drifted between tiles: a wide `847K` fits at a different size than `87`, so the meta came out bigger on some tiles than others.) `META_RATIO` is the hierarchy knob — lower = tinier meta — with a `META_MIN_PX` floor (default `12`) so the proportional size never goes illegible on short tiles; `$stat-square-fit-meta-size` is the no-JS fallback. (The class is toggled in JS rather than via a `@container` query because the tile is its own size container, and a container query only restyles a container's descendants — never the container element itself, so the tile's own `flex-direction` couldn't flip that way.) `pa-stat-fit.js` wraps the metadata rows into a `__meta` column for this. Demo: `/showcases/stat-fit-lab` + the dashboard's "fit mode" KPI card.
- **Splitter — `pa-splitter:resize` / `:collapse` / `:expand` `CustomEvent`s.** Three bubbling events fire from the affected `.pa-splitter__pane` so consumers can listen on the splitter root (or higher) with a single handler. `resize.detail = { index, pane, size }` fires per pane on every `applySizes` — unfiltered, matching `svelte-fluentui/MultiSplitter`'s `onresize` shape; debounce in the listener if your handler is expensive. `collapse.detail = { index, pane }` fires when a pane transitions from expanded to rail (toggle button, dblclick, mid-drag snap-into-rail, accordion sweep, `enterAccordion`, pointerup RAIL-STAYED); `expand` fires on the inverse (rail click, `restorePane`, mid-drag DRAG-OUT-OF-RAIL, and the new drag-from-rail-at-pointerdown release path). Init from saved state does **not** fire `collapse` for panes that load already rail'd — only user-initiated transitions emit. Previously there was no observable signal: consumers wiring sidebars / persistence-coupled toolbars / analytics had to poll `localStorage` or observe DOM mutations.
- **Splitter — per-pane orientation class** (`pa-splitter__pane--horizontal` / `pa-splitter__pane--vertical`). Stamped at registration based on the root's `--horizontal` / `--vertical` modifier. Defensive against nested splitters with mixed orientations: downstream CSS that wants to act on panes inside a horizontal (or vertical) splitter can key off the class on the pane itself instead of walking up to find an orientation modifier (which, with nesting, returns the *outer* splitter's orientation for inner panes). No CSS rule in core currently keys on it — the class is a forward-compat hook for theme authors and future rail-styling work.
- **`pa-btn-split--auto-absorb` modifier + `.pa-btn-toolbar` host — progressive-collapse for split-button rows.** Sibling buttons sitting in a `.pa-btn-toolbar` next to a `.pa-btn-split.pa-btn-split--auto-absorb` automatically fold into its dropdown menu when the bar can't fit them on one line, and pop back out as space returns. Drop order is per-sibling via `data-pa-absorb-priority` (default `0`, higher pins later — `10` survives the first collapse waves); tie-break direction is set on the split container via `data-pa-absorb-from="end"` (default — sibling nearest the split button folds first, which feels visually right because that's the one adjacent to the menu it falls into) or `"start"` (leftmost first). Reuses the existing split-button toggle / `__menu` / `__menu-inner` / Floating UI positioning — zero parallel chrome to maintain. Absorbed siblings keep their original click handlers (DOM node is preserved); their `className` is replaced with `pa-btn-split__item` and the original is stashed on the element and restored on the way back, so a `pa-btn--primary` action looks like a primary button in the bar AND like a clean menu row when absorbed. Inner `<span class="pa-btn__icon">` wrappers are also rewritten to `pa-btn-split__item-icon` on absorb (and restored on the way back); without the rewrite the icon column has no width — `.pa-btn-split__item` is no longer a `.pa-btn`, so the `&:has(.pa-btn__icon) .pa-btn__icon` width rule at `_buttons.scss:350` stops matching and absorbed items' labels won't line up with statically-rendered menu items. Static menu items rendered server-side stay BELOW absorbed items via a `firstStaticItem` insertBefore anchor captured at init. Layout contract supplied by `.pa-btn-toolbar`: `min-width: 0; overflow: hidden; flex-shrink: 1` so the row actually shrinks below content (otherwise `scrollWidth > clientWidth` never goes truthful and absorb never fires); children get `flex-shrink: 0` so individual buttons don't collapse into unreadable slivers — the JS moves them into the menu instead. A **one-frame-debounced** `ResizeObserver` drives `relayout()`: restore all candidates → check `scrollWidth > clientWidth` → walk drop order absorbing items until it fits. It observes **the toolbar itself** (catches any change in the space available to it — including the header title being given a larger `min-width` floor, which widens the title and narrows the toolbar *without* changing the header's outer width) **plus a stable width host** — the nearest `.pa-card__header` (or, standalone, the toolbar's parent) whose width tracks the card/window and not our button shuffling, so widening the card re-fires and re-expands even after the toolbar has fully collapsed to a lone toggle (its own box having stopped shrinking). The observer must **not** watch the shrinkable `.pa-card__actions` wrapper: that resizes in response to our own absorb/restore, which fed a nondeterministic feedback storm (the reload-vs-resize hysteresis). Bursts of size changes (ours + real layout) coalesce into one relayout per frame; because relayout always measures from a full restore it is deterministic, so a pass per frame converges cleanly — without the `ResizeObserver` loop-limit suppression that could otherwise freeze a transient state — and resizing back to a previous width reproduces that width's state exactly. `MutationObserver` on `data-pa-absorb-from` lets consumers flip drop direction at runtime. Opt-in diagnostics via `window.PA_BTN_SPLIT_AUTO_ABSORB_DEBUG = true`. Public API `window.PaBtnSplitAutoAbsorb = { init, initAll }` for re-init after dynamic markup injection. **Final collapse stage:** when every sibling is absorbed and the bar *still* overflows (a very narrow host such as a 1/3-width card header), the split button folds its OWN primary action into the menu — inserted as the top item, above absorbed siblings — leaving just the toggle chevron. Without this the primary + toggle spilled past the bar's `overflow: hidden` edge and the toggle became invisible / unclickable. The lone toggle gets a `.pa-btn-split--collapsed` state class so `_buttons.scss` renders it as a standalone fully-rounded button (all-corner radius + no divider border); restoring space pops the primary back before the toggle. Because collapse-to-toggle is meaningful even with no absorbable siblings, an auto-absorb split button with zero siblings now initializes too (previously it bailed early). Demoed in `buttons.mustache` with two resizable test boxes (filled accents + outline accents, both drop directions) and three card-header real-world examples (Dashboard / Migration / Members consoles) where each card's bar collapses independently as the window narrows. Same shape and algorithm as the `pa-overflow` primitive (`_overflow.scss` + `overflow.js`) but ships absorbed items into the host split button's own menu instead of a parallel "more" trigger — kept separate because the auto-absorb mental model (the split button "eats" its neighbours) is the more natural fit for action toolbars. **Placement:** `.pa-btn-toolbar` works standalone in any flex context; in a card header it nests inside `.pa-card__actions` — the canonical header actions slot, same as a plain button row or a `.pa-btn-group` — and `_cards.scss` makes that actions wrapper shrinkable (`min-width: 0`) so the toolbar inside still receives the shrink deficit and the overflow signal fires. (The JS is wrapper-class-agnostic — it reads `splitContainer.parentNode` — so any wrapper supplying the `min-width: 0; overflow: hidden; flex-shrink` contract works.)

### Changed

- **Stat square — tamed the full-size tile so wide / full-width tiles stop reading as oversized banners.** The number ceiling drops from 9.6rem (96px) to 7.2rem (72px) and the symbol ceiling from 4.8rem to 3.6rem; a new `max-height: $stat-square-max-height` (16rem) caps how tall the flex layout can grow. Previously a square used full-width (one per row) instead of in a 1/3 KPI column hit the cqi clamp ceiling and grew into a page-dominating block. cqi scaling and the `min-height` floor are unchanged, so in-grid tiles are visually near-identical.
- **Splitter — drag against a rail'd primary is now asymmetric.** When the user grabs a gutter whose primary neighbour started rail'd, drag direction matters: dragging OUTWARD (the direction that would grow the pane — `primarySign * delta > 0`) releases the rail and the pane follows the cursor; dragging INWARD (into the rail, would shrink the pane further) is fully inert — the rail stays put, the gutter doesn't move, no `applySizes` call, no class flip. Previously `onPointerDown` pre-cleared `isMin[primary]` unconditionally, so the card visually flashed out of its rail state on any pointer movement regardless of direction — for a left-edge rail, a leftward (inward) drag would expand the card before the user could express expand intent in the opposite direction, which read as the splitter "guessing wrong" about the user's intent. Mirrors `svelte-fluentui/MultiSplitter`'s drag-to-be-explicit gate (`primarySign * delta <= 0 → return`). The rail-release path moved out of `onPointerDown` into `onPointerMove`, gated on outward direction + a 2px jitter threshold (`TAP_PX`); from there the existing escape-floor / snap-back-in machinery (`primaryInEscape`, `primaryCanSnap`, `primaryMaxReached`) carries on unchanged.

### Removed

- **Splitter — tap-without-drag on the gutter no longer restores a rail'd primary.** Previously, pressing-and-releasing the gutter without crossing the 2px jitter threshold called `restorePane(primaryIdx)` (the TAP-RESTORE branch in `onPointerUp`). Reported as surprising in `svelte-fluentui`'s port — users expect drag-to-be-explicit and didn't connect "tap the gutter" with the rail-pane body as a restore surface. Restore gestures now: click the rail-pane body, dblclick the gutter, focus the gutter and press `Enter` / `Space`, click any `[data-pa-splitter-toggle]`, or drag the gutter outward past the snap threshold. Demo prose in `splitter.mustache` updated in four places (the Minimize-to-rail card description, its trailing summary, the right-edge minimize variant, and the inline code block listing toggle gestures).

### Fixed

- **Stat square — `pa-stat--warning` number no longer smears into an "ink-blot" halo.** The `.pa-stat__number` shadow stack (two `text-shadow` layers + a `drop-shadow` filter, all black) was tuned for the white-text variants; `pa-stat--warning` is the one square variant with **dark** text on a light amber surface, so the black shadow had no contrast against the dark glyph and bled into a fuzzy dark smudge. The warning variant now overrides `.pa-stat__number` to a single whisper `text-shadow` (`0 1px 1px` at `$opacity-light`) and `filter: none`, dropping the costly drop-shadow layer. Applies to both the classic square and fit mode (both render through `.pa-stat__number`); the white-text variants are untouched.
- **Card header hosting an auto-absorb split-button bar — the title now yields before the bar collapses.** When a `.pa-card__header` contains a `.pa-btn-toolbar`, a long title and the bar previously shared the shrink deficit by proportional `flex-shrink` (both `1`) — weighted by the title's *natural* width — so the bar was allocated less width than its content even while the rendered title truncated and left a visible gap, and `btn-split-auto-absorb.js` folded the whole split button down to a lone toggle with whitespace still on screen. `_cards.scss` now gives the header's title (`> h1`–`h6`, `> .pa-card__title`) a large `flex-shrink` (`9999`) + an `8rem` `min-width` floor when the header contains a `.pa-btn-toolbar` (matched as a descendant, `:has(.pa-btn-toolbar)`, because the toolbar sits one level down inside `.pa-card__actions`), so the title absorbs nearly all the deficit (truncating to the floor) and the toolbar keeps its buttons; siblings only begin folding once the title bottoms out, and the split button's own primary collapses only when the header is genuinely tiny. The hosting `.pa-card__actions` is also made shrinkable (`flex-shrink: 1; min-width: 0`) — it defaults to `flex-shrink: 0`, which would otherwise hold its natural width and starve the overflow signal. Mirrors the existing `:has(> .pa-card__actions--overflow)` title-floor pattern. Consumers can raise the floor per-card with a `minw-*` utility on the title (e.g. `minw-45`), which wins via `!important`.
- **Card header buttons inside an overflow-clipping actions wrapper no longer lose their top/bottom borders.** Header buttons carry a `-0.25rem` block margin (`.pa-card__header .pa-btn`) to keep the header compact. Any actions wrapper that sets `overflow: hidden` for shrink-detection — the auto-absorb `.pa-btn-toolbar` **and** the progressive-overflow `.pa-card__actions--overflow` container — then clipped the part of each button pushed past its content box by that negative margin: the horizontal borders. `_cards.scss` now re-parents the compaction onto those two clipping wrappers (`margin-block: -0.25rem` on the wrapper, `0` on their child `.pa-btn`), so the clip edge lands flush with the button box and the borders survive while the header keeps the exact same height. Scoped under `.pa-card__header`, so a standalone `.pa-btn-toolbar` used outside a card header is untouched.

## [2.9.0-rc03] - 2026-06-20 [PUBLISHED]

### Changed

- **Splitter drag math reworked from boundary-coupling to rebalance-on-drag.** Each gutter `g` now resizes only its PRIMARY neighbour (chosen by edge-closer heuristic — `leftDist = g`, `rightDist = N − 2 − g`, LTR/RTL tiebreaker on ties); the matching opposite delta is absorbed by other panes. Slack distribution uses a hybrid CLASSIC + TUNNEL model: if the immediate adjacent pane on the secondary side is non-rail, only that one absorbs (so dragging gutters in an all-expanded `abcde` layout matches standard splitter intuition — drag `D|E` and only `D` shrinks, `A` / `B` / `C` stay put); if the immediate adjacent pane IS rail, slack tunnels through the rail wall and is absorbed by the contiguous non-rail block beyond (so dragging `A|B` in `AcBcCeDeEc` punches through the `B` rail and shrinks `C` + `D`). Eliminates the "boundary locks when both sides are rail" deadlock from the prior model — drag-from-rail with a railed neighbour now grows the primary by pulling room from the next section.
    - **Why the rebalance model instead of fixing the boundary deadlock in place**: in mixed rail/expanded layouts the boundary-coupled invariant (`sizes[left] + sizes[right]` constant during drag) was the root cause — when both neighbours were railed the sum was locked at `2 × rail` and the gutter physically couldn't move regardless of pointer position. Patching meant special-casing every state combination (one-side-rail, both-rail, primary-vs-secondary-rail, etc.). Rebalance removes the invariant: only the primary changes per drag, slack flows wherever there's headroom.
    - **Why hybrid (classic-then-tunnel) instead of always tunneling**: an earlier "absorb proportionally across every non-rail pane on the secondary side" pass made `D|E` drags in all-expanded layouts shrink `A` and `B` along with `D`, which felt wrong — users expect a gutter to act locally unless a rail wall forces a tunnel. The hybrid restores the classic local feel and only widens the absorber pool when a rail wall is in the way.
- **Middle panes can now minimize too** (previously edge-only). Any pane with `data-pa-splitter-minimize` collapses on toggle / dblclick / drag-snap regardless of position; the rotated rail-title attribute / card-header adaptation works at any index. Edge-only was a constraint of the old single-string `data-pa-splitter-minimize="start|end"` shorthand on the splitter root (which only addressed the two extreme panes); the per-pane marker model has no such limit, and rail titles read fine vertically wherever they land.
- **Snap-into-rail enforces "at least one expanded pane".** Drag-into-rail and toggle / dblclick / `Enter` collapse paths now bail when collapsing would leave `nonMinCount() === 0`. Without this, restore math degenerates (no non-rail pane to pull room from means restored panes get stuck at mins or layouts overflow) and the splitter visually has nothing to drag.
- **`primaryNeighbour(g)` heuristic now drives dblclick / `Enter` / `Space` / `Home` / `End` toggle target.** Previously these picked pane `g` (left neighbour) unconditionally — fine for 2-pane layouts but wrong for N-pane where dblclick on the rightmost gutter should arguably collapse the rightmost pane. The new heuristic returns the edge-closer side (LTR / RTL tiebreaker for middle / even ties), with a fallback to the other neighbour if the primary can't minimize.
- **Splitter padding subtracted from `totalAvailable()`.** Flex children sit inside the splitter's content box but `clientWidth` / `clientHeight` include padding. Without subtracting it, panes' total `flex-basis` overflowed the content area by `2 × padding` and the last pane got clipped by `overflow: hidden`. Visible as the inspector pane's right edge touching the splitter border in the N-pane demo (which uses 0.8rem padding for breathing room around the cards).
- **Sibling gutters no longer light up during a drag.** Previously the splitter `--dragging` modifier carried a `> .pa-splitter__gutter:hover` block that fired on every gutter the cursor crossed over as the user dragged past them. New: only the dragged gutter carries `.pa-splitter__gutter--active` (added in pointerdown, removed in pointerup), and the `--dragging` rule sets `pointer-events: none` on non-active gutters so their `:hover` doesn't fire. Also overrides `:focus-visible` on non-active gutters during drag (a previously-focused gutter would otherwise still render the focus ring identical to the active state). A defensive sweep at pointerdown clears stale `--active` from every gutter in case a prior pointerup didn't fire cleanly (pointer-capture quirks).

### Fixed

- **Rail size resolution now correctly resolves `rem` units in `--pa-splitter-rail-size`.** Previously `parseFloat(getComputedStyle(root).getPropertyValue('--pa-splitter-rail-size'))` returned `4` for the default `4rem` emit and snapped rail panes to 4px-wide strips. Custom-property values come back from `getComputedStyle` un-resolved (literal `"4rem"`, not the px equivalent); rebuilt as a probe element: create a hidden `<div>` with `width: var(--pa-splitter-rail-size, 40px)`, read `offsetWidth`, let the browser do the unit resolution. Three-step fallback chain (attribute → CSS var → literal 40) still applies.
- **`restorePane()` no longer leaves a pane stuck at `mins` when the layout has a gap.** When a prior minimize hit an absorber's `max` cap (e.g. 3-pane setup where pane A's `max=360` couldn't soak up all of pane B's released slack), the layout was left with empty space. Restoring B then only saw "headroom from other panes" (200px from A's `size − mins`) as available room and capped the restored size at `mins[B]` — visible as B coming back at min width even though its remembered `lastNonZero` was much larger. New behaviour: empty space in the layout (`total − sum(sizes)`) is included in the restore budget, so B can reclaim the gap up to its `lastNonZero`. The remaining gap (if any) gets shrunk further as other panes restore.
- **`restorePane()` no longer aggressively soaks up empty space into a neighbour.** Previously after setting `sizes[i] = target`, `clampToConstraints` was called unconditionally — if the new sum was below `total` (gap remained), the loop grew whichever non-pinned pane had headroom to fill it. Visible as "restore one pane, watch a previously-restored sibling suddenly inflate" in N-pane layouts where the gap was bigger than any one pane's `lastNonZero` could reclaim. New: `clampToConstraints` only runs on **overshoot** (`sum > total`); on undershoot the leftover gap stays as empty space and gets consumed naturally as the user restores more panes. Pulls back primary only when absorbers genuinely can't yield enough.
- **Mid-drag snap-into-rail no longer leaves the primary at `mins` width.** After SNAP-INTO-RAIL fired and the user kept dragging in the snap direction (cursor still in the rail zone), the next `processMove` ran through the floor / max clamp with `isMin[primary] = true` but `floor = mins[primary]` — so `newPrimary` got clamped up to `mins[primary]` and the rebalance reflected that, producing a "minimized class on, but size = 180px instead of 40px rail" zombie state. Fix: after the DRAG-OUT-OF-RAIL check, if `isMin[primary]` is still true, return early. Drag in the rail zone is a no-op for the current frame; primary stays at `railSizePx`.
- **`lastNonZero[i]` no longer corrupted during drag-from-rail.** `applySizes` previously updated `lastNonZero[i] = sizes[i]` for every non-minimized pane — during a drag where the primary started rail and was being slowly grown out, the intermediate sub-`mins` sizes overwrote the pane's real remembered size with rail-width. Subsequent restores then fell back to bare `mins`. Now guarded by `sizes[i] >= mins[i] && !isMin[i]`: rail values and below-mins intermediate values are no longer persisted as "last expanded size".
- **CLAMP-TO-MIN at pointerup rebalanced via a single `clampToConstraints` pass.** Previously two sequential per-side clamps could feed off each other when both sides started rail — the second clamp's deficit math saw the first clamp's already-shrunk neighbour and produced negative pane sizes (visible in logs as `sizes: [-80, ...]`). New: when any non-rail pane is below its `mins`, force them all up to `mins` first, then run `clampToConstraints` once to redistribute the deficit across all non-minimized panes.
- **Storage `lasts` filtered to values strictly above `mins[i]`.** A buggy intermediate state could persist the rail size (`40`) as a pane's "last expanded size"; on subsequent reload the filter rejects it and falls back to the attribute-derived default (set in pass 2 of init). Without this, panes restored from such a state went to rail-mins instead of their real previous size.
- **rAF init guard: if every pane is saved as minimized, force pane 0 expanded.** The "at least one expanded pane" invariant runs on saved state too — a blob written before the invariant existed (or from a corrupted localStorage) could claim every pane is railed; the splitter then has nothing to drag and restores from rail-click fail to find room. Pane 0 wins by convention.
- **Drag-from-rail-both-sides drag → release now restores the primary** instead of leaving the splitter in its drag-start state. When both immediate neighbours of a gutter start at rail, the rebalance model still can't move anything (no non-rail absorbers exist between them) — but the drag is evidence of intent. New `RAIL-RAIL drag` branch at pointerup detects `everMoved && primaryStartedMin && sizes[primary] ~= rail` and calls `restorePane(primaryNeighbour(g))`, which pulls room proportionally from any non-rail panes elsewhere in the splitter.

### Internal

- **`computeAbsorbers(g, primary)` and `pinnedForAbsorbers(absorbers)` helpers** centralise the rebalance-on-drag slack distribution rule. `computeAbsorbers` walks outward from the gutter on the secondary side (right of `g+1` when primary is left, left of `g` when primary is right) and returns either the immediate adjacent non-rail pane (CLASSIC mode) or — if the immediate is rail — the contiguous non-rail block beyond the rail wall (TUNNEL mode). `pinnedForAbsorbers` produces the `pinned` array `clampToConstraints` needs: every index pinned except the listed absorbers. Used in `processMove`'s rebalance path, the SNAP-INTO-RAIL slack-give-back path, and `setPrimaryTo` for keyboard.
- **`shiftPrimary(g, gutterDelta)` and `setPrimaryTo(g, newSize)` helpers** replace the keyboard handler's `shiftBoundary` calls — `←/↑`, `→/↓`, `Home`, `End` all operate on the primary now (matching the drag model) instead of pane `g` unconditionally. `setPrimaryTo` runs the same "set primary, distribute slack to absorbers, post-check overshoot to pull primary back" pipeline as the rAF drag path so keyboard nudges and pointer drags produce identical end states for the same target size.
- **Comprehensive structured logging at key state transitions** — pointerdown, SNAP-INTO-RAIL, DRAG-OUT-OF-RAIL, pointerup, TAP-RESTORE, RAIL-RAIL drag, RAIL-STAYED, CLAMP-TO-MIN, `applySizes` class flips, minimizePane, restorePane, rAF init, ResizeObserver fire. Bucket-throttled `move` logs (only fire on 25%-of-total bucket transitions) keep the hot drag loop from flooding the console. No opt-in flag — plain `console.log` prefixed `[pa-splitter:<id>]`. (Previously gated on `window.PA_SPLITTER_DEBUG = true`; the flag complicated reproduction reports — users would forget to set it, and post-hoc enabling required a reload.)
- **`applySizes` only logs on class-flip** (a pane crossing `pa-splitter__pane--minimized` on / off). Per-frame applySizes-during-drag is the noisiest event; throttling to the rail / expanded transition catches every UX-relevant change while suppressing the bucket-by-bucket flood. The full per-pane breakdown (`sizes`, `isMin`, `classDOM`, `classChanged`) is still included on every emitted line.
- **`restorePane` log now reports `deficit` reflecting the actual restored amount.** Previously the log captured `deficit = target − sizes[i]` BEFORE the `target = max(target, mins[i])` floor was applied — so a 120px restore with `target=240` floored from `lastNonZero=180` logged `deficit: 0` despite actually moving the pane by 60px. Reordered so the floor runs first.

## [2.9.0-rc02] - 2026-06-19 [PUBLISHED]

### Added

- **`.pa-splitter` — resizable container (2-pane shorthand + N-pane generic) with optional collapse-to-rail.** Vanilla JS + SCSS, no dependencies. Lives in `core-components/_splitter.scss`, `src/js/splitter.js`, snippet at `snippets/splitter.html`, demo at `/components/splitter`.
    - **Two orientations**: `pa-splitter--horizontal` (side-by-side panes, vertical gutter) and `pa-splitter--vertical` (stacked panes, horizontal gutter). Sizing model is single-source-of-truth — only the start pane carries an explicit `flex-basis` (set inline as `<Npx>` by the JS), the end pane is `flex: 1 1 0` and fills the remainder. Avoids the "both sides resist" jitter that happens when both panes have explicit sizes during window resize, and keeps the storage shape simple (one number).
    - **Constraints + persistence**: `data-pa-splitter-min-start` / `-max-start` accept `px` or `%`. `data-pa-splitter-default` sets initial size when no saved state. `data-pa-splitter-id` enables persistence to `localStorage` under `pa-splitter:<id>`, shape `{ size, last, minimized }`.
    - **Drag with hysteresis, `gap`-aware**: pointer-event-based drag (single code path for mouse / touch / pen via `setPointerCapture`). Clamps requested size to `[min, max]` — including negative requests from drag-past-origin (a clamp bug fixed mid-development). Native flexbox `gap` on the splitter root is read from `getComputedStyle` and subtracted (`2 × gap`) from available space so percent constraints stay accurate when there's breathing room around the gutter.
    - **Minimize-to-rail (opt-in, both sides)**: `data-pa-splitter-minimize="start" | "end"` converts the collapse action into "shrink to a thin rail at the named edge" instead of "vanish to 0". For end-side, the JS pushes the start pane to `total − rail` so the `flex: 1` end pane shrinks to exactly the rail width — same data model, no special-casing. Rail width via `data-pa-splitter-rail-size` (default 40px).
    - **Drag-into-minimize**: dragging the gutter past the minimized side's `min` keeps the pane pinned to `min` (the deadband — pointer keeps moving, pane stays put); only when the requested width drops below the snap threshold — `max(min × 0.40, rail × 1.5)`, configurable via `data-pa-splitter-minimize-threshold` — does it commit to rail. Dragging back outward across the same threshold pops the pane back to `min`. Default 0.40 (was 0.75 at first cut, lowered to make the snap feel less aggressive — user has to drag deeper to clearly signal intent). The `rail × 1.5` floor matters when `min` is small or unset, otherwise the snap point could land below rail and never trigger.
    - **Card header rail rendering**: the minimized pane gets `pa-splitter__pane--minimized`, which rotates its `.pa-card__header` to `writing-mode: sideways-rl` (text reads top-to-bottom; head-tilt right), hides `.pa-card__body` / `__footer`, hides interactive controls inside the header (buttons / inputs — sideways buttons look wrong), and resets `<i>` / `<svg>` to `writing-mode: initial` so icons stay upright while the title text rotates. Optional `pa-splitter--minimize-mirror` modifier applies `transform: scale(-1, -1)` to the heading element (`:is(h1…h6)` inside `pa-card__title`) for the bottom-to-top reading direction without affecting padding, alignment, or hidden actions.
    - **Restore paths**: click anywhere on the rail (the minimized pane), press the gutter, click any `[data-pa-splitter-toggle]` element (delegation scoped via `closest('[data-pa-splitter]')` so nested splitters don't fire each other's toggles), double-click the gutter, focus the gutter and hit `Enter` / `Space`, or drag the gutter outward across the threshold.
    - **Keyboard a11y**: gutter is focusable with `role="separator"`, `aria-orientation="vertical|horizontal"`, live `aria-valuenow/-min/-max` updated on every change. `←/↑` shrink (by `data-pa-splitter-step` px, default 10), `→/↓` grow, `Home`/`End` jump to min/max, `Enter`/`Space` toggle collapse.
    - **Container resize re-clamp**: `ResizeObserver` on the splitter root re-applies `currentSize` to the new constraints when the parent grows or shrinks — keeps percent-based mins / maxes valid. Skips re-clamp when minimized.
    - **CSS customisation**: `--pa-splitter-gutter-size` CSS custom property for per-instance gutter thickness override (default 6px). SCSS variables in `variables/_components.scss` cover gutter colours, grip thickness / length / colour, focus ring, transition, and rail size (`$splitter-rail-size`, default 4rem = 40px).
    - **Public JS API** (`window.PaSplitter`): `init(el)` idempotent single-element init and `initAll(root?)` for sweeping a subtree — both safe to call after inserting splitters dynamically. Opt-in diagnostic logging via `window.PA_SPLITTER_DEBUG = true` before reload (prefixed `[pa-splitter:<id>]` per instance).
    - **N-pane mode (N ≥ 2) with per-pane constraints.** `init()` is now a dispatcher: the legacy 2-pane path (selected by `pane--start` + `pane--end` + exactly one gutter) is preserved byte-identical for backwards compat with 2.9.0-rc01; everything else (3+ panes, or 2 panes without the start/end modifiers) goes through a new `initNPane()`. Per-pane API: `data-pa-splitter-size="240px|30%"` (initial size — unsized panes share leftover equally, or the last pane absorbs if all are sized), `-min` / `-max` for per-pane clamps, `data-pa-splitter-minimize` as a presence marker. Only the first and last panes honour the minimize marker — middle-pane rail rotation has nowhere visually clean to dock. Per-pane state lives in parallel arrays (`sizes[]`, `mins[]`, `maxes[]`, `canMin[]`, `lastNonZero[]`, `isMin[]`) so the hot drag loop avoids per-frame object churn.
        - **Drag math is per-gutter, stop-at-min** — each gutter `g` only ever moves panes `g` and `g+1` (no cascade past the immediate neighbours; Split.js basic-mode semantics). Each side clamps to its own `[min, max]` and the clamped value reflects back into the other side so the boundary doesn't drift past the wall. Drag-into-minimize fires on either neighbour: if pane g (or g+1) is minimizable and the requested size drops below `max(min × ratio, rail × 1.5)`, it snaps to rail and gives the slack to its neighbour. Dragging back outward across the same threshold pops it back to its remembered size.
        - **Container resize re-distributes proportionally.** `ResizeObserver` tracks the available total and scales all unminimized pane sizes by `newTotal / oldTotal`, then `clampToConstraints` re-clamps each to `[min, max]` and iteratively redistributes any shortfall/excess to unclamped panes proportionally (converges in ≤ N passes). Minimized panes stay pinned at rail.
        - **Storage shape is versioned** (`{ v: 2, sizes: [...], lasts: [...], minimized: [...] }`) under the same `pa-splitter:<id>` key — 2-pane and N-pane never share an id in practice, and a hard mismatch (wrong N) falls through to the initial-size resolution instead of throwing.
        - **Toggle delegation finds the enclosing pane.** `[data-pa-splitter-toggle]` clicks bubble up to the splitter root, which locates the click via `closest('.pa-splitter__pane')` and toggles that pane's minimize state (no-op if the pane isn't in `canMin`). Click on a minimized rail also restores. Markup validation up front rejects splitters whose pane/gutter children don't alternate cleanly — silent partial inits would have been a debugging nightmare.
    - **Demo** has 7 live examples: horizontal split (sidebar + content), vertical split (editor + console), spaced cards (gap + custom gutter), minimize-to-rail-start (file explorer + editor with full BEM card markup `pa-card__title` / `__title-icon` / `__title-text` / `__actions` + interactive `pa-splitter--minimize-mirror` toggle), minimize-to-rail-end (editor + inspector — right-edge rail pattern), configurable N-pane picker (3–6 panes via `<select>`, rebuilt dynamically via `PaSplitter.init()` on change, per-N storage id so each count remembers its own layout, and the selected count itself persists under `pa-splitter:multi-pane-count` so reload restores both), persistence reset button. Plus markup / data-attrs / keyboard / JS API reference cards (now with separate sections for legacy-2-pane vs N-pane attributes).

- **`pa-card__actions--overflow` — JS-driven progressive collapse into a "..." menu.** Complementary to `--responsive` (all-or-nothing single threshold) — this variant uses a `ResizeObserver` on both the actions wrapper and its parent header and moves buttons one at a time into an overflow menu as space shrinks. Lives in `packages/core/src/js/card-actions-overflow.js` (vanilla IIFE, auto-init on `.pa-card__actions--overflow` at `DOMContentLoaded`, public API `window.PaCardActionsOverflow.{init, initAll}`, opt-in diagnostics via `window.PA_CARD_ACTIONS_OVERFLOW_DEBUG = true`).
    - **Algorithm**: trust the browser. On every resize: restore all items into the wrapper in DOM order, check `wrapper.scrollWidth > wrapper.clientWidth`, then walk drop order and move items into the menu one by one until the overflow signal clears. No cached width math — the no-overflow / overflow flip is what the browser actually rendered. Insists on `min-width: 0; overflow: hidden; flex-shrink: 1` on the wrapper (set in SCSS for `.pa-card__header .pa-card__actions--overflow`, overriding the default `flex-shrink: 0` from the surrounding `.pa-card__actions` rule at the same `(0,2,0)` specificity) so the wrapper actually shrinks below content and the overflow signal becomes truthful. Without that override, `scrollWidth` and `clientWidth` always match and nothing collapses.
    - **Drop direction**: `data-pa-actions-overflow-from="end"` (default — rightmost drops first, matching primary-on-right admin layouts) or `"start"` (leftmost drops first, matching Bootstrap-style primary-on-left toolbars). Tiebreaker among equal priorities. Flips at runtime via a `MutationObserver` so a settings toggle / theme swap can reconfigure without re-init.
    - **Priority**: `data-pa-actions-priority="N"` per button — highest priority stays longest. Pin a primary action by setting it to e.g. `10` while leaving others at the default `0`.
    - **Menu reuses `pa-btn-split__menu`** (one menu styling source across split-button and overflow menu): the JS creates `<div class="pa-btn-split__menu"><div class="pa-btn-split__menu-inner">…</div></div>` on `<body>`, toggles `pa-btn-split__menu--open` on open / close. When an item moves into the menu, its original `className` is stashed on the element itself (`__paOverflowOrigClass`) and replaced with just `pa-btn-split__item` so it adopts the existing split-button row styling automatically; restoring puts the original classes back unchanged. Initial implementation had a parallel `pa-card__actions-overflow-menu` selector with ~50 lines of duplicated SCSS — that was dropped during refactor.
    - **Positioning via Floating UI** (`window.FloatingUIDOM`, already loaded for split-button): `computePosition` + `offset(4)` + `flip()` + `shift({ padding: 8 })` + `autoUpdate` keeps the menu anchored to the trigger through scroll / resize / corner-clamping without our own listeners. Falls back to a hand-rolled `getBoundingClientRect` + `position: fixed; right: …` positioner if `FloatingUIDOM` isn't loaded (one less hard dependency for embedded use).
    - **Auto-close on resize**: any wrapper-or-parent resize closes an open menu (the `ResizeObserver` callback runs `closeMenu()` before relayout). Also closes when the trigger goes `display: none` — covered by the splitter rail mode (`.pa-splitter__pane--minimized .pa-btn { display: none }`) so dragging a pane to rail no longer leaves the menu detached on screen. The Floating UI `autoUpdate` callback also has an `offsetParent === null` guard as a second line of defence.
    - **Title floor in overflow mode**: `.pa-card__header:has(> .pa-card__actions--overflow) > .pa-card__title { min-width: 6rem }` — without it, `flex: 1; min-width: 0` lets the title get squeezed to 0 once actions start absorbing all available space; the floor keeps at least icon + a few characters + ellipsis visible. Scoped via `:has()` so ordinary cards stay at `min-width: 0` and their full ellipsis range.
    - **Restoration preserves DOM order**: `relayout` step-1 always calls `root.insertBefore(item, trigger)` for every item (not just items currently in the menu); `insertBefore` moves an already-attached node, so iterating in DOM-index order places everything back in the original positions. The previous "skip if already in root" guard had a bug where dropping-from-start and then widening landed restored items at the *end* of the row (e.g. `Format Refresh Export Run Save` instead of `Save Format Refresh Export Run`).
    - **Wired into the splitter demo (Demo 4b)** — an Editor card with five labelled actions (Save / Format / Refresh / Export / Run, Run priority 10) inside a splitter with `data-pa-splitter-minimize="start"`. Drag the gutter to shrink: first the four lower-priority buttons drop into "..." one at a time (direction controlled by the live "drop from start" checkbox above the demo); drag past the splitter's min and the whole card snaps to rail, hiding the trigger and auto-closing any open menu.

- **`pa-card__actions--responsive` — CSS-only collapse to a split button when the header runs out of space.** Render both the spread button list (`pa-card__actions-full`) and a collapsed split-button form (`pa-card__actions-collapsed`, hosting a `pa-btn-split`); a container query on the card header swaps which is visible. Container context is wired up via `&__header:has(> .pa-card__actions--responsive)` (Baseline 2023 `:has()`) — authors only mark the actions wrapper, no extra modifier on the header. Threshold lives in a single SCSS variable (`$card-actions-collapse-at`, default `28rem` ≈ 280px) and is interpolated into the `@container` rule with `#{…}` (Sass's auto-interpolation works for `@media` but not `@container`). Markup carries both forms so it stays CSS-only — no `ResizeObserver`, no layout reads — but the trade-off is duplicated action data in the DOM (one set of buttons inline, one set as menu items). Wired into the splitter demo's Minimize-to-Rail example so dragging the file-explorer pane wider shrinks the Editor card past the threshold and watching the actions snap from 3-button row → single split button.

- **`pa-btn--ghost` variant defined in core.** The class was referenced in 3 demo files (`alerts.mustache`, `notifications.mustache`, `splitter.mustache`) for inline icon-only action buttons (dismiss, mark-as-read, delete, minimize) but no rule existed anywhere in `packages/core/src/scss` — every existing usage was silently rendering as base `.pa-btn` with no variant styling. Now defined in `_buttons.scss` next to `--secondary`: transparent background, transparent border, `var(--pa-text-secondary)` text colour, hover uses the existing `var(--pa-surface-hover)` token (4% text-tint) and snaps text to full `--pa-text-color-1`. No new tokens introduced — all wired to tokens that already exist on `:root`. Themes need a rebuild to see the new styling; with the unthemed `main.css` the variant takes effect immediately.

### Changed

- **Splitter rail mode decoupled from `.pa-card` internals** (independent design review P1). The previous `_splitter.scss` knew about `pa-card__header` / `__body` / `__footer` / `pa-btn` / `pa-btn-group` / bare `button` / `input` — a laundry list that would grow every time a new control class landed, same architectural smell as the "no cross-referencing variables" rule one layer up. New contract: `_splitter.scss` only provides a generic rotation hook — any element marked `[data-pa-splitter-rail-title]` inside a `.pa-splitter__pane--minimized` rotates to `writing-mode: sideways-rl` (icons / SVG reset to `initial`), and the `--minimize-mirror` modifier flips headings inside that same attribute 180°. Card-specific adaptation (hide body + footer, promote header to fill the rail, hide header controls, vertically align the icon between expanded and minimized states) moved into `_cards.scss` keyed off `.pa-splitter__pane--minimized > .pa-card`. **No demo or snippet markup change for cards** — the card SCSS handles its own adaptation against the splitter's `__pane--minimized` class. The `[data-pa-splitter-rail-title]` hook is the contract for non-card content (plain divs, custom panels) inside minimizable panes.

- **Single splitter init path — legacy 2-pane shorthand normalized into per-pane attributes** (review P5). The dispatcher between `initLegacyTwoPane` and `initNPane` (and ~350 LOC of duplicated `parseSize` / pointer / persistence / ARIA logic) is gone. `init()` now calls `normalizeLegacyMarkup(root)` which translates the root-level `data-pa-splitter-min-start` / `-max-start` / `-default` onto the start pane and the `-minimize="start|end"` value into a presence marker on the named pane, then hands off to `initNPane`. Same external contract for consumers — both legacy and N-pane markup keep working — but two parallel drag-math implementations that would have drifted are collapsed to one. Splitter JS dropped from 983 LOC to 716 (-267).

- **Drag-to-minimize snap threshold rebased on the drag-start size** (review P6). Previous formula `Math.max(mins[i] * ratio, railSizePx * 1.5)` was a no-op for the common case (panes without an explicit `min` — the `railSizePx * 1.5` floor always won and the configured `minimize-threshold` ratio did nothing). New: `Math.max(railSizePx * 1.5, railSizePx + (anchor - railSizePx) * ratio)` where `anchor` is `dragStartLeft` / `dragStartRight` for drag-in, and `lastNonZero[i]` for drag-out. At default ratio 0.40 with a 280px pane and 40px rail, the snap point now lands at `40 + 240 * 0.40 = 136px` — meaningful regardless of whether `min` is set. The rail × 1.5 floor still guards against insta-snap when starting near the rail.

- **Rail size resolution gains a `--pa-splitter-rail-size` CSS variable layer** (review P2). Previously the SCSS variable `$splitter-rail-size` (4rem) and the JS literal `40px` were unreconciled — themes could change the SCSS var and the JS would happily ignore them. Now `_splitter.scss` emits `--pa-splitter-rail-size: #{$splitter-rail-size}` at `:root`, and the JS reads it via `getComputedStyle(root).getPropertyValue('--pa-splitter-rail-size')` as part of a three-step fallback chain: `data-pa-splitter-rail-size` attribute (per-instance) → `--pa-splitter-rail-size` CSS var (theme / inline override) → literal `40` (last-resort). Setting `--pa-splitter-rail-size` on `:root` (or per-instance via inline style) now actually moves the rail and the JS agrees.

### Fixed

- **Pointer-move handler now rAF-throttled** (review P3). Previously every `pointermove` triggered `applySize` → `flex-basis` write → reflow, and on a 120 Hz trackpad with a chart canvas or iframe in a pane that's measurable jank. New: the handler stores the latest `clientCoord` into `pendingMove` and schedules a `requestAnimationFrame` only if one isn't already pending. Each frame coalesces all events into a single `applySizes` call. Tracking the bare coord (not the full event object) keeps the closure size small.

- **Splitter storage recovery now forgiving on N-mismatch** (review P4). Previously when `saved.sizes.length !== N` the entire saved layout was discarded — removing one pane from markup wiped every other pane's remembered size. New three-pass init: pass 1 assigns explicit sizes from `data-pa-splitter-size`, pass 2 distributes leftover to unspecified panes, pass 3 overlays saved state on matching-index slots, leaving the rest at their attribute-derived defaults. Survives markup drift cheaply (adding / removing a pane only affects that pane). The legacy 2-pane storage shape (`{ size, last, minimized }` — no `v` field) is also auto-migrated when the splitter has exactly 2 panes, so consumers on 2.9.0-rc01 / 2.9.0-rc02-pre with persisted sidebar layouts get a clean upgrade without a storage reset.

- **Drag-out-of-rail now allows manual sizing instead of insta-restoring.** Previously, pressing the gutter while a neighbour pane was railed called `restorePane` immediately and returned — the pane jumped back to its remembered size before the user could move the pointer. Reported as surprising: "I drag the splitter but that immediately expands the card even though I still hold my mouse button down". Reworked so pointerdown on the gutter while a neighbour is railed now starts a real drag from rail width; the pane grows smoothly with the cursor (effective floor during drag is `railSizePx`, not `mins[i]`, so the pane can move incrementally past rail before crossing `mins[i]`). On pointerup, if the final size landed below `mins[i]`, the pane snaps up to `mins[i]` and the deficit is taken from the neighbour. Tap-without-drag (pointer movement under a 2px jitter threshold) still restores via the same path as clicking the rail pane — preserves the existing "click rail to restore" affordance. Drag-into-rail snap is also suppressed on a side that started this drag from rail, so pulling a railed pane out and back doesn't re-snap mid-drag.

### Internal

- **`CLAUDE.md` — new "Card header icon alignment (FA glyph metrics)" subsection** in the Design System chapter, documenting why mathematically-centered Font Awesome glyphs look ~1px too high (glyphs sit slightly below the font-box center) and pointing at `$card-header-padding-v` + 0.05rem as the correct symmetric knob for pixel-perfect alignment — not magic per-child `padding-top` hacks. Surfaced during splitter rail-mode alignment debugging where the icon visibly "jumped" 1px between expanded and minimized states; the splitter SCSS itself uses `calc((#{$card-header-min-height} − #{$font-size-base}) / 2 − #{$card-header-padding-v})` to derive the title's rail-mode offset from the same vars, so it auto-tracks any future header-metric tuning.

## [2.9.0-rc01] - 2026-06-11 [PUBLISHED]

### Added

- **`$theme-color-scheme` SCSS variable + `color-scheme` emit from `output-pa-css-variables`**. Themes can now signal their colour scheme to the browser so native UA elements (scrollbars, form controls, `<input type="date">`, etc.) and the CSS `light-dark()` function resolve correctly. Previously themes applied dark palettes via `--pa-*` / `--base-*` overrides alone, so the browser still saw the host page as `color-scheme: normal` (effectively light) — embedded web components (`web-multiselect`, `web-daterangepicker`) using `light-dark()` for adaptive palettes silently picked the light value on dark themes, native scrollbars stayed white, and any consumer CSS using `light-dark()` ignored the theme's mode.
    - **New `$theme-color-scheme: light !default;`** in `variables/_system.scss`. Themes override to `dark` (always-dark themes) or `light dark` (let OS preference decide) before `@import variables/index`. Per-mode overrides (`.pa-mode-dark { color-scheme: dark; }`) take precedence via the cascade for dual-mode themes.
    - **`output-pa-css-variables` mixin now emits `color-scheme: #{$theme-color-scheme};`** as its first declaration. Themes that already call this mixin from their `:root` block get the signal automatically; dual-mode themes add a one-line `color-scheme: dark;` to their `.pa-mode-dark` block to flip on toggle.
    - **Unthemed `dist/css/main.css` now ships `color-scheme: light` at `:root`** (emitted by the same mixin via `main.scss`). Previously implicit `normal` (effectively light); now explicit. No visual regression — consumers who declare their own `color-scheme` on `:root` after loading our CSS still win via the cascade.
    - **Migration for theme authors**: see `_base-css-variables.scss` doc comment + the `pure-admin-themes` 2.9.0 changelog entry for the per-theme pattern. Consumers using published themes get the fix automatically when they bump to themes 2.9.0.

### Removed

- **Six `--base-*` legacy aliases dropped from the framework's emitted CSS variable surface** — `--base-surface-1`, `--base-surface-2`, `--base-surface-3`, `--base-surface-inverse`, `--base-primary-bg`, `--base-primary-bg-hover`. These were marked "Legacy aliases (backward compatibility)" in `variables/_base.scss` and aliased to existing semantic tokens (`--base-main-bg` / `--base-page-bg` / `--base-subtle-bg` / `--base-inverse-bg`). They added taxonomy duplication ("is this `--base-main-bg` or `--base-surface-1`? which should I use?") with no behavioural difference, and `--base-primary-bg` specifically caused the web-multiselect dark-mode hover bug below.
    - **The web-multiselect dark-mode hover regression that motivated this.** `web-multiselect@1.10.0` introduced a smart `--ms-primary-bg` fallback chain: `var(--base-primary-bg, color-mix(in srgb, var(--ms-text-color-1) 8%, var(--base-main-bg, light-dark(#ffffff, #1a1a1a))))`. The chain expects either: a theme-provided `--base-primary-bg` distinct from main-bg (gives an explicit hover surface), OR no `--base-primary-bg` at all (falls back to a 8% text-tint of main-bg, automatically light/dark-adaptive via `--ms-text-color-1`). Pure-admin's framework emitted `--base-primary-bg` baked at SCSS compile time to literal `#ffffff` — which short-circuited the multiselect's smart fallback and pinned option hover to white, invisible on dark themes. Removing the framework emit lets the multiselect's fallback fire, producing a visible hover that auto-flips with mode.
    - **Why we didn't just patch `--base-primary-bg` to track `--base-main-bg` via `var()`.** Initial attempt: change the emit from `--base-primary-bg: #{$base-primary-bg};` (compile-time bake) to `--base-primary-bg: var(--base-main-bg);` (runtime reference). This still failed in dark mode because CSS custom property substitution bakes at the *defining* element. The `:root` rule's `var(--base-main-bg)` substituted using `:root`'s `--base-main-bg` (light white), and that frozen value inherited down to `<body class="pa-mode-dark">` unchanged — body's local `--base-main-bg: #242424` override didn't trigger re-substitution because no rule re-declared `--base-primary-bg` at body. Same trap the existing `--pa-text-strong` tier tokens hit (and document at the top of `_base-css-variables.scss`). Re-emitting `--base-primary-bg` at `:root, .pa-mode-light, .pa-mode-dark` *would* have worked, but at that point we're emitting a variable that's exactly equivalent to `--base-main-bg` — which is the duplication-without-purpose that motivated the removal in the first place. Dropping the alias is the cleaner conclusion.
    - **Internal framework SCSS chain migrated to semantic names**: `_colors.scss` and `_base.scss` references to `$base-surface-1` / `-2` / `-3` / `-inverse` were renamed to `$base-main-bg` / `-page-bg` / `-subtle-bg` / `-inverse-bg` respectively (~20 references across `$card-bg`, `$header-bg`, `$sidebar-bg`, `$table-bg`, `$btn-light-bg`, `$base-input-bg`, `$base-dropdown-bg`, `$base-tooltip-bg`, etc.). No behavioural change — the aliases were `:default` synonyms — just a tighter taxonomy.
    - **Theme migration (handled in `pure-admin-themes` 2.9.0)**: 10 of 15 themes had `--base-surface-*` declarations in their dark/light mode override blocks; all were mechanically renamed to the matching `--base-*-bg` semantic name. Themes that previously set both the semantic name AND the alias to the same value (e.g., express had `--base-main-bg: $dark-card;` and `--base-surface-1: $dark-card;`) now emit two identical lines after the rename — harmless duplicates that can be deduplicated as a follow-up cleanup.
    - **Migration for external consumers** (apps consuming pure-admin directly, not through our themes): if you used `var(--base-surface-1)` / `var(--base-surface-2)` / `var(--base-surface-3)` / `var(--base-surface-inverse)` / `var(--base-primary-bg)` / `var(--base-primary-bg-hover)` in your own CSS, rename to `var(--base-main-bg)` / `var(--base-page-bg)` / `var(--base-subtle-bg)` / `var(--base-inverse-bg)` / `var(--base-main-bg)` / (no direct replacement — pick from `--base-hover-bg` for hover-tinted surface or compose with `color-mix` for a darker variant). If you overrode `$base-surface-*` / `$base-primary-bg*` in custom SCSS, same rename applies to the SCSS variable names.

### Fixed

- **Profile panel role chip migrated to standard `.pa-badge` component (markup-breaking for the role element).** The role indicator previously had its own bespoke `.pa-profile-panel__role` class that hardcoded padding, font-size, uppercase + letter-spacing, and pointed `background-color` / `color` at `--pa-header-profile-name-color`. That token is sized for the header bg (e.g. Express's black-on-yellow) — when the profile panel opened with a dark body, the badge rendered as black-on-dark and went invisible. Rather than rewire the custom styles to mode-adaptive tokens, the chip was migrated to the framework's existing `.pa-badge` component (which themes already tune for both modes via `--pa-btn-secondary-bg` / `-text`). Snippet markup updated: `<span class="pa-profile-panel__role">Administrator</span>` → `<span class="pa-badge">Administrator</span>`. Demo layout markup updated likewise. The `.pa-profile-panel__role` SCSS rule is gone; the `$profile-role-letter-spacing` variable is removed (no remaining consumers). Visual change vs the old design: no more forced uppercase + letter-spacing (modern role chips don't shout); the chip now uses the theme's secondary badge styling, which is more prominent than the previous subtle tint. Add `.pa-badge--light` instead for a quieter chip, or `.pa-badge--primary` / `--info` / `--success` / `--warning` / `--danger` for variants. Pre-existing dark-mode visibility bug, surfaced during 2.9.0 QA; rolled into 2.9.0 as a markup-breaking change because the right fix was a component swap rather than a colour tweak.

- **Coloured card variants no longer leak white pixels around the header chrome.** Two independent root causes both rendered as "light artifact next to the variant colour" on `.pa-card--primary` / `--success` / `--warning` / `--danger` / `--color-1` through `--color-9` — addressed together because they only become visible when the surrounding chrome is coloured (default cards have light-on-light bg/border, masking both).
    - **Cause 1 — corner-radius mismatch at the header's TOP corners.** `.pa-card__header` carried its own `border-top-left-radius: 8px` + `border-top-right-radius: 8px`, but the card's *effective inner* radius (where children clip against the card's `overflow: hidden`) is ~7px after subtracting the 1px outer border. The header's 8px corner curved slightly more than the card's 7px inner corner, exposing a thin triangular slice of card background (`var(--pa-card-bg)`, typically white) at each top corner — a clear white sliver against the variant colour, especially obvious on `--danger` with its high-contrast red. **Fix:** dropped both `border-top-*-radius` declarations from `.pa-card__header`. The card's `overflow: hidden` clips the header's square top corners to the card's rounded outer shape automatically, so no header-side radius is needed and there's no inner/outer mismatch to expose. Consumers who remove `overflow: hidden` from `.pa-card` (uncommon — would also affect rounded-corner clipping of body content) would now see square top corners on the header; no migration needed for the default case.
    - **Cause 2 — gray hairline along the header's BOTTOM edge.** `.pa-card__header`'s `border-bottom: 1px solid var(--pa-border-color)` is the header/body divider, appropriate for default cards where header bg (light gray) sits on body bg (white) and the hairline visually separates them. On coloured variants the header bg is the variant colour but the bottom border stayed light-gray, reading as a visible horizontal strip between the coloured header and the white body. **Fix:** each coloured variant block (`&--primary`, `&--success`, `&--warning`, `&--danger`, and the `@for` loop emitting `&--color-1` through `&--color-9`) now overrides `border-bottom-color` on its `.pa-card__header` to match the variant's background (`var(--pa-accent)` / `var(--pa-success-bg)` / `var(--pa-warning-bg)` / `var(--pa-danger-bg)` / `var(--pa-color-#{$i})`). The 1px line is now the same colour as the header bg above and the card's outer border on the sides — visually merges. Not collapsed via `border-bottom: none` because that would shrink the header by 1px and shift layout vs default cards; not set to `transparent` because that would let the card body bg (white) show through the 1px slot, reproducing the same visible strip in inverted form.

### Internal

- **Dockerfile build stage now builds the embedded Svelte treeview demo bundle.** Previously the runtime container's `/components/svelte-treeview` page 404'd on `/svelte-apps/treeview/dist/treeview-app.{js,css}` because `demo/svelte-apps/treeview/` isn't a workspace member (it's a private Svelte 5 + Vite IIFE with its own `package-lock.json`), so the top-level `npm ci` didn't reach it. Build stage now runs `npm ci && npm run build && rm -rf node_modules` inside that directory, producing the bundle for the runtime layer to serve without bloating it with the build-time dev deps. No effect on the published npm package — purely demo-container infra.

- **Removed stray `packages/core/src/scss/.claude/settings.local.json`** that had been silently shipping in the npm tarball since December 2024 (a Claude Code permissions file accidentally tracked inside a published source path). Added `packages/core/.gitignore` with `**/.claude/` to prevent recurrence. Tarball is now 126 files (down from 127); cleanup landed inside the v2.9.0-rc01 release commit (`11bd715`).

## [2.8.0] - 2026-05-28 [PUBLISHED]

### Changed

- **CSS variable defaults now emitted at `:root` in the bundled `dist/css/main.css`**. Previously the `--pa-*` and `--base-*` tokens were only emitted by themes via the `output-pa-css-variables` / `output-base-css-variables` mixins. Consumers importing `@keenmate/pure-admin-core/css` standalone — or any page before its theme stylesheet finished loading — had `var(--pa-positive)` / `--pa-success-bg` / `--base-accent-color` / etc. resolve to invalid values, causing KPI sparklines and deltas to render near-black via inherited text colour, and web components (multiselect, daterangepicker) to fall back to hardcoded literals. The unthemed bundle now ships a complete neutral default for every themable token, so the lib works standalone and the FOUC window before a theme link resolves is covered.
    - **Where the emit lives**: `main.scss` (the entry compiled to `dist/css/main.css`) now calls `output-base-css-variables`, `output-pa-css-variables`, and `output-pa-alert-variables-light` at `:root`. `_core.scss` no longer emits any `:root` block of its own — it's purely component CSS.
    - **Themes are unaffected.** Themes don't go through `main.scss` — they `@import 'core'` + `@import 'base-css-variables'` and emit their own `:root` from their theme file. All 15 themes rebuild to byte-identical output. No theme repo changes required.
    - **One-line tweak to `_base-css-variables.scss`**: added `@use 'variables/index' as *` at the top so the file can be loaded as a `@use` module by `main.scss`. Legacy `@import` callers (themes) are unaffected because `@use`'d members land in the importing file's global scope where theme-set overrides already live.
    - **Supersedes the 2.7.1-era partial fix** (commit a76d195) that hardcoded only the 5-step sentiment scale at `:root` from `_core.scss`. That 22-line block is removed; the full mixin output is now what runs.

- **`.pa-kpi-spark-list` gained `--no-delta` modifier + track-width SCSS variables**. Previously the row template was a hardcoded 4-col grid (label · chart · value · delta) with inline `minmax(…)` track widths repeated across every responsive override. Refactored: track widths extracted to local SCSS variables (`$spark-col-label`, `$spark-col-chart`, `$spark-col-value`, `$spark-col-delta`) so the default 4-col template and the new `--no-delta` 3-col template share one source of truth.
    - **New `pa-kpi-spark-list--no-delta` modifier**: drops the rightmost Δ% column. Useful when the sparkline's slope already conveys direction. At wide widths the row shrinks from 4 cols to 3 (`label · chart · value`); at mid-narrow the top row becomes `label value` only; at very-narrow the bottom row becomes a single full-width `value` cell. The delta element is hidden via `display: none` so the markup can stay identical to default rows — the popover's `<dl>` still surfaces the delta on hover.
    - **Composable with `--chart-first`**: `--no-delta.--chart-first` at mid-narrow yields a clean 3-row single-column stack (`label / chart / value`); covered by an explicit compound selector in the SCSS.
    - **Track widths as variables, not modifier-prefixed declarations**: only `--no-delta` toggles a column today, so a numeric-strip-style "8 precomputed templates for all combinations" wasn't worth the cost. If a `--no-label` or `--no-chart` lands later the same pattern extends.

- **`.pa-kpi-hero-list__layout` gained split-ratio modifiers**. Previously the hero/rail split was hardcoded to `1fr 1fr` (50/50) on the layout grid — anything else required forking the SCSS. Default 1:1 is preserved; two new modifiers shift weight to the hero without touching markup.
    - **New `pa-kpi-hero-list__layout--hero-2-3` modifier**: hero gets 2/3 of the width, rail 1/3. Common in exec layouts where the supporting tiles are reference rather than focal.
    - **New `pa-kpi-hero-list__layout--hero-3-4` modifier**: hero gets 3/4 of the width, rail 1/4 — hero-dominant; the rail becomes a thin sidebar.
    - **`@container (max-width: 700px)` collapse** override still matches the base `__layout` class selector and overrides any modifier's `grid-template-columns` at narrow widths. Collapse behaviour is identical regardless of which split-ratio modifier the layout carries.

- **`.pa-kpi-bento__grid` gained layout modifiers + row-height variable**. Previously the bento was locked to exactly 6 tiles in a single fixed `grid-template-areas` template (hero left-half × 2 rows, two stacked right-half × 2 rows, three equal tiles bottom row) — anything else required forking the SCSS. The default layout is unchanged; two new modifiers swap the named-area template without touching markup, and the row height is now author-configurable.
    - **New `pa-kpi-bento__grid--hero-right` modifier**: mirror of the default layout — hero on the right half, two stacked supporting tiles on the left of rows 1-2, three equal tiles on the bottom row. Same 6-tile contract; source order stays unchanged because the underlying `:nth-child → grid-area` mapping is preserved.
    - **New `pa-kpi-bento__grid--5-tile` modifier**: 5-tile composition — hero spans the left half × 2 rows, two stacked tiles on the right of rows 1-2, two equal halves on the bottom row. Requires exactly 5 source-order tiles; a 6th would auto-place into a new row and break the layout.
    - **New `--pa-kpi-bento-row-height` CSS variable** (default `12rem`) declared on `.pa-kpi-bento`. Controls the row height for all three rows of the grid. Override per instance via `style="--pa-kpi-bento-row-height: 14rem"` for taller tiles. Replaces the previous hard-coded `grid-template-rows: 12rem 12rem 12rem` declaration.
    - **`@container (max-width: 700px)` collapse** still resets the grid to a single-column stack. Modifier templates set their own `grid-template-areas`, but the @container override's `grid-template-areas: none` + per-tile `grid-area: auto` neutralise any modifier's template at narrow widths, so the responsive stack behaviour is identical regardless of which layout modifier the grid carries.

- **`.pa-kpi-gauge-list__grid` redesigned as a cell-min-driven auto-fit grid**. Previously a fixed `repeat(2, 1fr)` with a single `@container (max-width: 600px)` breakpoint collapsing to 1-col and per-tile `border-right` + `border-bottom` plus `:nth-child(2n)` / `:nth-last-child(-n+2)` selectors to suppress edges — all of it locked to the hardcoded 2-col layout. Replaced with `repeat(auto-fit, minmax(var(--pa-kpi-gauge-cell-min, 20rem), 1fr))` and the same `gap: 1px` + grid-background hairline trick used by `_kpi-editorial-minimal.scss`. No `@container` queries on `__grid` anymore; the responsive cascade is intrinsic.
    - **New `--pa-kpi-gauge-cell-min` CSS variable** (default `20rem`) controls the minimum cell width. Smaller → more columns at the same container width; larger → fewer. Override per instance via `style="--pa-kpi-gauge-cell-min: 24rem"`.
    - **Five new cap-at-N modifiers**: `pa-kpi-gauge-list__grid--max-2` / `--max-3` / `--max-4` / `--max-5` / `--max-6`. Each caps the column count at N but still collapses below the `cell-min × N` threshold — a ceiling, not a force. Same `minmax(max(cell-min, calc((100% - gap × (N-1)) / N)), 1fr)` formula as the editorial-minimal caps.
    - **New `--2col` modifier**: `pa-kpi-gauge-list__grid--2col` forces exactly 2 columns regardless of cell-min or container width — for placements wanting a deterministic 2×N layout.
    - **Hairline dividers via gap-background, not per-tile borders**: the previous design painted `border-right` + `border-bottom` on every `.pa-kpi-gauge` and used `:nth-child(2n)` / `:nth-last-child(-n+2)` to suppress the last-column/last-row edges. That machinery only worked for the hardcoded 2-col layout — column counts ≠ 2 would have produced double or missing borders. Switched to `gap: 1px` on the grid with `background: var(--pa-border-color)` and each tile painting `background: var(--pa-card-bg)` on top. Only the gap shows through, giving single-pixel hairlines on every interior boundary regardless of column count. The card's outer border supplies the perimeter.
    - **`.pa-kpi-gauge` now sets `background: var(--pa-card-bg)`** (required so the gap-background only shows through the gap, not behind the tile).
    - **`container-type: inline-size` removed from `.pa-kpi-gauge-list`** — no `cqi` usage and the `@container` queries are gone, so the container declaration was dead weight.
    - **Migration**: authors using bare `.pa-kpi-gauge-list__grid` with 6 items on a wide container will see 3+ columns instead of always 2. Add `.pa-kpi-gauge-list__grid--max-3` (or `--2col` for the previous deterministic 2-col rhythm) to preserve a fixed column count. Authors placing the gauge list inside narrow page-grid cards (~400px or less) are unaffected — cell-min still collapses to 1-col at the same widths the `@container` query previously did.

- **`.pa-kpi-terminal` view-mode toggle generalised to a tab strip (Visual breaking)**. Previously the header carried a fixed 3-button segmented control (VALUE / Δ% / TREND) that swapped which of three sibling `.pa-kpi-tile__value[data-mode="…"]` elements per tile was visible — one dataset, three readings of the same tiles. Reworked to a generic tab strip where each tab swaps in a separate pane with its own tile set and grid layout, so authors can put a different number of tiles (and a different grid modifier) behind each tab.
    - **Renamed classes**: `.pa-kpi-terminal__viewtoggle` → `.pa-kpi-terminal__tabs`, `.pa-kpi-terminal__viewbtn` → `.pa-kpi-terminal__tab`. The visual styling (segmented button group, bordered pill) is unchanged.
    - **Renamed root attribute**: `data-view="…"` on `.pa-kpi-terminal` is gone; tabs now carry `data-tab="<slug>"`, panes carry `data-tab="<slug>"`, and JS toggles `.is-active` on the clicked tab + matching pane (no root attribute toggling).
    - **New `.pa-kpi-terminal__pane` container** (`display: none` by default, `.is-active` → `display: block`). One pane per tab slug; each pane holds its own `__grid` with its own modifier, its own tile count, its own contents. Sections without tabs simply omit the `__tabs` + `__pane` markup and place a `__grid` directly in the body.
    - **Per-tile `.pa-kpi-tile__value[data-mode]` triple-value mechanism removed.** Each tile now renders a single `.pa-kpi-tile__value`. Authors who need "same tile, different reading" can put the same tile (with a different `__value`) into multiple panes.
    - **Demo updates**: the first demo card uses three tabs (`overview` / `finance` / `ops`) with 6 / 2 / 4 tiles per pane respectively — all using the same `pa-kpi-terminal__grid--2col` modifier (the existing n-th-child border suppressors handle the last-row/last-column edges correctly regardless of row count). The layout-test sections (1×3 page-grid, 25/45 asymmetric) dropped the toggle entirely; they were always placement tests, not tab tests. The Chart.js demo dropped the toggle for the same reason.
    - **JS contract**: `initTerminalViewToggle` → `initTerminalTabs`. Click handler reads the tab's `data-tab`, toggles `.is-active` on every tab in the parent `.pa-kpi-terminal` (off all, on the clicked one) and on every pane (off all, on the one whose `data-tab` matches). Each `.pa-kpi-terminal` scopes its own tabs + panes via a `closest` filter so nested terminals (none today) wouldn't cross-fire.
    - **Migration**: rename `__viewtoggle` → `__tabs` and `__viewbtn` → `__tab`. Drop `data-view` from the root and the triple-`__value[data-mode]` siblings from each tile. Wrap each tab's body content in `<div class="pa-kpi-terminal__pane" data-tab="<slug>">…</div>` (the initial one gets `is-active`). If the toggle was decorative (single-mode markup), drop it entirely and place the `__grid` directly in the body.

- **`.pa-kpi-edit__grid` redesigned as a cell-min-driven auto-fit grid (Visual breaking)**. Previously a fixed `repeat(3, 1fr)` with three discrete `@container` breakpoints collapsing to 2-col under 640px and 1-col under 360px. Replaced with `repeat(auto-fit, minmax(var(--pa-kpi-edit-cell-min, 14rem), 1fr))` — cells stay at least the configured minimum wide, the grid fits as many columns as the container allows, and the responsive cascade is now intrinsic to the grid template. No `@container` queries on `__grid` anymore. Authors get a CSS variable knob for density without touching breakpoints.
    - **New `--pa-kpi-edit-cell-min` CSS variable** (default `14rem`) controls the minimum cell width. Smaller → more columns at the same container width; larger → fewer. Override per instance: `<div class="pa-kpi-edit__grid" style="--pa-kpi-edit-cell-min: 18rem">`.
    - **Five new cap-at-N modifiers**: `pa-kpi-edit__grid--max-2` / `--max-3` / `--max-4` / `--max-5` / `--max-6`. Each caps the column count at N but still collapses below the `cell-min × N` threshold — a ceiling, not a force. Implemented as `minmax(max(cell-min, calc((100% - gap × (N-1)) / N)), 1fr)` so cell-min wins on narrow widths and the per-N calc wins on wide widths. The cap exists because `auto-fit` only collapses tracks that are empty across the *whole* grid — with 6 items at 4-col auto-fit, tracks 1–4 all have row-1 items, so row 2's tracks 3–4 remain and show the gap background as a gray void on the right side of row 2. Capping at 3 makes 6 items pack 3×2 cleanly.
    - **`--2col` modifier unchanged.** Still forces exactly 2 columns regardless of cell-min or container width — for placements wanting a deterministic 2×N layout.
    - **`container-type: inline-size` moved from `__grid` to `__tile`.** The value's `cqi`-based font-size now measures per-cell instead of per-grid, so typography tracks each cell's actual width as the grid packs more columns into a wider container. Value clamp middle bumped from `18cqi` to `22cqi` to compensate for the smaller reference width (per-cell rather than full-grid).
    - **Migration**: authors using bare `.pa-kpi-edit__grid` with a fixed item count will see different breakpoint behavior — on a wide container the old layout was always 3×2 for 6 items; the new layout may produce uneven rows at widths that fit 4+ columns. Add `.pa-kpi-edit__grid--max-3` to restore an always-3-col rhythm without giving up the cell-min collapse on narrow widths. Authors using `.pa-kpi-edit__grid--2col` are unaffected.

- **`.pa-kpi-strip` column toggles extended to a composable 2–5 column family**. Previously the numeric-strip showcase shipped two fixed shapes — 5-col default and 4-col via `--no-prev`. The strip now supports any subset of the three optional columns (`prev`, `delta`, `target`) via independently composable toggle modifiers, landing on a 2-, 3-, 4-, or 5-column shape. `metric` and `now` remain mandatory (a strip without focal values is a different design — route to comparison gauges or editorial-minimal).
    - **Two new toggle modifiers**: `pa-kpi-strip--no-delta` and `pa-kpi-strip--no-target`, joining the existing `--no-prev`. All three are independently composable, giving 8 visible-column combinations (1 default + 3 single-drops + 3 double-drops + 1 triple-drop down to metric + now only).
    - **Per-column header modifier classes** added to `.pa-kpi-strip__head`: `--metric`, `--now`, `--prev`, `--delta`, `--target`. The data cells already carried their column-specific class (`__metric`, `__now`, etc.); these new header modifiers let the framework apply `display: none` to the matching header cell when a toggle drops the column. Authors using the existing 5-col markup keep working as-is (the new classes are additive); to use the `--no-*` modifiers the header cells need the per-column classes so the header row stays in sync with the data rows.
    - **Compound selectors precompute every visible-column combination.** Each of the 7 modifier combinations gets its own `grid-template-columns` selector in the framework SCSS, so consumers never touch the template themselves. Track widths extracted to local SCSS variables (`$strip-col-metric`, `$strip-col-now`, `$strip-col-prev`, `$strip-col-delta`, `$strip-col-target`) so the 8 templates share one source of truth and tuning a column's width updates all 8.
    - **Why this shape over a CSS-variable template knob**: `--no-*` modifiers compose without consumers writing CSS, and the wrapper layer (Svelte/React) can map a declarative `columns={['metric', 'now', 'delta']}` prop to the right modifier classes without inventing its own template syntax. A `--pa-kpi-strip-template` CSS variable would be more flexible but pushes column-width tuning into every consumer that wants a non-default shape — worse ergonomics for the same end result.

## [2.7.1] - 2026-05-14 [PUBLISHED]

### Added

- **KPI showcases promoted from demo-inline `<style>`/`<script>` to permanent core components**. The seven showcase pages (terminal grid, sparkline list, comparison gauges, hero+supporting, bento, numeric strip, editorial minimal) were authored with inline styles and scripts in their mustache templates while the designs were iterated rapidly. With the surface settled after the 2.6.0 / 2.7.0 token consolidation, the styles graduate to framework components under `pa-kpi-*` BEM classes, the scripts consolidate into a single `demo/js/kpi-showcases.js`, and the mustache pages now contain markup only. ~500 lines of CSS and ~350 lines of JS moved out of duplicated inline blocks into shared sources.
    - **Eight new core SCSS partials** under `packages/core/src/scss/core-components/`. `_kpi-base.scss` carries the chrome that was byte-identical across all seven pages — `pa-kpi-header` (title + LIVE row), `pa-kpi-live` + `pa-kpi-live__dot` (LIVE pill with pulse), `pa-kpi-footer` (caption row), `pa-kpi-detail` + `__title` (hover popover, 35 lines per page × 7), `pa-kpi-spark-dot` + `pa-kpi-spark-wrap` (sparkline endpoint dot, used by the 4 sparkline-bearing designs), `pa-kpi-sectionhead`, and the `@keyframes pa-kpi-pulse` animation. Seven design-specific files (`_kpi-terminal`, `_kpi-sparkline-list`, `_kpi-comparison-gauges`, `_kpi-hero-supporting`, `_kpi-bento`, `_kpi-numeric-strip`, `_kpi-editorial-minimal`) carry the layout + typography per design. All eight wired into `_core.scss` after `data-viz`.
    - **All `kpi-*` classes renamed to `pa-kpi-*`** to match the framework's BEM prefix rule from CLAUDE.md. Element-level (`__header`, `__live`, `__footer`, `__detail`, etc.) and modifier-level (`--positive`, `--negative`, `--neutral`, `--up-strong`, `--down-strong`) structures preserved 1:1. The rename used a word-boundary regex (`(?<![a-zA-Z0-9_-])kpi-(?![a-zA-Z0-9_])`) to avoid `pa-pa-kpi-*` double-prefix collisions on a re-run.
    - **Inline scripts consolidated.** All seven showcases previously inlined the same three pieces of behaviour: a Floating UI cursor-anchored popover that follows `mousemove` (matches `.pa-kpi-detail`, moves the popover to `<body>` to escape ancestor `overflow: hidden`, uses `detail.parentElement` as the host before the move), an SVG-circle → CSS-span sparkline endpoint dot conversion (because circles inside an SVG with `preserveAspectRatio="none"` distort along with container width, but an HTML span pinned to the same `(x, y)` in absolute coords stays circular), and the terminal-grid view-mode toggle. Consolidated into one `demo/js/kpi-showcases.js` (~150 lines) wired into `demo/views/layout.mustache` with a single `<script>` tag.
    - **Per-component cascade variables namespace-prefixed.** `--kpi-accent` (bento + hero) → `--pa-kpi-accent`; `--kpi-bar-color` (comparison gauges) → `--pa-kpi-bar-color`. The gauge tick knobs (`--pa-kpi-gauge-tick-pos`, `--pa-kpi-gauge-tick-color`) keep their gauge-specific names — they're not part of the generic accent-cascade pattern. The internal SCSS files and any inline `style="..."` overrides in markup were updated together; CSS Classes Reference cards on the affected showcase pages were updated to document the new token names.
    - **Tokens unchanged.** All `--pa-positive` / `--pa-neutral` / `--pa-negative` / `--pa-very-positive` / `--pa-very-negative` sentiment tokens, `--pa-detail-*` popover chrome, `--pa-chart-trendline-*` sparkline geometry, `--pa-text-strong` / `-secondary` / `-tertiary` contrast tiers, and `--pa-surface-track` / `-hover` were already emitted by `_base-css-variables.scss` from the 2.6.0 consolidation. No new framework tokens introduced by this promotion.

- **Chart.js drop-in examples added to four KPI showcase demo pages** (demo-only — no change to the published package). Each chart-bearing design (hero + supporting, bento, sparkline-list, terminal-grid) gains a "Custom chart library" section demonstrating that the `pa-kpi-*` chart slots are plain containers, not coupled to the hand-authored inline SVG sparkline. A `<canvas data-kpi-chart>` drops into the same slot and a new `demo/js/kpi-chartjs-examples.js` renders it as a Chart.js bar chart — a visibly different chart type, so the "any library works here" point reads at a glance rather than only being true technologically. The chart reads its colour from the slot's resolved `currentColor` (the KPI sentiment cascade already sets `color` on the chart wrapper) and re-colours on the `pa:theme-change` event, same pattern as the dashboard D3 chart. Chart.js 4.4.3 is loaded via CDN in `layout.mustache`. Sizing is responsive-width + maintain-aspect-ratio, so the slots need no fixed-height host and no new framework or demo CSS — nothing reintroduced from the inline-style cleanup above.

## [2.7.0] - 2026-05-10 [PUBLISHED]

### Added

- **`.pa-modal--banded` modifier — generic compositional banded modal style.** Combines with the existing role modifiers (`pa-modal--success` / `--warning` / `--danger` / `--info`) so the banded modifier handles the structural change (header AND footer get filled bands) while the role modifier supplies the colour. Markup: `<div class="pa-modal pa-modal--success pa-modal--banded">`. Bands consume the existing alert tokens (`--pa-alert-X-bg` / `-text` / `-border`) — 15% role-mix in light mode, 45% in dark — so banded modals stay in lock-step with the alert palette across both themes; one source of truth, no drift. Body and the modal's own action buttons read against the band rather than competing with it. Compositional pattern was preferred over four standalone `--success-banded` / `--warning-banded` / etc. classes because it scales — adding a new role in the future is one compound selector, not a duplicated structural block.
    - **Three new band-scoped CSS custom properties** (`--pa-modal-band-bg`, `--pa-modal-band-text`, `--pa-modal-band-border`) wire the role modifier to the alert tokens via four compound selectors (`.pa-modal--banded.pa-modal--success`, `--warning`, `--danger`, `--info`). The shared `.pa-modal--banded` block reads the band tokens, so adding more roles is one line per role. No `--primary-banded` because there's no `--pa-alert-primary-*` token — primary is for actions, not contextual states, and that scope difference matches alerts intentionally.
    - **Buttons inside bands invert the modal's colour scheme to guarantee contrast on every theme.** Generic button modifiers (`--light` / `--dark`) bind to theme-tier surface tokens that on many dark themes (gruvbox dark in particular, where `--pa-btn-light-bg` is a warm grey nearly identical to the muted band) land within 5–10% luminance of the band itself, producing a "meh" near-invisible button. Override scoped to `.pa-modal--banded .pa-modal__header .pa-btn` and `... .pa-modal__footer .pa-btn`: `background-color: var(--pa-text-color-1)`, `color: var(--pa-modal-content-bg)`. Result: light theme renders dark-on-pale, dark theme renders light-on-muted — high contrast in both modes regardless of how the theme defines its tier surfaces. Hover bg drops to `color-mix(... var(--pa-text-color-1) 85%, transparent)` for subtle feedback.

### Changed

- **CSS variable consolidation pass — full sweep of `core-components/` for SCSS-baked role colours (Visual breaking under stock defaults; mostly invisible to themed consumers)**. Deferred from 2.6.0 and now extended to cover every component in `core-components/` *plus* the variable-emission layer. ~180 SCSS-baked colour references (`$success-bg`, `$danger-bg`, `$warning-bg`, `$info-bg`, `$accent-color`, `$btn-primary-bg`, `$btn-secondary-bg`, `$secondary-bg`, etc.) that resolved at compile time and ignored runtime theme overrides — migrated to CSS custom properties so a runtime override of `--pa-success` / `--pa-danger` / `--pa-warning` / `--pa-info` / `--pa-accent` / `--pa-btn-primary-bg` cascades into stat icons, hero deltas, progress bars, stacked bars, gauges, rings, data-bars, sparklines, bar-lists, heatmaps, chips, accent-grids, comparison-table highlights, timelines, file uploaders, query editors, lists, checkbox lists, logic trees, input wrappers, composite badges, notifications, alerts, callouts, cards, card-tabs, all four standalone tab variants, popconfirm, body-bg pattern, secondary labels, and live-data card states. Many components previously baked the role colours at compile time and silently ignored themes entirely.
    - **Variant tokens now derive from runtime parents.** Previously `--pa-accent-light`, `--pa-btn-primary-bg-light`, and `--pa-{success,danger,warning,info}-bg-light/-bg-subtle/-border` were baked from SCSS `$accent-light` / `$success-bg-light` etc. via `#{...}` interpolation, so a runtime `--pa-accent` / `--pa-success` / etc. override didn't propagate. Now defined in `_base-css-variables.scss` as `color-mix(in srgb, var(--pa-X) Y%, transparent)` — `-light` 5%/10%, `-subtle` 8%, `-border` 20%, matching the previous SCSS-baked opacities. SCSS-only consumers (e.g. `box-shadow: 0 0 0 $focus-ring-width $accent-light` in `_command-palette.scss`) still get the baked SCSS values via the unchanged `variables/_base.scss` definitions — dual-path system, both work. `-hover` variants stay compile-time SCSS-baked since they're `color.adjust()`-derived darker shades, not opacity-based.
    - **`_statistics.scss`** — `.pa-stat__icon--success/warning/info` migrated from `$success-bg-light` / `$success-bg` to `var(--pa-success-bg-light)` / `var(--pa-success-bg)`. New `--danger` icon variant added (the original three-variant list was inconsistent with the rest of the framework). Hero deltas (`.pa-stat__change--positive/negative/neutral`) migrated from `$success-bg` / `$danger-bg` (role colours) to the 5-step sentiment scale introduced in 2.6.0 — `--pa-positive` / `--pa-negative` / `--pa-neutral`, plus two new modifiers `--very-positive` / `--very-negative` to match the KPI showcases. Neutral colour shifts from `--pa-text-color-2` (`#6c757d`) to `--pa-neutral` (`#9ca3af` Tailwind gray-400).
    - **`_data-display.scss`** — `.pa-fields--chips` and `.pa-accent-grid` referenced non-existent CSS variables `var(--pa-success-color)` / `--pa-warning-color` / `--pa-danger-color` / `--pa-info-color`. The framework defines `--pa-success` / `--pa-warning` / `--pa-danger` / `--pa-info` (no `-color` suffix), so every chip and accent-grid border silently fell back to the hardcoded RGB literals declared as the `var()` second argument (`#28a745`, `#e68a00`, `#dc3545`, `#17a2b8`). Themes that overrode the role colours had no effect on these components. Switched to the canonical tokens. Also: new `--info` chip variant for surface parity with accent-grid; the three "Copied!" feedback colour sites moved from `var(--pa-color-4)` (an arbitrary 9-slot palette token) to `var(--pa-success)` (semantic confirmation).
    - **`_data-viz.scss`** — eight components (progress bars, stacked bars, progress rings, gauges, data bars, heatmaps, sparklines, bar lists). Every `$accent-color` / `$success-bg` / `$warning-bg` / `$danger-bg` / `$info-bg` / `$btn-secondary-bg` reference migrated to `var(--pa-accent)` / `var(--pa-success)` / etc. Track backgrounds (five SCSS vars: `$progress-bg`, `$gauge-track-color`, `$progress-ring-track-color`, `$data-bar-bg`, `$bar-list-bar-bg`) unified to `var(--pa-surface-track)` — fixing a pre-existing dark-mode bug where `$data-bar-bg` and `$bar-list-bar-bg` were hardcoded `rgba(0, 0, 0, 0.06)` (imperceptible against dark surfaces). Heatmap level-tints (`rgba($accent-color, 0.2)` etc.) converted to `color-mix(in srgb, var(--pa-accent) 20%, transparent)` so they respect runtime theme overrides instead of baking the accent at compile time.
    - **`_comparison.scss`** — `.pa-comparison-table__changed` (pink diff highlight) and `__conflict` (orange merge-conflict highlight) had hue drift between their three intensities: subtle and solid backgrounds used pink-400 / orange-400 (`rgba(244, 114, 182, X)` / `rgba(251, 146, 60, X)`), but the border accent used pink-500 / orange-500 (`#ec4899` / `#f97316` from the SCSS vars `$comparison-accent-pink` / `$comparison-accent-orange`). All three intensities now derive from a single SCSS source via `color-mix()`, so a theme override of `$comparison-accent-pink` cascades to all three. Diff highlights are intentionally domain-specific (not role colours) — they need to read distinct from status chips that may share the same row.
    - **`_timeline.scss`** — sixteen sites across simple-variant dot markers (`--success` / `--warning` / `--danger` / `--info` / `--secondary` borders + box-shadows), filled-variant fills, and the alternating block's warning marker icon + content background + warning-text. Box-shadow opacity preserved via `color-mix(in srgb, var(--pa-X) #{$timeline-simple-dot-shadow-opacity * 100%}, transparent)` so the SCSS shadow-opacity token still drives the value.

- **Timeline simple-variant dot tuning (Visual breaking)**:
    - **Shadow opacity bumped `0.3` → `0.5`** (`$timeline-simple-dot-shadow-opacity`). At 30% the green / orange / red shadow tints dissolved into warm dark theme backgrounds — only saturated blue (`--pa-info`) read clearly because of bg/fg hue contrast. 50% gives every role colour enough presence to register as a real drop shadow without overpowering on light themes.
    - **Border-radius `50%` → `30%`** via new `$timeline-simple-dot-border-radius: 30% !default` SCSS variable. Replaces hardcoded `border-radius: 50%` on the simple-variant dot — circles → squircles. Themes that prefer perfect circles can override back to `50%`.
    - **`_file-selector.scss`** — thirteen sites for danger error states (drop-zone remove buttons, validation feedback, modal table remove buttons, file preview removes, summary remove hover, status text) and success ticks. Uploader chrome respects theme role-colour overrides for the first time.
    - **`_query-editor.scss`** — five role-colour sites for operator/value/keyword token backgrounds + the success operator pill, all converted to `color-mix()` over canonical role tokens.
    - **`_lists.scss`** — `.pa-list-basic--success/danger/info/warning` bullet markers (`✓` / `✗` / `→` / `!`) migrated to canonical role tokens.
    - **`_cards.scss`** — `.pa-card--live-up` and `--live-down` (live-data tinted backgrounds reflecting latest tick direction) migrated from `rgba($success-bg, 0.10)` / `rgba($danger-bg, 0.10)` to the 5-step sentiment scale: `color-mix(... var(--pa-positive) 10%, transparent)` / `... var(--pa-negative) 10%, transparent`. These are direction-of-change indicators, not status indicators — sentiment is the right semantic layer.
    - **`_logic-tree.scss`** — `--and` and `--or` block borders moved to `var(--pa-warning)` / `var(--pa-info)`.
    - **`_checkbox-lists.scss`** — locked-state row hover background and lock-icon text colour moved to `var(--pa-warning)`.
    - **`_input-wrapper.scss`** — input clear-button hover colour moved to `var(--pa-danger)`.
    - **`_composite-badge.scss`** — danger focus-ring shadow now derives from `var(--pa-danger)` via `color-mix()` (preserving the `$btn-focus-ring-opacity` SCSS token).
    - **`_tabs.scss`** — 9 sites of `rgba($accent-color, X)` migrated to `color-mix()` over `var(--pa-accent)` across line tabs hover/active, pills hover bg + border, boxed hover, vertical hover/active, card-tabs hover, and overflow-menu hover/active. Plus 3 direct `$accent-color` → `var(--pa-accent)` for line-tab `--active` color/border and vertical-tab active border-inline-end.
    - **`_file-selector.scss`** — 9 `rgba($accent-color, X)` sites (drop-zone hover/active bg, modal table row hover + uploading bg, two progress-bar tracks, file-preview icon bg, drag overlay bg) plus 5 direct `$accent-color` references (drop-zone hover border, file-preview hover border, two progress-fill solid bgs, file count text, uploading status text, drag overlay text + dashed border) all migrated to `color-mix()` / `var(--pa-accent)`.
    - **`badges/_composite-badge-variants.scss`** — 7 focus-ring shadows for `--btn-primary` / `--btn-secondary` / `--btn-success` / `--btn-warning` / `--btn-info` / `--btn-light` / `--btn-dark` migrated from `rgba($btn-X-bg, $btn-focus-ring-opacity)` to `color-mix(in srgb, var(--pa-X) #{$btn-focus-ring-opacity * 100%}, transparent)`. The `--btn-danger` ring was already migrated in this version's earlier pass; this brings the other 7 in line.
    - **`_timeline.scss`** — 6 sites the earlier 2.7.0 timeline pass missed: base accent dot border + shadow, `--primary` variant border + shadow (referencing `var(--pa-btn-primary-bg)`), filled accent + filled primary bg. Plus 6 direct `$accent-color` migrations: alternating-block centre line bg, two left/right side connector bgs, alternating-block date colour, alternating-block icon border + colour, content link colour.
    - **`_alerts.scss`** — `.pa-alert--primary` accent variant bg + border migrated from `rgba($accent-color, $opacity-subtle)` / `rgba($accent-color, $opacity-border)` to `color-mix()` over `var(--pa-accent)`. (Alert role variants — success / warning / danger / info — were already on the `--pa-alert-X-bg` token chain since 2.6.0.)
    - **`_callouts.scss`** — `.pa-callout--primary` bg migrated from `rgba($accent-color, $opacity-subtle)` to `color-mix(in srgb, var(--pa-accent) 8%, transparent)`. The other callout role variants already used `var()` chains.
    - **`_cards.scss`** — 2 sites of `rgba($accent-color, $card-tab-hover-opacity)` on `.pa-card__tab` hover (line-style and inline variants) migrated to `color-mix()` over `var(--pa-accent)`.
    - **`_query-editor.scss`** — 2 sites of `rgba($accent-color, 0.15)` on `.pa-inline-query__field` token bg + autocomplete `--field` token bg migrated to `color-mix()`. The accent text colour on `__field` also migrated from `$accent-color` to `var(--pa-accent)`.
    - **`_popconfirm.scss`** — `.pa-popconfirm__actions` bg migrated from `rgba($border-color, 0.3)` to `color-mix(in srgb, var(--pa-border-color) 30%, transparent)`. The 0.3 alpha-on-grey rendered as a near-black bar on dark themes; deriving from `--pa-border-color` makes it inversion-safe.
    - **`_base.scss`** — body-bg pattern (two radial-gradient stops) migrated from `rgba($accent-color, $bg-pattern-opacity)` to `color-mix()` over `var(--pa-accent)`. Pattern now follows runtime accent overrides instead of staying compile-time-baked.
    - **`badges/_labels.scss`** — `.pa-label--secondary` (filled bg + outline hover bg + colour + border-color) migrated from `rgba($secondary-bg, $opacity-light)` / `$secondary-bg` to `color-mix()` / `var(--pa-btn-secondary-bg)`. (`$secondary-bg` aliases `$btn-secondary-bg` per `variables/_colors.scss:163`.)
    - **`_notifications.scss`** — three distinct migrations. (1) `.pa-notifications__icon-wrapper--primary` / `--success` / `--warning` / `--danger` migrated from `rgba($btn-primary-bg, 0.1)` / `rgba($btn-success-bg, 0.1)` / etc. (SCSS-baked role colours that ignored runtime overrides) to outline-style border treatment with full-opacity role tokens (`border-color: var(--pa-btn-primary-bg)` / `var(--pa-success)` / `var(--pa-warning)` / `var(--pa-danger)`). Foreground colours migrated to the matching `var(--pa-*)` tokens. Wrapper also picks up `border-radius: var(--pa-border-radius)` (was hardcoded `50%`) so it follows the theme's standard radius. (2) `.pa-notifications__item--unread` background + hover, `.pa-notifications__mark-read` text + hover, and `.pa-notifications__footer a` text + hover migrated from `rgba($accent-color, X)` / `$accent-color` / `$accent-hover` (SCSS-baked, ignored runtime `--pa-accent` overrides) to `color-mix(in srgb, var(--pa-accent) X%, transparent)` and `var(--pa-accent)` / `var(--pa-accent-hover)`. Theme overrides of `--pa-accent` now reach the unread row tint, the panel header's "Mark all as read" button, and the footer link. (3) `--secondary` action button background fixed: was `rgba(var(--pa-text-color-2), 0.1)` (broken — `rgba()` doesn't accept `var()` as a colour input, browsers silently dropped the rule), now `color-mix(in srgb, var(--pa-text-color-2) 10%, transparent)`.

- **`.pa-gauge` rebuilt as a true ring with a transparent centre and concentric inner/outer boundaries (Visual breaking)**. The previous implementation had three structural issues:
    - **The "donut hole" was an opaque overlay, not a real hole.** `.pa-gauge__inner` painted itself with `background: var(--pa-card-bg)` to fake the appearance of a hole carved out of the conic-gradient half-disk. This worked only when the gauge sat on a `--pa-card-bg` surface; placed on any other background (a section panel with a different shade, a coloured tile, a custom card), the "hole" rendered as a coloured shape and the gauge looked like a half-disk with a darker patch inside. Replaced with `mask-image: radial-gradient(circle farthest-side at 50% 100%, transparent 0 70%, #000 70%)` on a new `::before` pseudo, which carves out the inner half-circle as a real transparent hole. Whatever surface is behind the gauge now shows through cleanly, regardless of theme or layout.
    - **Inner and outer ring boundaries weren't concentric.** A `conic-gradient` defaults its centre to the element's geometric centre. For the gauge's `12rem × 6rem` pseudo, that's `(6rem, 3rem)` — the rectangle's centre — but the visible ring is centred at `(6rem, 6rem)` (the bottom-centre of the half-circle, where the mask is anchored). The two centres were 3rem apart, so colour transitions tilted relative to ring boundaries: the inner edge appeared pushed upward, the bottom-corner wedges were thicker than the top, and the visible result didn't look like a clean half-ring. Fixed by adding `at 50% 100%` to both the conic gradient and the radial-gradient mask, so they share the same centre and produce a uniformly-thick concentric ring.
    - **Conic gradient was duplicated for every colour variant.** `.pa-gauge--success` / `--warning` / `--danger` / `--info` each redeclared the entire `background: conic-gradient(...)` rule. Refactored to a single `--pa-gauge-fill` CSS variable that the variants override — `.pa-gauge--success { --pa-gauge-fill: var(--pa-success); }` — with the gradient declared once on `.pa-gauge::before`. Multi-zone (`.pa-gauge--zones`) keeps overriding `::before { background: ... }` directly because it needs a different gradient pattern.
    - **New `--pa-gauge-size` CSS variable** (default `12rem`, was hardcoded `$gauge-size`) for per-instance size control. Width and height (always half the width — aspect is fixed 2:1 for a top semi-circle) both derive from this token. Use `<div class="pa-gauge" style="--pa-gauge-size: 16rem">` for a bigger gauge. Conic gradient and mask are percentage-based, so they scale automatically. The text sizes inside the donut don't auto-scale yet — set `font-size` on `.pa-gauge__value` manually if a much smaller or larger gauge needs proportional text.
    - **Layout rebuild**: gauge label (`CPU` / `Memory` / `Temp` / `Speed`) moved from inside the donut hole — where it was crowded next to the value text — out to a row below the baseline, alongside `__min` and `__max`. All three (`__min   __label   __max`) sit on one row with a shared `line-height` in absolute rem, so their text baselines align even though the gauge label uses a slightly larger font. The donut hole now belongs entirely to the value.
    - **Value text resized + repositioned**: now `font-size-3xl` (`2.8rem`, was `font-size-2xl` `2.4rem`) and anchored at the baseline of the donut hole (`align-items: flex-end`), so it visually rests on the arc rather than floating mid-air. With the label gone from inside, vertical space is freed for a larger, more emphatic value.
    - **`margin-bottom: $spacing-base` reserved on `.pa-gauge`** so absolutely-positioned `__min` / `__max` / `__label` (which sit below the gauge) don't collide with whatever's below in the layout.
    - **`$gauge-value-font-size` SCSS default**: `$font-size-2xl` → `$font-size-3xl`.

### Fixed

- **`.pa-fields--chips` and `.pa-accent-grid` ignored theme overrides for role colours.** Both referenced `var(--pa-success-color)` / `--pa-warning-color` / `--pa-danger-color` / `--pa-info-color` — none of which exist in the framework's emitted CSS variables. With no fallback resolution, browsers used the hardcoded RGB literals declared as the `var()` second argument (`#28a745`, `#e68a00`, `#dc3545`, `#17a2b8`). Themes that customised the four role colours had no effect on chips or accent-grid borders. Both components now reference the canonical `--pa-success` / `--pa-warning` / `--pa-danger` / `--pa-info` tokens which DO exist.
- **Track backgrounds invisible on dark themes** in `.pa-data-bar` and `.pa-bar-list`. Both used `rgba(0, 0, 0, 0.06)` — a 6%-opacity black that registered as imperceptible against dark surfaces. Migrated to `var(--pa-surface-track)` (12% over `--pa-text-color-1`), which inverts cleanly between light and dark themes alongside the rest of the surface tier system introduced in 2.6.0.
- **`.pa-gauge` inner mask broke on any non-`--pa-card-bg` surface.** Documented above under the gauge rebuild — the inner mask used `background: var(--pa-card-bg)` and rendered as a visible coloured shape when the gauge wasn't placed directly on a card surface. Now uses a true `mask-image` cut, so the donut is a real transparent ring on any surface.
- **`.pa-gauge` inner ring was misaligned with the outer ring.** Documented above — conic gradient and radial mask had different centre points (`(6rem, 3rem)` vs `(6rem, 6rem)`), producing asymmetric ring thickness. Both now centred at `50% 100%`, so the ring is uniformly thick all the way around and both boundaries touch the baseline.
- **Five `rgba(var(--pa-X), Y)` rules across `_query-editor.scss`, `_file-selector.scss`, `_notifications.scss`, and `_timeline.scss` were silently dropped by browsers.** CSS `rgba()` does not accept `var()` as a colour input; the entire declaration is invalid and ignored. The intended subtle background tints (operator-token backgrounds, modal close-button hover, secondary notification action background, file-selector close-button hover, secondary timeline dot shadow) all rendered as transparent, with the layout falling back to whatever inherited backgrounds were beneath. All converted to `color-mix(in srgb, var(--pa-X) Y%, transparent)`.
- **Sass interpolation pattern `#{$x * 100}%` produced invalid CSS** in timeline + composite-badge `color-mix()` calls. Sass interpolated the numeric value but parsed the trailing `%` as a separate literal, emitting `50 %` (with a space) into the compiled CSS — which `color-mix()` then rejected as an invalid percentage, dropping the entire `box-shadow` declaration. All five timeline shadow modifiers (`--success` / `--warning` / `--danger` / `--info` / `--secondary`) and the composite-badge danger focus-ring were affected — shadows simply didn't render. Fixed by moving the unit inside the multiplication: `#{$x * 100%}` makes Sass produce a real percentage value (`50%`) instead of stringifying `50` and concatenating `%`.
- **`.pa-modal__footer` had no `border-radius` declaration — coloured footers squared off at the bottom corners.** The header rule already had `border-radius: var(--pa-border-radius) var(--pa-border-radius) 0 0` for its top corners, but the footer never got the matching `0 0 ...` declaration. With no fill on the footer in the default modal, the container's own radius (with `overflow: hidden`) showed through and nobody noticed. Once a fill landed on the footer (banded variant), the footer's coloured bg painted into the rounded corners and they read as squared. Fixed at the base footer rule (`border-radius: 0 0 var(--pa-border-radius) var(--pa-border-radius)`) so any future variant with a coloured footer benefits — not just banded.
- **Links rendered as browser-default blue (unreadable on dark themes).** The framework had no global `a {}` rule and no link CSS variables — anchors fell back to the browser's user-agent stylesheet (`#0000EE` blue, `#551A8B` purple visited), which has near-zero contrast against most dark themes. Added three new tokens — `--pa-link-color: var(--pa-accent)`, `--pa-link-color-hover: color-mix(in srgb, var(--pa-link-color), currentColor 50%)`, `--pa-link-color-visited: var(--pa-link-color)` — and a global rule in `_base.scss` that consumes them. Links now derive from the framework's accent colour by default, so theme overrides of `--pa-accent` cascade automatically.
    - **Hover** mixes 50% toward `currentColor` (the link's *inherited* text colour at use-site — the cycle from `color:` referencing its own `currentColor` is resolved by CSS to the inherited value), so hover auto-darkens on light themes and auto-lightens on dark themes without per-mode declarations. First attempt used `var(--pa-accent-hover)` (which turned out to be a 12%-opacity background-wash token designed for button hover backgrounds, not text colour — rendered links nearly transparent on hover); second attempt used `currentColor 25%` which was too subtle on themes where accent and text colour share a hue family (warm-cream text + orange accent). Settled on 50% as a balance.
    - **Specificity-safe via `:where()`.** Initial implementation was `a { color: var(--pa-link-color); } a:hover { ... } a:visited { ... }`. CSS treats pseudo-classes as B-tier specificity, so `a:visited` is `(0,1,1)` — *higher* than a typical component-level override like `.pa-sidebar__link` (`(0,1,0)`). Result: any visited link inside the sidebar (or any component setting link colour with a single class but no `:visited` override) inherited the global link colour for visited state only, producing a chequerboard of correctly-coloured unvisited links and global-coloured visited ones. Switched to `:where(a) { ... } :where(a:hover) { ... } :where(a:visited) { ... }`, which forces the entire selector to specificity `(0,0,0)` — any component rule wins automatically, no defensive `:hover` / `:visited` overrides needed in component SCSS.
    - **Existing component-level link styles** (alerts, callouts, navbar, sidebar) keep their local overrides and are unaffected. Themes can override `--pa-link-color` / `--pa-link-color-hover` independently if they want links distinct from the accent (e.g. a theme with an orange accent might want blue links). Browser support for `:where()`: Chrome 88, Firefox 78, Safari 14 — well within the framework's existing `color-mix()` baseline.
- **`.pa-btn--outline-secondary` was invisible on every light-default theme.** The `--pa-btn-secondary-outline-color` default was `#{$btn-secondary-text}` — which on light themes is `#ffffff` (white text intended for a coloured filled button), so an outlined secondary button on a white surface rendered as white border + white text. Default changed to `var(--pa-btn-secondary-bg)` so outline-secondary borrows the *filled* button's background colour (typically a mid-grey) and reads against light surfaces without per-theme overrides. Themes that intentionally diverge (e.g. nato had a manual override) can still set `--pa-btn-secondary-outline-color` directly.
- **Sidebar submenu active item had no colour token — text rendered with poor contrast on themes that gave the active background an accent colour.** Active state set `background-color: var(--pa-sidebar-submenu-active-bg)` but inherited text colour from the sidebar's secondary text token. On themes where the active background is an intentionally high-contrast brand colour (e.g. corporate's `$corporate-blue-600`), the inherited text colour was tuned for the dark sidebar surface and became unreadable against the bright active background. Added `$sidebar-submenu-active-text` SCSS variable (defaults to `$sidebar-text`, so existing themes are unaffected) and matching `--pa-sidebar-submenu-active-text` CSS custom property. Applied at both submenu link active state (`_sidebar.scss`) and collapsed-state toggle active (`_sidebar-states.scss`). Themes that use an accent fill on active items can now override the active text colour to white (or a high-contrast value) independently of the sidebar's regular text colour.
- **`.pa-btn-split` chevron toggle corners rendered square on outline variants when hovered/open** (visible on Cobalt2 outline-secondary and any other theme where the toggle's hover-fill paints into the corner area). The container relied on `overflow: hidden` + `border-radius: var(--pa-border-radius)` to clip both trigger buttons (which had `border-radius: 0`) to a rounded outer shape. With `display: inline-flex` adjacent buttons, hover-fill paint can bypass the rounded-corner clip on the border edge in some browsers/themes, producing visible square corners where the chevron's filled background meets the container's intended rounded boundary. Rebuilt to not rely on container clipping: removed `overflow: hidden` from `.pa-btn-split`; each trigger button keeps its own `border-radius` from base `.pa-btn`; only the **inner** edges (between main button and chevron toggle) are flattened via logical-property radii so the seam between the two buttons stays flush. Also scoped the now-narrower flattening rule to `> .pa-btn:first-child` / `> .pa-btn-split__toggle` (direct children only) so per-row action buttons inside the dropdown menu (`.pa-btn-split__menu .pa-btn`) keep their default radius — they were previously caught by the broader descendant selector. Outer corners now render correctly across all variants (solid, outline, all role colours) and all themes.

## [2.6.0] - 2026-05-07 [PUBLISHED]

### Changed

- **CSS variable consolidation: framework role colours, sentiment scale, contrast tiers, and detail-popover chrome (Visual breaking)**. Previously the seven new KPI showcases each declared their own `:root { --kpi-*: ... }` block (11 tokens × 7 files = 77 duplicated declarations) and the framework's role colours (`$base-success-color`, `$base-warning-color`, `$base-danger-color`) were Bootstrap shades not aligned with the KPI palette. Consolidated into a single source of truth in `_base-css-variables.scss`'s `output-pa-css-variables` mixin; all 7 showcases now reference framework tokens directly. Single override of `--pa-success` (or other role) cascades through buttons + alerts + sentiment scale + KPI components.
    - **Role colours migrated to Tailwind palette** — `$base-success-color: #28a745 → #22c55e` (TW green-500), `$base-warning-color: #ffc107 → #f97316` (TW orange-500), `$base-danger-color: #dc3545 → #ef4444` (TW red-500). Info unchanged at `#17a2b8`. Most visible shift: warning yellow → orange. Themes that override these still win via `!default` cascade. All 15 themes rebuilt against the new core SCSS.
    - **New `--pa-success` / `--pa-warning` / `--pa-danger` / `--pa-info` canonical role tokens** emitted as CSS custom properties (separate from existing `--pa-success-bg` etc. which are component-surface tokens). Button + contextual surfaces rewired to derive: `--pa-btn-success-bg: var(--pa-success);`, `--pa-success-bg: var(--pa-success);`, etc. — so a runtime override of `--pa-success` cascades to both. Hover/light/subtle/border variants stay flat (still derive from `$base-*` at compile time).
    - **New `--pa-very-positive` / `--pa-positive` / `--pa-neutral` / `--pa-negative` / `--pa-very-negative` 5-step sentiment scale.** `--pa-positive` aliases `--pa-success`, `--pa-negative` aliases `--pa-danger`, the outliers (very-positive `#16a34a` TW green-600, very-negative `#dc2626` TW red-600) are explicit darker stops since they're not derivable cleanly via `color.adjust`. Sentiment is *direction of change* (ordinal); role colours are *urgency* (categorical). They coexist intentionally — see Terminal grid's Usage Guide for the action-vs-direction distinction.
    - **New text-contrast tiers** — `--pa-text-strong` (85%), `--pa-text-secondary` (70%), `--pa-text-tertiary` (55%) — emitted as `color-mix(in srgb, var(--pa-text-color-1) X%, transparent)` so they invert in light vs dark themes. Themes can override the whole expression to use flat colours, gradients, or different alphas. Replaces ~25 inline `color-mix(...)` expressions across the showcases. First-pass values were 72/55/42 (matching the original inline alphas) but tier-2 and tier-3 read as marginal contrast on deep navy / saturated dark backgrounds (NATO dark mode in particular); bumped to 85/70/55 across the board. Outlier percentages (50%, 38%, 60%, etc.) stay inline — they're one-offs not worth a token.
    - **Tier + surface vars must be emitted at every mode-switching scope, not just `:root`.** CSS custom property substitution bakes nested `var()` references at the *defining* element, not the using element — so a tier definition like `--pa-text-strong: color-mix(... var(--pa-text-color-1) 85%, transparent)` declared only at `:root, .pa-mode-light` freezes the light-mode `--pa-text-color-1` into its value, and elements inside `.pa-mode-dark` (which overrides `--pa-text-color-1` at body) inherit the light-baked tier value → labels vanish on dark cards. Fix: emit `--pa-text-strong / -secondary / -tertiary / --pa-surface-hover / --pa-surface-track` as a top-level rule with the selector list `:root, .pa-mode-light, .pa-mode-dark`, so each scope re-computes the tiers against its own `--pa-text-color-1`. Themes need no changes — the framework's emitted CSS now covers all three scopes.
    - **New surface tints** — `--pa-surface-hover` (4% over text-color-1) and `--pa-surface-track` (12% over text-color-1) for hover washes and gauge/progress track backgrounds. Same color-mix-derived pattern as the text tiers, same theme-inverting behaviour.
    - **New detail-popover chrome tokens** — `--pa-detail-bg` / `--pa-detail-text` / `--pa-detail-row-label` / `--pa-detail-title` / `--pa-detail-shadow`. Default values keep the Bloomberg-dark aesthetic that all 7 showcases used (deliberately theme-independent for the terminal/data-dashboard look). Override these for a theme-aware popover. Previously duplicated in 7 places.
    - **Per-component cascade variables unified to `--kpi-accent`.** The four genuine cascade vars — `--kpi-bar-color` (comparison gauges), `--kpi-tile-color` (bento), `--kpi-hero-color` and `--kpi-side-color` (hero+supporting) — all did the same job (set the active sentiment colour on a parent, read by sentiment-coloured children inside the same showcase) under different names. Renamed everything to `--kpi-accent` so the authoring contract is identical across designs: set the modifier class on the tile, child elements read `var(--kpi-accent)`. Self-referential indirection on the same element (`--kpi-edit-delta-color`, `--kpi-strip-delta-color` — set and read on the same `.kpi-X__delta`) dropped entirely; replaced with direct `color: var(--pa-positive)` rules since there's no cascade benefit. The two non-colour knobs (`--kpi-gauge-tick-pos` for tick position, `--kpi-gauge-tick-color` for tick colour) keep their gauge-specific names because they're not part of the generic accent-cascade pattern.
    - **Out of scope, follow-up pass:** existing `_statistics.scss` / `_data-viz.scss` / `_data-display.scss` use a 4-step (success/warning/danger/info) scale; migrating to the 5-step sentiment scale means changing class semantics in those components. `_comparison.scss` has hardcoded pinks/oranges (`rgba(244, 114, 182, ...)` etc.) that should become tokens. Both deferred to a separate consolidation pass.

- **Shared chart-trendline tokens for all sparkline-bearing showcases.** Four KPI showcases render an SVG trendline (Terminal grid, Sparkline list, Hero+supporting, Bento). They were on five different heights (`2.6rem` / `3rem` / `4rem` / `5rem` / `10rem`) and the same stroke width (`1.4`). Unified onto two new framework tokens:
    - `--pa-chart-trendline-height` (default `3rem`) — fixed-pixel SVG height. Critical for sparklines using `preserveAspectRatio="none"` because anything inside a stretching SVG distorts along whatever axis the container changes; pinning the SVG to a fixed height keeps Y-amplitude constant regardless of how tall the tile or chart container becomes (same shape as the trailing-dot-as-HTML-span fix from earlier).
    - `--pa-chart-trendline-stroke` (default `2.1`, SVG user-space units) — was `1.4` previously; bumped to give the line stronger presence at the new compact height. Override globally to make every sparkline thicker/thinner with one change.

- **`--kpi-gauge-tick-color` author-controlled knob for the comparison-gauges target tick.** Was hardcoded to `color-mix(in srgb, var(--pa-text-color-1) 45%, transparent)` which washed out against bright fill colours (orange warning fill, red negative fill) — most visible when the tick sits *inside* the bar via `--kpi-gauge-tick-pos: 80%` (the inside-the-bar mode demoed on Server Capacity). Default now `var(--pa-text-color-1)` (full opacity) so the tick reads as a clear vertical bar against any sentiment fill regardless of theme. Override per-tile via `style="--kpi-gauge-tick-color: ..."` for a quieter mark.

- **`pa-stat--square` redesigned: inline number+symbol with container-relative font sizing (Visual breaking)** — the old design used a giant absolute-positioned watermark for `__symbol` (clamp `6.4–9.6rem`, *bigger* than `__number`, at `opacity: 0.12`), positioned behind the number on the right. It only worked for `%` because that single asymmetric character could fade into the background without overflowing the card; multi-character units like `°C`, prefix currencies like `$` and `¥`, and longer suffixes degraded badly — they overflowed, sat in nonsensical positions for prefix marks, and were unreadable on Audi-light's bright color tiles where the 0.12 alpha blended into the surface. New layout:
    - `__number` and `__symbol` sit on the same row baseline-aligned, label pinned to the bottom, no absolute positioning.
    - **Markup order drives visual order**: `<number><symbol>` for suffix units (`87%`, `23°C`), `<symbol><number>` for prefix currencies (`$847K`, `¥12.4M`) — no flag or modifier needed.
    - **Container-relative font sizing**: clamp scale is `cqi` (container query inline-size), not `vw`. The tile gets `container-type: inline-size`, so `__number` is `clamp(2.8rem, 20cqi, 6.4rem)` and `__symbol` is `clamp(1.4rem, 10cqi, 3.2rem)` — sizes track the *tile's* width, not the viewport. Without this, a wide-viewport / narrow-tile combination (e.g. 6 KPI tiles in a 33% column on a 1920px screen) hits the font max and multi-character values overflow the card.
    - `__symbol` is now ~50% of the number's size at `opacity: 0.85` — clearly secondary but readable.
    - Variables changed (all `!default`):
      - `$stat-symbol-opacity`: `$opacity-shadow` (`0.12`) → `0.85`.
      - `$stat-square-number-min`: `4.8rem` → `2.8rem`.
      - `$stat-square-number-scale`: `8vw` → `20cqi`.
      - `$stat-square-number-max`: `7.2rem` → `6.4rem`.
      - `$stat-square-symbol-min`: `6.4rem` → `1.4rem`.
      - `$stat-square-symbol-scale`: `10vw` → `10cqi`.
      - `$stat-square-symbol-max`: `9.6rem` → `3.2rem`.
      - New `$stat-square-symbol-gap: 0.15em` (column gap between number and symbol).
    - **Browser support**: container queries / `cq*` units land in Chrome 105 (Aug 2022), Safari 16 (Sep 2022), Firefox 110 (Feb 2023). Pure Admin already requires modern browsers (uses `color-mix()`, container queries elsewhere), so this is consistent.
    - Existing markup (`__number` + `__symbol` + `__label` siblings under `.pa-stat--square`) keeps working — only the visual presentation changes. Snippets and demo updated to showcase mixed units (`%`, `$`, `°C`, `¥`).
    - Themes that want the old watermark look can override the variables back to their previous values.

### Fixed

- **Progress ring and gauge inner circles ignored theme — numbers invisible in dark themes** — `.pa-progress-ring__inner` and `.pa-gauge__inner` in `_data-viz.scss` painted their center fill with the SCSS variable `$card-bg` (resolved at compile time to the default light card colour). Every other card-like surface in the codebase uses the CSS variable `var(--pa-card-bg)`, which themes override at runtime. Result in dark themes (Audi Dark, Dark, Dracula, etc.): white inner mask under white text (`var(--pa-text-color-1)` resolves to a light value in dark modes), so the percentage values disappeared while the labels (which use `--pa-text-color-2`, a muted grey, on the white inner) stayed faintly visible. Switched both `__inner` rules to `var(--pa-card-bg)` so the inner now tracks theme colour at runtime alongside the text colours already do. No markup change. Themes need a rebuild to ship the fix.

- **Progress bar / ring / gauge tracks barely visible in dark themes** — `$progress-bg`, `$progress-ring-track-color`, and `$gauge-track-color` were all `rgba(0, 0, 0, 0.08)`. 8% black on a light surface reads as a faint grey track (fine); on a dark surface it's effectively invisible — the unfilled portion of every progress bar / ring / gauge dissolved into the card background, so a partially-filled indicator looked the same as a fully-filled one. Switched all three defaults to `color-mix(in srgb, var(--pa-text-color-1) 12%, transparent)`, which inverts with the theme: in light modes it's a subtle dark tint, in dark modes a subtle light tint. Slight opacity bump (0.08 → 0.12) makes the track a touch more pronounced on light surfaces too without dominating. Same `color-mix(... var(--pa-text-color-1) ...)` pattern already used by alert backgrounds (`_base-css-variables.scss:167`). Themes need a rebuild to ship the fix.

- **Mode toggle (light↔dark) required a hard reload to fully refresh the dashboard chart** — two distinct bugs in `demo/views/dashboard.mustache` combined to make this look like a CSS issue but it was JS-only.
    1. **CSS vars were read from the wrong element.** The Top Sales Products D3 chart did `getComputedStyle(document.documentElement)` to pull `--pa-text-color-1`, `--pa-text-color-2`, `--pa-accent`, `--pa-border-color`, and `--base-font-family`. But the mode classes (`.pa-mode-light` / `.pa-mode-dark`) live on `<body>`, not `<html>` (`demo/views/layout.mustache:158-164`). CSS custom-property values defined on a child don't propagate up to the parent — so `<html>` always returned the `:root` (dark-default) values regardless of mode. Most visible on Audi-light: the Y/X axis labels rendered white-on-white because `<html>` reported `--pa-text-color-1: #ffffff` while `<body>` correctly held the light override `#212529`. Affected every theme that ships a `.pa-mode-light` block; the dark-mode case happened to render correctly only because both `:root` and `.pa-mode-dark` set the same values. Fix: read from `document.body`.
    2. **CSS vars were snapshotted at draw time, with no refresh on toggle.** The chart code ran once at `DOMContentLoaded` and baked accent/text/border colors into the SVG nodes. Toggling mode flipped the body class — every CSS-driven element on the page updated instantly — but the SVG's text fills and bar fills stayed frozen at the old mode's values. Hard reload re-ran the snapshot and the chart looked right again. Fix: wrapped the render in `renderSalesChart()`, called once at load and again on every `pa:theme-change` window event.

### Demo

- **New `pa:theme-change` window event for theme-aware JS.** `demo/js/settings-panel.js` now dispatches `new CustomEvent('pa:theme-change', { detail: { kind: 'mode' | 'variant', ... } })` after `applyThemeMode()` and `applyColorVariant()` flip the body class. Any code that snapshots CSS vars at draw time (charts, canvas, SVG, web components) should listen on `window` and re-render. Documented in the README's "Theme Modes" section as the recommended convention for consumers building their own mode toggles. Pure-CSS code (anything using `var(--pa-*)` directly in stylesheets or inline `style=`) needs no changes — it already updates live with the body class flip.

- **New `KPI` sidebar group + first showcase: Terminal grid.** Added a dedicated `KPI` submenu in the sidebar (between Timeline and Virtual Scroll) for showcasing distinct KPI indicator designs as separate pages — one design per page rather than piling them onto Data Visualization. First entry is **Terminal grid** (`/kpi/terminal-grid`, view: `kpi-terminal-grid.mustache`), a Bloomberg-style dense panel with mono numbers, status pills (`WARN` filled / `GOOD` text-only / `NEUTRAL` filled-grey), inline SVG sparklines with trailing dots, ▲▼ deltas, and three view modes (`VALUE` / `Δ%` / `TREND`) swapped via a segmented toggle. The page also includes three layout stress tests of the same six tiles — a 2-col dense grid (the canonical look), a 1×3 page-grid layout (`.pa-col-1-3`), and an asymmetric `.pa-col-25` + `.pa-col-45` stack — to surface how the tile chrome behaves at narrow vs mid widths. New `.kpi-tile--standalone` modifier for tiles living directly inside a `.pa-col-*` (full border + card-bg + bottom margin so a tile doesn't look orphaned outside a `.kpi-terminal__grid`).
    - **Hover detail popover via Floating UI, anchored to the cursor.** The framework's primitives split awkwardly here: `pa-tooltip` is text-only via `attr(data-tooltip)` on a `::before` pseudo-element (can't render the structured Current/Previous/Δ-absolute/Δ-percent/Target table), and `pa-popover` is click-triggered. So the page borrows the Floating UI recipe (`computePosition` + `flip` + `shift`) already used by `tooltips-popovers.js` and `popconfirm.mustache`, but feeds it a *virtual reference element* built from `e.clientX/e.clientY` on `mousemove`, so the popover follows the cursor instead of being statically anchored to the tile. `position: fixed` + `strategy: 'fixed'` because cursor coords are viewport-relative; `pointer-events: none` so the cursor passes through to the tile (no oscillation between mouseenter/mouseleave); each `.kpi-tile__detail` is moved to `<body>` on init to escape ancestor `overflow: hidden`. Tile-anchored placement was tried first but in vertical-stack layouts (the 25% column) every tile's "above-it" geometry sat in an identical-looking gap above the next tile, which read as "popover is always at the same spot."
    - **Color hierarchy via `color-mix(white, alpha)`, not theme tokens.** The design wants four distinct text levels — focal value, label, secondary unit, dim metadata — but the available `--pa-text-color-2/3/4` tokens (Audi dark: `#cccccc / #999999 / #666666`) didn't give enough contrast spread; in the first pass everything read as "the same white." Switched the supporting text to `color-mix(in srgb, var(--pa-text-color-1) X%, transparent)` with explicit alphas (`72%` for label, `55%` for unit, `42%` for id and prev/delta row) so only `__num` is full `--pa-text-color-1`. This inverts cleanly in light themes (where `--pa-text-color-1` resolves to dark — same `color-mix` produces dark gray on light surfaces) so the hierarchy survives mode toggling without theme-specific overrides.
    - **Font-size pass after the contrast fix:** label `1.25rem → 1.4rem`, value `3.4rem → 3.8rem`, unit `1.4rem → 1.6rem`, id-row `1.1rem → 1.3rem`, prev/delta `1.15rem → 1.3rem`, status pill `1rem → 1.2rem` (padding `0.2/0.7 → 0.3/0.9`). Once the supporting text dropped to `color-mix(... 42%)` it could carry slightly more weight without competing with the value, and the label needed to grow to clearly out-weight the now-dim id/prev rows.
    - **Self-contained:** all CSS lives in an inline `<style>` block scoped under `.kpi-terminal` / `.kpi-tile`, all JS in an inline `<script>`. No additions to core. Will promote to `core-components/_kpi-terminal.scss` once the design language stabilises across additional KPI showcases.

- **Shared `--kpi-*` design-token surface for all KPI indicators.** Extracted the previously hardcoded green/red hex values and the popover chrome (background, text, shadow) from inline rules into a `:root`-scoped variable set, defined identically in every KPI page and intended for de-duplication into a shared SCSS module when these graduate to core. Defined on `:root` (not `.kpi-terminal`) because the JS moves popover detail elements to `<body>` on init — they need to inherit the tokens at body level, not from a possibly-no-longer-ancestor card. Variables exposed:
    - `--kpi-very-positive` (`#16a34a`) / `--kpi-positive` (`#22c55e`) / `--kpi-neutral` (`#9ca3af`) / `--kpi-negative` (`#ef4444`) / `--kpi-very-negative` (`#dc2626`) — a 5-step semantic scale rather than binary positive/negative. `--positive`/`--negative` for ordinary deltas, `--very-X` for outliers (big jumps, breakouts) where you want extra emphasis, `--neutral` for "no meaningful change". KPI.05 in both showcases uses `--very-positive` (Error Rate dropping 38–41%) to demonstrate the deeper-green outlier color in context.
    - `--kpi-detail-bg` / `--kpi-detail-text` / `--kpi-detail-row-label` / `--kpi-detail-title` / `--kpi-detail-shadow` — popover chrome, intentionally Bloomberg-dark by default regardless of host theme. Override these to opt into a light or theme-aware popover.
    - **Class surface mirrors the scale:** `.kpi-tile__value--{very-positive | positive | neutral | negative | very-negative}` for the focal number, `.kpi-tile__delta--{...}` for the prev-row delta, and direction-named `.kpi-tile--{up-strong | up | flat | down | down-strong}` for the sparkline (named for sentiment, not line shape — see comment in `kpi-terminal-grid.mustache` about why `error rate dropping` uses `--up` despite the line going down).

- **Second KPI showcase: Sparkline list** (`/kpi/sparkline-list`, view: `kpi-sparkline-list.mustache`). Each KPI is one row: **label · sparkline · value · Δ%**. No view-mode toggle, no status pills, no prev row — built for fast vertical scanning and side-by-side comparison rather than per-tile depth. The sparkline gets a filled area underneath the line (a `<polygon>` sharing `currentColor` with the `<polyline>`, at `fill-opacity: 0.18`) for stronger visual weight than the terminal-grid version. Reuses the shared `--kpi-*` tokens and the cursor-anchored Floating UI popover recipe from terminal-grid verbatim. Same three-section layout testing pattern (canonical full-width / `1×3 .pa-col-1-3` / `2×3 .pa-col-25 + .pa-col-45 + .pa-col-25 chart-first`).
    - **Container queries on the card, not media queries.** The 4-col row layout (`label · chart · value · delta`) needs ~500px of min-content; below that the columns overrun. Set `container-type: inline-size` on `.kpi-spark-list` and added two `@container` breakpoints so the *same* row markup adapts based on whichever card width it lives in: `≤640px` → 2-row stack (label/value/delta on top, full-width chart below), `≤360px` → 3-row stack (label, then chart, then value/delta side-by-side at the bottom). A canonical card at 1200px stays 4-col while a `1×3` card at 400px stacks — both on the same page at the same viewport width. This is the right axis for a layout that lives in different surfaces at different sizes.
    - **`.kpi-spark-list--chart-first` modifier** for opt-in chart-above-value stacking. Default keeps the 2-row "summary line + supporting visual" pattern (value on top, chart below); the modifier flips to "label / chart / value+delta" which preserves the canonical L→R reading order (label → chart → value → delta) when rotated 90°. The very-narrow `≤360px` fallback always uses the 3-row layout regardless of modifier — at that width neither variant has horizontal room for label+value+delta on one line. Section 2 demos the modifier on its middle 1×3 card so both stacking styles are visible side-by-side at the same width; Section 3's third 25% column also uses the modifier (visible at viewport widths >1440px where the 25% col is wider than 360px and the modifier vs default actually diverge).

- **Third KPI showcase: Comparison gauges** (`/kpi/comparison-gauges`, view: `kpi-comparison-gauges.mustache`). Goal-oriented progress bars: each KPI shows **label · value** on top, a **bar with target tick** in the middle, and a **0 · tgt XYZ** scale below. Bar fill is `value/target × 100%`, capped at 100%; overshoots are signalled by colour, not by overflowing the bar. Adds **`--kpi-warning`** (`#f97316`, Tailwind orange-500) to the token surface for "off-target / approaching limit" states — sits *alongside* the 5-step semantic scale, not on it (different axis: warning is for proximity-to-limit, not for direction-of-change). Per-tile bar colour is set via a `--kpi-bar-color` custom-property cascade that the four `.kpi-gauge--{positive | warning | negative | neutral}` modifiers each set, then the fill reads — cleaner than per-modifier-per-element rules and lets a host app override at the tile level. Internal 2-col grid collapses to 1-col via `@container (max-width: 600px)` so the 1×3 page-grid cards and the 25/45 cards stack their gauges vertically. Same three-section layout testing pattern as the other KPI showcases.

- **Fourth KPI showcase: Hero + supporting** (`/kpi/hero-supporting`, view: `kpi-hero-supporting.mustache`). Marketing/exec dashboard pattern: **one headline metric on the left** (huge container-query-relative value via `clamp(4rem, 17cqi, 7rem)`, inline `▲ 13.3% · vs last month · tgt $900K` meta row, big filled-area sparkline) and **a vertical side rail of supporting metrics on the right** (5 compact tiles, each with label · value · delta-vs-prev). Card body is a 2-column grid; container query (`@container (max-width: 700px)`) collapses to single column on narrow page-grid cards so the same markup works at 1×3 and 25/45 widths.
    - **Side rail tile is a 2×2 grid** with the value spanning both rows on the right column. Left column has label (row 1, `align-self: end`) and delta (row 2, `align-self: start`), so they tuck against the vertically-centred value rather than each having its own full-width row. Looks balanced when the label is one line and still reads cleanly when it wraps to two.
    - **Hero chart fills extra vertical space without distorting the line.** When the side rail has more tiles than the hero's natural content fills, the parent grid stretches the hero column; chart container has `flex: 1 1 10rem` so it grows to absorb that extra height. *But* the SVG inside is wrapped in a fixed-`10rem`-height `.kpi-hero-main__chart-svg` span pinned to the bottom (`align-items: flex-end`), so the line's Y proportions are never distorted regardless of how tall the parent gets. Same shape as the bullet-as-CSS-span fix: anything inside `preserveAspectRatio="none"` stretches with its container, so things-that-shouldn't-stretch (the dot, now also the SVG itself) need to live outside that scaling or have their dimensions in absolute pixels. Empty space appears above the chart (between the meta row and the sparkline) instead of compressing into a void below it.

- **Fifth KPI showcase: Bento layout** (`/kpi/bento`, view: `kpi-bento.mustache`). Magazine-style asymmetric tile sizing with sparklines as soft background fills behind the values. 6 tiles arranged on a 6-col × 3-row grid: hero (`grid-area: hero`) takes the left half across the top two rows, two stacked tiles fill the right half of those rows, three equal tiles span the bottom row. Tile placement is by source order via `:nth-child` so authoring just lists six tiles in reading order. Each tile is a 2-row internal grid (`"label delta" / "value value"`) where the value sits at the bottom-left layered over the absolutely-positioned chart underneath it (`z-index: 1` on the value, `z-index: 0` on the chart) — the sparkline reads through behind the digits rather than living in its own column. Hero modifier scales the value via container-query units (`clamp(3.6rem, 22cqi, 7rem)`) tracking the *tile's* width, not the card's; non-hero tiles use a smaller scale (`clamp(2rem, 14cqi, 3.2rem)`) so they stay readable at 1×3 and 25/45 page-grid widths without the headline number colliding with the unit. Card-level container query (`@container (max-width: 700px)`) collapses the whole bento to a single-column stack and resets `grid-area: auto` on every tile so the same markup works inside narrow page-grid cells. Reuses the shared `--kpi-*` tokens, the cursor-anchored Floating UI popover recipe, and the SVG-circle → CSS-span sparkline-dot fix from the previous showcases.
    - **Sparkline opacity dialled down so the value stays the focal point.** First pass used the same `fill-opacity: 0.18` and full-opacity stroke as the other KPI showcases, but the bento's behind-the-digits placement is different: in the other pages the chart sits in its own column or row next to the value, so the line/area sit *beside* the number. Here both the line stroke (full opacity, sliced through digits like Cloud Spend's "128") and the area fill (0.18 green wash behind the entire "849") visibly competed with the headline. Dropped polygon fill to `0.10` (steeper drop because it spans the full width directly behind the digits) and added `stroke-opacity: 0.55` to the polyline (line still reads as a defined shape but no longer crosses numbers at full intensity).

- **Seventh KPI showcase: Editorial minimal** (`/kpi/editorial-minimal`, view: `kpi-editorial-minimal.mustache`). Six KPIs in a 2×3 grid with hairline rules between cells, generous space, and an extra-light-weight number as the focal point per tile. No charts, no pills, no decorations — the design's expressive energy goes into one thing: the headline number. Tiny uppercase mono caption above; small delta + `tgt {value}` meta row below; that's the whole tile. Built for executive / weekly-review pages where the operator wants to see "how are we doing" at a glance and read the supporting context (current vs prev vs target etc.) only on hover. Renders as a table card (zero card-body padding) so the inter-tile rules go edge-to-edge to the card border. Reuses the shared `--kpi-*` tokens and the cursor-anchored Floating UI popover recipe; same three-section layout testing pattern as the rest of the showcases (canonical full-width / 1×3 page-grid / asymmetric 25/45/30).
    - **Hairline rules via `gap: 1px` over a coloured grid background.** First pass used per-cell borders (`border-right` + `border-bottom` with edge-suppression rules), but the bookkeeping for "no border on last column / no border on last row / no double-border at intersections" gets fragile when the column count changes via container queries. Switched to the simpler trick: `.kpi-edit__grid` paints `background: var(--pa-border-color)` and uses `gap: 1px`, while each `.kpi-edit__tile` paints `background: var(--pa-card-bg)` over its own area — only the gap shows through, giving perfect single-pixel hairlines on every interior boundary (vertical *and* horizontal) for free, regardless of column count. The card's outer border supplies the perimeter. Works without any edge-suppression rules even when the container query collapses 3-col → 2-col → 1-col.
    - **Extra-light value typography breaks the mono convention used elsewhere.** Other KPI showcases use `var(--base-font-family-mono)` for the focal value (helps numbers tabulate, gives the "data terminal" feel). Editorial minimal explicitly does *not* — the value uses `var(--base-font-family)` at `font-weight: 200`, because mono fonts rarely ship with a true extra-light weight and the design's whole identity is the thin numeral. Tested 300 first; reads as "regular but slightly thinner" against the body's 400 default. 200 reads as deliberately light. Tabular numerals are preserved via `font-variant-numeric: tabular-nums` so column-aligned numbers (e.g. multiple `XX.X%` values across tiles) still line up. Value size is container-relative — `clamp(3.2rem, 18cqi, 5.6rem)` — so the same markup shrinks gracefully into 25% page-grid cells without manual breakpoints.
    - **Container queries collapse 3 → 2 → 1 cols.** `.kpi-edit__grid` declares `container-type: inline-size`; `@container (max-width: 640px)` flips to 2-col, `@container (max-width: 360px)` flips to 1-col. The canonical full-width card stays 3-col; narrower cells drop one or two steps automatically.
    - **`.kpi-edit__grid--2col` modifier for deterministic 2-col layout.** "1/3 of the page" varies a lot across viewport widths (a `pa-col-md-1-3` card is ~400px on a laptop and ~800px on a 4K display), which means the 640px container-query breakpoint can't reliably catch every "I want 2-col here" case. The modifier overrides `grid-template-columns` to `repeat(2, 1fr)` regardless of card width — used in the demo's 1×3 row (each card has 4 tiles, modifier forces clean 2×2) and the 25%/30% mini cards in the asymmetric row (2 tiles → 1 row of 2). Container queries stay as the responsive default; the modifier is the deterministic opt-in. **Authoring contract**: pick the column count (default 3-col, or `--2col`), drop tiles in reading order, keep tile count a multiple of cols to avoid orphan rows. CSS Grid auto-flow handles positioning; the `gap: 1px` background trick paints hairlines automatically regardless of column count.

- **Sixth KPI showcase: Numeric strip · densest** (`/kpi/numeric-strip`, view: `kpi-numeric-strip.mustache`). Tabular "spreadsheet-style" table card with `metric / now / prev / Δ% / vs target` columns — most data per pixel, no chart chrome. Each row is its own grid sharing the same column template (per-row hover hosts for the cursor-anchored detail popover), so cells align across rows via identical `fr` units; subgrid would be more semantically accurate but the per-row-grid form is simpler and the alignment is identical. The `vs target` column carries a tiny progress bar with the percentage value pinned below it; bar fill is theme-neutral grey (the *pct value* signals overshoot/undershoot — "97%" vs "108%" vs "54%" — so colour reinforcement isn't needed) and the bar is visually capped at 100% so an over-target metric reads as "fully filled" without overflowing the container.
    - **Wide-only by design — no responsive collapse.** First pass had a `@container (max-width: 640px)` rule that flattened each row into a 3-row mini-card (metric+now / prev+delta / target-bar) for narrow page-grid cells, but the resulting layout was visually identical to the Comparison gauges showcase. Rather than ship two designs that converge at narrow widths, this one stays tabular at any width and the recommendation is: route narrow placements to Comparison gauges instead. Container-query block + `container-type: inline-size` removed accordingly.
    - **Table-card style: zero card-body padding, dividers edge-to-edge.** `.kpi-strip__body { padding: 0 }` and the horizontal inset lives on each row (`padding: 1.1rem 1.6rem`), so the row's `border-top` divider extends full-width to the card border. Reads as the card's content rather than a table sitting inside another panel.
    - **`.kpi-strip--no-prev` modifier — 4-col variant** (metric / now / Δ% / target) for placements where there isn't room for prev *and* now side-by-side. Markup omits the prev cells; the modifier just overrides `grid-template-columns` to redistribute the space. Demo's 25/35/40 row applies the modifier to the 25% card so the constrained variant is visible alongside the full 5-col form. At 25% page-width the column packing is at the design's lower limit (long delta values can still push past a 1.1fr now-cell when the metric label takes most of the row); end-developer's call whether that's acceptable for their layout.

- **Per-page Usage Guide + CSS Classes Reference cards on every KPI showcase** — same convention as `/components/buttons`. Each of the seven KPI demo pages now ends with two `pa-card` blocks: a Usage Guide explaining when to use the design, the key technical patterns (modifiers, container queries, layering tricks, popover recipe), and any per-page authoring contract; and a CSS Classes Reference grouping every page-specific class by purpose (card structure, tiles, content, sentiment modifiers, popover) plus the shared `--pa-*` token surface used by that showcase. Replaces the previous "you have to read the inline `<style>` to learn how this works" experience with proper integrator-facing docs.

### Fixed (KPI showcases)

- **Sparkline trailing dot rendered as an oval at non-square aspect ratios** in both Terminal grid and Sparkline list. The chart SVG uses `preserveAspectRatio="none"` so the line stretches to fill arbitrary cell widths — necessary for the design — but as a side-effect the X and Y scale factors differ (e.g. a 200×40 cell with a 100×24 viewBox gives x-scale 2 and y-scale 1.67), and an SVG `<circle>` is uniformly defined by `r` only, so it renders as an ellipse stretched along the dominant axis. Most visible in the Sparkline list's wider rows where the dot looked clearly oval. Fix: at init, JS converts each `<circle>` to a CSS-positioned `<span>` inside a `position: relative` wrapper. The dot is now sized in CSS pixels (`6px` × `6px`, `border-radius: 50%`) so it stays a true circle regardless of chart aspect ratio. Position is computed from the original `cx/cy` as viewBox-relative percentages so the dot lands at the same end-of-line spot. The line and area still stretch via the SVG; only the dot is HTML-rendered. Color rules updated to set `color` on the chart wrapper (not just the SVG) so `currentColor` resolves correctly for both the SVG content (line/area) and the new dot. Pattern applies to any future KPI design that uses sparklines with end markers.

- **Bento sparkline Y-amplitude depended on tile height** — same `preserveAspectRatio="none"` problem as the dot, but for the *line itself*. `.kpi-bento-tile__chart` was absolutely positioned at `bottom: 0` with `height: 65%` (70% on the hero), and the SVG inside was `height: 100%` of that container. Taller tiles (the hero spans two grid rows) stretched the SVG vertically, which scaled the line's Y proportions — the same trend looked dramatically different on the hero vs the supporting tiles. Fix: chart container becomes a flex column with `align-items: flex-end`; SVG wrapper goes to `height: var(--pa-chart-trendline-height)` so its Y dimension is fixed regardless of container height. Empty space appears above the SVG inside the chart container instead of stretching the line. Same fix shape used for `.kpi-hero-main__chart-svg` previously.

## [2.5.0] - 2026-04-25 [PUBLISHED]

### Changed

- **`pa-alert__heading` size is now opt-in (Breaking)** — was hardcoded to `font-size-lg`; now defaults to the alert's body font-size + semibold weight (same scale as inline `<strong>`), with a new `pa-alert__heading--lg` modifier for the bigger, deliberate-read presentation. This unifies the markup for title-and-body alerts: always `pa-alert__heading`, just add `--lg` when you want it loud. The previous "compact-vs-punchy" snippet pattern (mixing `<strong>` and `pa-alert__heading` for the same conceptual job) is dropped — `<strong>` stays only for genuinely inline single-line emphasis ("**Primary!** This is a primary alert"). To preserve the old appearance on existing alerts that used `pa-alert__heading`, add `pa-alert__heading--lg`. Demo + form-demo updated; snippet expanded with the new convention.

- **Alert default alignment is now centred + new `pa-alert--multiline` opt-out** — `.pa-alert` was `align-items: flex-start`, which made an icon next to single-line `__content` sit on the top edge of the line-box instead of centring with the text glyph. Most visible on the Sizes demo's default alert (icon + one-line content felt "off-centre"). Default flipped to `align-items: center` so icon + single-line content centres vertically. For the rare icon + multi-line `__content` case (heading + body + actions inside `__content` next to an icon), add the new `pa-alert--multiline` modifier — it restores `align-items: flex-start` so the icon stays at the top with the heading instead of floating in the vertical middle of the stack. Pure structural stacks without an icon don't need it (each child is `flex-basis: 100%`, one item per row, alignment irrelevant).

- **`pa-alert__actions` now renders with a toast-style separator** — was a plain flex row; now uses the same `border-top` + symmetric `padding-top` pattern as `.pa-toast__actions`, so an action-bearing alert (System Update / Update Now, Sync failed / Retry) reads with the same visual weight as a custom-action toast. Markup contract is unchanged. Separator color is `rgba(0, 0, 0, $opacity-light)` to match the existing in-alert `<hr>` convention so it tints subtly across all alert variants without fighting the variant background. `flex-wrap: wrap` added so a long action row breaks gracefully.

- **De-duplicated `.pa-pager` and `.pa-load-more`** — full definitions of both components had been living in both `_tables.scss` (lines 475–608) and `_pagers.scss`. `_pagers.scss` loads last in `_core.scss`, so its definitions already won at cascade time, but the duplicate block in `_tables.scss` was stale in one subtle way: `_pagers.scss`'s spinner used the raw SCSS `$accent-color` (resolved at compile time — no runtime theme response) while the `_tables.scss` copy used `var(--pa-accent)`. Removed the duplicate from `_tables.scss` and ported the `var(--pa-accent)` upgrade into `_pagers.scss`, so the load-more spinner now tracks theme colour at runtime. No visual change for the default theme; RTL/theme switching now updates the spinner colour live.

- **Popconfirm position classes renamed to logical start/end (Breaking)** — `pa-popconfirm--right`/`--left` are now `pa-popconfirm--end`/`--start`, and the SCSS uses logical properties (`margin-inline-start/end`, `inset-inline-start/end`) so the popconfirm and its arrow mirror correctly in `dir="rtl"`. The block-axis variants (`--top`/`--bottom`) keep their names but also use logical centering now. This reverses the v1.5.0 "Kept as physical" exception for popconfirm — tooltip has been logical since a later pass, so this brings the two siblings back in line. No backwards-compatibility aliases; update markup directly. The `positionPopconfirm` JS helpers in the demo (`demo/views/popconfirm.mustache`, `demo/views/buttons.mustache`) and the snippet (`packages/core/snippets/popconfirm.html`) gained a small translation layer that maps logical class names to the physical placements Floating UI's `computePosition` expects, then maps the post-flip result back.

### Fixed

- **Alert sizes were a no-op + default sat outside the size scale** — `.pa-alert--sm` and `.pa-alert--lg` both pulled their padding from `$alert-padding-v/h`, which itself defaulted to `$card-footer-padding-v/h` — the same values the default rule used. Result: all three sizes rendered at identical padding, and `--sm` even had the same `font-size: $font-size-sm` as the default rule. Worse, `$card-footer-padding-v/h` is `1.2rem / 1rem` (V > H) — fine for card footers but visibly off as an alert default, and the V (1.2rem) was actually *bigger than `--lg`'s* (1rem), so default sat outside the scale ("not in the middle"). Two-part fix:
    - New SCSS variables `$alert-padding-sm-v/h`, `$alert-padding-lg-v/h`, `$alert-font-size-sm`, `$alert-font-size-lg` in `variables/_components.scss` (all `!default`).
    - `$alert-padding-v/h` itself decoupled from `$card-footer-padding-v/h` and given alert-tuned defaults (`$spacing-md / 1.25rem` = 0.75rem / 1.25rem) so default sits in the middle of the scale.
    - Final scale: V steps `0.5 → 0.75 → 1rem`, H steps `1 → 1.25 → 1.5rem` — clean 0.25rem increments. Font-size steps `1.2 → 1.4 → 1.6rem`.
    - `.pa-alert__close` now uses `$alert-padding-v/h` too so its click-target tracks the alert body padding.
    - Themes can override any of the new variables to retune the scale.

   Existing alerts will render with tighter vertical padding and slightly looser horizontal padding than before — the visual rhythm now reads as a horizontal banner.

- **Alert layout for multi-element content** — the alert is `display: flex; flex-wrap: wrap`, which had left structural children (`__heading`, `__list`, `__actions`, top-level `<p>`, `<hr>`) at content width, so they sat beside each other instead of stacking. The System Update example surfaced the bug clearly: the action buttons floated mid-alert next to the bullet list, and the divider rendered with a "big gap above" because the heading's `margin-bottom: $spacing-sm` doubled up with the flex container's `gap: $spacing-sm`. Fixes:
    - `flex-basis: 100%` on `__heading`, `__list`, `__actions`, top-level `<p>`, `<hr>` — each breaks onto its own row in the wrap.
    - Dropped `margin-bottom` on `__heading` and `margin` on `__list`. Flex gap supplies the spacing; no more doubling.
    - `__actions` margin-top reset to `0` (was `$spacing-base`). The flex-gap above + `padding-top` below the border now gives consistent spacing on both sides of the divider.
    - `__content` got `min-width: 0` so long content can shrink + wrap rather than overflow in narrow alerts.
    - Inline patterns (`<strong>title</strong> message`, `__icon` + `__content`) still stay on the flex row as before — only structural children got the full-row treatment.

### Demo

- **Alerts page restructured** — split out two showcases that were either buried or absent. New cards: "Alerts with custom actions" (System Update, Sync failed with Retry/Dismiss, compact Cookies disabled with single button), "Header style: compact vs. punchy" (same Validation failed / Saved messages rendered both ways side by side), and "Sizes" (explicit sm / default / lg stack — `--lg` was undemoed before). "Alerts with Additional Content" stays focused on `__heading` + `__list` + `<hr>`. "Compact Alerts in Grid" renamed to "Status strip layout" since it's a real-world layout example, not a sizes demo.

### Documentation

- **Snippets audit + gap pass complete** — every snippet under `packages/core/snippets/` cross-checked against its SCSS source and brought into accuracy in 27 commits (one snippet per commit, tracked in `snippets/AUDIT.md`). Wrong attribute names (`web-multiselect`'s `--ml-*` → `--ms-*` prefix; `auto-close` values; `disabled-dates-handling`), dead classes (`pa-loader--sm`, `pa-tabs__item--h-3x`, several modal/forms/layout modifiers), and structural omissions (`.pa-virtual-table` shell, `.pa-navbar-search`, `.pa-shortcut-help`, `pa-table-card` family, modal-dialogs JS API, customization layers) all corrected. Gap pass added four new snippets — `filter-card.html`, `statistics.html`, `notifications.html`, `data-display.html`. Three components (`file-selector`, `logic-tree`, `smart-filters`) deferred until their APIs stabilize. `snippets/manifest.json` regenerated.

- **`alerts.html` snippet expanded** — new "compact multi-line alert" pattern (`<strong>title</strong> + <p>body</p>`) documented alongside the existing `__heading` punchy variant, with explicit guidance on when to pick which (status banners vs. deliberate-read alerts). New "LAYOUT NOTE" explaining the flex-wrap + flex-basis: 100% behavior so consumers know which children stack vs. stay inline. `__actions` description updated to flag the toast-parallel separator.

### Added

- **Form Demo showcase page (`/showcases/form-demo`)** — New entry under Practical Examples that mirrors the LiveView form demo from `keen-pure-admin` in pure vanilla JS. Demonstrates the end-to-end CRUD pattern built on Pure Admin form components:
    - **Inline validation errors** — each field sits in a `.pa-form-group[data-field="…"]` with a `<small data-error-for="…" class="pa-form-help pa-form-help--error">` slot below. The submit handler flips `pa-form-group--error` and `pa-input--error` / `pa-select--error` on the relevant controls and unhides the help text, so the template is declarative and the JS just toggles state.
    - **Summary alert with replace semantics** — validation failure, simulated server error, edit-mode entry, and success all write through a single `#formDemoAlertSlot` so banners never stack.
    - **Force validation errors checkbox** — pins a fixed error map on every field so all six error states render without needing bad input. The checkbox keeps its state across submits for fast iteration on styling.
    - **Edit / Update flow** — pencil button loads the row into the form, swaps the submit label to "Update Entry", hides Reset, and reveals Cancel. Cancel drops changes and exits edit mode; Update writes back to the same row.
    - **Optimistic delete with toast + Undo** — delete removes the row immediately and calls `PureAdmin.toast.show({ actions: [{ label: 'Undo', … }] })`. Undo restores the row at its original index; the `restored` flag guards against late-click double-restore.
    - **Simulated server failure** — `simulateServerSave()` resolves with a ~10% failure rate after a short delay so both success and danger alert paths are exercisable without any tooling.
    - **Stored submissions table** — responsive striped/hover table with count badge and Clear All (native confirm, since there's no undo affordance for the bulk wipe).
- **Files added:** `demo/views/form-demo.mustache`, `demo/js/form-demo.js`. **Route + sidebar:** new `/showcases/form-demo` route in `demo/server.js` with `isFormDemo` active flag, linked from Practical Examples in `demo/views/partials/sidebar.mustache`.

---

## [2.4.0] - 2026-04-16

### Added

- **Theme-aware demo dashboard chart** — The D3 horizontal bar chart on the dashboard (`demo/views/dashboard.mustache`) now sources all its styling from Pure Admin CSS custom properties instead of the hardcoded coral red it had been painting in every theme. Establishes the canonical pattern for making SVG charts track the active theme:
    - **Colors** — bar fill from `--pa-accent`, label colors from `--pa-text-color-1/2`, axis lines from `--pa-border-color`
    - **Typography** — pulls `--base-font-family` from the computed `:root` style and applies `font-family` *explicitly on every `<text>` element* (axis ticks and value labels), not on the SVG root. `font-family: inherit` on an SVG wrapper does not reliably propagate to child text nodes across every engine, which was causing Chrome to fall through the font stack to Arial even when the theme font was loaded. Setting the family on each text element forces correct resolution. The same approach should be used for any future SVG chart.
    - **Previous bug** — the old script read `--accent-color` (not a Pure Admin variable) and fell back to a hardcoded `#e63946`, so every theme produced the same coral bars.

### Removed

- **`download-themes` bin** — removed in favor of the [`pureadmin` CLI](https://www.npmjs.com/package/@keenmate/pureadmin). Use `npx pureadmin themes add <id>` to download and register themes, or `npx pureadmin themes update` to refresh changed ones. The legacy `scripts/download-themes.js` is no longer shipped with this package.

### Changed

- **README — Theme Setup** — rewritten to document the `pureadmin` CLI workflow (`themes add`, `themes update`, `themes list --local`) and `pureadmin.json` config file. The legacy `themes.json` / `.themes.json` scheme has been dropped.

### Fixed

- **KPI square stats (`pa-stat--square`) theming** — Color variants (`--primary`, `--success`, `--info`, `--warning`, `--danger`) were referencing raw SCSS variables that resolved to core defaults (Bootstrap blue/green/etc.) instead of the active theme's palette. Switched to `var(--pa-accent)`, `var(--pa-success-bg)`, `var(--pa-info-bg)`, `var(--pa-warning-bg)`, `var(--pa-danger-bg)` + corresponding `--pa-btn-*-text` vars so squares pick up theme colors at runtime.
- **Profile panel header readability on colored headers** — `__name` and `__email` were using body text color vars (`--pa-text-color-1/2`), which come out dark in light mode and were unreadable on themes with dark/colored headers (NATO, corporate). Switched to `var(--pa-header-profile-name-color)` (which every theme sets to contrast with `--pa-header-bg`), with `opacity: 0.75` on email for hierarchy.
- **Profile panel role badge (`__role`)** — Accent-light bg + accent text was invisible on dark headers. Now uses `color-mix(in srgb, var(--pa-header-profile-name-color) 15%, transparent)` for the tint and full name-color for text, so it reads on any header bg. Fallback to `--pa-accent-light` for older browsers.
- **Profile panel tab icons** — Switched from `--pa-header-text-secondary` (inconsistent across themes with colored headers) to `--pa-header-profile-name-color` with `opacity: 0.6` inactive / `0.85` hover / `1` active. FontAwesome icons inherit via `currentColor`, so they brighten automatically.

---

## [2.3.6] - 2026-04-04 [PUBLISHED]

### Added

- **Responsive font sizing classes** — `pa-font-responsive` shorthand (10px desktop, 12px mobile) and granular `pa-font-base-{9-12}` / `pa-font-mobile-{9-12}` classes for declarative, FOUC-free scaling on `<html>`
- **Getting Started demo page** — Installation, theme management via CLI, responsive font sizing, RTL support, BEM naming reference

### Fixed

- **Theme variables page** — Updated outdated "9 Themes" to "All Themes", fixed stale file paths referencing moved themes repo, fixed Benefits section alert layout

---

## [2.3.5] - 2026-04-01

### Fixed

- **Navbar `__end` alignment** — Added `margin-inline-start: auto` to push `__end` section to the right regardless of whether `__center` exists as a spacer
- **Scroll-lock layout shift** — Changed `.pa-scroll-lock` from `overflow: hidden` to `overflow-y: scroll` — scrollbar stays visible when ProfilePanel/modals open, preventing content shift

---

## [2.3.4] - 2026-03-31

### Added

- **Command palette home screen** — Opens with categorized list of commands (with Alt+key hotkey badges) and search contexts. Items are clickable.
- **Command palette hotkeys** — `Alt+D` Deploy, `Alt+A` Assign, `Alt+G` Go to Page, `Alt+T` Switch Theme. Work globally and inside the palette.
- **Global search includes commands** — Typing "deploy" on the home screen finds the Deploy command alongside data results.
- **Form codes for `/go`** — Pages have numeric codes (e.g., `24` for Alerts). `filterOpts` matches on label, description, and exact code.
- **Command palette key badge CSS variables** — `--pa-command-palette-key-font-size` and `--pa-command-palette-key-font-weight` for themeable keyboard shortcut badges
- **`pa-command-palette__home`** — Home screen container, `__home-section` with separators, `__home-heading` uppercase labels
- **`pa-command-palette__shortcut`** — Flex container for multi-key hotkey badge groups

### Changed

- **Dropdown z-index** — Bumped from 1000 to 7500 (above sidebar and header)
- **Command palette footer** — Removed display style toggle (controlled from demo page only)
- **Removed preview** — No confirmation step in demo, preview was showing partial/misleading text

### Fixed

- **Command palette reset** — Fully resets on close (placeholder, results, tokens, mode)
- **Step navigation** — Clearing search in command-step mode stays in step instead of resetting to idle
- **Search highlights** — Persist during arrow key navigation

---

## [2.3.3] - 2026-03-30

### Added

- **Command palette rewrite** — Multi-step command wizards (`/deploy`, `/assign`, `/go`, `/theme`), context search (`:p`, `:u`, `:o`), global search, inline/tokens display modes
- **`pa-command-palette__input-wrapper`** — New element wrapping input + context label for correct positioning in token mode
- **`pa-command-palette__token-prompt`** — Step prompt text between token badges
- **`pa-command-palette__key-bg/key-text` CSS variables** — Themeable keyboard shortcut badges in command palette footer
- **`pa-command-palette__menu-inner`** — Inner wrapper for split button dropdown (two-container pattern)

### Changed

- **Command palette badges** — Replaced custom `pa-command-palette__item-badge` with standard `pa-badge` (supports color variants)
- **Command palette loading overlay** — Uses `color-mix()` with `var(--pa-modal-content-bg)` instead of SCSS `rgba()` — fixes white overlay on dark themes
- **Removed `$secondary-light-bg`** from all command palette components — was stuck on light defaults due to `@use` module isolation

### Fixed

- **Command palette reset** — Palette now fully resets on close (input, placeholder, results, tokens, mode)
- **Command palette step navigation** — Clearing search in command-step mode no longer resets to idle; stays in current step
- **Search highlight persistence** — Arrow key navigation preserves search text highlights

## [2.3.2] - 2026-03-30

### Added

- **Border-radius CSS custom properties:** `--pa-border-radius-sm`, `--pa-border-radius`, `--pa-border-radius-lg` — themes can now override border-radius via CSS variables in `:root` (same pattern as colors). All component usages migrated from SCSS `$border-radius` to `var(--pa-border-radius)`
- **Outline-secondary button color variable:** New `--pa-btn-secondary-outline-color` CSS variable — defaults to `$btn-secondary-text` for readable outline buttons on dark backgrounds
- **Split button menu inner wrapper (`pa-btn-split__menu-inner`):** New BEM element matching web-multiselect's two-container pattern — outer `__menu` clips with `overflow: hidden` + `border-radius`, inner `__menu-inner` handles flex layout and gap
- **Split button item row (`pa-btn-split__item-row`):** New BEM element for menu rows with inline action buttons (e.g. delete) — replaces inline styles

### Changed

- **Removed hover lift on buttons:** `translateY(-1px)` on `.pa-btn:hover` removed — caused clipping issues with `overflow: hidden` containers. Also removed from `.pa-stat--square:hover`
- **Split button container:** Border-radius and `overflow: hidden` moved to `.pa-btn-split` container — individual button corner radius removed for consistent theming

### Fixed

- **Button vertical alignment:** Added `vertical-align: middle` to `.pa-btn` — mixed-size buttons in a row now align their centers instead of baselines
- **Split button dropdown hover stripes:** Two-container pattern (menu + menu-inner) with `overflow: hidden` clips hover backgrounds cleanly to border-radius

---

## [2.3.0] - 2026-03-26

### Added

- **Toast action buttons (`pa-toast__actions`):** New BEM element for action buttons inside toasts — renders as a flex row separated from content by a border-top. Filled toast variants get a semi-transparent white separator. Buttons keep their own variant styling
- **Toast service: `actions` option:** Array of `{ label, variant, onClick }` — renders `pa-btn--xs` buttons in `pa-toast__actions`. Clicking an action fires `onClick(toastId)` then auto-dismisses. Toasts with actions are not click-to-dismiss
- **Toast service: `maxWidth` option:** Custom max-width per toast (e.g. `'50rem'`, `'500px'`)
- **Toast service: width ratchet:** Container `min-width` ratchets up to the widest toast shown — shorter toasts don't shrink when a wider one disappears. Resets when container is empty

### Changed

- **Toast progress bar:** Increased height from 3px to 5px and opacity from 0.3 to 0.6 for better visibility
- **Toast service (demo):** Added `filled` and `progressColor` options to `createToast()` — `filled: true` uses `pa-toast--filled-{variant}` class, `progressColor` overrides the progress bar color via inline style
- **Toast demo page:** Replaced single progress toast button with preset buttons showing standard, filled, and custom progress color combinations. Replaced fake "Action Toasts" section with real action toast demos (Undo, Retry, Update, Filled + Actions)
- **Colors demo page:** Added note explaining the light-to-dark ordering convention for theme color slots 1-9

---

## [2.2.0] - 2026-03-25

### Added

- **Theme color slot variants for Alerts**: New `pa-alert--color-{1-9}` (filled) and `pa-alert--outline-color-{1-9}` (outline) variants that use the 9 custom theme color slots (`$color-1` through `$color-9`). Themes that define these slots now get matching alert styles automatically
- **Theme color slot variants for Callouts**: New `pa-callout--color-{1-9}` variants with left border accent in the theme color and a 10% tinted background
- **Theme color slot variants for Toasts**: New `pa-toast--color-{1-9}` (bordered with tinted icon) and `pa-toast--filled-color-{1-9}` (full background with contrast text) variants
- **Filled toast variants**: New `pa-toast--filled-primary`, `filled-success`, `filled-danger`, `filled-warning`, `filled-info` — full-color background toasts with contrast text, semi-transparent icon backgrounds, and matching progress bars
- **Theme color slot variants for Buttons**: New `pa-btn--color-{1-9}` (filled) and `pa-btn--outline-color-{1-9}` (outline) button variants. Filled buttons use `brightness()` filter on hover; outline buttons fill with the color on hover

### Changed

- **Demo: remove redundant page headers**: Removed `<h2>` page titles from timeline, grid, and virtual-scroll demo pages — the page title is already shown in the layout
- **Demo: rename `/timeline/advanced` → `/timeline/feed`**: Route and page title now match the actual content (feed-style timeline)

---

## [2.1.1] - 2026-03-22

### Fixed

- **Sidebar active link contrast**: Active sidebar links now use `color: var(--pa-accent)` instead of `var(--pa-sidebar-text)` — fixes low contrast active state on dark themes with tinted accent backgrounds

### Added

- **On-demand theme downloads**: Demo server lazily downloads missing themes from pureadmin.io when requested via `?theme=` parameter (10-min negative cache for failed lookups)
- **Path traversal protection**: Blocks requests containing `..`, encoded dots/backslashes, and null bytes
- **Font family settings**: Settings panel dynamically loads Google Fonts on demand and applies via `--base-font-family` CSS variable; skips Google load when theme already bundles the selected font

---

## [2.1.0] - 2026-03-19

### Added

- **`pa-btn-split` component**: Split button with primary action + dropdown toggle. Includes `__menu` dropdown panel, `__item` menu buttons, and `__item--danger` modifier. Works with all button sizes and variants
- **`pa-filter-card` component**: Expandable filter card with inline filters row, actions, collapsible advanced section, and loading/disabled states
- **`pa-tooltip--keyword` modifier**: Dotted underline + help cursor for inline term explanations (replaces inline `style` attributes)
- **Theme font asset serving**: Demo server now serves theme font files at `/dist/css/assets/` so CSS relative `url()` paths resolve correctly
- **Dockerfile downloads themes from pureadmin.io**: Build fetches theme bundle via `GET /api/bundle`, no local theme packages needed. Configurable via `THEMES_URL` build arg
- **`.themes.json.example`**: Template for local dev theme paths

### Changed

- **Actions column moved to first position**: All demo tables now show the Actions column as the first column (after checkbox where present) for consistent layout across pages (tables-sizing, checkbox-lists, popconfirm)
- **Tooltips/Popovers RTL: `--left`/`--right` renamed to `--start`/`--end`**: Tooltip position classes `pa-tooltip--left` → `pa-tooltip--start`, `pa-tooltip--right` → `pa-tooltip--end`. Popover `data-placement` values `"left"`/`"right"` → `"start"`/`"end"`. SCSS now uses CSS Logical Properties (`inset-inline-start/end`, `border-inline-start/end-color`) with `[dir="rtl"]` overrides for transforms. Auto-flip classes also renamed (`--auto-flip-left` → `--auto-flip-start`, `--auto-flip-right` → `--auto-flip-end`)
- **Theme packages removed from this repo**: Local `packages/theme-*` directories deleted — themes now live in the separate `pure-admin-themes` repo. Demo server discovers themes via `.themes.json` (gitignored, local dev paths)
- **`themes.json` is now gitignored**: Generated at Docker build time from pureadmin.io bundle, not committed
- **Plausible analytics domain**: Updated from `pure-admin.keenmate.dev` to `demo.pureadmin.io`
- **Pack script URLs**: Updated to `demo.pureadmin.io` and `pureadmin.io`
- **RTL test page**: Added English warning banner with toggle button explaining how RTL mode works
- **Timeline feed time RTL**: Converted `text-align: right` → `text-align: end` and `padding-right` → `padding-inline-end` for correct RTL mirroring
- **Badge `--ellipsis-start` RTL**: Added `[dir="rtl"]` override that reverses the direction hack so left-truncation works correctly on RTL pages
- **Badge `--ellipsis-left` renamed to `--ellipsis-start`**: RTL-aware naming for start-side text truncation
- **Badge demo**: Replaced non-existent `pa-badge--w-*x` classes with existing `maxwr-*` + `text-truncate` utilities
- **Badge**: Removed hardcoded `font-weight: $font-weight-semibold` — badges now inherit font-weight from parent
- **Badge truncation**: Added `.pa-badge.text-truncate` override switching `display` from `inline-flex` to `inline-block` so `text-overflow: ellipsis` works
- **Demo URL query params**: Added `?mode=dark` and `?colorVariant=red` support alongside existing `?theme=` parameter
- **Card header overflow**: Direct heading children now truncate with ellipsis instead of spilling out of narrow cards
- **Card `--wrap` modifier**: Now also resets heading `white-space`/`overflow` so headings wrap alongside descriptions
- **Desc table stacked layout**: Added `@container (max-width: 300px)` breakpoint that stacks label above value in very narrow containers
- **Desc table `--value-end` / `--value-center`**: New modifiers for value horizontal alignment
- **Banded `--label-end` / `--label-center`**: Added `text-align` so alignment works in both flex and stacked (block) modes
- **Banded `--value-end` / `--value-center`**: New modifiers for value horizontal alignment

### Fixed

- **Responsive-grid table hover**: In `pa-table--responsive-grid` mobile view, hovering a row card highlighted all cells with hover background color. Added `td` background reset so only the card-level `box-shadow` hover effect applies
- **Mobile sidebar burger icon showing X**: Settings panel sidebar behavior modes (`icon-collapse`, `hide`) were setting the burger menu to active (X) on mobile because they checked the desktop-only `sidebar-hidden` class. Added mobile guard so burger always starts as hamburger on mobile

---

## [2.0.2] - 2026-02-24

### Fixed

- **Grid offsets overflow at mobile viewport**: Base offsets (`.pa-offset-5` through `.pa-offset-95`) were not reset when columns auto-stack at mobile breakpoint, causing columns to exceed 100% width and spill out of containers. Now reset to `margin-inline-start: 0` alongside the column stacking rules

---

## [2.0.1] - 2026-02-23

### Added

- **Card header underline modifier**: `pa-card__header--underlined` adds an accent-colored border under the heading. Color variants: `--underline-success`, `--underline-warning`, `--underline-danger`, `--underline-info`, and theme slots `--underline-color-1` through `--underline-color-9`

### Fixed

- **Loading button spinner now handled entirely by CSS**: `pa-btn--loading` hides button text via `-webkit-text-fill-color: transparent`, preserving button dimensions and `currentColor` for the spinner. Works correctly with all button variants including light/outline buttons. JS only needs to toggle the class and add a `<span class="pa-btn__spinner"></span>`
- **Card header heading border bleed**: `.pa-section h3` border-bottom was bleeding into card headers (visible on ghost and bordered cards using `<h3>`). Changed to `.pa-section > h3` (direct child only) and added defensive `border-bottom: none` reset in card header
- **Grid vertical gap on wrap**: `.pa-row` now has `row-gap: 0.8rem` so columns that wrap (e.g. on mobile) have vertical spacing. Use `.row-gap-0` to opt out

---

## [2.0.0] - 2026-02-21

**Theme packages also updated to v2.0.0:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Breaking

- **Responsive grid columns now use container queries**: `pa-col-{bp}-*` classes use `@container` instead of `@media` queries, so columns respond to the content area width rather than the viewport. `.pa-layout__main` automatically establishes a containment context. Columns now require a containment context ancestor. Visibility helpers (`pa-hide-{bp}`, `pa-show-{bp}`) and mobile auto-stack remain viewport-based

### Added

- **Bar list component** (`pa-bar-list`): Labeled horizontal bar chart displayed as a list. Each row shows label, value, and a proportional bar. Supports color variants (`--success`, `--warning`, `--danger`, `--info`) and a `--compact` modifier for tighter spacing
- **Live-data card states** (`pa-card--live-up`, `pa-card--live-down`, `pa-card--live-neutral`): Persistent tinted card backgrounds for real-time data dashboards. Green/red tint stays until the next data update swaps the class, with smooth 0.3s transition between states
- **KPI Dashboard demo page** (`/kpi-dashboard`): Geckoboard-style CMO dashboard showcasing bar lists, hero stats, gauges, sparklines, progress bars, dot leaders, stacked bars, progress rings, and compact tables — with simulated live-data updates
- **Copyable fields for new data display patterns**: Copy-to-clipboard support (copy-btn, copy-hover, copy-click) extended to all new data display components:
  - `pa-banded__row--copy-btn / --copy-hover / --copy-click` — Banded rows
  - `pa-prop-card__row--copy-btn / --copy-hover / --copy-click` — Property card rows
  - `pa-desc-table__value--copy-btn / --copy-hover / --copy-click` — Description table values
  - `pa-accent-grid__item--copy-btn / --copy-hover / --copy-click` — Accent grid items
- **Shared `_copy-btn-base` mixin** in `_data-display.scss` for DRY copy button styling across patterns
- **Data Display 2 demo**: Copyable Fields section with interactive examples of all three copy styles across banded rows, property card, description table, and accent grid

### Changed

- **`pa-stat--hero` is now compact by default**: Tighter padding (`$spacing-sm` top, `$spacing-md` bottom), larger number (~45px via `$font-size-4xl * 1.4`), bolder labels (`font-weight-semibold`), and reduced gaps. The previous spacious version is replaced. `pa-stat--hero-compact` kept as alias for backwards compatibility

---

## [1.5.1] - 2026-02-15 ✅ Published

**Theme packages also updated to v1.5.1:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Added

- **7 data display patterns**: New read-only label-value components for structured data:
  - `pa-fields--linear` — Underline-style fields (label above, value with bottom border)
  - `pa-fields--chips` — Chip/tag style values with semantic color variants (`--success`, `--warning`, `--danger`)
  - `pa-desc-table` — CSS Grid description list with auto/fixed label widths, column variants, and alignment modifiers
  - `pa-dot-leaders` — Receipt/invoice style with dotted fill between label and value
  - `pa-prop-card` — Self-contained card with colored header + key-value rows
  - `pa-banded` — Label column with tinted background band, narrow/wide width variants
  - `pa-accent-grid` — Grid of items with color-coded left borders
- **CSS Container Query support**: Data display components respond to container width instead of viewport:
  - `pa-fields-container` — Collapses multi-column fields to single column
  - `pa-desc-container` — Collapses desc-table to narrower layout
  - `pa-banded-container` — Stacks banded label above value
  - `pa-cq` — General-purpose container query utility
- **Ghost card**: `pa-card--ghost` — Invisible container (no background, border, or shadow) for layout-only card wrappers
- **Detail panel bordered modifier**: `.pa-detail-panel__content--bordered` modifier for top/bottom borders
- **Detail panel scroll containment**: `overscroll-behavior: contain` on `.pa-detail-panel__body`
- **Detail view min-height support**: `.pa-table-card` with `.pa-detail-view` fills available height with min-height utilities
- **Extended min-height utilities**: `minhr-60` through `minhr-100` (in 10rem steps)
- **Practical Examples demo pages**: `/movies`, `/movies/detail`, `/movies-panel`
- **Data Display demo page**: `/data-display-2` with all 7 patterns and CSS Reference table

### Fixed

- **Ghost card shadow in dark themes**: Ghost card now uses `!important` to beat dark-mode scoped `.pa-card` shadow overrides

---

## [1.5.0] - 2026-02-03 ✅ Published

**Theme packages also updated to v1.5.0:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Changed

- **Left/right classes renamed to logical start/end (Breaking)**: All directional class names now use logical `start`/`end` naming for RTL consistency. No backward compatibility aliases — update your markup:
  - **Buttons**: `pa-btn--align-left` → `pa-btn--align-start`, `pa-btn--align-right` → `pa-btn--align-end`
  - **Pagers**: `pa-pager--left` → `pa-pager--start`, `pa-pager--right` → `pa-pager--end`
  - **Load More**: `pa-load-more--left` → `pa-load-more--start`, `pa-load-more--right` → `pa-load-more--end`
  - **Tabs scroll**: `pa-tabs__scroll-btn--left` → `pa-tabs__scroll-btn--start`, `pa-tabs__scroll-btn--right` → `pa-tabs__scroll-btn--end`
  - **Timeline**: `pa-timeline--left` → `pa-timeline--start`, `pa-timeline--right` → `pa-timeline--end`
  - **Header sections**: `pa-header__left` → `pa-header__start`, `pa-header__right` → `pa-header__end`
  - **Header nav**: `pa-header__nav--left` → `pa-header__nav--start`, `pa-header__nav--right` → `pa-header__nav--end`
  - **Footer sections**: `pa-footer__left` → `pa-footer__start`, `pa-footer__right` → `pa-footer__end`
  - **Popover**: `pa-popover--right` → `pa-popover--end`
  - **Text utilities**: Removed `pa-text--left`/`pa-text--right` (use `pa-text--start`/`pa-text--end`), removed `text-left`/`text-right` (use `text-start`/`text-end`)
  - **Kept as physical**: `pa-tooltip--left`/`--right`, `pa-popconfirm--left`/`--right` (physical arrow positioning)
- **Button alignment demos improved**: Wider buttons with varied text lengths to clearly show alignment differences

---

## [1.4.1] - 2026-02-02

**Theme packages also updated to v1.4.0:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Added

- **Table card + detail view support**: `.pa-table-card` now works with `.pa-detail-view` for inline split-view and overlay modes with web-grid or pa-table
- **Scroll lock utility**: Added `.pa-scroll-lock` class to disable body scrolling when overlays are open (detail panel overlay, card overlay, profile panel)
- **Card header three-part layout**: Card headers now support a flexible three-part structure: `[Title (h1-h6)]` — `[Description (p)]` — `[Actions]`. Title and actions stay fixed width, description fills available space and truncates with ellipsis. Elements are separated by automatic gaps (`$spacing-base`). Added `--wrap` modifier (`.pa-card__header--wrap`) for allowing description to wrap to its own line. Use `.pa-tooltip--multiline` on truncated text to show full content on hover
- **Height and flex utilities**: Added percentage-based height utilities (`.h-full`, `.h-screen`, `.min-h-full`, `.min-h-screen`, `.max-h-full`, `.max-h-screen`) and flex utilities (`.flex-1`, `.flex-auto`, `.flex-grow`, `.flex-shrink-0`, etc.) for filling available space in layouts
- **Sizing & Layout demo page**: New `/sizing` demo page showing height and flex utilities with practical examples for expandable table cards

### Fixed

- **Detail panel z-index**: Card overlay mode (`.pa-detail-view--overlay`) now uses z-index 3500/3501, which is below the header (4000). This ensures the panel stays contained within its card and doesn't overlap the header when scrolling. Full-screen overlay mode remains at 4500 (above header)
- **Card title truncation**: Fixed `.pa-card__title-text` not truncating properly. The `flex-shrink: 0` rule now only applies to direct heading children of `.pa-card__header`, allowing nested titles (inside `.pa-card__title`) to truncate correctly
- **Demo fixes**: Fixed non-existent CSS classes in demo pages — `pa-card__header-actions` → `pa-card__tools` (forms), removed `pa-card--bordered` and `pa-card__header--{color}` modifiers (validations)

---

## [1.4.0] - 2026-01-31

**Theme packages also updated to v1.3.0:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Added

#### RTL (Right-to-Left) Support
- **Full RTL support** using CSS Logical Properties — automatically mirrors layout when `dir="rtl"` is set on HTML element
- **Components updated for RTL**:
  - **Alerts**: Close button positioning, list padding, dismissible padding
  - **Base styles**: Blockquote padding, list (ul/ol) padding
  - **Callouts**: Border, icon float, list padding
  - **Checkbox Lists**: Checkbox margin, action buttons, multi-column borders
  - **Code blocks**: Line numbers, language accent borders
  - **Command Palette**: Overlay positioning, context labels, badge remove buttons
  - **Comparison tables**: Header alignment, change indicator borders
  - **Data Display**: Fields border/padding, copy button margin
  - **Detail Panel**: Panel border, resize handle, overlays, overlay positioning (slide-in from end side), mobile overlay
  - **File Selector**: Icon margin, table header alignment
  - **Input Groups**: Prepend/append positioning, border radius, focus borders
  - **Input Wrapper**: Clear button positioning, search token spacing
  - **Layout Responsive**: Mobile sidebar positioning, backdrop overlay
  - **Lists**: All list component padding and margins
  - **Modals**: Full-screen overlay positioning
  - **Navbar**: Fixed positioning, burger margin, brand padding, dropdown positioning
  - **Pagers**: Count margin
  - **Query Editor**: Type label margin
  - **Tabs**: Vertical tabs border, scroll buttons, overflow menu
  - **Timeline**: Simple timeline line, margin, padding, dot positioning
  - **Toasts**: Container positions, progress bar, animations
  - **Tooltips**: Text alignment, popover list padding
- **New logical spacing utilities**:
  - `.ms-{size}` — margin-inline-start (replaces margin-left in RTL-aware contexts)
  - `.me-{size}` — margin-inline-end (replaces margin-right in RTL-aware contexts)
  - `.ps-{size}` — padding-inline-start
  - `.pe-{size}` — padding-inline-end
  - Sizes: `0`, `xs`, `sm`, `md`, `base`, `lg`, `xl`, `2xl`, `auto`
- **New logical text alignment utilities**:
  - `.text-start` — aligns to start (right in RTL)
  - `.text-end` — aligns to end (left in RTL)
- **RTL test page**: `/rtl-test` demo page in Hebrew for testing all RTL-aware components

### Changed

#### Toast Position Classes (Breaking Change)
- **Removed** legacy position classes: `--top-right`, `--top-left`, `--bottom-right`, `--bottom-left`
- **Use instead** logical position classes:
  - `--top-end` (was `--top-right`)
  - `--top-start` (was `--top-left`)
  - `--bottom-end` (was `--bottom-right`)
  - `--bottom-start` (was `--bottom-left`)
- These logical classes automatically flip in RTL mode

### Fixed

- **Font size scaling classes**: Fixed `html.font-size-small`, `font-size-large`, etc. using incorrect rem values that caused text to become enormous. Now uses absolute px values to properly scale the 10px rem base (e.g., `font-size-small` sets html to 9px for ~14px body text)

---

## [1.3.0] - 2026-01-30

**Theme packages also updated to v1.2.0:** `@keenmate/pure-admin-theme-audi`, `theme-corporate`, `theme-dark`, `theme-express`, `theme-minimal`

### Added

#### Table Card Component (New)
- **New component**: `.pa-table-card` — Card container specifically designed for tables and web-grids
- **Structure**:
  - `.pa-table-card__header` — Header with title and actions (same styling as card header)
  - `.pa-table-card__body` — Body for table content (no padding, handles overflow)
  - `.pa-table-card__footer` — Footer with summary/actions (same styling as card footer)
  - `.pa-table-card__title` — Title with text truncation support
  - `.pa-table-card__actions` — Actions container for buttons
- **Color variants**: `--primary`, `--success`, `--warning`, `--danger` (colored header with matching border)
- **Theme color variants**: `--color-1` through `--color-9`
- **Plain variant**: `--plain` — Removes card visual styling (border, shadow, background) while keeping grid behavior
  - Tables work side by side with proper gaps
  - Optional header displays as plain text above table
  - Useful for embedding tables without card decoration
- **Features**:
  - First/last column padding aligned with header/footer for consistent visual alignment
  - Works with both `pa-table` and `web-grid` component
  - Web-grid handles its own scrolling without conflicting scrollbars
- **Demo page**: Added "Table Cards" section in `/tables` with examples:
  - Color variant table cards
  - Web-grid with paging inside table card
  - Plain table cards side by side (bordered, striped)
  - Plain table card with pagers (top and bottom)
  - Plain table card with web-grid and paging

#### Table Bordered Modifier (New)
- **New modifier**: `.pa-table--bordered` — Full cell borders on all sides
- Adds outer border to table and borders to all cells (th and td)
- Works with all other table modifiers (striped, size variants, etc.)

### Fixed

#### Grid System - Responsive Column Padding
- **Fixed**: Responsive columns (`.pa-col-md-*`, `.pa-col-lg-*`, etc.) were missing `padding-left` and `padding-right`
- **Impact**: Content in responsive columns now properly respects grid gutters
- **Result**: Cards and tables in grid rows now have correct gaps between them and don't extend beyond container bounds

#### Table Panel Modifier (New)
- **New modifier**: `.pa-table-container--panel` — Card-like visual containment for tables without wrapping in a card
- **Visual features**:
  - Box shadow matching cards (`$shadow-sm`, `$shadow-lg` on hover)
  - Larger border-radius (`$card-border-radius`)
  - Bottom margin (`$spacing-base`)
  - Hover shadow transition
- **New elements**:
  - `.pa-table-container__header` — Optional header row with title and actions
  - `.pa-table-container__title` — Title text styling (matches card header)
  - `.pa-table-container__actions` — Actions container for buttons in header
- **Use case**: Order detail pages with Customer Info card, Delivery Details card, and Order Items table - all with consistent visual treatment
- **Demo page**: Added "Panel Tables" section in `/tables` with examples

#### Data Display Component (New)
- **New component**: `_data-display.scss` — Read-only label-value field pairs for displaying structured data without form inputs
- **Core elements**:
  - `.pa-field` — Single label-value pair (stacked by default: label on top, value below)
  - `.pa-field__label` — Muted uppercase label with letter-spacing
  - `.pa-field__value` — Normal text value
  - `.pa-field--full` — Span full width in grid layouts
- **Container** (`.pa-fields`):
  - Flexbox column layout with left accent border
  - Gap between fields for visual grouping
  - Auto-spacing between consecutive `.pa-fields` blocks (`.pa-fields + .pa-fields`)
- **Field groups** (`.pa-field-group`):
  - Labeled sections with `__title` element (bordered bottom)
  - Auto-spacing between consecutive groups

#### Data Display Layout Modifiers
- `.pa-fields--cols-2/3/4` — CSS grid multi-column layouts (responsive, collapses on mobile)
- `.pa-fields--horizontal` — Label left, value right (side-by-side)
- `.pa-fields--table` — Consistent label widths, table-like appearance
- `.pa-fields--bordered` — Bottom border separators between fields
- `.pa-fields--striped` — Alternating background rows (uses `var(--pa-table-stripe)`)
- `.pa-fields--compact` — Tighter spacing
- `.pa-fields--relaxed` — Larger gap between fields
- `.pa-fields--inline` — Fields flow inline on one line
- `.pa-fields--row` — Equal-width columns (auto column count based on children)
- `.pa-fields--filled` — Subtle background panel for distinguishing data blocks

#### Data Display Color Variants
- `.pa-fields--color-{1-9}` — Theme color for left border (uses `--pa-color-{n}` CSS variables)
- Combined with `--filled`: tints background 10% with the color using `color-mix()`
- `.pa-fields--no-border` — Removes left border entirely

#### Data Display Copyable Fields
- `.pa-field--copy-btn` — Copy button always visible next to value (`.pa-field__copy` button element)
- `.pa-field--copy-click` — Entire value clickable, shows "Click to copy" hint on hover
- `.pa-field--copy-hover` — Copy button appears only on field hover
- `.pa-field--copied` — Feedback state showing "Copied!" (applied via JS after copy)
- Uses `navigator.clipboard.writeText()` for clipboard access
- Visual feedback: checkmark icon or "Copied!" text for 1.5 seconds

#### Data Display SCSS Variables
- `$field-label-font-size: $font-size-xs` — Label text size
- `$field-label-font-weight: $font-weight-semibold` — Label weight
- `$field-label-opacity: 0.55` — Label opacity (adapts to light/dark modes)
- `$field-value-font-size: $font-size-sm` — Value text size
- `$field-gap: $spacing-xs` — Gap between label and value within a field
- `$field-horizontal-label-width: 14rem` — Label width in horizontal/table modes
- `$fields-gap: $spacing-base` — Gap between consecutive fields
- `$fields-relaxed-gap: $spacing-lg` — Gap for `--relaxed` modifier
- `$fields-bordered-padding: $spacing-sm` — Padding for bordered/striped rows
- `$fields-border-left: 3px solid $accent-color` — Left accent border
- `$fields-padding-left: $spacing-base` — Left padding after border
- `$fields-filled-bg: rgba(128, 128, 128, 0.06)` — Filled background color
- `$fields-filled-padding: $spacing-base` — Filled variant padding
- `$field-group-gap: $spacing-sm` — Gap within field groups
- `$field-group-title-font-size: $font-size-sm` — Group title size
- `$field-group-title-font-weight: $font-weight-semibold` — Group title weight
- `$field-group-title-border-color: $border-color` — Group title underline
- `$field-group-spacing: $spacing-lg` — Spacing between consecutive groups

#### Data Display Demo Page
- **New demo page**: `/data-display` with multiple sections:
  1. **Multiple pa-fields Blocks** — Demonstrates auto-spacing between consecutive `.pa-fields` containers with different layouts (row, cols-2, stacked)
  2. **Multi-Column Grid** — `pa-fields--cols-2/3/4` with `pa-field--full` spanning
  3. **Field Groups** — Three groups in 1/3 columns (Personal, Employment, Emergency Contact)
  4. **Horizontal** | **Table-Style Bordered** | **Striped** — 1/3 each
  5. **Compact** | **Inline** | **Row** | **Relaxed** — 25% each
  6. **Filled Fields** (75%) | **Form vs Display** comparison (25%)
  7. **Color Variants** — Border colors, filled+color tints, no-border
  8. **Invoice Layout** — Real-world example with Customer, Receipt/Delivery addresses, items table, totals
  9. **User Profile** (1/3) | **CSS Reference** (2/3)
  10. **Detail Panel Integration (Inline)** — Headerless side panel with floating close button, orders table
  11. **Detail Panel Integration (Full-Screen Overlay)** — Products table with full-screen overlay panel
- Varied column layouts demonstrating grid system (50/50, 1/3 1/3 1/3, 25/25/25/25, 75/25, 1/3+2/3)
- Detail panel examples show headerless variant with floating X close button

#### Sidebar Navigation
- Added "Data Display" link in Components submenu with 👁️ icon

---

## [1.2.0] - 2026-01-26

### Added

#### Detail Panel Component (New)
- **New component**: `_detail-panel.scss` — inline split-view and overlay detail panels for master/detail layouts
- **Three display modes**:
  - **Inline split-view** (`.pa-detail-view`): Table shrinks, panel appears alongside
  - **Card overlay** (`.pa-detail-view--overlay`): Panel overlays the table within the card boundary
  - **Full-screen overlay** (`.pa-detail-panel--overlay`): Fixed-position panel slides in from right (like profile panel)
- **Panel structure** (`.pa-detail-panel__content`):
  - `__header` — Title, optional action buttons (`.pa-btn-group`), close button
  - `__tabs` — Optional tab navigation between header and body
  - `__body` — Scrollable content area
  - `__footer` — Optional action footer
- **Resize handle** (`.pa-detail-panel-resize`): Drag left edge to resize panel width, double-click to reset
- **Card overlay backdrop** (`.pa-detail-view__overlay`): Optional click-to-close backdrop with `--visible` modifier
- **Row selection highlight**: `.is-selected` on `<tr>` elements for accent-tinted background
- **Responsive**: Inline mode collapses to overlay on mobile (`< 768px`)
- **CSS custom properties** (runtime state):
  - `--pa-local-detail-panel-width` — Current panel width (set by JS resize, default `40rem`)
  - `--pa-local-detail-panel-max-width` — Max width (default `64rem`)
  - `--pa-detail-panel-overlay-bg` — Backdrop color
  - `--pa-detail-panel-selected-bg` — Selected row highlight color
  - `--pa-detail-panel-z-index` — Z-index for overlay modes (default `4500`, overridable by apps)

#### Detail Panel SCSS Variables
- `$detail-panel-width: 40rem` — Default panel width
- `$detail-panel-min-width: 28rem` — Minimum panel width
- `$detail-panel-max-width: 64rem` — Maximum panel width
- `$detail-panel-mobile-width: 90vw` — Mobile overlay width
- `$detail-panel-header-padding-v/h: 1.2rem / 1.6rem` — Header padding
- `$detail-panel-body-padding-v/h: 1.2rem / 1.6rem` — Body padding
- `$detail-panel-footer-padding-v/h: 1.2rem / 1.6rem` — Footer padding
- `$detail-panel-overlay-bg: rgba(0,0,0,0.3)` — Backdrop background
- `$detail-panel-z-index: 4500` — Z-index (below profile panel, above header)
- `$detail-panel-shadow: $shadow-profile-panel` — Box shadow for overlay mode
- `$detail-panel-close-size: 3.2rem` — Close button hit area
- `$detail-panel-resize-handle-width: 6px` — Resize drag handle width
- `$detail-panel-selected-bg: rgba($accent-color, 0.08)` — Selected row background

#### Detail Panel Snippet
- **New snippet**: `snippets/detail-panel.html` with three patterns:
  - Inline split-view with table and side panel
  - Card overlay with backdrop
  - Full-screen overlay (fixed position)

#### Detail Panel Demo Page
- **New demo page**: `/detail-panel` with 7 sections:
  1. **Inline Split-View** — Table shrinks to make room for panel
  2. **Card Overlay** — Panel overlays table with backdrop
  3. **Card Overlay — No Backdrop** — Panel stays open across row clicks, 600ms loading spinner
  4. **Tabbed Detail Panel** — Tabs inside panel (Details, Activity, Notes)
  5. **Header Actions — No Footer** — Icon buttons in header (edit, bookmark, delete)
  6. **Web-Grid Integration** — `<web-grid>` drives panel via `onrowfocus` event
  7. **Overlay Mode** — Full-screen slide-in panel (like profile panel)
- **CSS Reference tables** with all classes, SCSS variables, and CSS custom properties

#### Web-Grid Integration Demo (Section 6)
- `<web-grid>` drives detail panel via `onrowfocus` callback
- `onrowfocus` receives `{ rowIndex, row, previousRowIndex }` and opens/updates panel
- 6 read-only columns (ID, Name, Department, Salary, Status, Location), 10 sample rows
- `isHoverable = true`, `isRowNumbersVisible = true`
- 600ms spinner delay simulating server fetch
- Self-contained `<script type="module">` block

### Changed

#### Demo Dependency
- **Bumped `@keenmate/web-grid`**: `^1.0.0-rc11` → `^1.0.0-rc12` (adds `onrowfocus` event)

---

## [1.1.3] - 2026-01-24

### Added

#### Theme Color Contrast Text Variables
- **New SCSS variables** `$color-1-text` through `$color-9-text` in `variables/_colors.scss`:
  - Define text color to use when corresponding `$color-N` is used as a background
  - Default: `#ffffff` (white text), themes override for light backgrounds
- **New CSS variables** `--pa-color-1-text` through `--pa-color-9-text`:
  - Output via `output-pa-css-variables` mixin in `_base-css-variables.scss`
  - Enables runtime contrast text color for card headers and tooltips
- **Updated components** to use contrast variables instead of hardcoded `#ffffff`:
  - `_cards.scss`: Card header text in `.pa-card--color-N` variants
  - `_tooltips.scss`: Tooltip text in `.pa-tooltip--color-N` and floating tooltip variants
- **Theme-specific contrast colors** defined in all 5 theme packages:
  - **Corporate**: Dark text (`#1a1a1a`) for color-4 (amber)
  - **Audi**: Dark text for color-4 (gold)
  - **Dark**: Dark text for colors 2, 3, 6, 7, 8, 9 (all light/vibrant colors)
  - **Express**: Dark text for color-2 (yellow)
  - **Minimal**: Dark text for color-7 (light gray)
- **Demo page `/cards`**: Added "Theme Color Cards" section with color-1, color-2, color-3 examples
- **Use case**: Ensures readable text on colored card headers regardless of background brightness

#### Alert Color Derivation System
- **New SCSS variables** in `variables/_base.scss` for configurable alert color derivation:
  - `$alert-bg-opacity-light: 15` - Light mode background opacity (%)
  - `$alert-bg-opacity-dark: 45` - Dark mode background opacity (%)
  - `$alert-border-opacity-light: 30` - Light mode border opacity (%)
  - `$alert-border-opacity-dark: 70` - Dark mode border opacity (%)
  - `$alert-text-mix-light: 60%` - Light mode text mix with black
  - `$alert-text-mix-dark: 80%` - Dark mode text mix with white
- **New mixins** in `_base-css-variables.scss`:
  - `output-pa-alert-variables-light` - Derives alert colors using CSS `color-mix()` for light mode (dark text on subtle backgrounds)
  - `output-pa-alert-variables-dark` - Derives alert colors for dark mode (white text on tinted backgrounds)
- **Benefits**: Themes now define 0 alert colors instead of 12+ hardcoded CSS variables

### Changed

#### Theme Alert Color Architecture
- **All 5 themes updated** to use new derivation mixins instead of hardcoded alert CSS variables:
  - Corporate, Audi, Dark, Express, Minimal themes
  - Pattern: `@include output-pa-alert-variables-light;` in light mode, `@include output-pa-alert-variables-dark;` in dark mode
- **Express theme special handling**: Custom opacity overrides for saturated backgrounds
  - `$alert-bg-opacity-light: 68` (saturated)
  - `$alert-bg-opacity-dark: 30`
  - White text overrides for all alert types in light mode
- **Dark mode alert text**: Changed from `color-mix()` derivation to pure white (`#ffffff`) for all alert types
  - Fixes muddy/brownish text colors that resulted from mixing semantic colors with white

#### Input Group Border Colors
- **Prepend/append borders** now match their background colors instead of using generic border color
  - `border-color: var(--pa-input-group-prepend-bg)` for prepend
  - `border-color: var(--pa-input-group-append-bg)` for append
  - Provides visual cohesion when using colored prepend/append elements

### Fixed

#### Express Theme Dark Mode Input Groups
- **Fixed washed-out input group colors**: Increased append/prepend background opacity from 15% to 35%
  - `--pa-input-group-prepend-bg: rgba(255, 204, 0, 0.35)` (was 0.15)
  - `--pa-input-group-append-bg: rgba(255, 204, 0, 0.35)` (was 0.15)

### Removed

#### Deprecated Alert SCSS Variables
- **Removed 12 alert SCSS variables** from `variables/_components.scss` (now derived via CSS `color-mix()`):
  - `$alert-success-bg`, `$alert-success-border`, `$alert-success-text`
  - `$alert-danger-bg`, `$alert-danger-border`, `$alert-danger-text`
  - `$alert-warning-bg`, `$alert-warning-border`, `$alert-warning-text`
  - `$alert-info-bg`, `$alert-info-border`, `$alert-info-text`
- **Removed static alert output** from `output-pa-css-variables` mixin (replaced by dedicated alert mixins)

---

## [1.1.2] - 2026-01-22

### Added

#### Web Multiselect Group Label Styling
- **Added group label styling** to `_web-components-theme.scss` for better visibility
- **CSS variables set on `web-multiselect`**:
  - `--ms-group-label-color: var(--base-text-color-1)` - Uses primary text color instead of muted
  - `--ms-group-label-font-weight: 600` - Semibold for emphasis
- **Applies to all themes** - Included via `_core.scss` web-components-theme import

### Changed

#### Demo Page `/inputs` - Input Groups Section
- **Added width utility example** to "$" prepend element using `wr-3` class
- **Added tip note** explaining that width utilities (`wr-*`, `wp-*`) can be used on prepend/append elements

#### Demo Page `/multiselect` - Improved Examples
- **Grouped Options ("Technologies by Category")** - Now uses JavaScript initialization with `group` property and `group-member` attribute for proper group rendering
- **Disabled Options** - Now uses JavaScript initialization with `disabled: true` property and `disabled-member` attribute for proper disabled state
- **RTL Examples** - Added proper Arabic (`بحث...`) and Hebrew (`חיפוש...`) search placeholders using `search-placeholder` attribute

### Fixed

#### Link Utility Class Color
- **Fixed `.pa-link` class** - Changed from removed `$primary-bg` to `$accent-color` for proper link styling

### Removed

#### Unnecessary Web Component Variable Overrides
- **Removed `web-daterangepicker` CSS variable block** from `_web-components-theme.scss` (~280 lines)
  - The daterangepicker component now uses `--base-*` CSS variables with built-in fallback chains
  - Pure Admin only needs to set `--base-*` variables (via `output-base-css-variables` mixin)
  - Component automatically picks up theme colors from:
    1. External override: `--drp-accent-color: #custom`
    2. Theme base value: `var(--base-accent-color)`
    3. Hardcoded default: `#3b82f6`
- **Removed `web-daterangepicker` blocks from all theme files** (~70 lines each):
  - `packages/theme-express/src/scss/express.scss`
  - `packages/theme-audi/src/scss/audi.scss`
  - `packages/theme-corporate/src/scss/corporate.scss`
  - `packages/theme-dark/src/scss/dark.scss`
  - `packages/theme-minimal/src/scss/minimal.scss`
- **Removed `--ms-*` multiselect overrides from all theme files** (~26 lines each):
  - Same pattern as daterangepicker - component now reads from `--base-*` variables
  - Removed both `:root` level variables and `web-multiselect { }` selector blocks
- **Total reduction**: ~650 lines of unnecessary CSS variable overrides removed
- **Benefit**: Simpler theme maintenance - just set `--base-*` variables once and both web components inherit automatically

---

## [1.1.1] - 2026-01-19

### Added

#### Demo Pages - CSS Classes Reference
- **Added CSS Classes Reference sections** to all component demo pages for quick reference
  - Pages updated: `/alerts`, `/badges`, `/buttons`, `/callouts`, `/cards`, `/checkbox-lists`, `/code`, `/grid`, `/inputs`, `/lists`, `/loaders`, `/modals`, `/tabs`, `/tables`, `/toasts`, `/tooltips`
  - Consistent format using `pa-list-basic pa-list-basic--compact` for class documentation
- **New `/pagers` demo page** - Demonstrates pager and load-more components with examples and CSS reference
- **New `/helpers` demo page** - Comprehensive utility class reference with live examples
  - Spacing (margin/padding): numeric and semantic scales
  - Gap utilities: semantic and numeric
  - Width/height utilities: percentage, fraction, REM variants
  - Min/max sizing utilities
  - Display, flexbox, text, overflow, cursor, position, border, shadow utilities

#### Semantic Spacing Utility Classes
- **New `$semantic-spacers` map** in `variables/_spacing.scss` - Single source of truth for named spacing utilities
  - Values: `0`, `xs`, `sm`, `md`, `base`, `lg`, `xl`, `2xl` mapped to spacing variables
- **Semantic margin utilities**: `.m-xs`, `.m-sm`, `.m-md`, `.m-base`, `.m-lg`, `.m-xl`, `.m-2xl` (and all directional variants: `mt-*`, `mr-*`, `mb-*`, `ml-*`, `mx-*`, `my-*`)
- **Semantic padding utilities**: `.p-xs`, `.p-sm`, `.p-md`, `.p-base`, `.p-lg`, `.p-xl`, `.p-2xl` (and all directional variants)
- **Refactored gap utilities** to use `@each` loop over `$semantic-spacers`
  - Now generates `row-gap-xl`, `row-gap-2xl`, `column-gap-xl`, `column-gap-2xl` (previously missing)
- **Numeric gap classes preserved** for backwards compatibility (`.gap-1` through `.gap-20`)

### Added

#### Base Elevated Background Variable (`--base-elevated-bg`)
- **New CSS variable**: `--base-elevated-bg` for elevated surfaces like table headers, striped rows
- **SCSS variable**: `$base-elevated-bg: #f5f5f5 !default` in `variables/_base.scss`
- **CSS output**: Added to `output-base-css-variables` mixin in `_base-css-variables.scss`
- **Manifest**: Added to `base-variables.manifest.json` as required variable
- **Use case**: Web components (e.g., `@keenmate/web-grid`) use this for header rows and striped even rows
- **Problem solved**: Web-grid striped rows showed white background in dark mode because `--base-elevated-bg` was missing
- **Theme updates**: All themes now set appropriate dark values in their dark mode blocks:
  - Express: `#2a2a2a` (`$dark-surface`)
  - Corporate: `#334155` (`$dark-surface`)
  - Minimal: `#2e2e2e` (`$dark-surface`)
  - Dark: `#333333` (`$dark-bg-tertiary`) in dark mode, `#f1f5f9` in light mode
  - Audi: `#2a2a2a` (`$audi-gray`) in dark mode, `#f1f3f5` in light mode

### Added

#### Input Color Variants (`pa-input--color-1` through `--color-9`)
- **New color modifiers** for inputs, selects, and textareas using theme color slots
- **Classes**: `pa-input--color-1` through `pa-input--color-9` (same for `pa-select--*` and `pa-textarea--*`)
- **Styling**: Border color and focus ring use the theme's `--pa-color-*` CSS variables
- **Focus ring**: Uses `color-mix()` for 25% opacity version of the color
- **Use case**: Custom input accents beyond semantic success/warning/error states
- **Theme control**: Colors are `transparent` by default unless theme defines `$color-1` through `$color-9`
- **File**: `core-components/forms/_form-states.scss`

#### Form Help Text Color Variants (`pa-form-help--color-1` through `--color-9`)
- **New color modifiers** for help text using theme color slots
- **Classes**: `pa-form-help--color-1` through `pa-form-help--color-9`
- **Use case**: Match help text color to input color variant, or leave gray for neutral appearance
- **File**: `core-components/forms/_form-states.scss`

#### Missing Form Help Warning State
- **Added `pa-form-help--warning`** - was missing from the form states
- **Color**: Uses `--pa-warning-bg` to match input warning state

### Changed

#### Demo Page `/inputs` - Validation States Section
- **Added colored help text** to validation state examples (success, warning, error)
- **Added theme color variants section** showing `pa-input--color-1`, `--color-2`, `--color-3` with help text examples
- **Updated CSS Classes Reference** with new color variant classes for inputs, selects, textareas, and help text

#### Snippets `forms.html` Updates
- **Fixed class names**: Changed `pa-form-text` to correct `pa-form-help`
- **Added warning state example** with `pa-form-group--warning` and `pa-form-help--warning`
- **Added theme color variants section** with examples for inputs, selects, and textareas
- **Updated component reference** with all new classes

### Fixed

#### Textarea Size Modifiers Not Rendering Different Heights
- **Fixed textarea size modifiers** (`--xs`, `--sm`, `--lg`, `--xl`) all rendering at the same height
- **Root cause**: Modifiers only set `min-height`, which doesn't control actual rendered height
- **Solution**: Added `height` property alongside `min-height` for each size modifier
  - `height` sets the initial rendered size
  - `min-height` prevents shrinking below that size when user resizes
- **File**: `core-components/forms/_form-inputs.scss`

#### Notification Bell Color
- **Fixed notification bell color** - Changed `.pa-notifications__btn` to use `var(--pa-header-text)` instead of `var(--pa-text-primary)`

#### Header Profile Button Color
- **Fixed profile icon color** in header not matching header text color
- **Changed** `.pa-header__profile-btn` from `color: var(--pa-text-primary)` to `color: var(--pa-header-text)`
- **Changed** `.pa-header__profile-name` from SCSS variable to CSS variable `var(--pa-header-profile-name-color)`
- **Added `gap`** property to profile button for consistent icon/name spacing
- **Result**: Profile icon and name now correctly use header-specific text colors in all themes

### Changed

#### CSS Variable Naming Alignment
- **Renamed core CSS variables** to align with `--base-*` semantic naming:
  - `--pa-primary-bg` → `--pa-main-bg`
  - `--pa-bg-secondary` → `--pa-page-bg`
  - `--pa-content-bg` → `--pa-subtle-bg`
  - `--pa-text-primary` → `--pa-text-color-1`
  - `--pa-text-secondary` → `--pa-text-color-2`
- **Renamed SCSS variables** correspondingly:
  - `$primary-bg` → `$main-bg`
  - `$bg-secondary` → `$page-bg`
  - `$content-background-color` → `$subtle-bg`
  - `$text-primary` → `$text-color-1`
  - `$text-secondary` → `$text-color-2`

#### Body Font Uses CSS Variable
- **Changed `body` font-family** from SCSS variable to CSS variable: `font-family: var(--base-font-family)`
- **Problem**: SCSS module system (`@use`) caused themes' `$body-font-family` overrides to not propagate to `_base.scss`
- **Solution**: Body now uses CSS variable which is set via `output-base-css-variables` mixin in themes
- **Result**: Themes can set `$base-font-family` before importing variables, and it flows through to the body
- **File**: `core-components/_base.scss`

#### Typography Variables Derive from Base
- **Changed `$body-font-family`** to derive from `$base-font-family` instead of `$font-stack-system`
- **Before**: `$body-font-family: $font-stack-system !default;`
- **After**: `$body-font-family: $base-font-family !default;`
- **File**: `variables/_typography.scss`

### Removed

#### Delivery Font
- **Removed Delivery font** from framework (was unused, Express theme uses Fira Sans Condensed)
- **Deleted @font-face declaration** for Delivery font from `_fonts.scss`
- **Deleted `.font-family-delivery` class** from `_fonts.scss`
- **Deleted font files**: `fonts/Delivery/` directory (8 woff2 files)
- **Removed from settings panel**: Delivery option removed from font family selector in demo

### Added

#### Forms Page Size Reference Table
- **Added height columns** to Input Sizes Reference table on `/forms` page
- **Shows actual rendered height** (in pixels) for inputs and buttons at each size
- **JavaScript measurement**: Heights calculated via `offsetHeight` after page load
- **Use case**: Compare declared sizes with actual rendered dimensions

### Changed

#### Theme Architecture - Themes Moved to Separate Packages
- **Themes extracted from core**: All theme files removed from `packages/core/src/scss/themes/` and moved to dedicated theme packages
  - Deleted from core: `audi.scss`, `audi-light.scss`, `corporate.scss`, `dark.scss`, `dark-blue.scss`, `dark-green.scss`, `dark-red.scss`, `express.scss`, `minimal.scss`, `_dark-base.scss`
  - Themes now live in: `packages/theme-audi`, `packages/theme-dark`, `packages/theme-express`, etc.
- **Core package is now theme-agnostic**: Contains only the framework foundation, not specific themes
- **Benefits**: Smaller core package size, independent theme versioning, cleaner separation of concerns

#### Base CSS Variables - Semantic Naming
- **Category renamed**: `surface` → `background` in variable manifest
- **Variables renamed** with clearer semantic purpose:
  - `$base-surface-1` → `$base-main-bg` (Primary background: cards, modals, content)
  - `$base-surface-2` → `$base-page-bg` (Page background, subtle sections)
  - `$base-surface-3` → `$base-subtle-bg` (Muted areas, dividers)
  - `$base-surface-inverse` → `$base-inverse-bg` (Inverse background: tooltips, dark elements)
- **CSS variable output updated**: Both semantic (`--base-main-bg`) and legacy (`--base-surface-1`) variables exported

### Added

#### New Interactive State Background Variables
- `$base-hover-bg` - Hover state background (default: `$base-subtle-bg`)
- `$base-active-bg` - Active/pressed state background (default: 5% darker than subtle)
- `$base-disabled-bg` - Disabled element background (default: `$base-subtle-bg`)
- **Use case**: Consistent interactive state styling across web components

### Fixed

#### SCSS Variable Scoping for Themes
- **Changed module system**: `@forward` → `@import` in `_variables.scss` and `variables/_index.scss`
- **Problem**: `@forward` created isolated scopes, preventing themes from overriding `$base-*` variables before import
- **Solution**: `@import` ensures variables share global scope, allowing themes to set variables BEFORE importing and `!default` flags skip already-defined variables
- **Result**: Simpler theme authoring - just define your `$base-*` overrides, then `@import` variables

### Backward Compatibility
- **Legacy aliases maintained**: `$base-surface-1`, `$base-surface-2`, `$base-surface-3`, `$base-surface-inverse` still work
- **CSS variables**: Both old (`--base-surface-*`) and new (`--base-main-bg`, etc.) exported
- **No breaking changes**: Existing themes using old variable names continue to work

---

## [1.0.0] - 2026-01-13

**Pure Admin 1.0.0** is a lightweight, data-focused CSS/SCSS admin framework. This is the first production release.

### Release Highlights

- **Complete Component Library**: Buttons, cards, forms, tables, modals, toasts, tooltips, tabs, alerts, badges, notifications, profile panel, command palette, and more
- **Flexible Grid System**: 12-column grid with percentage (5% increments), fraction (halves, thirds, quarters), and responsive breakpoints (sm, md, lg, xl)
- **5 Themes**: Corporate (default), Audi, Express, Dark (with color variants), Minimal
- **Dark Mode Support**: Built-in light/dark mode switching with `data-theme` attribute for web component compatibility
- **Resizable Sidebar**: Opt-in drag-to-resize with localStorage persistence and utility class overrides
- **Three-Section Layouts**: Navbar and footer with left/center/right anchored sections
- **Comprehensive Utilities**: Spacing, sizing (rem and percentage), flexbox alignment, text truncation, gap utilities
- **HTML Snippets**: 30 ready-to-use component patterns for any frontend framework (React, Vue, Svelte, etc.)
- **SCSS Customization**: All variables use `!default` for easy theming

---

### Added

#### Extended Sizing Utility Classes
- **Width utilities extended to 50rem**: `.wr-30`, `.wr-35`, `.wr-40`, `.wr-45`, `.wr-50` (and corresponding `minwr-*`, `maxwr-*`)
- **Height utilities extended to 50rem**: `.hr-30`, `.hr-35`, `.hr-40`, `.hr-45`, `.hr-50` (and corresponding `minhr-*`, `maxhr-*`)
- **Fractional width utilities**: `.w-1-2`, `.w-1-4`, `.w-3-4` with matching `mw-*`, `maxw-*`, and `-fixed` variants
- **Fractional height utilities**: `.h-1-2`, `.h-1-3`, `.h-2-3`, `.h-1-4`, `.h-3-4` with matching `minh-*`, `maxh-*` variants

#### Resizable Sidebar (Opt-in)
- **New feature**: Drag-to-resize sidebar with mouse or touch
- **Opt-in via class**: Add `pa-layout__sidebar--resizable` to enable
- **Settings panel toggle**: New "Resizable" checkbox under Sidebar options
- **CSS variable for width**: `--pa-local-sidebar-width` allows dynamic width changes
- **Constraints**: Min 180px, max 500px width
- **localStorage persistence**: Width saved and restored across sessions
- **Early load**: Width applied in `<head>` before render to prevent flash
- **Double-click to reset**: Double-click the resize handle to restore default width (288px)
- **Visual feedback**: Accent-colored line appears on hover/drag
- **Smooth performance**: Uses `requestAnimationFrame` throttling for 60fps resize
- **Utility class override**: Width uses `:where()` for low specificity - `.wr-*` sets fixed width, `.minwr-*` sets minimum
- **Files**: `_sidebar.scss` (styles), `sidebar-resize.js` (functionality), `settings-panel.js` (toggle)

#### Profile Panel Width Override
- **CSS variables**: `--pa-local-profile-panel-width` (default 20vw) and `--pa-local-profile-panel-max-width` (default 48rem)
- **Utility class override**: Width uses `:where()` for low specificity - `.wr-*`, `.minwr-*`, `.maxwr-*` classes can override
- **Apply to `.pa-profile-panel__content`**: Add utility classes to the content element (e.g., `wr-25` for 250px)
- **Files**: `_profile.scss`

### Changed

#### Navbar Three-Section Layout (Left/Center/Right)
- **New structure**: Header content now organized into three explicit sections
  - `.pa-header__left` - Anchored to left edge (burger, brand, nav--left)
  - `.pa-header__center` - Flexible center section (title)
  - `.pa-header__right` - Anchored to right edge (nav--right, notifications, profile)
- **Robust layout**: Left/right sections stay in their corners regardless of center content
- **Mobile fix**: Notifications and profile no longer collapse to left when title is absent
- **Removed hacks**: Eliminated `margin-left: auto` workarounds from notifications and nav elements
- **Files updated**: `_navbar.scss`, `_navbar-elements.scss`, `_notifications.scss`, `navbar.mustache`, `layout.html` snippet

#### Footer Three-Section Layout (Left/Center/Right)
- **New structure**: Footer now mirrors navbar with three explicit sections
  - `.pa-footer__left` - Anchored to left edge (copyright)
  - `.pa-footer__center` - Flexible center section (optional content)
  - `.pa-footer__right` - Anchored to right edge (version info, links)
- **Expandable height**: Footer uses `min-height` instead of fixed `height`, allowing it to grow for multi-line content
- **Vertical modifier**: `.pa-footer__right--vertical` stacks items vertically with right-aligned text
- **Use case**: Display app/database versions and license links on the right while keeping copyright on left
- **Files updated**: `_layout-container.scss`, `layout.mustache`, `layout.html` snippet

#### Align-Self Utility Classes
- **New utilities**: Flexbox/grid child alignment classes
  - `.self-start` - Align to top (`align-self: flex-start`)
  - `.self-center` - Align to center (`align-self: center`)
  - `.self-end` - Align to bottom (`align-self: flex-end`)
  - `.self-stretch` - Stretch to fill (`align-self: stretch`)
  - `.self-baseline` - Align to baseline (`align-self: baseline`)
- **Use case**: Align individual flex children independently, e.g., copyright at top of expanded footer

### Fixed

#### Footer Mobile Responsive Layout
- **Wrap on narrow viewports**: Footer sections now wrap properly at mobile breakpoint (768px)
- **No overlap**: Left and right sections no longer overlap at narrow widths
- **Flexible sizing**: Sections can shrink on mobile (`flex-shrink: 1`, `min-width: 0`)
- **Center hidden**: Empty center section hidden on mobile to save space

#### Web Components Dark Mode Support
- **Added `data-theme` attribute**: Body element now receives `data-theme="dark"` or `data-theme="light"` when theme mode changes
- **Web-grid compatibility**: The `@keenmate/web-grid` component now properly displays in dark mode
- **Applies to all web components**: Any web component that looks for `data-theme` attribute on ancestors will now work
- **Files updated**: `layout.mustache` (FOUC prevention script), `settings-panel.js` (runtime mode switching)

### Added

#### Notifications Page View (`pa-notifications__list--page`)
- **New modifier**: `pa-notifications__list--page` for full-page notification listings
- **Larger display**: Increased padding, icon size, and font sizes for page context
- **Action buttons**: New `pa-notifications__actions` element with hover reveal
- **Select all**: Checkbox support for bulk selection
- **Bulk actions**: Mark as read, delete multiple notifications
- **Mobile responsive**: Actions always visible on mobile with separator border
- **Demo page**: New `/notifications` route with full working example
- **Files updated**: `_notifications.scss`, `notifications.mustache`, `server.js`, `sidebar.mustache`, `navbar.mustache`

#### Text Truncation Utility (`.text-truncate`)
- **New utility**: `.text-truncate` class for ellipsis text overflow
- **Properties**: `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`
- **Use case**: Truncate long text in buttons, badges, or any fixed-width container
- **Pair with width**: Combine with `.wr-*` classes for fixed width truncation
- **Files updated**: `_utilities.scss`

#### Grid Auto-Stack on Mobile
- **Mobile-first**: Base percentage and fraction columns auto-stack to 100% width below mobile breakpoint (768px)
- **Override with responsive classes**: Use `.pa-col-sm-*`, `.pa-col-md-*` etc. to maintain columns on mobile
- **Affected classes**: All `.pa-col-{n}` (5-95) and `.pa-col-{fraction}` classes
- **Files updated**: `_grid.scss`

#### Tabs as Card Header (`pa-tabs__container--card`)
- **New modifier**: `pa-tabs__container--card` makes tabs look like a card with tabs replacing the header
- **Height alignment**: Tabs row has explicit height matching card header (40px)
- **Use case**: Side-by-side layouts where tabs-card and regular card need aligned headers
- **Styling**: Same border, border-radius, background, and shadow as regular cards
- **Theme support**: Uses `$card-border-width` variable so themes control both

#### Tab Overflow Dropdown
- **New component**: `pa-tabs__overflow` with toggle button and dropdown menu
- **Overflow toggle**: Ellipsis button at end of tabs row for overflow tabs
- **Dropdown menu**: Hidden tabs appear in floating dropdown on click
- **Active indicator**: Toggle shows accent underline when active tab is in overflow
- **Click outside**: Dropdown closes when clicking outside
- **New classes**: `pa-tabs__overflow`, `pa-tabs__overflow-toggle`, `pa-tabs__overflow-menu`, `pa-tabs__overflow-toggle--has-active`

#### Inline Tabs in Card Headers (`pa-card__tabs--inline`)
- **New modifier**: `pa-card__tabs--inline` places tabs inside the card header row
- **Height alignment**: Cards with inline tabs have the same header height as cards without tabs
- **Styling**: Tabs appear as pill-style buttons with accent color on active state
- **New variables**: `$card-tab-inline-padding-v`, `$card-tab-inline-padding-h`

#### Card Border Width Variable
- **New variable**: `$card-border-width` controls card outer border (default: 1px)
- **Theme control**: Themes can override (e.g., Audi uses 2px via `$border-width-medium`)
- **Applied to**: Both `.pa-card` and `.pa-tabs__container--card`

#### Card Border Radius Variable
- **New variable**: `$card-border-radius` controls both card and header corner radius
- **Unified styling**: Card container and header now share the same border-radius value
- **Theme support**: Themes can set `$card-border-radius: 0` for square corners (e.g., Audi design language)
- **Audi theme**: Removed `!important` override, now uses variable

#### Tooltip Color Variants (color-1 through color-9)
- **New modifiers**: `pa-tooltip--color-1` through `pa-tooltip--color-9`
- **Theme-customizable**: Uses `--pa-color-*` CSS variables that themes can define
- **Floating UI support**: Works with both CSS-only and JavaScript floating tooltips
- **Default**: Colors are `transparent` unless theme defines `$color-1` through `$color-9`

#### Popover Alignment Modifiers
- **Default alignment**: Popover body now defaults to `text-align: left` (prevents inherited center alignment)
- **New modifiers**: `pa-popover--center` and `pa-popover--right` for explicit alignment control
- **Use case**: Rich content with lists now displays correctly regardless of parent alignment

#### Static Modal Modifier
- **New modifier**: `pa-modal--static` prevents closing via ESC key or backdrop click
- **Use case**: License agreements, critical confirmations, or required actions that must be explicitly acknowledged
- **Implementation**: Add class to modal wrapper, omit onclick from backdrop, optionally remove X button
- **JavaScript**: ESC handler must check for `--static` class before closing

### Changed

#### Unified Component Height System
- **Single source of truth**: All component heights now derive from `$base-input-size-*-height` variables in `_base.scss`
  - XS: 3.1rem (31px), SM: 3.3rem (33px), MD: 3.5rem (35px), LG: 3.8rem (38px), XL: 4.1rem (41px)
- **Explicit heights for inputs/selects**: `.pa-input` and `.pa-select` now have explicit `height` instead of padding-based sizing
- **Explicit heights for buttons**: `.pa-btn` and size variants now have explicit `height` matching input heights
- **Icon-only buttons aligned**: `$btn-icon-only-size-*` variables reference `$btn-height-*` which reference input heights
- **Result**: Inputs, buttons, and icon-only buttons at the same size variant are guaranteed to be the same height

#### Card Header Refinements
- **Reduced vertical padding**: `$card-header-padding-v` changed from 0.8rem to 0.5rem (8px → 5px)
- **Button negative margins**: Added `margin-top/bottom: -0.25rem` to buttons in card headers (same as table cells)
  - Prevents buttons from increasing header height beyond `min-height`
  - Card headers now maintain compact appearance with action buttons

### Fixed

#### Icon-Only Button Centering
- **Added `line-height: 1`** to `.pa-btn--icon-only`
  - Fixes vertical centering issues with icons and Unicode characters
  - Works with FontAwesome icons, Unicode symbols, and SVG icons
  - Standard practice for icon buttons across frameworks

---

## [1.0.0-rc04] - 2026-01-06

### Added

#### Sizing Utility Classes (Consolidation)
- **Rem-based utilities** (78 classes) - replaces component-specific `--w-1x` modifiers
  - Width: `.wr-1` to `.wr-10`, `.wr-15`, `.wr-20`, `.wr-25` (width in rem)
  - Min-width: `.minwr-1` to `.minwr-25` (min-width in rem)
  - Max-width: `.maxwr-1` to `.maxwr-25` (max-width in rem)
  - Height: `.hr-1` to `.hr-25` (height in rem)
  - Min-height: `.minhr-1` to `.minhr-25` (min-height in rem)
  - Max-height: `.maxhr-1` to `.maxhr-25` (max-height in rem)
- **Percentage min/max utilities** (88 classes) - extends existing `w-*` and `h-*`
  - Min-width: `.minw-5` to `.minw-100`, `.minw-1-3`, `.minw-2-3`
  - Max-width: `.maxw-5` to `.maxw-100`, `.maxw-1-3`, `.maxw-2-3`
  - Min-height: `.minh-5` to `.minh-100`, `.minh-1-3`, `.minh-2-3`
  - Max-height: `.maxh-5` to `.maxh-100`, `.maxh-1-3`, `.maxh-2-3`
- **Usage**: `<button class="pa-tabs__item minwr-6">` instead of `<button class="pa-tabs__item pa-tabs__item--w-6x">`

### Removed

#### Component-Specific Width Classes (Consolidated to Utilities)
- **Tabs**: Removed `pa-tabs__item--w-1x` to `--w-10x` and `--h-1x` to `--h-10x`
- **Badges**: Removed `pa-badge--w-1x` to `--w-10x` and auto-ellipsis selector
- **Buttons**: Removed `pa-btn--w-1x` to `--w-10x`
- **Migration**: Use new utility classes instead (e.g., `minwr-6` instead of `pa-tabs__item--w-6x`)

#### Button Group Gap Modifiers (Consolidated to Utilities)
- **Removed**: `pa-btn-group--compact` and `pa-btn-group--loose` modifiers
- **Removed variables**: `$btn-group-gap-compact`, `$btn-group-gap-loose`
- **Changed**: Default gap from 3.2px to 3px (`$btn-group-gap: 0.3rem`)
- **Migration**: Use `gap-*` utility classes instead (e.g., `gap-2` for compact, `gap-8` for loose)

#### Tabs Component
- **Border top variant**: New `.pa-tabs--border-top` modifier moves active indicator from bottom to top
  - Container border moves from bottom to top
  - Tab item active border moves from bottom to top
  - Useful for profile panel tabs and similar UI patterns

### Changed

#### Profile Panel Padding Architecture
- **Refactored to follow sidebar pattern**: Body now has vertical padding only, items handle horizontal
  - `__body` changed from `padding: $spacing-lg` to `padding: $spacing-lg 0`
  - Nav items extend edge-to-edge for proper hover backgrounds
  - Actions and favorites-add use `$profile-panel-content-padding` for horizontal padding
- **New variable**: `$profile-panel-content-padding: 1.6rem` - matches sidebar-padding horizontal (16px)
- **Updated tabs section**: Now uses `$profile-panel-content-padding` instead of `$spacing-lg`

### Fixed

#### Button/Input Size Alignment
- **Aligned button padding with input padding** - Buttons now match input heights at each size variant
  - XS: vertical padding 0.4rem → 0.6rem (matches input--xs)
  - SM: vertical padding 0.6rem → 0.8rem (matches input default)
  - LG: vertical padding 1.0rem → 0.8rem (matches input default)
  - XL: vertical padding 1.2rem → 0.8rem (matches input default)
- **Removed explicit min-height** from button size variants (natural sizing via padding)
- **Use case**: Buttons placed next to inputs of the same size now have matching heights

#### Profile Panel Theme Consistency
- **Header border**: Changed from `--pa-text-primary` to `--pa-border-color` (line 91)
- **Avatar icon color**: Changed from hardcoded `$accent-color` to `var(--pa-accent)` (line 118)
- **Tabs hover background**: Changed from hardcoded `rgba(255, 255, 255, 0.1)` to `var(--pa-accent-light)` (line 261)

---

## [1.0.0-rc03] - 2026-01-05

### Added

#### Profile Panel Enhancements
- **No-avatar variant**: New `.pa-profile-panel__header--no-avatar` modifier hides avatar for corporate apps without user photos
- **Text truncation**: Profile name now truncates with ellipsis for long display names
- **Close button spacing**: Added padding-right to info section to prevent text overlapping close button
- **Settings panel toggle**: Demo settings panel now includes "Hide Avatar" toggle to switch between avatar/no-avatar modes

---

## [1.0.0-rc02] - 2026-01-04

### Added

#### Profile Panel Favorites Feature
- **New favorites tab**: Profile panel now supports tabbed interface with Profile and Favorites tabs
- **Favorites section classes**: New dedicated classes for favorites list items
  - `.pa-profile-panel__favorites` - Favorites container
  - `.pa-profile-panel__favorite-item` - Clickable favorite item (uses `data-href` for navigation)
  - `.pa-profile-panel__favorite-icon` - Icon container
  - `.pa-profile-panel__favorite-label` - Text label
  - `.pa-profile-panel__favorite-remove` - Remove button (appears on hover)
  - `.pa-profile-panel__favorites-add` - Add button container
- **Profile panel tabs section**: `.pa-profile-panel__tabs` with themed styling
  - Uses existing `.pa-tabs` component
  - Tab switching via `data-profile-tab` and `data-profile-panel` attributes
- **Updated profile.html snippet**: Added "WITH TABS (PROFILE + FAVORITES)" section with complete example

#### Profile Panel Styling Alignment
- **Aligned profile nav items with sidebar**: Profile and Favorites items now match sidebar first-level links
  - Gap: `$sidebar-item-gap` (1.2rem = 12px)
  - Padding: `$sidebar-padding` (0.8rem 1.6rem = 8px 16px)
  - Icon font-size: `$font-size-base` (1.6rem = 16px)
  - Icon width: `$sidebar-icon-size` (2.4rem = 24px)
- **Increased favorite remove button hitbox**: Changed padding from `$spacing-xs` (2.5px) to `$spacing-sm` (5px)

#### Gap Utility Classes
- **New gap utilities**: Flexbox/grid gap classes to replace inline `style="gap: ..."`
  - Semantic: `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-base`, `.gap-lg`, `.gap-xl`, `.gap-2xl`
  - Numeric (10px rem base): `.gap-1` through `.gap-20` (1px to 20px)
  - Row-only: `.row-gap-xs`, `.row-gap-sm`, `.row-gap-md`, `.row-gap-base`, `.row-gap-lg`
  - Column-only: `.column-gap-xs`, `.column-gap-sm`, `.column-gap-md`, `.column-gap-base`, `.column-gap-lg`

#### Font-Size Utility Classes
- **New text-size utilities**: Direct font-size classes using typography variables (10px rem base)
  - `.text-2xs` (10px), `.text-xs` (12px), `.text-sm` (14px), `.text-md` (15px)
  - `.text-base` (16px), `.text-lg` (18px), `.text-xl` (20px)
  - `.text-2xl` (24px), `.text-3xl` (28px), `.text-4xl` (32px)

#### Width Utility Classes (Expanded)
- **New 5% increment widths**: `.w-5`, `.w-10`, `.w-15`, `.w-20`, `.w-30`, `.w-35`, `.w-40`, `.w-45`, `.w-55`, `.w-60`, `.w-65`, `.w-70`, `.w-80`, `.w-85`, `.w-90`, `.w-95`
- **Fraction widths with grid-consistent naming**: `.w-1-3` (33%), `.w-2-3` (66%)
- **Min-width fractions**: `.mw-1-3`, `.mw-2-3`
- **Fixed-width fractions**: `.w-1-3-fixed`, `.w-2-3-fixed`

#### Border Style Utilities
- **New border style classes**: `.border-solid`, `.border-dashed`, `.border-dotted`, `.border-none`

#### Text Color Utilities
- **Semantic text colors**: `.text-primary`, `.text-success`, `.text-danger`, `.text-warning`, `.text-info`
  - Fixed: now use proper `--pa-*-text` variables instead of `--pa-*-bg`
  - Moved from `_tables.scss` to `utilities.scss` (general-purpose)
- **Custom theme color slots**: `.text-color-1` through `.text-color-9`
  - Themes can override `$color-1` to `$color-9` to define branded colors
  - CSS variables: `--pa-color-1` through `--pa-color-9`

#### Callout Component (New)
- **Documentation-style callouts**: Left border accent with subtle background
  - Base: `.pa-callout`
  - Variants: `--primary`, `--secondary`, `--success`, `--danger`, `--warning`, `--info`
  - Sizes: `--sm`, `--lg`
  - Elements: `__icon`, `__heading`, `__content`
- **Use case**: Tips, notes, warnings in documentation and content areas
- **Variable**: `$callout-border-width` (default: 0.4rem / 4px)

### Changed

#### Card System Refinements
- **Reduced card header min-height**: `$card-header-min-height` changed from `5rem` (50px) to `4rem` (40px)
  - Header now fits xs buttons (32px) with 4px breathing room on each side
  - More compact card appearance while maintaining usability
- **Split card body padding into h/v variants**: `$card-body-padding` split into separate variables
  - `$card-body-padding-v: 1.6rem` (vertical padding, unchanged)
  - `$card-body-padding-h: 1rem` (horizontal padding, reduced from 1.6rem)
  - Allows independent control of horizontal and vertical body padding
- **Unified horizontal padding**: All card sections now use consistent 1rem horizontal padding
  - `$card-header-padding-h: 1rem` (reduced from 1.6rem)
  - `$card-body-padding-h: 1rem` (reduced from 1.6rem)
  - `$card-footer-padding-h: 1rem` (reduced from 1.6rem)
  - Content alignment now consistent across header, body, and footer

### Fixed

#### Card Title Vertical Alignment
- **Fixed icon/text misalignment in card headers**: Added `line-height: 1` to `.pa-card__title-text`
  - Icon had `line-height: 1` but title text did not, causing vertical misalignment
  - Both icon and text now vertically centered within card title

---

## [1.0.0-rc01] - 2026-01-01

First release candidate for Pure Admin v1.0.0.

### Fixed - 2026-01-01

#### Dark Mode Navbar Dropdown Visibility
- **Express theme**: Fixed dropdown items unreadable in dark mode
  - Changed `&__nav ul li a` to `&__nav > ul > li > a` (direct child selector)
  - Allows dropdown links to use CSS variables (`--pa-text-primary`) as intended
- **Corporate theme**: Added dark mode dropdown override
  - White text (`#f1f5f9`) on dark dropdown background
  - Blue hover state (`#38bdf8`) for consistency

#### Express Theme Dark Mode Fixes
- **Footer text**: Fixed white text on yellow background (unreadable)
  - Added `.pa-layout__footer` dark mode override with dark text color
- **Primary alert**: Fixed red text on red background (low contrast)
  - Added white text with semi-transparent red background in dark mode

#### Theme Manifest System
- **New JSON schema**: `packages/core/schemas/pure-admin-theme.schema.json`
  - Defines theme capabilities: modes, colorVariants, features, colors, fonts
- **Theme manifests**: Added `theme.json` to all 5 theme packages
  - Declares supported modes (light/dark), color variants, features
- **API endpoints**: `/api/themes/manifests`, `/api/themes/:theme/manifest`
- **Dynamic settings panel**: Reads theme capabilities from manifests
  - Mode selector shows/hides based on theme support
  - Color variant selector populated from manifest

#### Dark Theme Consolidation
- **Consolidated 4 files into 1**: Merged dark-blue, dark-green, dark-red into dark.scss
  - Color variants now use CSS classes: `.pa-color-blue`, `.pa-color-green`, `.pa-color-red`
- **Updated package exports**: Single CSS output with runtime color switching

### Fixed - 2025-12-25

#### Dark Theme Compatibility in Demo Views & Snippets
- **Fixed 78 inline styling issues** across demo views and snippets that broke dark theme support
- **Code blocks**: Replaced hardcoded `background: #f5f5f5` with `.pa-code` class
  - Files: comparison.mustache, smart-filters.mustache, file-selector.mustache, loaders.mustache, tables-sizing.mustache, tooltips.mustache
- **Text colors**: Replaced hardcoded `#666`, `#888` with `var(--base-text-color-3)`
  - Files: checkbox-lists.mustache, file-selector.mustache, smart-filters.mustache, table-filters.mustache
- **Background colors**: Replaced `white`, `#f8f9fa`, `#f9f9f9` with CSS variables
  - Files: date-picker.mustache, multiselect.mustache, table-multi-select.mustache, virtual-scroll.html
- **Border colors**: Replaced `#ddd`, `#e0e0e0` with `var(--base-border-color)`
  - Files: loaders.mustache, smart-filters.mustache, table-filters.mustache, theme-variables.mustache
- **Semantic colors**: Replaced hardcoded hex values with CSS variables
  - `#10b981` → `var(--base-success-color)` (comparison.mustache, virtual-scroll-code.mustache)
  - `#dc3545` → `var(--base-danger-color)` (loaders.mustache, grid.mustache)
  - `#28a745` → `var(--base-success-color)` (loaders.mustache, grid.mustache)
  - `#ffc107` → `var(--base-warning-color)` (loaders.mustache)
  - `#17a2b8` → `var(--base-info-color)` (loaders.mustache)
  - `#007bff` → `var(--base-primary-color)` (loaders.mustache)
- **Layout styles**: Converted inline flex/display styles to utility classes
  - `flex: 1` → `flex-grow-1` (tabs.html)
  - `text-align: center/right` → `text-center`/`text-right` (forms.html)
  - `width: 100%` → `w-100` (toasts.html)
  - `display: none` → `d-none` (virtual-scroll.html)

#### Invalid Column Class Names
- **Fixed 140+ occurrences** of non-existent column classes across all demo views
  - `pa-col-md-33` → `pa-col-md-1-3` (132 occurrences in 18 files)
  - `pa-col-md-67` → `pa-col-md-2-3` (8 occurrences in 5 files)
  - `pa-col-md-17` → `pa-col-md-15` (nearest 5% increment)
  - `pa-col-md-83` → `pa-col-md-85` (nearest 5% increment)
- **Grid system note**: Column classes use either 5% increments (5, 10, 15...100) or fractions (1-2, 1-3, 2-3, 1-4, 3-4)

#### Sidebar Active Item Shift (Audi Theme)
- **Fixed 3px horizontal shift** when selecting sidebar menu items in Audi theme
- **Root cause**: Audi theme added `border-left` on active state without reserving space in non-active state
- **Solution**: Added transparent left border to `.pa-sidebar__link` base state to reserve space
  - Non-active: `border-left: 3px solid transparent`
  - Active: `border-left-color: $accent-color` (only changes color, not width)
- **File**: `src/scss/themes/audi.scss`

#### SCSS Module Loop Errors
- **Fixed build-breaking module loops** caused by naming collisions between `_name.scss` files and `name/` directories
- **Pattern**: Aggregator files using `@forward 'name'` were ambiguous - SASS couldn't distinguish between the file and directory
- **Solution**: Changed to explicit paths using `@forward 'name/index'`
- **Files fixed**:
  - `_variables.scss` - `@forward 'variables'` → `@forward 'variables/index'`
  - `_core.scss` - `@forward 'variables'` → `@forward 'variables/index'`
  - `core-components/_layout.scss` - `@forward 'layout'` → `@forward 'layout/index'`
  - `core-components/_badges.scss` - `@forward 'badges'` → `@forward 'badges/index'`
  - `core-components/_forms.scss` - `@forward 'forms'` → `@forward 'forms/index'`

### Changed - 2025-12-20

#### Workspace Migration
- **Converted to npm workspace**: Restructured repository as npm workspace (like svelte-fluentui)
  - Root `package.json` with `"workspaces": ["packages/*", "demo"]`
  - Core package moved to `packages/core/`
  - Demo site moved to `demo/` (Express.js + Mustache)
  - Single `npm install` at root installs all dependencies
- **New directory structure**:
  ```
  pure-admin/
  ├── package.json          # Workspace root
  ├── Makefile              # Build commands
  ├── packages/core/        # @keenmate/pure-admin-core
  └── demo/                 # Demo site (not published)
  ```
- **Demo server path updates**: `server.js` now references `../packages/core/` for static files
- **Build scripts**: Added `build:themes` and `build:all` scripts
- **Legacy directories preserved**: `pure-admin-visual/` and `pure-admin-core/` kept for reference

### Added - 2025-10-08

#### Layout System Improvements
- **Footer height standardization**: Footer now uses `$footer-height: $header-height` (3rem/48px) for visual balance
- **Footer restructuring**: Moved footer outside `.pa-layout__inner` to fix positioning issues with short content
  - Footer always appears at bottom of viewport, even with minimal content
  - Changed from `min-height` to `height` for consistent sizing
  - Added `m-0` class to footer paragraph to prevent margin overflow

#### Timeline Block Component Enhancements
- **Independent layout modifiers**: Control alignment and responsive behavior separately
  - `--left`: All timeline items on left side
  - `--right`: All timeline items on right side
  - `--keep-layout`: Prevent mobile collapse, maintain desktop layout at all screen widths
- **Responsive behavior**: Automatic single-column layout on screens ≤767px (unless `--keep-layout` used)
- **Combination support**: Mix alignment + responsive modifiers (e.g., `--left --keep-layout`)
- **Padding optimization**: Removed redundant card body padding from aligned timelines
- **New examples**: Added comprehensive demonstration of all timeline modifiers on timeline-block page

#### Command Palette
- **Background fix**: Changed from `$primary-bg` to `$modal-content-bg` for better visibility in dark themes

### Fixed - 2025-10-08

#### Layout Issues
- **Sidebar restoration**: Fixed critical bug where sidebar styles were accidentally removed during layout consolidation
  - Restored all `.pa-sidebar__*` classes (item, link, toggle, icon, label, submenu, chevron)
  - Added sidebar hidden state styles (`.sidebar-hidden`)
  - Added icon-collapse mode styles with flyout menus
  - Added responsive mobile/tablet styles
- **Footer positioning**: Fixed footer appearing mid-screen with short content
  - Implemented flexbox-based layout: `.pa-layout` (flex column) → `.pa-layout__inner` (flex: 1) → `.pa-layout__footer` (flex-shrink: 0)
  - Footer now correctly positioned at bottom in both sticky and scroll modes

### Changed - 2025-10-08

#### File Consolidation
- **Layout files merged**: Consolidated `_layout.scss` and `_layout-v2.scss` into single file
  - Kept clean flexbox structure from v2 (removed complex absolute positioning)
  - Merged header/navbar styles from original file
  - Deleted backup files and updated imports in `_core.scss`

### Added - 2025-10-05

#### Comprehensive Component Snippets for LLM Consumption
- **Created comprehensive snippet documentation** for all framework components
  - **Purpose**: Prevent LLMs from making incorrect assumptions about available options
  - **Context**: Another Claude instance assumed only 1-2 badge sizes existed due to incomplete snippets
- **New snippet files**:
  - `snippets/grid.html` - Complete PureCSS grid reference
    - All fractions: halves, thirds, quarters, fifths, sixths, eighths, twelfths, twenty-fourths
    - All responsive variants: `pure-u-sm-*`, `pure-u-md-*`, `pure-u-lg-*`, `pure-u-xl-*`
    - Nested grid examples and dashboard layouts
  - `snippets/tooltips.html` - Complete tooltip and popover reference
    - All 4 positions: top, right, bottom, left
    - All 5 color variants: default, primary, success, warning, danger
    - Multiline tooltips
    - Auto-flip smart positioning classes
    - Popover component with all sizes (sm, md, lg) and positions
    - Rich content examples (lists, code blocks, links)
    - Complete JavaScript API reference
- **Enhanced existing snippets**:
  - `alerts.html` - Added missing `--lg` size (sm, default, lg now all documented)
  - `badges.html` - Added large badge example (was missing from snippet)
  - `cards.html` - Added missing variants and sub-components:
    - `--warning` variant (was undocumented)
    - `--stat` variant for statistics cards
    - `.pa-card__title` components (icon + text)
    - `.pa-card__meta` for metadata
    - Footer actions pattern
    - No-padding body variant for tables
    - Tab content areas with JavaScript
    - Section component
  - `tables.html` - Major cleanup and additions:
    - Fixed incorrect class names (`--hover`, `--bordered`, `--compact` removed as they don't exist)
    - Corrected spacing classes: `--spacing-2x/3x` → `--2x/3x`
    - Added table container (`.pa-table-container`)
    - Added pager component examples (all 3 positions)
    - Added load more component (all states and positions)
    - Comprehensive modifier reference at end
- **Status**: All 14 snippet files now comprehensive
  - ✅ alerts.html, badges.html, buttons.html, cards.html
  - ✅ forms.html, grid.html, layout.html, loaders.html
  - ✅ modals.html, profile.html, tables.html, toasts.html
  - ✅ tooltips.html, utilities.html

#### Performance Optimizations
- **Page loader timing improvements**:
  - Removed 100ms "font settle" delay (unnecessary wait after fonts load)
  - Reduced timeout fallback: 3s → 1s
  - Reduced DOM removal delays: 150ms → 80ms
  - **Total improvement**: ~100-200ms faster perceived load time
  - Kept necessary delays: 150ms transition, 50ms body.loaded (prevents layout jumps)
- **Fixed font-size FOUC** (Flash of Unstyled Content):
  - Font-size now applied immediately in inline script (before rendering)
  - Previously applied on DOMContentLoaded, causing 1.15-1.25x size jump
  - Moved from `loadSettings()` function to immediate FOUC prevention script
  - Matches pattern used for sidebar-hidden and compact-mode
- **Fixed scrollbar layout shift**:
  - Added `overflow-y: scroll` to body
  - Forces scrollbar gutter to always be present
  - Prevents ~15px horizontal shift when navigating between short/long pages
  - Consistent layout across all pages

### Added - 2025-10-05 (Afternoon Session)

#### Comparison Table Component
- **New component**: `.pa-comparison-table` for version control, data changes, and A/B comparisons
  - **Two-column layout**: Base vs New (version detail pattern)
  - **Three-column layout**: Base vs Change A vs Change B (A/B testing pattern)
  - **Change highlighting**: `.pa-comparison-table__changed` with pink background and left border accent
    - Background: `rgba(244, 114, 182, 0.15)`
    - Left border: 3px solid `#ec4899` (pink-500)
    - Solid variant: `--solid` modifier removes border, intensifies background
  - **Conflict highlighting**: `.pa-comparison-table__conflict` for conflicting changes
    - Background: `rgba(251, 146, 60, 0.15)`
    - Left border: 3px solid `#f97316` (orange-500)
    - Solid variant available
  - **Section headers**: Grouping rows by category (Address Data, Address Metadata, etc.)
  - **Copy-to-clipboard buttons**: Card header integration for copying table content
  - **Rich content support**: Icons, badges, status indicators in cells
  - **Works in cards**: `.pa-card__body--no-padding` for seamless integration
- **New page**: `/comparison` with comprehensive examples
- **SCSS Variables**:
  - Uses existing `$border-width-medium`, `$primary-bg`, `$text-secondary`
  - Change colors hardcoded (pink-500, orange-500) for consistency across themes
- **Snippet**: `snippets/comparison.html` with 2-column and 3-column patterns

#### Lists Component System
- **New component**: Styled HTML lists (ul, ol, dl) with multiple variants
  - **Basic lists**: `.pa-list-basic` with proper spacing and styling
  - **Ordered lists**: `.pa-list-ordered` with number/letter/roman variants
  - **Definition lists**: `.pa-list-definition` for term/description pairs
- **List modifiers**:
  - `.pa-list-basic--compact`: Reduced spacing for dense content
  - `.pa-list-basic--spacious`: Increased spacing
  - `.pa-list-basic--unstyled`: No bullets, no padding
  - `.pa-list-basic--inline`: Horizontal layout
  - `.pa-list-basic--bordered`: Add borders between items
  - `.pa-list-basic--striped`: Zebra striping
  - `.pa-list-basic--icon`: Checkmarks (combine with `--danger`, `--info`, `--warning` for variants)
  - `.pa-list-ordered--roman`: Roman numerals
  - `.pa-list-ordered--alpha`: Lowercase letters
  - `.pa-list-definition--inline`: Horizontal key-value pairs
- **Features**:
  - All spacing controlled by SCSS variables (`$spacing-sm`, `$spacing-base`, `$spacing-lg`)
  - Border colors use `$border-color` for theme consistency
  - Icon lists use `$success-bg` for checkmark color
  - Works in cards with no-padding modifier
- **New page**: `/lists` with comprehensive examples
- **Snippet**: `snippets/lists.html` with all list variants

#### Multilevel Flyout Menus
- **Enhanced sidebar**: Multilevel menus now display as flyouts when sidebar is in icon-collapse mode
  - **Hover activation**: Flyout menus appear on hover over parent items
  - **Cascading submenus**: Third-level menus fly out to the right from second-level
  - **Smart positioning**: Absolute positioning relative to parent items
  - **Visual styling**: Border, box shadow, and proper background colors
  - **Chevron direction**: Arrows point right (›) in flyouts instead of down
- **Implementation**:
  - Added `position: relative` to `.pa-sidebar__item` for flyout positioning
  - Flyout menus use `position: absolute`, `left: 100%`, `top: 0`
  - Min-width: 12rem for readable menu items
  - Z-index layering: level 2 (1001), level 3 (1002)
  - Removed transform rotation from chevrons in flyout mode
- **Demo content**: Added extensive demo menu items at levels 2 and 3 for testing
  - System Settings with 4 sub-items
  - User Settings with 3 sub-items
  - Advanced with 3 sub-items
  - Appearance and Integrations items
- **SCSS updates**: `src/scss/core-components/_layout.scss` with flyout-specific styles
- **Hover persistence**: Menus stay visible when hovering over submenu itself

### Changed - 2025-10-05 (Afternoon Session)

#### Page Title Styling
- **Enhanced navbar page title** to stand out more:
  - Font size: `$font-size-lg` (1.125rem / 18px)
  - Font weight: `$font-weight-semibold` (600)
  - Color: `$text-primary` (more prominent than previous secondary color)
- **Location**: `.pa-navbar__title` in `src/scss/core-components/_layout.scss`

#### Duplicate Page Titles Cleanup
- **Removed duplicate h1/h2 page titles** from multiple pages (title now shows in navbar):
  - `views/dashboard.ejs` - Removed "Dashboard" h2
  - `views/loaders.ejs` - Removed "Loaders & Spinners" h2
  - `views/tables-lazy.ejs` - Removed "Lazy Loading Tables" h2
  - `views/tables-sizing.ejs` - Removed "Table Sizing & Spacing" h2
  - `views/tooltips.ejs` - Removed "Tooltips & Popovers" h2
- **Result**: Cleaner page layout with title visible in fixed navbar

#### Sidebar Navigation
- **Updated Modal Windows icon**: Changed from 🪟 (missing icon) to 🔳 (visible square)
- **Added Lists menu item**: New sidebar link to `/lists` page (📃 icon)

### Fixed - 2025-10-05 (Afternoon Session)

#### Modal Layout Shift
- **Fixed horizontal shift** when modals open/close:
  - **Problem**: Opening modal hides scrollbar, causing ~15px horizontal layout shift
  - **Solution**: Calculate scrollbar width and compensate with padding
  - **Implementation**:
    ```javascript
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth + 'px';
    ```
  - **Location**: `views/modals.ejs` in `openModal()` and `closeModal()` functions
  - **Result**: Smooth modal transitions with no layout jump

#### Profile Name Visibility (Dark Themes)
- **Fixed gray text on dark background** in Dark Blue, Dark Green, Dark Red themes:
  - **Problem**: Profile name "John Doe" appeared gray on dark blue header (poor contrast)
  - **Solution**: Added `$header-profile-name-color: #ffffff` to all three dark themes
  - **Files**: `src/scss/themes/dark-blue.scss`, `dark-green.scss`, `dark-red.scss`
  - **Result**: White profile name text visible on all dark headers

#### Sidebar Icon-Collapse Mode
- **Fixed multiple issues** with "Show Icons Only" sidebar behavior:

  **Issue 1: Icons invisible in collapsed mode**
  - **Problem**: `.sidebar-hidden .pa-sidebar` set `opacity: 0`, hiding icons completely
  - **Solution**: Added `opacity: 1` to `.sidebar-hidden .pa-sidebar--icon-collapse` to override
  - **Location**: `src/scss/core-components/_layout.scss`

  **Issue 2: Burger menu icons inverted**
  - **Problem**: Hamburger (☰) showed when sidebar expanded, X showed when collapsed
  - **Expected**: Hamburger when collapsed, X when expanded
  - **Solution**: Rewrote `toggleSidebar()` function with correct logic
  - **Location**: `views/layout.ejs`

  **Issue 3: Body class "sidebar-hidden" added in icon-collapse mode**
  - **Problem**: Both `pa-sidebar--icon-collapse` and `sidebar-hidden` classes added, causing conflicts
  - **Solution**: Modified logic to only add `sidebar-hidden` when behavior is 'hide', not 'icon-collapse'
  - **Location**: `views/layout.ejs` in sidebar behavior initialization

  **Issue 4: Toggle behavior incorrect in icon-collapse mode**
  - **Problem**: Clicking burger in icon-collapse mode didn't properly toggle between icon bar and full width
  - **Solution**: Added dedicated icon-collapse logic in `toggleSidebar()` function
  - **Result**:
    - Icon-collapse mode: Toggle between narrow icon bar and full-width sidebar
    - Hide mode: Toggle between hidden and visible sidebar

- **Files modified**:
  - `src/scss/core-components/_layout.scss` - CSS fixes for opacity and icon visibility
  - `views/layout.ejs` - JavaScript fixes for burger menu and sidebar toggling

#### Comparison Table Solid Modifier
- **Fixed background color override**:
  - **Problem**: `.pa-table td` background was overriding `--solid` modifier
  - **Solution**: Added `!important` to `.pa-comparison-table__changed--solid` background-color
  - **Location**: `src/scss/core-components/_comparison.scss`
  - **Result**: Solid variant now displays intensified background instead of left border

### Fixed - 2025-10-05

#### Profile Name Visibility
- **Added `$header-profile-name-color` variable** (`_variables.scss:275`)
  - Default: `$text-primary` (works for light headers)
  - Audi Light override: `#ffffff` (light text on dark header)
  - Corporate override: `#ffffff` (light text on dark header)
- **Applied to `.pa-header__profile-name`** (`_profile.scss:36`)
- **Result**: "John Doe" profile name now visible on all themes

### Added - 2025-10-04

#### Audi Light Theme
- **New light theme variant**: `audi-light.scss` - Light version of Audi theme
  - Maintains Audi's signature elements:
    - Fira Sans Condensed font
    - Bright red accent color (#ff0000)
    - Sharp 1px border radius
    - Red primary/danger buttons
  - Light color scheme:
    - White cards and content areas
    - Light gray backgrounds (#f1f3f5)
    - Dark sidebar and header (#1a1a1a) for contrast
    - Dark text on light backgrounds
  - Red table hover accent (left border)
  - Available in theme selector dropdown

#### Horizontal Form Layouts
- **New form modifier**: `.pa-form-group--horizontal` for label-left, input-right layout
  - Labels automatically align with input top edge
  - Input/select/textarea uses `flex: 1` (fills remaining space)
  - No nested grids needed inside form groups
  - CSS-only solution (no complex HTML structure)
- **Comprehensive snippets**: Added horizontal form examples to `snippets/forms.html`
  - Single field examples (input, select, textarea)
  - Multi-column layouts with equal widths
  - Multi-column layouts with varying widths (1/4 + 5/12 + 1/3)
  - Complete form example with multiple rows
- **Clean pattern**:
  ```html
  <div class="pure-u-1 pure-u-md-1-3">
    <div class="pa-form-group pa-form-group--horizontal">
      <label>Label</label>
      <input class="pa-input">
    </div>
  </div>
  ```

### Changed - 2025-10-03

#### PureCSS Grid Architecture Refactor
- **Moved grid imports from themes to core**: PureCSS grid now imported in `_core.scss` instead of each theme file
  - **Before**: Each theme imported `purecss-grid` and `purecss-grid-responsive`, causing ~15KB duplication per theme
  - **After**: Grid imported once in `_core.scss`, all themes inherit from core
  - **Benefit**: Eliminates code duplication across 8 theme files (corporate, audi, express, minimal, dark, dark-blue, dark-green, dark-red)
- **Made main.css fully functional standalone**: `main.css` now includes grid foundation
  - Previously `main.css` referenced grid classes that didn't exist
  - Now core contains everything needed for complete functionality
- **Improved theme architecture**: Themes only override variables and import core
  - Aligns with design principle: "core contains everything, themes customize"
  - Cleaner separation of concerns: foundation → variables → components
- **Updated all 8 theme files**: Removed redundant grid imports
- **Verified builds**: Both `pure-admin-visual` and `pure-admin-core` compile successfully

### Added - 2025-10-03

#### Toast Notification System
- **New toast component**: `.pa-toast` with fixed-position containers and smooth animations
- **Toast containers**: `.pa-toast-container` with 6 position variants
  - Top: `--top-right`, `--top-center`, `--top-left`
  - Bottom: `--bottom-right`, `--bottom-center`, `--bottom-left`
  - Global containers placed at body level in `layout.ejs`
- **Toast variants**: 5 color styles matching button colors
  - Primary, Success, Danger, Warning, Info
  - Border-based styling with colored icon backgrounds
  - Colored progress bars for auto-dismiss feedback
- **Features**:
  - Smooth slide-in/out animations (directional based on position)
  - Auto-dismiss with configurable duration (default: 5 seconds)
  - **Persistent toasts**: Manual dismiss only variant (no auto-dismiss, no progress bar)
  - Progress bar showing time remaining before auto-dismiss
  - Icon + title + message structure
  - Close button with hover states
  - Automatic stacking with gap spacing
  - Responsive mobile behavior (full width with margin)
- **SCSS Variables**:
  - `$z-index-toast: 1200` (highest z-index, above header dropdowns)
  - `$toast-min-width: 20rem`, `$toast-max-width: 25rem`
  - `$toast-padding-v/h: $spacing-md`
  - `$toast-icon-size: 2rem`, `$toast-close-size: 1.5rem`
  - `$toast-progress-height: 3px`
- **JavaScript API**:
  - `createToast(position, variant, title, message, duration, showProgress, persistent)`
  - `dismissToast(toastId)` for manual dismissal
  - Helper functions for common toast patterns
- **Demo page**: `/toasts` with comprehensive examples
  - Position demonstrations
  - Variant buttons
  - Progress bar toast
  - Persistent toasts (warning, danger, info)
  - Action toasts (upload success, save error)
  - Multiple toast stacking demo
- **Navigation**: Added "Toasts" link to Components → More dropdown

### Fixed - 2025-10-03

#### Dark Theme Header Border Colors
- **Added `$header-border-color` to dark themes**: Dark Red, Dark Green, Dark Blue
  - Each theme now uses its respective border color variable
  - Consistent visual separation between header and sidebar
  - Matches existing border color scheme for each theme

#### Sidebar Mode Settings
- **Fixed cookie handling**: Sidebar mode now properly saves empty string for default mode
  - Changed from truthy check to explicit `!== undefined` check
  - Allows "Scrolls with Content" mode (empty string) to update cookie correctly
  - Prevents getting stuck in "Fixed + Auto-hide" mode
- **Fixed missing variable declaration**: Added `sidebarModeSelector` constant
- **Added reset functionality**: "Reset Settings" button now resets sidebar mode to default
- **Consistent pattern**: Uses dedicated `switchSidebarMode()` function like `switchTheme()`

#### Modal Z-Index Stacking
- **Fixed modal backdrop covering content**: Corrected z-index values
  - Backdrop: Changed from `$z-index-base` (1) to `$z-index-modal-backdrop` (1040)
  - Container: Changed from `$focus-outline-width` (2px) to `$z-index-modal` (1050)
  - Modal container now properly appears in front of backdrop

#### Toast Z-Index and Positioning
- **Fixed toast containers behind header**: Moved toast containers to body level in `layout.ejs`
  - **Problem**: Containers were nested in content area, creating separate stacking context
  - **Solution**: Moved to body level as siblings with header
  - Increased z-index from 1080 to 1200 to ensure visibility above header dropdown (1100)
  - Toast containers now global and work on all pages

### Added - 2025-10-02

#### Badge Group Component
- **New component**: `.pa-badge-group` for displaying collections of badges with automatic overflow handling
- **Features**:
  - Automatic limit on visible badges (default: 5 badges)
  - "More" indicator badge shows remaining count (e.g., "» 10 more")
  - Flexbox layout with wrapping support
  - Configurable gap between badges via `$badge-group-gap` (default: 0.5rem)
- **SCSS Variables**:
  - `$badge-group-gap`: Spacing between badges in group (default: 0.5rem)
  - `$badge-group-visible-limit`: Number of badges to show before hiding extras (default: 5)
- **Modifiers**:
  - `.pa-badge-group--show-all`: Override limit and display all badges (useful for expanded states)
- **Usage Pattern**:
  ```html
  <div class="pa-badge-group">
    <span class="pa-badge pa-badge--primary">Tag 1</span>
    <span class="pa-badge pa-badge--info">Tag 2</span>
    <!-- ... more badges ... -->
    <span class="pa-badge pa-badge--secondary">
      <span class="pa-badge__icon">»</span>
      10 more
    </span>
  </div>
  ```
- **Wrapping behavior**: Narrow container demo shows proper wrapping in constrained spaces (1/6 width example)
- **Future ready**: Designed for Svelte component with per-instance limit configuration

#### Fixed-Width Badges with Ellipsis
- **New badge width classes**: `pa-badge--w-1x` through `pa-badge--w-10x` (1rem to 10rem)
- **Features**:
  - Automatic text truncation with ellipsis (`...`) for overflow
  - Both `min-width` and `max-width` set to ensure consistent sizing
  - Vertical alignment preserved with `vertical-align: middle`
  - Works with all badge variants (sm, pill, colors)
- **Tooltip integration**:
  - Fixed-width badges wrapped in `.pa-tooltip` containers show full text on hover
  - Outer wrapper handles tooltip pseudo-elements with visible overflow
  - Inner badge handles text truncation with hidden overflow
  - Eliminates conflict between ellipsis and tooltip rendering
- **Usage Pattern**:
  ```html
  <span class="pa-tooltip pa-tooltip--bottom" data-tooltip="Full text here">
    <span class="pa-badge pa-badge--primary pa-badge--w-5x">Full text here</span>
  </span>
  ```
- **Examples**: Practical demonstrations of consistent-width tags, status badges, and technology tags
- **All spacing variable-controlled**: No hardcoded values, fully themeable

### Changed - 2025-02-10

#### SCSS Variable Consolidation - Complete Framework Audit
- **Eliminated all hardcoded values**: Audited and replaced 59 hardcoded values across 12 component files
- **Added 50+ new SCSS variables** for complete theme control:
  - **Breakpoints**: `$mobile-breakpoint` (768px), `$tablet-breakpoint` (1024px), `$tablet-breakpoint-min` (769px), `$sidebar-width-tablet` (10rem)
  - **Opacity values**: `$alert-secondary-bg-opacity`, `$alert-light-bg-opacity`, `$card-tab-hover-opacity`, `$bg-pattern-opacity`, `$popover-code-bg-opacity`, `$modal-warning-hover-bg-opacity`
  - **Background pattern**: `$bg-pattern-circle-1-x/y`, `$bg-pattern-circle-2-x/y`, `$bg-pattern-gradient-start/stop`
  - **Form system**: `$checkbox-margin-top`, `$form-group-margin-compact`
  - **Button widths**: `$btn-width-1x` through `$btn-width-10x` (1rem to 10rem)
  - **Loader animations**: `$loader-dots-delay-1/2`, `$loader-bars-delay-1` through `$loader-bars-delay-5`, `$loader-pulse-duration`, `$loader-pulse-easing`
  - **Loader sizes**: Consolidated to base `$spinner-size` variable
  - **Statistics**: `$stat-square-number-min/scale/max`, `$stat-square-symbol-min/scale/max`, `$stat-text-shadow-*`, `$stat-drop-shadow-*`
  - **Profile panel**: `$profile-role-letter-spacing`, `$profile-panel-mobile-max-width`
  - **Settings panel**: `$settings-panel-transition-duration`, `$settings-panel-transition-easing`
  - **Tables**: `$virtual-table-cell-padding-v/h`
  - **Tooltips**: `$popover-code-padding-v/h`, `$popover-code-font-scale`
  - **Badges**: Removed `$badge-padding-h-sm` (theme-controlled via base variable)

#### Component vs Theme Variable Separation
- **Removed all size-specific padding variables**: Components now use only base variables
  - Removed: `$input-padding-xs-v/h`, `$input-padding-sm-v/h`, `$input-padding-xl-v/h`
  - Removed: `$btn-padding-xs-v/h`, `$btn-padding-sm-v/h`, `$btn-padding-lg-v/h`, `$btn-padding-xl-v/h`
  - Removed: `$alert-padding-sm-v/h`, `$alert-padding-lg-v/h`
  - Removed: `$spinner-border-width-lg/xl`
  - Removed: `$loader-size-md/2xl`, `$loader-border-width-lg`, `$loader-dot-size-lg`, `$loader-bar-width-lg`
  - Removed: `$profile-avatar-size-sm`
- **Updated component size modifiers**: Size variants (`--xs`, `--sm`, `--lg`, `--xl`) now only change font-size
  - **Inputs**: All sizes use `$input-padding-v/h`, only font-size changes
  - **Buttons**: All sizes use `$btn-padding-v/h`, only font-size changes
  - **Alerts**: All sizes use `$alert-padding-v/h`, only font-size changes
  - **Badges**: `--sm` uses `$badge-padding-v/h`, only font-size changes
- **Removed spinner size modifiers**: Deleted `.pa-spinner--sm/md/lg/xl/2xl` classes
  - Themes control spinner size via `$spinner-size` variable
- **Pattern established**: Components use semantic base variables (e.g., `$badge-padding-h`), themes control actual values

#### Class Naming Consistency
- **Renamed layout classes** to use `pa-` prefix throughout:
  - `.admin-content` → `.pa-content`
  - `.admin-header` → `.pa-header`
  - All `.admin-header__*` subclasses → `.pa-header__*`
- **Updated files**:
  - SCSS: `core-components/_layout.scss`, `core-components/_profile.scss`
  - Views: `layout.ejs`, `partials/navbar.ejs`
- Framework now uses consistent `pa-` prefix for all classes

### Fixed - 2025-02-10

#### CSS Variable Violation
- **Removed CSS variable from _layout.scss**: Line 638 used `--sidebar-width: 10rem;`
  - Replaced with SCSS variable `$sidebar-width-tablet: 10rem`
  - Applied directly in media query instead of runtime CSS variable
  - Maintains framework's "SCSS variables only" architecture

#### Font Inheritance for Form Elements
- **Fixed button and form element font inheritance**:
  - Added `font-family: inherit` to `.pa-btn`, `.pa-input`, `.pa-select`, `.pa-textarea`
  - **Problem**: Buttons used browser default fonts (Arial) instead of theme fonts
  - **Solution**: Elements now inherit theme font (e.g., Fira Sans Condensed in Audi theme)
  - Affects all `<button>` elements which don't inherit fonts by default
  - `<a>` elements with `.pa-btn` were unaffected (already inherited correctly)

#### Page Loader Timing
- **Reduced loader fade duration**: Changed from 300ms to 150ms
  - Faster page reveal for better perceived performance
  - Still smooth enough to avoid jarring transitions

---

### Added - 2025-01-31

#### Tooltips Component & Page
- **New tooltip component**: `.pa-tooltip` with pure CSS hover effects
- **Position variants**: Top (default), right, bottom, left
  - Uses `data-tooltip` attribute for tooltip text
  - Smooth fade-in and translate animations
  - Arrow pointer automatically positioned
- **Color variants**: Default (dark), primary, success, warning, danger
  - All colors use framework button color variables
  - Warning variant uses dark text for better contrast
  - Dedicated tooltip colors (`$tooltip-bg`, `$tooltip-text`) for consistent appearance across all themes
- **Multiline tooltips**: `.pa-tooltip--multiline` modifier for longer explanations
  - Fixed width of 20rem with text wrapping
  - Left-aligned text for better readability
- **Features**:
  - Pure CSS implementation (no JavaScript)
  - Works on any element (buttons, text, icons)
  - Responsive with automatic positioning
  - Proper z-index layering (tooltips: 1100, content: 950, sidebar: 900)
  - `cursor: help` on hover
- **Comprehensive examples**:
  - Tooltip positions demonstration
  - Colored tooltip variants
  - Tooltips on buttons (with icons)
  - Icon-only buttons with tooltips
  - Tooltips on inline text
  - Combined positions and colors
  - Multiline tooltips with long text
  - Usage code examples

#### Loaders & Spinners Page
- **New dedicated page**: `/loaders` showcasing all spinner and loader variants
- **Standalone spinner component**: `.pa-spinner` with size and color modifiers
  - Size variants: `--xs`, `--sm` (default), `--md`, `--lg`, `--xl`, `--2xl`
  - Color variants: `--primary`, `--secondary`, `--success`, `--danger`, `--warning`, `--info`
- **Advanced loader types** (inspired by cssloaders.github.io):
  - `.pa-loader-dots`: Bouncing dots animation (3 dots with wave effect)
  - `.pa-loader-bars`: Vertical bars stretching animation (5 bars)
  - `.pa-loader-pulse`: Pulsing circle with scale and opacity animation
  - `.pa-loader-ring`: Double ring spinning animation
  - `.pa-loader-wave`: Wave-like vertical bars animation (5 bars)
  - All loaders support `--lg` size modifier
  - Color controlled via CSS `color` property
- **Loader utility classes**:
  - `.pa-loader-overlay`: Centered spinner with semi-transparent background overlay
  - `.pa-loader-center`: Flexbox container for centered spinners with optional text
- **Comprehensive examples**:
  - Spinner sizes (0.75rem to 4rem)
  - Colored spinners matching button colors
  - All 6 loader types showcased
  - Inline spinners for loading text
  - Centered loaders with overlay
  - Loaders with descriptive text
  - Card loading states
  - Usage code examples for all loader types

---

### Fixed - 2025-01-31

#### Button Loading State
- **Simplified loading implementation**: Loading state now directly replaces button content with spinner
  - Removed `.pa-btn__content` wrapper element (no longer needed)
  - Removed opacity-based content hiding in CSS
  - Cleaner HTML output during loading state
- **Fixed button width expansion during loading**: Removed `min-width: $btn-min-width` from `.pa-btn--loading`
  - JavaScript dimension lock now works correctly
  - Buttons maintain exact width during loading state
  - No more unexpected width changes when spinner appears

#### Utility Classes in Themes
- **Added utility class support**: All theme files now import `utilities.scss`
  - Spacing utilities: `mb-1` through `mb-20`, `mt-*`, `ml-*`, `mr-*`, `mx-*`, `my-*`, `p-*`, etc.
  - Display utilities: `d-none`, `d-flex`, `d-inline-block`, etc.
  - Flexbox utilities: `justify-content-*`, `align-items-*`, `flex-*`, etc.
  - Previously utilities were only available in main.scss

#### Icon-Only Button Examples
- **Added comprehensive icon-only button demonstrations**:
  - Basic icon-only buttons with text icons (✎, ⚙, ✓, etc.)
  - Font Awesome icon-only buttons (floppy-disk, search, check, etc.)
  - Interactive loading demo with icon-only buttons (ripple + loading states)

#### Tooltip Z-Index Layering
- **Fixed tooltip clipping and layering issues**:
  - Removed `overflow: hidden` from `.pa-layout-container` (was clipping tooltips)
  - Moved `overflow-x: hidden` to `body` element (hides sidebar on mobile without clipping tooltips)
  - Added `position: relative` and `z-index: 950` to `.admin-content`
  - Increased tooltip z-index from 1000 to 1100
  - **Z-index hierarchy**: tooltips (1100) > content (950) > sidebar (900)
  - Tooltips now properly appear above all content including sidebar and cards

---

### Added - 2025-01-30

#### Button System Enhancements
- **Icon wrapper pattern**: Added `.pa-btn__icon` component for consistent button icon sizing
  - Fixed-width container: 1.5rem (matches sidebar icon size)
  - Automatic left-alignment for buttons with icons using flexbox
- **Fixed-width button classes**: `pa-btn--w-1x` through `pa-btn--w-10x`
  - Width range: 1rem to 10rem
  - Uses `min-width` to allow content overflow
- **Button alignment modifiers**:
  - `pa-btn--align-left`: Left-aligned content, icon flush to left edge
  - `pa-btn--align-right`: Right-aligned content, icon flush to right edge
  - `pa-btn--align-center`: Centered content with full padding
  - `pa-btn--align-justify`: Space-between layout, icon at left, text at right

#### Font Awesome Integration
- Added Font Awesome 6 CDN to layout template
- Updated button examples with Font Awesome 6 icons (solid style)
- Icon classes: `fa-solid fa-*` (FA6 syntax)

#### Forms Page Enhancements
- Added comprehensive button placement examples:
  - **Header placement**: Right-aligned buttons with green save as last button
  - **Footer placement**: Left utility buttons + right save group
  - **Body placement**: Inline button groups within form content
- All examples use proper `.pa-btn__icon` wrapper pattern

#### SCSS Variable Consolidation (Phase 2)
Added 30+ new SCSS variables to eliminate hardcoded values:

**Layout System**:
- `$layout-container-sm`: 48rem (768px)
- `$layout-container-md`: 64rem (1024px)
- `$layout-container-lg`: 80rem (1280px)
- `$layout-container-xl`: 100rem (1600px)
- `$layout-container-2xl`: 120rem (1920px)

**Card System**:
- `$card-header-padding-v/h`: 0.5rem / 1rem
- `$card-footer-padding-v/h`: 0.75rem / 1rem

**Stats System**:
- `$stat-icon-size`: 3rem
- `$stat-square-min-size`: 8rem
- `$stat-label-letter-spacing`: 0.05em
- `$stat-change-margin-bottom`: 0.25rem

**Badge System**:
- `$badge-padding-v/h`: 0.125rem / 0.5rem
- `$composite-badge-min-label-width`: 3rem

**Button System**:
- `$btn-padding-xs-v/h`: 0.125rem / 0.5rem
- `$btn-padding-xl-v/h`: 1rem / 2rem
- `$btn-icon-only-size`: 2.5rem
- `$btn-icon-margin`: 0.5rem

**Animation System**:
- `$spinner-size`: 1rem
- `$spinner-border-width`: 2px
- `$ripple-size`: 300px

**Utility Spacing**:
- `$section-margin-v`: 2rem
- `$section-margin-sm`: 1.5rem
- `$submenu-max-height`: 500px

### Changed - 2025-01-30

#### Button System
- **Horizontal padding reduced**: `$btn-padding-h` changed from 1rem to 0.75rem
  - More compact button appearance
  - Alignment classes work within this padded area
- **Button icon behavior**: Buttons with `.pa-btn__icon` now automatically:
  - Display as `inline-flex` instead of `inline-block`
  - Use left alignment with `justify-content: flex-start`
  - Give icons fixed width of 1.5rem with proper spacing

#### Core SCSS Updates
- Replaced hardcoded `1px` borders with `$border-width-base` throughout `_core.scss`
- Replaced hardcoded layout widths with `$layout-container-*` variables
- Replaced hardcoded padding values with respective component variables
- Replaced hardcoded border radius with `$border-radius` variables

### Fixed - 2025-01-30

#### Font Awesome Icon Display
- **Font utility classes**: Updated `.font-family-system`, `.font-family-sans`, `.font-family-serif`, `.font-family-mono`
  - Added `:not([class*="fa-"])` selectors to exclude Font Awesome elements
  - Prevents framework fonts from overriding Font Awesome 6 Free font
  - Fixed issue where FA icons showed as empty boxes `[]`

#### Button Group Alignment
- **Vertical button groups**: Changed `align-items: stretch` to `align-items: flex-start`
  - Allows fixed-width buttons to maintain their specified width
  - Prevents buttons from being forced to container width

#### Audi Theme
- Updated border values to use `$border-width-thick` variable
- Updated secondary button border color to use `$audi-gray-lightest` variable

### Documentation - 2025-01-30

#### Buttons Page
- Reorganized alignment section into two-column layout
- Left column: Text icon examples (✓, →, ×)
- Right column: Font Awesome icon examples
- All four alignment types demonstrated: left, right, center, justify
- Reduced button examples for more compact presentation

---

## [Previous Work] - 2025-01-15

### Complete Variable System Transformation
- Eliminated ALL hardcoded values from framework
- Added comprehensive font system variables (`$font-size-*`, `$line-height-*`, `$font-weight-*`)
- Added spacing system variables (`$spacing-xs` through `$spacing-2xl`)
- Added border system variables (`$border-width-*`)
- Component-specific variables for buttons, modals, tables, badges
- Font utility classes now use theme variables
- Table hover accent system with configurable borders
- Modal padding system with vertical/horizontal control
- Audi theme with Fira Sans Condensed integration

### Major Features
- SCSS-only variable system (no CSS variables)
- Modular theme architecture
- Composite badge system with three-part structure
- Modal windows with multiple sizes and themed headers
- Complete EJS template conversion with Express.js
- Centered layout container system with multiple breakpoints
- Dashboard with KPI cards, charts, and D3.js integration