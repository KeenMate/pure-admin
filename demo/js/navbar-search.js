/**
 * Navbar inline search (search position "A") — a LIVE search box with its own
 * results dropdown, independent of the Ctrl+K command palette. This is demo
 * behavior: Pure Admin ships the markup + CSS (.pa-navbar-search--field +
 * .pa-search-autocomplete), and a consumer wires results however they like
 * (their API, their router). Here we filter a small demo dataset.
 *
 * Reuses the shared .pa-search-autocomplete popup classes so it matches every
 * other autocomplete in the framework.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const input = document.getElementById('navbarSearchInput');
    const results = document.getElementById('navbarSearchResults');
    if (!input || !results) return;

    // Demo dataset — pages, products, and people. A real app would query a
    // backend; the shape (name + type + icon) is all the popup needs.
    const DATA = [
      { name: 'Dashboard', type: 'Page', icon: '📊', href: '/' },
      { name: 'Getting Started', type: 'Page', icon: '🚀', href: '/getting-started' },
      { name: 'Command Palette', type: 'Page', icon: '⌨️', href: '/components/command-palette' },
      { name: 'Tables', type: 'Page', icon: '📋', href: '/tables/standard' },
      { name: 'Alerts', type: 'Page', icon: '🔔', href: '/components/alerts' },
      { name: 'MacBook Pro 16"', type: 'Product', icon: '💻', href: '#' },
      { name: 'iPhone 15 Pro', type: 'Product', icon: '📱', href: '#' },
      { name: 'AirPods Pro', type: 'Product', icon: '🎧', href: '#' },
      { name: 'Apple Watch Ultra', type: 'Product', icon: '⌚', href: '#' },
      { name: 'John Doe', type: 'User', icon: '👤', href: '#' },
      { name: 'Jane Smith', type: 'User', icon: '👤', href: '#' },
      { name: 'Order #1001', type: 'Order', icon: '📦', href: '#' },
      { name: 'Invoice #INV-501', type: 'Invoice', icon: '📄', href: '#' }
    ];

    let matches = [];
    let activeIndex = -1;
    let timer = null;

    const debounceDelay =
      (window.pureAdmin && window.pureAdmin.config && window.pureAdmin.config.typingDebounceDelay) || 300;

    function open() { results.hidden = false; }
    function close() { results.hidden = true; activeIndex = -1; }

    function filter(query) {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return DATA.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 8);
    }

    function highlight(text, query) {
      const q = query.trim();
      if (!q) return text;
      const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return text.replace(re, '<mark>$1</mark>');
    }

    function render(query) {
      if (matches.length === 0) {
        results.innerHTML = '<div class="pa-search-autocomplete__empty">No results found</div>';
        open();
        return;
      }
      results.innerHTML = matches
        .map((d, i) => (
          '<div class="pa-search-autocomplete__item' + (i === activeIndex ? ' pa-search-autocomplete__item--active' : '') + '" data-index="' + i + '">' +
            '<span class="pa-search-autocomplete__item-icon" aria-hidden="true">' + d.icon + '</span>' +
            '<span class="pa-search-autocomplete__item-name">' + highlight(d.name, query) + '</span>' +
            '<span class="pa-search-autocomplete__item-type">' + d.type + '</span>' +
          '</div>'
        ))
        .join('');
      open();
      results.querySelectorAll('.pa-search-autocomplete__item').forEach((el) => {
        el.addEventListener('mousedown', (e) => {
          e.preventDefault(); // keep focus in the input
          select(parseInt(el.dataset.index, 10));
        });
      });
    }

    function select(index) {
      const item = matches[index];
      if (!item) return;
      close();
      if (item.href && item.href !== '#') {
        window.location.href = item.href;
      } else {
        input.value = item.name;
      }
    }

    function search() {
      const query = input.value;
      matches = filter(query);
      activeIndex = matches.length > 0 ? 0 : -1;
      if (!query.trim()) { close(); return; }
      render(query);
    }

    input.addEventListener('input', () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(search, debounceDelay);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim() && matches.length) open();
    });

    input.addEventListener('keydown', (e) => {
      if (results.hidden) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, matches.length - 1);
          render(input.value);
          break;
        case 'ArrowUp':
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, 0);
          render(input.value);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0) select(activeIndex);
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    });

    // Close when focus/clicks leave the field.
    document.addEventListener('click', (e) => {
      const field = document.getElementById('navbarSearchInline');
      if (field && !field.contains(e.target)) close();
    });
  }
})();
