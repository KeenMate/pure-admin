/**
 * Pure Admin Detail Panel
 * Demo JavaScript for inline split-view and overlay detail panels
 */

(function() {
    'use strict';

    // ========================================================================
    // Sample data
    // ========================================================================
    const users = [
        { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Administrator', department: 'Engineering', phone: '+1 (555) 123-4567', location: 'New York, NY', joined: '2022-03-15', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Editor', department: 'Marketing', phone: '+1 (555) 234-5678', location: 'San Francisco, CA', joined: '2022-06-01', status: 'Active' },
        { id: 3, name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'Viewer', department: 'Sales', phone: '+1 (555) 345-6789', location: 'Chicago, IL', joined: '2023-01-10', status: 'Active' },
        { id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', role: 'Editor', department: 'Design', phone: '+1 (555) 456-7890', location: 'Austin, TX', joined: '2023-04-22', status: 'Inactive' },
        { id: 5, name: 'Charlie Davis', email: 'charlie.davis@company.com', role: 'Administrator', department: 'Engineering', phone: '+1 (555) 567-8901', location: 'Seattle, WA', joined: '2021-11-30', status: 'Active' },
        { id: 6, name: 'Diana Evans', email: 'diana.evans@company.com', role: 'Viewer', department: 'HR', phone: '+1 (555) 678-9012', location: 'Boston, MA', joined: '2023-08-15', status: 'Active' },
        { id: 7, name: 'Edward Foster', email: 'edward.foster@company.com', role: 'Editor', department: 'Content', phone: '+1 (555) 789-0123', location: 'Denver, CO', joined: '2022-12-01', status: 'Active' },
        { id: 8, name: 'Fiona Garcia', email: 'fiona.garcia@company.com', role: 'Viewer', department: 'Support', phone: '+1 (555) 890-1234', location: 'Miami, FL', joined: '2023-06-20', status: 'Inactive' }
    ];

    // ========================================================================
    // Inline Split-View Panel
    // ========================================================================

    function openInlinePanel(id) {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const panel = document.getElementById('inlineDetailPanel');
        const body = document.getElementById('inlineDetailBody');
        const title = document.getElementById('inlineDetailTitle');

        if (!panel || !body) return;

        // Update content
        title.textContent = user.name;
        body.innerHTML = renderUserDetails(user);

        // Show panel
        panel.classList.add('pa-detail-view__panel--open');

        // Update row selection
        updateRowSelection('inlineTable', id);
    }

    function closeInlinePanel() {
        const panel = document.getElementById('inlineDetailPanel');
        if (!panel) return;

        panel.classList.remove('pa-detail-view__panel--open');

        // Clear row selection
        clearRowSelection('inlineTable');
    }

    // ========================================================================
    // Overlay Panel
    // ========================================================================

    function openOverlayPanel(id) {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const panel = document.getElementById('overlayDetailPanel');
        const body = document.getElementById('overlayDetailBody');
        const title = document.getElementById('overlayDetailTitle');

        if (!panel || !body) return;

        // Update content
        title.textContent = user.name;
        body.innerHTML = renderUserDetails(user);

        // Show panel
        panel.classList.add('pa-detail-panel--open');

        // Update row selection
        updateRowSelection('overlayTable', id);
    }

    function closeOverlayPanel() {
        const panel = document.getElementById('overlayDetailPanel');
        if (!panel) return;

        panel.classList.remove('pa-detail-panel--open');

        // Clear row selection
        clearRowSelection('overlayTable');
    }

    // ========================================================================
    // Card Overlay Panel
    // ========================================================================

    function openCardOverlayPanel(id) {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const panel = document.getElementById('cardOverlayPanel');
        const body = document.getElementById('cardOverlayBody');
        const title = document.getElementById('cardOverlayTitle');

        if (!panel || !body) return;

        const overlay = panel.closest('.pa-detail-view--overlay')
            .querySelector('.pa-detail-view__overlay');

        // Update content
        title.textContent = user.name;
        body.innerHTML = renderUserDetails(user);

        // Show panel and backdrop
        panel.classList.add('pa-detail-view__panel--open');
        if (overlay) overlay.classList.add('pa-detail-view__overlay--visible');

        // Update row selection
        updateRowSelection('cardOverlayTable', id);
    }

    function closeCardOverlayPanel() {
        const panel = document.getElementById('cardOverlayPanel');
        if (!panel) return;

        const overlay = panel.closest('.pa-detail-view--overlay')
            .querySelector('.pa-detail-view__overlay');

        panel.classList.remove('pa-detail-view__panel--open');
        if (overlay) overlay.classList.remove('pa-detail-view__overlay--visible');

        // Clear row selection
        clearRowSelection('cardOverlayTable');
    }

    // ========================================================================
    // Card Overlay — No Backdrop (simulated loading)
    // ========================================================================

    let noBackdropLoadTimer = null;

    function selectDetailRow(id) {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const panel = document.getElementById('noBackdropPanel');
        const body = document.getElementById('noBackdropBody');
        const title = document.getElementById('noBackdropTitle');

        if (!panel || !body) return;

        // Open panel if not already open
        panel.classList.add('pa-detail-view__panel--open');

        // Update row selection immediately
        updateRowSelection('noBackdropTable', id);

        // Show loader
        title.textContent = 'Loading\u2026';
        body.innerHTML =
            '<div class="pa-loader-center" style="padding: 4rem 0;">' +
                '<div class="pa-spinner"></div>' +
            '</div>';

        // Cancel any pending load
        if (noBackdropLoadTimer) clearTimeout(noBackdropLoadTimer);

        // Simulate server delay then render
        noBackdropLoadTimer = setTimeout(function() {
            title.textContent = user.name;
            body.innerHTML = renderUserDetails(user);
            noBackdropLoadTimer = null;
        }, 600);
    }

    function closeDetailRow() {
        var panel = document.getElementById('noBackdropPanel');
        if (!panel) return;

        if (noBackdropLoadTimer) {
            clearTimeout(noBackdropLoadTimer);
            noBackdropLoadTimer = null;
        }

        panel.classList.remove('pa-detail-view__panel--open');
        clearRowSelection('noBackdropTable');
    }

    // ========================================================================
    // Header Actions (no footer)
    // ========================================================================

    let headerActionsLoadTimer = null;

    function selectHeaderActionsRow(id) {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const panel = document.getElementById('headerActionsPanel');
        const body = document.getElementById('headerActionsBody');
        const title = document.getElementById('headerActionsTitle');

        if (!panel || !body) return;

        panel.classList.add('pa-detail-view__panel--open');
        updateRowSelection('headerActionsTable', id);

        title.textContent = 'Loading\u2026';
        body.innerHTML =
            '<div class="pa-loader-center" style="padding: 4rem 0;">' +
                '<div class="pa-spinner"></div>' +
            '</div>';

        if (headerActionsLoadTimer) clearTimeout(headerActionsLoadTimer);

        headerActionsLoadTimer = setTimeout(function() {
            title.textContent = user.name;
            body.innerHTML = renderUserDetails(user);
            headerActionsLoadTimer = null;
        }, 600);
    }

    function closeHeaderActionsRow() {
        var panel = document.getElementById('headerActionsPanel');
        if (!panel) return;

        if (headerActionsLoadTimer) {
            clearTimeout(headerActionsLoadTimer);
            headerActionsLoadTimer = null;
        }

        panel.classList.remove('pa-detail-view__panel--open');
        clearRowSelection('headerActionsTable');
    }

    // ========================================================================
    // Tabbed Detail Panel
    // ========================================================================

    let tabbedLoadTimer = null;
    let tabbedCurrentUser = null;

    function selectTabbedRow(id) {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const panel = document.getElementById('tabbedPanel');
        const title = document.getElementById('tabbedTitle');

        if (!panel) return;

        tabbedCurrentUser = user;

        // Open panel
        panel.classList.add('pa-detail-view__panel--open');

        // Update row selection immediately
        updateRowSelection('tabbedTable', id);

        // Show loader in active tab panel, then render
        loadActiveTabContent(user);
    }

    function closeTabbedRow() {
        var panel = document.getElementById('tabbedPanel');
        if (!panel) return;

        if (tabbedLoadTimer) {
            clearTimeout(tabbedLoadTimer);
            tabbedLoadTimer = null;
        }

        tabbedCurrentUser = null;
        panel.classList.remove('pa-detail-view__panel--open');
        clearRowSelection('tabbedTable');
    }

    function loadActiveTabContent(user) {
        var title = document.getElementById('tabbedTitle');
        var activePanel = document.querySelector('[data-detail-panel].pa-tabs__panel--active');

        if (!activePanel) return;

        var tabId = activePanel.dataset.detailPanel;

        // Show loader
        title.textContent = 'Loading\u2026';
        activePanel.innerHTML =
            '<div class="pa-loader-center" style="padding: 4rem 0;">' +
                '<div class="pa-spinner"></div>' +
            '</div>';

        if (tabbedLoadTimer) clearTimeout(tabbedLoadTimer);

        tabbedLoadTimer = setTimeout(function() {
            title.textContent = user.name;
            activePanel.innerHTML = renderTabbedContent(tabId, user);
            tabbedLoadTimer = null;
        }, 600);
    }

    function renderTabbedContent(tabId, user) {
        if (tabId === 'details') {
            return renderUserDetails(user);
        }

        if (tabId === 'activity') {
            return '<div class="pa-list">' +
                '<div class="pa-list__item">' +
                    '<div><strong>' + user.name + '</strong> logged in</div>' +
                    '<div class="text-secondary" style="font-size: 1.2rem;">2 minutes ago</div>' +
                '</div>' +
                '<div class="pa-list__item">' +
                    '<div><strong>' + user.name + '</strong> updated profile photo</div>' +
                    '<div class="text-secondary" style="font-size: 1.2rem;">1 hour ago</div>' +
                '</div>' +
                '<div class="pa-list__item">' +
                    '<div><strong>' + user.name + '</strong> changed role to <span class="pa-badge pa-badge--info">' + user.role + '</span></div>' +
                    '<div class="text-secondary" style="font-size: 1.2rem;">3 hours ago</div>' +
                '</div>' +
                '<div class="pa-list__item">' +
                    '<div><strong>' + user.name + '</strong> joined <strong>' + user.department + '</strong></div>' +
                    '<div class="text-secondary" style="font-size: 1.2rem;">' + user.joined + '</div>' +
                '</div>' +
            '</div>';
        }

        if (tabId === 'notes') {
            return '<div class="pa-list">' +
                '<div class="pa-list__item">' +
                    '<div class="text-secondary" style="font-size: 1.2rem; margin-bottom: 0.4rem;">Jan 15, 2024</div>' +
                    '<div>Completed onboarding process. All access granted.</div>' +
                '</div>' +
                '<div class="pa-list__item">' +
                    '<div class="text-secondary" style="font-size: 1.2rem; margin-bottom: 0.4rem;">Feb 2, 2024</div>' +
                    '<div>Requested additional permissions for ' + user.department + ' resources.</div>' +
                '</div>' +
                '<div class="pa-list__item">' +
                    '<div class="text-secondary" style="font-size: 1.2rem; margin-bottom: 0.4rem;">Mar 10, 2024</div>' +
                    '<div>Performance review scheduled with manager.</div>' +
                '</div>' +
            '</div>';
        }

        return '';
    }

    // Tab switching for detail panel tabs
    function initDetailTabs() {
        document.querySelectorAll('[data-detail-tab]').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var tabId = tab.dataset.detailTab;

                // Update active tab button
                document.querySelectorAll('[data-detail-tab]').forEach(function(t) {
                    t.classList.toggle('pa-tabs__item--active', t.dataset.detailTab === tabId);
                });

                // Update active tab panel
                document.querySelectorAll('[data-detail-panel]').forEach(function(p) {
                    p.classList.toggle('pa-tabs__panel--active', p.dataset.detailPanel === tabId);
                });

                // Reload content for the newly active tab if a user is selected
                if (tabbedCurrentUser) {
                    loadActiveTabContent(tabbedCurrentUser);
                }
            });
        });
    }

    // ========================================================================
    // Shared Helpers
    // ========================================================================

    function renderUserDetails(user) {
        const statusClass = user.status === 'Active' ? 'pa-badge--success' : 'pa-badge--secondary';
        return `
            <div class="pa-row gap-sm" style="margin-bottom: 1.6rem;">
                <div class="pa-col-100">
                    <div style="display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.6rem;">
                        <div style="width: 5.6rem; height: 5.6rem; border-radius: 50%; background: var(--pa-accent-light); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; color: var(--pa-accent); flex-shrink: 0;">
                            ${user.name.charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight: 600; font-size: 1.6rem; color: var(--pa-text-color-1);">${user.name}</div>
                            <div style="color: var(--pa-text-color-2); font-size: 1.3rem;">${user.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            <table class="pa-table pa-table--sm pa-table--borderless" style="margin-bottom: 0;">
                <tbody>
                    <tr>
                        <td style="width: 40%; color: var(--pa-text-color-2); font-weight: 500;">Role</td>
                        <td>${user.role}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--pa-text-color-2); font-weight: 500;">Department</td>
                        <td>${user.department}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--pa-text-color-2); font-weight: 500;">Phone</td>
                        <td>${user.phone}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--pa-text-color-2); font-weight: 500;">Location</td>
                        <td>${user.location}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--pa-text-color-2); font-weight: 500;">Joined</td>
                        <td>${user.joined}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--pa-text-color-2); font-weight: 500;">Status</td>
                        <td><span class="pa-badge ${statusClass}">${user.status}</span></td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    function updateRowSelection(tableId, activeId) {
        const table = document.getElementById(tableId);
        if (!table) return;

        table.querySelectorAll('tbody tr').forEach(row => {
            const rowId = parseInt(row.dataset.id, 10);
            row.classList.toggle('is-selected', rowId === activeId);
        });
    }

    function clearRowSelection(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;

        table.querySelectorAll('tbody tr.is-selected').forEach(row => {
            row.classList.remove('is-selected');
        });
    }

    // ========================================================================
    // Keyboard: Escape to close
    // ========================================================================

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close overlay panel first (higher priority)
            const overlayPanel = document.getElementById('overlayDetailPanel');
            if (overlayPanel && overlayPanel.classList.contains('pa-detail-panel--open')) {
                closeOverlayPanel();
                return;
            }

            // Then close card overlay panel
            const cardOverlayPanel = document.getElementById('cardOverlayPanel');
            if (cardOverlayPanel && cardOverlayPanel.classList.contains('pa-detail-view__panel--open')) {
                closeCardOverlayPanel();
                return;
            }

            // Then close no-backdrop panel
            const noBackdropPanel = document.getElementById('noBackdropPanel');
            if (noBackdropPanel && noBackdropPanel.classList.contains('pa-detail-view__panel--open')) {
                closeDetailRow();
                return;
            }

            // Then close tabbed panel
            const tabbedPanel = document.getElementById('tabbedPanel');
            if (tabbedPanel && tabbedPanel.classList.contains('pa-detail-view__panel--open')) {
                closeTabbedRow();
                return;
            }

            // Then close header actions panel
            const headerActionsPanel = document.getElementById('headerActionsPanel');
            if (headerActionsPanel && headerActionsPanel.classList.contains('pa-detail-view__panel--open')) {
                closeHeaderActionsRow();
                return;
            }

            // Then close inline panel
            const inlinePanel = document.getElementById('inlineDetailPanel');
            if (inlinePanel && inlinePanel.classList.contains('pa-detail-view__panel--open')) {
                closeInlinePanel();
            }
        }
    });

    // ========================================================================
    // Resize Handle (reuses sidebar resize pattern)
    // ========================================================================

    const STORAGE_KEY_INLINE = 'detail-panel-inline-width';
    const STORAGE_KEY_OVERLAY = 'detail-panel-overlay-width';
    const MIN_WIDTH = 280;  // 28rem in pixels (10px base)
    const MAX_WIDTH = 640;  // 64rem in pixels

    let activeResizeHandle = null;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let resizeTarget = null;
    let rafId = null;

    function initResizeHandles() {
        document.querySelectorAll('.pa-detail-panel-resize').forEach(handle => {
            handle.addEventListener('mousedown', startResize);
            handle.addEventListener('touchstart', startResize, { passive: false });
            handle.addEventListener('dblclick', resetPanelWidth);
        });
    }

    function startResize(e) {
        e.preventDefault();
        isResizing = true;
        activeResizeHandle = e.target;

        // Determine which panel we're resizing
        const content = activeResizeHandle.closest('.pa-detail-panel__content');
        resizeTarget = content;

        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
        } else {
            startX = e.clientX;
        }
        startWidth = content.offsetWidth;

        // Add active states
        activeResizeHandle.classList.add('pa-detail-panel-resize--active');
        document.body.classList.add('pa-detail-panel-resizing');

        // Bind events
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize);
    }

    function doResize(e) {
        if (!isResizing) return;
        e.preventDefault();

        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;

        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            // Panel is on the right, so dragging left increases width
            const diff = startX - currentX;
            const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + diff));
            const remWidth = newWidth / 10;
            document.documentElement.style.setProperty('--pa-local-detail-panel-width', remWidth + 'rem');
        });
    }

    function stopResize() {
        if (!isResizing) return;
        isResizing = false;

        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        if (activeResizeHandle) {
            activeResizeHandle.classList.remove('pa-detail-panel-resize--active');
        }
        document.body.classList.remove('pa-detail-panel-resizing');

        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', doResize);
        document.removeEventListener('touchend', stopResize);

        // Save width
        if (resizeTarget) {
            const currentWidth = resizeTarget.offsetWidth;
            localStorage.setItem(STORAGE_KEY_INLINE, currentWidth.toString());
        }

        activeResizeHandle = null;
        resizeTarget = null;
    }

    function resetPanelWidth() {
        document.documentElement.style.setProperty('--pa-local-detail-panel-width', '40rem');
        localStorage.removeItem(STORAGE_KEY_INLINE);
        localStorage.removeItem(STORAGE_KEY_OVERLAY);
    }

    // ========================================================================
    // Load saved width on init
    // ========================================================================

    function loadSavedWidth() {
        const saved = localStorage.getItem(STORAGE_KEY_INLINE);
        if (saved) {
            const width = parseInt(saved, 10);
            if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
                const remWidth = width / 10;
                document.documentElement.style.setProperty('--pa-local-detail-panel-width', remWidth + 'rem');
            }
        }
    }

    // ========================================================================
    // Init
    // ========================================================================

    function init() {
        loadSavedWidth();
        initResizeHandles();
        initDetailTabs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.openInlinePanel = openInlinePanel;
    window.closeInlinePanel = closeInlinePanel;
    window.openCardOverlayPanel = openCardOverlayPanel;
    window.closeCardOverlayPanel = closeCardOverlayPanel;
    window.selectDetailRow = selectDetailRow;
    window.closeDetailRow = closeDetailRow;
    window.selectHeaderActionsRow = selectHeaderActionsRow;
    window.closeHeaderActionsRow = closeHeaderActionsRow;
    window.selectTabbedRow = selectTabbedRow;
    window.closeTabbedRow = closeTabbedRow;
    window.openOverlayPanel = openOverlayPanel;
    window.closeOverlayPanel = closeOverlayPanel;

})();
