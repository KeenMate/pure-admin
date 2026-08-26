# Pure Admin — Component Catalog

> **Auto-generated** by `scripts/build-components-catalog.mjs` from the core SCSS.
> Do not edit by hand — re-run the generator after changing any `pa-*` class.
> Machine-readable form: [`components.json`](./components.json).

Framework version **2.9.0-rc15** · **66** components · **166** blocks · **652** class selectors.

This catalog is the checklist for validating generated markup in the svelte / phoenix wrapper libraries and for auditing snippet coverage. A ✗ in the *Snippet* column marks a component with **no** `snippets/*.html` reference — a documentation gap.

## Coverage summary

| Component | Block | Category | Snippet | Demo |
|---|---|---|:--:|:--:|
| Layout shell | `pa-layout` | Layout & shell | ✓ | ✓ |
| Navbar | `pa-navbar` | Layout & shell | ✓ | ✓ |
| Navbar search | `pa-navbar-search` | Layout & shell | ✓ | ✓ |
| App header | `pa-app-header` | Layout & shell | ✓ | ✗ |
| Page header | `pa-page-header` | Layout & shell | ✓ | ✗ |
| Nav menu | `pa-navmenu` | Layout & shell | ✓ | ✗ |
| Sidebar | `pa-sidebar` | Layout & shell | ✓ | ✓ |
| Footer | `pa-footer` | Layout & shell | ✓ | ✗ |
| Width containers | `pa-container-2xl` | Layout & shell | ✓ | ✗ |
| Card | `pa-card` | Surfaces | ✓ | ✓ |
| Section | `pa-section` | Surfaces | ✓ | ✗ |
| Splitter | `pa-splitter` | Surfaces | ✓ | ✓ |
| Modal | `pa-modal` | Surfaces | ✓ | ✓ |
| Tabs | `pa-tabs` | Surfaces | ✓ | ✓ |
| Detail panel | `pa-detail-panel-resize` | Surfaces | ✓ | ✓ |
| Profile panel | `pa-profile-panel` | Surfaces | ✓ | ✗ |
| Settings panel | `pa-settings-panel` | Surfaces | ✗ | ✗ |
| Table card | `pa-table-card` | Surfaces | ✓ | ✗ |
| Form layout | `pa-form` | Forms | ✓ | ✓ |
| Text input | `pa-input` | Forms | ✓ | ✓ |
| Textarea | `pa-textarea` | Forms | ✓ | ✗ |
| Select | `pa-select` | Forms | ✓ | ✗ |
| Input group | `pa-input-group` | Forms | ✓ | ✗ |
| Input wrapper / token field | `pa-input-wrapper` | Forms | ✓ | ✓ |
| Checkbox | `pa-checkbox` | Forms | ✓ | ✓ |
| Radio | `pa-radio` | Forms | ✓ | ✗ |
| Checkbox list | `pa-checkbox-list` | Forms | ✓ | ✓ |
| Range slider | `pa-range` | Forms | ✓ | ✓ |
| Range group | `pa-range-group` | Forms | ✓ | ✓ |
| Inline query editor | `pa-inline-query-autocomplete` | Forms | ✓ | ✓ |
| Filter card | `pa-filter-card` | Forms | ✓ | ✗ |
| Button | `pa-btn` | Buttons & actions | ✓ | ✓ |
| Pager | `pa-load-more` | Buttons & actions | ✓ | ✓ |
| Popconfirm | `pa-popconfirm` | Buttons & actions | ✓ | ✓ |
| Table | `pa-table` | Data display | ✓ | ✓ |
| Comparison table | `pa-comparison-table` | Data display | ✓ | ✓ |
| List | `pa-list` | Data display | ✓ | ✓ |
| Code block | `pa-code` | Data display | ✓ | ✓ |
| Data display (field lists) | `pa-accent-grid` | Data display | ✓ | ✓ |
| Statistics / stat cards | `pa-kpi-grid` | Data display | ✓ | ✓ |
| Data-viz primitives | `pa-bar-list` | Data visualization | ✗ | ✓ |
| KPI showcase — shared base | `pa-kpi-detail` | Data visualization | ✓ | ✓ |
| KPI showcase — terminal | `pa-kpi-tile` | Data visualization | ✓ | ✓ |
| KPI showcase — sparkline list | `pa-kpi-spark-dot` | Data visualization | ✓ | ✓ |
| KPI showcase — comparison gauges | `pa-kpi-gauge` | Data visualization | ✓ | ✓ |
| KPI showcase — hero + supporting | `pa-kpi-hero-list` | Data visualization | ✓ | ✓ |
| KPI showcase — bento | `pa-kpi-bento` | Data visualization | ✓ | ✓ |
| KPI showcase — numeric strip | `pa-kpi-strip` | Data visualization | ✓ | ✓ |
| KPI showcase — editorial minimal | `pa-kpi-edit` | Data visualization | ✓ | ✓ |
| Alert | `pa-alert` | Feedback | ✓ | ✓ |
| Callout | `pa-callout` | Feedback | ✓ | ✓ |
| Toast | `pa-toast` | Feedback | ✓ | ✓ |
| Notifications | `pa-notifications` | Feedback | ✓ | ✓ |
| Tooltip | `pa-tooltip` | Feedback | ✓ | ✓ |
| Popover | `pa-popover` | Feedback | ✓ | ✗ |
| Loaders / spinners | `pa-loader-bars` | Feedback | ✓ | ✓ |
| Timeline | `pa-timeline` | Feedback | ✓ | ✓ |
| Badge | `pa-badge` | Interactive & misc | ✓ | ✓ |
| Label | `pa-label` | Interactive & misc | ✓ | ✗ |
| Composite badge | `pa-composite-badge` | Interactive & misc | ✓ | ✗ |
| Command palette | `pa-command-palette` | Interactive & misc | ✓ | ✓ |
| Search results | `pa-search-results` | Interactive & misc | ✓ | ✓ |
| Logic tree | `pa-logic-tree` | Interactive & misc | ✗ | ✗ |
| File selector | `pa-file-dropzone` | Interactive & misc | ✗ | ✓ |
| Icon | `pa-icon` | Interactive & misc | ✓ | ✗ |
| Utilities & state hooks | `pa-bg-color` | Utilities & state hooks | ✓ | ✗ |

## Layout & shell

### Layout shell — `pa-layout`

Top-level page frame: header / sidebar / main / footer zones, sticky mode, and the scroll-lock body hook. (Light/dark mode scopes are now the foundation-owned .pc-mode-* classes — see pure-css.)

- **Blocks:** `pa-layout`, `pa-scroll-lock`
- **Elements:** `pa-layout__content`, `pa-layout__footer`, `pa-layout__inner`, `pa-layout__main`, `pa-layout__sidebar`
- **Modifiers / states:** `pa-layout--sticky`, `pa-layout__sidebar--icon-collapse`
- **SCSS:** `core-components/_utilities.scss`, `core-components/layout/_layout-container.scss`
- **Snippet:** `layout.html`
- **Demo:** `layout.mustache`, `layouts.mustache`

### Navbar — `pa-navbar`

Top application bar with start/center/end zones, mobile burger, and profile button.

- **Blocks:** `pa-navbar`
- **Elements:** `pa-navbar__burger`, `pa-navbar__center`, `pa-navbar__end`, `pa-navbar__inner`, `pa-navbar__profile-btn`, `pa-navbar__profile-name`, `pa-navbar__start`
- **SCSS:** `core-components/layout/_navbar.scss`
- **Snippet:** `layout.html`
- **Demo:** `navbar.mustache`

### Navbar search — `pa-navbar-search`

Inline search field embedded in the navbar (opens the command palette).

- **Blocks:** `pa-navbar-search`
- **Elements:** `pa-navbar-search__icon`
- **Modifiers / states:** `pa-navbar-search--field`, `pa-navbar-search--input`
- **SCSS:** `core-components/_command-palette.scss`
- **Snippet:** `layout.html`
- **Demo:** `navbar.mustache`

### App header — `pa-app-header`

Branding/title block at the top of the app shell.

- **Blocks:** `pa-app-header`
- **SCSS:** `core-components/layout/_navbar-elements.scss`
- **Snippet:** `layout.html`
- **Demo:** ✗ none

### Page header — `pa-page-header`

Per-page title + actions header below the navbar.

- **Blocks:** `pa-page-header`
- **SCSS:** `core-components/layout/_navbar-elements.scss`
- **Snippet:** `layout.html`
- **Demo:** ✗ none

### Nav menu — `pa-navmenu`

Horizontal navigation menu with dropdowns and priority-driven overflow "more" menu.

- **Blocks:** `pa-navmenu`
- **Elements:** `pa-navmenu__dropdown`
- **Modifiers / states:** `pa-navmenu__item--active`, `pa-navmenu__item--has-dropdown`, `pa-navmenu__more-menu--open`
- **SCSS:** `core-components/layout/_layout-responsive.scss`, `core-components/layout/_navbar-elements.scss`
- **Snippet:** `layout.html`
- **Demo:** ✗ none

### Sidebar — `pa-sidebar`

Collapsible side navigation with nested submenus, search, and drag-to-resize (marker + resize handle + resizing/resized body states).

- **Blocks:** `pa-sidebar`, `pa-sidebar-resize`, `pa-sidebar-resized`, `pa-sidebar-resizing`
- **Elements:** `pa-sidebar__chevron`, `pa-sidebar__icon`, `pa-sidebar__item`, `pa-sidebar__label`, `pa-sidebar__link`, `pa-sidebar__nav`, `pa-sidebar__search-field`, `pa-sidebar__search-icon`, `pa-sidebar__submenu`, `pa-sidebar__toggle`
- **Modifiers / states:** `pa-sidebar__item--open`
- **SCSS:** `core-components/layout/_layout-responsive.scss`, `core-components/layout/_sidebar.scss`
- **Snippet:** `layout.html`
- **Demo:** `sidebar.mustache`

### Footer — `pa-footer`

App footer with start/center/end content zones (container is pa-layout__footer).

- **Blocks:** —
- **Elements:** `pa-footer__center`, `pa-footer__end`, `pa-footer__start`
- **SCSS:** `core-components/layout/_layout-container.scss`
- **Snippet:** `layout.html`
- **Demo:** ✗ none

### Width containers — `pa-container-2xl`

Max-width centering containers (sm/md/lg/xl/2xl).

- **Blocks:** `pa-container-2xl`, `pa-container-lg`, `pa-container-md`, `pa-container-sm`, `pa-container-xl`
- **SCSS:** —
- **Snippet:** `layout.html`
- **Demo:** ✗ none

## Surfaces

### Card — `pa-card`

Primary content surface. Canonical header = pa-card__title (icon optional) + pa-card__description; pa-card__actions is the one actions slot in header and footer.

- **Blocks:** `pa-card`
- **Elements:** `pa-card__actions`, `pa-card__actions-collapsed`, `pa-card__actions-full`, `pa-card__body`, `pa-card__description`, `pa-card__footer`, `pa-card__header`, `pa-card__meta`, `pa-card__tab`, `pa-card__title`, `pa-card__title-text`
- **Modifiers / states:** `pa-card__actions--overflow`, `pa-card__actions--responsive`, `pa-card__header--underline-color`, `pa-card__header--underline-danger`, `pa-card__header--underline-info`, `pa-card__header--underline-success`, `pa-card__header--underline-warning`
- **SCSS:** `core-components/_cards.scss`
- **Snippet:** `cards.html`
- **Demo:** `cards.mustache`

### Section — `pa-section`

Lightweight titled content grouping used inside cards/panels.

- **Blocks:** `pa-section`, `pa-section-title`
- **SCSS:** `core-components/_cards.scss`
- **Snippet:** `cards.html`
- **Demo:** ✗ none

### Splitter — `pa-splitter`

Resizable two-pane split with a draggable gutter and minimize-to-rail behaviour.

- **Blocks:** `pa-splitter`
- **Elements:** `pa-splitter__gutter`, `pa-splitter__pane`
- **Modifiers / states:** `pa-splitter--minimize-mirror`, `pa-splitter__gutter--active`, `pa-splitter__pane--minimized`
- **SCSS:** `core-components/_splitter.scss`
- **Snippet:** `splitter.html`
- **Demo:** `splitter.mustache`

### Modal — `pa-modal`

Dialog with backdrop, header/body/footer, size + severity + banded variants, scrollable body.

- **Blocks:** `pa-modal`
- **Elements:** `pa-modal__backdrop`, `pa-modal__body`, `pa-modal__container`, `pa-modal__footer`, `pa-modal__header`, `pa-modal__title`
- **Modifiers / states:** `pa-modal--banded`, `pa-modal--danger`, `pa-modal--info`, `pa-modal--primary`, `pa-modal--show`, `pa-modal--success`, `pa-modal--top`, `pa-modal--warning`, `pa-modal__body--scrollable`
- **SCSS:** `core-components/_modals.scss`
- **Snippet:** `modal-dialogs.html`, `modals.html`
- **Demo:** `modal-dialogs.mustache`, `modals.mustache`

### Tabs — `pa-tabs`

Tabbed panels with vertical, scrollable and overflow-menu overflow handling, plus opt-in multi-line wrap-labels.

- **Blocks:** `pa-tabs`
- **Elements:** `pa-tabs__content`, `pa-tabs__item`, `pa-tabs__overflow`, `pa-tabs__overflow-menu`, `pa-tabs__overflow-toggle`, `pa-tabs__panel`, `pa-tabs__scroll-btn`, `pa-tabs__scroll-container`
- **Modifiers / states:** `pa-tabs--vertical`
- **SCSS:** `core-components/_profile.scss`, `core-components/_tabs.scss`
- **Snippet:** `tabs.html`
- **Demo:** `tabs.mustache`

### Detail panel — `pa-detail-panel-resize`

Slide-in / docked detail panel (with mobile overlay + drag-resize) and its detail-view master/panel layout.

- **Blocks:** `pa-detail-panel-resize`, `pa-detail-panel-resizing`, `pa-detail-view`
- **Elements:** `pa-detail-panel__body`, `pa-detail-panel__close`, `pa-detail-panel__content`, `pa-detail-panel__footer`, `pa-detail-panel__header`, `pa-detail-panel__overlay`, `pa-detail-panel__tabs`, `pa-detail-panel__title`, `pa-detail-view__main`, `pa-detail-view__overlay`, `pa-detail-view__panel`
- **Modifiers / states:** `pa-detail-panel--mobile-overlay`, `pa-detail-panel--open`, `pa-detail-panel--overlay`, `pa-detail-view--overlay`
- **SCSS:** `core-components/_detail-panel.scss`, `core-components/_tables.scss`
- **Snippet:** `detail-panel.html`
- **Demo:** `detail-panel.mustache`

### Profile panel — `pa-profile-panel`

User profile slide-over with avatar, tabs, and overlay.

- **Blocks:** `pa-profile-panel`
- **Elements:** `pa-profile-panel__avatar`, `pa-profile-panel__content`, `pa-profile-panel__overlay`, `pa-profile-panel__tab-text`
- **SCSS:** `core-components/_profile.scss`
- **Snippet:** `profile.html`
- **Demo:** ✗ none

### Settings panel — `pa-settings-panel`

Settings drawer with a toggle trigger.

- **Blocks:** `pa-settings-panel`
- **Elements:** `pa-settings-panel__toggle`
- **SCSS:** `core-components/_settings-panel.scss`
- **Snippet:** ✗ none
- **Demo:** ✗ none

### Table card — `pa-table-card`

Card wrapper specialised for tables: header/actions/body/footer chrome around a data table.

- **Blocks:** `pa-table-card`
- **Elements:** `pa-table-card__actions`, `pa-table-card__body`, `pa-table-card__footer`, `pa-table-card__header`
- **SCSS:** `core-components/_tables.scss`
- **Snippet:** `tables.html`
- **Demo:** ✗ none

## Forms

### Form layout — `pa-form`

Form grouping/layout: groups, horizontal layout, validation state, help text, actions row.

- **Blocks:** `pa-form`, `pa-form-actions`, `pa-form-group`, `pa-form-help`
- **Modifiers / states:** `pa-form-group--error`, `pa-form-group--horizontal`, `pa-form-group--success`, `pa-form-group--warning`, `pa-form-help--color`
- **SCSS:** `core-components/_utilities.scss`, `core-components/forms/_form-layout.scss`, `core-components/forms/_form-states.scss`
- **Snippet:** `forms.html`
- **Demo:** `form-demo.mustache`, `forms.mustache`

### Text input — `pa-input`

Single-line text input with size (xs–xl) and validation-colour variants.

- **Blocks:** `pa-input`
- **Modifiers / states:** `pa-input--color`, `pa-input--error`, `pa-input--lg`, `pa-input--sm`, `pa-input--success`, `pa-input--warning`, `pa-input--xl`, `pa-input--xs`
- **SCSS:** `core-components/forms/_form-inputs.scss`, `core-components/forms/_form-states.scss`, `core-components/forms/_input-groups.scss`, `core-components/forms/_input-wrapper.scss`
- **Snippet:** `forms.html`
- **Demo:** `inputs.mustache`

### Textarea — `pa-textarea`

Multi-line text input with size variants.

- **Blocks:** `pa-textarea`
- **Modifiers / states:** `pa-textarea--color`, `pa-textarea--lg`, `pa-textarea--sm`, `pa-textarea--xl`, `pa-textarea--xs`
- **SCSS:** `core-components/forms/_form-inputs.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Select — `pa-select`

Native select styled with size + validation-colour variants.

- **Blocks:** `pa-select`
- **Modifiers / states:** `pa-select--color`, `pa-select--error`, `pa-select--lg`, `pa-select--sm`, `pa-select--success`, `pa-select--warning`, `pa-select--xl`, `pa-select--xs`
- **SCSS:** `core-components/forms/_form-inputs.scss`, `core-components/forms/_form-states.scss`, `core-components/forms/_input-wrapper.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Input group — `pa-input-group`

Input with prepend/append addons.

- **Blocks:** `pa-input-group`
- **Elements:** `pa-input-group__append`, `pa-input-group__prepend`
- **SCSS:** `core-components/forms/_input-groups.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Input wrapper / token field — `pa-input-wrapper`

Wrapper enabling token/tag inputs and virtual-scroll textboxes (search token chips + remove).

- **Blocks:** `pa-input-wrapper`, `pa-search-token-group`, `pa-search-token-remove`, `pa-search-tokens`, `pa-virtual-textbox`
- **SCSS:** `core-components/forms/_input-wrapper.scss`, `core-components/forms/_query-editor.scss`
- **Snippet:** `forms.html`
- **Demo:** `search.mustache`

### Checkbox — `pa-checkbox`

Custom-styled checkbox (box + label) and checkbox group.

- **Blocks:** `pa-checkbox`, `pa-checkbox-group`
- **Elements:** `pa-checkbox__box`, `pa-checkbox__label`
- **SCSS:** `core-components/_checkbox-lists.scss`, `core-components/forms/_checkboxes-radios.scss`
- **Snippet:** `checkbox-lists.html`
- **Demo:** `checkbox-lists.mustache`

### Radio — `pa-radio`

Custom-styled radio and radio group.

- **Blocks:** `pa-radio`, `pa-radio-group`
- **Elements:** `pa-radio__label`
- **SCSS:** `core-components/forms/_checkboxes-radios.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Checkbox list — `pa-checkbox-list`

Selectable list of checkbox items with grid/columns/compact/striped/bordered layouts and per-item disabled/locked/selected states.

- **Blocks:** `pa-checkbox-list`
- **Elements:** `pa-checkbox-list__actions`, `pa-checkbox-list__checkbox`, `pa-checkbox-list__item`, `pa-checkbox-list__label`, `pa-checkbox-list__text`
- **Modifiers / states:** `pa-checkbox-list--2col`, `pa-checkbox-list--3col`, `pa-checkbox-list--bordered`, `pa-checkbox-list--compact`, `pa-checkbox-list--grid`, `pa-checkbox-list--inline`, `pa-checkbox-list--striped`, `pa-checkbox-list__item--disabled`, `pa-checkbox-list__item--locked`, `pa-checkbox-list__item--selected`
- **SCSS:** `core-components/_checkbox-lists.scss`
- **Snippet:** `checkbox-lists.html`
- **Demo:** `checkbox-lists.mustache`

### Range slider — `pa-range`

Single/dual-thumb range slider with configurable handle styles, ticks and labels.

- **Blocks:** `pa-range`
- **Elements:** `pa-range__fill`, `pa-range__rail`, `pa-range__thumb`, `pa-range__tick`, `pa-range__tick-label`, `pa-range__tick-labels`, `pa-range__ticks`, `pa-range__track`
- **Modifiers / states:** `pa-range--disabled`, `pa-range--handle-arrow`, `pa-range--handle-bar`, `pa-range--handle-needle`, `pa-range--handle-rect`, `pa-range--single`, `pa-range--ticks-labeled`, `pa-range__thumb--grabbing`, `pa-range__thumb--min`, `pa-range__tick--major`
- **SCSS:** `core-components/_range-group.scss`
- **Snippet:** `range-group.html`
- **Demo:** `range-group.mustache`

### Range group — `pa-range-group`

Popover panel grouping multiple range sliders with a summary row.

- **Blocks:** `pa-range-group`
- **Elements:** `pa-range-group__actions`, `pa-range-group__caret`, `pa-range-group__panel`, `pa-range-group__row`, `pa-range-group__row-head`, `pa-range-group__row-label`, `pa-range-group__row-value`, `pa-range-group__seg-label`, `pa-range-group__seg-sep`, `pa-range-group__seg-value`, `pa-range-group__summary`, `pa-range-group__toggle`
- **Modifiers / states:** `pa-range-group--open`, `pa-range-group__panel--open`, `pa-range-group__row-value--empty`, `pa-range-group__seg-value--empty`
- **SCSS:** `core-components/_range-group.scss`
- **Snippet:** `range-group.html`
- **Demo:** `range-group.mustache`

### Inline query editor — `pa-inline-query-autocomplete`

Tokenised inline query/filter editor with autocomplete and match highlighting.

- **Blocks:** `pa-inline-query-autocomplete`, `pa-inline-query-editor`, `pa-inline-query-token`, `pa-search-highlight`
- **Modifiers / states:** `pa-inline-query-token--invalid`
- **SCSS:** `core-components/forms/_query-editor.scss`
- **Snippet:** `forms.html`
- **Demo:** `search.mustache`

### Filter card — `pa-filter-card`

Card of filter controls with advanced/collapsed rows and loading/disabled states.

- **Blocks:** —
- **Elements:** `pa-filter-card__actions`, `pa-filter-card__advanced`, `pa-filter-card__advanced-actions`, `pa-filter-card__filters`, `pa-filter-card__row`
- **Modifiers / states:** `pa-filter-card--disabled`, `pa-filter-card--loading`
- **SCSS:** `core-components/_filter-card.scss`
- **Snippet:** `filter-card.html`
- **Demo:** ✗ none

## Buttons & actions

### Button — `pa-btn`

Buttons (icon/label/spinner, xs–xl, ripple), button groups, split buttons with menus, and the priority-overflow trigger.

- **Blocks:** `pa-btn`, `pa-btn-group`, `pa-btn-split`, `pa-overflow`
- **Elements:** `pa-btn-split__group-label`, `pa-btn-split__item`, `pa-btn-split__menu`, `pa-btn-split__menu-inner`, `pa-btn-split__toggle`, `pa-btn__icon`, `pa-btn__label`, `pa-btn__spinner`, `pa-overflow__trigger`
- **Modifiers / states:** `pa-btn--lg`, `pa-btn--ripple-active`, `pa-btn--sm`, `pa-btn--xl`, `pa-btn--xs`, `pa-btn-split--in-overflow`
- **SCSS:** `core-components/_buttons.scss`, `core-components/_cards.scss`, `core-components/_overflow.scss`, `core-components/_popconfirm.scss`, `core-components/_tables.scss`
- **Snippet:** `buttons.html`
- **Demo:** `buttons.mustache`, `overflow.mustache`

### Pager — `pa-load-more`

Pagination controls and a load-more button with spinner.

- **Blocks:** `pa-load-more`, `pa-pager`
- **Elements:** `pa-load-more__spinner`
- **SCSS:** `core-components/_pagers.scss`
- **Snippet:** `tables.html`
- **Demo:** `pagers.mustache`

### Popconfirm — `pa-popconfirm`

Inline confirmation popover anchored to an action, with placement + compact variants.

- **Blocks:** `pa-popconfirm`
- **Elements:** `pa-popconfirm__actions`, `pa-popconfirm__arrow`, `pa-popconfirm__content`, `pa-popconfirm__icon`, `pa-popconfirm__message`
- **Modifiers / states:** `pa-popconfirm--bottom`, `pa-popconfirm--compact`, `pa-popconfirm--end`, `pa-popconfirm--start`, `pa-popconfirm--top`
- **SCSS:** `core-components/_popconfirm.scss`
- **Snippet:** `popconfirm.html`
- **Demo:** `popconfirm.mustache`

## Data display

### Table — `pa-table`

Data tables: striped, responsive (stacked + grid), row selection, checkbox column, container/panel chrome, and virtual-scroll table.

- **Blocks:** `pa-table`, `pa-table-container`, `pa-virtual-table`
- **Elements:** `pa-table__checkbox-col`, `pa-virtual-table__body`, `pa-virtual-table__cell`, `pa-virtual-table__header`, `pa-virtual-table__header-cell`, `pa-virtual-table__row`
- **Modifiers / states:** `pa-table--responsive`, `pa-table--responsive-grid`, `pa-table--striped`, `pa-table-container--panel`, `pa-table__row--selected`
- **SCSS:** `core-components/_checkbox-lists.scss`, `core-components/_detail-panel.scss`, `core-components/_tables.scss`, `core-components/_utilities.scss`
- **Snippet:** `tables.html`, `virtual-scroll.html`
- **Demo:** `table-filters.mustache`, `table-multi-select.mustache`, `tables.mustache`

### Comparison table — `pa-comparison-table`

Side-by-side feature/plan comparison table.

- **Blocks:** `pa-comparison-table`
- **SCSS:** `core-components/_comparison.scss`
- **Snippet:** `comparison.html`
- **Demo:** `comparison.mustache`

### List — `pa-list`

Styled basic / ordered / definition lists with severity variants.

- **Blocks:** `pa-list`, `pa-list-basic`, `pa-list-definition`, `pa-list-ordered`
- **Modifiers / states:** `pa-list-basic--danger`, `pa-list-basic--info`, `pa-list-basic--warning`
- **SCSS:** `core-components/_lists.scss`
- **Snippet:** `lists.html`
- **Demo:** `lists.mustache`

### Code block — `pa-code`

Inline + block code with syntax-token classes (keyword/string/number/function/property/comment).

- **Blocks:** `pa-code`, `pa-code-block`, `pa-code-comment`, `pa-code-function`, `pa-code-keyword`, `pa-code-number`, `pa-code-property`, `pa-code-string`
- **SCSS:** `core-components/_code.scss`
- **Snippet:** `code.html`
- **Demo:** `code.mustache`

### Data display (field lists) — `pa-accent-grid`

Label/value field lists, description tables, dot-leader rows, property cards, accent grids and banded containers.

- **Blocks:** `pa-accent-grid`, `pa-banded`, `pa-banded-container`, `pa-desc-container`, `pa-desc-table`, `pa-dot-leaders`, `pa-field`, `pa-field-group`, `pa-fields`, `pa-fields-container`, `pa-prop-card`
- **Elements:** `pa-accent-grid__copy`, `pa-banded__copy`, `pa-desc-table__copy`, `pa-desc-table__label`, `pa-desc-table__value`, `pa-field__copy`, `pa-field__label`, `pa-field__value`, `pa-prop-card__copy`
- **Modifiers / states:** `pa-desc-table--cols-2`, `pa-desc-table__value--full`, `pa-fields--filled`
- **SCSS:** `core-components/_data-display.scss`
- **Snippet:** `data-display.html`
- **Demo:** `data-display.mustache`, `data-display-2.mustache`

### Statistics / stat cards — `pa-kpi-grid`

Stat blocks (value/label/change/context, severity variants, fit sizing) and the KPI grid layout.

- **Blocks:** `pa-kpi-grid`, `pa-stat`
- **Elements:** `pa-stat__change`, `pa-stat__context`, `pa-stat__group`, `pa-stat__label`, `pa-stat__meta`, `pa-stat__number`, `pa-stat__slot`, `pa-stat__symbol`, `pa-stat__value`
- **Modifiers / states:** `pa-stat--danger`, `pa-stat--fit-wide`, `pa-stat--info`, `pa-stat--primary`, `pa-stat--secondary`, `pa-stat--success`, `pa-stat--warning`
- **SCSS:** `core-components/_statistics.scss`
- **Snippet:** `kpi.html`, `statistics.html`
- **Demo:** `stat-fit-lab.mustache`

## Data visualization

### Data-viz primitives — `pa-bar-list`

Inline chart primitives: bar list, data bar, gauge, heatmap, progress (bar/group/ring), sparkline, stacked bar.

- **Blocks:** `pa-bar-list`, `pa-data-bar`, `pa-gauge`, `pa-heatmap`, `pa-progress`, `pa-progress-group`, `pa-progress-ring`, `pa-sparkline`, `pa-stacked-bar`
- **Elements:** `pa-bar-list__bar`, `pa-bar-list__item`, `pa-bar-list__label`, `pa-bar-list__value`, `pa-data-bar__fill`, `pa-heatmap__cell`, `pa-progress-ring__label`, `pa-progress-ring__value`, `pa-progress__fill`, `pa-sparkline__bar`
- **SCSS:** `core-components/_data-viz.scss`
- **Snippet:** ✗ none
- **Demo:** `data-visualization.mustache`

### KPI showcase — shared base — `pa-kpi-detail`

Shared KPI chrome (header/footer/detail/live/section head) used across the seven KPI showcase designs.

- **Blocks:** `pa-kpi-detail`, `pa-kpi-footer`, `pa-kpi-header`, `pa-kpi-live`, `pa-kpi-sectionhead`
- **SCSS:** `core-components/_kpi-base.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-dashboard.mustache`

### KPI showcase — terminal — `pa-kpi-tile`

Terminal-style KPI grid with tiles.

- **Blocks:** `pa-kpi-tile`
- **Elements:** `pa-kpi-terminal__body`, `pa-kpi-terminal__controls`, `pa-kpi-terminal__grid`, `pa-kpi-terminal__pane`, `pa-kpi-terminal__tab`, `pa-kpi-terminal__tabs`, `pa-kpi-tile__delta`, `pa-kpi-tile__head`, `pa-kpi-tile__id`, `pa-kpi-tile__label`, `pa-kpi-tile__num`, `pa-kpi-tile__prev`, `pa-kpi-tile__spark`, `pa-kpi-tile__status`, `pa-kpi-tile__unit`, `pa-kpi-tile__value`, `pa-kpi-tile__values`
- **Modifiers / states:** `pa-kpi-terminal__grid--2col`
- **SCSS:** `core-components/_kpi-terminal.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-terminal-grid.mustache`

### KPI showcase — sparkline list — `pa-kpi-spark-dot`

KPI rows each with a sparkline, delta and value.

- **Blocks:** `pa-kpi-spark-dot`, `pa-kpi-spark-list`, `pa-kpi-spark-row`, `pa-kpi-spark-wrap`
- **Elements:** `pa-kpi-spark-list__body`, `pa-kpi-spark-row__chart`, `pa-kpi-spark-row__delta`, `pa-kpi-spark-row__label`, `pa-kpi-spark-row__num`, `pa-kpi-spark-row__unit`, `pa-kpi-spark-row__value`
- **Modifiers / states:** `pa-kpi-spark-list--chart-first`, `pa-kpi-spark-list--no-delta`
- **SCSS:** `core-components/_kpi-base.scss`, `core-components/_kpi-sparkline-list.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-sparkline-list.mustache`

### KPI showcase — comparison gauges — `pa-kpi-gauge`

KPI gauges laid out for comparison.

- **Blocks:** `pa-kpi-gauge`
- **Elements:** `pa-kpi-gauge-list__body`, `pa-kpi-gauge-list__grid`, `pa-kpi-gauge__bar`, `pa-kpi-gauge__fill`, `pa-kpi-gauge__head`, `pa-kpi-gauge__label`, `pa-kpi-gauge__num`, `pa-kpi-gauge__scale`, `pa-kpi-gauge__unit`, `pa-kpi-gauge__value`
- **Modifiers / states:** `pa-kpi-gauge-list__grid--2col`, `pa-kpi-gauge-list__grid--max-2`, `pa-kpi-gauge-list__grid--max-3`, `pa-kpi-gauge-list__grid--max-4`, `pa-kpi-gauge-list__grid--max-5`, `pa-kpi-gauge-list__grid--max-6`
- **SCSS:** `core-components/_kpi-comparison-gauges.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-comparison-gauges.mustache`

### KPI showcase — hero + supporting — `pa-kpi-hero-list`

One hero KPI with a supporting rail of secondary KPIs.

- **Blocks:** `pa-kpi-hero-list`, `pa-kpi-hero-main`, `pa-kpi-hero-side`
- **Elements:** `pa-kpi-hero-list__body`, `pa-kpi-hero-list__layout`, `pa-kpi-hero-list__rail`, `pa-kpi-hero-main__chart`, `pa-kpi-hero-main__chart-svg`, `pa-kpi-hero-main__delta`, `pa-kpi-hero-main__label`, `pa-kpi-hero-main__meta`, `pa-kpi-hero-main__num`, `pa-kpi-hero-main__period`, `pa-kpi-hero-main__target`, `pa-kpi-hero-main__unit`, `pa-kpi-hero-main__value`, `pa-kpi-hero-side__delta`, `pa-kpi-hero-side__label`, `pa-kpi-hero-side__num`, `pa-kpi-hero-side__unit`, `pa-kpi-hero-side__value`
- **Modifiers / states:** `pa-kpi-hero-list__layout--hero-2-3`, `pa-kpi-hero-list__layout--hero-3-4`
- **SCSS:** `core-components/_kpi-hero-supporting.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-hero-supporting.mustache`

### KPI showcase — bento — `pa-kpi-bento`

Bento-grid arrangement of KPI tiles with a hero tile.

- **Blocks:** `pa-kpi-bento`, `pa-kpi-bento-tile`
- **Elements:** `pa-kpi-bento-tile__chart`, `pa-kpi-bento-tile__chart-svg`, `pa-kpi-bento-tile__delta`, `pa-kpi-bento-tile__label`, `pa-kpi-bento-tile__num`, `pa-kpi-bento-tile__unit`, `pa-kpi-bento-tile__value`, `pa-kpi-bento__body`, `pa-kpi-bento__grid`
- **Modifiers / states:** `pa-kpi-bento-tile--hero`, `pa-kpi-bento__grid--5-tile`, `pa-kpi-bento__grid--hero-right`
- **SCSS:** `core-components/_kpi-bento.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-bento.mustache`

### KPI showcase — numeric strip — `pa-kpi-strip`

Dense horizontal strip of numeric KPIs with prev/target/delta.

- **Blocks:** —
- **Elements:** `pa-kpi-strip__bar`, `pa-kpi-strip__bar-pct`, `pa-kpi-strip__body`, `pa-kpi-strip__delta`, `pa-kpi-strip__fill`, `pa-kpi-strip__head`, `pa-kpi-strip__head-row`, `pa-kpi-strip__metric`, `pa-kpi-strip__now`, `pa-kpi-strip__num`, `pa-kpi-strip__prev`, `pa-kpi-strip__row`, `pa-kpi-strip__target`, `pa-kpi-strip__unit`
- **Modifiers / states:** `pa-kpi-strip--no-delta`, `pa-kpi-strip--no-prev`, `pa-kpi-strip--no-target`, `pa-kpi-strip__head--delta`, `pa-kpi-strip__head--prev`, `pa-kpi-strip__head--target`
- **SCSS:** `core-components/_kpi-numeric-strip.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-numeric-strip.mustache`

### KPI showcase — editorial minimal — `pa-kpi-edit`

Minimal editorial KPI grid, sizeable to N columns.

- **Blocks:** —
- **Elements:** `pa-kpi-edit__body`, `pa-kpi-edit__delta`, `pa-kpi-edit__grid`, `pa-kpi-edit__label`, `pa-kpi-edit__meta`, `pa-kpi-edit__num`, `pa-kpi-edit__target`, `pa-kpi-edit__tile`, `pa-kpi-edit__unit`, `pa-kpi-edit__value`
- **Modifiers / states:** `pa-kpi-edit__grid--2col`, `pa-kpi-edit__grid--max-2`, `pa-kpi-edit__grid--max-3`, `pa-kpi-edit__grid--max-4`, `pa-kpi-edit__grid--max-5`, `pa-kpi-edit__grid--max-6`
- **SCSS:** `core-components/_kpi-editorial-minimal.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-editorial-minimal.mustache`

## Feedback

### Alert — `pa-alert`

Inline severity alert with optional multiline content.

- **Blocks:** `pa-alert`
- **Elements:** `pa-alert__content`
- **Modifiers / states:** `pa-alert--multiline`
- **SCSS:** `core-components/_alerts.scss`
- **Snippet:** `alerts.html`
- **Demo:** `alerts.mustache`

### Callout — `pa-callout`

Bordered callout box for asides / notes.

- **Blocks:** `pa-callout`
- **SCSS:** `core-components/_callouts.scss`
- **Snippet:** `callouts.html`
- **Demo:** `callouts.mustache`

### Toast — `pa-toast`

Transient toast notifications with severity + filled variants, progress bar, and logical-position container.

- **Blocks:** `pa-toast`, `pa-toast-container`
- **Elements:** `pa-toast__actions`, `pa-toast__close`, `pa-toast__content`, `pa-toast__icon`, `pa-toast__message`, `pa-toast__progress`, `pa-toast__title`
- **Modifiers / states:** `pa-toast--color`, `pa-toast--danger`, `pa-toast--filled-color`, `pa-toast--filled-danger`, `pa-toast--filled-info`, `pa-toast--filled-primary`, `pa-toast--filled-success`, `pa-toast--filled-warning`, `pa-toast--hide`, `pa-toast--info`, `pa-toast--primary`, `pa-toast--show`, `pa-toast--success`, `pa-toast--warning`, `pa-toast-container--bottom-center`, `pa-toast-container--bottom-end`, `pa-toast-container--bottom-start`, `pa-toast-container--top-center`, `pa-toast-container--top-end`, `pa-toast-container--top-start`
- **SCSS:** `core-components/_toasts.scss`
- **Snippet:** `toasts.html`
- **Demo:** `toasts.mustache`

### Notifications — `pa-notifications`

Notification centre: bell badge, dropdown panel and full-page list of notification items.

- **Blocks:** `pa-notifications`
- **Elements:** `pa-notifications__actions`, `pa-notifications__badge`, `pa-notifications__btn`, `pa-notifications__content`, `pa-notifications__footer`, `pa-notifications__header`, `pa-notifications__icon`, `pa-notifications__icon-wrapper`, `pa-notifications__item`, `pa-notifications__list`, `pa-notifications__mark-read`, `pa-notifications__panel`, `pa-notifications__time`
- **Modifiers / states:** `pa-notifications__list--page`
- **SCSS:** `core-components/_notifications.scss`
- **Snippet:** `notifications.html`
- **Demo:** `notifications.mustache`

### Tooltip — `pa-tooltip`

CSS + floating tooltips with placement, severity and multiline variants.

- **Blocks:** `pa-tooltip`, `pa-tooltip-floating`
- **Modifiers / states:** `pa-tooltip--bottom`, `pa-tooltip--color`, `pa-tooltip--danger`, `pa-tooltip--end`, `pa-tooltip--multiline`, `pa-tooltip--primary`, `pa-tooltip--start`, `pa-tooltip--success`, `pa-tooltip--warning`
- **SCSS:** `core-components/_tooltips.scss`
- **Snippet:** `tooltips.html`
- **Demo:** `tooltips.mustache`

### Popover — `pa-popover`

Generic anchored popover surface.

- **Blocks:** `pa-popover`
- **Elements:** `pa-popover__body`
- **Modifiers / states:** `pa-popover--end`
- **SCSS:** `core-components/_tooltips.scss`
- **Snippet:** `tooltips.html`
- **Demo:** ✗ none

### Loaders / spinners — `pa-loader-bars`

Loading indicators: ring, dots, bars, pulse, wave, centered + overlay wrappers, and a generic spinner.

- **Blocks:** `pa-loader-bars`, `pa-loader-center`, `pa-loader-dots`, `pa-loader-overlay`, `pa-loader-pulse`, `pa-loader-ring`, `pa-loader-wave`, `pa-spinner`
- **SCSS:** `core-components/_command-palette.scss`, `core-components/_loaders.scss`
- **Snippet:** `loaders.html`
- **Demo:** `loaders.mustache`

### Timeline — `pa-timeline`

Vertical/columned activity timeline with dated items, severity dots, avatars and comments.

- **Blocks:** `pa-timeline`
- **Elements:** `pa-timeline__avatar`, `pa-timeline__comment`, `pa-timeline__content`, `pa-timeline__date`, `pa-timeline__date-icon`, `pa-timeline__date-label`, `pa-timeline__icon`, `pa-timeline__item`, `pa-timeline__time`
- **Modifiers / states:** `pa-timeline--end`, `pa-timeline--keep-layout`, `pa-timeline--single-column`, `pa-timeline--start`, `pa-timeline__item--danger`, `pa-timeline__item--date-header`, `pa-timeline__item--info`, `pa-timeline__item--primary`, `pa-timeline__item--secondary`, `pa-timeline__item--success`, `pa-timeline__item--warning`
- **SCSS:** `core-components/_timeline.scss`
- **Snippet:** `timeline.html`
- **Demo:** `timeline.mustache`, `timeline-block.mustache`, `timeline-simple.mustache`

## Interactive & misc

### Badge — `pa-badge`

Status/count badges and badge groups.

- **Blocks:** `pa-badge`, `pa-badge-group`
- **SCSS:** `core-components/_command-palette.scss`, `core-components/badges/_badge-base.scss`, `core-components/badges/_badge-group.scss`, `core-components/forms/_input-wrapper.scss`, `core-components/forms/_query-editor.scss`
- **Snippet:** `badges.html`
- **Demo:** `badges.mustache`

### Label — `pa-label`

Text labels/tags with an outline variant.

- **Blocks:** `pa-label`
- **Modifiers / states:** `pa-label--outline`
- **SCSS:** `core-components/badges/_labels.scss`
- **Snippet:** `badges.html`
- **Demo:** ✗ none

### Composite badge — `pa-composite-badge`

Two-part badge (icon segment + label segment), optionally a button.

- **Blocks:** `pa-composite-badge`
- **Elements:** `pa-composite-badge__button`, `pa-composite-badge__icon`, `pa-composite-badge__label`
- **SCSS:** `core-components/badges/_composite-badge-variants.scss`, `core-components/badges/_composite-badge.scss`
- **Snippet:** `badges.html`
- **Demo:** ✗ none

### Command palette — `pa-command-palette`

Cmd-K command palette with search, results, footer, fullscreen mobile mode, autocomplete and a keyboard-shortcut help list.

- **Blocks:** `pa-command-palette`, `pa-search-autocomplete`, `pa-shortcut-help`
- **Elements:** `pa-command-palette__backdrop`, `pa-command-palette__container`, `pa-command-palette__footer`, `pa-command-palette__fullscreen-bar`, `pa-command-palette__results`, `pa-command-palette__search`, `pa-shortcut-help__category`, `pa-shortcut-help__category-title`, `pa-shortcut-help__description`, `pa-shortcut-help__empty`, `pa-shortcut-help__item`, `pa-shortcut-help__key`, `pa-shortcut-help__keys`, `pa-shortcut-help__list`, `pa-shortcut-help__separator`
- **Modifiers / states:** `pa-command-palette--fullscreen`
- **SCSS:** `core-components/_command-palette.scss`, `core-components/forms/_query-editor.scss`
- **Snippet:** `command-palette.html`
- **Demo:** `command-palette.mustache`, `search.mustache`

### Search results — `pa-search-results`

Search results list with compact/detailed/cards/grouped layouts.

- **Blocks:** `pa-search-results`
- **Elements:** `pa-search-results__content`, `pa-search-results__group-title`, `pa-search-results__icon`, `pa-search-results__item`, `pa-search-results__meta`, `pa-search-results__snippet`, `pa-search-results__title`, `pa-search-results__type`
- **Modifiers / states:** `pa-search-results--cards`, `pa-search-results--compact`, `pa-search-results--detailed`, `pa-search-results--grouped`
- **SCSS:** `core-components/_search-results.scss`
- **Snippet:** `search-results.html`
- **Demo:** `search.mustache`

### Logic tree — `pa-logic-tree`

Nested boolean logic tree (AND/OR blocks, nodes, logical tokens).

- **Blocks:** `pa-logic-tree`
- **Elements:** `pa-logic-tree__block`, `pa-logic-tree__node`
- **Modifiers / states:** `pa-logic-tree__token--logical`
- **SCSS:** `core-components/_logic-tree.scss`
- **Snippet:** ✗ none
- **Demo:** ✗ none

### File selector — `pa-file-dropzone`

File dropzone + file list/items with icons, previews, popover and per-file progress.

- **Blocks:** `pa-file-dropzone`, `pa-file-dropzone-overlay`, `pa-file-icon`, `pa-file-input`, `pa-file-item`, `pa-file-list`, `pa-file-popover`, `pa-file-preview`, `pa-file-preview-grid`, `pa-file-progress`
- **SCSS:** `core-components/_file-selector.scss`
- **Snippet:** ✗ none
- **Demo:** `file-selector.mustache`

### Icon — `pa-icon`

Mask-based icon element (pa-icon--x etc.).

- **Blocks:** `pa-icon`
- **Modifiers / states:** `pa-icon--x`
- **SCSS:** `core-components/_icons.scss`
- **Snippet:** `icon.html`
- **Demo:** ✗ none

## Utilities & state hooks

### Utilities & state hooks — `pa-bg-color`

Standalone helper classes (not components): text/link helpers, responsive font hooks, colour helpers, fit-hidden. See utilities.scss for the full utility set (spacing, sizing, pc-col-* percentages, logical margins, etc.).

- **Blocks:** `pa-bg-color`, `pa-border-color`, `pa-fit-hidden`, `pa-font-base`, `pa-font-mobile`, `pa-font-responsive`, `pa-link`, `pa-text`, `pa-text-color`
- **SCSS:** `core-components/_utilities.scss`, `core-components/layout/_navbar-elements.scss`
- **Snippet:** `utilities.html`
- **Demo:** ✗ none
