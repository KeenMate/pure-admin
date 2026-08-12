# Mobile Sidebar Overlay — how it works & what affects behavior

This documents the **mobile drawer** behavior of the sidebar (viewport ≤ 768px):
how it opens, why it's viewport-high, why the background scrolls behind it, and
why it auto-closes. Written up after a "the sidebar is only viewport-high and
hides itself after I drag the strip beside it" report, so we don't have to
re-trace it.

## TL;DR

- Below `$mobile-breakpoint` (**768px**) the sidebar stops being an in-flow
  column and becomes a **`position: fixed` drawer** pinned to the viewport
  (`top: header` → `bottom: 0`), **90vw** wide, with a translucent backdrop.
- It is **viewport-high by design** — a fixed overlay can't be document-tall.
  What looks like "full page length" is just it filling the viewport; you only
  notice it's fixed once the content behind it scrolls.
- **The background is not scroll-locked.** Dragging in the ~10vw strip beside
  the drawer scrolls the page behind the fixed drawer, which is what reveals
  its viewport-fixed nature.
- The **auto-hide is tap-outside-to-close**: the demo listens for `click` on
  `<body>` and the backdrop is `<body>`'s `::before`, so a tap/scroll-end in
  the strip counts as "clicked outside" and dismisses the drawer. The ~500ms is
  the touch→synthetic-click delay, not a timer.

## The moving parts and where they live

| Piece | Location | Owner |
|---|---|---|
| Overlay + backdrop CSS | `packages/core/src/scss/core-components/layout/_layout-responsive.scss` (the `@media (max-width: $mobile-breakpoint)` block) | **core** |
| Resize handle (hidden on mobile) | same file + `_sidebar.scss` `.pa-sidebar-resize` | **core** |
| Toggle / open-close JS | `demo/views/layout.mustache` — inline `toggleSidebar()`, `closeMobileSidebar()`, `checkMobileLayout()` | **demo only** |

> **Important:** core ships **no** mobile sidebar toggler. The `.sidebar-visible`
> class that drives the overlay is set entirely by the demo's inline script.
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

```scss
@media (max-width: $mobile-breakpoint) {           // ≤ 768px
  body:not(.sidebar-visible) .pa-layout__sidebar {  // closed → collapsed to 0
    width: 0; opacity: 0; overflow: hidden; border-inline-end: none;
  }

  .sidebar-visible {
    .pa-layout__sidebar {                           // open → fixed drawer
      position: fixed;
      top: $header-height;      // 4.8rem / 48px — sits below the fixed navbar
      inset-inline-start: 0;    // RTL: flips to right
      bottom: 0;                // → drawer height = viewport − header, ALWAYS
      width: $mobile-sidebar-width;   // 90vw  (NOT 80%)
      z-index: 1050;
      overflow-y: auto;         // the drawer's OWN nav scrolls internally
    }

    &::before {                 // backdrop — a pseudo-element of <body>
      content: ""; position: fixed;
      top: $header-height; inset-inline: 0; bottom: 0;
      background-color: $mobile-backdrop-bg;   // rgba(0,0,0,.5)
      z-index: 1040;            // under the drawer (1050), over the page
    }
  }

  .pa-sidebar-resize { display: none; }   // resize is meaningless on the overlay
}
```

Key values (from `@keenmate/pure-css` `variables/_layout.scss`):
`$mobile-breakpoint: 768px`, `$mobile-sidebar-width: 90vw`,
`$header-height: 4.8rem`, `$mobile-backdrop-bg: rgba(0,0,0,.5)`.

## The JS (demo, `layout.mustache`)

- **`toggleSidebar()`** — on mobile (`innerWidth <= 768`) just
  `body.classList.toggle('sidebar-visible')` + burger icon. State is **not**
  persisted on mobile.
- **`checkMobileLayout()`** — on `resize`, if mobile, force-removes both
  `sidebar-hidden` and `sidebar-visible` (drawer always starts closed).
- **`closeMobileSidebar(event)`** — wired as
  `document.body.addEventListener('click', closeMobileSidebar)`; closes **only
  when `event.target === body`**. Because the backdrop is `body::before`, a
  tap/click anywhere in the visible strip has `event.target === body`, so it
  dismisses the drawer. This is the intended tap-outside-to-close.

## Why the reported behavior happens

1. **"Seems full page length."** The drawer fills the viewport from the header
   to the bottom edge. Before you scroll, there's nothing to reveal that it's
   `position: fixed` rather than as-tall-as-the-document.

2. **"Dragging the strip beside it shows it's only viewport-high."** That strip
   is the ~10vw backdrop. **There is no background scroll-lock** — no
   `overflow: hidden` on `<body>`/`<html>` and no `overscroll-behavior` /
   `touch-action` on the backdrop while `.sidebar-visible`. So a touch-drag
   there scrolls the page content behind, while the fixed drawer (and fixed
   backdrop) stay pinned to the viewport — visibly proving the drawer is
   viewport-fixed, not document-tall. (In the default **scroll layout** the
   document scrolls; in **sticky layout** — `body.pa-layout--sticky`, body
   `overflow: hidden` — `.pa-layout__content` scrolls instead. See
   `_layout-container.scss`.)

3. **"Hides after ~500ms."** The drag ends in a tap that the browser reports as
   a `click` on `<body>` (target = the backdrop pseudo's host = `body`) →
   `closeMobileSidebar` removes `.sidebar-visible`. The delay is the
   touch-to-synthetic-click gap, not a timer. Combined with the unlocked
   background scroll, "drag to scroll, then it vanishes" feels like a glitch
   even though tap-outside-to-close is the intended behavior.

## Background scroll-lock (implemented)

Standard modal-drawer behavior — the page behind the open drawer + scrim does
not scroll — is now in place, in two halves matching the ownership split above:

- **Portable CSS half (core, `_layout-responsive.scss`).** Inside the mobile
  media query: `body.sidebar-visible { overflow: hidden; }` locks the page, and
  `overscroll-behavior: contain` on `.pa-layout__sidebar` stops the drawer's own
  scroll from chaining to the page. This benefits every consumer that toggles
  `.sidebar-visible`, no JS beyond the toggle required. Works on desktop +
  Android; **iOS Safari ignores `body { overflow: hidden }` for touch scroll**,
  so CSS alone is not enough there.
- **iOS-safe JS half (demo, `layout.mustache`).** `lockBodyScroll()` /
  `unlockBodyScroll()` pin `<body>` with `position: fixed; top: -scrollY` while
  the drawer is open and restore the scroll position on close. Wired into all
  three close paths: `toggleSidebar` (open→lock / close→unlock),
  `closeMobileSidebar` (tap-outside), and `checkMobileLayout` (resize to
  desktop). This lives in the demo because that's the only place the mobile
  toggle exists — if the mobile drawer is ever promoted into a core JS module,
  move the lock there so every consumer inherits the iOS-safe behavior.

Still open (optional, not done): making the backdrop a **real element** (not
`body::before`) with its own handler + `touch-action: none`, so the close target
is explicit rather than "any click whose `event.target === body`."

## Related

- Resize handle on mobile: see the rc11 "dead affordance" fix — the handle is
  now `display: none` in this same media query (CSS matched to
  `sidebar-resize.js`'s `MOBILE_MAX = 768` guard).
- Layout scroll modes (scroll vs sticky): `_layout-container.scss`.
