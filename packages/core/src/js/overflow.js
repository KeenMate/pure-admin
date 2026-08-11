/**
 * Pure Admin — Overflow (progressive-collapse row)
 *
 * Generic progressive-collapse primitive: a horizontal row of children that
 * walks the lowest-priority items into a "more" menu when the row can't fit,
 * and restores them as space comes back. Originally lived as the
 * `pa-card__actions--overflow` variant in `_cards.scss`; promoted to a
 * standalone block (`pa-overflow`) so toolbars, button bars, breadcrumbs,
 * tab rows, chip rows — anything with a flex row of inline-block children —
 * can reuse it without the card scaffolding.
 *
 * Auto-inits on:
 *   .pa-overflow                 — the generic primitive (preferred)
 *   .pa-card__actions--overflow  — the card-flavoured alias (back-compat)
 *
 * Drop order: lowest `data-pa-actions-priority` (default 0) drops first.
 * Ties broken by DOM order, with the tiebreak direction set on the wrapper:
 *
 *   data-pa-actions-overflow-from="end"   (default) — rightmost drops first
 *   data-pa-actions-overflow-from="start"           — leftmost drops first
 *
 * Pin a button so it never collapses by giving it a high priority (e.g. 10).
 *
 *   <div class="pa-overflow" data-pa-actions-overflow-from="end">
 *     <button class="pa-btn pa-btn--xs">Save</button>
 *     <button class="pa-btn pa-btn--xs">Format</button>
 *     <button class="pa-btn pa-btn--xs"
 *             data-pa-actions-priority="10">Run</button>
 *   </div>
 *
 * Algorithm: restore everything to the wrapper, check `scrollWidth >
 * clientWidth`, move items by ascending priority until it fits. Avoids
 * the cached-width math entirely — what the browser thinks fits is the
 * source of truth.
 *
 * Layout contract: the wrapper needs `min-width: 0; overflow: hidden;
 * flex-shrink: 1` so the row actually shrinks below its content (otherwise
 * `scrollWidth > clientWidth` never becomes truthful). `_overflow.scss`
 * supplies that for `.pa-overflow`; the card variant carries equivalent
 * rules in `_cards.scss` under `.pa-card__header`.
 *
 * Opt in to console diagnostics: `pureAdmin.debug.enable('overflow')`.
 *
 * Public API (pureAdmin.components.overflow):
 *   init(el)       — idempotent single-element init
 *   initAll(scope) — initialize all uninitialized overflow wrappers under scope
 *
 * Also bound as `pureAdmin.components.cardActionsOverflow` (same { init, initAll }).
 */
(function () {
    'use strict';

    var INIT_FLAG = '__paOverflowInit';

    // Selectors we auto-init on. The card-actions modifier stays in the
    // list so existing markup keeps working without having to add the
    // generic class manually.
    var SELECTOR = '.pa-overflow, .pa-card__actions--overflow';

    function matchesContract(el) {
        return el && el.classList && (
            el.classList.contains('pa-overflow') ||
            el.classList.contains('pa-card__actions--overflow')
        );
    }

    // Floating UI (optional) — used to position the overflow menu. Mirrors
    // the helpers `split-button.js` pulls from `window.FloatingUIDOM`. We
    // capture them once at module scope so each instance doesn't repeat
    // the lookup; if the library isn't loaded we transparently fall back
    // to a hand-rolled `getBoundingClientRect` positioner below.
    var FUI = window.FloatingUIDOM || null;

    // Shared menu-dismissal registry (see split-button.js for the canonical
    // definition). Defined defensively here too so overflow.js works even if
    // it loads before split-button.js. Opening any menu closes the others, so
    // an overflow "more" menu and a split-button dropdown can't hang open over
    // each other.
    var pa = (window.pureAdmin = window.pureAdmin || {});
    var PaMenus = (pa.menus = pa.menus || {
        closers: [],
        register: function (fn) { this.closers.push(fn); return fn; },
        closeOthers: function (self) {
            this.closers.forEach(function (fn) {
                if (fn !== self) { try { fn(); } catch (e) { /* ignore */ } }
            });
            if (pa.events) pa.events.emit('menu:opened', { id: self && self.paMenuId });
        }
    });

    function init(root) {
        if (!root || root[INIT_FLAG]) return;
        if (!matchesContract(root)) return;
        root[INIT_FLAG] = true;

        var items = Array.prototype.slice.call(root.children).filter(function (el) {
            return el.nodeType === 1;
        });
        if (items.length === 0) return;

        var ordered = items.map(function (el, idx) {
            var p = parseInt(el.getAttribute('data-pa-actions-priority'), 10);
            return { el: el, priority: isNaN(p) ? 0 : p, domIndex: idx };
        });

        // Drop order recomputed on every relayout via `buildDropOrder()` —
        // cheap (one sort over N items) and means the wrapper's
        // `data-pa-actions-overflow-from` attribute can be flipped at
        // runtime (a MutationObserver below also forces a re-layout when
        // that attribute changes).
        var dropOrder = [];
        function buildDropOrder() {
            var fromAttr = root.getAttribute('data-pa-actions-overflow-from');
            var dropFromStart = fromAttr === 'start';
            dropOrder = ordered.slice().sort(function (a, b) {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return dropFromStart ? (a.domIndex - b.domIndex) : (b.domIndex - a.domIndex);
            });
        }
        buildDropOrder();

        // Opt-in diagnostics — `pureAdmin.debug.enable('overflow')` before the
        // relevant init to see init / relayout / move-to-menu traces.
        var DEBUG = !!(pa.debug && pa.debug.isEnabled('overflow'));
        var instanceLabel = '[pa-overflow#' + (root.id || ordered.map(function (i) { return i.el.tagName; }).join('-')).slice(0, 40) + ']';
        function log() {
            if (!DEBUG) return;
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, [instanceLabel].concat(args));
        }

        // Trigger button — the "..." affordance. It's a STANDARD button by
        // default: `pa-btn--secondary` gives it the same border + surface as any
        // other secondary button in the toolbar, and `pa-btn--icon-only` gives
        // it a square footprint matching a split-button toggle (31px at xs). So
        // it reads as an ordinary member of the button family, not a bare glyph
        // — and it does so from the button variants alone, without depending on
        // a theme-specific `.pa-overflow__trigger` rule existing.
        //
        // Ghost is the SPECIAL case, opt-in per wrapper:
        //   <div class="pa-overflow" data-pa-overflow-trigger="ghost">
        // swaps the secondary chrome for the chromeless ghost look.
        //
        // Carries the card-flavoured class too so existing SCSS targeting
        // `.pa-card__actions-overflow-trigger` (themes / consumer overrides)
        // keeps working without a coordinated update.
        var triggerVariant = root.getAttribute('data-pa-overflow-trigger') === 'ghost'
            ? 'pa-btn--ghost'
            : 'pa-btn--secondary';
        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'pa-btn pa-btn--xs pa-btn--icon-only ' + triggerVariant +
            ' pa-overflow__trigger pa-card__actions-overflow-trigger';
        trigger.setAttribute('aria-label', 'More actions');
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = '<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>';
        trigger.style.display = 'none';
        root.appendChild(trigger);

        // Menu reuses pa-btn-split__menu — same container styling and
        // `--open` toggle behaviour as the standard split button, no
        // parallel styling to maintain. Lives on <body> so card / wrapper
        // overflow:hidden can't clip it; positioned via Floating UI.
        var menu = document.createElement('div');
        menu.className = 'pa-btn-split__menu';
        menu.setAttribute('role', 'menu');
        document.body.appendChild(menu);
        var menuInner = document.createElement('div');
        menuInner.className = 'pa-btn-split__menu-inner';
        menu.appendChild(menuInner);

        log('init', { itemCount: ordered.length, priorities: ordered.map(function (i) { return i.priority; }) });

        var ICON_STASH = '__paOverflowIconOrigClass';

        function isSplit(el) {
            return el.classList && el.classList.contains('pa-btn-split');
        }

        // The split button's own primary action, identified by EXCLUSION so
        // it's found in both states: expanded it's a `.pa-btn`, but once
        // collapsed we reclass it to `.pa-btn-split__item` (dropping `.pa-btn`)
        // — a class-based lookup would then miss it on restore and leave it
        // stuck as a menu row with an empty group label. The primary is simply
        // the first child that isn't the toggle, the dropdown, or our label.
        function splitPrimary(splitEl) {
            for (var c = splitEl.firstElementChild; c; c = c.nextElementSibling) {
                if (!c.classList) continue;
                if (c.classList.contains('pa-btn-split__toggle')) continue;
                if (c.classList.contains('pa-btn-split__menu')) continue;
                if (c.classList.contains('pa-btn-split__group-label')) continue;
                return c;
            }
            return null;
        }

        // Reclassing a `.pa-btn` to `.pa-btn-split__item` drops the pa-btn
        // icon-column rule (`.pa-btn:has(.pa-btn__icon) .pa-btn__icon`), so an
        // absorbed icon goes auto-width and throws the label out of column.
        // Rename it to the canonical `pa-btn-split__item-icon` and restore on
        // the way back.
        function rewriteIcons(el) {
            var icons = el.querySelectorAll('.pa-btn__icon');
            for (var i = 0; i < icons.length; i++) {
                if (icons[i][ICON_STASH] == null) icons[i][ICON_STASH] = icons[i].className;
                icons[i].className = 'pa-btn-split__item-icon';
            }
        }
        function restoreIcons(el) {
            var icons = el.querySelectorAll('.pa-btn-split__item-icon');
            for (var i = 0; i < icons.length; i++) {
                if (icons[i][ICON_STASH] != null) icons[i].className = icons[i][ICON_STASH];
            }
        }

        // Collapse a WHOLE split button into the menu as an atomic group:
        // a section label + the primary action + the split's own menu items,
        // kept together. Reuses `.pa-btn-split--in-overflow` (SCSS) to unfold
        // the split's dropdown in place, so the split button's own options
        // stay attached to its label instead of scattering into the row.
        function moveSplitToMenu(el) {
            if (el.__paOverflowOrigClass == null) el.__paOverflowOrigClass = el.className;
            // Keep the base pa-btn-split class so inner __menu / __item
            // selectors still match; just add the in-overflow modifier.
            el.className = el.__paOverflowOrigClass + ' pa-btn-split--in-overflow';

            var primary = splitPrimary(el);
            if (primary && primary.__paOverflowOrigClass == null) {
                primary.__paOverflowOrigClass = primary.className;
                primary.className = 'pa-btn-split__item';
                rewriteIcons(primary);
            }

            // Section heading — a `data-pa-overflow-label` override wins,
            // else the primary action's own text.
            if (!el.__paOverflowGroupLabel) {
                var label = document.createElement('div');
                label.className = 'pa-btn-split__group-label';
                label.textContent = el.getAttribute('data-pa-overflow-label') ||
                    (primary ? primary.textContent.trim() : '');
                el.insertBefore(label, el.firstChild);
                el.__paOverflowGroupLabel = label;
            }
            menuInner.appendChild(el);
        }

        function restoreSplit(el) {
            var primary = splitPrimary(el);
            if (primary && primary.__paOverflowOrigClass != null) {
                primary.className = primary.__paOverflowOrigClass;
                primary.__paOverflowOrigClass = null;
                restoreIcons(primary);
            }
            if (el.__paOverflowGroupLabel) {
                el.__paOverflowGroupLabel.remove();
                el.__paOverflowGroupLabel = null;
            }
            if (el.__paOverflowOrigClass != null) el.className = el.__paOverflowOrigClass;
        }

        // When we move an item into the menu we replace its classList with
        // `pa-btn-split__item` so it adopts the standard split-button menu
        // row styling; the original classList is stashed on the element
        // itself and restored on the way back. A `.pa-btn-split` child is the
        // exception — it collapses as an atomic labeled group instead.
        //
        // We also rename any `.pa-btn__icon` inside the row to
        // `.pa-btn-split__item-icon` (same helper the split primary uses):
        // reclassing to `.pa-btn-split__item` drops the `.pa-btn:has(icon)`
        // rule that gives the icon its fixed column width, so WITHOUT this the
        // icons render at natural width and the labels zig-zag. Renaming puts
        // every row's icon in the same fixed column, exactly like a real
        // split-button menu — one shared alignment for both.
        function moveToMenu(el) {
            if (isSplit(el)) {
                moveSplitToMenu(el);
                return;
            }
            if (el.__paOverflowOrigClass == null) {
                el.__paOverflowOrigClass = el.className;
            }
            el.className = 'pa-btn-split__item';
            rewriteIcons(el);
            menuInner.appendChild(el);
        }

        function moveToRoot(el) {
            if (isSplit(el)) {
                restoreSplit(el);
            } else if (el.__paOverflowOrigClass != null) {
                restoreIcons(el);
                el.className = el.__paOverflowOrigClass;
            }
            // insertBefore moves the node if it's already attached, so we
            // always call it — that keeps the items in original DOM order
            // even after a drop-from-start cycle reshuffled them.
            root.insertBefore(el, trigger);
        }

        function relayout() {
            log('relayout entered');

            // Step 1 — bring everything back to root in DOM order, hide trigger.
            ordered.slice().sort(function (a, b) {
                return a.domIndex - b.domIndex;
            }).forEach(function (item) {
                moveToRoot(item.el);
            });
            trigger.style.display = 'none';

            // Step 2 — does everything fit? `scrollWidth > clientWidth` is the
            // truthful "browser thinks this overflows" signal; requires the
            // wrapper to have `min-width: 0; overflow: hidden` (set in SCSS)
            // so the wrapper actually shrinks below its content when there's
            // not enough room.
            var clientW = root.clientWidth;
            var scrollW = root.scrollWidth;
            var parent = root.parentNode;
            var parentW = parent ? parent.clientWidth : null;
            var rootComputedStyle = getComputedStyle(root);
            log('relayout step 2', {
                clientW: clientW,
                scrollW: scrollW,
                fitsAll: scrollW <= clientW,
                parentClientW: parentW,
                rootMinWidth: rootComputedStyle.minWidth,
                rootOverflow: rootComputedStyle.overflow,
                rootFlex: rootComputedStyle.flex,
                rootDisplay: rootComputedStyle.display
            });

            if (scrollW <= clientW) {
                log('all fits, hiding trigger');
                if (menu.classList.contains('pa-btn-split__menu--open')) closeMenu();
                return;
            }

            // Step 3 — needs to overflow. Show trigger; walk drop order and
            // move items into the menu one at a time, re-checking after each
            // move. Stop as soon as `scrollWidth <= clientWidth`.
            trigger.style.display = '';

            for (var i = 0; i < dropOrder.length; i++) {
                if (root.scrollWidth <= root.clientWidth) break;
                var el = dropOrder[i].el;
                moveToMenu(el);
                log('moved to menu', el, { remainingScroll: root.scrollWidth, clientW: root.clientWidth });
            }
            log('relayout done', { inMenu: menuInner.children.length, inRoot: ordered.length - menuInner.children.length });
        }

        // Floating UI's autoUpdate returns a cleanup fn — we hold it while
        // open so closeMenu() can stop watching scroll/resize/IntersectionObserver
        // for free, instead of unhooking listeners by hand.
        var stopAutoUpdate = null;

        function openMenu() {
            if (menuInner.children.length === 0) return; // nothing to show
            // Close any other open menu first (other overflow menus AND split
            // buttons), so only this one is open.
            PaMenus.closeOthers(closeMenu);
            menu.classList.add('pa-btn-split__menu--open');
            trigger.setAttribute('aria-expanded', 'true');

            if (FUI && FUI.computePosition && FUI.autoUpdate) {
                // autoUpdate fires the callback on init AND whenever scroll
                // ancestors, the viewport, or the reference itself move —
                // handles flip / shift / off-screen retraction without our
                // own scroll/resize listeners.
                stopAutoUpdate = FUI.autoUpdate(trigger, menu, function () {
                    // Trigger gone (display:none on it or any ancestor —
                    // e.g. the splitter rail-minimize hides all buttons in
                    // a minimized pane) → close the menu so it doesn't
                    // hang in the middle of the page detached from any
                    // anchor.
                    if (trigger.offsetParent === null) {
                        closeMenu();
                        return;
                    }
                    var rect = trigger.getBoundingClientRect();
                    if (rect.width === 0 && rect.height === 0) {
                        closeMenu();
                        return;
                    }
                    // Reuse the split button's own positioner so the "more"
                    // menu opens with identical offset / flip / shift / min-width
                    // — one menu-positioning logic shared by both components,
                    // instead of a parallel copy that drifts a few pixels off.
                    positionMenu();
                });
            } else {
                positionMenuFallback();
                window.addEventListener('scroll', positionMenuFallback, true);
                window.addEventListener('resize', positionMenuFallback);
            }

            setTimeout(function () {
                document.addEventListener('mousedown', onDocClick);
            }, 0);
        }

        function closeMenu() {
            menu.classList.remove('pa-btn-split__menu--open');
            trigger.setAttribute('aria-expanded', 'false');
            if (stopAutoUpdate) {
                stopAutoUpdate();
                stopAutoUpdate = null;
            }
            window.removeEventListener('scroll', positionMenuFallback, true);
            window.removeEventListener('resize', positionMenuFallback);
            document.removeEventListener('mousedown', onDocClick);
        }

        // Position the open menu under the trigger. Prefers the shared
        // split-button positioner (`pureAdmin.components.splitMenu.position`) so
        // both components anchor their dropdown identically; falls back to the
        // hand-rolled positioner only if split-button.js / Floating UI isn't
        // loaded.
        function positionMenu() {
            var splitMenu = pa.components && pa.components.splitMenu;
            if (splitMenu && splitMenu.position) {
                splitMenu.position(trigger, menu, 'bottom-end');
            } else {
                positionMenuFallback();
            }
        }

        function positionMenuFallback() {
            // Used only if the shared positioner / Floating UI isn't loaded —
            // no flip, no shift, no scroll-into-corner handling. Matches the
            // split button's 6px offset so the gap is still consistent.
            var rect = trigger.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = (rect.bottom + 6) + 'px';
            menu.style.right = (window.innerWidth - rect.right) + 'px';
            menu.style.left = 'auto';
        }

        function onDocClick(e) {
            if (menu.contains(e.target) || trigger.contains(e.target)) return;
            closeMenu();
        }

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            if (menu.classList.contains('pa-btn-split__menu--open')) closeMenu();
            else openMenu();
        });

        menu.addEventListener('click', function (e) {
            // Any click on a menu row defers a close — the row's original
            // click handler fires first because we don't preventDefault.
            if (!e.target.closest('.pa-btn-split__item')) return;
            setTimeout(closeMenu, 0);
        });

        // Register this instance's close fn with the shared dismissal registry
        // so split buttons / other overflow menus can dismiss it on open.
        PaMenus.register(closeMenu);

        // First paint — wait for layout, then run relayout.
        requestAnimationFrame(relayout);

        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function (entries) {
                log('ResizeObserver', entries.map(function (e) {
                    return { target: e.target === root ? 'root' : 'parent', width: e.contentRect.width };
                }));
                // Any card resize closes the menu. UX is cleaner than
                // dragging the menu around mid-resize; the user can reopen
                // once they've settled the layout.
                if (menu.classList.contains('pa-btn-split__menu--open')) {
                    closeMenu();
                }
                relayout();
            });
            ro.observe(root);
            // Also observe the parent header — when items are in the menu, the
            // wrapper sizes to its (smaller) content and doesn't fire its own
            // size change when the parent grows. Watching the parent gives us
            // a signal to attempt restoring items.
            if (root.parentNode) ro.observe(root.parentNode);
        }

        // React to `data-pa-actions-overflow-from` flips so consumers can
        // change drop direction at runtime (eg. a settings toggle) without
        // re-initializing the wrapper.
        if (typeof MutationObserver !== 'undefined') {
            var mo = new MutationObserver(function () {
                buildDropOrder();
                relayout();
            });
            mo.observe(root, { attributes: true, attributeFilter: ['data-pa-actions-overflow-from'] });
        }
    }

    function initAll(scope) {
        var nodes = (scope || document).querySelectorAll(SELECTOR);
        for (var i = 0; i < nodes.length; i++) init(nodes[i]);
    }

    var api = { init: init, initAll: initAll };
    pa.components = pa.components || {};
    pa.components.overflow = api;
    // `card-actions-overflow.js` historically exported a separate global; keep
    // the same { init, initAll } pair under a second name so consumers that
    // re-init card-actions after injecting dynamic markup keep a handle.
    pa.components.cardActionsOverflow = api;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }
})();
