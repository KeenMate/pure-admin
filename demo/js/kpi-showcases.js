/* KPI showcases — shared JS for all 7 pa-kpi-* designs.
 *
 * Three things this file owns:
 *   1. Cursor-anchored hover detail popovers (Floating UI virtual element).
 *      Any element with class .pa-kpi-detail is treated as a popover; its
 *      DOM parent at init time is the host that fires mouseenter/move/leave.
 *      The popover itself is moved to <body> so ancestor overflow:hidden
 *      doesn't clip it.
 *   2. SVG <circle> end-of-line marker → CSS <span> conversion. The KPI
 *      sparklines use preserveAspectRatio="none" so the line stretches to
 *      fill the cell width — but the same non-uniform scaling turns an
 *      SVG <circle> into an oval. Render the dot as a CSS-pixel-sized
 *      span instead so it stays circular regardless of chart aspect ratio.
 *   3. Terminal-grid view-mode toggle (VALUE / Δ% / TREND segmented
 *      button group). Each .pa-kpi-terminal acts independently.
 *
 * No-op when the page contains no pa-kpi-* elements, so it's safe to load
 * globally from layout.mustache (same pattern as tooltips-popovers.js).
 */
(function () {
    'use strict';

    function init() {
        initPopovers();
        initSparklineDots();
        initTerminalViewToggle();
    }

    /* ---- Cursor-anchored hover detail popovers --------------------------- */
    function initPopovers() {
        if (!window.FloatingUIDOM) return;
        const { computePosition, flip, shift, offset } = window.FloatingUIDOM;

        document.querySelectorAll('.pa-kpi-detail').forEach(detail => {
            // Capture the host BEFORE moving the popover to <body>.
            const host = detail.parentElement;
            if (!host) return;
            document.body.appendChild(detail);

            let cursorX = 0, cursorY = 0;
            const virtualEl = {
                getBoundingClientRect() {
                    return {
                        width: 0, height: 0,
                        x: cursorX, y: cursorY,
                        top: cursorY, left: cursorX,
                        right: cursorX, bottom: cursorY
                    };
                }
            };

            const reposition = () => {
                computePosition(virtualEl, detail, {
                    strategy: 'fixed',
                    placement: 'top-start',
                    middleware: [offset(14), flip(), shift({ padding: 8 })]
                }).then(({ x, y }) => {
                    detail.style.left = x + 'px';
                    detail.style.top = y + 'px';
                });
            };

            host.addEventListener('mouseenter', (e) => {
                cursorX = e.clientX;
                cursorY = e.clientY;
                detail.setAttribute('data-show', '');
                reposition();
            });
            host.addEventListener('mousemove', (e) => {
                cursorX = e.clientX;
                cursorY = e.clientY;
                reposition();
            });
            host.addEventListener('mouseleave', () => {
                detail.removeAttribute('data-show');
            });
        });
    }

    /* ---- SVG <circle> → CSS <span> dot conversion ------------------------ */
    function initSparklineDots() {
        // Selectors cover every KPI design that renders a sparkline:
        //   - terminal-grid:    SVG itself carries .pa-kpi-tile__spark
        //   - sparkline-list:   SVG nested inside .pa-kpi-spark-row__chart
        //   - hero-supporting:  SVG nested inside .pa-kpi-hero-main__chart
        //   - bento:            SVG nested inside .pa-kpi-bento-tile__chart
        const selectors = [
            '.pa-kpi-tile__spark',
            '.pa-kpi-spark-row__chart svg',
            '.pa-kpi-hero-main__chart svg',
            '.pa-kpi-bento-tile__chart svg'
        ].join(', ');

        document.querySelectorAll(selectors).forEach(svg => {
            const circle = svg.querySelector('circle');
            if (!circle) return;

            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const vb = svg.viewBox.baseVal;
            const xPct = (cx - vb.x) / vb.width * 100;
            const yPct = (cy - vb.y) / vb.height * 100;

            // The dot is positioned absolutely against the SVG's parent. If
            // that parent already provides a positioned anchor (e.g. the
            // .__chart wrapper that the design's CSS sets to relative),
            // append directly. Otherwise wrap the SVG in a .pa-kpi-spark-wrap
            // span so the dot has something to anchor against.
            let wrap = svg.parentElement;
            if (!wrap.classList.contains('pa-kpi-spark-wrap')) {
                const pos = getComputedStyle(wrap).position;
                if (pos === 'static' || pos === '') {
                    const newWrap = document.createElement('span');
                    newWrap.className = 'pa-kpi-spark-wrap';
                    wrap.insertBefore(newWrap, svg);
                    newWrap.appendChild(svg);
                    wrap = newWrap;
                }
            }

            const dot = document.createElement('span');
            dot.className = 'pa-kpi-spark-dot';
            dot.style.left = xPct + '%';
            dot.style.top = yPct + '%';
            wrap.appendChild(dot);

            circle.remove();
        });
    }

    /* ---- Terminal-grid view-mode toggle (VALUE / Δ% / TREND) ------------- */
    function initTerminalViewToggle() {
        document.querySelectorAll('.pa-kpi-terminal').forEach(terminal => {
            const buttons = terminal.querySelectorAll('.pa-kpi-terminal__viewbtn');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const view = btn.dataset.view;
                    terminal.setAttribute('data-view', view);
                    buttons.forEach(b => {
                        const active = b === btn;
                        b.classList.toggle('is-active', active);
                        b.setAttribute('aria-selected', active ? 'true' : 'false');
                    });
                });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
