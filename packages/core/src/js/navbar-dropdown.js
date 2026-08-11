/**
 * Pure Admin — Navbar Dropdown (touch support for hover dropdowns)
 *
 * The navbar dropdowns (`.pa-header__nav-item--has-dropdown`) open on
 * `:hover` — which never fires on touch. When the dropdown parent is ALSO a
 * real link (e.g. Components → /components/overview), a tap just follows the
 * href and the submenu can never be seen. This module fixes that on touch
 * devices with the "first tap opens, second tap navigates" model:
 *
 *   - 1st tap on the parent's own link  → open its submenu (navigation
 *                                          suppressed), closing any sibling.
 *   - 2nd tap on the SAME (now-open)     → follow the link normally.
 *     parent
 *   - A parent whose href is "#"/empty   → pure toggle (never navigates); the
 *     (a bare toggler, e.g. "More ›")      2nd tap closes it.
 *   - Tap outside / Escape               → close all open.
 *
 * It only engages on `(hover: none)` devices — desktop / hover-capable input
 * keeps the plain CSS hover-reveal and normal link navigation, untouched.
 * Nested parents work too (the tapped item and its ancestors stay open).
 *
 * Deliberately skipped:
 *   - `.pa-header__more-menu` — the collapse "More" panel flattens submenus to
 *     always-visible inline links (navbar-collapse.js + _navbar-elements.scss),
 *     so there's nothing to toggle there.
 *   - `.pa-header__nav-item--more` — the collapse "More" trigger owns its own
 *     click handling.
 *
 * Pairs with the CSS in `_navbar-elements.scss`, where the hover-reveal is
 * gated behind `@media (hover: hover)` and an `.is-open` class reveal (toggled
 * here) drives the open state on touch.
 *
 * No configuration; auto-inits. Public API (pureAdmin.components.navDropdown):
 *   closeAll()      — close every open navbar dropdown
 */
(function () {
    'use strict';

    var OPEN = 'is-open';
    var PARENT = '.pa-header__nav-item--has-dropdown';

    // Only take over on devices without hover — evaluated per-interaction so a
    // hybrid device (touch + mouse) that reports hover keeps native navigation.
    function noHover() {
        return !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
    }

    // The parent li's OWN dropdown (direct child), not a descendant submenu.
    function directSubmenu(li) {
        for (var c = li.firstElementChild; c; c = c.nextElementSibling) {
            if (c.classList && c.classList.contains('pa-header__dropdown')) return c;
        }
        return null;
    }

    // The parent li's OWN toggle link (direct child <a>).
    function directLink(li) {
        for (var c = li.firstElementChild; c; c = c.nextElementSibling) {
            if (c.tagName && c.tagName.toLowerCase() === 'a') return c;
        }
        return null;
    }

    function setExpanded(li, on) {
        var a = directLink(li);
        if (a) a.setAttribute('aria-expanded', on ? 'true' : 'false');
    }

    function openItem(li) {
        // Close everything that isn't `li` or one of its ancestors, so opening a
        // nested submenu keeps its parents open but folds away sibling branches.
        var open = document.querySelectorAll(PARENT + '.' + OPEN);
        for (var i = 0; i < open.length; i++) {
            if (open[i] === li || open[i].contains(li)) continue;
            open[i].classList.remove(OPEN);
            setExpanded(open[i], false);
        }
        li.classList.add(OPEN);
        setExpanded(li, true);
    }

    function closeItem(li) {
        li.classList.remove(OPEN);
        setExpanded(li, false);
    }

    function closeAll() {
        var open = document.querySelectorAll(PARENT + '.' + OPEN);
        for (var i = 0; i < open.length; i++) closeItem(open[i]);
    }

    function onClick(e) {
        var link = e.target.closest ? e.target.closest('a') : null;

        // A tap that isn't on a dropdown parent's own link: if it's fully
        // outside any dropdown, close everything; otherwise (a submenu child
        // link, or non-link chrome inside a dropdown) leave it to navigate.
        if (!link || link.parentNode == null) {
            if (!e.target.closest || !e.target.closest(PARENT)) closeAll();
            return;
        }

        var li = link.parentNode;
        var isToggle = li.classList &&
            li.classList.contains('pa-header__nav-item--has-dropdown') &&
            directLink(li) === link &&        // the parent's OWN link, not a child
            !link.closest('.pa-header__more-menu') && // not the flattened panel
            !li.classList.contains('pa-header__nav-item--more'); // not the More trigger

        if (!isToggle) {
            // Clicked a normal link (incl. submenu children): close open menus
            // unless the click is inside one that should stay while navigating.
            if (!link.closest(PARENT)) closeAll();
            return;
        }

        if (!directSubmenu(li)) return; // parent flagged has-dropdown but empty
        if (!noHover()) return;         // hover device → native nav + CSS hover

        var href = link.getAttribute('href') || '';
        var togglerOnly = href === '' || href === '#' || href.charAt(href.length - 1) === '#';

        if (!li.classList.contains(OPEN)) {
            e.preventDefault();          // 1st tap → open, don't navigate
            openItem(li);
        } else if (togglerOnly) {
            e.preventDefault();          // bare toggler → 2nd tap closes
            closeItem(li);
        }
        // else: open + real href → fall through, browser follows the link.
    }

    function onKey(e) {
        if (e.key === 'Escape' || e.keyCode === 27) closeAll();
    }

    // A11y: advertise the popup + initial collapsed state on each parent's own
    // link (skipping the flattened panel and the collapse trigger).
    function init(scope) {
        var parents = (scope || document).querySelectorAll(PARENT);
        for (var i = 0; i < parents.length; i++) {
            var li = parents[i];
            if (li.closest('.pa-header__more-menu')) continue;
            if (li.classList.contains('pa-header__nav-item--more')) continue;
            var a = directLink(li);
            if (a && directSubmenu(li)) {
                a.setAttribute('aria-haspopup', 'true');
                if (!a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded', 'false');
            }
        }
    }

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);

    var pa = (window.pureAdmin = window.pureAdmin || {});
    (pa.components = pa.components || {}).navDropdown = { closeAll: closeAll, init: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
        init();
    }
})();
