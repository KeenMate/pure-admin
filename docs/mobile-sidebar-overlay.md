# Mobile Sidebar Overlay — how it works & what affects behavior

This documents the **mobile drawer** behavior of the sidebar (viewport ≤ 768px):
how it opens (slides), why it's viewport-high, how the background is scroll-locked,
and how it auto-closes. Written up after a "the sidebar is only viewport-high and
hides itself after I drag the strip beside it" report; the mechanism has since
been hardened (slide animation, scroll-lock, robust tap-to-close), so the
original-report explanations are kept below under **History** for context.

## TL;DR

- Below `$mobile-breakpoint` (**768px**) the sidebar stops being an in-flow
  column and becomes an **off-canvas `position: fixed` drawer** pinned to the
  viewport (`top: header` → `bottom: 0`), **90vw** wide, with a translucent
  backdrop.
- It **slides in/out** via `transform: translateX`, **in sync with the profile
  panel** — same `$transition-medium` / `$easing-snappy`. It is **viewport-high
  by design** — a fixed overlay can't be document-tall.
- **The background IS scroll-locked** while the drawer is open (core
  `overflow: hidden` + a demo `position: fixed` body lock for iOS). See
  [Background scroll-lock](#background-scroll-lock-implemented). Before rc11 it
  wasn't — that unlocked scroll is what made the drawer look like it "hid itself"
  when you dragged the strip beside it (see [History](#history--the-original-report)).
- The **auto-hide is tap-outside-to-close**: the demo listens for `click` on
  `<body>` and closes when the tap lands **outside the drawer** and isn't the
  burger toggle. A tap on the ~10vw scrim strip counts as outside.

## The moving parts and where they live

| Piece | Location | Owner |
|---|---|---|
| Drawer + backdrop CSS (slide, scrim, scroll-lock) | `packages/core/src/scss/core-components/layout/_layout-responsive.scss` (the `@media (max-width: $mobile-breakpoint)` block) | **core** |
| Resize handle (hidden on mobile) | same file + `_sidebar.scss` `.pa-sidebar-resize` | **core** |
| Toggle / open-close JS + iOS scroll-lock | `demo/views/layout.mustache` — inline `toggleSidebar()`, `closeMobileSidebar()`, `checkMobileLayout()`, `lockBodyScroll()` / `unlockBodyScroll()` | **demo only** |

> **Important:** core ships **no** mobile sidebar toggler. The `.sidebar-visible`
> class that drives the drawer is set entirely by the demo's inline script.
> `sidebar-resize.js` / `settings-panel.js` are for the *desktop* sidebar
> (`.sidebar-hidden` collapse) — a different mechanism. A consumer that isn't
> the demo has to wire the open/close themselves.

## The class model — two independent toggles

- **`body.sidebar-hidden`** — desktop collapse/hide state (persisted in
  `localStorage['sidebar-hidden']`). Handled by `settings-panel.js`.
- **`body.sidebar-visible`** — mobile drawer-open state. **Not persisted**
  (mobile always starts closed on load, see `checkMobileLayout`). Handled only
  by the demo `layout.mustache` script.

These do not overlap: on mobile the responsive CSS keys off `.sidebar-visible`;
`sidebar-hidden` is a no-op there.

## The CSS (core, `_layout-responsive.scss`)

The drawer is **always** `position: fixed` at the drawer size on mobile (in both
states) and parked off-canvas with a transform; opening slides it to
`translateX(0)`. This replaced the old `width: 0` ⇄ `width: 90vw` snap, which
popped in with no animation. Content is full-width in both states because the
drawer is out of flow.

```scss
@media (max-width: $mobile-breakpoint) {           // ≤ 768px
  // Off-canvas drawer — always fixed, slid out past the inline-start edge.
  .pa-layout__sidebar,
  .pa-layout__sidebar--icon-collapse {
    position: fixed;
    top: $header-height;      // 4.8rem / 48px — sits below the fixed navbar
    inset-inline-start: 0;    // RTL: flips to right
    bottom: 0;                // → drawer height = viewport − header, ALWAYS
    width: $mobile-sidebar-width;      // 90vw  (NOT 80%)
    z-index: 1050;
    overflow-y: auto;                  // the drawer's OWN nav scrolls internally
    overscroll-behavior: contain;      // its scroll doesn't chain to the page
    transform: translateX(-100%);      // off-canvas (RTL: translateX(100%))
    visibility: hidden;                // inert + unfocusable while closed

    body.loaded & {                    // don't animate on first paint
      transition: transform $transition-medium $easing-snappy,
                  visibility $transition-medium $easing-snappy;
    }
  }

  // Backdrop — an ALWAYS-present pseudo of <body> that FADES opacity in/out
  // (a pseudo that only existed while open couldn't fade out).
  body::before {
    content: ""; position: fixed;
    top: $header-height; inset-inline: 0; bottom: 0;
    background-color: $mobile-backdrop-bg;   // rgba(0,0,0,.5)
    z-index: 1040;                           // under the drawer (1050), over the page
    opacity: 0; visibility: hidden; pointer-events: none;
    body.loaded & { transition: opacity …, visibility …; }
  }

  .sidebar-visible {
    overflow: hidden;                        // background scroll-lock (see below)
    .pa-layout__sidebar,
    .pa-layout__sidebar--icon-collapse { transform: translateX(0); visibility: visible; }  // slide in
    &::before { opacity: 1; visibility: visible; pointer-events: auto; }                    // reveal scrim
  }

  .pa-sidebar-resize { display: none; }      // resize is meaningless on the overlay
}
```

Key values (from `@keenmate/pure-css` `variables/`): `$mobile-breakpoint: 768px`,
`$mobile-sidebar-width: 90vw`, `$header-height: 4.8rem`,
`$mobile-backdrop-bg: rgba(0,0,0,.5)`, `$transition-medium: 0.25s`,
`$easing-snappy: ease-out` (the last two are shared with the profile panel, so
the two drawers slide identically).

## The JS (demo, `layout.mustache`)

- **`toggleSidebar()`** — on mobile (`innerWidth <= 768`)
  `body.classList.toggle('sidebar-visible')` + burger icon, and calls
  `lockBodyScroll()` / `unlockBodyScroll()` to match the open state. State is
  **not** persisted on mobile.
- **`checkMobileLayout()`** — on `resize`, if mobile, force-removes both
  `sidebar-hidden` and `sidebar-visible` (drawer always starts closed) and
  releases the scroll lock.
- **`closeMobileSidebar(event)`** — wired as
  `document.body.addEventListener('click', closeMobileSidebar)`. Closes on any
  click **outside the drawer** (i.e. `event.target` is not inside
  `.pa-layout__sidebar`) that also isn't the **burger** toggle, then releases the
  lock. This is the robust "click-outside" model the profile/notifications panels
  use. (It used to close only when `event.target === document.body` — but the
  backdrop is a `body::before` pseudo, so a tap on the scrim can report the
  underlying `.pa-layout` element as the target, which that check missed and left
  the drawer stuck open. Fixed in rc11.)

## Background scroll-lock (implemented)

Standard modal-drawer behavior — the page behind the open drawer + scrim does
not scroll — in two halves matching the ownership split above:

- **Portable CSS half (core, `_layout-responsive.scss`).** Inside the mobile
  media query: `body.sidebar-visible { overflow: hidden; }` locks the page, and
  `overscroll-behavior: contain` on the drawer stops its own scroll from chaining
  to the page. Benefits every consumer that toggles `.sidebar-visible`. Works on
  desktop + Android; **iOS Safari ignores `body { overflow: hidden }` for touch
  scroll**, so CSS alone isn't enough there.
- **iOS-safe JS half (demo, `layout.mustache`).** `lockBodyScroll()` /
  `unlockBodyScroll()` pin `<body>` with `position: fixed; top: -scrollY` while
  the drawer is open and restore the scroll position on close (also compensating
  for the desktop scrollbar so the page doesn't reflow). Wired into all three
  close paths: `toggleSidebar` (open→lock / close→unlock), `closeMobileSidebar`
  (tap-outside), and `checkMobileLayout` (resize to desktop). The same helpers
  now also lock the **profile panel** on mobile. If the mobile drawer is ever
  promoted into a core JS module, move the lock there so every consumer inherits
  the iOS-safe behavior.

## Collapse behavior on mobile — no icon rail, only two states

On desktop the sidebar has three behaviors (demo settings panel): **hide**,
**icon-collapse**, and a separate **resizable** toggle. **On mobile (≤768px) the
icon-collapse rail does not exist** — the sidebar has exactly two states:

- **Collapsed = fully off-canvas** (`transform: translateX(-100%)`,
  `visibility: hidden`), *not* a narrow icon bar. Burger shows the hamburger.
- **Expanded = the full 90vw labeled drawer** (scrim + scroll-lock). Burger
  shows the X.

The burger is the single control; mobile state is **not persisted** (every load /
resize-into-mobile starts collapsed, see `checkMobileLayout`).

### Why the icon rail is disabled on phones

The desktop icon-collapse mode (`_sidebar-states.scss`) is an icon-only rail
(`$sidebar-collapsed-width`) whose labels and submenus appear as **hover
flyouts** (`inset-inline-start: 100%`). Both fail on touch: **no hover** (flyout
labels/submenus unreachable) and **no horizontal room** (sideways flyouts run off
a narrow screen). So mobile collapses all of that to one touch-friendly pattern:
a full-label drawer that is either open or gone.

### How it's enforced (three layers, all agreeing)

1. **`toggleSidebar()` ignores `sidebar-behavior` on mobile** (`layout.mustache`)
   — the `isMobile` branch just toggles `.sidebar-visible`; it never consults
   hide vs icon-collapse.
2. **The settings panel doesn't apply the class on mobile**
   (`demo/js/settings-panel.js`) — it removes `--icon-collapse` and, when mobile,
   only syncs the burger; it never re-adds the rail.
3. **Responsive CSS neutralizes the class even if it lingers**
   (`_layout-responsive.scss`) — the mobile drawer rules target
   `.pa-layout__sidebar` **and** `.pa-layout__sidebar--icon-collapse` together, so
   a leftover `--icon-collapse` class (e.g. someone in icon-collapse on desktop
   who *resizes* down without reloading) still becomes the same off-canvas ⇄ 90vw
   drawer, labels forced visible. Never a stranded icon rail.

> **Not to be confused with** `navbar-collapse.js` + `data-pa-nav-collapse="sidebar"`,
> which folds **top-navbar** items *into* the sidebar as real `.pa-sidebar__*`
> markup as the header narrows. That's about where nav links live, not the
> sidebar's own open/closed state.

## History — the original report

These explain the *pre-rc11* symptoms behind "the sidebar is only viewport-high
and hides itself after I drag the strip beside it." All three are now addressed
(slide + scroll-lock + robust close), but the reasoning is kept so the report
isn't re-traced:

1. **"Seems full page length."** The drawer fills the viewport from the header to
   the bottom edge; before scrolling there's nothing to reveal it's
   `position: fixed` rather than document-tall. (Still true by design — a fixed
   overlay can't be document-tall.)
2. **"Dragging the strip beside it shows it's only viewport-high."** Back then
   there was **no background scroll-lock**, so a touch-drag on the ~10vw backdrop
   scrolled the page behind while the fixed drawer stayed pinned — visibly proving
   it was viewport-fixed. Now the background is locked, so this can't happen.
3. **"Hides after ~500ms."** The drag ended in a tap the browser reports as a
   `click` → `closeMobileSidebar` dismissed the drawer; the delay was the
   touch-to-synthetic-click gap, not a timer. Combined with the (then) unlocked
   scroll, "drag to scroll, then it vanishes" felt like a glitch even though
   tap-outside-to-close was intended.

## Related

- Slide timing is shared with the profile panel (`_profile.scss`) — see the rc11
  "mobile drawer consistency" changelog entries.
- E2E coverage: `e2e/mobile-drawers.spec.ts` (run `make test-e2e`) asserts the
  drawer width, scrim, scroll-lock, tap-to-close, and that the sidebar/profile
  slide timings match.
- Resize handle on mobile: `display: none` in this same media query (CSS matched
  to `sidebar-resize.js`'s `mobileMax()` guard, which reads
  `pureAdmin.config.mobileBreakpoint` — single-sourced from the
  `--pa-mobile-breakpoint` CSS var / SCSS `$mobile-breakpoint`; see
  `docs/config-shared-ui-baseline.md`).
- Layout scroll modes (scroll vs sticky): `_layout-container.scss`.
