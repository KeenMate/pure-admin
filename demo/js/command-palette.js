/**
 * Command Palette — Spotlight-style search with commands and context search
 *
 * Keyboard: Ctrl+K / Cmd+K to open
 * Prefixes:
 *   /  — Commands (multi-step wizards, instant actions)
 *   :  — Context search (search within a category)
 *   (none) — Global search across all categories
 *
 * Navigation: ↑↓ items, Enter/Tab select, Esc close
 */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // ── DOM ──
    const palette = document.getElementById('commandPalette');
    const backdrop = document.getElementById('commandPaletteBackdrop');
    const input = document.getElementById('commandPaletteInput');
    const contextLabel = document.getElementById('commandPaletteContext');
    const resultsEl = document.getElementById('commandPaletteResults');

    if (!palette || !backdrop || !input || !contextLabel || !resultsEl) {
      console.warn('Command palette elements not found');
      return;
    }

    const tokensEl = document.getElementById('commandPaletteTokens');

    // ── State ──
    let isOpen = false;
    let mode = 'idle'; // idle | command-list | command-step | context-list | context-search | global-search
    let displayStyle = 'inline'; // inline | tokens
    let displayItems = [];
    let activeIndex = -1;
    let searchTimer = null;
    let currentQuery = ''; // tracks the active search query for highlights

    // Command wizard state
    let activeCommand = null;
    let currentStepIndex = 0;
    let selections = [];
    let preview = null;

    // Context search state
    let activeContext = null;

    // ── Demo data ──
    const products = [
      { id: 1, name: 'MacBook Pro 16"', sku: 'MBP-16-001', price: '$2,499.00', icon: '💻', status: 'In Stock' },
      { id: 2, name: 'iPhone 15 Pro', sku: 'IP15P-256', price: '$999.00', icon: '📱', status: 'New' },
      { id: 3, name: 'AirPods Pro', sku: 'APP-GEN2', price: '$249.00', icon: '🎧', status: 'Popular' },
      { id: 4, name: 'iPad Air', sku: 'IPAD-AIR-5', price: '$599.00', icon: '📱', status: 'In Stock' },
      { id: 5, name: 'Apple Watch Ultra', sku: 'AW-ULTRA', price: '$799.00', icon: '⌚', status: 'Limited' },
      { id: 6, name: 'Magic Keyboard', sku: 'MK-US', price: '$99.00', icon: '⌨️', status: 'In Stock' },
      { id: 7, name: 'Magic Mouse', sku: 'MM-BLK', price: '$79.00', icon: '🖱️', status: 'In Stock' },
      { id: 8, name: 'HomePod mini', sku: 'HPM-WHT', price: '$99.00', icon: '🔊', status: 'New' },
      { id: 9, name: 'Apple TV 4K', sku: 'ATV-4K-128', price: '$149.00', icon: '📺', status: 'In Stock' },
      { id: 10, name: 'AirTag 4 Pack', sku: 'AT-4PK', price: '$99.00', icon: '📍', status: 'Popular' },
      { id: 11, name: 'Studio Display', sku: 'SD-27-STD', price: '$1,599.00', icon: '🖥️', status: 'Premium' },
      { id: 12, name: 'Mac Studio', sku: 'MS-M2-MAX', price: '$1,999.00', icon: '💻', status: 'Pro' },
    ];

    const users = [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Customer', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Admin', status: 'Active' },
      { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Customer', status: 'Inactive' },
      { id: 4, name: 'Alice Williams', email: 'alice.w@example.com', role: 'Manager', status: 'Active' },
      { id: 5, name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'Customer', status: 'Active' },
      { id: 6, name: 'Diana Prince', email: 'diana.p@example.com', role: 'VIP', status: 'Premium' },
      { id: 7, name: 'Eve Davis', email: 'eve.davis@example.com', role: 'Customer', status: 'Active' },
      { id: 8, name: 'Frank Miller', email: 'frank.m@example.com', role: 'Support', status: 'Active' },
      { id: 9, name: 'Grace Lee', email: 'grace.lee@example.com', role: 'Customer', status: 'New' },
      { id: 10, name: 'Henry Ford', email: 'henry.f@example.com', role: 'Customer', status: 'Active' },
    ];

    const orders = [
      { id: 1001, customer: 'John Doe', total: '$1,234.56', items: 2, status: 'Shipped' },
      { id: 1002, customer: 'Jane Smith', total: '$567.89', items: 1, status: 'Processing' },
      { id: 1003, customer: 'Bob Johnson', total: '$2,345.67', items: 5, status: 'Delivered' },
      { id: 1004, customer: 'Alice Williams', total: '$890.12', items: 3, status: 'Pending' },
      { id: 1005, customer: 'Charlie Brown', total: '$456.78', items: 2, status: 'Shipped' },
      { id: 1006, customer: 'Diana Prince', total: '$3,456.89', items: 7, status: 'Processing' },
      { id: 1007, customer: 'Eve Davis', total: '$123.45', items: 1, status: 'Cancelled' },
      { id: 1008, customer: 'Frank Miller', total: '$678.90', items: 4, status: 'Delivered' },
    ];

    const reports = [
      { id: 'sales', name: 'Product Sales', needsTimeRange: true },
      { id: 'revenue', name: 'Revenue Summary', needsTimeRange: true },
      { id: 'inventory', name: 'Inventory Status', needsTimeRange: false },
      { id: 'customers', name: 'Customer Activity', needsTimeRange: true },
      { id: 'returns', name: 'Returns & Refunds', needsTimeRange: true },
    ];

    // ── Badge variant mapping ──
    const badgeVariants = {
      'Active': 'success', 'In Stock': 'success', 'Delivered': 'success', 'Paid': 'success',
      'New': 'info', 'Shipped': 'info', 'Popular': 'info',
      'Premium': 'primary', 'Pro': 'primary',
      'Processing': 'warning', 'Limited': 'warning', 'Inactive': 'warning', 'Unpaid': 'warning', 'Pending': 'warning',
      'Cancelled': 'danger', 'Overdue': 'danger', 'Void': 'danger',
    };

    // ── Commands (/ prefix) ──
    const filterOpts = (opts, query) => {
      if (!query) return opts;
      const q = query.toLowerCase();
      return opts.filter((o) =>
        (o.label || '').toLowerCase().includes(q) ||
        (o.description || '').toLowerCase().includes(q) ||
        (o.code || '') === q
      );
    };

    // ── Go-to-page list — derived from the sidebar nav so it never drifts ──
    // The sidebar (rendered on every page) is the canonical navigation, so
    // scraping it here means new / renamed / removed routes show up in the
    // palette automatically — no hand-maintained list, no build step. Hash-only
    // demo links (#test1, Level 1.x placeholders) and duplicates are skipped.
    let pageListCache = null;
    function getPages() {
      if (pageListCache) return pageListCache;

      const pages = [];
      const seen = new Set();
      const links = document.querySelectorAll('.pa-layout__sidebar .pa-sidebar__link[href]');

      links.forEach((link) => {
        const href = (link.getAttribute('href') || '').trim();
        if (!href || href.charAt(0) === '#') return; // skip anchor-only demo items
        const path = href.split('?')[0].split('#')[0]; // normalise for dedupe
        if (seen.has(path)) return;
        seen.add(path);

        const labelEl = link.querySelector('.pa-sidebar__label');
        const label = labelEl ? labelEl.textContent.trim() : '';
        if (!label) return;

        // Section name + icon come from the nearest ancestor submenu's toggle.
        let group = '';
        let groupIcon = '';
        const submenu = link.closest('.pa-sidebar__submenu');
        const toggle = submenu && submenu.previousElementSibling;
        if (toggle && toggle.classList.contains('pa-sidebar__toggle')) {
          const gl = toggle.querySelector('.pa-sidebar__label');
          const gi = toggle.querySelector('.pa-sidebar__icon');
          group = gl ? gl.textContent.trim() : '';
          groupIcon = gi ? gi.textContent.trim() : '';
        }

        // Prefer the item's own icon; ignore bullet placeholders and fall back
        // to the section icon, then a generic page glyph.
        const iconEl = link.querySelector('.pa-sidebar__icon');
        let icon = iconEl ? iconEl.textContent.trim() : '';
        if (!icon || icon === '•') icon = (groupIcon && groupIcon !== '•') ? groupIcon : '📄';

        pages.push({ id: 'page-' + path, label: label, description: group, icon: icon, value: href });
      });

      pageListCache = pages;
      return pages;
    }

    const commands = [
      {
        shortcut: '/deploy',
        aliases: ['/d'],
        hotkey: 'Alt+D',
        name: 'Deploy to Environment',
        description: 'Deploy a branch to an environment',
        icon: '🚀',
        steps: [
          {
            id: 'environment',
            prompt: ' in ',
            placeholder: 'Select environment...',
            getOptions: (query) => filterOpts([
              { id: 'prod', label: 'Production', description: 'Live servers', icon: '🔴', value: 'production' },
              { id: 'staging', label: 'Staging', description: 'Pre-production', icon: '🟡', value: 'staging' },
              { id: 'dev', label: 'Development', description: 'Dev servers', icon: '🟢', value: 'development' },
            ], query),
          },
          {
            id: 'branch',
            prompt: ' branch ',
            placeholder: 'Select or type branch...',
            freeText: true,
            getOptions: (query) => filterOpts([
              { id: 'main', label: 'main', description: 'Default branch', icon: '🌿', value: 'main' },
              { id: 'develop', label: 'develop', description: 'Development branch', icon: '🌱', value: 'develop' },
              { id: 'feature', label: 'feature/new-ui', description: 'Feature branch', icon: '🔧', value: 'feature/new-ui' },
            ], query),
          },
        ],
        getPreview: (sel) => {
          const env = sel[0]?.option?.label || '...';
          const branch = sel[1]?.option?.label || sel[1]?.freeText;
          return branch ? `Deploy ${branch} to ${env}` : `Deploy to ${env}`;
        },
        onComplete: (sel) => {
          const env = sel[0]?.option?.value;
          const branch = sel[1]?.option?.value || sel[1]?.freeText;
          alert(`Deploying ${branch} to ${env}`);
        },
      },
      {
        shortcut: '/assign',
        aliases: ['/a'],
        hotkey: 'Alt+A',
        name: 'Assign to User',
        description: 'Assign an item to a team member',
        icon: '👤',
        steps: [
          {
            id: 'item',
            placeholder: 'Select item...',
            getOptions: (query) => filterOpts(
              products.map((p) => ({ id: 'p-' + p.id, label: p.name, description: `SKU: ${p.sku}`, icon: p.icon, value: p })),
              query
            ),
          },
          {
            id: 'user',
            prompt: ' to ',
            placeholder: 'Select user...',
            getOptions: (query) => filterOpts(
              users.map((u) => ({ id: 'u-' + u.id, label: u.name, description: u.email, icon: '👤', value: u })),
              query
            ),
          },
        ],
        getPreview: (sel) => {
          const item = sel[0]?.option?.label || '...';
          const user = sel[1]?.option?.label;
          return user ? `Assign "${item}" to ${user}` : `Assign "${item}"`;
        },
        onComplete: (sel) => {
          const item = sel[0]?.option?.label;
          const user = sel[1]?.option?.label;
          alert(`Assigned "${item}" to ${user}`);
        },
      },
      {
        shortcut: '/go',
        aliases: ['/g', '/nav'],
        hotkey: 'Alt+G',
        name: 'Go to Page',
        description: 'Navigate to a page',
        icon: '🧭',
        steps: [
          {
            id: 'page',
            placeholder: 'Type page name...',
            freeText: true,
            getOptions: (query) => filterOpts(getPages(), query),
          },
        ],
        onComplete: (sel) => {
          const page = sel[0]?.option?.value || sel[0]?.freeText || '/';
          window.location.href = page;
        },
      },
      {
        shortcut: '/theme',
        aliases: ['/t'],
        hotkey: 'Alt+T',
        name: 'Switch Theme',
        description: 'Change the visual theme',
        icon: '🎨',
        steps: [
          {
            id: 'theme',
            placeholder: 'Select theme...',
            getOptions: (query) => filterOpts([
              { id: 'audi', label: 'Audi', description: 'Premium dark theme', icon: '🔴', value: 'audi' },
              { id: 'dark', label: 'Dark', description: 'Clean dark theme', icon: '🌑', value: 'dark' },
              { id: 'corporate', label: 'Corporate', description: 'Business theme', icon: '🏢', value: 'corporate' },
              { id: 'dracula', label: 'Dracula', description: 'Purple accents', icon: '🧛', value: 'dracula' },
              { id: 'tokyo-night', label: 'Tokyo Night', description: 'VS Code inspired', icon: '🌃', value: 'tokyo-night' },
              { id: 'minimal', label: 'Minimal', description: 'Clean minimal', icon: '⚪', value: 'minimal' },
              { id: 'gruvbox', label: 'Gruvbox', description: 'Retro groove', icon: '🟤', value: 'gruvbox' },
            ], query),
          },
        ],
        onComplete: (sel) => {
          const t = sel[0]?.option?.value;
          if (t) window.location.search = '?theme=' + t;
        },
      },
    ];

    // ── Contexts (: prefix) ──
    const contexts = [
      {
        shortcut: ':p',
        aliases: [':products', ':prod'],
        name: 'Products',
        description: 'Search products by name or SKU',
        icon: '📦',
        onSearch: (query) => {
          const q = query.toLowerCase();
          return products
            .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
            .map((p) => ({
              id: 'product-' + p.id, title: p.name,
              subtitle: `SKU: ${p.sku} • ${p.price}`,
              icon: p.icon, badge: p.status, data: p,
            }));
        },
        onSelect: (r) => alert(`Navigate to: /products/${r.data.id}`),
      },
      {
        shortcut: ':u',
        aliases: [':users', ':user'],
        name: 'Users',
        description: 'Search users by name or email',
        icon: '👤',
        onSearch: (query) => {
          const q = query.toLowerCase();
          return users
            .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
            .map((u) => ({
              id: 'user-' + u.id, title: u.name,
              subtitle: `${u.email} • ${u.role}`,
              icon: '👤', badge: u.status, data: u,
            }));
        },
        onSelect: (r) => alert(`Navigate to: /users/${r.data.id}`),
      },
      {
        shortcut: ':o',
        aliases: [':orders', ':order'],
        name: 'Orders',
        description: 'Search orders by number or customer',
        icon: '📦',
        onSearch: (query) => {
          const q = query.toLowerCase();
          return orders
            .filter((o) => o.customer.toLowerCase().includes(q) || String(o.id).includes(q))
            .map((o) => ({
              id: 'order-' + o.id, title: `Order #${o.id}`,
              subtitle: `${o.customer} • ${o.total} • ${o.items} items`,
              icon: '📦', badge: o.status, data: o,
            }));
        },
        onSelect: (r) => alert(`Navigate to: /orders/${r.data.id}`),
      },
    ];

    // ── Helpers ──
    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function highlightText(text, query) {
      if (!query) return escapeHtml(text);
      const escaped = escapeHtml(text);
      const regex = new RegExp(`(${escapeHtml(query)})`, 'gi');
      return escaped.replace(regex, '<mark>$1</mark>');
    }

    function getTitle(item) {
      return item.label || item.title || item.name || '';
    }

    function getSubtitle(item) {
      const sub = item.subtitle || item.description || '';
      if (item.code) return sub ? `[${item.code}] ${sub}` : `[${item.code}]`;
      return sub;
    }

    function getIcon(item) {
      return item.icon || '';
    }

    function getBadge(item) {
      if (item.badge) return item.badge;
      if (item.shortcut) return item.shortcut;
      return '';
    }

    function getBadgeVariant(item) {
      const badge = getBadge(item);
      return badgeVariants[badge] || '';
    }

    // ── Mobile fullscreen sheet ──
    // On a touch phone the palette opens as a full-viewport sheet instead of a
    // floating dialog — the same pattern the KM web components use (see
    // @keenmate/web-multiselect). The device decision is capability-first via
    // pureAdmin.device (mirrors web-components-core's classifyDevice): a narrowed
    // DESKTOP window keeps the floating dialog; only a touch-primary phone
    // (short side < 600px) gets the sheet. Falls back to a local matchMedia
    // check if the pureAdmin namespace hasn't loaded.
    const container = palette.querySelector('.pa-command-palette__container');
    let fullscreenBar = null;        // injected [title + close] row, null when floating
    let keyboardInsetCleanup = null; // visualViewport listener detach
    let scrollLockRelease = null;    // ref-counted body-scroll-lock release

    function isMobileDevice() {
      const pa = window.pureAdmin;
      if (pa && pa.device) return pa.device.class === 'mobile';
      const touchPrimary =
        window.matchMedia('(pointer: coarse)').matches &&
        !window.matchMedia('(hover: hover)').matches;
      if (!touchPrimary) return false;
      const line = (pa && pa.config && pa.config.tabletMinShortSide) || 600;
      return Math.min(window.innerWidth, window.innerHeight) < line;
    }

    function enterFullscreen() {
      if (fullscreenBar || !container) return;
      palette.classList.add('pa-command-palette--fullscreen');

      // Pinned title + close row (CSS reveals it only in fullscreen). Inserted
      // as the first child of the container so it survives result re-renders
      // (which only rewrite the results list), and gives touch users a close
      // affordance since there's no visible backdrop or Esc key.
      fullscreenBar = document.createElement('div');
      fullscreenBar.className = 'pa-command-palette__fullscreen-bar';
      fullscreenBar.innerHTML =
        '<span class="pa-command-palette__fullscreen-title">Search</span>' +
        '<button type="button" class="pa-command-palette__close" aria-label="Close search">' +
        '<span class="pa-icon pa-icon--x"></span></button>';
      fullscreenBar.querySelector('.pa-command-palette__close').addEventListener('click', close);
      container.insertBefore(fullscreenBar, container.firstChild);

      // Keep the sheet above the soft keyboard (visualViewport). No-op if the
      // overlay helper / visualViewport is unavailable.
      if (window.pureAdmin && window.pureAdmin.overlay) {
        keyboardInsetCleanup = window.pureAdmin.overlay.observeKeyboardInset(container);
      }
    }

    function exitFullscreen() {
      palette.classList.remove('pa-command-palette--fullscreen');
      if (keyboardInsetCleanup) { keyboardInsetCleanup(); keyboardInsetCleanup = null; }
      if (fullscreenBar) { fullscreenBar.remove(); fullscreenBar = null; }
    }

    // ── Open / Close ──
    function open() {
      isOpen = true;
      palette.classList.add('pa-command-palette--active');
      if (isMobileDevice()) enterFullscreen();
      // Lock page scroll via the shared ref-counted helper (so a drawer + the
      // palette don't unbalance each other); fall back to a direct lock.
      if (window.pureAdmin && window.pureAdmin.overlay) {
        scrollLockRelease = window.pureAdmin.overlay.lockBodyScroll();
      } else {
        document.body.style.overflow = 'hidden';
      }
      input.focus();
      renderIdle();
    }

    function close() {
      isOpen = false;
      palette.classList.remove('pa-command-palette--active');
      exitFullscreen();
      if (scrollLockRelease) { scrollLockRelease(); scrollLockRelease = null; }
      else document.body.style.overflow = '';
      reset();
    }

    function reset() {
      input.value = '';
      input.placeholder = 'Type / for commands, : to search, or just start typing...';
      mode = 'idle';
      displayItems = [];
      activeIndex = -1;
      activeCommand = null;
      currentStepIndex = 0;
      selections = [];
      preview = null;
      activeContext = null;
      contextLabel.textContent = '';
      contextLabel.classList.remove('pa-command-palette__context--visible');
      tokensEl.innerHTML = '';
      currentQuery = '';
      if (searchTimer) clearTimeout(searchTimer);
      renderIdle();
    }

    // ── Rendering ──
    function renderIdle() {
      let html = '<div class="pa-command-palette__home">';

      // Commands section
      html += '<div class="pa-command-palette__home-section">';
      html += '<div class="pa-command-palette__home-heading">Commands</div>';
      commands.forEach((cmd) => {
        html += `<div class="pa-command-palette__item" data-home-cmd="${cmd.shortcut}">`;
        if (cmd.icon) html += `<div class="pa-command-palette__item-icon">${cmd.icon}</div>`;
        html += `<div class="pa-command-palette__item-content">`;
        html += `<div class="pa-command-palette__item-title">${escapeHtml(cmd.name)}</div>`;
        html += `<div class="pa-command-palette__item-meta">${escapeHtml(cmd.description)}</div>`;
        html += `</div>`;
        if (cmd.hotkey) {
          const keys = cmd.hotkey.split('+');
          html += `<div class="pa-command-palette__shortcut">`;
          keys.forEach((k, i) => { html += `<span class="pa-command-palette__key">${k}</span>`; if (i < keys.length - 1) html += ' '; });
          html += `</div>`;
        } else {
          html += `<span class="pa-command-palette__key">${escapeHtml(cmd.shortcut)}</span>`;
        }
        html += `</div>`;
      });
      html += '</div>';

      // Search contexts section
      html += '<div class="pa-command-palette__home-section">';
      html += '<div class="pa-command-palette__home-heading">Search</div>';
      contexts.forEach((ctx) => {
        html += `<div class="pa-command-palette__item" data-home-ctx="${ctx.shortcut}">`;
        if (ctx.icon) html += `<div class="pa-command-palette__item-icon">${ctx.icon}</div>`;
        html += `<div class="pa-command-palette__item-content">`;
        html += `<div class="pa-command-palette__item-title">${escapeHtml(ctx.name)}</div>`;
        html += `<div class="pa-command-palette__item-meta">${escapeHtml(ctx.description)}</div>`;
        html += `</div>`;
        html += `<span class="pa-command-palette__key">${escapeHtml(ctx.shortcut)}</span>`;
        html += `</div>`;
      });
      html += '</div>';

      html += '</div>';
      resultsEl.innerHTML = html;

      // Click handlers for home items
      resultsEl.querySelectorAll('[data-home-cmd]').forEach((el) => {
        el.addEventListener('click', () => {
          input.value = el.dataset.homeCmd + ' ';
          input.dispatchEvent(new Event('input'));
        });
      });
      resultsEl.querySelectorAll('[data-home-ctx]').forEach((el) => {
        el.addEventListener('click', () => {
          input.value = el.dataset.homeCtx + ' ';
          input.dispatchEvent(new Event('input'));
        });
      });
    }

    function renderEmpty(message) {
      resultsEl.innerHTML = `<div class="pa-command-palette__empty">${message || 'No results found'}</div>`;
    }

    function renderLoading() {
      resultsEl.innerHTML = `
        <div class="pa-command-palette__loader">
          <div class="pa-spinner pa-spinner--sm pa-spinner--primary"></div>
          <span>Searching...</span>
        </div>`;
    }

    function renderItems(query) {
      if (query !== undefined) currentQuery = query || '';
      if (displayItems.length === 0) {
        renderEmpty();
        return;
      }

      let html = '';
      displayItems.forEach((item, index) => {
        const isActive = index === activeIndex;
        const title = currentQuery ? highlightText(getTitle(item), currentQuery) : escapeHtml(getTitle(item));
        const subtitle = getSubtitle(item);
        const icon = getIcon(item);
        const badge = getBadge(item);
        const variant = getBadgeVariant(item);

        html += `<div class="pa-command-palette__item${isActive ? ' pa-command-palette__item--active' : ''}" data-index="${index}">`;
        if (icon) html += `<div class="pa-command-palette__item-icon">${icon}</div>`;
        html += `<div class="pa-command-palette__item-content">`;
        html += `<div class="pa-command-palette__item-title">${title}</div>`;
        if (subtitle) html += `<div class="pa-command-palette__item-meta">${escapeHtml(subtitle)}</div>`;
        html += `</div>`;
        if (badge) html += `<span class="pa-badge${variant ? ' pa-badge--' + variant : ''}">${escapeHtml(badge)}</span>`;
        html += `</div>`;
      });

      // Preview for command steps
      if (preview && mode === 'command-step') {
        html += `<div class="pa-command-palette__preview"><span class="pa-command-palette__preview-label">Preview:</span> ${escapeHtml(preview)}</div>`;
      }

      resultsEl.innerHTML = html;

      // Click handlers
      resultsEl.querySelectorAll('.pa-command-palette__item').forEach((el) => {
        el.addEventListener('click', () => selectItem(parseInt(el.dataset.index)));
      });

      // Scroll active item into view
      const activeEl = resultsEl.querySelector('.pa-command-palette__item--active');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }

    function updateContextLabel(text) {
      if (text) {
        contextLabel.textContent = text;
        contextLabel.classList.add('pa-command-palette__context--visible');
      } else {
        contextLabel.textContent = '';
        contextLabel.classList.remove('pa-command-palette__context--visible');
      }
    }

    // ── Input processing ──
    function processInput() {
      if (searchTimer) clearTimeout(searchTimer);
      preview = null;

      const value = input.value.trim();

      // In command-step mode, always handle as step input (don't reset on empty)
      if (mode === 'command-step' && activeCommand) {
        handleStepInput();
        return;
      }

      if (!value) {
        mode = 'idle';
        displayItems = [];
        activeIndex = -1;
        updateContextLabel(null);
        renderIdle();
        return;
      }

      if (value.startsWith('/')) return handleCommandInput(value);
      if (value.startsWith(':')) return handleContextInput(value);
      handleGlobalSearch(value);
    }

    // ── Commands (/) ──
    function handleCommandInput(value) {
      const parts = value.split(' ');
      const cmdPart = parts[0];
      const queryPart = parts.slice(1).join(' ');

      // If we're already in a command step, handle step input
      if (mode === 'command-step' && activeCommand) {
        handleStepInput();
        return;
      }

      // Find matching commands
      const matching = commands.filter((cmd) => {
        const all = [cmd.shortcut, ...(cmd.aliases || [])];
        return all.some(
          (s) => s.toLowerCase().startsWith(cmdPart.toLowerCase()) || cmdPart.toLowerCase().startsWith(s.toLowerCase())
        );
      });

      // Exact match + space = enter command mode
      const exact = commands.find((cmd) => {
        const all = [cmd.shortcut, ...(cmd.aliases || [])];
        return all.some((s) => s.toLowerCase() === cmdPart.toLowerCase());
      });

      if (exact && (queryPart || value.endsWith(' '))) {
        enterCommandMode(exact, queryPart);
      } else if (cmdPart === '/') {
        mode = 'command-list';
        displayItems = commands;
        activeIndex = 0;
        updateContextLabel('Commands');
        renderItems();
      } else {
        mode = 'command-list';
        displayItems = matching;
        activeIndex = matching.length > 0 ? 0 : -1;
        updateContextLabel('Commands');
        renderItems();
      }
    }

    function enterCommandMode(command, initialQuery) {
      activeCommand = command;
      currentStepIndex = 0;
      selections = [];
      mode = 'command-step';
      updateContextLabel(command.name);

      if (command.steps.length === 0) {
        command.onComplete([]);
        close();
        return;
      }

      if (displayStyle === 'tokens') {
        input.value = '';
        renderTokens();
      }

      loadStepOptions(initialQuery || '');
    }

    function loadStepOptions(query) {
      const step = activeCommand.steps[currentStepIndex];
      if (!step) return;

      input.placeholder = step.placeholder || 'Select...';

      const options = step.getOptions(query, selections);
      if (options instanceof Promise) {
        renderLoading();
        options.then((opts) => {
          displayItems = opts;
          activeIndex = opts.length > 0 ? 0 : -1;
          updatePreview();
          renderItems(query);
        });
      } else {
        displayItems = options;
        activeIndex = options.length > 0 ? 0 : -1;
        updatePreview();
        renderItems(query);
      }
    }

    function handleStepInput() {
      const query = getStepQuery();
      loadStepOptions(query);
    }

    function getStepQuery() {
      if (displayStyle === 'tokens') return input.value.trim();
      const display = buildSelectionsDisplay();
      const val = input.value;
      return val.substring(display.length).trim();
    }

    function buildSelectionsDisplay() {
      if (!activeCommand) return '';
      let display = activeCommand.shortcut;
      for (let i = 0; i < selections.length; i++) {
        const step = activeCommand.steps[i];
        const sel = selections[i];
        display += step?.prompt || ' ';
        display += sel.option?.label || sel.freeText || '';
      }
      const step = activeCommand.steps[currentStepIndex];
      if (step && selections.length === currentStepIndex) {
        display += step.prompt || ' ';
      }
      return display;
    }

    function renderTokens() {
      if (displayStyle !== 'tokens' || mode !== 'command-step' || !activeCommand) {
        tokensEl.innerHTML = '';
        return;
      }

      let html = `<span class="pa-badge pa-badge--primary">${escapeHtml(activeCommand.shortcut)}</span>`;
      for (let i = 0; i < selections.length; i++) {
        const step = activeCommand.steps[i];
        const sel = selections[i];
        const prompt = step?.prompt?.trim();
        if (prompt) html += `<span class="pa-command-palette__token-prompt">${escapeHtml(prompt)}</span>`;
        const label = sel.option?.label || sel.freeText || '';
        html += `<span class="pa-badge"><span>${escapeHtml(label)}</span><button class="pa-badge__remove" data-step="${i}"><span class="pa-icon pa-icon--x" aria-hidden="true"></span></button></span>`;
      }
      const currentStep = activeCommand.steps[currentStepIndex];
      if (currentStep?.prompt?.trim() && selections.length === currentStepIndex) {
        html += `<span class="pa-command-palette__token-prompt">${escapeHtml(currentStep.prompt.trim())}</span>`;
      }
      tokensEl.innerHTML = html;

      // Remove handlers on badges
      tokensEl.querySelectorAll('.pa-badge__remove').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const stepIdx = parseInt(btn.dataset.step);
          // Rewind to that step
          selections = selections.slice(0, stepIdx);
          currentStepIndex = stepIdx;
          input.value = '';
          renderTokens();
          loadStepOptions('');
          input.focus();
        });
      });
    }

    function selectStepOption(option) {
      selections.push({ stepId: activeCommand.steps[currentStepIndex].id, option });
      moveToNextStep();
    }

    function submitFreeText() {
      const step = activeCommand.steps[currentStepIndex];
      if (!step?.freeText) return;
      const text = getStepQuery();
      if (!text) return;
      selections.push({ stepId: step.id, freeText: text });
      moveToNextStep();
    }

    function moveToNextStep() {
      let nextIndex = currentStepIndex + 1;
      while (nextIndex < activeCommand.steps.length) {
        const step = activeCommand.steps[nextIndex];
        if (!step.shouldShow || step.shouldShow(selections)) break;
        nextIndex++;
      }

      if (nextIndex >= activeCommand.steps.length) {
        activeCommand.onComplete(selections);
        close();
      } else {
        currentStepIndex = nextIndex;
        if (displayStyle === 'tokens') {
          input.value = '';
          renderTokens();
        } else {
          input.value = buildSelectionsDisplay();
        }
        loadStepOptions('');
      }
    }

    function updatePreview() {
      preview = null;
    }

    // ── Contexts (:) ──
    function handleContextInput(value) {
      const parts = value.split(' ');
      const ctxPart = parts[0];
      const queryPart = parts.slice(1).join(' ');

      // If already in context search, handle search
      if (mode === 'context-search' && activeContext) {
        const query = value.substring(activeContext.shortcut.length).trim();
        performContextSearch(query);
        return;
      }

      const matching = contexts.filter((ctx) => {
        const all = [ctx.shortcut, ...(ctx.aliases || [])];
        return all.some(
          (s) => s.toLowerCase().startsWith(ctxPart.toLowerCase()) || ctxPart.toLowerCase().startsWith(s.toLowerCase())
        );
      });

      const exact = contexts.find((ctx) => {
        const all = [ctx.shortcut, ...(ctx.aliases || [])];
        return all.some((s) => s.toLowerCase() === ctxPart.toLowerCase());
      });

      if (exact && (queryPart || value.endsWith(' '))) {
        activeContext = exact;
        mode = 'context-search';
        updateContextLabel('Searching in ' + exact.name);
        if (queryPart) performContextSearch(queryPart);
        else { displayItems = []; renderEmpty('Type to search ' + exact.name.toLowerCase()); }
      } else if (ctxPart === ':') {
        mode = 'context-list';
        displayItems = contexts;
        activeIndex = 0;
        updateContextLabel('Search contexts');
        renderItems();
      } else {
        mode = 'context-list';
        displayItems = matching;
        activeIndex = matching.length > 0 ? 0 : -1;
        updateContextLabel('Search contexts');
        renderItems();
      }
    }

    function performContextSearch(query) {
      if (!activeContext) return;
      if (searchTimer) clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        const results = activeContext.onSearch(query);
        if (results instanceof Promise) {
          renderLoading();
          results.then((r) => {
            displayItems = r;
            activeIndex = r.length > 0 ? 0 : -1;
            renderItems(query);
          });
        } else {
          displayItems = results;
          activeIndex = results.length > 0 ? 0 : -1;
          renderItems(query);
        }
      }, 150);
    }

    // ── Global search ──
    function handleGlobalSearch(query) {
      mode = 'global-search';
      updateContextLabel(null);
      if (searchTimer) clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        const q = query.toLowerCase();
        const results = [];

        // Commands matching query
        commands
          .filter((c) => c.name.toLowerCase().includes(q) || c.shortcut.toLowerCase().includes(q) ||
            (c.aliases || []).some((a) => a.toLowerCase().includes(q)))
          .forEach((c) => results.push({
            id: 'cmd-' + c.shortcut, title: c.name,
            subtitle: c.description, icon: c.icon,
            badge: c.shortcut, badgeVariant: '',
            _type: 'command', _command: c,
          }));

        // Contexts matching query
        contexts
          .filter((c) => c.name.toLowerCase().includes(q) || c.shortcut.toLowerCase().includes(q) ||
            (c.aliases || []).some((a) => a.toLowerCase().includes(q)))
          .forEach((c) => results.push({
            id: 'ctx-' + c.shortcut, title: c.name,
            subtitle: c.description, icon: c.icon,
            badge: c.shortcut, badgeVariant: '',
            _type: 'context', _context: c,
          }));

        // Products (max 3)
        products
          .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
          .slice(0, 3)
          .forEach((p) => results.push({
            id: 'product-' + p.id, title: p.name,
            subtitle: `SKU: ${p.sku} • ${p.price}`,
            icon: p.icon, badge: 'Product', badgeVariant: '',
            _type: 'product', data: p,
          }));

        // Users (max 3)
        users
          .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
          .slice(0, 3)
          .forEach((u) => results.push({
            id: 'user-' + u.id, title: u.name,
            subtitle: `${u.email} • ${u.role}`,
            icon: '👤', badge: 'User', badgeVariant: '',
            _type: 'user', data: u,
          }));

        // Orders (max 3)
        orders
          .filter((o) => o.customer.toLowerCase().includes(q) || String(o.id).includes(q))
          .slice(0, 3)
          .forEach((o) => results.push({
            id: 'order-' + o.id, title: `Order #${o.id}`,
            subtitle: `${o.customer} • ${o.total}`,
            icon: '📦', badge: 'Order', badgeVariant: '',
            _type: 'order', data: o,
          }));

        displayItems = results;
        activeIndex = results.length > 0 ? 0 : -1;
        renderItems(query);
      }, 150);
    }

    // ── Selection ──
    function selectItem(index) {
      if (index < 0 || index >= displayItems.length) return;
      const item = displayItems[index];

      switch (mode) {
        case 'command-list':
          // Selected a command — enter it
          input.value = item.shortcut + ' ';
          enterCommandMode(item, '');
          break;

        case 'command-step':
          selectStepOption(item);
          break;

        case 'context-list':
          // Selected a context — enter it
          activeContext = item;
          mode = 'context-search';
          input.value = item.shortcut + ' ';
          updateContextLabel('Searching in ' + item.name);
          displayItems = [];
          renderEmpty('Type to search ' + item.name.toLowerCase());
          break;

        case 'context-search':
          if (activeContext?.onSelect) activeContext.onSelect(item);
          close();
          break;

        case 'global-search':
          if (item._type === 'command') {
            input.value = item._command.shortcut + ' ';
            enterCommandMode(item._command, '');
          } else if (item._type === 'context') {
            activeContext = item._context;
            mode = 'context-search';
            input.value = item._context.shortcut + ' ';
            updateContextLabel('Searching in ' + item._context.name);
            displayItems = [];
            renderEmpty('Type to search ' + item._context.name.toLowerCase());
          } else {
            alert(`Selected: ${item.title} (${item._type})`);
            close();
          }
          break;
      }
    }

    // ── Keyboard navigation ──
    function navigateDown() {
      if (displayItems.length === 0) return;
      activeIndex = activeIndex >= displayItems.length - 1 ? 0 : activeIndex + 1;
      renderItems();
    }

    function navigateUp() {
      if (displayItems.length === 0) return;
      activeIndex = activeIndex <= 0 ? displayItems.length - 1 : activeIndex - 1;
      renderItems();
    }

    function handleEnter() {
      if (activeIndex >= 0 && activeIndex < displayItems.length) {
        selectItem(activeIndex);
      } else if (mode === 'command-step') {
        submitFreeText();
      }
    }

    // ── Event listeners ──
    document.addEventListener('keydown', (e) => {
      // Ctrl+K — toggle palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
        return;
      }

      // Global hotkeys — Alt+key opens palette with command
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key !== 'Alt') {
        const cmd = commands.find((c) => {
          if (!c.hotkey) return false;
          const parts = c.hotkey.toLowerCase().split('+');
          const key = parts[parts.length - 1];
          return e.key.toLowerCase() === key;
        });
        if (cmd) {
          e.preventDefault();
          if (isOpen) { reset(); }
          if (!isOpen) { open(); }
          input.value = cmd.shortcut + ' ';
          enterCommandMode(cmd, '');
          return;
        }
      }
    });

    backdrop.addEventListener('click', close);

    // Display style toggle
    const displayToggle = document.getElementById('commandPaletteDisplayToggle');
    const displayLabel = document.getElementById('commandPaletteDisplayLabel');
    if (displayToggle) {
      displayToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        displayStyle = displayStyle === 'inline' ? 'tokens' : 'inline';
        displayLabel.textContent = displayStyle;
        // Re-render current state
        if (mode === 'command-step') {
          if (displayStyle === 'tokens') {
            input.value = '';
            renderTokens();
          } else {
            tokensEl.innerHTML = '';
            input.value = buildSelectionsDisplay();
          }
        }
        input.focus();
      });
    }

    input.addEventListener('input', processInput);

    input.addEventListener('keydown', (e) => {
      // Alt+key hotkeys work inside the palette too
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key !== 'Alt') {
        const cmd = commands.find((c) => {
          if (!c.hotkey) return false;
          const parts = c.hotkey.toLowerCase().split('+');
          return e.key.toLowerCase() === parts[parts.length - 1];
        });
        if (cmd) {
          e.preventDefault();
          reset();
          input.value = cmd.shortcut + ' ';
          enterCommandMode(cmd, '');
          return;
        }
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          handleEnter();
          break;
      }
    });

    // ── Public API ──
    // Exposed so any trigger (a navbar pill, a sidebar item, a button) can open
    // the palette — which then picks floating vs. fullscreen from the device.
    // Also mirrored onto the shared pureAdmin namespace.
    const api = {
      open() { if (!isOpen) open(); },
      close() { if (isOpen) close(); },
      isOpen() { return isOpen; },
      // Open pre-filled with a query (e.g. a '/command' or ':context'), running
      // the same input pipeline as typing it. Used by the demo's example buttons.
      openWithQuery(query) {
        if (!isOpen) open();
        input.value = query || '';
        processInput();
        input.focus();
      },
      setDisplayStyle(style) {
        if (style !== 'inline' && style !== 'tokens') return;
        displayStyle = style;
        if (displayLabel) displayLabel.textContent = style;
        if (mode === 'command-step') {
          if (style === 'tokens') {
            input.value = '';
            renderTokens();
          } else {
            tokensEl.innerHTML = '';
            input.value = buildSelectionsDisplay();
          }
        }
      },
      getDisplayStyle() { return displayStyle; },
    };
    window.commandPalette = api;
    if (window.pureAdmin) window.pureAdmin.commandPalette = api;

  } // end init
})();
