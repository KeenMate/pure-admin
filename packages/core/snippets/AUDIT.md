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
| `cards.html` | 2026-04-24 | `core-components/_cards.scss` | _(this commit)_ |

## Pending

Ordered roughly narrow → broad, the way the audit is running:

- `forms.html`
- `layout.html`
- `profile.html`
- `tabs.html`
- `timeline.html`
- `checkbox-lists.html`
- `command-palette.html`
- `comparison.html`
- `modals.html`
- `modal-dialogs.html`
- `detail-panel.html`
- `customization.html`
- `virtual-scroll.html`
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

## Rehash

At the end of the audit (or whenever snippets settle), run:

```bash
npm run generate-hashes -w @keenmate/pure-admin-core
```

to refresh `snippets/manifest.json` so downstream framework wrappers see the new hashes.
