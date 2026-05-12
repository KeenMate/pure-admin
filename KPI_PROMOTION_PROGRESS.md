# KPI Showcases → Core Promotion · Progress

Promoting the 7 KPI showcase pages from demo-only (inline `<style>` + `<script>`) into permanent core framework components with `pa-kpi-*` BEM classes.

## Decisions

- **Class prefix:** `pa-kpi-*` (BEM, project rule from CLAUDE.md)
- **File layout:** one SCSS file per design + shared base (8 files total in `packages/core/src/scss/core-components/`)
- **JS:** extracted to `demo/js/kpi-showcases.js` (stays demo-only — depends on Floating UI which is currently loaded only in demo)
- **Token surface:** unchanged — all `--pa-positive`, `--pa-detail-*`, `--pa-chart-trendline-*` already exist in `_base-css-variables.scss` from v2.6.0

## Files added

```
packages/core/src/scss/core-components/
├── _kpi-base.scss              # shared: pa-kpi-header, -live, -footer, -detail, -spark-dot, -spark-wrap, -sectionhead, @keyframes pa-kpi-pulse
├── _kpi-terminal.scss          # Bloomberg-style dense grid + view toggle + status pills
├── _kpi-sparkline-list.scss    # 4-col row layout, container-query stack, --chart-first modifier
├── _kpi-comparison-gauges.scss # progress bars w/ target tick, sentiment modifiers, --pa-kpi-bar-color cascade
├── _kpi-hero-supporting.scss   # hero + side rail, fixed-height SVG wrap, container-query collapse
├── _kpi-bento.scss             # 6×3 asymmetric grid, layered chart-behind-value
├── _kpi-numeric-strip.scss     # 5-col tabular row grid, --no-prev 4-col modifier
└── _kpi-editorial-minimal.scss # gap-as-hairline trick, 200-weight value, --2col modifier

demo/js/kpi-showcases.js        # one-file replacement for 7 inline scripts: popovers + dot fix + terminal toggle
```

## Files changed

- `packages/core/src/scss/_core.scss` — 8 new `@use` lines (base + 7 designs) after `data-viz`
- `demo/views/layout.mustache` — one `<script src="/src/js/kpi-showcases.js">` line
- All 7 `demo/views/kpi-*.mustache` (terminal-grid, sparkline-list, comparison-gauges, hero-supporting, bento, numeric-strip, editorial-minimal) — inline `<style>` and `<script>` blocks deleted; all `kpi-*` classes renamed to `pa-kpi-*`

## Dedup wins

The base file consolidates patterns that were byte-identical across all 7 pages:

| Pattern                        | Old (per-page)                          | New (shared)             |
|--------------------------------|-----------------------------------------|--------------------------|
| LIVE indicator                 | `.kpi-X__live` + `.kpi-X__livedot`      | `.pa-kpi-live` + `__dot` |
| Card header row                | `.kpi-X__header`                        | `.pa-kpi-header`         |
| Card footer caption            | `.kpi-X__footer`                        | `.pa-kpi-footer`         |
| Hover detail popover (35 lines)| `.kpi-X__detail` / `.kpi-X-detail`      | `.pa-kpi-detail`         |
| Popover title                  | `.kpi-X__detail-title` / `-detail-title`| `.pa-kpi-detail__title`  |
| Sparkline endpoint dot         | `.kpi-spark-dot`                        | `.pa-kpi-spark-dot`      |
| Pulse animation                | `@keyframes kpiPulse`                   | `@keyframes pa-kpi-pulse`|

JS deduped similarly: one Floating UI popover init (matches every `.pa-kpi-detail`, uses `detail.parentElement` as the host before moving the popover to `<body>`), one SVG-circle → CSS-span dot conversion (covers all 4 sparkline-bearing designs), one terminal-grid view-mode toggle.

Roughly **500 lines of CSS and 350 lines of JS** moved out of duplicated inline blocks and into shared core/demo files.

## Done

- [x] Inventory all 7 KPI page inline styles and scripts
- [x] Create `_kpi-base.scss`
- [x] Create 7 design-specific SCSS files
- [x] Wire 8 new SCSS imports into `_core.scss`
- [x] Extract inline JS to `demo/js/kpi-showcases.js`
- [x] Wire JS into `demo/views/layout.mustache`
- [x] Update 7 mustache pages: remove inline styles/scripts, rename classes to `pa-kpi-*`
- [x] Build verification — `npm run build -w @keenmate/pure-admin-core` succeeds after the SCSS pass

## Remaining

- [ ] **Final build + browser smoke test.** Boot `npm run start -w demo`, hit each `/kpi/*` route, confirm visual parity vs current `prod`, confirm popovers anchor to cursor and follow on `mousemove`, confirm sparkline dots are circular (not oval) at varying card widths, confirm container-query collapse fires at the documented breakpoints.
- [ ] **CHANGELOG.md note** for the promotion (deferred-out-of-scope → core).
- [ ] **Verify pa-kpi-edit block has no styling needed.** `.kpi-edit` was a markup hook only — no direct CSS rule in the original. Confirm nothing relied on it.

## Known issues / things to watch in verification

1. **Terminal-grid `.pa-kpi-spark-wrap` color cascade.** The dot lives inside a JS-inserted `.pa-kpi-spark-wrap` span and needs `currentColor` to resolve to the sentiment color. Cascade was rewritten from `.kpi-tile__spark-wrap` to the generic `.pa-kpi-spark-wrap` — verify it still picks up `.pa-kpi-tile--up`, `--down`, etc.

2. **Sparkline dot wrapping logic.** The JS now uses `getComputedStyle(parent).position` to decide whether to create a wrap span. Terminal-grid needs a wrap (parent is `.pa-kpi-tile` which is `position: relative` already, so the wrap is skipped, but the dot anchors to the tile not the sparkline — verify positioning still correct). If the dot drifts, change to always-wrap or check `parent.tagName !== 'SPAN'`.

3. **Per-page `--kpi-accent` → `--pa-kpi-accent` token rename.** Bento, hero, gauges all used `--kpi-accent` internally. Renamed to `--pa-kpi-accent` (and `--pa-kpi-bar-color` for gauges). If any inline `style="--kpi-accent: …"` overrides existed in markup, they were renamed; grep confirms none remain.

## Migration script

A one-off Node script (`migrate-kpi.mjs`) performed the mustache rewrites then was deleted. Key lesson — class-name renames need word-boundary regex to avoid `pa-pa-kpi-*` substring collisions:

```js
new RegExp(`(?<![a-zA-Z0-9_-])${escaped}(?![a-zA-Z0-9_])`, 'g')
//          ^ excludes hyphen on entry        ^ allows hyphen on exit (BEM --modifier)
```

If the migration ever needs to run again (e.g. for keen-pure-admin Svelte port), recover from git history at the commit that bundles this work.
