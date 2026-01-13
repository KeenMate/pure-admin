/**
 * Pure Admin Sidebar Resize
 * Drag-to-resize sidebar functionality
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'sidebar-width';
    const MIN_WIDTH = 180;  // 18rem in pixels (10px base)
    const MAX_WIDTH = 500;  // 50rem in pixels
    const DEFAULT_WIDTH = 288; // 28.8rem in pixels

    let sidebar = null;
    let resizeHandle = null;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let initialized = false;
    let rafId = null;

    /**
     * Initialize sidebar resize functionality
     */
    function init() {
        // Prevent duplicate initialization
        if (initialized && resizeHandle && resizeHandle.parentNode) {
            return;
        }

        sidebar = document.querySelector('.pa-layout__sidebar--resizable');
        if (!sidebar) return;

        // Check if handle already exists
        const existingHandle = sidebar.querySelector('.pa-sidebar-resize');
        if (existingHandle) {
            resizeHandle = existingHandle;
            initialized = true;
            return;
        }

        // Create resize handle
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'pa-sidebar-resize';
        resizeHandle.setAttribute('title', 'Drag to resize sidebar');
        sidebar.appendChild(resizeHandle);

        // Load saved width
        loadSavedWidth();

        // Bind events
        resizeHandle.addEventListener('mousedown', startResize);
        resizeHandle.addEventListener('touchstart', startResize, { passive: false });

        // Double-click to reset to default
        resizeHandle.addEventListener('dblclick', resetWidth);

        initialized = true;
    }

    /**
     * Load saved width from localStorage
     */
    function loadSavedWidth() {
        const savedWidth = localStorage.getItem(STORAGE_KEY);
        if (savedWidth) {
            const width = parseInt(savedWidth, 10);
            if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
                setSidebarWidth(width);
            }
        }
    }

    /**
     * Set sidebar width via CSS variable
     */
    function setSidebarWidth(width) {
        // Convert pixels to rem (10px base)
        const remWidth = width / 10;
        document.documentElement.style.setProperty('--pa-sidebar-width', `${remWidth}rem`);
    }

    /**
     * Get current sidebar width in pixels
     */
    function getCurrentWidth() {
        if (!sidebar) return DEFAULT_WIDTH;
        return sidebar.offsetWidth;
    }

    /**
     * Start resize operation
     */
    function startResize(e) {
        // Don't resize if sidebar is collapsed
        if (document.body.classList.contains('sidebar-hidden') ||
            sidebar.classList.contains('pa-layout__sidebar--icon-collapse')) {
            return;
        }

        e.preventDefault();
        isResizing = true;

        // Get starting position
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
        } else {
            startX = e.clientX;
        }
        startWidth = getCurrentWidth();

        // Add active state
        resizeHandle.classList.add('pa-sidebar-resize--active');
        document.body.classList.add('pa-sidebar-resizing');

        // Bind move/end events
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize);
    }

    /**
     * Handle resize drag (throttled with requestAnimationFrame)
     */
    function doResize(e) {
        if (!isResizing) return;

        e.preventDefault();

        // Get current position (capture before RAF)
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;

        // Cancel pending frame
        if (rafId) cancelAnimationFrame(rafId);

        // Schedule update on next frame
        rafId = requestAnimationFrame(() => {
            const diff = currentX - startX;
            let newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + diff));
            setSidebarWidth(newWidth);
        });
    }

    /**
     * Stop resize operation
     */
    function stopResize() {
        if (!isResizing) return;

        isResizing = false;

        // Cancel any pending animation frame
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        // Remove active state
        resizeHandle.classList.remove('pa-sidebar-resize--active');
        document.body.classList.remove('pa-sidebar-resizing');

        // Unbind events
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', doResize);
        document.removeEventListener('touchend', stopResize);

        // Save width
        const currentWidth = getCurrentWidth();
        localStorage.setItem(STORAGE_KEY, currentWidth.toString());
    }

    /**
     * Reset sidebar width to default
     */
    function resetWidth() {
        setSidebarWidth(DEFAULT_WIDTH);
        localStorage.removeItem(STORAGE_KEY);
    }

    // Initialize when DOM is ready (if class already present)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.PureAdminSidebarResize = {
        init: init,
        reset: resetWidth,
        setWidth: setSidebarWidth,
        getWidth: getCurrentWidth
    };
})();
