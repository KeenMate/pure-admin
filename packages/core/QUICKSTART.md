# Pure Admin Core — Quick Start

A lightweight, data-focused HTML/CSS admin framework. It's **CSS-first**: you
write plain HTML with `pa-*` classes, no build step or JS framework required.

> **Just want to see it?** Open [`starter/index.html`](starter/index.html) in a
> browser — it's a complete, runnable admin page (navbar + sidebar + content +
> footer) that links this package's own `dist/css/main.css` with a relative
> path, so it works straight from this folder with no install and no network.

---

## 1. Add the stylesheet

Pick whichever fits how you serve assets.

**A. Straight from this folder / a static server** — link the built bundle:

```html
<link rel="stylesheet" href="dist/css/main.css">
```

**B. npm + a bundler** (Vite, webpack, etc.):

```bash
npm install @keenmate/pure-admin-core
```

```js
import '@keenmate/pure-admin-core/css';   // dist/css/main.css
```

**C. CDN** (no install — good for a quick prototype):

```html
<link rel="stylesheet" href="https://unpkg.com/@keenmate/pure-admin-core/dist/css/main.css">
```

`main.css` ships a complete, neutral (Tailwind-ish) palette so the page looks
finished before you add a theme.

## 2. Use the layout shell

Every page uses the same outer shell — a fixed navbar, then a layout holding a
sidebar, the scrolling content, and a footer:

```html
<body>
  <nav class="pa-navbar">
    <div class="pa-navbar__inner">
      <div class="pa-navbar__start">
        <button class="pa-navbar__burger burger-menu" onclick="toggleSidebar()">
          <span></span><span></span><span></span>
        </button>
        <div class="pa-app-header"><h1>My App</h1></div>
      </div>
      <div class="pa-navbar__center">
        <div class="pa-page-header"><h2>Dashboard</h2></div>
      </div>
      <div class="pa-navbar__end"><!-- profile, notifications --></div>
    </div>
  </nav>

  <div class="pa-layout">
    <div class="pa-layout__inner">
      <aside class="pa-layout__sidebar">
        <nav class="pa-sidebar__nav">
          <ul>
            <li class="pa-sidebar__item">
              <a href="/" class="pa-sidebar__link pa-sidebar__link--active">
                <span class="pa-sidebar__icon">📊</span>
                <span class="pa-sidebar__label">Dashboard</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <div class="pa-layout__content">
        <main class="pa-layout__main">
          <!-- your page content -->
        </main>
      </div>
    </div>

    <footer class="pa-layout__footer">
      <div class="pa-footer__start"><p>&copy; 2026 My App</p></div>
    </footer>
  </div>
</body>
```

The full, annotated shell (dropdowns, collapsible submenus, icon-collapse,
responsive navbar, resizable sidebar) lives in
[`snippets/layout.html`](snippets/layout.html). `starter/index.html` is a
filled-in version of the shell above.

## 3. Drop in components

Everything is a `pa-*` class. A couple of examples:

```html
<button class="pa-btn pa-btn--primary">Save</button>

<div class="pa-card">
  <div class="pa-card__header"><h3 class="pa-card__title">Revenue</h3></div>
  <div class="pa-card__body">$42,300</div>
</div>
```

The [`snippets/`](snippets/) directory has one clean, copy-pasteable HTML file
per component category (`buttons.html`, `cards.html`, `tables.html`,
`forms.html`, …). These are the **canonical markup** — copy the shape from there
rather than guessing. The full class reference is in [`README.md`](README.md).

## 4. (Optional) add a theme

`main.css` is unthemed. For branded looks (Corporate, Dark, Audi, …), install
themes with the CLI and link the theme CSS *instead of* (or after) `main.css`:

```bash
npm install -D @keenmate/pureadmin
npx pureadmin themes add corporate
```

```html
<link rel="stylesheet" href="static/themes/corporate/corporate.css">
```

Browse all themes at [pureadmin.io](https://pureadmin.io).

## 5. (Optional) interactive components

Most components are pure CSS. A few (split buttons, tooltips/popovers, toasts,
command palette, modals) need a small self-contained vanilla-JS file from
`src/js/`. Pull in only what you use:

```html
<script src="node_modules/@keenmate/pure-admin-core/src/js/split-button.js"></script>
```

See the **JavaScript** table in [`README.md`](README.md) for the file-per-component
list and the Floating UI dependency note.

## 6. (Optional) customize with SCSS

Override any `!default` SCSS variable *before* importing the framework:

```scss
$accent-color: #7c3aed;
$main-bg: #fafafa;

@import '@keenmate/pure-admin-core/src/scss/main';
```

Variable list: [`src/scss/variables/`](src/scss/variables/).

---

**Next steps:** skim [`README.md`](README.md) for the full component + class
reference, and keep [`snippets/`](snippets/) open as your copy-paste source.
