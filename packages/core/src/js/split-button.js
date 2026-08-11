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

    // Shared menu-dismissal registry. Both split buttons AND the overflow
    // "more" menu (overflow.js) register their close fn here, so opening ANY
    // one menu closes every other open menu — no two dropdowns can hang open
    // over each other. Defined defensively so whichever module loads first
    // creates it. Each close fn is idempotent (closing a closed menu is a
    // no-op), so `closeOthers` can fire them all blindly.
    var pa = (window.pureAdmin = window.pureAdmin || {});
    const PaMenus = (pa.menus = pa.menus || {
        closers: [],
        register: function (fn) { this.closers.push(fn); return fn; },
        closeOthers: function (self) {
            this.closers.forEach(function (fn) {
                if (fn !== self) { try { fn(); } catch (e) { /* ignore */ } }
            });
            if (pa.events) pa.events.emit('menu:opened', { id: self && self.paMenuId });
        }
    });

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

        // Close any other open menu — split buttons and the overflow "more"
        // menu alike — so only this one is open.
        closeSplitMenu();
        PaMenus.closeOthers(closeSplitMenu);

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
                offset(6),
                flip(),
                shift({ padding: 8 })
            ]
        });

        Object.assign(menu.style, {
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            right: 'auto',
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

    // Close menus when clicking outside the active menu / on a different split
    // button, OR when picking a menu item.
    document.addEventListener('click', function(event) {
        if (!activeMenu) return;
        // Clicked a menu item → dismiss like any dropdown. The item's own click
        // handler has already run (this fires as the event bubbles up to
        // document), so it's safe to close here.
        if (activeMenu.contains(event.target) && event.target.closest('.pa-btn-split__item')) {
            // Opt-out: an item (or an ancestor) marked [data-pa-keep-open] keeps
            // the menu open — e.g. it opens a popconfirm/sub-panel anchored to the
            // item and must stay visible. Lets framework wrappers (svelte-pure-admin)
            // keep a normal delegated onclick instead of a native listener, since
            // their stopPropagation can't reach this document-level handler.
            if (event.target.closest('[data-pa-keep-open]')) return;
            closeSplitMenu();
            return;
        }
        // Clicked dead space inside the open menu (padding, etc.) → keep it open.
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

    // Register with the shared dismissal registry so the overflow menu (and
    // any future menu system) can close split menus when it opens.
    PaMenus.register(closeSplitMenu);

    // Expose globally
    window.toggleSplitMenu = toggleSplitMenu;
    window.closeSplitMenu = closeSplitMenu;

    // Shared anchored-menu positioner. `overflow.js` reuses this so the
    // overflow "more" menu opens with the EXACT same offset / flip / shift /
    // min-width behaviour as a split-button dropdown, instead of maintaining a
    // parallel positioner that drifts a few pixels off. One menu-positioning
    // logic for both components.
    (pa.components = pa.components || {}).splitMenu = { position: positionMenu };
})();
