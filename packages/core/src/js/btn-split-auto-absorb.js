/**
 * Pure Admin — Split Button Auto-Absorb
 *
 * Extends the split button (.pa-btn-split) to automatically absorb adjacent
 * sibling buttons sitting next to it inside a `.pa-btn-toolbar` row, when
 * the row can't fit them all on one line. Absorbed items drop into the
 * split button's own dropdown menu and return to the row as space comes
 * back. Reuses the existing split-button toggle / menu / Floating UI
 * positioning — no parallel chrome.
 *
 * Opt-in markup:
 *
 *   <div class="pa-btn-toolbar">
 *     <button class="pa-btn pa-btn--primary">Save</button>
 *     <button class="pa-btn pa-btn--primary">Format</button>
 *     <button class="pa-btn pa-btn--primary"
 *             data-pa-absorb-priority="10">Refresh</button>
 *     <div class="pa-btn-split pa-btn-split--auto-absorb">
 *       <button class="pa-btn pa-btn--primary">Run</button>
 *       <button class="pa-btn pa-btn--primary pa-btn-split__toggle"
 *               onclick="toggleSplitMenu(event)">
 *         <i class="fas fa-chevron-down pa-btn-split__chevron"></i>
 *       </button>
 *       <div class="pa-btn-split__menu">
 *         <div class="pa-btn-split__menu-inner">
 *           <button class="pa-btn-split__item">Run with options…</button>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Drop order: lowest `data-pa-absorb-priority` (default 0) drops first;
 * ties broken by DOM order with the sibling closest to the split button
 * dropping first (`data-pa-absorb-from="end"`, default). Flip with
 * `="start"` to drop the leftmost sibling first instead.
 *
 * Absorbed items keep their original click handlers (the DOM node is
 * preserved). On absorb, their classList is replaced with
 * `pa-btn-split__item` so they pick up the standard menu-row styling; the
 * original classList is stashed on the element and restored when the item
 * returns to the bar.
 *
 * Existing static menu items (rendered into `__menu-inner` server-side)
 * stay BELOW absorbed items: the first static child is captured at init
 * and used as the insertBefore anchor.
 *
 * Layout contract: the bar needs `min-width: 0; overflow: hidden;
 * flex-shrink: 1` so it actually shrinks below its content (otherwise
 * `scrollWidth > clientWidth` never goes truthful). `_buttons.scss`
 * supplies that for `.pa-btn-toolbar`; any flex row with equivalent
 * styling works.
 *
 * Opt in to console diagnostics: `window.PA_BTN_SPLIT_AUTO_ABSORB_DEBUG = true`
 * before page load.
 *
 * Public API (window.PaBtnSplitAutoAbsorb):
 *   init(splitContainer) — idempotent single-container init
 *   initAll(scope)       — initialize all uninitialized auto-absorb split
 *                          buttons under scope
 */
(function () {
    'use strict';

    var INIT_FLAG = '__paBtnSplitAutoAbsorbInit';
    var SELECTOR = '.pa-btn-split.pa-btn-split--auto-absorb';
    var STASH_KEY = '__paAbsorbOrigClass';

    function init(splitContainer) {
        if (!splitContainer || splitContainer[INIT_FLAG]) return;
        if (!splitContainer.classList.contains('pa-btn-split')) return;
        if (!splitContainer.classList.contains('pa-btn-split--auto-absorb')) return;

        var bar = splitContainer.parentNode;
        if (!bar || bar.nodeType !== 1) return;

        var menu = splitContainer.querySelector('.pa-btn-split__menu');
        var menuInner = menu && menu.querySelector('.pa-btn-split__menu-inner');
        if (!menuInner) return;

        splitContainer[INIT_FLAG] = true;

        // First static menu child captured at init — absorbed items are
        // inserted BEFORE it so static items stay at the bottom of the menu.
        // If there are no static items this stays null and insertBefore
        // degrades to appendChild, which is exactly what we want.
        var firstStaticItem = menuInner.firstElementChild || null;

        // The split button's OWN primary action (the non-toggle `.pa-btn`) and
        // its toggle. When even an empty bar can't fit the whole split button,
        // the primary folds into the menu as a last resort and only the toggle
        // stays visible (see absorbPrimary / the final relayout step).
        var toggleBtn = splitContainer.querySelector('.pa-btn-split__toggle');
        var primaryBtn = null;
        for (var pc = splitContainer.firstElementChild; pc; pc = pc.nextElementSibling) {
            if (pc !== toggleBtn && pc.classList &&
                pc.classList.contains('pa-btn') &&
                !pc.classList.contains('pa-btn-split__toggle')) {
                primaryBtn = pc;
                break;
            }
        }
        var canCollapsePrimary = !!(primaryBtn && toggleBtn);

        // Collect siblings that come BEFORE the split container in the bar.
        // We snapshot at init time — siblings added after init won't be
        // tracked (call init again, or refactor to MutationObserver later).
        var candidates = [];
        var idx = 0;
        for (var node = bar.firstElementChild; node && node !== splitContainer; node = node.nextElementSibling) {
            var p = parseInt(node.getAttribute('data-pa-absorb-priority'), 10);
            candidates.push({
                el: node,
                priority: isNaN(p) ? 0 : p,
                domIndex: idx
            });
            idx++;
        }
        if (candidates.length === 0 && !canCollapsePrimary) return;

        var dropOrder = [];
        function buildDropOrder() {
            var fromAttr = splitContainer.getAttribute('data-pa-absorb-from');
            var dropFromStart = fromAttr === 'start';
            dropOrder = candidates.slice().sort(function (a, b) {
                if (a.priority !== b.priority) return a.priority - b.priority;
                // Default ("end") drops the sibling nearest the split
                // button first — feels right because that's the one
                // visually adjacent to the menu it falls into.
                return dropFromStart ? (a.domIndex - b.domIndex) : (b.domIndex - a.domIndex);
            });
        }
        buildDropOrder();

        var DEBUG = window.PA_BTN_SPLIT_AUTO_ABSORB_DEBUG === true;
        var label = '[pa-btn-split-auto-absorb#' + (splitContainer.id || candidates.map(function (c) { return c.el.tagName; }).join('-')).slice(0, 40) + ']';
        function log() {
            if (!DEBUG) return;
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, [label].concat(args));
        }

        // Rewrite any `<span class="pa-btn__icon">` inside an absorbed item
        // to the canonical `pa-btn-split__item-icon`. The pa-btn icon column
        // width is scoped to `.pa-btn:has(.pa-btn__icon) .pa-btn__icon` —
        // once the outer button stops being a `.pa-btn`, that rule no
        // longer matches and the icon span goes auto-width, throwing
        // absorbed labels out of column with static items.
        function rewriteIcons(el) {
            var icons = el.querySelectorAll('.pa-btn__icon');
            for (var i = 0; i < icons.length; i++) {
                if (icons[i][STASH_KEY] == null) {
                    icons[i][STASH_KEY] = icons[i].className;
                }
                icons[i].className = 'pa-btn-split__item-icon';
            }
        }

        function restoreIcons(el) {
            // After a previous absorb cycle the icon spans now carry our
            // rewritten class. Find them and put their original class back.
            var icons = el.querySelectorAll('.pa-btn-split__item-icon');
            for (var i = 0; i < icons.length; i++) {
                if (icons[i][STASH_KEY] != null) {
                    icons[i].className = icons[i][STASH_KEY];
                }
            }
        }

        function moveToMenu(el) {
            if (el[STASH_KEY] == null) {
                el[STASH_KEY] = el.className;
            }
            el.className = 'pa-btn-split__item';
            rewriteIcons(el);
            menuInner.insertBefore(el, firstStaticItem);
        }

        function moveToBar(el) {
            if (el[STASH_KEY] != null) {
                el.className = el[STASH_KEY];
                restoreIcons(el);
            }
            // insertBefore moves the node if already attached, so calling
            // it unconditionally keeps siblings in their original DOM
            // order even after a drop-from-start cycle reshuffled them.
            bar.insertBefore(el, splitContainer);
        }

        // Last-resort collapse: fold the split button's OWN primary action
        // into the menu (as the top item) so only the toggle chevron remains
        // when even an otherwise-empty bar can't fit the full split button.
        var primaryAbsorbed = false;
        function absorbPrimary() {
            if (primaryAbsorbed || !canCollapsePrimary) return;
            if (primaryBtn[STASH_KEY] == null) primaryBtn[STASH_KEY] = primaryBtn.className;
            primaryBtn.className = 'pa-btn-split__item';
            rewriteIcons(primaryBtn);
            // Above absorbed siblings + static items — the primary action is
            // the most important row, so it sits at the top of the menu.
            menuInner.insertBefore(primaryBtn, menuInner.firstChild);
            splitContainer.classList.add('pa-btn-split--collapsed');
            primaryAbsorbed = true;
        }
        function restorePrimary() {
            if (!primaryAbsorbed || !canCollapsePrimary) return;
            if (primaryBtn[STASH_KEY] != null) {
                primaryBtn.className = primaryBtn[STASH_KEY];
                restoreIcons(primaryBtn);
            }
            // Back to its slot: immediately before the toggle.
            splitContainer.insertBefore(primaryBtn, toggleBtn);
            splitContainer.classList.remove('pa-btn-split--collapsed');
            primaryAbsorbed = false;
        }

        function relayout() {
            log('relayout entered');

            // Step 1 — fully expand before measuring: primary action back in
            // the split button, all candidates back in the bar in original
            // DOM order (immediately before the split container).
            restorePrimary();
            candidates.slice().sort(function (a, b) {
                return a.domIndex - b.domIndex;
            }).forEach(function (item) {
                moveToBar(item.el);
            });

            var clientW = bar.clientWidth;
            var scrollW = bar.scrollWidth;
            log('step 2', {
                clientW: clientW,
                scrollW: scrollW,
                fitsAll: scrollW <= clientW
            });

            if (scrollW <= clientW) {
                log('all fits');
                return;
            }

            // Step 3 — absorb siblings in drop order until it fits.
            for (var i = 0; i < dropOrder.length; i++) {
                if (bar.scrollWidth <= bar.clientWidth) break;
                moveToMenu(dropOrder[i].el);
                log('absorbed', dropOrder[i].el);
            }

            // Step 4 — last resort: every sibling is absorbed and it STILL
            // overflows (a very narrow card header). Fold the split button's
            // own primary action into the menu so only the toggle remains;
            // otherwise the primary + toggle spill past the bar's
            // overflow:hidden edge and the toggle becomes unclickable.
            if (bar.scrollWidth > bar.clientWidth) {
                absorbPrimary();
                log('absorbed primary — collapsed to toggle');
            }
            log('done');
        }

        // A stable ancestor whose width tracks the card / window, NOT our button
        // shuffling: the nearest `.pa-card__header` (its width is the card width
        // no matter how the shrinkable `.pa-card__actions` collapses around the
        // toolbar), else the toolbar's own parent for standalone use (a sized /
        // resizable wrapper). It must NOT be the shrinkable actions wrapper —
        // that resizes in response to OUR own absorb/restore, which fed a
        // nondeterministic feedback storm (the reload-vs-resize hysteresis).
        var widthHost = (bar.closest && bar.closest('.pa-card__header')) || bar.parentNode;

        // Coalesce a burst of size changes (ours + real layout) into ONE
        // relayout on the next frame. relayout is deterministic — it always
        // measures from a full restore — so one pass per frame converges without
        // the ResizeObserver loop-limit suppression that can freeze a transient
        // state.
        var relayoutScheduled = false;
        function scheduleRelayout() {
            if (relayoutScheduled) return;
            relayoutScheduled = true;
            requestAnimationFrame(function () {
                relayoutScheduled = false;
                relayout();
            });
        }

        // First pass after layout settles.
        requestAnimationFrame(relayout);

        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(scheduleRelayout);
            // The toolbar itself — catches ANY change in the space available to
            // it, including the header title being given a larger `min-width`
            // floor (which widens the title and narrows the toolbar WITHOUT
            // changing the header's outer width). A bar-only observer isn't
            // enough on its own: once the toolbar collapses to a lone toggle its
            // box stops shrinking, so…
            ro.observe(bar);
            // …also watch the stable width host, so widening the card re-fires
            // and lets relayout re-expand from the collapsed state.
            if (widthHost && widthHost.nodeType === 1 && widthHost !== bar) {
                ro.observe(widthHost);
            }
        }

        // React to live `data-pa-absorb-from` flips so consumers can change
        // drop direction at runtime without re-initializing.
        if (typeof MutationObserver !== 'undefined') {
            var mo = new MutationObserver(function () {
                buildDropOrder();
                relayout();
            });
            mo.observe(splitContainer, { attributes: true, attributeFilter: ['data-pa-absorb-from'] });
        }
    }

    function initAll(scope) {
        var nodes = (scope || document).querySelectorAll(SELECTOR);
        for (var i = 0; i < nodes.length; i++) init(nodes[i]);
    }

    window.PaBtnSplitAutoAbsorb = { init: init, initAll: initAll };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }
})();
