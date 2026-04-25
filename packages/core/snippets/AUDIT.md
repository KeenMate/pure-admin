# Snippets Audit Log

Tracks which snippets have been cross-checked against their SCSS source and when. Paired with `manifest.json` (which records file hashes for downstream framework wrappers), this file answers *has anyone verified this is still accurate*.

**Process.** An audit reads the corresponding SCSS surface, compares it against the snippet (base class, modifiers, BEM elements, child styling, sizes, variants), triangulates with usage in `demo/views/*.mustache`, and fixes drift in-place. One snippet per commit.

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
| `alerts.html` | 2026-04-24 | `core-components/_alerts.scss` | [512ef3c](../../../commit/512ef3c) |
| `badges.html` | 2026-04-24 | `core-components/badges/_badge-base.scss`, `_composite-badge.scss`, `_composite-badge-variants.scss`, `_badge-group.scss`, `_labels.scss` | [517f6bf](../../../commit/517f6bf) |
| `buttons.html` | 2026-04-24 | `core-components/_buttons.scss` | [43a9a42](../../../commit/43a9a42) |
| `tables.html` | 2026-04-24 | `core-components/_tables.scss` (covers `.pa-table`, `.pa-table-container`, `.pa-table-card`), `core-components/_pagers.scss` (covers `.pa-pager`, `.pa-load-more`) | [e34ca85](../../../commit/e34ca85) |
| `lists.html` | 2026-04-24 | `core-components/_lists.scss` | [894b0dd](../../../commit/894b0dd) |
| `tooltips.html` | 2026-04-24 | `core-components/_tooltips.scss` | [b2d196b](../../../commit/b2d196b) |
| `grid.html` | 2026-04-24 | `core-components/_grid.scss`, `utilities.scss` (.pa-cq), `variables/_spacing.scss` ($grid-breakpoints) | [0bd9f16](../../../commit/0bd9f16) |
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
| `modal-dialogs.html` | 2026-04-24 | `src/js/modal-dialogs.js` (PureAdmin.confirm / alert / prompt / custom API); DOM produced matches `_modals.scss` | [e5eba00](../../../commit/e5eba00) |
| `detail-panel.html` | 2026-04-24 | `core-components/_detail-panel.scss`, `variables/_components.scss` (panel width + z-index) | [c1dc6ff](../../../commit/c1dc6ff) |
| `customization.html` | 2026-04-25 | `_base-css-variables.scss`, `_variables.scss`, theme-system pattern (mirrors `pure-admin-themes` repo) | [0a8950e](../../../commit/0a8950e) |
| `virtual-scroll.html` | 2026-04-25 | `core-components/_tables.scss` (`.pa-virtual-table` shell, lines 477-552), `core-components/_timeline.scss` (`.pa-timeline__loader`), `src/js/virtual-scroll.js` (VirtualScroll class API) | _(this commit)_ |

## Pending

Ordered roughly narrow → broad, the way the audit is running:

- `web-daterangepicker.html`
- `web-multiselect.html`

## Gaps — SCSS without a snippet

These components exist in `src/scss/core-components/` but downstream consumers have no snippet to crib from. Decide per-entry whether to add a snippet or mark as demo-internal.

| Component | SCSS file | Notes |
|---|---|---|
| pagers | `_pagers.scss` | Covered inside `tables.html` audit (same family; pager/load-more only meaningful alongside tables). |
| notifications | `_notifications.scss` | Public — snippet worth adding |
| statistics | `_statistics.scss` | Public — snippet worth adding |
| file-selector | `_file-selector.scss` | Public — snippet worth adding |
| filter-card | `_filter-card.scss` | Public — snippet worth adding |
| logic-tree | `_logic-tree.scss` | Specialized — decide during gap pass |
| data-display | `_data-display.scss` | Public — snippet worth adding |
| smart-filters (aka query-editor) | `core-components/forms/_query-editor.scss` | Public — large surface (search highlighting, autocomplete, virtual textbox, inline query editor with tokens). The SCSS file is named `_query-editor.scss` but the demo calls it "Smart Filters" (`demo/views/smart-filters.mustache` + `demo/js/search-autocomplete*.js`, `virtual-textbox.js`). Briefly cross-referenced from forms.html; deserves its own snippet (probably `smart-filters.html`). |
| data-viz | `_data-viz.scss` | D3-driven — snippet would be thin; defer |
| scrollbars | `_scrollbars.scss` | Global utility styling; no snippet needed |
| settings-panel | `_settings-panel.scss` | Demo-internal; no snippet needed |
| web-components-theme | `_web-components-theme.scss` | CSS custom properties bridge; no snippet needed |
| base | `_base.scss` | Reset/base styles; covered by `typography.html` |

## Known issues flagged during audits (not in scope to fix here)

- **`demo/views/code.mustache`** reference block lists several accent colors that don't match `variables/_colors.scss`: JSON → "Green" (actual amber), bash → "Gray" (actual green), SQL → "Purple" (actual teal), keyword → "purple, bold" (actual blue + medium), function → "blue" (actual purple), property → "cyan" (actual pink-red). Fix in a later demo pass.
- **`.pa-spinner` ghost size modifiers.** `_loaders.scss` only defines `--xs`; the demo page (`demo/views/loaders.mustache`) and the previous snippet both showed `--sm`, `--md`, `--lg`, `--xl`, `--2xl` with fabricated size labels (1rem → 4rem). All render at the default 16px because the modifiers don't exist. Snippet fixed in loaders commit; demo page still broken — either remove the ghost sizes from the demo, or add them to SCSS. Decision to be made in a future framework pass.
- ~~**Popconfirm is physical-only; toasts are logical.**~~ Fixed in the popconfirm logical-rename commit: `--left`/`--right` → `--start`/`--end`, SCSS switched to `inset-inline-*` + `margin-inline-*`, arrow gets `scaleX(-1)` under `[dir="rtl"]`. See Unreleased section of CHANGELOG.
- **Composite badge missing `--btn-danger` variant.** All other button-section colour overrides exist (`--btn-primary`, `--btn-secondary`, `--btn-success`, `--btn-warning`, `--btn-info`, `--btn-light`, `--btn-dark`) but not `--btn-danger`. The base `.pa-composite-badge__button` defaults to danger colours, so adding `--btn-danger` would be a no-op in practice, but the gap is inconsistent with `--label-danger` (which does exist) and makes "what overrides are available" harder to predict. Snippet flags the omission; actual fix is a single block in `_composite-badge-variants.scss`.
- ~~**Pager/load-more definitions are duplicated** between `_tables.scss` (lines 475-608) and `_pagers.scss`.~~ Fixed: duplicate block removed from `_tables.scss`, and the `var(--pa-accent)` upgrade on the load-more spinner ported into `_pagers.scss` (it was using the raw SCSS `$accent-color` before). See Unreleased CHANGELOG entry.
- **Timeline `--alternating` uses physical `left`/`right` throughout.** `_timeline.scss` mixes its RTL handling: `--simple` and `--feed` use logical properties (`inset-inline-*`, `margin-inline-*`, `padding-inline-*`, `border-inline-*`) and mirror correctly in RTL. But `--alternating` and its modifiers (`--start`, `--end`, `--keep-layout`, `--single-column`) use physical `left`/`right` positions for the centre line, dots, connector arms, dates, icons, and content offsets. Result: in RTL, the alternating timeline doesn't mirror — items stay on the same physical sides, the dates don't flip to the inline-start of each item, and `--start`/`--end` are locked to physical left/right. Fix would need `inset-inline-start/end` + `border-inline-*` substitutions throughout the alternating block, plus probably a `[dir="rtl"] &` flip for the nth-child offset origin. Framework scope; snippet documents the current physical behaviour accurately.

## Rehash

At the end of the audit (or whenever snippets settle), run:

```bash
npm run generate-hashes -w @keenmate/pure-admin-core
```

to refresh `snippets/manifest.json` so downstream framework wrappers see the new hashes.
