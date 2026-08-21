/**
 * Pure Admin — Navbar Collapse (progressive, priority-driven, configurable target)
 *
 * Walks the lowest-priority top-nav items out of `.pa-navmenu` when the row
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
 *   data-pa-nav-collapse="sidebar"  — items are rebuilt as genuine
 *                                     `.pa-sidebar__*` markup under a
 *                                     `.pa-sidebar__section` heading: a leaf
 *                                     becomes a link item; a dropdown parent
 *                                     becomes a collapsible toggle group
 *                                     (chevron, starts closed) whose first
 *                                     child is the parent's own page. Nested
 *                                     dropdowns recurse to nested groups. Needs
 *                                     a sidebar.
 *   data-pa-nav-collapse="off"      — disabled (no-op).
 *
 * Priority: `data-pa-nav-priority` on each `<li>` (default 0). Lowest drops
 * first; ties broken by DOM order, rightmost first. The `--active` (current
 * page) item is treated like any other — it collapses to the menu/sidebar when
 * the row runs out of room. Give an item a high `data-pa-nav-priority` if you
 * want it to survive longest.
 *
 *   <nav class="pa-navmenu" data-pa-nav-collapse="menu">
 *     <ul>
 *       <li class="pa-navmenu__item" data-pa-nav-priority="10"><a href="/">Home</a></li>
 *       <li class="pa-navmenu__item pa-navmenu__item--has-dropdown">
 *         <a href="/x">Products</a>
 *         <ul class="pa-navmenu__dropdown"><li><a href="/a">A</a></li></ul>
 *       </li>
 *     </ul>
 *   </nav>
 *
 * Sidebar-mode config (on the nav):
 *   data-pa-nav-collapse-target="#sel"  — the sidebar <ul> to inject into
 *                                         (default: first `.pa-sidebar__nav > ul`)
 *   data-pa-nav-collapse-label="Menu"   — heading for the injected group
 *   data-pa-nav-collapse-icon="•"       — default icon for injected items
 *                                         ("" to omit); per item: data-pa-nav-icon
 * Per-<li> (either mode):
 *   data-pa-nav-icon="🏠"               — icon shown when moved to the sidebar
 *   data-pa-nav-collapse="hide"         — don't relocate this item; just hide it
 *                                         when it doesn't fit (priority still
 *                                         decides when)
 * Menu-mode config:
 *   data-pa-nav-more-label="More"       — the trigger's label
 *
 * Measurement sums the visible items' widths and compares to the room the nav
 * actually got (`nav.clientWidth`). It deliberately does NOT use scrollWidth +
 * overflow:hidden (overflow.js's trick): clipping the nav would also clip the
 * nav items' own hover dropdowns, which drop below the bar. Instead the layout
 * contract (_navbar-elements.scss) keeps the nav overflow:visible, gives it
 * `min-width:0; flex-shrink:1` and pins the items at `flex-shrink:0`, and makes
 * the enclosing `.pa-navbar__start` shrinkable — so the nav narrows below its
 * content (making the width sum exceed clientWidth) without any clipping.
 *
 * Diagnostics: `pureAdmin.debug.enable('navCollapse')`.
 *
 * Public API (pureAdmin.components.navCollapse):
 *   init(navEl)     — idempotent single-nav init
 *   initAll(scope)  — init every uninitialised collapse nav under scope
 */
(function () {
    'use strict';

    var INIT_FLAG = '__paNavCollapseInit';
    var SELECTOR = '.pa-navmenu[data-pa-nav-collapse]';
    var relayouts = []; // every initialised nav's relayout fn (for relayoutAll)

    function init(nav) {
        if (!nav || nav[INIT_FLAG]) return;
        var mode = nav.getAttribute('data-pa-nav-collapse');
        if (mode === 'off') return;
        if (mode !== 'menu' && mode !== 'sidebar') mode = 'menu'; // tolerant default
        nav[INIT_FLAG] = true;

        var ul = nav.querySelector(':scope > ul');
        if (!ul) return;

        var DEBUG = !!(window.pureAdmin && window.pureAdmin.debug && window.pureAdmin.debug.isEnabled('navCollapse'));
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
            var priority = isNaN(raw) ? 0 : raw;
            // Per-item override: data-pa-nav-collapse="hide" means "don't relocate
            // me to the menu/sidebar — just hide me when I don't fit". Handled at
            // the engine level so it works in either mode; still ordered like any
            // other item (priority decides WHEN it drops).
            var hide = el.getAttribute('data-pa-nav-collapse') === 'hide';
            return { el: el, priority: priority, domIndex: idx, hide: hide };
        });

        // Lowest priority drops first; ties → rightmost (higher domIndex) first,
        // so the leftmost/primary links survive longest. The active (current-page)
        // item is NOT special — it collapses to the menu/sidebar like any other
        // item when the row runs out of room. To keep a given item on the bar
        // longest, give it a high data-pa-nav-priority explicitly.
        var dropOrder = ordered.slice()
            .sort(function (a, b) {
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
            // `hide` items are un-hidden here; all others go back via the strategy.
            ordered.slice().sort(function (a, b) { return a.domIndex - b.domIndex; })
                .forEach(function (item) {
                    if (item.hide) item.el.style.display = '';
                    strategy.restore(item.el);
                });
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
                if (dropOrder[i].hide) {
                    dropOrder[i].el.style.display = 'none'; // just drop it, don't relocate
                } else {
                    strategy.collapse(dropOrder[i].el);
                }
                log(dropOrder[i].hide ? 'hid' : 'collapsed', (dropOrder[i].el.textContent || '').trim().slice(0, 20), { contentW: Math.round(contentWidth()), clientW: nav.clientWidth });
            }
            log('relayout done', { collapsed: strategy.count ? strategy.count() : '?' });
        }

        // Register this nav's relayout so navbar-fit can fold navs BEFORE it
        // measures the header (otherwise it measures an un-folded nav, thinks the
        // row overflows, and over-degrades the other slots).
        relayouts.push(relayout);

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
        } else if (window.pureAdmin && window.pureAdmin.events) {
            window.pureAdmin.events.on('viewport:resize', relayout); // shared throttled source
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
        moreLi.className = 'pa-navmenu__item pa-navmenu__item--more';
        var moreLink = document.createElement('a');
        moreLink.href = '#';
        moreLink.className = 'pa-navmenu__link';
        moreLink.setAttribute('aria-haspopup', 'true');
        moreLink.setAttribute('aria-expanded', 'false');
        moreLink.innerHTML = escapeHtml(moreLabel) +
            ' <span class="pa-navmenu__more-chevron" aria-hidden="true">›</span>';
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
        menu.className = 'pa-navmenu__dropdown pa-navmenu__more-menu';
        menu.setAttribute('role', 'menu');
        document.body.appendChild(menu);

        function position() {
            var r = moreLink.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = (r.bottom + 4) + 'px';
            menu.style.left = 'auto';
            menu.style.right = (window.innerWidth - r.right) + 'px'; // right-align to trigger
        }
        function isOpen() { return menu.classList.contains('pa-navmenu__more-menu--open'); }
        function openMenu() {
            if (menu.children.length === 0) return;
            position();
            menu.classList.add('pa-navmenu__more-menu--open');
            moreLi.classList.add('is-open');
            moreLink.setAttribute('aria-expanded', 'true');
            window.addEventListener('scroll', position, true);
            window.addEventListener('resize', position);
            setTimeout(function () { document.addEventListener('mousedown', onDocClick); }, 0);
        }
        function closeMenu() {
            menu.classList.remove('pa-navmenu__more-menu--open');
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
            onOverflow: function () { /* trigger revealed lazily on first collapse */ },
            collapse: function (el) {
                moreLi.style.display = ''; // trigger becomes visible (adds width)
                menu.appendChild(el); // re-styles via .pa-navmenu__dropdown context
            }
        };
    }

    // ---------------------------------------------------------------------
    // SIDEBAR strategy — BUILD genuine `.pa-sidebar__*` markup from each nav
    // item and inject it under a `.pa-sidebar__section` heading in the target
    // sidebar nav. The navbar and sidebar are different DOM shapes (a bare
    // `<a>` vs icon/label spans; a hover dropdown vs a toggle-button
    // accordion), so a className swap can't bridge them — the swapped item
    // would be link-shaped, icon-less and always-open, visibly "in its own
    // style". Instead we build a proper sidebar node from each nav item and
    // keep the ORIGINAL nav `<li>` detached aside; restoring drops the built
    // clone and re-inserts the original. A leaf becomes a link item; a
    // dropdown parent becomes a collapsible toggle group (chevron, starts
    // CLOSED) whose first child is the parent's own destination, per the
    // "Toggle + Overview child" model — matching a hand-authored sidebar 1:1.
    // ---------------------------------------------------------------------
    function makeSidebarStrategy(nav, ul, log) {
        var targetSel = nav.getAttribute('data-pa-nav-collapse-target');
        var target = targetSel
            ? document.querySelector(targetSel)
            : document.querySelector('.pa-sidebar__nav > ul');
        var label = nav.getAttribute('data-pa-nav-collapse-label') || 'Menu';
        // Nav items carry no icons; sidebar items conventionally do. Give each a
        // default marker (a bullet), overridable per-item via data-pa-nav-icon
        // or globally via data-pa-nav-collapse-icon (set "" to omit icons).
        var defaultIcon = nav.getAttribute('data-pa-nav-collapse-icon');
        if (defaultIcon == null) defaultIcon = '•';

        // Section heading + trailing divider, created lazily so a nav that never
        // overflows leaves the sidebar untouched. The divider is pinned directly
        // after the heading and collapsed items are inserted BETWEEN the two, so
        // it always sits at the bottom of the injected block — a rule between the
        // folded-in navbar items and the sidebar's own links.
        var section = null, divider = null;
        function ensureSection() {
            if (!target) return null;
            if (!section) {
                section = document.createElement('li');
                section.className = 'pa-sidebar__section';
                section.setAttribute('data-pa-nav-injected', '');
                section.textContent = label;
            }
            if (!divider) {
                divider = document.createElement('li');
                divider.className = 'pa-sidebar__divider';
                divider.setAttribute('data-pa-nav-injected', '');
                divider.setAttribute('aria-hidden', 'true');
            }
            if (section.parentNode !== target) target.insertBefore(section, target.firstChild);
            if (divider.parentNode !== target) target.insertBefore(divider, section.nextSibling);
            return section;
        }
        function removeSection() {
            if (section && section.parentNode) section.parentNode.removeChild(section);
            if (divider && divider.parentNode) divider.parentNode.removeChild(divider);
        }

        // --- DOM builders -------------------------------------------------
        // The link's own text, trimmed, minus a trailing flyout marker (›/»/>)
        // — that arrow was a horizontal affordance for the navbar hover
        // dropdown and is redundant next to a sidebar chevron.
        function labelOf(a) {
            return (a ? a.textContent : '').replace(/\s*[›»>]+\s*$/, '').trim();
        }
        function iconHtml(icon) {
            return icon ? '<span class="pa-sidebar__icon">' + escapeHtml(icon) + '</span>' : '';
        }
        function labelHtml(text) {
            return '<span class="pa-sidebar__label">' + escapeHtml(text) + '</span>';
        }
        function buildLinkItem(text, href, icon, active) {
            var li = document.createElement('li');
            li.className = 'pa-sidebar__item';
            var a = document.createElement('a');
            a.className = 'pa-sidebar__link' + (active ? ' pa-sidebar__link--active' : '');
            a.setAttribute('href', href == null ? '#' : href);
            a.innerHTML = iconHtml(icon) + labelHtml(text);
            li.appendChild(a);
            return li;
        }

        // Recursively convert a nav <li> into a sidebar <li>.
        function buildSidebarItem(navLi) {
            var link = directChild(navLi, 'a');
            var sub = directChild(navLi, 'ul');
            var icon = navLi.getAttribute('data-pa-nav-icon');
            if (icon == null) icon = defaultIcon;
            var text = labelOf(link);
            var href = link ? link.getAttribute('href') : null;
            var active = navLi.classList.contains('pa-navmenu__item--active');
            var isReal = href && href !== '#' && href.charAt(href.length - 1) !== '#';

            if (!sub) return buildLinkItem(text, href, icon, active);

            // Group → toggle button + submenu (open iff this branch is active).
            var li = document.createElement('li');
            li.className = 'pa-sidebar__item' + (active ? ' pa-sidebar__item--open' : '');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pa-sidebar__toggle';
            btn.setAttribute('aria-expanded', active ? 'true' : 'false');
            btn.innerHTML = iconHtml(icon) + labelHtml(text) +
                '<span class="pa-sidebar__chevron" aria-hidden="true">›</span>';
            li.appendChild(btn);

            var submenu = document.createElement('ul');
            submenu.className = 'pa-sidebar__submenu' + (active ? ' pa-sidebar__submenu--open' : '');
            // Parent's own page becomes the first child (only for a real dest).
            if (isReal) submenu.appendChild(buildLinkItem(text, href, icon, active));
            for (var c = sub.firstElementChild; c; c = c.nextElementSibling) {
                if (c.tagName && c.tagName.toLowerCase() === 'li') submenu.appendChild(buildSidebarItem(c));
            }
            li.appendChild(submenu);

            // Self-wired accordion (mirrors the demo's toggleSubmenu: flip
            // --open on the item, for the chevron, AND the submenu, for display).
            btn.addEventListener('click', function () {
                var open = !li.classList.contains('pa-sidebar__item--open');
                li.classList.toggle('pa-sidebar__item--open', open);
                submenu.classList.toggle('pa-sidebar__submenu--open', open);
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
            return li;
        }

        if (!target) log('sidebar mode: no target sidebar found', targetSel || '(default .pa-sidebar__nav > ul)');

        return {
            count: function () { return target ? target.querySelectorAll('[data-pa-nav-collapsed]').length : 0; },
            restore: function (el) {
                if (el.__paCollapsed) {
                    var node = el.__paSidebarNode;
                    if (node && node.parentNode) node.parentNode.removeChild(node);
                    el.__paSidebarNode = null;
                    el.__paCollapsed = false;
                }
                // Re-append EVERY item each pass (not just formerly-collapsed
                // ones) so the final navbar order matches DOM order regardless
                // of which items were folded away.
                ul.appendChild(el);
            },
            afterRestore: function () {
                // If nothing is collapsed after a restore pass, drop the heading.
                if (target && !target.querySelector('[data-pa-nav-collapsed]')) removeSection();
            },
            onFits: function () { removeSection(); },
            onOverflow: function () { /* heading + divider created lazily on first collapse */ },
            collapse: function (el) {
                if (!target || el.__paCollapsed) return;
                ensureSection();
                var node = buildSidebarItem(el);
                node.setAttribute('data-pa-nav-collapsed', '');
                el.__paSidebarNode = node;
                el.__paCollapsed = true;
                if (el.parentNode) el.parentNode.removeChild(el);
                // Insert just under the heading; because we collapse rightmost
                // (lowest-priority) first and always insert at the top of the
                // group, the final order reads left-to-right = DOM order.
                target.insertBefore(node, section.nextSibling);
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

    // Re-fold every nav synchronously. navbar-fit calls this before it measures,
    // so it sees navs at their collapsed width rather than over-degrading the
    // rest of the header to make room for items that were about to fold anyway.
    function relayoutAll() {
        for (var i = 0; i < relayouts.length; i++) {
            try { relayouts[i](); } catch (e) { /* ignore */ }
        }
    }

    var pa = (window.pureAdmin = window.pureAdmin || {});
    (pa.components = pa.components || {}).navCollapse = { init: init, initAll: initAll, relayoutAll: relayoutAll };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }
})();
