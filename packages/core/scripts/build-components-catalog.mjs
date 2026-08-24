#!/usr/bin/env node
// Generates the authoritative Pure Admin component catalog:
//   - packages/core/components.json  (machine-readable manifest)
//   - packages/core/COMPONENTS.md    (human-readable catalog)
//
// Source of truth = the compiled-from SCSS in src/scss. This script extracts
// every `.pa-*` class SELECTOR (never --pa-* CSS variables), groups them via
// the hand-authored TAXONOMY below, and auto-detects which SCSS partial defines
// each class plus which snippet / demo view references it. It FAILS if any
// discovered block is not assigned to a component, so the catalog can never
// silently drift out of coverage as new components land.
//
// Re-run after adding/removing pa-* classes:  node scripts/build-components-catalog.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORE = join(__dirname, '..');
const SCSS = join(CORE, 'src', 'scss');
const SNIPPETS = join(CORE, 'snippets');
const DEMO_VIEWS = join(CORE, '..', '..', 'demo', 'views');

// ---- class-selector extraction -------------------------------------------
// A BEM class: pa-<block>(-word)*(__<el>(-word)*)?(--<mod>(-word)*)?
// Leading `.` required so we only catch selectors, not --pa-* custom props.
const CLASS_RE =
  /\.(pa-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)/g;

// Placeholder used only inside a doc comment in _splitter.scss.
const IGNORE = new Set(['pa-foo']);

function walk(dir, filter, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, filter, out);
    else if (filter(p)) out.push(p);
  }
  return out;
}

const scssFiles = [
  ...walk(join(SCSS, 'core-components'), (p) => p.endsWith('.scss')),
  join(SCSS, 'utilities.scss'),
];

// selector -> Set(relative partial paths that contain it as a selector)
// blockOwners: block -> Set(files where the block appears at the START of a
// selector segment, i.e. the file that DEFINES/styles it — not files that merely
// reference it as a descendant like `.pa-alert .pa-card`).
const selToFiles = new Map();
const blockOwners = new Map();   // file has a leading .pa-block* selector
const bareOwners = new Map();    // file has the bare `.pa-block` base rule
const scssTextByRel = new Map();

// True when `.pa-x` at index `i` begins a selector segment (preceded, after
// skipping whitespace, by line-start / `,` / `{` / `}` / `;` — not a combinator
// or another class, which would make it a descendant/compound reference).
function isLeading(text, dotIdx) {
  let j = dotIdx - 1;
  while (j >= 0 && (text[j] === ' ' || text[j] === '\t')) j--;
  if (j < 0) return true;
  return '\n\r,{};'.includes(text[j]);
}

for (const file of scssFiles) {
  const rel = relative(SCSS, file).replaceAll('\\', '/');
  const text = readFileSync(file, 'utf8');
  scssTextByRel.set(rel, text);
  for (const m of text.matchAll(CLASS_RE)) {
    const cls = m[1];
    const block = cls.split(/__|--/)[0];
    if (IGNORE.has(block)) continue;
    if (!selToFiles.has(cls)) selToFiles.set(cls, new Set());
    selToFiles.get(cls).add(rel);
    if (isLeading(text, m.index)) {
      if (!blockOwners.has(block)) blockOwners.set(block, new Set());
      blockOwners.get(block).add(rel);
      // bare base rule `.pa-block` (no __/--) → the true defining partial
      if (cls === block) {
        if (!bareOwners.has(block)) bareOwners.set(block, new Set());
        bareOwners.get(block).add(rel);
      }
    }
  }
}

const allSelectors = [...selToFiles.keys()].sort();
const blockOf = (cls) => cls.split(/__|--/)[0];
const allBlocks = [...new Set(allSelectors.map(blockOf))].sort();

// ---- dedicated snippet / demo detection ----------------------------------
// We report the *dedicated* doc for a component (a file whose name matches the
// component), not every file that happens to use one of its classes. This makes
// the "does this component have a snippet?" audit meaningful — containers like
// pa-card appear in dozens of files but only cards.html documents the card.
const snippetStems = walk(SNIPPETS, (p) => p.endsWith('.html'))
  .map((f) => f.split(/[\\/]/).pop().replace(/\.html$/, ''));
const demoStems = walk(DEMO_VIEWS, (p) => p.endsWith('.mustache'))
  .map((f) => f.split(/[\\/]/).pop().replace(/\.mustache$/, ''));

// Candidate name fragments for a component: its key + each block minus `pa-`.
function nameCandidates(comp) {
  const set = new Set([comp.key, ...comp.blocks.map((b) => b.replace(/^pa-/, ''))]);
  return [...set];
}
function matchStem(stem, cand) {
  return stem === cand || stem === cand + 's' || cand === stem + 's' ||
    stem.startsWith(cand + '-') || cand.startsWith(stem + '-');
}
function dedicatedDocs(stems, comp, ext) {
  const cands = comp.docMatch || nameCandidates(comp);
  const hits = stems.filter((s) => cands.some((c) => matchStem(s, c)));
  return [...new Set(hits)].sort().map((s) => s + ext);
}

// ---- TAXONOMY: every discovered block must appear in exactly one entry ----
const TAXONOMY = [
  // ---------------- Layout & shell ----------------
  { key: 'layout', name: 'Layout shell', category: 'Layout & shell',
    desc: 'Top-level page frame: header / sidebar / main / footer zones, sticky mode, and the theme light/dark + scroll-lock body hooks.',
    blocks: ['pa-layout', 'pa-mode', 'pa-mode-dark', 'pa-scroll-lock'] },
  { key: 'navbar', name: 'Navbar', category: 'Layout & shell',
    desc: 'Top application bar with start/center/end zones, mobile burger, and profile button.',
    blocks: ['pa-navbar'] },
  { key: 'navbar-search', name: 'Navbar search', category: 'Layout & shell',
    desc: 'Inline search field embedded in the navbar (opens the command palette).',
    blocks: ['pa-navbar-search'] },
  { key: 'app-header', name: 'App header', category: 'Layout & shell',
    desc: 'Branding/title block at the top of the app shell.',
    blocks: ['pa-app-header'] },
  { key: 'page-header', name: 'Page header', category: 'Layout & shell',
    desc: 'Per-page title + actions header below the navbar.',
    blocks: ['pa-page-header'] },
  { key: 'navmenu', name: 'Nav menu', category: 'Layout & shell',
    desc: 'Horizontal navigation menu with dropdowns and priority-driven overflow "more" menu.',
    blocks: ['pa-navmenu'] },
  { key: 'sidebar', name: 'Sidebar', category: 'Layout & shell',
    desc: 'Collapsible side navigation with nested submenus, search, and drag-to-resize (marker + resize handle + resizing/resized body states).',
    blocks: ['pa-sidebar', 'pa-sidebar-resize', 'pa-sidebar-resized', 'pa-sidebar-resizing'] },
  { key: 'footer', name: 'Footer', category: 'Layout & shell',
    desc: 'App footer with start/center/end content zones (container is pa-layout__footer).',
    blocks: ['pa-footer'] },
  { key: 'container', name: 'Width containers', category: 'Layout & shell',
    desc: 'Max-width centering containers (sm/md/lg/xl/2xl).',
    blocks: ['pa-container-sm', 'pa-container-md', 'pa-container-lg', 'pa-container-xl', 'pa-container-2xl'] },
  { key: 'grid', name: 'Grid (row/col)', category: 'Layout & shell',
    desc: 'Flexbox row + column primitives. pa-col-* percentage/responsive variants are generated utilities (see utilities.scss).',
    blocks: ['pa-row', 'pa-col'] },

  // ---------------- Surfaces ----------------
  { key: 'card', name: 'Card', category: 'Surfaces',
    desc: 'Primary content surface. Canonical header = pa-card__title (icon optional) + pa-card__description; pa-card__actions is the one actions slot in header and footer.',
    blocks: ['pa-card'] },
  { key: 'section', name: 'Section', category: 'Surfaces',
    desc: 'Lightweight titled content grouping used inside cards/panels.',
    blocks: ['pa-section', 'pa-section-title'] },
  { key: 'splitter', name: 'Splitter', category: 'Surfaces',
    desc: 'Resizable two-pane split with a draggable gutter and minimize-to-rail behaviour.',
    blocks: ['pa-splitter'] },
  { key: 'modal', name: 'Modal', category: 'Surfaces',
    desc: 'Dialog with backdrop, header/body/footer, size + severity + banded variants, scrollable body.',
    blocks: ['pa-modal'] },
  { key: 'tabs', name: 'Tabs', category: 'Surfaces',
    desc: 'Tabbed panels with vertical, scrollable and overflow-menu overflow handling, plus opt-in multi-line wrap-labels.',
    blocks: ['pa-tabs'] },
  { key: 'detail-panel', name: 'Detail panel', category: 'Surfaces',
    desc: 'Slide-in / docked detail panel (with mobile overlay + drag-resize) and its detail-view master/panel layout.',
    blocks: ['pa-detail-panel', 'pa-detail-panel-resize', 'pa-detail-panel-resizing', 'pa-detail-view'] },
  { key: 'profile-panel', name: 'Profile panel', category: 'Surfaces',
    desc: 'User profile slide-over with avatar, tabs, and overlay.',
    blocks: ['pa-profile-panel'] },
  { key: 'settings-panel', name: 'Settings panel', category: 'Surfaces',
    desc: 'Settings drawer with a toggle trigger.',
    blocks: ['pa-settings-panel'] },
  { key: 'table-card', name: 'Table card', category: 'Surfaces',
    desc: 'Card wrapper specialised for tables: header/actions/body/footer chrome around a data table.',
    blocks: ['pa-table-card'] },

  // ---------------- Forms ----------------
  { key: 'form', name: 'Form layout', category: 'Forms',
    desc: 'Form grouping/layout: groups, horizontal layout, validation state, help text, actions row.',
    blocks: ['pa-form', 'pa-form-actions', 'pa-form-group', 'pa-form-help'] },
  { key: 'input', name: 'Text input', category: 'Forms',
    desc: 'Single-line text input with size (xs–xl) and validation-colour variants.',
    blocks: ['pa-input'] },
  { key: 'textarea', name: 'Textarea', category: 'Forms',
    desc: 'Multi-line text input with size variants.',
    blocks: ['pa-textarea'] },
  { key: 'select', name: 'Select', category: 'Forms',
    desc: 'Native select styled with size + validation-colour variants.',
    blocks: ['pa-select'] },
  { key: 'input-group', name: 'Input group', category: 'Forms',
    desc: 'Input with prepend/append addons.',
    blocks: ['pa-input-group'] },
  { key: 'input-wrapper', name: 'Input wrapper / token field', category: 'Forms',
    desc: 'Wrapper enabling token/tag inputs and virtual-scroll textboxes (search token chips + remove).',
    blocks: ['pa-input-wrapper', 'pa-search-tokens', 'pa-search-token-group', 'pa-search-token-remove', 'pa-virtual-textbox'] },
  { key: 'checkbox', name: 'Checkbox', category: 'Forms',
    desc: 'Custom-styled checkbox (box + label) and checkbox group.',
    blocks: ['pa-checkbox', 'pa-checkbox-group'] },
  { key: 'radio', name: 'Radio', category: 'Forms',
    desc: 'Custom-styled radio and radio group.',
    blocks: ['pa-radio', 'pa-radio-group'] },
  { key: 'checkbox-list', name: 'Checkbox list', category: 'Forms',
    desc: 'Selectable list of checkbox items with grid/columns/compact/striped/bordered layouts and per-item disabled/locked/selected states.',
    blocks: ['pa-checkbox-list'] },
  { key: 'range', name: 'Range slider', category: 'Forms',
    desc: 'Single/dual-thumb range slider with configurable handle styles, ticks and labels.',
    blocks: ['pa-range'] },
  { key: 'range-group', name: 'Range group', category: 'Forms',
    desc: 'Popover panel grouping multiple range sliders with a summary row.',
    blocks: ['pa-range-group'] },
  { key: 'query-editor', name: 'Inline query editor', category: 'Forms',
    desc: 'Tokenised inline query/filter editor with autocomplete and match highlighting.',
    blocks: ['pa-inline-query-editor', 'pa-inline-query-token', 'pa-inline-query-autocomplete', 'pa-search-highlight'] },
  { key: 'filter-card', name: 'Filter card', category: 'Forms',
    desc: 'Card of filter controls with advanced/collapsed rows and loading/disabled states.',
    blocks: ['pa-filter-card'] },

  // ---------------- Buttons & actions ----------------
  { key: 'button', name: 'Button', category: 'Buttons & actions',
    desc: 'Buttons (icon/label/spinner, xs–xl, ripple), button groups, split buttons with menus, and the priority-overflow trigger.',
    blocks: ['pa-btn', 'pa-btn-group', 'pa-btn-split', 'pa-overflow'] },
  { key: 'pager', name: 'Pager', category: 'Buttons & actions',
    desc: 'Pagination controls and a load-more button with spinner.',
    blocks: ['pa-pager', 'pa-load-more'] },
  { key: 'popconfirm', name: 'Popconfirm', category: 'Buttons & actions',
    desc: 'Inline confirmation popover anchored to an action, with placement + compact variants.',
    blocks: ['pa-popconfirm'] },

  // ---------------- Data display ----------------
  { key: 'table', name: 'Table', category: 'Data display',
    desc: 'Data tables: striped, responsive (stacked + grid), row selection, checkbox column, container/panel chrome, and virtual-scroll table.',
    blocks: ['pa-table', 'pa-table-container', 'pa-virtual-table'] },
  { key: 'comparison-table', name: 'Comparison table', category: 'Data display',
    desc: 'Side-by-side feature/plan comparison table.',
    blocks: ['pa-comparison-table'] },
  { key: 'list', name: 'List', category: 'Data display',
    desc: 'Styled basic / ordered / definition lists with severity variants.',
    blocks: ['pa-list', 'pa-list-basic', 'pa-list-ordered', 'pa-list-definition'] },
  { key: 'code', name: 'Code block', category: 'Data display',
    desc: 'Inline + block code with syntax-token classes (keyword/string/number/function/property/comment).',
    blocks: ['pa-code', 'pa-code-block', 'pa-code-keyword', 'pa-code-string', 'pa-code-number', 'pa-code-function', 'pa-code-property', 'pa-code-comment'] },
  { key: 'data-display', name: 'Data display (field lists)', category: 'Data display',
    desc: 'Label/value field lists, description tables, dot-leader rows, property cards, accent grids and banded containers.',
    blocks: ['pa-field', 'pa-field-group', 'pa-fields', 'pa-fields-container', 'pa-desc-table', 'pa-desc-container', 'pa-dot-leaders', 'pa-prop-card', 'pa-accent-grid', 'pa-banded', 'pa-banded-container'] },
  { key: 'statistics', name: 'Statistics / stat cards', category: 'Data display',
    desc: 'Stat blocks (value/label/change/context, severity variants, fit sizing) and the KPI grid layout.',
    blocks: ['pa-stat', 'pa-kpi-grid'] },

  // ---------------- Data viz ----------------
  { key: 'data-viz', name: 'Data-viz primitives', category: 'Data visualization',
    desc: 'Inline chart primitives: bar list, data bar, gauge, heatmap, progress (bar/group/ring), sparkline, stacked bar.',
    blocks: ['pa-bar-list', 'pa-data-bar', 'pa-gauge', 'pa-heatmap', 'pa-progress', 'pa-progress-group', 'pa-progress-ring', 'pa-sparkline', 'pa-stacked-bar'] },
  { key: 'kpi-base', name: 'KPI showcase — shared base', category: 'Data visualization',
    desc: 'Shared KPI chrome (header/footer/detail/live/section head) used across the seven KPI showcase designs.',
    blocks: ['pa-kpi-header', 'pa-kpi-footer', 'pa-kpi-detail', 'pa-kpi-live', 'pa-kpi-sectionhead'] },
  { key: 'kpi-terminal', name: 'KPI showcase — terminal', category: 'Data visualization',
    desc: 'Terminal-style KPI grid with tiles.',
    blocks: ['pa-kpi-terminal', 'pa-kpi-tile'] },
  { key: 'kpi-sparkline-list', name: 'KPI showcase — sparkline list', category: 'Data visualization',
    desc: 'KPI rows each with a sparkline, delta and value.',
    blocks: ['pa-kpi-spark-list', 'pa-kpi-spark-row', 'pa-kpi-spark-wrap', 'pa-kpi-spark-dot'] },
  { key: 'kpi-comparison-gauges', name: 'KPI showcase — comparison gauges', category: 'Data visualization',
    desc: 'KPI gauges laid out for comparison.',
    blocks: ['pa-kpi-gauge', 'pa-kpi-gauge-list'] },
  { key: 'kpi-hero-supporting', name: 'KPI showcase — hero + supporting', category: 'Data visualization',
    desc: 'One hero KPI with a supporting rail of secondary KPIs.',
    blocks: ['pa-kpi-hero-list', 'pa-kpi-hero-main', 'pa-kpi-hero-side'] },
  { key: 'kpi-bento', name: 'KPI showcase — bento', category: 'Data visualization',
    desc: 'Bento-grid arrangement of KPI tiles with a hero tile.',
    blocks: ['pa-kpi-bento', 'pa-kpi-bento-tile'] },
  { key: 'kpi-numeric-strip', name: 'KPI showcase — numeric strip', category: 'Data visualization',
    desc: 'Dense horizontal strip of numeric KPIs with prev/target/delta.',
    blocks: ['pa-kpi-strip'] },
  { key: 'kpi-editorial-minimal', name: 'KPI showcase — editorial minimal', category: 'Data visualization',
    desc: 'Minimal editorial KPI grid, sizeable to N columns.',
    blocks: ['pa-kpi-edit'] },

  // ---------------- Feedback ----------------
  { key: 'alert', name: 'Alert', category: 'Feedback',
    desc: 'Inline severity alert with optional multiline content.',
    blocks: ['pa-alert'] },
  { key: 'callout', name: 'Callout', category: 'Feedback',
    desc: 'Bordered callout box for asides / notes.',
    blocks: ['pa-callout'] },
  { key: 'toast', name: 'Toast', category: 'Feedback',
    desc: 'Transient toast notifications with severity + filled variants, progress bar, and logical-position container.',
    blocks: ['pa-toast', 'pa-toast-container'] },
  { key: 'notifications', name: 'Notifications', category: 'Feedback',
    desc: 'Notification centre: bell badge, dropdown panel and full-page list of notification items.',
    blocks: ['pa-notifications'] },
  { key: 'tooltip', name: 'Tooltip', category: 'Feedback',
    desc: 'CSS + floating tooltips with placement, severity and multiline variants.',
    blocks: ['pa-tooltip', 'pa-tooltip-floating'] },
  { key: 'popover', name: 'Popover', category: 'Feedback',
    desc: 'Generic anchored popover surface.',
    blocks: ['pa-popover'] },
  { key: 'loaders', name: 'Loaders / spinners', category: 'Feedback',
    desc: 'Loading indicators: ring, dots, bars, pulse, wave, centered + overlay wrappers, and a generic spinner.',
    blocks: ['pa-loader-ring', 'pa-loader-dots', 'pa-loader-bars', 'pa-loader-pulse', 'pa-loader-wave', 'pa-loader-center', 'pa-loader-overlay', 'pa-spinner'] },
  { key: 'timeline', name: 'Timeline', category: 'Feedback',
    desc: 'Vertical/columned activity timeline with dated items, severity dots, avatars and comments.',
    blocks: ['pa-timeline'] },

  // ---------------- Interactive & misc ----------------
  { key: 'badge', name: 'Badge', category: 'Interactive & misc',
    desc: 'Status/count badges and badge groups.',
    blocks: ['pa-badge', 'pa-badge-group'] },
  { key: 'label', name: 'Label', category: 'Interactive & misc',
    desc: 'Text labels/tags with an outline variant.',
    blocks: ['pa-label'] },
  { key: 'composite-badge', name: 'Composite badge', category: 'Interactive & misc',
    desc: 'Two-part badge (icon segment + label segment), optionally a button.',
    blocks: ['pa-composite-badge'] },
  { key: 'command-palette', name: 'Command palette', category: 'Interactive & misc',
    desc: 'Cmd-K command palette with search, results, footer, fullscreen mobile mode, autocomplete and a keyboard-shortcut help list.',
    blocks: ['pa-command-palette', 'pa-search-autocomplete', 'pa-shortcut-help'] },
  { key: 'search-results', name: 'Search results', category: 'Interactive & misc',
    desc: 'Search results list with compact/detailed/cards/grouped layouts.',
    blocks: ['pa-search-results'] },
  { key: 'logic-tree', name: 'Logic tree', category: 'Interactive & misc',
    desc: 'Nested boolean logic tree (AND/OR blocks, nodes, logical tokens).',
    blocks: ['pa-logic-tree'] },
  { key: 'file-selector', name: 'File selector', category: 'Interactive & misc',
    desc: 'File dropzone + file list/items with icons, previews, popover and per-file progress.',
    blocks: ['pa-file-dropzone', 'pa-file-dropzone-overlay', 'pa-file-input', 'pa-file-list', 'pa-file-item', 'pa-file-icon', 'pa-file-preview', 'pa-file-preview-grid', 'pa-file-popover', 'pa-file-progress'] },
  { key: 'icon', name: 'Icon', category: 'Interactive & misc',
    desc: 'Mask-based icon element (pa-icon--x etc.).',
    blocks: ['pa-icon'] },

  // ---------------- Utilities & state hooks ----------------
  { key: 'utilities', name: 'Utilities & state hooks', category: 'Utilities & state hooks',
    desc: 'Standalone helper classes (not components): text/link helpers, responsive font hooks, colour helpers, fit-hidden. See utilities.scss for the full utility set (spacing, sizing, pa-col-* percentages, logical margins, etc.).',
    blocks: ['pa-text', 'pa-text-color', 'pa-link', 'pa-fit-hidden', 'pa-font-base', 'pa-font-mobile', 'pa-font-responsive', 'pa-bg-color', 'pa-border-color'] },
];

// Explicit doc homes. Many components are documented in a SHARED category file
// (e.g. navbar+sidebar+footer all live in layout.html) which filename-matching
// can't infer. `null` = intentional true gap (no snippet/demo exists). Anything
// not listed here falls back to filename matching (dedicatedDocs).
const SNIPPET_OF = {
  navbar: 'layout.html', 'app-header': 'layout.html',
  // navbar-search is a navbar/sidebar SHELL element (only the pill's trigger mode
  // involves the palette; --field/--input don't). Its family — the pill + modes
  // and the sidebar counterpart — is documented in layout.html; command-palette.html
  // keeps just the palette + a trigger cross-ref. (SCSS still lives in
  // _command-palette.scss, but the doc home follows the shell structure.)
  'navbar-search': 'layout.html',
  'page-header': 'layout.html', navmenu: 'layout.html', sidebar: 'layout.html',
  footer: 'layout.html', container: 'layout.html',
  input: 'forms.html', textarea: 'forms.html', select: 'forms.html',
  'input-group': 'forms.html', 'input-wrapper': 'forms.html', radio: 'forms.html',
  'query-editor': 'forms.html',
  section: 'cards.html', 'table-card': 'tables.html', pager: 'tables.html',
  // table spans two homes: tables.html (the <table> itself) + virtual-scroll.html
  // (the pa-virtual-table windowed variant). A value may be a string or array.
  table: ['tables.html', 'virtual-scroll.html'],
  popover: 'tooltips.html', label: 'badges.html', 'composite-badge': 'badges.html',
  // kpi.html documents the shared KPI showcase base chrome AND all seven
  // design grammars (terminal / sparkline-list / comparison-gauges /
  // hero-supporting / bento / numeric-strip / editorial-minimal), one section
  // each with its own canonical markup + reference.
  'kpi-base': 'kpi.html',
  'kpi-terminal': 'kpi.html', 'kpi-sparkline-list': 'kpi.html',
  'kpi-comparison-gauges': 'kpi.html', 'kpi-hero-supporting': 'kpi.html',
  'kpi-bento': 'kpi.html', 'kpi-numeric-strip': 'kpi.html',
  'kpi-editorial-minimal': 'kpi.html',
  icon: 'icon.html',
  // true gaps — no dedicated snippet exists yet:
  'settings-panel': null, 'logic-tree': null, 'file-selector': null,
  'data-viz': null,
};
const DEMO_OF = {
  'data-viz': 'data-visualization.mustache', 'kpi-base': 'kpi-dashboard.mustache',
  'logic-tree': null, 'settings-panel': null,
};

// Why a component has no (or empty) snippet — drives the coverage report so a
// gap reads as an intentional decision, not silent drift. Status vocabulary:
//   superseded — a different component/package owns this now; no snippet owed.
//   deferred   — component API not yet stable; a snippet would chase it.
//   todo       — stable enough; a dedicated snippet IS owed (actionable work).
// Anything with no snippet and no entry here defaults to ['todo', …].
const GAP_REASON = {
  'file-selector': ['superseded', 'Superseded by @keenmate/web-dropzone (the demo "File Upload" route renders the web component). Removal candidate — no snippet owed.'],
  'logic-tree':    ['deferred', 'API not yet stable — a snippet would chase a moving target.'],
  'data-viz':      ['deferred', 'D3-driven; a static HTML snippet is too thin to be useful. Documented via demo only.'],
  'settings-panel':['deferred', 'Demo-internal composition; no standalone public contract yet.'],
  'query-editor':  ['deferred', 'Smart-filters family; API not yet stable. Cross-referenced from forms.html only.'],
  // NOTE: icon, navbar-search, kpi-base and the seven kpi-* design showcases now
  // have snippets (icon.html / layout.html / kpi.html) and no longer surface as
  // gaps; their old 'todo' entries were removed once documented (2026-08-24).
};
const DEFAULT_GAP_REASON = ['todo', 'Dedicated snippet owed.'];

// ---- build + validate -----------------------------------------------------
const block2comp = new Map();
for (const c of TAXONOMY) {
  for (const b of c.blocks) {
    if (block2comp.has(b))
      throw new Error(`Block ${b} assigned to both ${block2comp.get(b)} and ${c.key}`);
    block2comp.set(b, c.key);
  }
}

const unassigned = allBlocks.filter((b) => !block2comp.has(b));
if (unassigned.length) {
  console.error('ERROR: blocks discovered in SCSS but not assigned to any component:');
  for (const b of unassigned) console.error('  - ' + b);
  process.exit(1);
}
const phantom = [...block2comp.keys()].filter((b) => !allBlocks.includes(b));
if (phantom.length) {
  console.error('ERROR: taxonomy references blocks that no longer exist in SCSS:');
  for (const b of phantom) console.error('  - ' + b);
  process.exit(1);
}

const components = {};
for (const c of TAXONOMY) {
  const sels = allSelectors.filter((s) => c.blocks.includes(blockOf(s)));
  const blocks = sels.filter((s) => !s.includes('__') && !s.includes('--')).sort();
  const elements = sels.filter((s) => s.includes('__') && !s.includes('--')).sort();
  const modifiers = sels.filter((s) => s.includes('--')).sort();
  // defining partial(s): prefer the file with the bare `.pa-block` base rule;
  // fall back to any leading-selector owner for element-only blocks (e.g. footer).
  const partials = [...new Set(c.blocks.flatMap((b) =>
    [...((bareOwners.get(b) || blockOwners.get(b) || []))]))].sort();
  const snippets = c.key in SNIPPET_OF
    ? (SNIPPET_OF[c.key] ? [].concat(SNIPPET_OF[c.key]) : [])
    : dedicatedDocs(snippetStems, c, '.html');
  const demos = c.key in DEMO_OF
    ? (DEMO_OF[c.key] ? [DEMO_OF[c.key]] : [])
    : dedicatedDocs(demoStems, c, '.mustache');
  components[c.key] = {
    name: c.name,
    category: c.category,
    description: c.desc,
    block: blocks[0] || c.blocks[0],
    blocks,
    elements,
    modifiers,
    partials,
    snippets,
    demos,
    hasSnippet: snippets.length > 0,
  };
}

const manifest = {
  '//': 'AUTO-GENERATED by scripts/build-components-catalog.mjs — do not edit by hand.',
  frameworkVersion: JSON.parse(readFileSync(join(CORE, 'package.json'), 'utf8')).version,
  totals: {
    components: TAXONOMY.length,
    blocks: allBlocks.length,
    selectors: allSelectors.length,
  },
  categories: [...new Set(TAXONOMY.map((c) => c.category))],
  components,
};

writeFileSync(join(CORE, 'components.json'), JSON.stringify(manifest, null, 2) + '\n');

// ---- render COMPONENTS.md -------------------------------------------------
const md = [];
md.push('# Pure Admin — Component Catalog\n');
md.push('> **Auto-generated** by `scripts/build-components-catalog.mjs` from the core SCSS.');
md.push('> Do not edit by hand — re-run the generator after changing any `pa-*` class.');
md.push('> Machine-readable form: [`components.json`](./components.json).\n');
md.push(`Framework version **${manifest.frameworkVersion}** · **${manifest.totals.components}** components · ` +
  `**${manifest.totals.blocks}** blocks · **${manifest.totals.selectors}** class selectors.\n`);
md.push('This catalog is the checklist for validating generated markup in the ' +
  'svelte / phoenix wrapper libraries and for auditing snippet coverage. ' +
  'A ✗ in the *Snippet* column marks a component with **no** `snippets/*.html` reference — a documentation gap.\n');

// coverage summary table
md.push('## Coverage summary\n');
md.push('| Component | Block | Category | Snippet | Demo |');
md.push('|---|---|---|:--:|:--:|');
for (const c of TAXONOMY) {
  const e = components[c.key];
  md.push(`| ${e.name} | \`${e.block}\` | ${e.category} | ${e.hasSnippet ? '✓' : '✗'} | ${e.demos.length ? '✓' : '✗'} |`);
}
md.push('');

// per-category detail
const cats = [...new Set(TAXONOMY.map((c) => c.category))];
for (const cat of cats) {
  md.push(`## ${cat}\n`);
  for (const c of TAXONOMY.filter((x) => x.category === cat)) {
    const e = components[c.key];
    md.push(`### ${e.name} — \`${e.block}\`\n`);
    md.push(e.description + '\n');
    const rows = [];
    rows.push(`- **Blocks:** ${e.blocks.map((x) => `\`${x}\``).join(', ') || '—'}`);
    if (e.elements.length) rows.push(`- **Elements:** ${e.elements.map((x) => `\`${x}\``).join(', ')}`);
    if (e.modifiers.length) rows.push(`- **Modifiers / states:** ${e.modifiers.map((x) => `\`${x}\``).join(', ')}`);
    rows.push(`- **SCSS:** ${e.partials.map((x) => `\`${x}\``).join(', ') || '—'}`);
    rows.push(`- **Snippet:** ${e.snippets.length ? e.snippets.map((x) => `\`${x}\``).join(', ') : '✗ none'}`);
    rows.push(`- **Demo:** ${e.demos.length ? e.demos.map((x) => `\`${x}\``).join(', ') : '✗ none'}`);
    md.push(rows.join('\n') + '\n');
  }
}

writeFileSync(join(CORE, 'COMPONENTS.md'), md.join('\n'));

// ---- snippet coverage sweep ----------------------------------------------
// For every component, measure how many of its catalog selectors (blocks +
// elements + modifiers) literally appear in its mapped snippet file(s). This
// is the "systematic snippet sweep": it flags components whose snippet omits
// real structural modifiers/elements, plus the true no-snippet gaps.
//
// Caveat: loop-generated colour variants (`pa-badge--primary`, `pa-btn--info`,
// …) are emitted from SCSS @each loops, so they are NOT distinct catalog
// selectors and do not count here. 100% structural coverage therefore means
// "every hand-written element/modifier is shown", NOT "every colour is shown".
const snipCache = {};
const readSnip = (f) => {
  if (!(f in snipCache)) {
    try { snipCache[f] = readFileSync(join(SNIPPETS, f), 'utf8'); }
    catch { snipCache[f] = ''; }
  }
  return snipCache[f];
};
const coverage = {};
for (const c of TAXONOMY) {
  const e = components[c.key];
  const sels = [...new Set([...e.blocks, ...e.elements, ...e.modifiers])];
  const text = e.snippets.map(readSnip).join('\n');
  const missing = e.snippets.length ? sels.filter((s) => !text.includes(s)) : sels;
  const covered = sels.length - missing.length;
  coverage[c.key] = {
    total: sels.length,
    covered,
    pct: sels.length ? Math.round((100 * covered) / sels.length) : 100,
    missing,
    // heuristic — does the snippet carry a trailing REFERENCE / CLASSES summary
    // (the badges.html gold-standard shape)?
    hasReferenceBlock: e.snippets.length ? /REFERENCE|CLASSES:/i.test(text) : false,
    // a snippet is assigned but shows none of the component's selectors → the
    // component "has a home" but no actual content there yet.
    contentGap: e.snippets.length > 0 && sels.length > 0 && covered === 0,
  };
}

// ---- render SNIPPET-COVERAGE.md (repo-internal QA artifact; not shipped) ---
const cov = [];
cov.push('# Pure Admin — Snippet Coverage Report\n');
cov.push('> **Auto-generated** by `scripts/build-components-catalog.mjs` (runs with `npm run catalog`).');
cov.push('> Do not edit by hand. This is a maintainer QA artifact — it is *not* shipped in the npm package.\n');
cov.push('The systematic sweep behind the snippet walkthrough: for each `pa-*` component it ' +
  'checks how many of its catalog selectors (blocks + elements + modifiers) actually appear ' +
  'in the snippet a code-gen tool would copy from.\n');
cov.push('**How to read it**');
cov.push('- **Structural coverage** — share of the component\'s catalog selectors present in its snippet. ' +
  'Loop-generated colour variants (`pa-badge--primary`, …) are not catalog selectors, so **100% ≠ ' +
  '"every colour shown"** — it means every hand-written element/modifier is shown.');
cov.push('- **Ref block** — heuristic: does the snippet carry a trailing `REFERENCE` / `CLASSES:` summary ' +
  '(the `badges.html` gold-standard shape: sections → inline modifier docs → scenarios → reference block)?');
cov.push('- **Status** — for gaps: `todo` (snippet owed), `deferred` (API in flux), `superseded` (owned elsewhere).\n');

const covOf = (k) => coverage[k];
const withSnip = TAXONOMY.filter((c) => components[c.key].hasSnippet);
const noSnip = TAXONOMY.filter((c) => !components[c.key].hasSnippet);

// Action queue: has a snippet but < 100% structural coverage or no ref block.
const action = withSnip
  .filter((c) => covOf(c.key).pct < 100 || !covOf(c.key).hasReferenceBlock)
  .sort((a, b) => covOf(a.key).pct - covOf(b.key).pct ||
    covOf(b.key).missing.length - covOf(a.key).missing.length);
cov.push('## Action queue — snippets to uplift (worst first)\n');
cov.push('| Component | Snippet | Coverage | Ref block | Missing selectors |');
cov.push('|---|---|:--:|:--:|---|');
for (const c of action) {
  const e = components[c.key], v = covOf(c.key);
  const miss = v.missing.length ? v.missing.map((x) => `\`${x}\``).join(', ') : '—';
  const flag = v.contentGap ? ' ⚠ content gap' : '';
  cov.push(`| ${e.name} | ${e.snippets.join(', ')} | ${v.covered}/${v.total} (${v.pct}%)${flag} | ` +
    `${v.hasReferenceBlock ? '✓' : '✗'} | ${miss} |`);
}
if (!action.length) cov.push('| _all snippets at full structural coverage_ | | | | |');
cov.push('');

// Gaps: no snippet at all, classified by reason.
cov.push('## Gaps — components with no snippet\n');
cov.push('| Component | Block | Status | Reason |');
cov.push('|---|---|:--:|---|');
for (const c of noSnip.sort((a, b) => {
  const order = { todo: 0, deferred: 1, superseded: 2 };
  const ra = (GAP_REASON[a.key] || DEFAULT_GAP_REASON)[0];
  const rb = (GAP_REASON[b.key] || DEFAULT_GAP_REASON)[0];
  return order[ra] - order[rb];
})) {
  const e = components[c.key];
  const [status, reason] = GAP_REASON[c.key] || DEFAULT_GAP_REASON;
  cov.push(`| ${e.name} | \`${e.block}\` | ${status} | ${reason} |`);
}
cov.push('');

// Full-coverage roll-up.
const full = withSnip.filter((c) => covOf(c.key).pct === 100 && covOf(c.key).hasReferenceBlock);
cov.push('## Full structural coverage + reference block\n');
cov.push(full.length
  ? full.map((c) => `\`${components[c.key].name}\``).join(', ')
  : '_none_');
cov.push('');

writeFileSync(join(CORE, 'SNIPPET-COVERAGE.md'), cov.join('\n') + '\n');

console.log(`OK  ${manifest.totals.components} components · ${manifest.totals.blocks} blocks · ${manifest.totals.selectors} selectors`);
const gaps = TAXONOMY.filter((c) => !components[c.key].hasSnippet);
console.log(`Snippet gaps (${gaps.length}): ${gaps.map((c) => c.key).join(', ')}`);
const todo = gaps.filter((c) => (GAP_REASON[c.key] || DEFAULT_GAP_REASON)[0] === 'todo');
console.log(`  → todo (snippet owed): ${todo.map((c) => c.key).join(', ') || 'none'}`);
console.log(`Snippet coverage: ${action.length} to uplift, ${full.length} at full coverage. See SNIPPET-COVERAGE.md`);
