/**
 * Pure Admin Settings Panel
 * Global settings management for theme, layout, sidebar, fonts, and display options
 * Now with dynamic theme manifest support
 */

(function() {
    'use strict';

    // Theme manifests cache
    let themeManifests = {};

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', async function() {
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
        const colorVariantSection = document.getElementById('colorVariantSection');
        const colorVariantSelector = document.getElementById('colorVariantSelector');
        const fontSizeSelector = document.getElementById('fontSizeSelector');
        const fontFamilySelector = document.getElementById('fontFamilySelector');
        const sidebarCollapsed = document.getElementById('sidebarCollapsed');
        const sidebarResizable = document.getElementById('sidebarResizable');
        const sidebarBehaviorSelector = document.getElementById('sidebarBehaviorSelector');
        const sidebarModeSelector = document.getElementById('sidebarModeSelector');
        const compactMode = document.getElementById('compactMode');
        const rtlMode = document.getElementById('rtlMode');
        const profileNoAvatar = document.getElementById('profileNoAvatar');
        const profileIconOnlyTabs = document.getElementById('profileIconOnlyTabs');
        const containerWidthSelector = document.getElementById('containerWidthSelector');
        const resetSettings = document.getElementById('resetSettings');
        const body = document.body;

        // Fetch theme manifests
        const fetchThemeManifests = async () => {
            try {
                const response = await fetch('/api/themes/manifests');
                if (response.ok) {
                    themeManifests = await response.json();
                    console.log('Theme manifests loaded:', Object.keys(themeManifests));
                    return true;
                }
            } catch (err) {
                console.error('Failed to fetch theme manifests:', err);
            }
            return false;
        };

        // Get current theme's manifest
        const getCurrentThemeManifest = () => {
            const currentTheme = window.PURE_ADMIN_CONFIG?.currentTheme || 'audi';
            return themeManifests[currentTheme] || null;
        };

        // Populate theme selector from manifests
        const populateThemeSelector = () => {
            if (!themeSelector) return;

            // Clear existing options
            themeSelector.innerHTML = '';

            // Sort themes alphabetically by name
            const sortedThemes = Object.entries(themeManifests)
                .sort((a, b) => a[1].name.localeCompare(b[1].name));

            for (const [themeId, manifest] of sortedThemes) {
                const option = document.createElement('option');
                option.value = themeId;
                option.textContent = manifest.name;
                themeSelector.appendChild(option);
            }
        };

        // Update mode section based on current theme's manifest
        const updateModeSectionFromManifest = (manifest) => {
            if (!themeModeSection || !themeModeSelector) return;

            if (!manifest || !manifest.modes || manifest.modes.supported.length <= 1) {
                themeModeSection.style.display = 'none';
                return;
            }

            // Show mode section
            themeModeSection.style.display = '';

            // Update mode selector options
            themeModeSelector.innerHTML = '';
            for (const mode of manifest.modes.supported) {
                const option = document.createElement('option');
                option.value = mode;
                option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
                themeModeSelector.appendChild(option);
            }
        };

        // Update color variant section based on current theme's manifest
        const updateColorVariantFromManifest = (manifest) => {
            if (!colorVariantSection || !colorVariantSelector) return;

            if (!manifest || !manifest.colorVariants || !manifest.colorVariants.supported) {
                colorVariantSection.style.display = 'none';
                // Clear color variant when not supported
                applyColorVariant('', manifest);
                return;
            }

            // Show color variant section
            colorVariantSection.style.display = '';

            // Update color variant selector options
            colorVariantSelector.innerHTML = '';
            for (const variant of manifest.colorVariants.supported) {
                const option = document.createElement('option');
                option.value = variant.id;
                option.textContent = variant.name;
                if (variant.description) {
                    option.title = variant.description;
                }
                colorVariantSelector.appendChild(option);
            }
        };

        // Apply theme mode (light/dark) without page reload
        const applyThemeMode = (mode, manifest) => {
            const cssClassPattern = manifest?.modes?.cssClass || 'pa-mode-{mode}';

            // Remove all mode classes
            body.classList.remove('pa-mode-light', 'pa-mode-dark');

            // Apply new mode class
            const modeClass = cssClassPattern.replace('{mode}', mode);
            body.classList.add(modeClass);

            // Set data-theme attribute for web components (web-grid, etc.)
            body.dataset.theme = mode;

            localStorage.setItem('theme-mode', mode);
        };

        // Apply color variant class
        const applyColorVariant = (variant, manifest) => {
            const cssClassPattern = manifest?.colorVariants?.cssClass || 'pa-color-{variant}';

            // Remove all color variant classes
            body.classList.remove('pa-color-blue', 'pa-color-green', 'pa-color-red');

            // Apply new variant class if not empty
            if (variant) {
                const variantClass = cssClassPattern.replace('{variant}', variant);
                body.classList.add(variantClass);
            }

            localStorage.setItem('color-variant', variant);
        };

        // Load saved settings
        const loadSettings = () => {
            // Theme - use server-provided currentTheme from global config
            const currentTheme = window.PURE_ADMIN_CONFIG?.currentTheme || 'audi';
            themeSelector.value = currentTheme;

            const manifest = getCurrentThemeManifest();

            // Update mode section based on manifest
            updateModeSectionFromManifest(manifest);

            // Update color variant section based on manifest
            updateColorVariantFromManifest(manifest);

            // Theme mode (light/dark) - only for themes with multiple modes
            if (manifest && manifest.modes && manifest.modes.supported.length > 1) {
                const savedMode = localStorage.getItem('theme-mode') || manifest.modes.default || 'dark';
                themeModeSelector.value = savedMode;
                applyThemeMode(savedMode, manifest);
            }

            // Color variant - only for themes that support it
            if (manifest && manifest.colorVariants && manifest.colorVariants.supported) {
                const savedVariant = localStorage.getItem('color-variant') || manifest.colorVariants.default || '';
                colorVariantSelector.value = savedVariant;
                applyColorVariant(savedVariant, manifest);
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
            const isMobile = window.innerWidth <= 768;
            if (sidebar) {
                sidebar.classList.remove('pa-layout__sidebar--icon-collapse');
                if (isMobile) {
                    // Mobile: sidebar is always hidden initially, burger shows hamburger
                    if (burgerMenu) {
                        burgerMenu.classList.remove('active');
                    }
                } else if (sidebarBehavior === 'icon-collapse') {
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

            // Sidebar resizable
            const isSidebarResizable = localStorage.getItem('sidebar-resizable') === 'true';
            sidebarResizable.checked = isSidebarResizable;
            if (isSidebarResizable && sidebar) {
                sidebar.classList.add('pa-layout__sidebar--resizable');
                // Trigger resize init if the module is loaded
                if (window.PureAdminSidebarResize && window.PureAdminSidebarResize.init) {
                    window.PureAdminSidebarResize.init();
                }
            }

            // Compact mode
            const isCompactMode = localStorage.getItem('compact-mode') === 'true';
            compactMode.checked = isCompactMode;
            if (isCompactMode) {
                body.classList.add('compact-mode');
            }

            // RTL mode
            const isRtlMode = localStorage.getItem('rtl-mode') === 'true';
            rtlMode.checked = isRtlMode;
            if (isRtlMode) {
                document.documentElement.setAttribute('dir', 'rtl');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
            }

            // Profile panel - no avatar mode
            const isNoAvatar = localStorage.getItem('profile-no-avatar') === 'true';
            profileNoAvatar.checked = isNoAvatar;
            const profileHeader = document.getElementById('profilePanelHeader');
            if (isNoAvatar && profileHeader) {
                profileHeader.classList.add('pa-profile-panel__header--no-avatar');
            }

            // Profile panel - icon-only tabs
            const isIconOnlyTabs = localStorage.getItem('profile-icon-only-tabs') === 'true';
            profileIconOnlyTabs.checked = isIconOnlyTabs;
            const profileTabs = document.querySelector('.pa-profile-panel__tabs');
            if (isIconOnlyTabs && profileTabs) {
                profileTabs.classList.add('pa-profile-panel__tabs--icon-only');
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
            const manifest = themeManifests[theme];

            // Update sections based on new theme's manifest before switching
            updateModeSectionFromManifest(manifest);
            updateColorVariantFromManifest(manifest);

            switchTheme(theme);
        });

        // Theme mode change (light/dark) - instant switch, no reload
        themeModeSelector.addEventListener('change', (e) => {
            const mode = e.target.value;
            const manifest = getCurrentThemeManifest();
            applyThemeMode(mode, manifest);
        });

        // Color variant change - instant switch, no reload
        colorVariantSelector.addEventListener('change', (e) => {
            const variant = e.target.value;
            const manifest = getCurrentThemeManifest();
            applyColorVariant(variant, manifest);
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

        // Sidebar resizable toggle
        sidebarResizable.addEventListener('change', (e) => {
            const sidebar = document.querySelector('.pa-layout__sidebar');
            if (e.target.checked) {
                sidebar.classList.add('pa-layout__sidebar--resizable');
                localStorage.setItem('sidebar-resizable', 'true');
                // Initialize resize functionality
                if (window.PureAdminSidebarResize && window.PureAdminSidebarResize.init) {
                    window.PureAdminSidebarResize.init();
                }
            } else {
                sidebar.classList.remove('pa-layout__sidebar--resizable');
                localStorage.setItem('sidebar-resizable', 'false');
                // Remove resize handle if it exists
                const handle = sidebar.querySelector('.pa-sidebar-resize');
                if (handle) handle.remove();
            }
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

        // RTL mode toggle
        rtlMode.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute('dir', 'rtl');
                localStorage.setItem('rtl-mode', 'true');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
                localStorage.setItem('rtl-mode', 'false');
            }
        });

        // Profile panel no-avatar toggle
        profileNoAvatar.addEventListener('change', (e) => {
            const profileHeader = document.getElementById('profilePanelHeader');
            if (e.target.checked) {
                profileHeader.classList.add('pa-profile-panel__header--no-avatar');
                localStorage.setItem('profile-no-avatar', 'true');
            } else {
                profileHeader.classList.remove('pa-profile-panel__header--no-avatar');
                localStorage.setItem('profile-no-avatar', 'false');
            }
        });

        // Profile panel icon-only tabs toggle
        profileIconOnlyTabs.addEventListener('change', (e) => {
            const profileTabs = document.querySelector('.pa-profile-panel__tabs');
            if (e.target.checked) {
                profileTabs.classList.add('pa-profile-panel__tabs--icon-only');
                localStorage.setItem('profile-icon-only-tabs', 'true');
            } else {
                profileTabs.classList.remove('pa-profile-panel__tabs--icon-only');
                localStorage.setItem('profile-icon-only-tabs', 'false');
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
            localStorage.removeItem('sidebar-resizable');
            localStorage.removeItem('sidebar-width');
            localStorage.removeItem('compact-mode');
            localStorage.removeItem('rtl-mode');
            localStorage.removeItem('profile-no-avatar');
            localStorage.removeItem('theme-mode');
            localStorage.removeItem('color-variant');

            // Reset theme, container width, and sidebar mode to defaults
            const url = new URL(window.location);
            url.searchParams.set('theme', 'audi');
            url.searchParams.set('containerWidth', 'fluid');
            url.searchParams.set('sidebarMode', '');
            window.location.href = url.toString();
        });

        // Initialize: Fetch manifests, populate theme selector, then load settings
        await fetchThemeManifests();
        populateThemeSelector();
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

    // Expose theme manifests for external use
    window.getThemeManifests = function() {
        return themeManifests;
    };

    window.getCurrentThemeManifest = function() {
        const currentTheme = window.PURE_ADMIN_CONFIG?.currentTheme || 'audi';
        return themeManifests[currentTheme] || null;
    };
})();
