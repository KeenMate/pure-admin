/**
 * Pure Admin Split Button
 * Dropdown positioning via Floating UI
 * Menus are moved to document.body to avoid overflow clipping
 */

(function() {
    'use strict';

    const { computePosition, flip, shift, offset, autoUpdate } = window.FloatingUIDOM;

    // Track active menu, its container, and cleanup
    let activeMenu = null;
    let activeContainer = null;
    let activeCleanup = null;

    /**
     * Toggle a split button menu open/closed
     * @param {Event} event - Click event from the toggle button
     */
    function toggleSplitMenu(event) {
        event.stopPropagation();

        const splitContainer = event.currentTarget.closest('.pa-btn-split');

        // If this container's menu is already open, close it
        if (activeContainer === splitContainer) {
            closeSplitMenu();
            return;
        }

        // Close any other open menu
        closeSplitMenu();

        const menu = splitContainer.querySelector('.pa-btn-split__menu');
        if (!menu) return;

        // Read placement from container (default: bottom-end)
        const placement = splitContainer.dataset.placement || 'bottom-end';

        // Mark container as open (for chevron rotation)
        splitContainer.classList.add('pa-btn-split--open');

        // Move menu to body for rendering outside overflow containers
        menu._originalParent = splitContainer;
        document.body.appendChild(menu);
        menu.classList.add('pa-btn-split__menu--open');
        activeMenu = menu;
        activeContainer = splitContainer;

        // Use autoUpdate so menu follows the button on scroll/resize
        activeCleanup = autoUpdate(splitContainer, menu, () => {
            positionMenu(splitContainer, menu, placement);
        });
    }

    /**
     * Position menu using Floating UI
     */
    async function positionMenu(reference, menu, placement) {
        const { x, y } = await computePosition(reference, menu, {
            placement: placement,
            strategy: 'fixed',
            middleware: [
                offset(4),
                flip(),
                shift({ padding: 8 })
            ]
        });

        Object.assign(menu.style, {
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            minWidth: `${reference.offsetWidth}px`
        });
    }

    /**
     * Close the active split menu and return it to its original parent
     */
    function closeSplitMenu() {
        if (!activeMenu) return;

        // Stop auto-updating position
        if (activeCleanup) {
            activeCleanup();
            activeCleanup = null;
        }

        activeMenu.classList.remove('pa-btn-split__menu--open');

        // Remove open state from container (chevron rotation)
        if (activeContainer) {
            activeContainer.classList.remove('pa-btn-split--open');
        }

        // Move menu back to its original parent
        if (activeMenu._originalParent) {
            activeMenu._originalParent.appendChild(activeMenu);
            delete activeMenu._originalParent;
        }

        // Reset inline styles from Floating UI
        activeMenu.style.position = '';
        activeMenu.style.left = '';
        activeMenu.style.top = '';
        activeMenu.style.minWidth = '';

        activeMenu = null;
        activeContainer = null;
    }

    // Close menus when clicking outside the active menu or on a different split button
    document.addEventListener('click', function(event) {
        if (!activeMenu) return;
        if (activeMenu.contains(event.target)) return;
        if (activeContainer && activeContainer.contains(event.target)) return;
        closeSplitMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && activeMenu) {
            closeSplitMenu();
        }
    });

    // Expose globally
    window.toggleSplitMenu = toggleSplitMenu;
    window.closeSplitMenu = closeSplitMenu;
})();
