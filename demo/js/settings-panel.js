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
        // Get modes for a specific variant (by id), or all modes if no variant specified
        const getModesForVariant = (manifest, variantId) => {
            if (!manifest) return [];
            if (Array.isArray(manifest.colorVariants)) {
                // Find the matching variant (empty string = default)
                const variant = manifest.colorVariants.find(v => (v.id || '') === (variantId || ''));
                if (variant && Array.isArray(variant.modes)) {
                    return variant.modes.map(m => m.id);
                }
            }
            // Old schema: modes.supported
            if (manifest.modes && manifest.modes.supported) {
                return manifest.modes.supported;
            }
            return [];
        };

        // Get default mode for a specific variant
        const getDefaultModeForVariant = (manifest, variantId) => {
            if (!manifest) return 'dark';
            if (Array.isArray(manifest.colorVariants)) {
                const variant = manifest.colorVariants.find(v => (v.id || '') === (variantId || ''));
                if (variant && Array.isArray(variant.modes)) {
                    const def = variant.modes.find(m => m.default);
                    if (def) return def.id;
                    return variant.modes[0]?.id || 'dark';
                }
            }
            if (manifest.modes && manifest.modes.default) return manifest.modes.default;
            return 'dark';
        };

        // Extract color variants from manifest (handles both old and new schema)
        const getManifestVariants = (manifest) => {
            if (!manifest) return [];
            // New schema: colorVariants is an array, filter out the default (empty id)
            if (Array.isArray(manifest.colorVariants)) {
                return manifest.colorVariants.filter(v => v.id !== undefined);
            }
            // Old schema: colorVariants.supported
            if (manifest.colorVariants && manifest.colorVariants.supported) {
                return manifest.colorVariants.supported;
            }
            return [];
        };

        const updateModeSectionFromManifest = (manifest, variantId) => {
            if (!themeModeSection || !themeModeSelector) return;

            const currentVariant = variantId !== undefined ? variantId : (colorVariantSelector?.value || '');
            const modes = getModesForVariant(manifest, currentVariant);
            if (modes.length <= 1) {
                themeModeSection.style.display = 'none';
                // Auto-apply the single mode if there is one
                if (modes.length === 1) {
                    applyThemeMode(modes[0], manifest);
                }
                return;
            }

            // Show mode section
            themeModeSection.style.display = '';

            // Update mode selector options
            themeModeSelector.innerHTML = '';
            for (const mode of modes) {
                const option = document.createElement('option');
                option.value = mode;
                option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
                themeModeSelector.appendChild(option);
            }
        };

        // Update color variant section based on current theme's manifest
        const updateColorVariantFromManifest = (manifest) => {
            if (!colorVariantSection || !colorVariantSelector) return;

            const variants = getManifestVariants(manifest);
            // Only show variant selector if there are multiple variants
            if (variants.length <= 1) {
                colorVariantSection.style.display = 'none';
                // Clear color variant when not supported
                applyColorVariant('', manifest);
                return;
            }

            // Show color variant section
            colorVariantSection.style.display = '';

            // Update color variant selector options
            colorVariantSelector.innerHTML = '';
            for (const variant of variants) {
                const option = document.createElement('option');
                option.value = variant.id;
                option.textContent = variant.name;
                if (variant.description) {
                    option.title = variant.description;
                }
                colorVariantSelector.appendChild(option);
            }
        };

        // Notify any code that snapshots CSS vars at draw time (charts, canvas, SVG)
        // that theme appearance just changed and they should re-read.
        const notifyThemeChange = (detail) => {
            window.dispatchEvent(new CustomEvent('pa:theme-change', { detail }));
            // Bridge the demo's theme-change hub onto the shared pureAdmin bus.
            if (window.pureAdmin && window.pureAdmin.events) {
                window.pureAdmin.events.emit('theme:change', detail);
            }
        };

        // Apply theme mode (light/dark) without page reload
        const applyThemeMode = (mode, manifest) => {
            const cssClassPattern = manifest?.modeCssClass || manifest?.modes?.cssClass || 'pa-mode-{mode}';

            // Remove all mode classes
            body.classList.remove('pa-mode-light', 'pa-mode-dark');

            // Apply new mode class
            const modeClass = cssClassPattern.replace('{mode}', mode);
            body.classList.add(modeClass);

            // Set data-theme attribute for web components (web-grid, etc.)
            body.dataset.theme = mode;

            localStorage.setItem('theme-mode', mode);
            notifyThemeChange({ kind: 'mode', mode });
        };

        // Apply color variant class
        const applyColorVariant = (variant, manifest) => {
            const cssClassPattern = manifest?.variantCssClass || manifest?.colorVariants?.cssClass || 'pa-color-{variant}';

            // Remove all color variant classes
            const variants = getManifestVariants(manifest);
            for (const v of variants) {
                if (v.id) {
                    body.classList.remove(cssClassPattern.replace('{variant}', v.id));
                }
            }

            // Apply new variant class if not empty
            if (variant) {
                const variantClass = cssClassPattern.replace('{variant}', variant);
                body.classList.add(variantClass);
            }

            localStorage.setItem('color-variant', variant);
            notifyThemeChange({ kind: 'variant', variant });
        };

        // Load saved settings
        const loadSettings = () => {
            // Theme - use server-provided currentTheme from global config
            const currentTheme = window.PURE_ADMIN_CONFIG?.currentTheme || 'audi';
            themeSelector.value = currentTheme;

            const manifest = getCurrentThemeManifest();

            // Update color variant section based on manifest
            updateColorVariantFromManifest(manifest);

            // Color variant — validate saved value against current theme
            const variants = getManifestVariants(manifest);
            let savedVariant = '';
            if (variants.length > 1) {
                const stored = localStorage.getItem('color-variant') || '';
                const validIds = variants.map(v => v.id);
                savedVariant = validIds.includes(stored) ? stored : (variants[0]?.id || '');
                colorVariantSelector.value = savedVariant;
                applyColorVariant(savedVariant, manifest);
            }

            // Update mode section based on current variant
            updateModeSectionFromManifest(manifest, savedVariant);

            // Theme mode - only for variants with multiple modes
            const modes = getModesForVariant(manifest, savedVariant);
            if (modes.length > 1) {
                const savedMode = localStorage.getItem('theme-mode') || getDefaultModeForVariant(manifest, savedVariant);
                themeModeSelector.value = savedMode;
                applyThemeMode(savedMode, manifest);
            }

            // Font size
            const savedFontSize = localStorage.getItem('font-size') || 'default';
            fontSizeSelector.value = savedFontSize;
            document.documentElement.classList.remove('font-size-small', 'font-size-default', 'font-size-large', 'font-size-xlarge');
            if (savedFontSize !== 'default') {
                document.documentElement.classList.add(`font-size-${savedFontSize}`);
            }

            // Font family — show theme's bundled font name in default option
            const defaultFontOption = fontFamilySelector.querySelector('option[value="default"]');
            if (defaultFontOption) {
                const themeFont = manifest?.fonts?.family?.split(',')[0]?.trim();
                defaultFontOption.textContent = themeFont ? `Theme Default (${themeFont})` : 'Theme Default';
            }
            const savedFontFamily = localStorage.getItem('font-family') || 'default';
            fontFamilySelector.value = savedFontFamily;
            applyFontFamily(savedFontFamily);

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
                if (window.pureAdmin.components.sidebarResize && window.pureAdmin.components.sidebarResize.init) {
                    window.pureAdmin.components.sidebarResize.init();
                }
            }

            // Compact mode
            const isCompactMode = localStorage.getItem('compact-mode') === 'true';
            compactMode.checked = isCompactMode;
            if (isCompactMode) {
                body.classList.add('compact-mode');
            }

            // RTL mode.
            // Normally driven by the global 'rtl-mode' flag. The RTL Test page
            // (body[data-rtl-default]) instead defaults to RTL — it exists to
            // demo RTL, so it should arrive in RTL — scoped to that page via a
            // per-session override key, without touching the global flag.
            let isRtlMode;
            if (document.body.hasAttribute('data-rtl-default')) {
                const sessionChoice = sessionStorage.getItem('rtl-test-dir'); // 'rtl' | 'ltr' | null
                isRtlMode = sessionChoice ? sessionChoice === 'rtl' : true;
            } else {
                isRtlMode = localStorage.getItem('rtl-mode') === 'true';
            }
            rtlMode.checked = isRtlMode;
            document.documentElement.setAttribute('dir', isRtlMode ? 'rtl' : 'ltr');

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
            updateColorVariantFromManifest(manifest);
            updateModeSectionFromManifest(manifest, '');

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

            // Update mode section — different variants may have different modes
            updateModeSectionFromManifest(manifest, variant);
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

        // Font family change — sets --base-font-family CSS variable directly
        const fontFamilyMap = {
            'serif': 'Georgia, "Times New Roman", Times, serif',
            'mono': '"Courier New", Courier, monospace',
            'cuprum': '"Cuprum", Arial, sans-serif',
            'fira-sans-condensed': '"Fira Sans Condensed", Arial Narrow, Arial, sans-serif',
            'manrope': '"Manrope", Arial, sans-serif',
            'martel': '"Martel", Georgia, serif',
            'maven-pro': '"Maven Pro", Arial, sans-serif',
            'monda': '"Monda", Arial, sans-serif',
            'play': '"Play", Arial, sans-serif',
            'signika': '"Signika", Arial, sans-serif',
            'yanone-kaffeesatz': '"Yanone Kaffeesatz", Arial, sans-serif'
        };

        const googleFonts = {
            'cuprum': 'Cuprum:wght@400;500;700',
            'fira-sans-condensed': 'Fira+Sans+Condensed:wght@400;500;600;700',
            'manrope': 'Manrope:wght@400;500;600;700',
            'martel': 'Martel:wght@400;700',
            'maven-pro': 'Maven+Pro:wght@400;500;600;700',
            'monda': 'Monda:wght@400;700',
            'play': 'Play:wght@400;700',
            'signika': 'Signika:wght@400;500;600;700',
            'yanone-kaffeesatz': 'Yanone+Kaffeesatz:wght@400;500;600;700'
        };

        const loadedFonts = new Set();

        function loadGoogleFont(family) {
            if (!googleFonts[family] || loadedFonts.has(family)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${googleFonts[family]}&display=swap`;
            document.head.appendChild(link);
            loadedFonts.add(family);
        }

        // Check if the theme already bundles a given font
        function themeBundlesFont(family) {
            const manifest = getCurrentThemeManifest();
            if (!manifest || !manifest.fonts || !manifest.fonts.family) return false;
            const themeFont = manifest.fonts.family.toLowerCase();
            const fontName = (fontFamilyMap[family] || '').split(',')[0].replace(/"/g, '').trim().toLowerCase();
            return fontName && themeFont.startsWith(fontName);
        }

        function applyFontFamily(family) {
            if (family !== 'default' && fontFamilyMap[family]) {
                if (themeBundlesFont(family)) {
                    // Theme already bundles this font — just use the theme default
                    body.style.removeProperty('--base-font-family');
                    console.log(`Font family "${family}" already bundled by theme, using theme default`);
                } else {
                    loadGoogleFont(family);
                    body.style.setProperty('--base-font-family', fontFamilyMap[family]);
                    console.log(`Font family applied: ${family} → ${fontFamilyMap[family]}`);
                }
            } else {
                body.style.removeProperty('--base-font-family');
                console.log('Font family reset to theme default');
            }
            localStorage.setItem('font-family', family);
        }

        fontFamilySelector.addEventListener('change', (e) => {
            applyFontFamily(e.target.value);
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
                if (window.pureAdmin.components.sidebarResize && window.pureAdmin.components.sidebarResize.init) {
                    window.pureAdmin.components.sidebarResize.init();
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
                if (window.pureAdmin && window.pureAdmin.events) {
                    window.pureAdmin.events.emit('sidebar:mode', { mode: behavior });
                }
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
