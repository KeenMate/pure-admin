/**
 * Pure Admin — Range Group
 *
 * Drives the compact multi-range filter (.pa-range-group): a toggle that
 * summarises N numeric range filters inline, expanding into a floating panel
 * of sliders (one .pa-range per dimension).
 *
 * Each .pa-range row is either dual-thumb (min–max range) or single-thumb
 * (a >= / <= threshold), configured per-row via data attributes:
 *
 *   data-key          unique id for the row (used in event payloads)
 *   data-label        display label
 *   data-min/-max     numeric bounds (required)
 *   data-step         step increment (default 1)
 *   data-mode         "range" (default) | "single"
 *   data-bound        single mode only: "gte" (default) | "lte"
 *   data-value        single mode initial value (default = min for gte, max for lte)
 *   data-value-min    range mode initial low  (default = min)
 *   data-value-max    range mode initial high (default = max)
 *   data-prefix       string prepended to formatted numbers (e.g. "$")
 *   data-suffix       string appended to formatted numbers (e.g. " kg")
 *   data-thousands    present → group the integer part with thousands separators
 *   data-ticks        major tick interval (value units) → draws tick marks
 *   data-ticks-minor  minor tick interval (value units) → finer marks
 *   data-tick-labels  present → render numeric labels under the major ticks
 *   data-snap-ticks   present → thumbs settle on the nearest tick, not the step
 *
 * The track is click-to-seek: a pointerdown anywhere on a row (off the thumbs)
 * moves the nearest thumb to that point and continues the drag from there.
 *
 * Positioning is done entirely in 0–100% of the rail via CSS custom
 * properties (--_pos on thumbs, --_fill-start / --_fill-end on the fill).
 * The SCSS reads those through logical inset properties, so RTL mirrors for
 * free — this module inverts the pointer ratio for RTL and is otherwise
 * direction-agnostic.
 *
 * Events (dispatched on the .pa-range-group element, bubbling):
 *   pa-range-group:change   live on every value change   detail = { values }
 *   pa-range-group:apply    on Apply button              detail = { values }
 *   pa-range-group:reset    on Reset button              detail = { values }
 *
 * `values` is a map keyed by data-key. Range rows → { min, max } (null when
 * the bound is at its extent, i.e. "Any"). Single rows → { value, bound }
 * (value null when at extent).
 *
 * Panel anchoring mirrors split-button.js (Floating UI, panel reparented to
 * <body> to escape overflow clipping).
 */

(function () {
    'use strict';

    var EN_DASH = '–';

    // ---- number formatting -------------------------------------------------

    function groupThousands(intStr) {
        return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function formatValue(row, v) {
        var out = String(Math.round(v * 1e6) / 1e6);
        if (row.thousands) {
            var neg = out.charAt(0) === '-';
            var abs = neg ? out.slice(1) : out;
            var parts = abs.split('.');
            parts[0] = groupThousands(parts[0]);
            out = (neg ? '-' : '') + parts.join('.');
        }
        return row.prefix + out + row.suffix;
    }

    // Short label for a row's current selection, or '' when it means "Any".
    function selectionText(row) {
        if (row.mode === 'single') {
            if (row.bound === 'lte') {
                return row.value >= row.max ? '' : '≤ ' + formatValue(row, row.value);
            }
            // gte
            return row.value <= row.min ? '' : formatValue(row, row.value) + '+';
        }
        // range
        var full = row.valueMin <= row.min && row.valueMax >= row.max;
        if (full) return '';
        return formatValue(row, row.valueMin) + EN_DASH + formatValue(row, row.valueMax);
    }

    // ---- geometry ----------------------------------------------------------

    function pct(row, v) {
        if (row.max === row.min) return 0;
        return ((v - row.min) / (row.max - row.min)) * 100;
    }

    function snap(row, v) {
        // With data-snap-ticks, settle on the nearest tick value instead of the
        // (possibly finer) step grid. Tick values are pre-clamped to bounds.
        if (row.snapTicks && row.tickValues && row.tickValues.length) {
            return nearestIn(row.tickValues, v);
        }
        var stepped = row.min + Math.round((v - row.min) / row.step) * row.step;
        // Clean float dust from the division.
        stepped = Math.round(stepped * 1e6) / 1e6;
        return Math.min(row.max, Math.max(row.min, stepped));
    }

    function nearestIn(arr, v) {
        var best = arr[0], bestD = Math.abs(v - arr[0]);
        for (var i = 1; i < arr.length; i++) {
            var d = Math.abs(v - arr[i]);
            if (d < bestD) { bestD = d; best = arr[i]; }
        }
        return best;
    }

    function nearestTickIndex(row, v) {
        var arr = row.tickValues, best = 0, bestD = Math.abs(v - arr[0]);
        for (var i = 1; i < arr.length; i++) {
            var d = Math.abs(v - arr[i]);
            if (d < bestD) { bestD = d; best = i; }
        }
        return best;
    }

    function render(row) {
        var fill = row.el.querySelector('[data-range-fill]');
        var minPct, maxPct, fillStart, fillEnd;

        if (row.mode === 'single') {
            var p = pct(row, row.value);
            row.thumbMax.style.setProperty('--_pos', p + '%');
            if (row.bound === 'lte') {
                fillStart = 0;
                fillEnd = 100 - p;
            } else {
                fillStart = p;
                fillEnd = 0;
            }
        } else {
            minPct = pct(row, row.valueMin);
            maxPct = pct(row, row.valueMax);
            row.thumbMin.style.setProperty('--_pos', minPct + '%');
            row.thumbMax.style.setProperty('--_pos', maxPct + '%');
            fillStart = minPct;
            fillEnd = 100 - maxPct;
        }

        if (fill) {
            fill.style.setProperty('--_fill-start', fillStart + '%');
            fill.style.setProperty('--_fill-end', fillEnd + '%');
        }

        // Aria + per-row value readout.
        var text = selectionText(row);
        var readout = row.el.parentNode.querySelector('[data-range-output]');
        if (readout) {
            readout.textContent = text || 'Any';
            readout.classList.toggle('pa-range-group__row-value--empty', !text);
        }
        updateThumbAria(row);
    }

    function updateThumbAria(row) {
        function set(thumb, val) {
            if (!thumb) return;
            thumb.setAttribute('aria-valuemin', row.min);
            thumb.setAttribute('aria-valuemax', row.max);
            thumb.setAttribute('aria-valuenow', val);
            thumb.setAttribute('aria-valuetext', formatValue(row, val));
        }
        if (row.mode === 'single') {
            set(row.thumbMax, row.value);
        } else {
            set(row.thumbMin, row.valueMin);
            set(row.thumbMax, row.valueMax);
        }
    }

    // ---- value mutation ----------------------------------------------------

    function setThumb(row, which, v) {
        v = snap(row, v);
        if (row.mode === 'single') {
            row.value = v;
        } else if (which === 'min') {
            row.valueMin = Math.min(v, row.valueMax);
        } else {
            row.valueMax = Math.max(v, row.valueMin);
        }
        render(row);
        row.group.onChange();
    }

    // Pointer x → value, honouring RTL (rail measured from the inline-start).
    function pointerToValue(row, clientX) {
        var rail = row.el.querySelector('.pa-range__rail');
        var rect = rail.getBoundingClientRect();
        var rtl = getComputedStyle(row.el).direction === 'rtl';
        var ratio = rtl
            ? (rect.right - clientX) / rect.width
            : (clientX - rect.left) / rect.width;
        ratio = Math.min(1, Math.max(0, ratio));
        return row.min + ratio * (row.max - row.min);
    }

    // ---- row wiring --------------------------------------------------------

    function numAttr(el, name, fallback) {
        var raw = el.getAttribute(name);
        if (raw === null || raw === '') return fallback;
        var n = parseFloat(raw);
        return isNaN(n) ? fallback : n;
    }

    function buildRow(el, group) {
        var min = numAttr(el, 'data-min', 0);
        var max = numAttr(el, 'data-max', 100);
        var mode = el.getAttribute('data-mode') === 'single' ? 'single' : 'range';
        var bound = el.getAttribute('data-bound') === 'lte' ? 'lte' : 'gte';

        var row = {
            el: el,
            group: group,
            key: el.getAttribute('data-key') || '',
            label: el.getAttribute('data-label') || '',
            min: min,
            max: max,
            step: numAttr(el, 'data-step', 1),
            mode: mode,
            bound: bound,
            prefix: el.getAttribute('data-prefix') || '',
            suffix: el.getAttribute('data-suffix') || '',
            thousands: el.hasAttribute('data-thousands'),
            snapTicks: el.hasAttribute('data-snap-ticks'),
            thumbMin: el.querySelector('[data-range-thumb="min"]'),
            thumbMax: el.querySelector('[data-range-thumb="max"]')
        };

        // Compute tick values up front so the initial value snap (below) can
        // honour data-snap-ticks; the DOM marks are drawn later by renderTicks.
        computeTicks(row);

        if (mode === 'single') {
            row.value = numAttr(el, 'data-value', bound === 'lte' ? max : min);
            row.value = snap(row, row.value);
            el.classList.add('pa-range--single');
        } else {
            row.valueMin = snap(row, numAttr(el, 'data-value-min', min));
            row.valueMax = snap(row, numAttr(el, 'data-value-max', max));
            if (row.valueMin > row.valueMax) row.valueMin = row.valueMax;
        }

        wireThumb(row, row.thumbMin, 'min');
        wireThumb(row, row.thumbMax, 'max');
        wireTrackSeek(row);
        renderTicks(row);
        render(row);
        return row;
    }

    // Compute a row's tick values from data-ticks / data-ticks-minor. Stores a
    // sorted, de-duped list on row.tickValues (used for snapping + rendering)
    // and a set of the major positions on row.tickMajorAt. No DOM here.
    function computeTicks(row) {
        var majorStep = numAttr(row.el, 'data-ticks', 0);
        if (!(majorStep > 0)) { row.tickValues = null; return; }
        var minorStep = numAttr(row.el, 'data-ticks-minor', 0);
        var EPS = row.step ? row.step * 1e-4 : 1e-6;
        var key = function (v) { return Math.round(v * 1e6); };

        var majorAt = {}, seen = {}, vals = [];
        var v, cv;
        for (v = row.min; v <= row.max + EPS; v += majorStep) {
            majorAt[key(Math.min(v, row.max))] = true;
        }
        function add(v) {
            cv = Math.min(v, row.max);
            if (!seen[key(cv)]) { seen[key(cv)] = true; vals.push(cv); }
        }
        if (minorStep > 0) {
            for (v = row.min; v <= row.max + EPS; v += minorStep) add(v);
        }
        for (v = row.min; v <= row.max + EPS; v += majorStep) add(v);
        vals.sort(function (a, b) { return a - b; });

        row.tickValues = vals;
        row.tickMajorAt = majorAt;
        row.tickLabels = row.el.hasAttribute('data-tick-labels');
    }

    // Draw the tick marks (and optional labels) computed by computeTicks. The
    // container is the rail's FIRST child, so marks paint behind the track/fill
    // and align with thumb travel.
    function renderTicks(row) {
        if (!row.tickValues) return;
        var rail = row.el.querySelector('.pa-range__rail');
        if (!rail) return;
        var key = function (v) { return Math.round(v * 1e6); };

        var ticks = document.createElement('div');
        ticks.className = 'pa-range__ticks';
        var labels = null;
        if (row.tickLabels) {
            labels = document.createElement('div');
            labels.className = 'pa-range__tick-labels';
            row.el.classList.add('pa-range--ticks-labeled');
        }

        row.tickValues.forEach(function (v) {
            var major = !!row.tickMajorAt[key(v)];
            var m = document.createElement('span');
            m.className = major ? 'pa-range__tick pa-range__tick--major' : 'pa-range__tick';
            m.style.setProperty('--_pos', pct(row, v) + '%');
            ticks.appendChild(m);
            if (major && labels) {
                var l = document.createElement('span');
                l.className = 'pa-range__tick-label';
                l.style.setProperty('--_pos', pct(row, v) + '%');
                l.textContent = formatValue(row, v);
                labels.appendChild(l);
            }
        });

        rail.insertBefore(ticks, rail.firstChild);
        if (labels) rail.appendChild(labels);
    }

    // Which thumb should a click/drag at value `v` drive? Single → the lone
    // (max) thumb. Range → the nearer thumb, with the bounds biased so a click
    // beyond a thumb always grabs that thumb.
    function nearestWhich(row, v) {
        if (row.mode === 'single') return 'max';
        if (v <= row.valueMin) return 'min';
        if (v >= row.valueMax) return 'max';
        return (v - row.valueMin) <= (row.valueMax - v) ? 'min' : 'max';
    }

    // Shared drag driver for both thumb-grabs and track-seeks. Moves `which`
    // to the pointer immediately, then follows the pointer via document-level
    // listeners until release (works even if the pointer leaves the thumb).
    function beginDrag(row, which, e) {
        var thumb = which === 'min' ? row.thumbMin : row.thumbMax;
        if (!thumb) return;
        e.preventDefault();
        thumb.focus();
        thumb.classList.add('pa-range__thumb--grabbing');
        row._drag = which;
        setThumb(row, which, pointerToValue(row, e.clientX));

        function move(ev) {
            if (row._drag == null) return;
            ev.preventDefault();
            setThumb(row, row._drag, pointerToValue(row, ev.clientX));
        }
        function up() {
            if (row._drag == null) return;
            thumb.classList.remove('pa-range__thumb--grabbing');
            row._drag = null;
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            document.removeEventListener('pointercancel', up);
        }
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', up);
    }

    // Click anywhere on the track (not on a thumb) seeks the nearest thumb to
    // that point and lets the drag continue from there.
    function wireTrackSeek(row) {
        row.el.addEventListener('pointerdown', function (e) {
            if (e.target.closest('.pa-range__thumb')) return;   // thumb owns its own
            var v = snap(row, pointerToValue(row, e.clientX));
            beginDrag(row, nearestWhich(row, v), e);
        });
    }

    function wireThumb(row, thumb, which) {
        if (!thumb) return;
        // Single mode uses only the max thumb.
        if (row.mode === 'single' && which === 'min') return;

        thumb.setAttribute('role', 'slider');
        thumb.setAttribute('tabindex', '0');

        thumb.addEventListener('pointerdown', function (e) {
            beginDrag(row, which, e);
        });

        thumb.addEventListener('keydown', function (e) {
            var cur = row.mode === 'single'
                ? row.value
                : (which === 'min' ? row.valueMin : row.valueMax);
            var next = null;

            // Snap-to-ticks rows navigate tick-to-tick: a step-sized delta could
            // be smaller than a tick gap and get swallowed by the snap, freezing
            // the handle. Arrows = ±1 tick, Page = ±3 ticks.
            if (row.snapTicks && row.tickValues && row.tickValues.length) {
                var arr = row.tickValues;
                var idx = nearestTickIndex(row, cur);
                var clamp = function (i) { return Math.min(arr.length - 1, Math.max(0, i)); };
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowUp':   next = arr[clamp(idx + 1)]; break;
                    case 'ArrowLeft':
                    case 'ArrowDown': next = arr[clamp(idx - 1)]; break;
                    case 'PageUp':    next = arr[clamp(idx + 3)]; break;
                    case 'PageDown':  next = arr[clamp(idx - 3)]; break;
                    case 'Home':      next = row.min; break;
                    case 'End':       next = row.max; break;
                    default: return;
                }
                e.preventDefault();
                setThumb(row, which, next);
                return;
            }

            var big = row.step * 10;
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowUp':   next = cur + row.step; break;
                case 'ArrowLeft':
                case 'ArrowDown': next = cur - row.step; break;
                case 'PageUp':    next = cur + big; break;
                case 'PageDown':  next = cur - big; break;
                case 'Home':      next = row.min; break;
                case 'End':       next = row.max; break;
                default: return;
            }
            e.preventDefault();
            setThumb(row, which, next);
        });
    }

    function resetRow(row) {
        if (row.mode === 'single') {
            row.value = row.bound === 'lte' ? row.max : row.min;
        } else {
            row.valueMin = row.min;
            row.valueMax = row.max;
        }
        render(row);
    }

    function rowValue(row) {
        if (row.mode === 'single') {
            var atExtent = row.bound === 'lte' ? row.value >= row.max : row.value <= row.min;
            return { value: atExtent ? null : row.value, bound: row.bound };
        }
        return {
            min: row.valueMin <= row.min ? null : row.valueMin,
            max: row.valueMax >= row.max ? null : row.valueMax
        };
    }

    // ---- group wiring ------------------------------------------------------

    var FUI = window.FloatingUIDOM || null;

    function buildGroup(root) {
        if (root._rangeGroup) return;

        var toggle = root.querySelector('[data-range-group-toggle]');
        var panel = root.querySelector('[data-range-group-panel]');
        var summary = root.querySelector('[data-range-group-summary]');
        if (!toggle || !panel) return;

        var group = {
            root: root,
            toggle: toggle,
            panel: panel,
            summary: summary,
            rows: [],
            open: false,
            cleanup: null,
            onChange: function () {
                updateSummary(group);
                dispatch(group, 'change');
            }
        };

        var rowEls = root.querySelectorAll('[data-range]');
        for (var i = 0; i < rowEls.length; i++) {
            group.rows.push(buildRow(rowEls[i], group));
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleGroup(group);
        });

        var resetBtn = root.querySelector('[data-range-group-reset]');
        if (resetBtn) {
            resetBtn.addEventListener('click', function (e) {
                e.preventDefault();
                group.rows.forEach(resetRow);
                updateSummary(group);
                dispatch(group, 'change');
                dispatch(group, 'reset');
            });
        }

        var applyBtn = root.querySelector('[data-range-group-apply]');
        if (applyBtn) {
            applyBtn.addEventListener('click', function (e) {
                e.preventDefault();
                dispatch(group, 'apply');
                closeGroup(group);
            });
        }

        updateSummary(group);
        root._rangeGroup = group;
    }

    function collectValues(group) {
        var values = {};
        group.rows.forEach(function (row) {
            if (row.key) values[row.key] = rowValue(row);
        });
        return values;
    }

    function dispatch(group, name) {
        group.root.dispatchEvent(new CustomEvent('pa-range-group:' + name, {
            bubbles: true,
            detail: { values: collectValues(group) }
        }));
    }

    function span(cls, text) {
        var s = document.createElement('span');
        s.className = cls;
        s.textContent = text;
        return s;
    }

    // "LABEL value / LABEL value / …" on a single line.
    function updateSummary(group) {
        if (!group.summary) return;
        group.summary.textContent = '';
        group.rows.forEach(function (row, idx) {
            if (idx > 0) {
                group.summary.appendChild(span('pa-range-group__seg-sep', '/'));
            }
            var text = selectionText(row);
            group.summary.appendChild(span('pa-range-group__seg-label', row.label));
            group.summary.appendChild(document.createTextNode(' '));
            group.summary.appendChild(
                text
                    ? span('pa-range-group__seg-value', text)
                    : span('pa-range-group__seg-value pa-range-group__seg-value--empty', 'Any')
            );
        });
    }

    // ---- open/close + floating positioning --------------------------------

    function toggleGroup(group) {
        if (group.open) closeGroup(group); else openGroup(group);
    }

    function openGroup(group) {
        closeActive();
        group.open = true;
        group.root.classList.add('pa-range-group--open');
        group.toggle.setAttribute('aria-expanded', 'true');

        // Reparent to body so the panel escapes any overflow:hidden ancestor.
        group.panel._originalParent = group.root;
        document.body.appendChild(group.panel);
        group.panel.classList.add('pa-range-group__panel--open');
        activeGroup = group;

        if (FUI) {
            group.cleanup = FUI.autoUpdate(group.toggle, group.panel, function () {
                position(group);
            });
        } else {
            position(group);
        }
    }

    function position(group) {
        if (FUI) {
            FUI.computePosition(group.toggle, group.panel, {
                placement: 'bottom-start',
                strategy: 'fixed',
                middleware: [FUI.offset(6), FUI.flip(), FUI.shift({ padding: 8 })]
            }).then(function (pos) {
                Object.assign(group.panel.style, {
                    position: 'fixed',
                    left: pos.x + 'px',
                    top: pos.y + 'px'
                });
            });
            return;
        }
        // Fallback: anchor directly under the toggle.
        var rect = group.toggle.getBoundingClientRect();
        Object.assign(group.panel.style, {
            position: 'fixed',
            left: rect.left + 'px',
            top: (rect.bottom + 6) + 'px'
        });
    }

    function closeGroup(group) {
        if (!group.open) return;
        group.open = false;
        group.root.classList.remove('pa-range-group--open');
        group.toggle.setAttribute('aria-expanded', 'false');

        if (group.cleanup) { group.cleanup(); group.cleanup = null; }
        group.panel.classList.remove('pa-range-group__panel--open');

        if (group.panel._originalParent) {
            group.panel._originalParent.appendChild(group.panel);
            delete group.panel._originalParent;
        }
        group.panel.style.position = '';
        group.panel.style.left = '';
        group.panel.style.top = '';

        if (activeGroup === group) activeGroup = null;
    }

    // Only one panel open at a time.
    var activeGroup = null;
    function closeActive() {
        if (activeGroup) closeGroup(activeGroup);
    }

    document.addEventListener('click', function (e) {
        if (!activeGroup) return;
        if (activeGroup.panel.contains(e.target)) return;
        if (activeGroup.root.contains(e.target)) return;
        closeGroup(activeGroup);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeGroup) {
            var g = activeGroup;
            closeGroup(g);
            g.toggle.focus();
        }
    });

    // ---- init --------------------------------------------------------------

    function initAll(scope) {
        (scope || document).querySelectorAll('[data-range-group]').forEach(buildGroup);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }

    window.PaRangeGroup = { init: initAll };
})();
