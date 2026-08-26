/**
 * Pure Admin Splitter
 * Resizable container with two or more panes. Auto-initializes on
 * [data-pa-splitter]. Panes and gutters alternate (pane, gutter, pane,
 * gutter, …, pane); each pane carries its own sizing attributes.
 *
 * --- Attributes on root ---
 *   data-pa-splitter                 (marker; required)
 *   data-pa-splitter-id="key"        (enables localStorage persistence)
 *   data-pa-splitter-step="10"        (keyboard step in px; default 10)
 *   data-pa-splitter-rail-size="40"   (rail width in px; default reads
 *                                      --pc-splitter-rail-size from
 *                                      getComputedStyle, then 40 literal)
 *   data-pa-splitter-minimize-threshold="0.40"
 *                                     (drag-to-minimize snap ratio of the
 *                                      drag-start size, floored at rail × 1.5)
 *
 * --- Accordion mode (auto) ---
 *   When the container is narrower than the sum of all pane mins + gutters
 *   + gaps + padding AND there are 2+ minimizable panes, the splitter
 *   switches into single-pane-expanded mode: restoring one minimizable pane
 *   auto-rails the others. Engages/disengages automatically as the
 *   container resizes. Adds the class `pa-splitter--accordion` to the root
 *   as a styling hook.
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
 * --- Drag-from-rail asymmetry ---
 *   When the gutter's primary neighbour is already railed, drag direction
 *   matters: dragging OUTWARD (the direction that would grow the pane)
 *   releases the rail and follows the cursor; dragging INWARD (into the
 *   rail, would shrink the pane further) is inert — the rail stays put and
 *   the gutter doesn't move. Tap-without-drag on the gutter does nothing.
 *   Restore gestures: rail-body click, dblclick on the gutter, focus the
 *   gutter and press Enter/Space, click a [data-pa-splitter-toggle], or
 *   drag the gutter outward past the snap threshold.
 *
 * --- Events (CustomEvent, bubbles from the pane) ---
 *   pa-splitter:resize    detail: { index, pane, size }   per pane on every applySizes
 *   pa-splitter:collapse  detail: { index, pane }         when a pane is railed
 *   pa-splitter:expand    detail: { index, pane }         when a pane is restored
 *   Resize fires unconditionally per pane during drag — debounce in the listener.
 *   Init does NOT fire collapse for panes that started rail'd from saved state.
 *
 * Public API (pureAdmin.components.splitter):
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
    // --pc-splitter-rail-size CSS variable (themes / inline-style overrides),
    // then a hardcoded 40px floor. Without the CSS-var path the SCSS variable
    // $splitter-rail-size was effectively dead — themes could rename it and
    // nothing happened at the JS layer.
    //
    // Note on rem/em: the CSS variable emit is `4rem` (per SCSS source), and
    // `getComputedStyle` returns the variable's value un-resolved — i.e. the
    // raw string "4rem", not the px equivalent. parseFloat("4rem") returns 4,
    // which would snap panes to 4px-wide strips instead of 40px rails. So we
    // probe with a hidden element: set its width to the CSS variable, read
    // offsetWidth, and let the browser do the unit resolution.
    function readRailSize(root) {
        var attr = root.getAttribute('data-pa-splitter-rail-size');
        if (attr != null && attr !== '') {
            var px = parseInt(attr, 10);
            if (!isNaN(px) && px > 0) return px;
        }
        try {
            var probe = root.ownerDocument.createElement('div');
            probe.style.cssText = 'position:absolute;visibility:hidden;height:0;width:var(--pc-splitter-rail-size, 40px);';
            root.appendChild(probe);
            var resolved = probe.offsetWidth;
            root.removeChild(probe);
            if (resolved > 0) return resolved;
        } catch (err) { /* fall through to default */ }
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
        initNPane(root);
    }

    // ====================================================================
    // Per-pane state lives in parallel arrays (sizes[i], mins[i], …) so the
    // hot drag loop avoids object churn.
    //
    // Drag model: REBALANCE (not boundary-coupled). Each gutter `g` owns
    // resizing of its PRIMARY neighbour (edge-closer side; LTR/RTL
    // tiebreaker on middle/even ties). Dragging changes only the primary's
    // size; the matching opposite delta is distributed across all other
    // non-minimized panes proportionally to their current sizes. Rail panes
    // (isMin[i] === true) stay pinned at railSize and don't participate.
    //
    // Rationale: in a mixed layout like AcBcCeDeEc (A,B,E rail; C,D
    // expanded), the user grabbing the A|B gutter expects to grow A. A
    // boundary-coupled model would try to shrink B for slack — but B is
    // already railed, so the drag locks. The rebalance model pulls slack
    // from C and D instead, matching user intent.
    //
    // Minimize is honoured on any pane with data-pa-splitter-minimize.

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

        var label = '[pa-splitter:' + (id || 'anon') + ']';
        function log() {
            console.log.apply(console, [label].concat(Array.prototype.slice.call(arguments)));
        }

        var N = panes.length;
        var sizes = new Array(N);
        var mins = new Array(N);
        var maxes = new Array(N);
        var canMin = new Array(N);
        var minSide = new Array(N);
        var lastNonZero = new Array(N);
        var isMin = new Array(N);

        // Per-pane orientation class — defensive against nested splitters
        // with mixed orientations. Downstream CSS that only wants to act on
        // panes inside a horizontal (or vertical) splitter can key off the
        // class on the pane itself instead of walking up to find an
        // orientation modifier (which, with nesting, returns the outer
        // splitter's orientation for inner panes).
        var paneOrientationClass = isVertical ? 'pa-splitter__pane--vertical' : 'pa-splitter__pane--horizontal';

        // Read per-pane attributes. Sizes are resolved later (against total).
        var sizeRaws = new Array(N);
        var minRaws = new Array(N);
        var maxRaws = new Array(N);
        for (var i = 0; i < N; i++) {
            sizeRaws[i] = panes[i].getAttribute('data-pa-splitter-size');
            minRaws[i] = panes[i].getAttribute('data-pa-splitter-min');
            maxRaws[i] = panes[i].getAttribute('data-pa-splitter-max');
            // Any pane with the minimize marker can collapse to rail.
            // Start / end panes dock against the container edge; middle
            // panes shrink in place, with the released slack split between
            // both neighbours (and on restore, taken back from both).
            var hasMinAttr = panes[i].hasAttribute('data-pa-splitter-minimize');
            canMin[i] = hasMinAttr;
            minSide[i] = canMin[i] ? (i === 0 ? 'start' : (i === N - 1 ? 'end' : 'middle')) : null;
            isMin[i] = false;
            lastNonZero[i] = 0;
            // Flex setup: every pane is fully JS-controlled, no fill via flex-grow.
            panes[i].style.flex = '0 0 auto';
            panes[i].classList.add(paneOrientationClass);
        }

        // CustomEvent dispatch helpers. Events bubble from the pane element
        // so consumers can listen on the splitter root (or higher) with a
        // single handler. resize fires per pane per applySizes — unfiltered;
        // debounce in the listener if needed. collapse/expand fire only on
        // user-initiated transitions (toggle, dblclick, drag snap, rail
        // click) — NOT on init from saved state.
        function fireResize(i) {
            panes[i].dispatchEvent(new CustomEvent('pa-splitter:resize', {
                bubbles: true,
                detail: { index: i, pane: panes[i], size: sizes[i] }
            }));
        }
        function fireCollapse(i) {
            panes[i].dispatchEvent(new CustomEvent('pa-splitter:collapse', {
                bubbles: true,
                detail: { index: i, pane: panes[i] }
            }));
        }
        function fireExpand(i) {
            panes[i].dispatchEvent(new CustomEvent('pa-splitter:expand', {
                bubbles: true,
                detail: { index: i, pane: panes[i] }
            }));
        }

        function gapPx() {
            var cs = getComputedStyle(root);
            var raw = isVertical ? cs.rowGap : cs.columnGap;
            var px = parseFloat(raw);
            return isNaN(px) ? 0 : px;
        }

        function paddingPx() {
            // `clientWidth` / `clientHeight` include padding but flex children
            // are placed inside the content area only. If we don't subtract
            // padding here, the panes' total flex-basis overflows the content
            // area by 2 × padding and the last pane gets clipped by the
            // splitter's `overflow: hidden`.
            var cs = getComputedStyle(root);
            var start = isVertical ? cs.paddingTop : cs.paddingLeft;
            var end = isVertical ? cs.paddingBottom : cs.paddingRight;
            return (parseFloat(start) || 0) + (parseFloat(end) || 0);
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
            return root[clientAxis] - paddingPx() - gutterTotal() - (gapCount * gapPx());
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
            var lastNonZeroChanged = [];
            var classBefore = panes.map(function (p) { return p.classList.contains('pa-splitter__pane--minimized'); });
            for (var i = 0; i < N; i++) {
                panes[i].style.flexBasis = sizes[i] + 'px';
                panes[i].classList.toggle('pa-splitter__pane--minimized', isMin[i]);
                if (isMin[i]) anyMin = true;
                // Only persist sizes at or above mins[i] as "lastNonZero".
                // During a drag-from-rail, sizes[i] may sit at the rail
                // floor (well below mins[i]) for the whole drag if the
                // boundary couldn't move — overwriting lastNonZero with
                // that value would silently destroy the pane's remembered
                // expanded size, causing future restores to fall back to
                // bare mins instead of the original expanded width.
                if (sizes[i] >= mins[i] && !isMin[i]) {
                    if (lastNonZero[i] !== sizes[i]) lastNonZeroChanged.push({ i: i, from: lastNonZero[i], to: sizes[i] });
                    lastNonZero[i] = sizes[i];
                }
                fireResize(i);
            }
            root.classList.toggle('pa-splitter--minimized', anyMin);
            // Only log applySizes when a pane's minimized class actually
            // flipped — that's the moment the card visually re-renders.
            // Suppresses the per-frame flood while still surfacing every
            // rail/expanded transition.
            var anyClassChanged = false;
            var perPane = [];
            for (var k = 0; k < N; k++) {
                var nowMin = panes[k].classList.contains('pa-splitter__pane--minimized');
                if (classBefore[k] !== nowMin) anyClassChanged = true;
                perPane.push({
                    i: k,
                    size: Math.round(sizes[k]),
                    isMin: isMin[k],
                    classDOM: nowMin,
                    classChanged: classBefore[k] !== nowMin
                });
            }
            if (anyClassChanged) {
                log('applySizes (class flip)', perPane, 'persist=' + (opts.persist !== false));
            }

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
            // Rebalance-on-drag model: each gutter `g` resizes its PRIMARY
            // neighbour only (primary = edge-closer side; LTR/RTL tiebreaker
            // on ties). The slack — the matching opposite delta — is
            // absorbed by *all other non-minimized panes* proportionally
            // to their current sizes. The adjacent non-primary pane is
            // treated like any other absorber: rail panes stay railed, the
            // rest share the load. This is intentionally different from the
            // classic boundary-coupled splitter (left and right neighbours
            // trade space 1:1); in mixed rail/expanded layouts the boundary
            // model produced a stuck-at-rail experience where dragging A|B
            // couldn't grow A while B was collapsed.
            var dragStartCoord = 0;
            var dragStartPrimary = 0;
            var activePointerId = null;
            var primaryIdx = -1;
            // +1 if primary is the left neighbour (g): cursor moving right
            // grows the primary; -1 if primary is the right neighbour (g+1):
            // cursor moving right shrinks the primary (gutter trails cursor
            // toward primary's start edge).
            var primarySign = 1;
            // Read-only after pointerdown — see "startedMin" / "canSnap"
            // comments in earlier versions. Promoting these mid-drag would
            // permanently disable the snap-in gate and block re-snap.
            var primaryStartedMin = false;
            // Transient "rail → expanded" transition state. Set when the
            // user drags a mid-drag-snapped pane back out past the
            // threshold; while true the floor stays at railSizePx so the
            // pane grows smoothly out of rail instead of jumping to mins.
            var primaryInEscape = false;
            // "Is snap-into-rail allowed right now". Starts as
            // !primaryStartedMin (drag-from-expanded can snap immediately;
            // drag-from-rail needs to first commit to expanded by crossing
            // mins[primary] outward).
            var primaryCanSnap = false;
            // Largest size the primary has reached during this drag. Anchors
            // the snap-threshold formula so a drag-from-rail user who has
            // expanded the pane to e.g. 300 gets a meaningful re-snap
            // threshold instead of the rail*1.5 = 60 floor.
            var primaryMaxReached = 0;
            // Distinguish tap from drag at pointerup (set true when the
            // pointer crosses a small jitter threshold, even if the user
            // dragged out and back to the same size).
            var everMoved = false;
            var TAP_PX = 2;
            // Per-frame `move` logs are throttled to size-bucket transitions
            // (0–25 % / 25–50 % / 50–75 % / 75–100 % of total). State
            // transitions (SNAP, DRAG-OUT, CLAMP-TO-MIN, etc.) always log.
            var lastBucket = -1;

            function onPointerDown(e) {
                if (e.button != null && e.button !== 0) return;
                // Defensive sweep: clear --active from every gutter before
                // committing this one. Covers a stale class from a previous
                // pointerup that didn't fire cleanly (rare).
                for (var gi = 0; gi < gutters.length; gi++) {
                    gutters[gi].classList.remove('pa-splitter__gutter--active');
                }
                primaryIdx = primaryNeighbour(g);
                primarySign = (primaryIdx === g) ? 1 : -1;
                // Snapshot rail state at drag start. Crucially DO NOT clear
                // isMin here — the user might be dragging INTO the rail (no
                // expand intent), and pre-clearing would visually flash the
                // card out of its rail state before we know which direction
                // they're going. Rail release is deferred to onPointerMove,
                // where it gates on outward direction (primarySign * delta
                // > 0). Tap-without-drag is therefore inert on the gutter.
                primaryStartedMin = isMin[primaryIdx];
                primaryInEscape = false;
                primaryCanSnap = !primaryStartedMin;
                everMoved = false;
                activePointerId = e.pointerId;
                dragStartCoord = e[clientCoord];
                dragStartPrimary = sizes[primaryIdx];
                primaryMaxReached = dragStartPrimary;
                lastBucket = -1;
                log('pointerdown g=' + g, {
                    primaryIdx: primaryIdx,
                    primarySign: primarySign,
                    primaryStartedMin: primaryStartedMin,
                    dragStartPrimary: dragStartPrimary,
                    mins_primary: mins[primaryIdx],
                    railSizePx: railSizePx,
                    lastNonZero_primary: lastNonZero[primaryIdx]
                });
                try { gut.setPointerCapture(e.pointerId); } catch (err) { /* iOS */ }
                root.classList.add('pa-splitter--dragging');
                gut.classList.add('pa-splitter__gutter--active');
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
                // Rebase on the drag-start (or max-reached) size of the
                // primary so the threshold is meaningful even when min is 0.
                // At ratio=0.4 the user has to drag below 40% of the anchor
                // to commit. Floored at rail × 1.5 so a pane already near
                // rail doesn't insta-snap on first move.
                return Math.max(railSizePx * 1.5, railSizePx + (anchor - railSizePx) * minimizeThresholdRatio);
            }
            function processMove() {
                rafScheduled = false;
                if (pendingMove == null) return;
                var coord = pendingMove;
                pendingMove = null;
                var delta = coord - dragStartCoord;
                var newPrimary = dragStartPrimary + (primarySign * delta);

                // SNAP-INTO-RAIL: only fires on the primary, and only after
                // it has committed to expanded (primaryCanSnap = true,
                // which is set to true at pointerdown for drag-from-expanded
                // and flipped on the first crossing of mins[primary] for
                // drag-from-rail). Threshold anchored on maxReached.
                if (canMin[primaryIdx] && primaryCanSnap) {
                    if (newPrimary < snapThreshold(primaryMaxReached) && nonMinCount() > 1) {
                        log('move g=' + g + ' SNAP-INTO-RAIL primary i=' + primaryIdx,
                            { newPrimary: newPrimary, threshold: snapThreshold(primaryMaxReached), maxReached: primaryMaxReached });
                        // Compute absorbers BEFORE flipping isMin so the
                        // walk doesn't treat the primary as a rail wall.
                        var snapAbsorbers = computeAbsorbers(g, primaryIdx);
                        isMin[primaryIdx] = true;
                        sizes[primaryIdx] = railSizePx;
                        // Redistribute the freed slack across the contiguous
                        // non-rail block on the secondary side only.
                        var totalSnap = totalAvailable();
                        clampToConstraints(sizes, totalSnap, pinnedForAbsorbers(snapAbsorbers));
                        applySizes({ persist: false });
                        fireCollapse(primaryIdx);
                        return;
                    }
                }

                // DRAG-OUT-OF-RAIL: primary snapped mid-drag and user has
                // now dragged back past the threshold — release the rail
                // commitment. Sets primaryInEscape so the floor stays at
                // railSizePx for the transition out (auto-cleared once
                // newPrimary reaches mins[primary]).
                if (isMin[primaryIdx] && newPrimary >= snapThreshold(primaryMaxReached)) {
                    log('move g=' + g + ' DRAG-OUT-OF-RAIL primary i=' + primaryIdx,
                        { newPrimary: newPrimary, threshold: snapThreshold(primaryMaxReached) });
                    isMin[primaryIdx] = false;
                    primaryInEscape = true;
                    fireExpand(primaryIdx);
                }

                // If primary is still railed (cursor in the snap zone), the
                // drag is a no-op for this frame — primary stays at
                // railSizePx, layout is already correct from the SNAP-INTO-
                // RAIL action. Skipping the floor/max/rebalance below is
                // essential: otherwise the floor would clamp newPrimary up
                // to mins[primary] and re-introduce a "minimized AND at
                // min-width" state (the bug visible as the Inspector
                // showing rail icon but at 180px instead of 40px width).
                if (isMin[primaryIdx]) return;

                // Floor / max for primary. Floor is railSizePx (not mins)
                // when the primary is still in its rail→expanded transition;
                // otherwise it's mins[primary]. The real mins clamp is
                // applied on pointerup if the final size landed below it.
                var floor = ((primaryStartedMin && !primaryCanSnap) || primaryInEscape) ? railSizePx : mins[primaryIdx];
                if (newPrimary < floor) newPrimary = floor;
                if (newPrimary > maxes[primaryIdx]) newPrimary = maxes[primaryIdx];

                if (primaryInEscape && newPrimary >= mins[primaryIdx]) primaryInEscape = false;
                if (!primaryCanSnap && newPrimary >= mins[primaryIdx]) primaryCanSnap = true;
                if (newPrimary > primaryMaxReached) primaryMaxReached = newPrimary;

                // Apply primary's new size, then let clampToConstraints
                // distribute the opposite delta across the contiguous
                // non-rail block on the secondary side ONLY. Everything
                // else (rails, primary, panes across a rail wall) stays
                // pinned. Primary stays at newPrimary unless absorbers
                // can't yield enough — see post-check below.
                sizes[primaryIdx] = newPrimary;
                var total = totalAvailable();
                var absorbers = computeAbsorbers(g, primaryIdx);
                clampToConstraints(sizes, total, pinnedForAbsorbers(absorbers));

                // Post-check: if absorbers couldn't absorb fully (all at
                // their mins), the sum overshoots total. Pull primary back
                // by the overshoot so the layout fits.
                var sum = 0;
                for (var ck = 0; ck < N; ck++) sum += sizes[ck];
                if (Math.abs(sum - total) > 0.5) {
                    sizes[primaryIdx] -= (sum - total);
                    if (sizes[primaryIdx] < floor) sizes[primaryIdx] = floor;
                    if (sizes[primaryIdx] > maxes[primaryIdx]) sizes[primaryIdx] = maxes[primaryIdx];
                }

                var bucket = total > 0 ? Math.floor(sizes[primaryIdx] / total * 4) : -1;
                if (bucket !== lastBucket) {
                    lastBucket = bucket;
                    log('move g=' + g + ' bucket=' + bucket + '/4',
                        'primary=i' + primaryIdx + ':' + Math.round(sizes[primaryIdx]),
                        'sign=' + primarySign,
                        'floor=' + floor,
                        'startedMin=' + primaryStartedMin,
                        'canSnap=' + primaryCanSnap,
                        'maxReached=' + Math.round(primaryMaxReached),
                        'inEscape=' + primaryInEscape,
                        'isMin=' + isMin[primaryIdx]);
                }
                applySizes({ persist: false });
            }

            function onPointerMove(e) {
                if (e.pointerId !== activePointerId) return;
                var delta = e[clientCoord] - dragStartCoord;
                if (!everMoved && Math.abs(delta) >= TAP_PX) {
                    everMoved = true;
                }
                // Asymmetric drag against a primary that started rail'd:
                //   outward (primarySign * delta > 0, would grow primary) →
                //     release the rail, fire expand, fall through to drag math.
                //   inward  (primarySign * delta <= 0, would shrink further) →
                //     no-op for the frame. Pane stays rail'd, gutter doesn't
                //     move, no applySizes call. Stay inert until either the
                //     direction flips outward or the user releases.
                if (primaryStartedMin && isMin[primaryIdx]) {
                    if (primarySign * delta <= 0) return;
                    if (Math.abs(delta) < TAP_PX) return;
                    log('move g=' + g + ' DRAG-OUT-OF-RAIL-AT-START primary i=' + primaryIdx);
                    isMin[primaryIdx] = false;
                    primaryInEscape = true;
                    fireExpand(primaryIdx);
                }
                pendingMove = e[clientCoord];
                if (rafScheduled) return;
                rafScheduled = true;
                requestAnimationFrame(processMove);
            }

            function onPointerUp(e) {
                if (e.pointerId !== activePointerId) return;
                // Flush any rAF-pending move so the final cursor position is
                // reflected in sizes before end-of-drag decisions. Without
                // this, a last-millisecond move scheduled a rAF that fires
                // AFTER pointerup, overwriting pointerup's decisions.
                if (rafScheduled && pendingMove != null) {
                    log('pointerup g=' + g + ' flushing pending move');
                    processMove();
                }
                rafScheduled = false;
                pendingMove = null;
                try { gut.releasePointerCapture(e.pointerId); } catch (err) { /* */ }
                activePointerId = null;
                root.classList.remove('pa-splitter--dragging');
                gut.classList.remove('pa-splitter__gutter--active');
                gut.removeEventListener('pointermove', onPointerMove);
                gut.removeEventListener('pointerup', onPointerUp);
                gut.removeEventListener('pointercancel', onPointerUp);
                log('pointerup g=' + g, {
                    everMoved: everMoved,
                    primaryIdx: primaryIdx,
                    primaryStartedMin: primaryStartedMin,
                    sizes_primary: sizes[primaryIdx],
                    mins_primary: mins[primaryIdx],
                    isMin_primary: isMin[primaryIdx]
                });

                // Tap-without-drag on the gutter is intentionally inert.
                // Restore gestures: rail-body click (handler below), dblclick
                // on the gutter, focus + Enter/Space, toggle button, or drag
                // the gutter outward past the snap threshold.

                // RAIL-STAYED: primary started rail, the user dragged
                // outward enough to release isMin (set in onPointerMove),
                // but the size never grew meaningfully above rail (absorbers
                // had no headroom, or the user dragged back into the snap
                // zone before release). Restore isMin so the visual state
                // matches and fire collapse so consumers see the round-trip.
                var anyChange = false;
                if (primaryStartedMin && Math.abs(sizes[primaryIdx] - railSizePx) < 1 && !isMin[primaryIdx]) {
                    log('pointerup g=' + g + ' RAIL-STAYED primary i=' + primaryIdx);
                    isMin[primaryIdx] = true;
                    anyChange = true;
                    fireCollapse(primaryIdx);
                }

                // CLAMP-TO-MIN: any non-rail pane sitting below its mins
                // (primary that got pulled back during absorber starvation,
                // or absorbers themselves) gets bumped up; remainder
                // redistributed via clampToConstraints across all non-rail
                // panes proportionally.
                var anyBelowMin = false;
                for (var bj = 0; bj < N; bj++) {
                    if (!isMin[bj] && sizes[bj] < mins[bj] - 0.5) { anyBelowMin = true; break; }
                }
                if (anyBelowMin) {
                    log('pointerup g=' + g + ' CLAMP-TO-MIN');
                    for (var bk = 0; bk < N; bk++) {
                        if (!isMin[bk] && sizes[bk] < mins[bk]) sizes[bk] = mins[bk];
                    }
                    var totalPU = totalAvailable();
                    clampToConstraints(sizes, totalPU, isMin);
                    applySizes({ persist: false });
                } else if (anyChange) {
                    applySizes({ persist: false });
                }
                primaryStartedMin = false;
                primaryInEscape = false;
                primaryCanSnap = false;
                primaryMaxReached = 0;
                primaryIdx = -1;
                if (id) writeStorage(id, { v: 2, sizes: sizes.slice(), lasts: lastNonZero.slice(), minimized: isMin.slice() });
            }

            gut.addEventListener('pointerdown', onPointerDown);

            gut.addEventListener('dblclick', function (e) {
                e.preventDefault();
                // Double-click toggles the primary neighbour, falling back
                // to the other neighbour if the primary can't minimize.
                var primary = primaryNeighbour(g);
                var other = primary === g ? g + 1 : g;
                log('dblclick g=' + g, { primary: primary, other: other, canMin_primary: canMin[primary], canMin_other: canMin[other] });
                if (canMin[primary]) togglePane(primary);
                else if (canMin[other]) togglePane(other);
            });

            gut.addEventListener('keydown', function (e) {
                var handled = false;
                var step = stepPx;
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        shiftPrimary(g, -step);
                        handled = true;
                        break;
                    case 'ArrowRight':
                    case 'ArrowDown':
                        shiftPrimary(g, step);
                        handled = true;
                        break;
                    case 'Home':
                        setPrimaryTo(g, mins[primaryNeighbour(g)]);
                        handled = true;
                        break;
                    case 'End':
                        setPrimaryTo(g, maxes[primaryNeighbour(g)]);
                        handled = true;
                        break;
                    case 'Enter':
                    case ' ':
                        var primaryK = primaryNeighbour(g);
                        var otherK = primaryK === g ? g + 1 : g;
                        if (canMin[primaryK]) togglePane(primaryK);
                        else if (canMin[otherK]) togglePane(otherK);
                        handled = true;
                        break;
                }
                if (handled) e.preventDefault();
            });
        }

        // Keyboard equivalent of a drag: change the primary neighbour by
        // `gutterDelta` px (sign convention: positive moves the gutter in
        // the "right/down" direction, so primary on the left grows and
        // primary on the right shrinks). Mirrors the rebalance model used
        // by drag — slack absorbed by all non-rail non-primary panes.
        function shiftPrimary(g, gutterDelta) {
            var primary = primaryNeighbour(g);
            if (isMin[primary]) return;
            var sign = (primary === g) ? 1 : -1;
            setPrimaryTo(g, sizes[primary] + sign * gutterDelta);
        }

        function setPrimaryTo(g, newSize) {
            var primary = primaryNeighbour(g);
            if (isMin[primary]) return;
            var target = newSize;
            if (target < mins[primary]) target = mins[primary];
            if (target > maxes[primary]) target = maxes[primary];
            sizes[primary] = target;
            var total = totalAvailable();
            var absorbers = computeAbsorbers(g, primary);
            clampToConstraints(sizes, total, pinnedForAbsorbers(absorbers));
            var sum = 0;
            for (var i = 0; i < N; i++) sum += sizes[i];
            if (Math.abs(sum - total) > 0.5) {
                sizes[primary] -= (sum - total);
                if (sizes[primary] < mins[primary]) sizes[primary] = mins[primary];
                if (sizes[primary] > maxes[primary]) sizes[primary] = maxes[primary];
            }
            applySizes();
        }

        // "At least one expanded pane" invariant. Without it, restore-from-rail
        // math degenerates (all panes at rail → available headroom from other
        // panes is zero or negative → restore can't pull enough room for the
        // pane being restored, layout overflows). Toggle button / dblclick /
        // drag-to-rail all gate on this.
        function nonMinCount() {
            var c = 0;
            for (var k = 0; k < N; k++) if (!isMin[k]) c++;
            return c;
        }

        // Absorbers for a drag on gutter `g` with the given `primary`
        // neighbour. Two modes:
        //
        //   1. CLASSIC (no rail wall between primary and the immediate
        //      secondary neighbour): just the immediate adjacent non-rail
        //      pane absorbs. Equivalent to a standard boundary-coupled
        //      splitter — panes farther away on the same side don't shift.
        //
        //   2. TUNNEL (immediate secondary is rail): skip the rail(s),
        //      then collect the contiguous non-rail block beyond. Lets
        //      slack punch through a rail wall to the next "section",
        //      which is the only way drag-from-rail can grow the primary
        //      when its immediate neighbour is also rail (e.g. AcBcCeDeEc
        //      dragging A|B — slack has to come from C/D past the B wall).
        //
        // In all-expanded layouts mode 1 fires and only the adjacent pane
        // changes, which matches user intuition: dragging D|E in `abcde`
        // shouldn't ripple A and B around.
        function computeAbsorbers(g, primary) {
            var absorbers = [];
            var sawRail = false;
            if (primary === g) {
                // Secondary side = right of gutter; walk from g+1 forward.
                for (var i = g + 1; i < N; i++) {
                    if (isMin[i]) {
                        if (absorbers.length > 0) break; // end of tunneled block
                        sawRail = true;
                        continue;
                    }
                    absorbers.push(i);
                    if (!sawRail) break; // CLASSIC: only the immediate neighbour
                }
            } else {
                // Secondary side = left of gutter; walk from g backward.
                for (var j = g; j >= 0; j--) {
                    if (isMin[j]) {
                        if (absorbers.length > 0) break;
                        sawRail = true;
                        continue;
                    }
                    absorbers.push(j);
                    if (!sawRail) break;
                }
            }
            return absorbers;
        }

        // Build a `pinned` array for clampToConstraints that lets ONLY the
        // listed absorbers flex; everything else (rail panes, primary,
        // panes on the far side of a rail wall) stays put.
        function pinnedForAbsorbers(absorbers) {
            var pinned = new Array(N);
            for (var i = 0; i < N; i++) pinned[i] = true;
            for (var k = 0; k < absorbers.length; k++) pinned[absorbers[k]] = false;
            return pinned;
        }

        // Primary-neighbour heuristic for gutter `g`: pick the side closer to
        // its container edge (so a gutter near the right edge picks pane g+1,
        // a gutter near the left edge picks pane g). When the two neighbours
        // are equidistant from their respective edges — exact-middle gutter on
        // an even-N splitter, or the lone gutter on a 2-pane splitter —
        // LTR/RTL is the tiebreaker (LTR → left, RTL → right). Used by
        // dblclick and keyboard toggle (`Enter` / `Space`) to decide which
        // neighbour collapses when both are candidates.
        function primaryNeighbour(g) {
            var leftDist = g;             // pane g → left edge
            var rightDist = N - 2 - g;    // pane g+1 → right edge
            if (leftDist < rightDist) return g;
            if (rightDist < leftDist) return g + 1;
            return getComputedStyle(root).direction === 'rtl' ? (g + 1) : g;
        }

        function minimizePane(i) {
            if (!canMin[i] || isMin[i]) {
                log('minimizePane i=' + i + ' NOOP', { canMin: canMin[i], isMin: isMin[i] });
                return;
            }
            if (nonMinCount() <= 1) {
                log('minimizePane i=' + i + ' BLOCKED (would leave zero non-min)');
                return;
            }
            var slack = sizes[i] - railSizePx;
            log('minimizePane i=' + i, {
                sizes_i: sizes[i],
                slack: slack,
                position: i === 0 ? 'start' : (i === N - 1 ? 'end' : 'middle'),
                lastNonZero_i_before: lastNonZero[i]
            });
            isMin[i] = true;
            sizes[i] = railSizePx;
            // Distribute slack across ALL non-minimized panes proportionally
            // to their current sizes. clampToConstraints walks the sum, picks
            // panes with growth headroom (max - size), and redistributes the
            // delta to them — respecting per-pane maxes and converging in
            // up to N passes. Pinning all currently-minimized panes (via
            // isMin) keeps railed panes locked at rail width.
            var total = totalAvailable();
            clampToConstraints(sizes, total, isMin);
            applySizes();
            fireCollapse(i);
        }

        function restorePane(i) {
            if (!isMin[i]) {
                log('restorePane i=' + i + ' NOOP (not minimized)');
                return;
            }
            // ACCORDION SWEEP: when accordion mode is engaged, restoring a
            // pane auto-rails any other currently-expanded minimizable
            // panes so exactly one stays open. `lastNonZero` for the
            // panes being railed was already captured on their last
            // applySizes while they were expanded — no extra bookkeeping
            // needed for a future restore to recover their size.
            if (accordionActive) {
                for (var ai = 0; ai < N; ai++) {
                    if (ai !== i && canMin[ai] && !isMin[ai]) {
                        log('restorePane accordion-rail i=' + ai + ' (sweep for restore of i=' + i + ')');
                        isMin[ai] = true;
                        sizes[ai] = railSizePx;
                        fireCollapse(ai);
                    }
                }
            }
            isMin[i] = false;
            // Target: remembered "expanded" size, but never below mins[i].
            // Compute the mins floor first so `deficit` below reflects the
            // actual restored amount (the old order silently bumped target
            // after deficit was captured, making the log say `deficit: 0`
            // for a 120 px restore).
            var target = lastNonZero[i] > 0 ? lastNonZero[i] : Math.max(mins[i], railSizePx * 4);
            if (target < mins[i]) target = mins[i];
            var total = totalAvailable();
            // Two sources of room for the restore:
            //   1. Headroom from other non-minimized panes (sizes - mins).
            //   2. Empty space currently in the container (total - sum) —
            //      a prior minimize can leave a gap when the only available
            //      absorbers hit their `max` cap before consuming all the
            //      slack. Restoring should reclaim that gap first; without
            //      this the restored pane only sees source #1 and gets
            //      stuck at mins even though there's plenty of empty layout
            //      space waiting.
            var currentSum = 0;
            var fromOthers = 0;
            for (var j = 0; j < N; j++) {
                currentSum += sizes[j];
                if (j !== i && !isMin[j]) fromOthers += sizes[j] - mins[j];
            }
            var emptySpace = total - currentSum;
            if (emptySpace < 0) emptySpace = 0;
            var available = fromOthers + emptySpace;
            var deficit = target - sizes[i];
            if (deficit > available) {
                target = sizes[i] + available;
                deficit = available;
            }
            log('restorePane i=' + i, {
                lastNonZero_i: lastNonZero[i],
                position: i === 0 ? 'start' : (i === N - 1 ? 'end' : 'middle'),
                deficit: deficit,
                target: target,
                available: available,
                fromOthers: fromOthers,
                emptySpace: emptySpace
            });
            sizes[i] = target;
            // Only redistribute on OVERSHOOT (sum > total). If the restored
            // pane plus the unchanged others already fits, leave any
            // remaining gap alone — don't grow neighbours to fill it.
            // Without this, restoring pane i with a leftover gap (e.g. 5
            // panes where pane 0 was capped at its max during minimization)
            // would make clampToConstraints "fill" the gap by inflating
            // the only flexable non-rail pane, producing the jump UX where
            // a previously-restored pane suddenly grows when another pane
            // is restored. Visible empty space is the lesser evil here:
            // it goes away naturally as the user restores more panes.
            //
            // Accordion mode is the explicit opposite — only one pane is
            // expanded so a gap to its right is just dead space. Fill it.
            var newSum = 0;
            for (var ns = 0; ns < N; ns++) newSum += sizes[ns];
            if (newSum > total + 0.5) {
                var pinned = isMin.slice();
                pinned[i] = true;
                clampToConstraints(sizes, total, pinned);
            } else if (accordionActive) {
                expandNonMinToFill();
            }
            applySizes();
            fireExpand(i);
        }

        function togglePane(i) {
            log('togglePane i=' + i, { currentlyMin: isMin[i] });
            if (isMin[i]) restorePane(i);
            else minimizePane(i);
        }

        // ---- Accordion mode (auto, viewport-driven) ----
        // Engaged when container width is below the sum of all panes'
        // mins + gutters + gaps + padding AND there are 2+ minimizable
        // panes (otherwise there's nothing to switch between). While
        // active, restoring one pane auto-rails the others — see the
        // ACCORDION SWEEP block in restorePane().
        var accordionActive = false;

        function requiredForAllExpanded() {
            // mins[] are in px (resolved by resolveConstraints against the
            // current container). gutterTotal/gapPx/paddingPx mirror
            // totalAvailable()'s deductions so the comparison is apples-
            // to-apples with root[clientAxis].
            var sum = 0;
            for (var i = 0; i < N; i++) sum += mins[i];
            var gapCount = 2 * (N - 1);
            return sum + gutterTotal() + (gapCount * gapPx()) + paddingPx();
        }

        function shouldBeAccordion() {
            var minimizableCount = 0;
            for (var i = 0; i < N; i++) if (canMin[i]) minimizableCount++;
            if (minimizableCount < 2) return false;
            return root[clientAxis] < requiredForAllExpanded();
        }

        function enterAccordion() {
            if (accordionActive) return;
            accordionActive = true;
            root.classList.add('pa-splitter--accordion');
            // Pick what to keep expanded. Priority:
            //   1. A non-minimizable pane (it has to stay expanded anyway)
            //   2. The first currently-expanded minimizable pane (user's
            //      current focus survives the transition)
            //   3. Pane 0 as fallback
            var keepIdx = -1;
            for (var i = 0; i < N; i++) {
                if (!canMin[i]) { keepIdx = i; break; }
            }
            if (keepIdx === -1) {
                for (var j = 0; j < N; j++) {
                    if (canMin[j] && !isMin[j]) { keepIdx = j; break; }
                }
            }
            if (keepIdx === -1) keepIdx = 0;
            log('enterAccordion keepIdx=' + keepIdx);
            for (var k = 0; k < N; k++) {
                if (k !== keepIdx && canMin[k] && !isMin[k]) {
                    isMin[k] = true;
                    sizes[k] = railSizePx;
                    fireCollapse(k);
                }
            }
            expandNonMinToFill();
            applySizes();
        }

        // In accordion mode the expanded pane(s) consume all remaining
        // space, IGNORING their declared `max` constraints. Rationale:
        // `max` is a "share fairly with siblings" ceiling that stops
        // making sense once the siblings are all railed — strictly
        // honouring it just leaves a visible gap to the right of the
        // expanded pane. Mins are still respected.
        function expandNonMinToFill() {
            var total = totalAvailable();
            var sum = 0;
            var flexable = [];
            var flexableWeight = 0;
            for (var i = 0; i < N; i++) {
                sum += sizes[i];
                if (!isMin[i]) {
                    flexable.push(i);
                    flexableWeight += sizes[i] > 0 ? sizes[i] : 1;
                }
            }
            var diff = total - sum;
            if (flexable.length === 0 || Math.abs(diff) < 0.5) return;
            for (var k = 0; k < flexable.length; k++) {
                var idx = flexable[k];
                var weight = (sizes[idx] > 0 ? sizes[idx] : 1) / flexableWeight;
                var next = sizes[idx] + diff * weight;
                if (next < mins[idx]) next = mins[idx];
                sizes[idx] = next;
            }
        }

        function exitAccordion() {
            if (!accordionActive) return;
            accordionActive = false;
            root.classList.remove('pa-splitter--accordion');
            log('exitAccordion');
            // Don't auto-restore panes. The user railed them implicitly
            // by going narrow; restoring them on widen would surprise
            // anyone who narrowed/widened during a single session. They
            // click a rail when they want it back.
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
        // savedLasts[s] is filtered: values at or below the pane's `mins[s]`
        // are useless for restore (would just bump to mins anyway) and
        // typically reflect a stale buggy state where the pane's rail size
        // got persisted as its "last expanded size". Falling back to the
        // attribute-derived default (set in pass 2) gives a sensible restore.
        if (savedSizes) {
            for (var s = 0; s < Math.min(N, savedSizes.length); s++) {
                if (typeof savedSizes[s] === 'number') sizes[s] = savedSizes[s];
                if (savedLasts && typeof savedLasts[s] === 'number' && savedLasts[s] > mins[s]) lastNonZero[s] = savedLasts[s];
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
            // Enforce the "at least one expanded pane" invariant on saved state.
            // A blob from before this rule (or from a corrupted localStorage)
            // could claim every pane is minimized; we keep the first one open
            // so the user has something to drag from.
            var allMin = true;
            for (var sm = 0; sm < N; sm++) if (!startupMinimized[sm]) { allMin = false; break; }
            if (allMin) {
                log('rAF apply: saved state had all panes minimized — keeping pane 0 expanded');
                startupMinimized[0] = false;
            }
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
            // If the startup viewport is already too narrow to fit all
            // panes at their mins, engage accordion immediately so the
            // user never sees the cramped all-rails-except-one-natural
            // state.
            if (shouldBeAccordion()) enterAccordion();
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
            log('toggle-button click i=' + idx);
            e.preventDefault();
            e.stopPropagation();
            togglePane(idx);
        });

        // ---- Click rail to restore ----
        for (var rp = 0; rp < N; rp++) {
            (function (idx) {
                panes[idx].addEventListener('click', function () {
                    log('rail click i=' + idx, { isMin: isMin[idx] });
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
                log('ResizeObserver fire', {
                    oldTotal: lastTotal,
                    newTotal: total,
                    sizesBefore: sizes.slice(),
                    isMin: isMin.slice()
                });
                // Accordion mode toggles BEFORE the scale pass. Entering
                // accordion rails most panes (large layout change); exiting
                // is a flag-only flip and falls through to the normal
                // scale so the remaining expanded panes reflow into the
                // new width.
                var wantAccordion = shouldBeAccordion();
                if (wantAccordion && !accordionActive) {
                    enterAccordion();
                    lastTotal = total;
                    return;
                }
                if (!wantAccordion && accordionActive) {
                    exitAccordion();
                }
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
                // In accordion mode the expanded pane(s) ignore max and
                // consume all remaining space — clampToConstraints would
                // re-clip to max and leave a gap.
                if (accordionActive) {
                    expandNonMinToFill();
                } else {
                    clampToConstraints(sizes, total, isMin);
                }
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

    var pa = (window.pureAdmin = window.pureAdmin || {});
    (pa.components = pa.components || {}).splitter = { init: init, initAll: initAll };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }
})();
