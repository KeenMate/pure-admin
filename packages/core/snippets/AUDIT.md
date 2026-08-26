# Snippets Audit Log

Tracks which snippets have been cross-checked against their SCSS source and when. Paired with `manifest.json` (which records file hashes for downstream framework wrappers), this file answers *has anyone verified this is still accurate*.

**Process.** An audit reads the corresponding SCSS surface, compares it against the snippet (base class, modifiers, BEM elements, child styling, sizes, variants), triangulates with usage in `demo/views/*.mustache`, and fixes drift in-place. One snippet per commit.

**Coverage tooling (2026-08-24).** `npm run catalog` now emits `../SNIPPET-COVERAGE.md` — a per-component structural-coverage sweep (share of each component's catalog selectors present in its snippet) plus an action queue and a gap table classified by reason. It's the systematic driver for this walkthrough; work the action queue worst-first.

**Search family relocated (2026-08-24).** The navbar/sidebar search elements (`pa-navbar-search` + its `--field`/`--input` modes and the `pa-sidebar__search` / `--input` counterparts) moved OUT of `command-palette.html` INTO `layout.html`, their structural home — only the pill's trigger mode involves the palette. `command-palette.html` keeps the palette, a minimal trigger, the shared `pa-search-autocomplete` dropdown, and cross-ref pointers. This also closed the `sidebar` snippet gap (`__search-field`/`__search-icon`). SCSS still lives in `_command-palette.scss`; the doc home follows the shell.

**Legend.**
- ✅ audited — snippet reviewed and brought in line with SCSS as of the listed commit
- ⏳ pending — not yet touched in this pass
- 🆕 missing — component exists in SCSS but has no snippet

## Audited

| Snippet | Audited | SCSS verified against | Commit |
|---|---|---|---|
| `callouts.html` | 2026-04-24 | `core-components/_callouts.scss` | [6ea28e8](../../../commit/6ea28e8) |
| `code.html` | 2026-04-24 | `core-components/_code.scss`, `variables/_colors.scss` | [cd2e51b](../../../commit/cd2e51b) |
| `loaders.html` | 2026-04-24 | `core-components/_loaders.scss`, `core-components/_buttons.scss` (loading state), `variables/_components.scss` | [6a4682d](../../../commit/6a4682d) |
| `toasts.html` | 2026-04-24 | `core-components/_toasts.scss` | [4056fa9](../../../commit/4056fa9) |
| `popconfirm.html` | 2026-04-24 | `core-components/_popconfirm.scss` | [d8e7f7c](../../../commit/d8e7f7c) |
| `typography.html` | 2026-04-24 | `core-components/_base.scss`, `core-components/_utilities.scss` (.pa-text), `utilities.scss` (.text-*), `_fonts.scss`, `variables/_typography.scss` | [12f1281](../../../commit/12f1281) |
| `alerts.html` | 2026-04-25 | `core-components/_alerts.scss`, `variables/_components.scss` (alert padding + font-size scales) | [512ef3c](../../../commit/512ef3c), revised [dd7a096](../../../commit/dd7a096) (toast-style `__actions` separator), [f824000](../../../commit/f824000) (flex-wrap layout fix: structural children get `flex-basis: 100%`), [514d67d](../../../commit/514d67d) (heading unification: `__heading` defaults to body size, `--lg` opt-in for punchy), [f25700d](../../../commit/f25700d) (introduced `$alert-padding-{sm,lg}-{v,h}` and `$alert-font-size-{sm,lg}` so `--sm` / `--lg` actually differ from default), [d2b27ea](../../../commit/d2b27ea) (default `$alert-padding-{v,h}` decoupled from `$card-footer-padding-{v,h}`: 0.75rem / 1.25rem, so default sits inside the V 0.5 → 0.75 → 1 / H 1 → 1.25 → 1.5 scale instead of outside it), and _(this commit)_ (default `align-items: center` so icon + single-line content centres; new `pa-alert--multiline` modifier opts back to `flex-start` for icon + multi-line `__content`) |
| `badges.html` | 2026-04-24 | `core-components/badges/_badge-base.scss`, `_composite-badge.scss`, `_composite-badge-variants.scss`, `_badge-group.scss`, `_labels.scss` | [517f6bf](../../../commit/517f6bf) |
| `buttons.html` | 2026-04-24 | `core-components/_buttons.scss` | [43a9a42](../../../commit/43a9a42) |
| `tables.html` | 2026-04-24 | `core-components/_tables.scss` (covers `.pa-table`, `.pa-table-container`, `.pa-table-card`), `core-components/_pagers.scss` (covers `.pa-pager`, `.pa-load-more`) | [e34ca85](../../../commit/e34ca85) |
| `lists.html` | 2026-04-24 | `core-components/_lists.scss` | [894b0dd](../../../commit/894b0dd) |
| `tooltips.html` | 2026-04-24 | `core-components/_tooltips.scss` | [b2d196b](../../../commit/b2d196b) |
| `grid.html` | 2026-04-24 | `core-components/_grid.scss`, `utilities.scss` (.pc-cq), `variables/_spacing.scss` ($grid-breakpoints) | [0bd9f16](../../../commit/0bd9f16) |
| `utilities.html` | 2026-04-24 | `utilities.scss` (main utilities), `core-components/_utilities.scss` (components-adjacent helpers), `variables/_spacing.scss` (spacing scale) | [20df758](../../../commit/20df758) |
| `cards.html` | 2026-04-24 | `core-components/_cards.scss` | [4a67018](../../../commit/4a67018) |
| `forms.html` | 2026-04-24 | `core-components/forms/` (all 7 files: _form-layout, _form-inputs, _form-states, _input-groups, _input-wrapper, _checkboxes-radios, _query-editor) | [272f141](../../../commit/272f141) |
| `layout.html` | 2026-04-24 | `core-components/layout/` (all 6 files: _layout-container, _navbar, _navbar-elements, _sidebar, _sidebar-states, _layout-responsive), `variables/_layout.scss` (container widths) | [9762492](../../../commit/9762492) |
| `profile.html` | 2026-04-24 | `core-components/_profile.scss` | [2b70e27](../../../commit/2b70e27) |
| `tabs.html` | 2026-04-24 | `core-components/_tabs.scss` | [35f5f16](../../../commit/35f5f16) |
| `timeline.html` | 2026-04-24 | `core-components/_timeline.scss` | [eaa5ad9](../../../commit/eaa5ad9) |
| `checkbox-lists.html` | 2026-04-24 | `core-components/_checkbox-lists.scss`, `core-components/forms/_checkboxes-radios.scss` (pa-checkbox component reference) | [e2bb951](../../../commit/e2bb951) |
| `command-palette.html` | 2026-04-24 | `core-components/_command-palette.scss` (covers `.pa-command-palette`, `.pa-navbar-search`, `.pa-shortcut-help`) | [a9b4fe3](../../../commit/a9b4fe3) |
| `comparison.html` | 2026-04-24 | `core-components/_comparison.scss` | [e4f1cd6](../../../commit/e4f1cd6) |
| `modals.html` | 2026-04-24 | `core-components/_modals.scss`, `variables/_components.scss` ($modal-*-width + $modal-body-scrollable-max-height) | [795856e](../../../commit/795856e) |
| `modal-dialogs.html` | 2026-04-24 | `src/js/modal-dialogs.js` (pureAdmin.confirm / alert / prompt / custom API); DOM produced matches `_modals.scss` | [e5eba00](../../../commit/e5eba00) |
| `detail-panel.html` | 2026-04-24 | `core-components/_detail-panel.scss`, `variables/_components.scss` (panel width + z-index) | [c1dc6ff](../../../commit/c1dc6ff) |
| `customization.html` | 2026-04-25 | `_base-css-variables.scss`, `_variables.scss`, theme-system pattern (mirrors `pure-admin-themes` repo) | [0a8950e](../../../commit/0a8950e) |
| `virtual-scroll.html` | 2026-04-25 | `core-components/_tables.scss` (`.pa-virtual-table` shell, lines 477-552), `core-components/_timeline.scss` (`.pa-timeline__loader`), `src/js/virtual-scroll.js` (VirtualScroll class API) | [85db533](../../../commit/85db533) |
| `web-daterangepicker.html` | 2026-04-25 | `../../web-daterangepicker/src/web-component.ts` (observedAttributes), `../../web-daterangepicker/src/types.ts` (DatePickerOptions, DateInfo, disabledDatesHandling), `../../web-daterangepicker/API.md`, `core-components/_web-components-theme.scss` (--base-* bridge) | [7cbad56](../../../commit/7cbad56) |
| `web-multiselect.html` | 2026-04-25 | `../../web-multiselect/src/web-component.ts` (observedAttributes), `../../web-multiselect/src/types.ts` (BadgesDisplayMode, BadgesPosition, SearchMode, ValueFormat etc.), `../../web-multiselect/src/css/_variables.css` (--ms-* surface), `core-components/_web-components-theme.scss` | [95cf062](../../../commit/95cf062) |
| `filter-card.html` | 2026-04-25 | `core-components/_filter-card.scss` (whole file — only BEM elements + 2 state modifiers, no base block) | [b65ec2b](../../../commit/b65ec2b) |
| `statistics.html` | 2026-04-25 | `core-components/_statistics.scss` (whole file — `.pa-stat`, `--hero`, `--hero-compact`, `--square` + 6 colour variants, `.pa-kpi-grid`) | [5de0ce8](../../../commit/5de0ce8) |
| `notifications.html` | 2026-04-25 | `core-components/_notifications.scss` (whole file — bell + dropdown panel, item states, page-view modifier, hover-revealed actions) | [0d7bb15](../../../commit/0d7bb15) |
| `data-display.html` | 2026-04-25 | `core-components/_data-display.scss` (whole file — 7 components: `.pa-field` + `.pa-fields` (15+ layout modifiers), `.pa-field-group`, `.pa-desc-table`, `.pa-prop-card`, `.pa-banded`, `.pa-accent-grid`, `.pa-dot-leaders`; shared copy-pattern modifiers across all) | [39cc6bd](../../../commit/39cc6bd) |
| `range-group.html` | 2026-08-24 | `core-components/_range-group.scss` (both blocks) + `src/js/range-group.js` (JS-built tick + summary-segment DOM, state classes). Added tick-marks, disabled, and open-state/summary-segments examples + a full **COMPONENT REFERENCE** block (the pair previously had none). Covers `.pa-range__ticks/__tick/--major/__tick-labels/__tick-label`, `--ticks-labeled`, `--disabled`, `__thumb--grabbing`, and `.pa-range-group__seg-*`, `--open`, `__panel--open`, `__row-value--empty`. |
| `kpi.html` (**new**) | 2026-08-24 | `core-components/_kpi-base.scss` (shared KPI showcase chrome: `.pa-kpi-live`+`__dot`, `.pa-kpi-header`, `.pa-kpi-footer`, `.pa-kpi-detail`+`__title`+`.pos/.neg/.warn`, `.pa-kpi-sectionhead`, `.pa-kpi-spark-wrap`/`-dot`), triangulated with `demo/views/kpi-terminal-grid.mustache`. Closes the `kpi-base` content gap (was mis-mapped to `statistics.html`). |
| `kpi.html` — 7 design sections | 2026-08-24 | Added a canonical-markup + per-design reference section for ALL SEVEN showcase designs, one SCSS partial each, triangulated with each `demo/views/kpi-*.mustache`: **terminal** (`_kpi-terminal.scss`; `pa-kpi-terminal` tabs/panes/grid + `pa-kpi-tile`), **sparkline-list** (`_kpi-sparkline-list.scss`; `pa-kpi-spark-list`/`-row`), **comparison-gauges** (`_kpi-comparison-gauges.scss`; `pa-kpi-gauge-list`/`pa-kpi-gauge`, inline `__fill` width + `--pc-kpi-gauge-tick-pos`), **hero-supporting** (`_kpi-hero-supporting.scss`; `pa-kpi-hero-list`/`-main`/`-side`), **bento** (`_kpi-bento.scss`; `pa-kpi-bento`/`-tile`, source-order placement), **numeric-strip** (`_kpi-numeric-strip.scss`; block prefix `pa-kpi-strip`), **editorial-minimal** (`_kpi-editorial-minimal.scss`; block prefix `pa-kpi-edit`). All seven now at 100% structural coverage; `SNIPPET_OF` maps each `kpi-*` component → `kpi.html`. Extraction parallelized across 7 read-only agents (SCSS + demo mustache). Sentiment modifiers (`--up`/`--positive` etc.) are loop-generated so not catalogued; the `--max-N`/`--no-*`/`--hero-*` variant literals had to be spelled out in full (abbreviation-in-reference trap). |
| `checkbox-lists.html` | 2026-08-24 | `core-components/forms/_checkboxes-radios.scss` — added the `.pa-checkbox-group` form-layout container (flex column that stacks standalone `.pa-checkbox`; shares its rule with `.pa-radio-group`; distinct from the bordered/hover `.pa-checkbox-list`) + reference entry. Coverage 75%→100%. |
| `forms.html` | 2026-08-24 | `core-components/forms/_form-inputs.scss`, `_form-states.scss`, `_query-editor.scss` — completed the `.pa-select` size set (`--xs`/`--xl`) and standalone validation set (`--success`/`--warning`/`--error` on both `.pa-input` and `.pa-select`, incl. the missing `pa-input--warning`); spelled out the JS-built `.pa-inline-query-token--field/--operator/--value/--keyword/--invalid` literals + resulting-DOM example. Closed 3 action-queue items (Select, Text input, Inline query editor) at once. |
| `layout.html` | 2026-08-24 | `core-components/layout/_navbar-elements.scss` + `src/js/navbar-collapse.js` — documented the menu-mode responsive-collapse generated DOM: `.pa-navmenu__item--more`, `__more-chevron`, `__more-menu`, `__more-menu--open` (JS-built More trigger + `<body>`-parented panel). Nav menu 80%→100%. |
| `splitter.html` | 2026-08-24 | `core-components/_splitter.scss` + `src/js/splitter.js` — added a **COMPONENT REFERENCE** heading (the snippet previously failed the ref-block heuristic) with an element + JS-toggled state-class list: `__gutter--active`, `__pane--minimized`, `--minimized`, `--dragging`, `--accordion`. 83%→100% + ref block. |
| `buttons.html` | 2026-08-24 | `core-components/_overflow.scss` + `src/js/overflow.js` — documented the overflow-collapse generated DOM: `.pa-overflow__trigger`, and the atomic folded split-button group `.pa-btn-split--in-overflow` + `.pa-btn-split__group-label`; added an OVERFLOW TOOLBAR reference section. 84%→100%. |
| `modals.html` | 2026-08-24 | `core-components/_modals.scss` — added the composable `.pa-modal--banded` variant (header+footer alert-colour bands) with `--info`/`--danger` banded examples; corrected the stale "no --info" note (`--info` exists ONLY as a band colour). 88%→100%. |
| `statistics.html` | 2026-08-24 | `core-components/_statistics.scss` + `src/js/pa-stat-fit.js` — documented the two remaining square-fit JS-created classes: `.pa-stat__meta` (metadata column) and `.pa-stat--fit-wide` (JS-toggled horizontal banner layout; can't be a `@container` query). 89%→100%. |
| `command-palette.html` | 2026-08-24 | `core-components/_command-palette.scss` — added the mobile fullscreen sheet: `.pa-command-palette--fullscreen` + `__fullscreen-bar`/`__fullscreen-title`/`__close` (driver-added via `pureAdmin.device`, not a media query). 89%→100%. |
| `utilities.html` | 2026-08-24 | `core-components/layout/_navbar-elements.scss` — documented `.pa-fit-hidden` (navbar-fit.js state hook; `display:none !important`; pre-seed inactive fit steps for no-JS-safe render). 89%→100%. |
| `toasts.html` | 2026-08-24 | `core-components/_toasts.scss` — added live `.pa-toast--filled-danger/-warning/-info` examples (only `-primary`/`-success` were shown; the rest were abbreviation-in-reference). 90%→100%. |
| `data-display.html` | 2026-08-24 | `core-components/_data-display.scss` — added live `.pa-banded__copy` + `.pa-accent-grid__copy` examples (with `__row--copy-hover` / `__item--copy-hover`); they were only in the generic shared copy-pattern reference. 91%→100%. |
| `search-results.html` | 2026-08-24 | `core-components/_search-results.scss` — appended a full **COMPONENT REFERENCE** block (container presets + canonical item elements + grouped wrappers + `__mark`); was already 100% structural but lacked a ref block. |
| `icon.html` (**new**) | 2026-08-24 | `core-components/_icons.scss` — documented the mask-based icon primitive: `.pa-icon` + `.pa-icon--x`, the `--pc-icon-size` / `--pc-icon-src` / `--pc-icon-x` tokens, glyph-swap (provider-agnostic mask URL override), the `pa-icon-mask()` pseudo-element mixin, and a11y (aria-hidden glyph + labelled parent). Closed the last `todo` gap. |

## Pending

_None — snippet coverage sweep COMPLETE: **0 to uplift, 63 components at full structural coverage, and `todo` gaps = none**. Every stable public `pa-*` component now has a snippet. The only remaining no-snippet gaps are the four intentionally-deferred/superseded components (settings-panel, data-viz, logic-tree, file-selector) tracked in the gap table below and in `../SNIPPET-COVERAGE.md`._

Run `npm run generate-hashes -w @keenmate/pure-admin-core` to refresh `snippets/manifest.json` whenever any of the snippet files change.

## Gaps — SCSS without a snippet

These components exist in `src/scss/core-components/` but downstream consumers have no snippet to crib from. Decide per-entry whether to add a snippet or mark as demo-internal.

| Component | SCSS file | Notes |
|---|---|---|
| pagers | `_pagers.scss` | Covered inside `tables.html` audit (same family; pager/load-more only meaningful alongside tables). |
| ~~notifications~~ | ~~`_notifications.scss`~~ | ~~Public — snippet worth adding~~ → done in `notifications.html` |
| ~~statistics~~ | ~~`_statistics.scss`~~ | ~~Public — snippet worth adding~~ → done in `statistics.html` |
| file-selector | `_file-selector.scss` | **Deferred** — component is not yet finished. Revisit once the API stabilizes; snippet would chase a moving target. |
| ~~filter-card~~ | ~~`_filter-card.scss`~~ | ~~Public — snippet worth adding~~ → done in `filter-card.html` |
| logic-tree | `_logic-tree.scss` | **Deferred** — component is not yet finished. Revisit once the API stabilizes. |
| ~~data-display~~ | ~~`_data-display.scss`~~ | ~~Public — snippet worth adding~~ → done in `data-display.html` |
| smart-filters (aka query-editor) | `core-components/forms/_query-editor.scss` | **Deferred** — component is not yet finished. SCSS file is named `_query-editor.scss` but the demo calls it "Smart Filters" (`demo/views/smart-filters.mustache` + `demo/js/search-autocomplete*.js`, `virtual-textbox.js`). Briefly cross-referenced from forms.html; revisit once the API stabilizes. |
| data-viz | `_data-viz.scss` | D3-driven — snippet would be thin; defer |
| scrollbars | `_scrollbars.scss` | Global utility styling; no snippet needed |
| settings-panel | `_settings-panel.scss` | Demo-internal; no snippet needed |
| web-components-theme | `_web-components-theme.scss` | CSS custom properties bridge; no snippet needed |
| base | `_base.scss` | Reset/base styles; covered by `typography.html` |

## Adversarial re-review of the walkthrough (2026-08-24)

Independent second pass over the 14 uplifted snippets, treating the coverage
number (`0 to uplift, 63 at full`) as necessary-but-insufficient. Method: for
each `pa-kpi-*` design and every edited snippet, re-derived the real selector
set from the SCSS partials + compiled `dist/css/main.css` + `src/js/*.js`, then
diffed the authored markup and reference prose against it. Defects fixed in
place:

- **`kpi.html` — numeric-strip header row was structurally wrong.** The canonical
  demo (`kpi-numeric-strip.mustache`) right-aligns the numeric header cells with
  `.pa-kpi-strip__head--num` (nested `&--num { text-align: end }` at
  `_kpi-numeric-strip.scss:64`); the snippet omitted it, so header labels would
  left-align while the data cells right-align. Added `--num` to the now/prev/delta
  header cells. Coverage never caught this because `__head--num` appeared
  elsewhere in the file.
- **`kpi.html` — numeric-strip head reference overstated the modifiers.**
  `__head--metric` / `__head--now` have **no** CSS rule (inert identifiers);
  `__head--prev/--delta/--target` exist only as `--no-*` hide targets; `--num` is
  the sole styling modifier. Rewrote the reference to say so.
- **`kpi.html` — design-index listed non-existent block classes.** The shared
  reference listed `pa-kpi-sparkline-list / -comparison-gauges / -hero-supporting
  / -numeric-strip / -editorial-minimal` as if they were the root classes; those
  are the SCSS partial/design names. Replaced with an explicit design-name → real
  root-class map (spark-list / gauge-list / hero-list / strip / edit).
- **`kpi.html` — SENTIMENT MODIFIERS note was over-generalized.** It implied a
  uniform two-family scheme; in reality gauges use `--warning` and strip/edit/bento
  deltas use `--up-strong/--down-strong` (not `--very-*`). Rewrote as a per-family
  breakdown pointing to each design's own reference.
- **`utilities.html` — invented `pc-col--start/end`.** Line 702 listed it as a
  logical RTL-flipping utility; no such class exists (real `pc-col--*` modifiers
  are `--grow/--shrink/--no-padding`). Removed it; kept the real `text-start/end`
  (+ `.pa-text--start/--end`).

Verified clean (no change needed): all JS-generated DOM class names
(`__more-menu--open`, overflow `__trigger`/`--in-overflow`/`__group-label`, stat
`__meta`/`--fit-wide`, command-palette `--fullscreen`, splitter states,
`pa-fit-hidden`) exist in `src/js/*.js`; `pa-modal--static` is a legitimate demo
JS-hook (used by `modals.mustache` ESC handler, no CSS rule by design); every
`pa-kpi-*` sentiment/status modifier resolves to a real `&--` loop/def; all
negative-space notes ("no `.pa-form-label`", "no `pa-btn--outline-light/dark`",
"no `pa-layout__sidebar--sticky`", "no `pa-modal__header--*`") are accurate; the
added `pa-input/select--success/warning/error` and `pa-toast--filled-*` live
examples all exist in compiled CSS.

## Full 39-snippet adversarial sweep (2026-08-24)

Extended the re-review from the 14 walkthrough snippets to **all 39**. Method:
(1) a deterministic mechanical net — every `pa-*` class in live `class="…"`
markup AND in reference prose, checked against compiled `dist/css/main.css` +
`src/js/*.js`; plus bare-utility checks (`text-*`, `wr-*/minwr-*/maxwr-*` scale);
(2) parallel proof-required agent review of the remaining ~22 snippets for
structural/nesting mistakes and false prose, with every reported defect
re-verified by hand before fixing. Defects found and fixed:

- **`cards.html` — invented stat classes.** `pa-stat--with-icon` (dropped; icon
  works via the `.pa-stat__icon` child) and `pa-stat__trend`/`--up` → the real
  `.pa-stat__change`/`--positive` (matches `_statistics.scss` + statistics.html).
  Neither invented class appears anywhere in SCSS/CSS/demo. Also refreshed the
  stale "pending statistics.html" note (that snippet now exists).
- **`timeline.html` — `pa-loader pa-loader--sm` don't exist.** No bare `.pa-loader`
  or `.pa-loader--sm` rule exists; the visible spinner is `.pa-spinner`.
  virtual-scroll.html already documents this correctly, so timeline was the
  outlier. Replaced with `.pa-spinner pa-spinner--primary` + a note that the
  demo's `.pa-loader` wrapper is an inert JS-visibility hook.
- **`utilities.html` — invented `pc-col--start/end`** (removed) and **`text-muted`**
  (removed; alias line for a class that doesn't exist).
- **`typography.html` — `.text-muted`** in the semantic-colour reference (removed;
  `grep -c '.text-muted' main.css` = 0). Same invented alias as utilities.html.
- **`badges.html` — two prose errors.** `pa-badge-group` visible limit is **5**,
  not 6 (`$badge-group-visible-limit: 5`; selector `:nth-child(n+6)` hides the 6th
  onward). And the truncation example used `minwr-12 maxwr-12`, off the width
  scale (1-10 then 15,20,…50) → `minwr-10 maxwr-10`.
- **`code.html` — false counter prose.** `pa-code--numbered` was described as
  auto-rendering line numbers via a CSS counter, but the SCSS has no
  `counter-increment` / `content: counter(line)` — it only draws an empty gutter
  and resets the counter. Rewrote the note + the reference line.
- **`modal-dialogs.html` — `md` size prose.** Said every size interpolates into
  `pa-modal__container--{size}`, but `md` is the bare base container (JS
  special-cases `size === 'md'`; no `--md` class exists). Noted the exception.
- **`detail-panel.html` — off-scale width utilities.** `wr-32`, `minwr-24`,
  `maxwr-60` aren't generated (scale is 1-10 then 15…50) → `wr-30`,
  `minwr-25 maxwr-50`, with a note about the scale.
- **`customization.html` — invented `$primary-bg` SCSS variable** (both build-time
  override examples) → the real `$base-accent-color`.
- **`web-multiselect.html` / `web-daterangepicker.html`** — "~45 `--base-*`
  variables" corrected to "~90" (emit source declares 94).

Verified CLEAN (agent + hand-checked): alerts, callouts, notifications,
popconfirm, comparison, lists, tabs, tooltips, grid, loaders, profile,
range-group. Every class in those exists in compiled CSS; structure and prose
match SCSS. Coverage still `0 to uplift, 63 at full` after all fixes; manifest
rehashed.

## Known issues flagged during audits (not in scope to fix here)

- **Framework-wide inert classes (no CSS rule; harmless but misleading).**
  Surfaced by the 39-snippet sweep; left in place to stay consistent with the
  demo rather than diverge one snippet. (a) **`pa-table--hover`** — used ~20× across
  the demo and in detail-panel.html, but `.pa-table` has row hover built into the
  base (`_tables.scss` `tbody tr:hover`), so `--hover` is a legacy no-op. Either
  make base-hover opt-in behind `--hover`, or drop the class everywhere.
  (b) **`.pa-loader` / `.pa-loader--sm`** — the demo wraps timeline/virtual-scroll
  spinners in an inert `.pa-loader` div used only as a JS `display` toggle by `id`;
  the class carries no CSS. (c) **`.pa-range__thumb--max`** — only `--min` is styled
  (arrow + stacking); the max thumb is distinguished by `data-range-thumb`, so
  `--max` is a symmetry-only class. (d) **`pa-kpi-strip__head--metric` / `--now`** —
  inert column identifiers (only `--num` and the `--no-*` hide targets have rules).


- **`demo/views/code.mustache`** reference block lists several accent colors that don't match `variables/_colors.scss`: JSON → "Green" (actual amber), bash → "Gray" (actual green), SQL → "Purple" (actual teal), keyword → "purple, bold" (actual blue + medium), function → "blue" (actual purple), property → "cyan" (actual pink-red). Fix in a later demo pass.
- **`.pa-spinner` ghost size modifiers.** `_loaders.scss` only defines `--xs`; the demo page (`demo/views/loaders.mustache`) and the previous snippet both showed `--sm`, `--md`, `--lg`, `--xl`, `--2xl` with fabricated size labels (1rem → 4rem). All render at the default 16px because the modifiers don't exist. Snippet fixed in loaders commit; demo page still broken — either remove the ghost sizes from the demo, or add them to SCSS. Decision to be made in a future framework pass.
- ~~**Popconfirm is physical-only; toasts are logical.**~~ Fixed in the popconfirm logical-rename commit: `--left`/`--right` → `--start`/`--end`, SCSS switched to `inset-inline-*` + `margin-inline-*`, arrow gets `scaleX(-1)` under `[dir="rtl"]`. See Unreleased section of CHANGELOG.
- **Table wrappers consolidated (2.9.0-rc10).** `tables.html` now blesses only two container shapes: `.pa-table-container` (bare, framed + scrollable, no header) and `.pa-table-card` (header/body/footer/actions + card chrome). `.pa-table-container--panel` (+ `__header`/`__title`/`__actions`) and hosting a `.pa-table` directly in a generic `.pa-card` body are **deprecated** — still render (legacy tolerance) but removed from the snippet and slated for removal in a future major. Demo fully swept: main table pages plus the reference-table tail (badges, checkbox-lists, theme-variables, table-filters, detail-panel, data-display, data-display-2, data-visualization, popconfirm, rtl-test, smart-filters) all migrated to `.pa-table-card`. Left by design: `.pa-comparison-table` (a distinct component, not a plain data table) and mixed-content cards where a table shares a `.pa-card` body with prose/toolbars/filter-chips (e.g. `table-filters.mustache` filter-chips+table card, and content cards on `helpers`/`grid`/`kpi-dashboard`/`splitter`/`tables-sizing` size demos which wrap the table in a blessed `.pa-table-container`).
- **Composite badge missing `--btn-danger` variant.** All other button-section colour overrides exist (`--btn-primary`, `--btn-secondary`, `--btn-success`, `--btn-warning`, `--btn-info`, `--btn-light`, `--btn-dark`) but not `--btn-danger`. The base `.pa-composite-badge__button` defaults to danger colours, so adding `--btn-danger` would be a no-op in practice, but the gap is inconsistent with `--label-danger` (which does exist) and makes "what overrides are available" harder to predict. Snippet flags the omission; actual fix is a single block in `_composite-badge-variants.scss`.
- ~~**Pager/load-more definitions are duplicated** between `_tables.scss` (lines 475-608) and `_pagers.scss`.~~ Fixed: duplicate block removed from `_tables.scss`, and the `var(--pc-accent)` upgrade on the load-more spinner ported into `_pagers.scss` (it was using the raw SCSS `$accent-color` before). See Unreleased CHANGELOG entry.
- **Timeline `--alternating` uses physical `left`/`right` throughout.** `_timeline.scss` mixes its RTL handling: `--simple` and `--feed` use logical properties (`inset-inline-*`, `margin-inline-*`, `padding-inline-*`, `border-inline-*`) and mirror correctly in RTL. But `--alternating` and its modifiers (`--start`, `--end`, `--keep-layout`, `--single-column`) use physical `left`/`right` positions for the centre line, dots, connector arms, dates, icons, and content offsets. Result: in RTL, the alternating timeline doesn't mirror — items stay on the same physical sides, the dates don't flip to the inline-start of each item, and `--start`/`--end` are locked to physical left/right. Fix would need `inset-inline-start/end` + `border-inline-*` substitutions throughout the alternating block, plus probably a `[dir="rtl"] &` flip for the nth-child offset origin. Framework scope; snippet documents the current physical behaviour accurately.

## Rehash

At the end of the audit (or whenever snippets settle), run:

```bash
npm run generate-hashes -w @keenmate/pure-admin-core
```

to refresh `snippets/manifest.json` so downstream framework wrappers see the new hashes.
