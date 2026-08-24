# Pure Admin — Snippet Coverage Report

> **Auto-generated** by `scripts/build-components-catalog.mjs` (runs with `npm run catalog`).
> Do not edit by hand. This is a maintainer QA artifact — it is *not* shipped in the npm package.

The systematic sweep behind the snippet walkthrough: for each `pa-*` component it checks how many of its catalog selectors (blocks + elements + modifiers) actually appear in the snippet a code-gen tool would copy from.

**How to read it**
- **Structural coverage** — share of the component's catalog selectors present in its snippet. Loop-generated colour variants (`pa-badge--primary`, …) are not catalog selectors, so **100% ≠ "every colour shown"** — it means every hand-written element/modifier is shown.
- **Ref block** — heuristic: does the snippet carry a trailing `REFERENCE` / `CLASSES:` summary (the `badges.html` gold-standard shape: sections → inline modifier docs → scenarios → reference block)?
- **Status** — for gaps: `todo` (snippet owed), `deferred` (API in flux), `superseded` (owned elsewhere).

## Action queue — snippets to uplift (worst first)

| Component | Snippet | Coverage | Ref block | Missing selectors |
|---|---|:--:|:--:|---|
| _all snippets at full structural coverage_ | | | | |

## Gaps — components with no snippet

| Component | Block | Status | Reason |
|---|---|:--:|---|
| Settings panel | `pa-settings-panel` | deferred | Demo-internal composition; no standalone public contract yet. |
| Data-viz primitives | `pa-bar-list` | deferred | D3-driven; a static HTML snippet is too thin to be useful. Documented via demo only. |
| Logic tree | `pa-logic-tree` | deferred | API not yet stable — a snippet would chase a moving target. |
| File selector | `pa-file-dropzone` | superseded | Superseded by @keenmate/web-dropzone (the demo "File Upload" route renders the web component). Removal candidate — no snippet owed. |

## Full structural coverage + reference block

`Layout shell`, `Navbar`, `Navbar search`, `App header`, `Page header`, `Nav menu`, `Sidebar`, `Footer`, `Width containers`, `Grid (row/col)`, `Card`, `Section`, `Splitter`, `Modal`, `Tabs`, `Detail panel`, `Profile panel`, `Table card`, `Form layout`, `Text input`, `Textarea`, `Select`, `Input group`, `Input wrapper / token field`, `Checkbox`, `Radio`, `Checkbox list`, `Range slider`, `Range group`, `Inline query editor`, `Filter card`, `Button`, `Pager`, `Popconfirm`, `Table`, `Comparison table`, `List`, `Code block`, `Data display (field lists)`, `Statistics / stat cards`, `KPI showcase — shared base`, `KPI showcase — terminal`, `KPI showcase — sparkline list`, `KPI showcase — comparison gauges`, `KPI showcase — hero + supporting`, `KPI showcase — bento`, `KPI showcase — numeric strip`, `KPI showcase — editorial minimal`, `Alert`, `Callout`, `Toast`, `Notifications`, `Tooltip`, `Popover`, `Loaders / spinners`, `Timeline`, `Badge`, `Label`, `Composite badge`, `Command palette`, `Search results`, `Icon`, `Utilities & state hooks`

