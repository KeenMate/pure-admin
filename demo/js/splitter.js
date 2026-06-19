/**
 * Pure Admin Splitter
 * Resizable container with two or more panes. Auto-initializes on
 * [data-pa-splitter]. Single implementation path — the legacy 2-pane
 * shorthand (`--start` / `--end` modifiers, root-level constraints) is
 * normalized into per-pane attributes at init time and runs through the
 * same code as N-pane.
 *
 * --- Attributes on root ---
 *   data-pa-splitter                 (marker; required)
 *   data-pa-splitter-id="key"        (enables localStorage persistence)
 *   data-pa-splitter-step="10"        (keyboard step in px; default 10)
 *   data-pa-splitter-rail-size="40"   (rail width in px; default reads
 *                                      --pa-splitter-rail-size from
 *                                      getComputedStyle, then 40 literal)
 *   data-pa-splitter-minimize-threshold="0.40"
 *                                     (drag-to-minimize snap ratio of the
 *                                      drag-start size, floored at rail × 1.5)
 *
 * --- Legacy 2-pane root attributes (normalized into per-pane) ---
 *   data-pa-splitter-min-start="200px" | "20%"   → start pane data-pa-splitter-min
 *   data-pa-splitter-max-start="60%" | "800px"   → start pane data-pa-splitter-max
 *   data-pa-splitter-default="280px" | "30%"     → start pane data-pa-splitter-size
 *   data-pa-splitter-minimize="start" | "end"    → marker on the named pane
 *
 * --- Attributes on each .pa-splitter__pane ---
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

    // Rail size resolution: per-instance attribute wins, then the
    // --pa-splitter-rail-size CSS variable (themes / inline-style overrides),
    // then a hardcoded 40px floor. Without the CSS-var path the SCSS variable
    // $splitter-rail-size was effectively dead — themes could rename it and
    // nothing happened at the JS layer.
    function readRailSize(root) {
        var attr = root.getAttribute('data-pa-splitter-rail-size');
        if (attr != null && attr !== '') {
            var px = parseInt(attr, 10);
            if (!isNaN(px) && px > 0) return px;
        }
        var cssVar = getComputedStyle(root).getPropertyValue('--pa-splitter-rail-size');
        if (cssVar) {
            var v = parseFloat(cssVar);
            if (!isNaN(v) && v > 0) return v;
        }
        return 40;
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
        normalizeLegacyMarkup(root);
        initNPane(root);
    }

    // Translate the legacy 2-pane shorthand into per-pane attributes so the
    // single N-pane code path handles both forms. The old root-level
    // -min-start / -max-start / -default move onto the start pane;
    // -minimize="start|end" becomes the marker attribute on the named pane.
    // Existing per-pane attributes win (consumer-set values not overwritten),
    // so a mixed-style markup still resolves predictably.
    function normalizeLegacyMarkup(root) {
        var startPane = root.querySelector(':scope > .pa-splitter__pane--start');
        var endPane = root.querySelector(':scope > .pa-splitter__pane--end');
        if (!startPane || !endPane) return;

        var minStart = root.getAttribute('data-pa-splitter-min-start');
        var maxStart = root.getAttribute('data-pa-splitter-max-start');
        var defaultRaw = root.getAttribute('data-pa-splitter-default');
        var minimize = root.getAttribute('data-pa-splitter-minimize');

        if (minStart != null && !startPane.hasAttribute('data-pa-splitter-min')) {
            startPane.setAttribute('data-pa-splitter-min', minStart);
        }
        if (maxStart != null && !startPane.hasAttribute('data-pa-splitter-max')) {
            startPane.setAttribute('data-pa-splitter-max', maxStart);
        }
        if (defaultRaw != null && !startPane.hasAttribute('data-pa-splitter-size')) {
            startPane.setAttribute('data-pa-splitter-size', defaultRaw);
        }
        if (minimize === 'start' && !startPane.hasAttribute('data-pa-splitter-minimize')) {
            startPane.setAttribute('data-pa-splitter-minimize', '');
        } else if (minimize === 'end' && !endPane.hasAttribute('data-pa-splitter-minimize')) {
            endPane.setAttribute('data-pa-splitter-minimize', '');
        }
    }

    // ====================================================================
    // Per-pane state lives in parallel arrays (sizes[i], mins[i], …) so the
    // hot drag loop avoids object churn. Each gutter `g` owns the boundary
    // between pane g and pane g+1 — pointer drag only ever moves those two
    // (no cascade). Minimize is only honoured on pane 0 and pane N-1: pane 0
    // rolls toward the start edge ("start" rail), pane N-1 toward the end
    // edge ("end" rail). Middle panes can't minimize — the rotated rail
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
        var railSizePx = readRailSize(root);
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
            // When the user grabs the gutter while a neighbour is railed,
            // we don't insta-restore — we start a drag from the rail size
            // so they can grow the pane manually. These flags carry that
            // intent through the move handler and pointerup.
            var leftStartedMin = false;
            var rightStartedMin = false;
            // Tracks whether the pointer ever moved meaningfully during the
            // drag. Used at pointerup to distinguish a tap (no movement →
            // restore the railed pane) from a real drag, even if the user
            // dragged out and back to the same size.
            var everMoved = false;
            var TAP_PX = 2; // a few px of jitter tolerance for touch / pen

            function leftIdx() { return g; }
            function rightIdx() { return g + 1; }

            function onPointerDown(e) {
                if (e.button != null && e.button !== 0) return;
                var li = leftIdx(), ri = rightIdx();
                // Remember the rail state at drag start; clear isMin so the
                // normal drag math runs (the user is now driving the size,
                // not the rail latch). Tap-without-drag is detected at
                // pointerup and restores via the same path as click-on-rail.
                leftStartedMin = isMin[li];
                rightStartedMin = isMin[ri];
                if (leftStartedMin) isMin[li] = false;
                if (rightStartedMin) isMin[ri] = false;
                everMoved = false;
                activePointerId = e.pointerId;
                dragStartCoord = e[clientCoord];
                dragStartLeft = sizes[li];
                dragStartRight = sizes[ri];
                try { gut.setPointerCapture(e.pointerId); } catch (err) { /* iOS */ }
                root.classList.add('pa-splitter--dragging');
                gut.addEventListener('pointermove', onPointerMove);
                gut.addEventListener('pointerup', onPointerUp);
                gut.addEventListener('pointercancel', onPointerUp);
                e.preventDefault();
            }

            // rAF-throttle the move handler so each frame coalesces all
            // pending pointermove events into a single applySizes. Without
            // this, a 120 Hz trackpad fires move at ~8 ms and every event
            // triggers flex-basis writes + reflow — measurable jank on a
            // pane containing a chart canvas or iframe.
            var pendingMove = null;
            var rafScheduled = false;
            function snapThreshold(anchor) {
                // Rebase on the drag-start size of the affected pane so the
                // threshold is meaningful even when min is 0 (the common case
                // for unconstrained panes). At ratio=0.4 the user has to drag
                // below 40% of the anchor to commit. Floored at rail × 1.5 so
                // a pane already near rail doesn't insta-snap on first move.
                return Math.max(railSizePx * 1.5, railSizePx + (anchor - railSizePx) * minimizeThresholdRatio);
            }
            function processMove() {
                rafScheduled = false;
                if (pendingMove == null) return;
                var coord = pendingMove;
                pendingMove = null;
                var delta = coord - dragStartCoord;
                var newLeft = dragStartLeft + delta;
                var newRight = dragStartRight - delta;
                var li = leftIdx(), ri = rightIdx();

                // Drag-into-minimize on either neighbour — but only for sides
                // that DIDN'T start this drag from rail. Otherwise pulling
                // a railed pane out and back in would re-snap mid-drag, which
                // surprises users who're trying to manually size from rail.
                if (canMin[li] && !leftStartedMin) {
                    if (newLeft < snapThreshold(dragStartLeft)) {
                        isMin[li] = true;
                        sizes[li] = railSizePx;
                        sizes[ri] = dragStartLeft + dragStartRight - railSizePx;
                        applySizes({ persist: false });
                        return;
                    }
                }
                if (canMin[ri] && !rightStartedMin) {
                    if (newRight < snapThreshold(dragStartRight)) {
                        isMin[ri] = true;
                        sizes[ri] = railSizePx;
                        sizes[li] = dragStartLeft + dragStartRight - railSizePx;
                        applySizes({ persist: false });
                        return;
                    }
                }

                // Stop-at-min: clamp each side to its own [min, max]. If one
                // clamps, reflect the clamped value back into the other side
                // so the moving boundary doesn't drift past the wall. For
                // sides that started from rail, the effective minimum during
                // drag is `railSizePx` (not `mins[i]`) so the pane can grow
                // smoothly from rail; the real `mins[i]` clamp is applied on
                // pointerup if the final size landed below it.
                var leftFloor = leftStartedMin ? railSizePx : mins[li];
                var rightFloor = rightStartedMin ? railSizePx : mins[ri];
                if (newLeft < leftFloor) { newLeft = leftFloor; newRight = dragStartLeft + dragStartRight - newLeft; }
                if (newLeft > maxes[li]) { newLeft = maxes[li]; newRight = dragStartLeft + dragStartRight - newLeft; }
                if (newRight < rightFloor) { newRight = rightFloor; newLeft = dragStartLeft + dragStartRight - newRight; }
                if (newRight > maxes[ri]) { newRight = maxes[ri]; newLeft = dragStartLeft + dragStartRight - newRight; }

                sizes[li] = newLeft;
                sizes[ri] = newRight;
                applySizes({ persist: false });
            }

            function onPointerMove(e) {
                if (e.pointerId !== activePointerId) return;
                if (!everMoved && Math.abs(e[clientCoord] - dragStartCoord) >= TAP_PX) {
                    everMoved = true;
                }
                pendingMove = e[clientCoord];
                if (rafScheduled) return;
                rafScheduled = true;
                requestAnimationFrame(processMove);
            }

            function onPointerUp(e) {
                if (e.pointerId !== activePointerId) return;
                try { gut.releasePointerCapture(e.pointerId); } catch (err) { /* */ }
                activePointerId = null;
                root.classList.remove('pa-splitter--dragging');
                gut.removeEventListener('pointermove', onPointerMove);
                gut.removeEventListener('pointerup', onPointerUp);
                gut.removeEventListener('pointercancel', onPointerUp);
                var li = leftIdx(), ri = rightIdx();

                // Tap-without-drag on the gutter while a neighbour was railed
                // is the "restore" affordance — same UX as clicking the rail
                // pane itself. `everMoved` is set only when the pointer crosses
                // a small jitter threshold, so this works for both "no movement
                // at all" and "drag out and back to start" cases.
                if (!everMoved) {
                    if (leftStartedMin) { isMin[li] = true; restorePane(li); leftStartedMin = false; rightStartedMin = false; return; }
                    if (rightStartedMin) { isMin[ri] = true; restorePane(ri); leftStartedMin = false; rightStartedMin = false; return; }
                }

                // Drag-and-released-below-min on a side that started from rail:
                // snap up to the configured min so the pane settles at a sane
                // resting size. During the drag we let it go below min for the
                // smooth-grow feel; the clamp at release is what the user asked
                // for ("if expanded to less than min-width, set min-width on
                // drag stop"). Take the slack from the neighbour.
                if (leftStartedMin && sizes[li] < mins[li]) {
                    var deficit = mins[li] - sizes[li];
                    sizes[li] = mins[li];
                    sizes[ri] -= deficit;
                    applySizes({ persist: false });
                }
                if (rightStartedMin && sizes[ri] < mins[ri]) {
                    var deficitR = mins[ri] - sizes[ri];
                    sizes[ri] = mins[ri];
                    sizes[li] -= deficitR;
                    applySizes({ persist: false });
                }
                leftStartedMin = false;
                rightStartedMin = false;
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
        // Storage merge is forgiving: matching-index entries are trusted,
        // missing slots fall through to attribute resolution, extra slots are
        // ignored. Survives markup drift (consumer adds / removes a pane
        // without nuking everyone else's saved layout).
        var savedSizes = null, savedLasts = null, savedMin = null;
        if (saved && saved.v === 2 && Array.isArray(saved.sizes)) {
            savedSizes = saved.sizes;
            savedLasts = Array.isArray(saved.lasts) ? saved.lasts : null;
            savedMin = Array.isArray(saved.minimized) ? saved.minimized : null;
        } else if (saved && typeof saved.size === 'number') {
            // Legacy 2-pane shape — migrate to v:2 if the splitter has 2 panes
            // (the only shape it could have produced). Saved blob from a
            // different N falls through; defaults take over.
            if (N === 2) {
                var legacyRemainder = initialTotal - saved.size;
                if (!(legacyRemainder >= 0)) legacyRemainder = 0;
                savedSizes = [saved.size, legacyRemainder];
                var legacyLast = (typeof saved.last === 'number' && saved.last > 0) ? saved.last : saved.size;
                savedLasts = [legacyLast, legacyRemainder];
                savedMin = [!!saved.minimized && canMin[0], false];
            }
        }

        // Pass 1: assign explicit sizes from attributes, collect unspecified.
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
        // Pass 2: distribute leftover across unspecified panes.
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

        // Pass 3: overlay saved state on matching-index slots, leaving the
        // rest at their attribute-derived defaults.
        if (savedSizes) {
            for (var s = 0; s < Math.min(N, savedSizes.length); s++) {
                if (typeof savedSizes[s] === 'number') sizes[s] = savedSizes[s];
                if (savedLasts && typeof savedLasts[s] === 'number' && savedLasts[s] > 0) lastNonZero[s] = savedLasts[s];
                if (savedMin && savedMin[s]) startupMinimized[s] = !!canMin[s];
            }
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
