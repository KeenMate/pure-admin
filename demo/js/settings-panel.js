/**
 * Pure Admin Settings Panel
 * Global settings management for theme, layout, sidebar, fonts, and display options
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Settings Panel Elements
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsToggle = document.getElementById('settingsToggle');

        // Check if elements exist
        if (!settingsPanel || !settingsToggle) {
            console.error('Settings panel elements not found');
            return;
        }

        const themeSelector = document.getElementById('themeSelector');
        const themeModeSection = document.getElementById('themeModeSection');
        const themeModeSelector = document.getElementById('themeModeSelector');
        const fontSizeSelector = document.getElementById('fontSizeSelector');
        const fontFamilySelector = document.getElementById('fontFamilySelector');
        const sidebarCollapsed = document.getElementById('sidebarCollapsed');
        const sidebarBehaviorSelector = document.getElementById('sidebarBehaviorSelector');
        const sidebarModeSelector = document.getElementById('sidebarModeSelector');
        const compactMode = document.getElementById('compactMode');
        const containerWidthSelector = document.getElementById('containerWidthSelector');
        const resetSettings = document.getElementById('resetSettings');
        const body = document.body;

        // Themes that support light/dark mode switching
        const multiModeThemes = ['audi', 'express'];

        // Update mode section visibility based on current theme
        const updateModeSectionVisibility = (theme) => {
            if (multiModeThemes.includes(theme)) {
                themeModeSection.style.display = '';
            } else {
                themeModeSection.style.display = 'none';
            }
        };

        // Apply theme mode (light/dark) without page reload
        const applyThemeMode = (mode) => {
            body.classList.remove('pa-mode-light', 'pa-mode-dark');
            if (mode === 'light') {
                body.classList.add('pa-mode-light');
            } else {
                body.classList.add('pa-mode-dark');
            }
            localStorage.setItem('theme-mode', mode);
        };

        // Load saved settings
        const loadSettings = () => {
            // Theme - use server-provided currentTheme from global config
            const currentTheme = window.PURE_ADMIN_CONFIG?.currentTheme || 'audi';
            themeSelector.value = currentTheme;

            // Show/hide mode section based on theme
            updateModeSectionVisibility(currentTheme);

            // Theme mode (light/dark) - only for multi-mode themes
            if (multiModeThemes.includes(currentTheme)) {
                const savedMode = localStorage.getItem('theme-mode') || 'dark';
                themeModeSelector.value = savedMode;
                applyThemeMode(savedMode);
            }

            // Font size
            const savedFontSize = localStorage.getItem('font-size') || 'default';
            fontSizeSelector.value = savedFontSize;
            document.documentElement.classList.remove('font-size-small', 'font-size-default', 'font-size-large', 'font-size-xlarge');
            if (savedFontSize !== 'default') {
                document.documentElement.classList.add(`font-size-${savedFontSize}`);
            }

            // Font family
            const savedFontFamily = localStorage.getItem('font-family') || 'default';
            fontFamilySelector.value = savedFontFamily;
            body.classList.remove('font-family-serif', 'font-family-mono');
            if (savedFontFamily !== 'default') {
                body.classList.add(`font-family-${savedFontFamily}`);
            }

            // Sidebar collapsed
            const isSidebarCollapsed = localStorage.getItem('sidebar-hidden') === 'true';
            sidebarCollapsed.checked = isSidebarCollapsed;

            // Sidebar behavior
            const sidebarBehavior = localStorage.getItem('sidebar-behavior') || 'hide';
            sidebarBehaviorSelector.value = sidebarBehavior;
            const sidebar = document.querySelector('.pa-layout__sidebar');
            const burgerMenu = document.querySelector('.burger-menu');
            if (sidebar) {
                sidebar.classList.remove('pa-layout__sidebar--icon-collapse');
                if (sidebarBehavior === 'icon-collapse') {
                    sidebar.classList.add('pa-layout__sidebar--icon-collapse');
                    // In icon-collapse mode, check if expanded or collapsed
                    const isExpanded = !body.classList.contains('sidebar-hidden');
                    if (burgerMenu) {
                        if (isExpanded) {
                            burgerMenu.classList.add('active'); // Expanded, show X
                        } else {
                            burgerMenu.classList.remove('active'); // Collapsed to icons, show hamburger
                        }
                    }
                } else {
                    // In hide mode, burger active = sidebar visible
                    if (burgerMenu) {
                        if (body.classList.contains('sidebar-hidden')) {
                            burgerMenu.classList.remove('active'); // Hidden, show hamburger
                        } else {
                            burgerMenu.classList.add('active'); // Visible, show X
                        }
                    }
                }
            }

            // Compact mode
            const isCompactMode = localStorage.getItem('compact-mode') === 'true';
            compactMode.checked = isCompactMode;
            if (isCompactMode) {
                body.classList.add('compact-mode');
            }

            // Container width - read from body class
            const containerWidthClasses = ['pa-container-sm', 'pa-container-md', 'pa-container-lg', 'pa-container-xl', 'pa-container-2xl'];
            let currentContainerWidth = 'fluid';
            for (const cls of containerWidthClasses) {
                if (body.classList.contains(cls)) {
                    currentContainerWidth = cls.replace('pa-container-', '');
                    break;
                }
            }
            containerWidthSelector.value = currentContainerWidth;

            // Sidebar mode - check if body has sticky class
            const currentSidebarMode = body.classList.contains('pa-layout--sticky') ? 'sticky' : '';
            sidebarModeSelector.value = currentSidebarMode;
        };

        // Toggle panel
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('pa-settings-panel--open');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('pa-settings-panel--open')) {
                settingsPanel.classList.remove('pa-settings-panel--open');
            }
        });

        // Theme change
        themeSelector.addEventListener('change', (e) => {
            const theme = e.target.value;
            // Update mode section visibility before switching
            updateModeSectionVisibility(theme);
            switchTheme(theme);
        });

        // Theme mode change (light/dark) - instant switch, no reload
        themeModeSelector.addEventListener('change', (e) => {
            const mode = e.target.value;
            applyThemeMode(mode);
        });

        // Font size change
        fontSizeSelector.addEventListener('change', (e) => {
            const size = e.target.value;
            document.documentElement.classList.remove('font-size-small', 'font-size-default', 'font-size-large', 'font-size-xlarge');
            if (size !== 'default') {
                document.documentElement.classList.add(`font-size-${size}`);
            }
            localStorage.setItem('font-size', size);
        });

        // Font family change
        fontFamilySelector.addEventListener('change', (e) => {
            const family = e.target.value;
            body.classList.remove('font-family-serif', 'font-family-mono');
            if (family !== 'default') {
                body.classList.add(`font-family-${family}`);
            }
            localStorage.setItem('font-family', family);
        });

        // Sidebar toggle
        sidebarCollapsed.addEventListener('change', (e) => {
            toggleSidebar();
        });

        // Compact mode toggle
        compactMode.addEventListener('change', (e) => {
            if (e.target.checked) {
                body.classList.add('compact-mode');
                localStorage.setItem('compact-mode', 'true');
            } else {
                body.classList.remove('compact-mode');
                localStorage.setItem('compact-mode', 'false');
            }
        });

        // Container width change - reload page with query param to set cookie
        containerWidthSelector.addEventListener('change', (e) => {
            const width = e.target.value;
            const url = new URL(window.location);
            url.searchParams.set('containerWidth', width);
            window.location.href = url.toString();
        });

        // Sidebar mode change
        sidebarModeSelector.addEventListener('change', (e) => {
            const mode = e.target.value;
            switchSidebarMode(mode);
        });

        // Sidebar behavior change
        sidebarBehaviorSelector.addEventListener('change', (e) => {
            const behavior = e.target.value;
            const sidebar = document.querySelector('.pa-layout__sidebar');
            const burgerMenu = document.querySelector('.burger-menu');

            if (sidebar) {
                sidebar.classList.remove('pa-layout__sidebar--icon-collapse');
                document.body.classList.remove('sidebar-hidden');

                if (behavior === 'icon-collapse') {
                    // Show icon-only sidebar in collapsed state
                    sidebar.classList.add('pa-layout__sidebar--icon-collapse');
                    // Start in collapsed state (icon bar showing)
                    if (burgerMenu) burgerMenu.classList.remove('active'); // Not expanded, show hamburger
                    localStorage.setItem('sidebar-hidden', 'false'); // Not fully hidden, just in icon mode
                } else if (behavior === 'hide') {
                    // Hide sidebar completely
                    document.body.classList.add('sidebar-hidden');
                    if (burgerMenu) burgerMenu.classList.remove('active'); // Hidden, show hamburger to open
                    localStorage.setItem('sidebar-hidden', 'true');
                } else {
                    // Default behavior - show full sidebar
                    if (burgerMenu) burgerMenu.classList.add('active'); // Visible, show X to close
                    localStorage.setItem('sidebar-hidden', 'false');
                }

                localStorage.setItem('sidebar-behavior', behavior);
            }
        });

        // Reset settings
        resetSettings.addEventListener('click', () => {
            // Clear localStorage settings
            localStorage.removeItem('font-size');
            localStorage.removeItem('font-family');
            localStorage.removeItem('sidebar-hidden');
            localStorage.removeItem('sidebar-behavior');
            localStorage.removeItem('compact-mode');
            localStorage.removeItem('theme-mode');

            // Reset theme, container width, and sidebar mode to defaults
            const url = new URL(window.location);
            url.searchParams.set('theme', 'audi');
            url.searchParams.set('containerWidth', 'fluid');
            url.searchParams.set('sidebarMode', '');
            window.location.href = url.toString();
        });

        // Load settings on init
        loadSettings();
    });

    // Helper functions (need to be globally accessible for other scripts)
    window.switchTheme = function(theme) {
        // Redirect to current page with theme parameter
        const url = new URL(window.location);
        url.searchParams.set('theme', theme);
        window.location.href = url.toString();
    };

    window.switchSidebarMode = function(mode) {
        // Redirect to current page with sidebar mode parameter
        const url = new URL(window.location);
        url.searchParams.set('sidebarMode', mode);
        window.location.href = url.toString();
    };
})();
