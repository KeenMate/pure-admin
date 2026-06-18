/**
 * Pure Admin Splitter
 * Two-pane resizable container. Auto-initializes on [data-pa-splitter].
 *
 * Data attributes (on root):
 *   data-pa-splitter                 (marker; required)
 *   data-pa-splitter-id="key"        (enables localStorage persistence)
 *   data-pa-splitter-min-start="200px" | "20%"
 *   data-pa-splitter-max-start="60%" | "800px"
 *   data-pa-splitter-default="280px" | "30%"   (initial size if no saved state)
 *   data-pa-splitter-step="10"        (keyboard step in px; default 10)
 *   data-pa-splitter-minimize="start" | "end"
 *                                     (opt-in: collapse goes to rail width
 *                                      on the named side instead of 0)
 *   data-pa-splitter-rail-size="40"   (rail width in px; default 40)
 *   data-pa-splitter-minimize-threshold="0.40"
 *                                     (drag snaps to rail when requested
 *                                      size drops below this fraction of
 *                                      the minimized side's natural min;
 *                                      default 0.40; floored at rail × 1.5)
 *
 * Required markup:
 *   .pa-splitter.pa-splitter--horizontal | --vertical
 *     > .pa-splitter__pane.pa-splitter__pane--start
 *     > .pa-splitter__gutter[role=separator][tabindex=0]
 *     > .pa-splitter__pane.pa-splitter__pane--end
 *
 * Public API (window.PaSplitter):
 *   init(el)        - initialize a single splitter element (idempotent)
 *   initAll(root?)  - initialize all uninitialized splitters under root (default: document)
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'pa-splitter:';
    var INIT_FLAG = '__paSplitterInit';

    function parseSize(raw, totalPx) {
        if (raw == null || raw === '') return null;
        var s = String(raw).trim();
        if (s.endsWith('%')) {
            var pct = parseFloat(s);
            if (isNaN(pct)) return null;
            return (pct / 100) * totalPx;
        }
        if (s.endsWith('px')) {
            var px = parseFloat(s);
            return isNaN(px) ? null : px;
        }
        // Bare number = px
        var n = parseFloat(s);
        if (!isNaN(n) && /^-?\d*\.?\d+$/.test(s)) return n;
        console.warn('[pa-splitter] unsupported size unit:', raw, '(use px or %)');
        return null;
    }

    function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function readStorage(id) {
        if (!id) return null;
        try {
            var raw = localStorage.getItem(STORAGE_PREFIX + id);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (typeof parsed !== 'object' || parsed === null) return null;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function writeStorage(id, state) {
        if (!id) return;
        try {
            localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state));
        } catch (e) {
            // quota / privacy mode — silently skip
        }
    }

    function init(root) {
        if (!root || root[INIT_FLAG]) return;

        var isVertical = root.classList.contains('pa-splitter--vertical');
        var clientAxis = isVertical ? 'clientHeight' : 'clientWidth';
        var clientCoord = isVertical ? 'clientY' : 'clientX';

        var startPane = root.querySelector(':scope > .pa-splitter__pane--start');
        var endPane = root.querySelector(':scope > .pa-splitter__pane--end');
        var gutter = root.querySelector(':scope > .pa-splitter__gutter');

        if (!startPane || !endPane || !gutter) {
            console.warn('[pa-splitter] missing required children, skipping', root);
            return;
        }

        root[INIT_FLAG] = true;

        var id = root.getAttribute('data-pa-splitter-id') || null;
        var stepPx = parseInt(root.getAttribute('data-pa-splitter-step'), 10) || 10;
        var minRaw = root.getAttribute('data-pa-splitter-min-start');
        var maxRaw = root.getAttribute('data-pa-splitter-max-start');
        var defaultRaw = root.getAttribute('data-pa-splitter-default');
        var minimizeRaw = root.getAttribute('data-pa-splitter-minimize');
        var minimizeSide = (minimizeRaw === 'start' || minimizeRaw === 'end') ? minimizeRaw : null;
        var canMinimize = minimizeSide !== null;
        var railSizePx = parseInt(root.getAttribute('data-pa-splitter-rail-size'), 10) || 40;
        var minimizeThresholdRatio = parseFloat(root.getAttribute('data-pa-splitter-minimize-threshold'));
        if (isNaN(minimizeThresholdRatio) || minimizeThresholdRatio <= 0 || minimizeThresholdRatio >= 1) {
            minimizeThresholdRatio = 0.40;
        }

        // Diagnostic logging — opt in by setting window.PA_SPLITTER_DEBUG = true.
        var DEBUG = window.PA_SPLITTER_DEBUG === true;
        var label = '[pa-splitter:' + (id || 'anon') + ']';
        function log() {
            if (!DEBUG) return;
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, [label].concat(args));
        }

        // Per-splitter state (in px, on the main axis)
        var currentSize = 0;
        var lastNonZero = 0;
        var minimized = false;

        log('init', {
            orientation: isVertical ? 'vertical' : 'horizontal',
            rootClientSize: root[clientAxis],
            attrs: { minRaw: minRaw, maxRaw: maxRaw, defaultRaw: defaultRaw, canMinimize: canMinimize, railSizePx: railSizePx, stepPx: stepPx }
        });

        // Set ARIA scaffolding
        gutter.setAttribute('role', gutter.getAttribute('role') || 'separator');
        gutter.setAttribute('aria-orientation', isVertical ? 'horizontal' : 'vertical');
        if (!gutter.hasAttribute('tabindex')) gutter.setAttribute('tabindex', '0');

        function gapPx() {
            // `gap` on the flex container appears twice (start↔gutter, gutter↔end).
            var cs = getComputedStyle(root);
            var raw = isVertical ? cs.rowGap : cs.columnGap;
            var px = parseFloat(raw);
            return isNaN(px) ? 0 : px;
        }

        function totalAvailable() {
            return root[clientAxis] - gutter[clientAxis] - (2 * gapPx());
        }

        function constraints() {
            var rootSize = root[clientAxis];
            var gutterSize = gutter[clientAxis];
            var gap = gapPx();
            var total = rootSize - gutterSize - (2 * gap);
            var min = parseSize(minRaw, rootSize);
            var max = parseSize(maxRaw, rootSize);
            if (min == null) min = 0;
            if (max == null) max = total;
            if (max > total) max = total;
            if (min > max) min = max;
            log('constraints', { rootSize: rootSize, gutterSize: gutterSize, gap: gap, total: total, min: min, max: max });
            return { min: min, max: max, total: total };
        }

        function applySize(px, opts) {
            opts = opts || {};
            var c = constraints();
            var size = px;
            if (!opts.raw) {
                size = clamp(size, c.min, c.max);
            }
            log('applySize', { requested: px, opts: opts, minimizedFlag: minimized, resolved: size });
            currentSize = size;
            startPane.style.flexBasis = size + 'px';

            var collapsed = !minimized && size === 0;
            root.classList.toggle('pa-splitter--collapsed', collapsed);
            root.classList.toggle('pa-splitter--minimized', minimized);
            startPane.classList.toggle('pa-splitter__pane--minimized', minimized && minimizeSide === 'start');
            endPane.classList.toggle('pa-splitter__pane--minimized', minimized && minimizeSide === 'end');

            gutter.setAttribute('aria-valuenow', String(Math.round(size)));
            gutter.setAttribute('aria-valuemin', String(Math.round(c.min)));
            gutter.setAttribute('aria-valuemax', String(Math.round(c.max)));

            if (size > 0 && !minimized) lastNonZero = size;

            if (opts.persist !== false && id) {
                writeStorage(id, { size: size, last: lastNonZero, minimized: minimized });
            }
        }

        function minimize() {
            log('minimize() called', { currentSize: currentSize, lastNonZero: lastNonZero, side: minimizeSide });
            minimized = true;
            var c = constraints();
            var target = minimizeSide === 'end' ? c.total - railSizePx : railSizePx;
            applySize(target, { raw: true });
        }

        function restoreFromMinimized() {
            log('restoreFromMinimized() called', { lastNonZero: lastNonZero });
            minimized = false;
            var target = lastNonZero;
            if (!(target > 0)) {
                var c = constraints();
                target = c.min > 0 ? c.min : Math.max(railSizePx * 4, 200);
            }
            applySize(target);
        }

        function collapseToggle() {
            if (canMinimize) {
                if (minimized) restoreFromMinimized();
                else minimize();
                return;
            }
            if (currentSize === 0) {
                applySize(lastNonZero || constraints().min || 200);
            } else {
                applySize(0, { raw: true });
            }
        }

        // ---- Initial size ----
        var saved = readStorage(id);
        log('storage read', saved);
        var initialSize;
        var startMinimized = false;
        if (saved && typeof saved.size === 'number') {
            initialSize = saved.size;
            if (typeof saved.last === 'number' && saved.last > 0) lastNonZero = saved.last;
            if (saved.minimized === true && canMinimize) startMinimized = true;
        } else {
            initialSize = parseSize(defaultRaw, root[clientAxis]);
            if (initialSize == null) {
                initialSize = root[clientAxis] * 0.3;
            }
        }
        if (lastNonZero === 0 && initialSize > 0) lastNonZero = initialSize;
        log('initial resolved', { initialSize: initialSize, startMinimized: startMinimized, lastNonZero: lastNonZero, rootSizeAtThisPoint: root[clientAxis] });
        requestAnimationFrame(function () {
            log('rAF apply, rootSize=', root[clientAxis]);
            if (startMinimized) {
                minimized = true;
                var c0 = constraints();
                var railTarget = minimizeSide === 'end' ? c0.total - railSizePx : railSizePx;
                applySize(railTarget, { raw: true, persist: false });
            } else if (initialSize === 0) {
                applySize(0, { raw: true, persist: false });
            } else {
                applySize(initialSize, { persist: false });
            }
        });

        // ---- Pointer drag ----
        var dragStartCoord = 0;
        var dragStartSize = 0;
        var activePointerId = null;

        function onPointerDown(e) {
            if (e.button != null && e.button !== 0) return;
            if (minimized) {
                e.preventDefault();
                restoreFromMinimized();
                return;
            }
            activePointerId = e.pointerId;
            dragStartCoord = e[clientCoord];
            dragStartSize = currentSize;
            try {
                gutter.setPointerCapture(e.pointerId);
            } catch (err) { /* iOS Safari can throw on some elements */ }
            root.classList.add('pa-splitter--dragging');
            gutter.addEventListener('pointermove', onPointerMove);
            gutter.addEventListener('pointerup', onPointerUp);
            gutter.addEventListener('pointercancel', onPointerUp);
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (e.pointerId !== activePointerId) return;
            var delta = e[clientCoord] - dragStartCoord;
            var requested = dragStartSize + delta;

            // Drag-into-minimize: hysteresis snap. Threshold checks the
            // *minimized side's* size, not the start pane's directly.
            if (canMinimize) {
                var c = constraints();
                var minimizedSideMin = minimizeSide === 'end' ? (c.total - c.max) : c.min;
                var snapThreshold = Math.max(minimizedSideMin * minimizeThresholdRatio, railSizePx * 1.5);
                var requestedMinimizedSize = minimizeSide === 'end' ? c.total - requested : requested;
                var railTarget = minimizeSide === 'end' ? c.total - railSizePx : railSizePx;

                if (!minimized && requestedMinimizedSize < snapThreshold) {
                    minimized = true;
                    applySize(railTarget, { raw: true, persist: false });
                    return;
                }
                if (minimized && requestedMinimizedSize >= snapThreshold) {
                    minimized = false;
                    applySize(requested, { persist: false });
                    return;
                }
                if (minimized) return;
            }

            applySize(requested, { persist: false });
        }

        function onPointerUp(e) {
            if (e.pointerId !== activePointerId) return;
            try {
                gutter.releasePointerCapture(e.pointerId);
            } catch (err) { /* no-op */ }
            activePointerId = null;
            root.classList.remove('pa-splitter--dragging');
            gutter.removeEventListener('pointermove', onPointerMove);
            gutter.removeEventListener('pointerup', onPointerUp);
            gutter.removeEventListener('pointercancel', onPointerUp);
            if (id) writeStorage(id, { size: currentSize, last: lastNonZero, minimized: minimized });
        }

        gutter.addEventListener('pointerdown', onPointerDown);

        // ---- Click rail to restore ----
        var railPane = minimizeSide === 'end' ? endPane : startPane;
        railPane.addEventListener('click', function () {
            if (minimized) restoreFromMinimized();
        });

        // ---- Toggle button delegation ----
        // Any [data-pa-splitter-toggle] element inside this splitter triggers
        // collapseToggle. Scoped to the closest enclosing splitter so nested
        // splitters don't fire each other's toggles.
        root.addEventListener('click', function (e) {
            var toggle = e.target.closest && e.target.closest('[data-pa-splitter-toggle]');
            if (!toggle || toggle.closest('[data-pa-splitter]') !== root) return;
            e.preventDefault();
            e.stopPropagation();
            collapseToggle();
        });

        // ---- Double-click to collapse / restore ----
        gutter.addEventListener('dblclick', function (e) {
            e.preventDefault();
            collapseToggle();
        });

        // ---- Keyboard ----
        gutter.addEventListener('keydown', function (e) {
            var c = constraints();
            var handled = false;

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    applySize(currentSize - stepPx);
                    handled = true;
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    applySize(currentSize + stepPx);
                    handled = true;
                    break;
                case 'Home':
                    applySize(c.min);
                    handled = true;
                    break;
                case 'End':
                    applySize(c.max);
                    handled = true;
                    break;
                case 'Enter':
                case ' ':
                    collapseToggle();
                    handled = true;
                    break;
            }

            if (handled) e.preventDefault();
        });

        // ---- Container resize ----
        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function () {
                var c = constraints();
                log('ResizeObserver fire', { currentSize: currentSize, minimized: minimized, newConstraints: c });
                if (minimized) return;
                if (currentSize === 0 && c.min === 0) return; // genuinely collapsed
                if (currentSize < c.min || currentSize > c.max) {
                    log('ResizeObserver re-clamping', currentSize, '→ within', c.min, c.max);
                    applySize(currentSize, { persist: false });
                }
            });
            ro.observe(root);
        }
    }

    function initAll(root) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-pa-splitter]');
        for (var i = 0; i < nodes.length; i++) init(nodes[i]);
    }

    window.PaSplitter = { init: init, initAll: initAll };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }
})();
