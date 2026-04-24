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

## Pending

Ordered roughly narrow → broad, the way the audit is running:

- `loaders.html`
- `toasts.html`
- `popconfirm.html`
- `typography.html`
- `alerts.html`
- `badges.html`
- `buttons.html`
- `tables.html`
- `lists.html`
- `tooltips.html`
- `grid.html`
- `utilities.html`
- `cards.html`
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
| pagers | `_pagers.scss` | Public — snippet worth adding |
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

## Rehash

At the end of the audit (or whenever snippets settle), run:

```bash
npm run generate-hashes -w @keenmate/pure-admin-core
```

to refresh `snippets/manifest.json` so downstream framework wrappers see the new hashes.
