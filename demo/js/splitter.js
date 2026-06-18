/**
 * Pure Admin Splitter
 * Resizable container with two or more panes. Auto-initializes on
 * [data-pa-splitter]. Two markup flavours coexist:
 *
 *   1. Legacy 2-pane — start/end modifiers, root-level constraints.
 *      Used when both .pa-splitter__pane--start and .pa-splitter__pane--end
 *      exist with exactly one gutter.
 *
 *   2. N-pane — N panes + N-1 gutters in alternating DOM order, per-pane
 *      constraints. Used otherwise.
 *
 * --- Common attributes (on root) ---
 *   data-pa-splitter                 (marker; required)
 *   data-pa-splitter-id="key"        (enables localStorage persistence)
 *   data-pa-splitter-step="10"        (keyboard step in px; default 10)
 *   data-pa-splitter-rail-size="40"   (rail width in px; default 40)
 *   data-pa-splitter-minimize-threshold="0.40"
 *                                     (drag-to-minimize snap ratio; default 0.40,
 *                                      floored at rail × 1.5)
 *
 * --- Legacy 2-pane attributes (on root) ---
 *   data-pa-splitter-min-start="200px" | "20%"
 *   data-pa-splitter-max-start="60%" | "800px"
 *   data-pa-splitter-default="280px" | "30%"   (initial start-pane size)
 *   data-pa-splitter-minimize="start" | "end"  (which side rolls up to rail)
 *
 * --- N-pane attributes (on each .pa-splitter__pane) ---
 *   data-pa-splitter-size="200px" | "30%"  (initial size; unspecified panes
 *                                            share leftover equally — or the
 *                                            last pane absorbs if all sized)
 *   data-pa-splitter-min="150px" | "10%"
 *   data-pa-splitter-max="400px" | "50%"
 *   data-pa-splitter-minimize                (marker; only honoured on the
 *                                             first and last panes — they
 *                                             roll up against the closest
 *                                             container edge)
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

        var startPane = root.querySelector(':scope > .pa-splitter__pane--start');
        var endPane = root.querySelector(':scope > .pa-splitter__pane--end');
        var gutters = root.querySelectorAll(':scope > .pa-splitter__gutter');

        // Legacy 2-pane markup wins when explicitly tagged so users on
        // 2.9.0-rc01 see exactly the same behaviour. Anything else goes
        // through the N-pane path (which also handles two unlabelled panes).
        if (startPane && endPane && gutters.length === 1) {
            initLegacyTwoPane(root, startPane, endPane, gutters[0]);
        } else {
            initNPane(root);
        }
    }

    function initLegacyTwoPane(root, startPane, endPane, gutter) {
        var isVertical = root.classList.contains('pa-splitter--vertical');
        var axis = isVertical ? 'height' : 'width';
        var clientAxis = isVertical ? 'clientHeight' : 'clientWidth';
        var clientCoord = isVertical ? 'clientY' : 'clientX';

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
            // Read computed style so users can set it via `gap: 1rem` inline or in CSS.
            var cs = getComputedStyle(root);
            var raw = isVertical ? cs.rowGap : cs.columnGap;
            var px = parseFloat(raw);
            return isNaN(px) ? 0 : px;
        }

        function totalAvailable() {
            // Gutter + 2× gap take their own size; the two panes share the rest.
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
            // Don't let max exceed available, or min exceed max.
            if (max > total) max = total;
            if (min > max) min = max;
            log('constraints', { rootSize: rootSize, gutterSize: gutterSize, gap: gap, total: total, min: min, max: max });
            return { min: min, max: max, total: total };
        }

        function applySize(px, opts) {
            opts = opts || {};
            var c = constraints();
            var size = px;
            // opts.raw bypasses clamping — used when intentionally going
            // below min (rail size for minimize, 0 for collapse). In normal
            // mode, always clamp to [min, max] — negative requests (drag
            // math when pointer moves past the start coord) must clamp to
            // min, not fall through to 0.
            if (!opts.raw) {
                size = clamp(size, c.min, c.max);
            }
            log('applySize', { requested: px, opts: opts, minimizedFlag: minimized, resolved: size });
            currentSize = size;
            startPane.style.flexBasis = size + 'px';

            var collapsed = !minimized && size === 0;
            root.classList.toggle('pa-splitter--collapsed', collapsed);
            root.classList.toggle('pa-splitter--minimized', minimized);
            // Apply the rail class to whichever side is being minimized; clear
            // the other so a side-swap (or stale state) can't leave it dangling.
            startPane.classList.toggle('pa-splitter__pane--minimized', minimized && minimizeSide === 'start');
            endPane.classList.toggle('pa-splitter__pane--minimized', minimized && minimizeSide === 'end');

            // ARIA value
            gutter.setAttribute('aria-valuenow', String(Math.round(size)));
            gutter.setAttribute('aria-valuemin', String(Math.round(c.min)));
            gutter.setAttribute('aria-valuemax', String(Math.round(c.max)));

            // lastNonZero tracks the last *expanded* size (above rail/min) — used
            // to restore from minimize/collapse. Don't overwrite it with rail size.
            if (size > 0 && !minimized) lastNonZero = size;

            if (opts.persist !== false && id) {
                writeStorage(id, { size: size, last: lastNonZero, minimized: minimized });
            }
        }

        function minimize() {
            log('minimize() called', { currentSize: currentSize, lastNonZero: lastNonZero, side: minimizeSide });
            minimized = true;
            // For end-side minimize, push start pane to (total − rail) so the
            // flex:1 end pane shrinks to exactly the rail width. For start-side,
            // start pane goes to railSize directly.
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
            // Default behavior: hard collapse to 0. Use raw mode to bypass the
            // min clamp — collapse is the one normal-mode path that wants 0.
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
                // Reasonable fallback: 30% of container on main axis.
                initialSize = root[clientAxis] * 0.3;
            }
        }
        if (lastNonZero === 0 && initialSize > 0) lastNonZero = initialSize;
        log('initial resolved', { initialSize: initialSize, startMinimized: startMinimized, lastNonZero: lastNonZero, rootSizeAtThisPoint: root[clientAxis] });
        // Defer applySize until layout settles (root may have 0 size at DOMContentLoaded
        // if it's inside a hidden parent). requestAnimationFrame is sufficient.
        requestAnimationFrame(function () {
            log('rAF apply, rootSize=', root[clientAxis]);
            if (startMinimized) {
                minimized = true;
                var c0 = constraints();
                var railTarget = minimizeSide === 'end' ? c0.total - railSizePx : railSizePx;
                applySize(railTarget, { raw: true, persist: false });
            } else if (initialSize === 0) {
                // Preserve an explicitly-collapsed state across reloads.
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
            // Only respond to primary button (mouse) or any pointer for touch/pen
            if (e.button != null && e.button !== 0) return;
            // From minimized state, a press on the gutter is a "restore" action,
            // not a drag — gives the user something to grab even when the pane
            // is just a thin rail.
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

            // Drag-into-minimize: hysteresis snap. The threshold applies to
            // the *minimized side's* size, not the start pane's directly —
            // for end-side minimize, that's (total − requested).
            if (canMinimize) {
                var c = constraints();
                // For end-side minimize, the minimized pane is the *end* pane,
                // whose natural min equals `total - max-start`. Using c.min
                // (start-side min) would put the snap point way too far inward.
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
                if (minimized) {
                    // Inside the rail zone — pane stays at rail, ignore drag.
                    return;
                }
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
            // Persist final size at end of drag (not on every move — cuts down on
            // localStorage writes during rapid drags). Include `minimized` so a
            // drag that ends in rail mode survives reload.
            if (id) writeStorage(id, { size: currentSize, last: lastNonZero, minimized: minimized });
        }

        gutter.addEventListener('pointerdown', onPointerDown);

        // ---- Click rail to restore ----
        // When minimized, the rail pane (whichever side it is) acts as a
        // restore affordance.
        var railPane = minimizeSide === 'end' ? endPane : startPane;
        railPane.addEventListener('click', function () {
            if (minimized) restoreFromMinimized();
        });

        // ---- Toggle button delegation ----
        // Any element with [data-pa-splitter-toggle] inside this splitter
        // (typically a button in the card header) triggers collapseToggle on
        // click. Scoped to the *closest* enclosing splitter so nested splitters
        // don't fire each other's toggles.
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
                    // Always shrinks the start pane regardless of orientation —
                    // most users intuit Up/Left as "less".
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
        // Re-clamp on container resize so percent-based constraints stay valid
        // and the start pane doesn't exceed available space.
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

    // ====================================================================
    // N-pane code path
    // ====================================================================
    // Per-pane state lives in parallel arrays (sizes[i], mins[i], …) so the
    // hot drag loop avoids object churn. Each gutter `g` owns the boundary
    // between pane g and pane g+1 — pointer drag only ever moves those two
    // (no cascade). Minimize is only honoured on pane 0 and pane N-1: pane 0
    // rolls toward the start edge ("start" rail), pane N-1 toward the end
    // edge ("end" rail). Middle panes can't minimize — the rotated card
    // header only reads cleanly against a container edge.

    function initNPane(root) {
        var isVertical = root.classList.contains('pa-splitter--vertical');
        var clientAxis = isVertical ? 'clientHeight' : 'clientWidth';
        var clientCoord = isVertical ? 'clientY' : 'clientX';

        var panes = Array.prototype.slice.call(root.querySelectorAll(':scope > .pa-splitter__pane'));
        var gutters = Array.prototype.slice.call(root.querySelectorAll(':scope > .pa-splitter__gutter'));

        if (panes.length < 2 || gutters.length !== panes.length - 1) {
            console.warn('[pa-splitter] N-pane mode needs N panes + N-1 gutters, skipping', root, {
                panes: panes.length, gutters: gutters.length
            });
            return;
        }

        // Verify alternating DOM order (pane, gutter, pane, gutter, …, pane).
        // Children matching neither selector are tolerated (a stray comment
        // node or whitespace won't trip this) but anything inserted between
        // pane and gutter would break drag math.
        var structural = Array.prototype.slice.call(root.children).filter(function (el) {
            return el.classList && (el.classList.contains('pa-splitter__pane') || el.classList.contains('pa-splitter__gutter'));
        });
        for (var si = 0; si < structural.length; si++) {
            var expected = si % 2 === 0 ? 'pa-splitter__pane' : 'pa-splitter__gutter';
            if (!structural[si].classList.contains(expected)) {
                console.warn('[pa-splitter] panes and gutters must alternate (pane, gutter, pane, …), skipping', root);
                return;
            }
        }

        root[INIT_FLAG] = true;

        var id = root.getAttribute('data-pa-splitter-id') || null;
        var stepPx = parseInt(root.getAttribute('data-pa-splitter-step'), 10) || 10;
        var railSizePx = parseInt(root.getAttribute('data-pa-splitter-rail-size'), 10) || 40;
        var minimizeThresholdRatio = parseFloat(root.getAttribute('data-pa-splitter-minimize-threshold'));
        if (isNaN(minimizeThresholdRatio) || minimizeThresholdRatio <= 0 || minimizeThresholdRatio >= 1) {
            minimizeThresholdRatio = 0.40;
        }

        var DEBUG = window.PA_SPLITTER_DEBUG === true;
        var label = '[pa-splitter:' + (id || 'anon') + '/n]';
        function log() {
            if (!DEBUG) return;
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, [label].concat(args));
        }

        var N = panes.length;
        var sizes = new Array(N);
        var mins = new Array(N);
        var maxes = new Array(N);
        var canMin = new Array(N);
        var minSide = new Array(N);
        var lastNonZero = new Array(N);
        var isMin = new Array(N);

        // Read per-pane attributes. Sizes are resolved later (against total).
        var sizeRaws = new Array(N);
        var minRaws = new Array(N);
        var maxRaws = new Array(N);
        for (var i = 0; i < N; i++) {
            sizeRaws[i] = panes[i].getAttribute('data-pa-splitter-size');
            minRaws[i] = panes[i].getAttribute('data-pa-splitter-min');
            maxRaws[i] = panes[i].getAttribute('data-pa-splitter-max');
            // Only pane 0 and pane N-1 honour the minimize marker.
            var hasMinAttr = panes[i].hasAttribute('data-pa-splitter-minimize');
            canMin[i] = hasMinAttr && (i === 0 || i === N - 1);
            minSide[i] = canMin[i] ? (i === 0 ? 'start' : 'end') : null;
            isMin[i] = false;
            lastNonZero[i] = 0;
            // Flex setup: every pane is fully JS-controlled, no fill via flex-grow.
            panes[i].style.flex = '0 0 auto';
        }

        function gapPx() {
            var cs = getComputedStyle(root);
            var raw = isVertical ? cs.rowGap : cs.columnGap;
            var px = parseFloat(raw);
            return isNaN(px) ? 0 : px;
        }

        function gutterTotal() {
            // Sum across all gutters — they may not all be the same size if a
            // theme overrides one — but in practice they're uniform.
            var t = 0;
            for (var g = 0; g < gutters.length; g++) t += gutters[g][clientAxis];
            return t;
        }

        function totalAvailable() {
            // Flex `gap` lands between every adjacent child. With panes and
            // gutters alternating (pane, gutter, pane, …) there are 2(N-1)
            // such boundaries.
            var gapCount = 2 * (N - 1);
            return root[clientAxis] - gutterTotal() - (gapCount * gapPx());
        }

        function resolveConstraints() {
            var rootSize = root[clientAxis];
            var total = totalAvailable();
            for (var i = 0; i < N; i++) {
                var mn = parseSize(minRaws[i], rootSize);
                var mx = parseSize(maxRaws[i], rootSize);
                if (mn == null) mn = 0;
                if (mx == null) mx = total;
                if (mx > total) mx = total;
                if (mn > mx) mn = mx;
                mins[i] = mn;
                maxes[i] = mx;
            }
            return total;
        }

        function clampToConstraints(arr, total, pinned) {
            // Clamp each pane to [min, max] and redistribute any shortfall/excess
            // to unclamped neighbours proportionally. Iterates up to N times to
            // converge — each pass may free up new slack as panes hit walls.
            // `pinned[i] === true` excludes pane i from the flexable pool, which
            // is how minimized (rail) panes stay at rail across container resizes
            // — without this, a growing container would let them flex above
            // railSize because their `max - railSize` headroom looks fine.
            pinned = pinned || [];
            for (var pass = 0; pass < N + 1; pass++) {
                var sum = 0;
                for (var i = 0; i < N; i++) sum += arr[i];
                var diff = total - sum;
                if (Math.abs(diff) < 0.5) break;
                var flexable = [];
                var flexableWeight = 0;
                for (var j = 0; j < N; j++) {
                    if (pinned[j]) continue;
                    var headroom = diff > 0 ? (maxes[j] - arr[j]) : (arr[j] - mins[j]);
                    if (headroom > 0.5) {
                        flexable.push(j);
                        flexableWeight += arr[j] > 0 ? arr[j] : 1;
                    }
                }
                if (flexable.length === 0) break;
                for (var k = 0; k < flexable.length; k++) {
                    var idx = flexable[k];
                    var share = diff * ((arr[idx] > 0 ? arr[idx] : 1) / flexableWeight);
                    var next = arr[idx] + share;
                    if (next < mins[idx]) next = mins[idx];
                    if (next > maxes[idx]) next = maxes[idx];
                    arr[idx] = next;
                }
            }
            return arr;
        }

        function applySizes(opts) {
            opts = opts || {};
            var anyMin = false;
            for (var i = 0; i < N; i++) {
                panes[i].style.flexBasis = sizes[i] + 'px';
                panes[i].classList.toggle('pa-splitter__pane--minimized', isMin[i]);
                if (isMin[i]) anyMin = true;
                if (sizes[i] > 0 && !isMin[i]) lastNonZero[i] = sizes[i];
            }
            root.classList.toggle('pa-splitter--minimized', anyMin);

            // Update each gutter's ARIA (uses left-pane size as the value).
            for (var g = 0; g < gutters.length; g++) {
                gutters[g].setAttribute('aria-valuenow', String(Math.round(sizes[g])));
                gutters[g].setAttribute('aria-valuemin', String(Math.round(mins[g])));
                gutters[g].setAttribute('aria-valuemax', String(Math.round(maxes[g])));
            }

            if (opts.persist !== false && id) {
                writeStorage(id, { v: 2, sizes: sizes.slice(), lasts: lastNonZero.slice(), minimized: isMin.slice() });
            }
        }

        function setupGutters() {
            for (var g = 0; g < gutters.length; g++) {
                var gut = gutters[g];
                gut.setAttribute('role', gut.getAttribute('role') || 'separator');
                gut.setAttribute('aria-orientation', isVertical ? 'horizontal' : 'vertical');
                if (!gut.hasAttribute('tabindex')) gut.setAttribute('tabindex', '0');
                bindGutter(gut, g);
            }
        }

        function bindGutter(gut, g) {
            var dragStartCoord = 0;
            var dragStartLeft = 0;
            var dragStartRight = 0;
            var activePointerId = null;

            function leftIdx() { return g; }
            function rightIdx() { return g + 1; }

            function onPointerDown(e) {
                if (e.button != null && e.button !== 0) return;
                // If either neighbour is currently rail-minimized, pressing
                // the gutter restores it (same affordance as 2-pane).
                if (isMin[leftIdx()]) { e.preventDefault(); restorePane(leftIdx()); return; }
                if (isMin[rightIdx()]) { e.preventDefault(); restorePane(rightIdx()); return; }
                activePointerId = e.pointerId;
                dragStartCoord = e[clientCoord];
                dragStartLeft = sizes[leftIdx()];
                dragStartRight = sizes[rightIdx()];
                try { gut.setPointerCapture(e.pointerId); } catch (err) { /* iOS */ }
                root.classList.add('pa-splitter--dragging');
                gut.addEventListener('pointermove', onPointerMove);
                gut.addEventListener('pointerup', onPointerUp);
                gut.addEventListener('pointercancel', onPointerUp);
                e.preventDefault();
            }

            function onPointerMove(e) {
                if (e.pointerId !== activePointerId) return;
                var delta = e[clientCoord] - dragStartCoord;
                var newLeft = dragStartLeft + delta;
                var newRight = dragStartRight - delta;
                var li = leftIdx(), ri = rightIdx();

                // Drag-into-minimize on either neighbour (end-pane variant
                // for ri, start-pane variant for li).
                if (canMin[li] && !isMin[li]) {
                    var snapL = Math.max(mins[li] * minimizeThresholdRatio, railSizePx * 1.5);
                    if (newLeft < snapL) {
                        isMin[li] = true;
                        sizes[li] = railSizePx;
                        sizes[ri] = dragStartLeft + dragStartRight - railSizePx;
                        applySizes({ persist: false });
                        return;
                    }
                }
                if (canMin[ri] && !isMin[ri]) {
                    var snapR = Math.max(mins[ri] * minimizeThresholdRatio, railSizePx * 1.5);
                    if (newRight < snapR) {
                        isMin[ri] = true;
                        sizes[ri] = railSizePx;
                        sizes[li] = dragStartLeft + dragStartRight - railSizePx;
                        applySizes({ persist: false });
                        return;
                    }
                }
                // Drag-out-of-minimize when a neighbour is currently rail.
                if (isMin[li]) {
                    var snapLO = Math.max(mins[li] * minimizeThresholdRatio, railSizePx * 1.5);
                    if (newLeft >= snapLO) {
                        isMin[li] = false;
                        // continue to apply below
                    } else {
                        return;
                    }
                }
                if (isMin[ri]) {
                    var snapRO = Math.max(mins[ri] * minimizeThresholdRatio, railSizePx * 1.5);
                    if (newRight >= snapRO) {
                        isMin[ri] = false;
                    } else {
                        return;
                    }
                }

                // Stop-at-min: clamp each side to its own [min, max]. If one
                // clamps, reflect the clamped value back into the other side
                // so the moving boundary doesn't drift past the wall.
                if (newLeft < mins[li]) { newLeft = mins[li]; newRight = dragStartLeft + dragStartRight - newLeft; }
                if (newLeft > maxes[li]) { newLeft = maxes[li]; newRight = dragStartLeft + dragStartRight - newLeft; }
                if (newRight < mins[ri]) { newRight = mins[ri]; newLeft = dragStartLeft + dragStartRight - newRight; }
                if (newRight > maxes[ri]) { newRight = maxes[ri]; newLeft = dragStartLeft + dragStartRight - newRight; }

                sizes[li] = newLeft;
                sizes[ri] = newRight;
                applySizes({ persist: false });
            }

            function onPointerUp(e) {
                if (e.pointerId !== activePointerId) return;
                try { gut.releasePointerCapture(e.pointerId); } catch (err) { /* */ }
                activePointerId = null;
                root.classList.remove('pa-splitter--dragging');
                gut.removeEventListener('pointermove', onPointerMove);
                gut.removeEventListener('pointerup', onPointerUp);
                gut.removeEventListener('pointercancel', onPointerUp);
                if (id) writeStorage(id, { v: 2, sizes: sizes.slice(), lasts: lastNonZero.slice(), minimized: isMin.slice() });
            }

            gut.addEventListener('pointerdown', onPointerDown);

            gut.addEventListener('dblclick', function (e) {
                e.preventDefault();
                // Double-click toggles the nearest minimizable neighbour.
                var li = leftIdx(), ri = rightIdx();
                if (canMin[li]) togglePane(li);
                else if (canMin[ri]) togglePane(ri);
            });

            gut.addEventListener('keydown', function (e) {
                var handled = false;
                var li = leftIdx(), ri = rightIdx();
                var step = stepPx;
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        shiftBoundary(g, -step);
                        handled = true;
                        break;
                    case 'ArrowRight':
                    case 'ArrowDown':
                        shiftBoundary(g, step);
                        handled = true;
                        break;
                    case 'Home':
                        // Shrink left pane to its min, give the rest to right.
                        shiftBoundary(g, mins[li] - sizes[li]);
                        handled = true;
                        break;
                    case 'End':
                        // Grow left pane to its max.
                        shiftBoundary(g, maxes[li] - sizes[li]);
                        handled = true;
                        break;
                    case 'Enter':
                    case ' ':
                        if (canMin[li]) togglePane(li);
                        else if (canMin[ri]) togglePane(ri);
                        handled = true;
                        break;
                }
                if (handled) e.preventDefault();
            });
        }

        function shiftBoundary(g, delta) {
            // Equivalent of a tiny drag — move boundary g by `delta` px,
            // honouring stops and current minimize state.
            var li = g, ri = g + 1;
            if (isMin[li] || isMin[ri]) return; // ignore while in rail mode
            var newLeft = sizes[li] + delta;
            var newRight = sizes[ri] - delta;
            if (newLeft < mins[li]) { newLeft = mins[li]; newRight = sizes[li] + sizes[ri] - newLeft; }
            if (newLeft > maxes[li]) { newLeft = maxes[li]; newRight = sizes[li] + sizes[ri] - newLeft; }
            if (newRight < mins[ri]) { newRight = mins[ri]; newLeft = sizes[li] + sizes[ri] - newRight; }
            if (newRight > maxes[ri]) { newRight = maxes[ri]; newLeft = sizes[li] + sizes[ri] - newRight; }
            sizes[li] = newLeft;
            sizes[ri] = newRight;
            applySizes();
        }

        function minimizePane(i) {
            if (!canMin[i] || isMin[i]) return;
            var neighbour = i === 0 ? 1 : (i === N - 1 ? N - 2 : -1);
            if (neighbour < 0) return;
            var combined = sizes[i] + sizes[neighbour];
            isMin[i] = true;
            sizes[i] = railSizePx;
            sizes[neighbour] = combined - railSizePx;
            applySizes();
        }

        function restorePane(i) {
            if (!isMin[i]) return;
            var neighbour = i === 0 ? 1 : (i === N - 1 ? N - 2 : -1);
            if (neighbour < 0) return;
            isMin[i] = false;
            var combined = sizes[i] + sizes[neighbour];
            var target = lastNonZero[i] > 0 ? lastNonZero[i] : Math.max(mins[i], railSizePx * 4);
            if (target > combined - mins[neighbour]) target = combined - mins[neighbour];
            if (target < mins[i]) target = mins[i];
            sizes[i] = target;
            sizes[neighbour] = combined - target;
            applySizes();
        }

        function togglePane(i) {
            if (isMin[i]) restorePane(i);
            else minimizePane(i);
        }

        // ---- Initial size resolution ----
        var initialTotal = resolveConstraints();
        log('init total available', initialTotal);
        var saved = readStorage(id);
        log('storage read', saved);

        var startupMinimized = new Array(N);
        if (saved && saved.v === 2 && Array.isArray(saved.sizes) && saved.sizes.length === N) {
            for (var s = 0; s < N; s++) {
                sizes[s] = saved.sizes[s];
                lastNonZero[s] = (saved.lasts && saved.lasts[s]) || sizes[s];
                startupMinimized[s] = !!(saved.minimized && saved.minimized[s]) && canMin[s];
            }
        } else {
            // Pass 1: assign explicit sizes; collect unspecified pane indices.
            var rootSizeRef = root[clientAxis];
            var explicitSum = 0;
            var unspecified = [];
            for (var p = 0; p < N; p++) {
                var v = parseSize(sizeRaws[p], rootSizeRef);
                if (v == null) {
                    sizes[p] = 0;
                    unspecified.push(p);
                } else {
                    sizes[p] = v;
                    explicitSum += v;
                }
                startupMinimized[p] = false;
            }
            // Pass 2: distribute leftover.
            var leftover = initialTotal - explicitSum;
            if (unspecified.length > 0) {
                var share = leftover / unspecified.length;
                for (var u = 0; u < unspecified.length; u++) sizes[unspecified[u]] = Math.max(0, share);
            } else if (Math.abs(leftover) > 0.5) {
                // All panes sized but they don't sum to total — give the
                // delta to the last pane (matches the "content absorbs" UX
                // most admin layouts expect).
                sizes[N - 1] += leftover;
            }
            for (var z = 0; z < N; z++) lastNonZero[z] = sizes[z];
        }

        setupGutters();

        // Defer the first paint to rAF so a container that's 0-sized at
        // DOMContentLoaded (hidden parent, modal not yet open) gets a real
        // measurement before we clamp.
        requestAnimationFrame(function () {
            var total = resolveConstraints();
            log('rAF apply, total=', total, 'sizes=', sizes.slice(), 'startupMin=', startupMinimized);
            // Pin minimized panes to rail BEFORE clamping so the redistribute
            // pass leaves them alone — clampToConstraints would otherwise
            // happily flex a rail pane upward if the container has slack.
            for (var m = 0; m < N; m++) {
                if (startupMinimized[m]) {
                    isMin[m] = true;
                    sizes[m] = railSizePx;
                }
            }
            clampToConstraints(sizes, total, isMin);
            applySizes({ persist: false });
        });

        // ---- Toggle delegation ----
        root.addEventListener('click', function (e) {
            var toggle = e.target.closest && e.target.closest('[data-pa-splitter-toggle]');
            if (!toggle || toggle.closest('[data-pa-splitter]') !== root) return;
            // Find which pane the toggle lives in.
            var pane = toggle.closest('.pa-splitter__pane');
            if (!pane) return;
            var idx = panes.indexOf(pane);
            if (idx < 0) return;
            if (!canMin[idx]) return;
            e.preventDefault();
            e.stopPropagation();
            togglePane(idx);
        });

        // ---- Click rail to restore ----
        for (var rp = 0; rp < N; rp++) {
            (function (idx) {
                panes[idx].addEventListener('click', function () {
                    if (isMin[idx]) restorePane(idx);
                });
            })(rp);
        }

        // ---- Container resize ----
        if (typeof ResizeObserver !== 'undefined') {
            var lastTotal = initialTotal;
            var ro = new ResizeObserver(function () {
                var total = resolveConstraints();
                if (Math.abs(total - lastTotal) < 0.5) return;
                if (lastTotal <= 0) { lastTotal = total; return; }
                // Scale only the non-minimized pool. Minimized panes hold at
                // railSize and don't participate — their fraction of the
                // container intentionally drifts as the container grows.
                var oldNonMinSum = 0;
                var railBudget = 0;
                for (var i = 0; i < N; i++) {
                    if (isMin[i]) { railBudget += sizes[i]; }
                    else { oldNonMinSum += sizes[i]; }
                }
                var newNonMinTotal = total - railBudget;
                if (oldNonMinSum > 0 && newNonMinTotal > 0) {
                    var scale = newNonMinTotal / oldNonMinSum;
                    for (var j = 0; j < N; j++) {
                        if (!isMin[j]) sizes[j] *= scale;
                    }
                }
                clampToConstraints(sizes, total, isMin);
                applySizes({ persist: false });
                lastTotal = total;
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
