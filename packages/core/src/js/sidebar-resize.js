/**
 * Pure Admin — Sidebar Resize
 *
 * Drag-to-resize the sidebar. Ships in core (next to navbar-collapse.js /
 * navbar-dropdown.js) so consumers don't have to vendor it out of the demo:
 * `--pa-local-sidebar-width` is documented in _sidebar.scss as "modified by JS
 * for resize", and the `.pa-sidebar-resize` handle + `--pa-local-sidebar-min-
 * width` / `--pa-local-sidebar-max-width` bounds are all core CSS — the driving
 * script belongs here too.
 *
 * The drag bounds and rem<->px conversion are READ FROM CSS, not hardcoded:
 *   --pa-local-sidebar-min-width  (default 18rem)  — smallest drag width
 *   --pa-local-sidebar-max-width  (default 50rem)  — largest drag width
 * and rem is converted using the actual root font-size (this framework uses a
 * 10px base, but a consumer/theme that changes it — or the min/max vars — stays
 * consistent with the drag limits automatically). Earlier versions baked in
 * 180/500/288 px and a `/10` rem factor, which silently drifted from these vars.
 *
 * Activate by putting `.pa-layout__sidebar--resizable` on the sidebar (the demo
 * settings panel toggles it). The `.pa-sidebar-resize` handle is created on the
 * fly; double-click it to reset to the stylesheet default.
 *
 * Public API (window.PureAdminSidebarResize): init, reset, setWidth, getWidth.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'sidebar-width'; // persisted in px
    var MOBILE_MAX = 768; // below this the sidebar is an overlay — resize is meaningless

    var sidebar = null;
    var resizeHandle = null;
    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    var bounds = { min: 0, max: 0 };
    var initialized = false;
    var rafId = null;

    // --- CSS-variable helpers ------------------------------------------------
    // Root font-size in px (this framework uses 10px; read it so a changed base
    // doesn't break the px<->rem conversion).
    function rootFontSize() {
        return parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
    }

    // Read a length CSS variable off :root and return it in px. Handles rem, px,
    // and bare numbers (treated as px); falls back to fallbackPx if unset.
    function readPxVar(name, fallbackPx) {
        var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        if (!raw) return fallbackPx;
        var n = parseFloat(raw);
        if (isNaN(n)) return fallbackPx;
        if (raw.indexOf('rem') !== -1) return n * rootFontSize();
        return n; // px or unitless
    }

    // Re-read the drag bounds from CSS (called at drag start, so a runtime theme
    // switch that changes the min/max is honoured without re-init).
    function refreshBounds() {
        bounds.min = readPxVar('--pa-local-sidebar-min-width', 180);
        bounds.max = readPxVar('--pa-local-sidebar-max-width', 500);
    }

    // --- init ----------------------------------------------------------------
    function init() {
        if (initialized && resizeHandle && resizeHandle.parentNode) return;

        sidebar = document.querySelector('.pa-layout__sidebar--resizable');
        if (!sidebar) return;

        var existingHandle = sidebar.querySelector('.pa-sidebar-resize');
        if (existingHandle) {
            resizeHandle = existingHandle;
            initialized = true;
            return;
        }

        resizeHandle = document.createElement('div');
        resizeHandle.className = 'pa-sidebar-resize';
        resizeHandle.setAttribute('title', 'Drag to resize sidebar');
        sidebar.appendChild(resizeHandle);

        loadSavedWidth();

        resizeHandle.addEventListener('mousedown', startResize);
        resizeHandle.addEventListener('touchstart', startResize, { passive: false });
        resizeHandle.addEventListener('dblclick', resetWidth); // reset to default

        initialized = true;
    }

    function loadSavedWidth() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        var width = parseInt(saved, 10);
        if (isNaN(width)) return;
        refreshBounds();
        if (width >= bounds.min && width <= bounds.max) setSidebarWidth(width);
    }

    // Write width (px) as rem on :root, using the real root font-size.
    function setSidebarWidth(width) {
        var rem = width / rootFontSize();
        document.documentElement.style.setProperty('--pa-local-sidebar-width', rem + 'rem');
    }

    function getCurrentWidth() {
        return sidebar ? sidebar.offsetWidth : readPxVar('--pa-local-sidebar-width', 288);
    }

    function startResize(e) {
        // Skip when the sidebar is collapsed or on mobile (overlay mode).
        if (document.body.classList.contains('sidebar-hidden') ||
            window.innerWidth <= MOBILE_MAX) {
            return;
        }

        e.preventDefault();
        isResizing = true;
        refreshBounds(); // pick up any theme-driven min/max change

        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startWidth = getCurrentWidth();

        resizeHandle.classList.add('pa-sidebar-resize--active');
        document.body.classList.add('pa-sidebar-resizing');

        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize);
    }

    // Throttled with requestAnimationFrame.
    function doResize(e) {
        if (!isResizing) return;
        e.preventDefault();

        var currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
            var diff = currentX - startX;
            var newWidth = Math.max(bounds.min, Math.min(bounds.max, startWidth + diff));
            setSidebarWidth(newWidth);
        });
    }

    function stopResize() {
        if (!isResizing) return;
        isResizing = false;

        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        resizeHandle.classList.remove('pa-sidebar-resize--active');
        document.body.classList.remove('pa-sidebar-resizing');

        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', doResize);
        document.removeEventListener('touchend', stopResize);

        localStorage.setItem(STORAGE_KEY, getCurrentWidth().toString());
    }

    // Reset by dropping the inline override so the stylesheet default applies
    // (the base $sidebar-width, or the tablet cap in the 769–1024px band).
    function resetWidth() {
        document.documentElement.style.removeProperty('--pa-local-sidebar-width');
        localStorage.removeItem(STORAGE_KEY);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PureAdminSidebarResize = {
        init: init,
        reset: resetWidth,
        setWidth: setSidebarWidth,
        getWidth: getCurrentWidth
    };
})();
