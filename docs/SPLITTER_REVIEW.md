# `.pa-splitter` — Independent Design Review

**Reviewer:** independent web-designer pass
**Date:** 2026-06-19
**Scope:** `packages/core/src/js/splitter.js`, `packages/core/src/scss/core-components/_splitter.scss`, `packages/core/snippets/splitter.html`, `demo/views/splitter.mustache`
**Framework version at review:** 2.9.0-rc02

## Verdict — **B) Good, but worth tightening on a few axes before calling it done.**

Reference set used for comparison: Split.js, Allotment, react-split-pane, golden-layout, VS Code sash. Against that field this lands solidly competitive — better a11y than Split.js, lighter than Allotment, more honest about flexbox `gap` than any of them. Not "worse than X" on any axis I tested.

---

## What's actually good (and better than most splitters)

- **Single pointer-events code path** with `setPointerCapture`. Mouse / touch / pen handled by one handler. Most splitters in the wild still juggle three event sets.
- **"Only one pane has explicit flex-basis"** trick in the 2-pane path. Sidesteps the both-panes-resist jitter window-resize bug Split.js used to ship. Storage shape collapses to one number.
- **`gap` is read from `getComputedStyle` and subtracted** before percent math (`splitter.js:160-167`). Almost nobody does this. Percent constraints stay honest when consumers add breathing room — a real correctness win.
- **Hysteresis snap is floored at `railSize × 1.5`** (`splitter.js:343`). Prevents the snap point from collapsing to ~0 when `min` is unspecified.
- **`pinned[]` in `clampToConstraints`** (`splitter.js:590-625`). Anticipates that a growing container would otherwise let rail panes flex back upward. The kind of bug you usually only catch in user testing.
- **Versioned storage** (`v: 2`), `rAF` before first apply for hidden parents, ARIA done properly with live values, toggle delegation correctly scoped via `closest('[data-pa-splitter]') !== root`. Small correct decisions that add up.
- **Dispatcher between legacy and N-pane is explicit and minimal** (`splitter.js:106-110`). The "byte-stable for 2.9.0-rc01 users" rationale is fine for one release window.

---

## What I'd push back on

### P1 — Rail mode is hard-coupled to `.pa-card` internals

`_splitter.scss:96-153` knows about `pa-card__header`, `pa-card__body`, `pa-card__footer`, `pa-btn`, `pa-btn-group`, plus bare `button` and `input`. That list will grow every time a new control class lands. It violates the spirit of the "no cross-referencing variables" rule in `CLAUDE.md` — same architectural smell, one layer up.

**Cleaner contract:**

- Splitter exposes an opt-in `.pa-splitter__pane-title` element (or formalises an attribute like `[data-pa-splitter-rail-title]`).
- The splitter only rotates and pins **that** element. Hiding sibling content becomes `> *:not([data-pa-splitter-rail-title]) { display: none }`.
- Card adaptation moves into `_card.scss` (or stays opt-in via the existing `> .pa-card` selector, but the laundry list of children should not).

Today if a consumer puts anything other than `.pa-card` in a minimizable pane, the prose explicitly says "looks wrong" — that's a feature-design gap, not an honest tradeoff.

### P2 — `$splitter-rail-size` SCSS var and `data-pa-splitter-rail-size` attribute are unreconciled

SCSS var is `4rem`, JS default is `40px` literal written inline. The SCSS var is effectively dead — themes can set it and nothing happens. Either drop the var, or have the JS default fall back to `getComputedStyle(root).getPropertyValue('--pa-splitter-rail-size')`. Today a theme that wants 48px rails has to set the SCSS var AND override every instance attribute.

### P3 — No rAF throttle on `pointermove`

Every move event triggers `applySize` → `flex-basis` write → reflow. On a pane containing a Chart.js canvas, a busy table, or an iframe, that's measurable jank on a 120 Hz trackpad. The prose admits the splitter "doesn't throttle externally observed resizes; it expects the consumer's chart to debounce". That offloads correctness onto every consumer. A two-line `rAF` wrapper on the handler fixes it in one place.

### P4 — Storage recovery on `N`-mismatch wipes everything

`splitter.js:858`. If a user removes one pane from markup, the saved `v: 2` blob no longer matches `length === N` and the entire layout falls back to defaults — including the panes whose state could be salvaged by index. A forgiving merge ("trust matching-index sizes, fill the rest") survives markup drift cheaply.

### P5 — Sunset the legacy 2-pane path

Per the dispatcher comment, N-pane already handles two unlabelled panes; legacy is kept purely to be byte-equivalent for rc01 users. That's ~350 LOC of duplicated `parseSize` / pointer / persistence / ARIA logic. Confirm the N-pane code reproduces 2-pane behaviour exactly when fed `--start` / `--end` markup (or migrate the markup in the dispatcher), and collapse to one path next cut. Two parallel implementations of the same drag math will drift.

### P6 — `minimizeThresholdRatio` is a no-op for the common case

`Math.max(mins[li] * ratio, railSizePx * 1.5)` — when `min` is 0 (no `min` attribute set, the common shape in your snippets), `mins[li] * ratio === 0`, the `railSizePx * 1.5` floor always wins, and the ratio attribute does nothing. Either document that the ratio only kicks in when `min` is set, or rebase the threshold on `(default - rail) * ratio + rail` / `(max - rail) * ratio + rail` so it's meaningful regardless.

### P7 — `startPane.style.flex` isn't set inline in 2-pane mode

It depends on the SCSS `.pa-splitter__pane--start { flex: 0 0 auto }`. If a consumer drops the `--start` modifier (e.g. they're experimenting), the end pane's `flex: 1 1 0` fights an unbasis'd start pane and the result is hard to debug. N-pane sets `panes[i].style.flex = '0 0 auto'` inline (`splitter.js:548`) — more robust. Mirror that in 2-pane.

---

## Nice-to-haves (not blockers)

- **Live size readout during drag** — VS Code, Allotment, golden-layout all show a tooltip with current px. You already write `aria-valuenow` every frame; surfacing it visually is one CSS pseudo-element.
- **Snap-to-breakpoint** (25/50/75%) with shift-held drag, like golden-layout. Common dashboard UX.
- **Middle-pane hide-toggle** — not rail, but actual `display: none` with the adjacent gutter going with it, like VS Code's explorer. Removes the "first/last only" minimize limitation without breaking the rail visual.
- **No ESM export.** `pureAdmin.components.splitter` is fine for vanilla but a parallel `export { init, initAll }` costs nothing.
- **clampToConstraints divergence warning.** The loop is bounded at `N+1` passes. With degenerate inputs (every pane pinned to its max, total < sum of maxes) you exit without convergence and overflow is hidden by `overflow: hidden` on the root. A debug warning is better than silent overflow.

---

## Summary

Math is right, architecture is right, a11y and persistence beat what most vanilla splitters ship.

Priority order if you only do some of these:

1. **P1** decoupling rail mode from `.pa-card` internals (architectural payoff)
2. **P5** sunsetting the legacy 2-pane path (maintainability payoff)
3. **P2** reconciling the rail-size token (theme-author friction, smallest fix, biggest "it just works" payoff)
4. **P3** rAF throttle on pointermove (correctness — kills jank on heavy panes)
5. **P4** forgiving storage merge (UX — survives markup drift)
6. **P6 / P7** are polish

Everything in the "Nice-to-haves" list is a v2 conversation, not a blocker for shipping 2.9.0.
