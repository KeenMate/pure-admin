# Scope — consolidate `navbar-collapse.js` into `fit.js`

**Goal:** one degradation engine instead of two overlapping ones. `fit.js` (post
sink-refactor) and `navbar-collapse.js` implement the *same* algorithm; the plan
is to fold the nav's unique behaviour into `fit.js` as sinks + a nav adapter and
delete `navbar-collapse.js`.

Status: **scoping only — nothing implemented.** Backward-compat is not a concern
(both are day-old RC surface).

---

## 1. Why they overlap (the same skeleton twice)

Both files are a **reset-then-degrade-by-priority** loop over a container with a
pluggable relocation abstraction:

| Concern | `fit.js` | `navbar-collapse.js` |
|---|---|---|
| Unit that degrades | a **slot** (`[data-pa-fit]` element) | a nav **item** (`.pa-navmenu__item` `<li>`) |
| Priority | `data-pa-fit-priority` | `data-pa-nav-priority` |
| Loop | resetAll → measure → drop lowest-priority until it fits | restore all → measure → drop lowest-priority until it fits |
| Relocation abstraction | **sink** `{ out(el,ctx)->mount\|false, in(el,ctx) }` | **strategy** `{ collapse(el), restore(el), onFits, onOverflow, afterRestore, count }` |
| Restore ordering | placeholder comment (exact position) | re-append every item each pass |
| Observers | `ResizeObserver` on container | `ResizeObserver` on nav **and** `.pa-navbar__inner` |

The strategy interface maps almost 1:1 onto the sink interface
(`collapse`↔`out`, `restore`↔`in`, `onFits`/`afterRestore`/`onOverflow` are the
lazy section/trigger lifecycle). **fit's placeholder restore is strictly better**
than nav-collapse's "re-append everything each pass to preserve order" hack.

---

## 2. What is genuinely nav-specific (must be preserved, not deleted)

These live in `navbar-collapse.js` and have **no** equivalent in fit's sinks:

1. **Nav→sidebar structural rebuild** (`buildSidebarItem`, ~90 lines). Recursively
   turns a nav `<li>` + nested `.pa-navmenu__dropdown` into `.pa-sidebar__*`
   markup: leaf → link item; dropdown parent → collapsible toggle group (chevron,
   self-wired accordion, opens iff the active branch, parent's own page injected
   as first child, trailing `›/»/>` arrow stripped). fit's `sidebar` sink only
   wraps the element in a bare `<li>`. **This is the crown jewel** — it becomes the
   body of a `nav-sidebar` sink verbatim.
2. **Menu mode** (`makeMenuStrategy`, the "More ▾" generated nav dropdown) — used
   live by keen `layout.ex` (`collapse="menu"`). Becomes a `nav-menu` sink.
3. **Section + divider management** — lazy `.pa-sidebar__section` heading +
   `.pa-sidebar__divider`, created on first fold / removed when empty.
4. **Nav measurement constraint** — sums `ul` children `getBoundingClientRect`
   vs `nav.clientWidth`, deliberately **NOT** `scrollWidth`, because the nav is
   `overflow:visible` so item hover-dropdowns aren't clipped. fit measures via
   `scrollWidth`/`contentWidth`. **This divergence is the #1 technical risk.**
5. **Fold-before-header coordination** — `fit.js` calls
   `navCollapse.relayoutAll()` *before* it measures the header, so the nav sheds
   items first and fit doesn't over-degrade the other header slots. Merged, this
   must be preserved as pass ordering / priority-band arrangement.

---

## 3. Options

**A — Full merge (recommended north star).** Delete `navbar-collapse.js`. The nav
`<ul>` becomes a fit container (a nav adapter arms each `<li>` as a `relocate`
slot, mapping `data-pa-nav-priority`→`data-pa-fit-priority`,
`data-pa-nav-collapse`→`data-pa-fit-target`). Move the rebuild/menu logic into two
registered sinks: `nav-sidebar` and `nav-menu`. One engine, one loop.
- **Payoff:** highest — a single engine; nav-collapse's order-preservation hack is
  replaced by fit's placeholders.
- **Risk:** highest — must solve the measurement divergence (§2.4) and item-level
  slotting (§4).

**B — Shared sinks only.** Move rebuild/menu into fit-registered sinks but keep
nav-collapse's loop. Two engines remain → doesn't remove the duplication. *Low
value; skip.*

**C — Extract shared skeleton.** Both files `@use` a common
"degrade-by-priority(measure, strategy)" core; each keeps its own
measurement + strategy. Dedupes ~80 lines of loop/observer boilerplate, zero
behaviour/API change, no wrapper churn. *Good de-risking pre-step to A.*

---

## 4. Hard problems to solve for Option A

1. **Per-container measurement.** fit must support a nav-style measure
   (bbox-sum vs `clientWidth`, `overflow:visible`) alongside its `scrollWidth`
   path — e.g. a `data-pa-fit-measure="nav"` mode or a measure fn on the sink.
   Without it, folding the nav via fit risks clipping hover dropdowns.
2. **Item-level slots inside one slot.** A nav is one header slot, but its `<li>`s
   are independent degrade units. Model the nav `<ul>` as a `data-pa-fit-auto`
   sub-container so each `<li>` is a slot, with the nav adapter setting priorities.
   Confirm nested-fit-container semantics (nav degrades within itself before the
   header degrades around it — currently guaranteed by the explicit pre-call).
3. **Trigger self-width.** The "More" trigger consumes width when revealed; the
   loop must re-measure after showing it. fit's `floating-menu` sink already does
   lazy trigger reveal — reuse that pattern for `nav-menu`.
4. **Active-branch state + accordion** in the rebuilt sidebar must survive the
   reset/relocate cycle (currently rebuilt fresh each fold — fine to keep).

---

## 5. Blast radius (all "backward-compat not required")

- **core:** `fit.js` (extend: measurement modes, nav adapter, `nav-sidebar` +
  `nav-menu` sinks), delete `navbar-collapse.js`, prune/keep `_navbar-elements.scss`
  (More-menu CSS + injected sidebar-section CSS stay — the sinks still emit that
  markup), `layout.mustache` (drop the `navbar-collapse.js` script tag).
- **demo:** `navbar.mustache` (`data-pa-nav-collapse="sidebar"` → fit equivalent,
  or keep the attribute as a thin compat alias the nav adapter reads).
- **svelte:** `NavMenu.svelte` (`collapse` prop wiring), `core-js.ts` loader
  (drop `'navbar-collapse'` case), docs `layouts` example, README.
- **keen:** `navbar_collapse*.js` hooks (delete), `keen_pure_admin.js` (unregister),
  `layout.ex` `nav_menu` (`collapse="menu"|"sidebar"`), demo, CHANGELOG.

## 6. Recommended path

1. **Stage 0 (de-risk):** Option C — extract the shared degrade loop; prove the
   skeleton is common with zero behaviour change.
2. **Stage 1:** add per-container measurement + the nav adapter to `fit.js`; port
   `buildSidebarItem`/menu into `nav-sidebar` / `nav-menu` sinks; keep
   `data-pa-nav-*` attributes readable by the adapter so demos/wrappers don't move
   yet. Verify against the demo navbar + keen `collapse="menu"`.
3. **Stage 2:** delete `navbar-collapse.js`; rewire wrappers (svelte `NavMenu`,
   keen `nav_menu`) + docs; drop the extra script tag/hook.

**Biggest single unknown:** the measurement divergence (§4.1). Prototype that
first — if fit can fold the real demo nav without clipping hover dropdowns, the
rest is mechanical relocation of existing code.
