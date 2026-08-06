/**
 * Pure Admin — Navbar Collapse (progressive, priority-driven, configurable target)
 *
 * Walks the lowest-priority top-nav items out of `.pa-header__nav` when the row
 * can't fit, and restores them as space comes back — the same measure-and-drop
 * loop as `overflow.js` (the toolbar primitive), but for nav `<li>`s instead of
 * buttons, and with TWO collapse targets selected per-nav:
 *
 *   data-pa-nav-collapse="menu"     (default) — items fold into a generated
 *                                     "More ▾" dropdown at the end of the nav.
 *                                     Self-contained; needs no sidebar; works on
 *                                     sidebar-less pages (docs). Nested nav
 *                                     dropdowns render FLAT inside the panel
 *                                     (pure CSS — see _navbar-elements.scss), so
 *                                     there are no cascading hover flyouts.
 *   data-pa-nav-collapse="sidebar"  — items move into a sidebar nav, converted
 *                                     to `.pa-sidebar__*` structure under a
 *                                     `.pa-sidebar__section` heading. Nested nav
 *                                     dropdowns become sidebar submenus (native
 *                                     accordion depth). Needs a sidebar.
 *   data-pa-nav-collapse="off"      — disabled (no-op).
 *
 * Priority: `data-pa-nav-priority` on each `<li>` (default 0). Lowest drops
 * first; ties broken by DOM order, rightmost first. The `--active` item is
 * auto-pinned (effective priority 1000 unless an explicit one is set) so the
 * page you're on never collapses.
 *
 *   <nav class="pa-header__nav" data-pa-nav-collapse="menu">
 *     <ul>
 *       <li class="pa-header__nav-item" data-pa-nav-priority="10"><a href="/">Home</a></li>
 *       <li class="pa-header__nav-item pa-header__nav-item--has-dropdown">
 *         <a href="/x">Products</a>
 *         <ul class="pa-header__dropdown"><li><a href="/a">A</a></li></ul>
 *       </li>
 *     </ul>
 *   </nav>
 *
 * Sidebar-mode config (on the nav):
 *   data-pa-nav-collapse-target="#sel"  — the sidebar <ul> to inject into
 *                                         (default: first `.pa-sidebar__nav > ul`)
 *   data-pa-nav-collapse-label="Menu"   — heading for the injected group
 * Menu-mode config:
 *   data-pa-nav-more-label="More"       — the trigger's label
 *
 * Measurement sums the visible items' widths and compares to the room the nav
 * actually got (`nav.clientWidth`). It deliberately does NOT use scrollWidth +
 * overflow:hidden (overflow.js's trick): clipping the nav would also clip the
 * nav items' own hover dropdowns, which drop below the bar. Instead the layout
 * contract (_navbar-elements.scss) keeps the nav overflow:visible, gives it
 * `min-width:0; flex-shrink:1` and pins the items at `flex-shrink:0`, and makes
 * the enclosing `.pa-header__start` shrinkable — so the nav narrows below its
 * content (making the width sum exceed clientWidth) without any clipping.
 *
 * Diagnostics: `window.PA_NAV_COLLAPSE_DEBUG = true` before load.
 *
 * Public API (window.PaNavCollapse):
 *   init(navEl)     — idempotent single-nav init
 *   initAll(scope)  — init every uninitialised collapse nav under scope
 */
(function () {
    'use strict';

    var INIT_FLAG = '__paNavCollapseInit';
    var SELECTOR = '.pa-header__nav[data-pa-nav-collapse]';
    var PIN_PRIORITY = 1000; // effective priority for the auto-pinned active item

    // Per-element stash keys — mirror overflow.js's className-stash approach so
    // every transform is reversible by restoring the saved value.
    var STASH = '__paNavOrigClass';

    function init(nav) {
        if (!nav || nav[INIT_FLAG]) return;
        var mode = nav.getAttribute('data-pa-nav-collapse');
        if (mode === 'off') return;
        if (mode !== 'menu' && mode !== 'sidebar') mode = 'menu'; // tolerant default
        nav[INIT_FLAG] = true;

        var ul = nav.querySelector(':scope > ul');
        if (!ul) return;

        var DEBUG = window.PA_NAV_COLLAPSE_DEBUG === true;
        function log() {
            if (!DEBUG) return;
            console.log.apply(console, ['[pa-nav-collapse]'].concat(Array.prototype.slice.call(arguments)));
        }

        // Snapshot the original items (direct <li> children) BEFORE we add any
        // generated trigger, so the trigger is never treated as a collapsible.
        var items = Array.prototype.slice.call(ul.children).filter(function (el) {
            return el.nodeType === 1;
        });
        if (items.length === 0) return;

        var ordered = items.map(function (el, idx) {
            var raw = parseInt(el.getAttribute('data-pa-nav-priority'), 10);
            var active = el.classList.contains('pa-header__nav-item--active');
            var priority = isNaN(raw) ? (active ? PIN_PRIORITY : 0) : raw;
            return { el: el, priority: priority, domIndex: idx };
        });

        // Lowest priority drops first; ties → rightmost (higher domIndex) first,
        // so the leftmost/primary links survive longest.
        var dropOrder = ordered.slice().sort(function (a, b) {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.domIndex - a.domIndex;
        });

        log('init', mode, { items: ordered.length, priorities: ordered.map(function (i) { return i.priority; }) });

        var strategy = (mode === 'sidebar')
            ? makeSidebarStrategy(nav, ul, log)
            : makeMenuStrategy(nav, ul, log);

        // Width the visible top-level items (+ the More trigger) currently need,
        // measured directly rather than via scrollWidth — the nav is
        // overflow:visible (so its items' dropdowns aren't clipped), which makes
        // scrollWidth unreliable. Items are flex-shrink:0, so each keeps its
        // natural width and the sum is the true content width.
        function contentWidth() {
            var cs = getComputedStyle(ul);
            var gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
            var total = 0, count = 0, kids = ul.children;
            for (var i = 0; i < kids.length; i++) {
                var k = kids[i];
                if (k.nodeType !== 1) continue;
                if (getComputedStyle(k).display === 'none') continue;
                total += k.getBoundingClientRect().width;
                count++;
            }
            if (count > 1) total += gap * (count - 1);
            return total;
        }
        function overflowing() {
            return contentWidth() > nav.clientWidth + 1; // 1px tolerance for rounding
        }

        function relayout() {
            // Step 1 — restore everything to the nav in DOM order, reset target.
            ordered.slice().sort(function (a, b) { return a.domIndex - b.domIndex; })
                .forEach(function (item) { strategy.restore(item.el); });
            strategy.afterRestore();

            // Step 2 — does it all fit? Compare summed item width to the room the
            // nav actually got (flex shrank it below content when space is tight).
            log('relayout measure', { contentW: Math.round(contentWidth()), clientW: nav.clientWidth, overflow: overflowing() });
            if (!overflowing()) {
                strategy.onFits();
                log('fits — nothing collapsed');
                return;
            }

            // Step 3 — overflow. Let the strategy prepare (e.g. reveal the "More"
            // trigger, which itself takes width), then drop by priority until it
            // fits, re-measuring after each move.
            strategy.onOverflow();
            for (var i = 0; i < dropOrder.length; i++) {
                if (!overflowing()) break;
                strategy.collapse(dropOrder[i].el);
                log('collapsed', (dropOrder[i].el.textContent || '').trim().slice(0, 20), { contentW: Math.round(contentWidth()), clientW: nav.clientWidth });
            }
            log('relayout done', { collapsed: strategy.count ? strategy.count() : '?' });
        }

        // First paint after layout settles, then watch for size changes. We
        // observe the nav AND the header inner: when items have left the nav it
        // sizes to its smaller content and won't fire its own resize when the
        // viewport grows again, so the parent's resize is our "try to restore"
        // signal — same trick overflow.js uses.
        requestAnimationFrame(relayout);

        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function () { relayout(); });
            ro.observe(nav);
            var inner = nav.closest('.pa-navbar__inner') || nav.parentNode;
            if (inner) ro.observe(inner);
        } else {
            window.addEventListener('resize', relayout);
        }
    }

    // ---------------------------------------------------------------------
    // MENU strategy — fold items into a generated "More ▾" nav dropdown.
    // ---------------------------------------------------------------------
    function makeMenuStrategy(nav, ul, log) {
        var moreLabel = nav.getAttribute('data-pa-nav-more-label') || 'More';
        var moreLi = document.createElement('li');
        moreLi.className = 'pa-header__nav-item pa-header__nav-item--more';
        var moreLink = document.createElement('a');
        moreLink.href = '#';
        moreLink.className = 'pa-header__nav-link';
        moreLink.setAttribute('aria-haspopup', 'true');
        moreLink.setAttribute('aria-expanded', 'false');
        moreLink.innerHTML = escapeHtml(moreLabel) +
            ' <span class="pa-header__more-chevron" aria-hidden="true">›</span>';
        moreLi.appendChild(moreLink);
        ul.appendChild(moreLi);
        moreLi.style.display = 'none';

        // The panel lives on <body>, NOT inside the nav — the nav has
        // overflow:hidden (so its scrollWidth is a truthful "overflows?" signal),
        // which would clip an inline dropzone dropping below the bar. Same reason
        // overflow.js parks its menu on the body. Positioned by JS under the
        // trigger; open/close is click-driven (hover-reveal can't reach a
        // body-parented panel).
        var menu = document.createElement('ul');
        menu.className = 'pa-header__dropdown pa-header__more-menu';
        menu.setAttribute('role', 'menu');
        document.body.appendChild(menu);

        function position() {
            var r = moreLink.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = (r.bottom + 4) + 'px';
            menu.style.left = 'auto';
            menu.style.right = (window.innerWidth - r.right) + 'px'; // right-align to trigger
        }
        function isOpen() { return menu.classList.contains('pa-header__more-menu--open'); }
        function openMenu() {
            if (menu.children.length === 0) return;
            position();
            menu.classList.add('pa-header__more-menu--open');
            moreLi.classList.add('is-open');
            moreLink.setAttribute('aria-expanded', 'true');
            window.addEventListener('scroll', position, true);
            window.addEventListener('resize', position);
            setTimeout(function () { document.addEventListener('mousedown', onDocClick); }, 0);
        }
        function closeMenu() {
            menu.classList.remove('pa-header__more-menu--open');
            moreLi.classList.remove('is-open');
            moreLink.setAttribute('aria-expanded', 'false');
            window.removeEventListener('scroll', position, true);
            window.removeEventListener('resize', position);
            document.removeEventListener('mousedown', onDocClick);
        }
        function onDocClick(e) {
            if (menu.contains(e.target) || moreLi.contains(e.target)) return;
            closeMenu();
        }
        moreLink.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            log('More clicked →', isOpen() ? 'closing' : 'opening', { itemsInMenu: menu.children.length });
            if (isOpen()) closeMenu(); else openMenu();
        });
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) setTimeout(closeMenu, 0); // link navigates, then close
        });

        return {
            count: function () { return menu.children.length; },
            restore: function (el) {
                if (el.parentNode === menu) ul.insertBefore(el, moreLi);
            },
            afterRestore: function () {
                moreLi.style.display = 'none'; // hidden until something collapses
                closeMenu();
            },
            onFits: function () { /* nothing to show */ },
            onOverflow: function () {
                moreLi.style.display = ''; // trigger becomes visible (adds width)
            },
            collapse: function (el) {
                menu.appendChild(el); // re-styles via .pa-header__dropdown context
            }
        };
    }

    // ---------------------------------------------------------------------
    // SIDEBAR strategy — convert items to sidebar structure and inject them
    // under a `.pa-sidebar__section` heading in the target sidebar nav.
    // ---------------------------------------------------------------------
    function makeSidebarStrategy(nav, ul, log) {
        var targetSel = nav.getAttribute('data-pa-nav-collapse-target');
        var target = targetSel
            ? document.querySelector(targetSel)
            : document.querySelector('.pa-sidebar__nav > ul');
        var label = nav.getAttribute('data-pa-nav-collapse-label') || 'Menu';

        // Section heading, created lazily so a nav that never overflows leaves
        // the sidebar untouched.
        var section = null;
        function ensureSection() {
            if (!target) return null;
            if (!section) {
                section = document.createElement('li');
                section.className = 'pa-sidebar__section';
                section.setAttribute('data-pa-nav-injected', '');
                section.textContent = label;
                target.insertBefore(section, target.firstChild);
            } else if (section.parentNode !== target) {
                target.insertBefore(section, target.firstChild);
            }
            return section;
        }
        function removeSection() {
            if (section && section.parentNode) section.parentNode.removeChild(section);
        }

        // Reversible className swap: stash the current class on `el` (once) and
        // set the new one. `restoreClass` puts the original back.
        function swapClass(el, cls) {
            if (el[STASH] == null) el[STASH] = el.className;
            el.className = cls;
        }
        function restoreClass(el) {
            if (el[STASH] != null) { el.className = el[STASH]; el[STASH] = null; }
        }

        // Convert a nav <li> into sidebar structure (reversible). A plain link
        // becomes a `.pa-sidebar__item > .pa-sidebar__link`; an item with a nav
        // dropdown becomes a sidebar item whose child <ul> is an always-open
        // submenu (so no toggle wiring is needed and depth still reads clearly).
        function toSidebar(li) {
            swapClass(li, 'pa-sidebar__item');
            var link = directChild(li, 'a');
            if (link) swapClass(link, 'pa-sidebar__link');
            var sub = directChild(li, 'ul');
            if (sub) {
                swapClass(sub, 'pa-sidebar__submenu pa-sidebar__submenu--open');
                var subItems = Array.prototype.slice.call(sub.children);
                for (var i = 0; i < subItems.length; i++) {
                    var sli = subItems[i];
                    if (sli.nodeType !== 1) continue;
                    swapClass(sli, 'pa-sidebar__item');
                    var sa = sli.querySelector('a');
                    if (sa) swapClass(sa, 'pa-sidebar__link');
                }
            }
        }
        function fromSidebar(li) {
            var link = directChild(li, 'a');
            if (link) restoreClass(link);
            var sub = directChild(li, 'ul');
            if (sub) {
                var subItems = sub.querySelectorAll('a, li');
                for (var i = 0; i < subItems.length; i++) restoreClass(subItems[i]);
                restoreClass(sub);
            }
            restoreClass(li);
        }

        if (!target) log('sidebar mode: no target sidebar found', targetSel || '(default .pa-sidebar__nav > ul)');

        return {
            count: function () { return target ? target.querySelectorAll('[data-pa-nav-collapsed]').length : 0; },
            restore: function (el) {
                if (target && el.parentNode === target) {
                    fromSidebar(el);
                    el.removeAttribute('data-pa-nav-collapsed');
                    ul.appendChild(el); // order fixed by relayout's DOM-order pass
                }
            },
            afterRestore: function () {
                // If nothing is collapsed after a restore pass, drop the heading.
                if (target && !target.querySelector('[data-pa-nav-collapsed]')) removeSection();
            },
            onFits: function () { removeSection(); },
            onOverflow: function () { ensureSection(); },
            collapse: function (el) {
                if (!target) return;
                ensureSection();
                toSidebar(el);
                el.setAttribute('data-pa-nav-collapsed', '');
                target.insertBefore(el, section.nextSibling);
            }
        };
    }

    // First matching direct-child element by tag name (used to find a nav item's
    // own <a> / nested <ul> without descending into a dropdown's inner items).
    function directChild(parent, tag) {
        for (var c = parent.firstElementChild; c; c = c.nextElementSibling) {
            if (c.tagName && c.tagName.toLowerCase() === tag) return c;
        }
        return null;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function initAll(scope) {
        var nodes = (scope || document).querySelectorAll(SELECTOR);
        for (var i = 0; i < nodes.length; i++) init(nodes[i]);
    }

    window.PaNavCollapse = { init: init, initAll: initAll };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }
})();
