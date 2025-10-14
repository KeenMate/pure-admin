/**
 * Tooltips & Popovers with Floating UI
 *
 * Features:
 * - Tooltips: Auto-positioned hover tooltips using Floating UI
 * - Popovers: Click-triggered rich content popovers using Floating UI
 * - Smart collision detection and auto-flipping
 * - Multiple color variants and positions
 *
 * Dependencies: @floating-ui/dom
 */

(function() {
    'use strict';

    // Wait for Floating UI to load
    if (typeof window.FloatingUIDOM === 'undefined') {
        console.error('Floating UI is not loaded. Please include @floating-ui/dom.');
        return;
    }

    const { computePosition, flip, shift, offset, arrow } = window.FloatingUIDOM;

    // ====================================
    // TOOLTIP SYSTEM (Floating UI)
    // ====================================

    let tooltipEl = null;
    let currentTooltipTarget = null;

    /**
     * Create tooltip element (singleton)
     */
    function createTooltip() {
        if (tooltipEl) return;

        tooltipEl = document.createElement('div');
        tooltipEl.className = 'pa-tooltip-floating';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.top = '0';
        tooltipEl.style.left = '0';
        tooltipEl.style.visibility = 'hidden';
        tooltipEl.style.zIndex = '9000';
        document.body.appendChild(tooltipEl);
    }

    /**
     * Show tooltip with Floating UI positioning
     */
    async function showTooltip(element) {
        if (!tooltipEl) createTooltip();

        currentTooltipTarget = element;

        // Get tooltip text from data-tooltip attribute
        const text = element.dataset.tooltip || element.getAttribute('aria-label') || '';
        if (!text) return;

        // Determine placement from class
        let placement = 'top';
        if (element.classList.contains('pa-tooltip--bottom')) placement = 'bottom';
        else if (element.classList.contains('pa-tooltip--left')) placement = 'left';
        else if (element.classList.contains('pa-tooltip--right')) placement = 'right';

        // Copy variant classes to floating tooltip
        tooltipEl.className = 'pa-tooltip-floating';
        if (element.classList.contains('pa-tooltip--primary')) tooltipEl.classList.add('pa-tooltip--primary');
        if (element.classList.contains('pa-tooltip--success')) tooltipEl.classList.add('pa-tooltip--success');
        if (element.classList.contains('pa-tooltip--warning')) tooltipEl.classList.add('pa-tooltip--warning');
        if (element.classList.contains('pa-tooltip--danger')) tooltipEl.classList.add('pa-tooltip--danger');
        if (element.classList.contains('pa-tooltip--multiline')) tooltipEl.classList.add('pa-tooltip--multiline');

        // Set content and show
        tooltipEl.textContent = text;
        tooltipEl.style.visibility = 'visible';

        // Use Floating UI to position tooltip with collision detection
        try {
            const { x, y } = await computePosition(element, tooltipEl, {
                placement,
                middleware: [
                    offset(8),
                    flip(),
                    shift({ padding: 8 })
                ]
            });

            Object.assign(tooltipEl.style, {
                left: `${x}px`,
                top: `${y}px`
            });
        } catch (error) {
            console.error('Error positioning tooltip:', error);
        }
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        if (!tooltipEl) return;
        tooltipEl.style.visibility = 'hidden';
        currentTooltipTarget = null;
    }

    /**
     * Initialize all tooltips
     */
    function initTooltips() {
        createTooltip();

        document.querySelectorAll('[class*="pa-tooltip"]').forEach(element => {
            // Skip if already initialized
            if (element.dataset.tooltipInit) return;
            element.dataset.tooltipInit = 'true';

            // Store tooltip text in data attribute if it's in aria-label
            if (!element.dataset.tooltip && element.getAttribute('aria-label')) {
                element.dataset.tooltip = element.getAttribute('aria-label');
            }

            // Event listeners
            element.addEventListener('mouseenter', () => showTooltip(element));
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', () => showTooltip(element));
            element.addEventListener('blur', hideTooltip);
        });
    }

    // ====================================
    // POPOVER SYSTEM (Floating UI with autoUpdate)
    // ====================================

    const { autoUpdate } = window.FloatingUIDOM;

    /**
     * Initialize a single popover
     */
    function createPopover(popoverEl) {
        const trigger = popoverEl.querySelector('.pa-popover__trigger');
        const content = popoverEl.querySelector('.pa-popover__content');
        const closeBtn = popoverEl.querySelector('.pa-popover__close');

        if (!trigger || !content) return;

        const placement = popoverEl.dataset.placement || 'top';
        let cleanup = null;

        // Show popover
        function show() {
            content.setAttribute('data-show', '');

            // Update position and setup auto-update
            cleanup = autoUpdate(trigger, content, () => {
                computePosition(trigger, content, {
                    placement: placement,
                    middleware: [
                        offset(8),
                        flip(),
                        shift({ padding: 8 })
                    ]
                }).then(({ x, y }) => {
                    Object.assign(content.style, {
                        left: `${x}px`,
                        top: `${y}px`
                    });
                });
            });
        }

        // Hide popover
        function hide() {
            content.removeAttribute('data-show');
            if (cleanup) {
                cleanup();
                cleanup = null;
            }
        }

        // Toggle popover
        function toggle() {
            if (content.hasAttribute('data-show')) {
                hide();
            } else {
                // Close other popovers first
                document.querySelectorAll('.pa-popover__content[data-show]').forEach(other => {
                    if (other !== content) {
                        other.removeAttribute('data-show');
                    }
                });
                show();
            }
        }

        // Event listeners
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                hide();
            });
        }

        // Prevent closing when clicking inside content
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!popoverEl.contains(e.target) && content.hasAttribute('data-show')) {
                hide();
            }
        });
    }

    /**
     * Initialize all popovers
     */
    function initPopovers() {
        document.querySelectorAll('.pa-popover').forEach(popoverEl => {
            if (!popoverEl.dataset.initialized) {
                popoverEl.dataset.initialized = 'true';
                createPopover(popoverEl);
            }
        });
    }

    // ====================================
    // INITIALIZATION
    // ====================================

    /**
     * Initialize everything
     */
    function init() {
        initTooltips();
        initPopovers();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Reinitialize when dynamic content is loaded
    window.addEventListener('content-loaded', init);

    // Expose public API for manual initialization
    window.PureAdminTooltips = {
        init,
        initTooltips,
        initPopovers,
        showTooltip,
        hideTooltip
    };

})();
