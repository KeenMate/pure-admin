/* KPI showcases — Chart.js drop-in examples.
 *
 * Demonstrates that the pa-kpi-* chart slots are plain containers, not
 * tied to the hand-authored inline SVG sparkline — drop a real charting
 * library (rendering a visibly different chart type) into the same slot
 * and it just works.
 *
 * Each <canvas data-kpi-chart> is rendered as a minimal Chart.js chart
 * (no axes, no grid, no legend, no tooltip) that:
 *   - reads its colour from the slot's resolved `color`. The KPI sentiment
 *     cascade sets `color: var(--pa-kpi-accent)` (or a sentiment token) on
 *     the chart wrapper, so `currentColor` already carries the correct
 *     sentiment hue — the chart inherits it for free.
 *   - re-reads that colour on the `pa:theme-change` window event so it
 *     tracks theme swaps, same pattern as the dashboard D3 chart.
 *
 * Sizing: responsive width + maintainAspectRatio, so the slot only needs
 * a determinate width (every KPI chart slot has one). No fixed-height
 * host required. Override per canvas with data-kpi-aspect.
 *
 * Data attributes on the canvas:
 *   data-kpi-chart            marker — required
 *   data-kpi-type="bar"       "bar" (default) or "line"
 *   data-kpi-points="[...]"   JSON array of numbers (the series)
 *   data-kpi-fill="area"      line type only — "area" (default) or "line"
 *   data-kpi-aspect="8"       width:height ratio (default 8)
 *
 * Other Chart.js types (doughnut, pie, radar, …) drop into the same slot
 * the same way — they're just not used by these examples because the KPI
 * data here is single-metric time series, not parts-of-a-whole.
 *
 * No-op when the page has no [data-kpi-chart] canvases or Chart is absent,
 * so it's safe to load globally from layout.mustache.
 */
(function () {
    'use strict';

    var charts = [];

    /* Resolve the canvas's inherited `color` (the sentiment cascade) to an
       [r, g, b] triple. getComputedStyle always returns rgb()/rgba(). */
    function resolveRgb(canvas) {
        var c = getComputedStyle(canvas).color;
        var m = c.match(/(\d+(?:\.\d+)?)/g);
        if (!m || m.length < 3) return [59, 130, 246]; // #3b82f6 fallback
        return [+m[0], +m[1], +m[2]];
    }

    function rgba(rgb, alpha) {
        return 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + alpha + ')';
    }

    function readPoints(canvas) {
        try {
            var parsed = JSON.parse(canvas.dataset.kpiPoints || '[]');
            if (Array.isArray(parsed) && parsed.length) return parsed;
        } catch (e) { /* fall through */ }
        return [4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14, 17];
    }

    /* ---- Bar chart: the highlighted-last-bar "sparkbar" look ------------- */
    function barConfig(points, rgb, aspect) {
        var last = points.length - 1;
        var lo = Math.min.apply(null, points);
        var hi = Math.max.apply(null, points);
        var pad = (hi - lo) * 0.35 || hi * 0.1 || 1;
        return {
            type: 'bar',
            data: {
                labels: points.map(function (_, i) { return i; }),
                datasets: [{
                    data: points,
                    backgroundColor: points.map(function (_, i) {
                        return i === last ? rgba(rgb, 0.95) : rgba(rgb, 0.42);
                    }),
                    borderWidth: 0,
                    borderRadius: 2,
                    categoryPercentage: 0.82,
                    barPercentage: 0.92
                }]
            },
            options: baseOptions(aspect, { min: lo - pad })
        };
    }

    /* ---- Line chart: the original lightweight sparkline shape ----------- */
    function lineConfig(points, rgb, aspect, isArea) {
        var last = points.length - 1;
        return {
            type: 'line',
            data: {
                labels: points.map(function (_, i) { return i; }),
                datasets: [{
                    data: points,
                    borderColor: rgba(rgb, 1),
                    backgroundColor: isArea ? rgba(rgb, 0.15) : 'transparent',
                    fill: isArea,
                    borderWidth: 2,
                    tension: 0.35,
                    pointRadius: points.map(function (_, i) {
                        return i === last ? 3 : 0;
                    }),
                    pointBackgroundColor: rgba(rgb, 1),
                    pointBorderColor: rgba(rgb, 1)
                }]
            },
            options: baseOptions(aspect, { grace: '15%' })
        };
    }

    function baseOptions(aspect, yScale) {
        yScale.display = false;
        return {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: aspect,
            animation: false,
            layout: { padding: 4 },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false, grid: { display: false } },
                y: yScale
            },
            elements: {
                line: { borderCapStyle: 'round', borderJoinStyle: 'round' }
            }
        };
    }

    function build(canvas) {
        var points = readPoints(canvas);
        var type = (canvas.dataset.kpiType || 'bar');
        var aspect = parseFloat(canvas.dataset.kpiAspect) || 8;
        var rgb = resolveRgb(canvas);
        var isArea = (canvas.dataset.kpiFill || 'area') === 'area';

        var config = type === 'line'
            ? lineConfig(points, rgb, aspect, isArea)
            : barConfig(points, rgb, aspect);

        charts.push({ chart: new Chart(canvas, config), canvas: canvas, type: type });
    }

    /* On theme change, re-resolve the inherited colour and repaint. */
    function recolor() {
        charts.forEach(function (entry) {
            var rgb = resolveRgb(entry.canvas);
            var ds = entry.chart.data.datasets[0];
            if (entry.type === 'line') {
                var isArea = ds.fill === true;
                ds.borderColor = rgba(rgb, 1);
                ds.backgroundColor = isArea ? rgba(rgb, 0.15) : 'transparent';
                ds.pointBackgroundColor = rgba(rgb, 1);
                ds.pointBorderColor = rgba(rgb, 1);
            } else {
                var last = ds.data.length - 1;
                ds.backgroundColor = ds.data.map(function (_, i) {
                    return i === last ? rgba(rgb, 0.95) : rgba(rgb, 0.42);
                });
            }
            entry.chart.update();
        });
    }

    function init() {
        if (typeof Chart === 'undefined') return;
        var canvases = document.querySelectorAll('canvas[data-kpi-chart]');
        if (!canvases.length) return;
        canvases.forEach(build);
        window.addEventListener('pa:theme-change', recolor);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
