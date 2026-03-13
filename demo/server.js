const express = require('express');
const mustacheExpress = require('mustache-express');
const Mustache = require('mustache');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const app = express();
const port = process.env.PORT || 3000;

// Path to the core package in workspace
const corePackagePath = path.join(__dirname, '..', 'packages', 'core');

// Load theme config from themes.json + .themes.json
const repoRoot = path.join(__dirname, '..');

function loadThemes() {
    let themes = {};

    // Load standard themes (checked in)
    const standardPath = path.join(repoRoot, 'themes.json');
    if (fs.existsSync(standardPath)) {
        const standard = JSON.parse(fs.readFileSync(standardPath, 'utf-8'));
        themes = { ...themes, ...standard.themes };
    }

    // Merge user's private themes (gitignored)
    const localPath = path.join(repoRoot, '.themes.json');
    if (fs.existsSync(localPath)) {
        const local = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
        themes = { ...themes, ...local.themes };
    }

    // Resolve paths and validate
    const resolved = {};
    for (const [name, themePath] of Object.entries(themes)) {
        const absPath = path.resolve(repoRoot, themePath);
        const distPath = path.join(absPath, 'dist');
        if (fs.existsSync(distPath)) {
            resolved[name] = distPath;
        } else {
            console.warn(`Theme "${name}" not found at ${absPath}, skipping`);
        }
    }

    return resolved;
}

const themePackages = loadThemes();

// Set Mustache as template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Helper to load partials
const loadPartial = (name) => {
    return fs.readFileSync(path.join(__dirname, 'views', 'partials', `${name}.mustache`), 'utf-8');
};

// Add cookie parser middleware
app.use(cookieParser());

// Middleware to determine current theme, container width, and sidebar mode
app.use((req, res, next) => {
    const DEFAULT_THEME = 'audi';

    let theme = req.query.theme || req.cookies.selectedTheme || DEFAULT_THEME;

    // Validate theme exists - if not, clear cookie and use default
    if (!themePackages[theme]) {
        console.warn(`Invalid theme "${theme}" requested, falling back to "${DEFAULT_THEME}"`);
        theme = DEFAULT_THEME;
        // Clear the invalid cookie
        res.clearCookie('selectedTheme');
    }

    res.locals.currentTheme = theme;

    // Set cookie if theme was changed via query param (and is valid)
    if (req.query.theme && themePackages[req.query.theme]) {
        res.cookie('selectedTheme', req.query.theme, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    }

    // Container width
    const containerWidth = req.query.containerWidth || req.cookies.containerWidth || 'fluid';
    res.locals.containerWidth = containerWidth;

    // Set cookie if container width was changed via query param
    if (req.query.containerWidth !== undefined) {
        res.cookie('containerWidth', containerWidth, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    }

    // Sidebar mode
    const sidebarMode = req.query.sidebarMode !== undefined ? req.query.sidebarMode : (req.cookies.sidebarMode || '');
    res.locals.sidebarMode = sidebarMode;

    // Set cookie if sidebar mode was changed via query param
    if (req.query.sidebarMode !== undefined) {
        res.cookie('sidebarMode', sidebarMode, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    }

    // Add helper variables for Mustache
    res.locals.isAudiTheme = theme === 'audi';

    next();
});

// Custom render helper for layout support
const renderWithLayout = (res, viewName, data) => {
    // Merge data with res.locals
    const viewData = { ...res.locals, ...data };

    // Read and render the page template
    const pageTemplate = fs.readFileSync(path.join(__dirname, 'views', `${viewName}.mustache`), 'utf-8');
    const pageHtml = Mustache.render(pageTemplate, viewData);

    // Read and render partials WITH data
    const navbarTemplate = loadPartial('navbar');
    const sidebarTemplate = loadPartial('sidebar');
    const settingsPanelTemplate = loadPartial('settings-panel');
    const navbarHtml = Mustache.render(navbarTemplate, viewData);
    const sidebarHtml = Mustache.render(sidebarTemplate, viewData);
    const settingsPanelHtml = Mustache.render(settingsPanelTemplate, viewData);

    // Read layout template fresh on each request (for development)
    const layoutTemplate = fs.readFileSync(path.join(__dirname, 'views', 'layout.mustache'), 'utf-8');

    // Render the layout with the page content and rendered partials
    const finalData = {
        ...viewData,
        body: pageHtml,
        partials: {
            navbar: navbarHtml,
            sidebar: sidebarHtml,
            settingsPanel: settingsPanelHtml
        }
    };
    const finalHtml = Mustache.render(layoutTemplate, finalData);

    res.send(finalHtml);
};

// Routes
app.get('/', (req, res) => {
    renderWithLayout(res, 'dashboard', {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard',
        isDashboard: true
    });
});

app.get('/changelog', (req, res) => {
    // Read and parse CHANGELOG.md from core package
    const changelogPath = path.join(corePackagePath, 'CHANGELOG.md');
    const changelogMd = fs.readFileSync(changelogPath, 'utf-8');
    const changelogHtml = marked(changelogMd);

    renderWithLayout(res, 'changelog', {
        pageTitle: 'Changelog',
        currentPage: 'changelog',
        isChangelog: true,
        changelogContent: changelogHtml
    });
});

app.get('/theme-variables', (req, res) => {
    renderWithLayout(res, 'theme-variables', { pageTitle: 'Theme Variables', currentPage: 'theme-variables', isThemeVariables: true });
});

app.get('/colors', (req, res) => {
    renderWithLayout(res, 'colors', { pageTitle: 'Colors', currentPage: 'colors', isColors: true });
});

app.get('/helpers', (req, res) => {
    renderWithLayout(res, 'helpers', { pageTitle: 'Helpers', currentPage: 'helpers', isHelpers: true });
});

app.get('/forms', (req, res) => {
    renderWithLayout(res, 'forms', { pageTitle: 'Forms', currentPage: 'forms', isForms: true });
});

app.get('/inputs', (req, res) => {
    renderWithLayout(res, 'inputs', { pageTitle: 'Inputs', currentPage: 'inputs', isInputs: true });
});

app.get('/validations', (req, res) => {
    renderWithLayout(res, 'validations', { pageTitle: 'Form Validations', currentPage: 'validations', isValidations: true });
});

app.get('/date-picker', (req, res) => {
    renderWithLayout(res, 'date-picker', { pageTitle: 'Date Picker', currentPage: 'date-picker', isDatePicker: true });
});

app.get('/multiselect', (req, res) => {
    renderWithLayout(res, 'multiselect', { pageTitle: 'Multiselect', currentPage: 'multiselect', isMultiselect: true });
});

app.get('/data-grid', (req, res) => {
    renderWithLayout(res, 'data-grid', { pageTitle: 'Data Grid', currentPage: 'data-grid', isDataGrid: true });
});

app.get('/file-selector', (req, res) => {
    renderWithLayout(res, 'file-selector', { pageTitle: 'File Selector', currentPage: 'file-selector', isFileSelector: true });
});

app.get('/checkbox-lists', (req, res) => {
    renderWithLayout(res, 'checkbox-lists', { pageTitle: 'Checkbox Lists', currentPage: 'checkbox-lists', isCheckboxLists: true });
});

app.get('/cards', (req, res) => {
    renderWithLayout(res, 'cards', { pageTitle: 'Cards', currentPage: 'cards', isCards: true });
});

app.get('/sizing', (req, res) => {
    renderWithLayout(res, 'sizing', { pageTitle: 'Sizing & Layout', currentPage: 'sizing', isSizing: true });
});

app.get('/grid', (req, res) => {
    renderWithLayout(res, 'grid', { pageTitle: 'Grid System', currentPage: 'grid', isGrid: true });
});

app.get('/buttons', (req, res) => {
    renderWithLayout(res, 'buttons', { pageTitle: 'Buttons', currentPage: 'buttons', isButtons: true });
});

app.get('/alerts', (req, res) => {
    renderWithLayout(res, 'alerts', { pageTitle: 'Alerts', currentPage: 'alerts', isAlerts: true });
});

app.get('/callouts', (req, res) => {
    renderWithLayout(res, 'callouts', { pageTitle: 'Callouts', currentPage: 'callouts', isCallouts: true });
});

app.get('/components', (req, res) => {
    renderWithLayout(res, 'components', { pageTitle: 'Components', currentPage: 'components', isComponents: true });
});

app.get('/tables', (req, res) => {
    renderWithLayout(res, 'tables', { pageTitle: 'Tables', currentPage: 'tables', isTables: true });
});

app.get('/tables-sizing', (req, res) => {
    renderWithLayout(res, 'tables-sizing', { pageTitle: 'Tables - Sizing', currentPage: 'tables-sizing', isTablesSizing: true });
});

app.get('/tables-responsive', (req, res) => {
    renderWithLayout(res, 'tables-responsive', { pageTitle: 'Responsive Tables', currentPage: 'tables-responsive', isTablesResponsive: true });
});

app.get('/table-filters', (req, res) => {
    renderWithLayout(res, 'table-filters', { pageTitle: 'Table Filters', currentPage: 'table-filters', isTableFilters: true });
});

app.get('/smart-filters', (req, res) => {
    renderWithLayout(res, 'smart-filters', { pageTitle: 'Smart Filters', currentPage: 'smart-filters', isSmartFilters: true });
});

app.get('/table-multi-select', (req, res) => {
    renderWithLayout(res, 'table-multi-select', { pageTitle: 'Multi-Select Across Filters', currentPage: 'table-multi-select', isTableMultiSelect: true });
});

app.get('/comparison', (req, res) => {
    renderWithLayout(res, 'comparison', { pageTitle: 'Comparison Tables', currentPage: 'comparison', isComparison: true });
});

app.get('/code', (req, res) => {
    renderWithLayout(res, 'code', { pageTitle: 'Code Display', currentPage: 'code', isCode: true });
});

app.get('/badges', (req, res) => {
    renderWithLayout(res, 'badges', { pageTitle: 'Badges & Labels', currentPage: 'badges', isBadges: true });
});

app.get('/modals', (req, res) => {
    renderWithLayout(res, 'modals', { pageTitle: 'Modal Windows', currentPage: 'modals', isModals: true });
});

app.get('/modal-dialogs', (req, res) => {
    renderWithLayout(res, 'modal-dialogs', { pageTitle: 'Modal Dialogs', currentPage: 'modal-dialogs', isModalDialogs: true });
});

app.get('/popconfirm', (req, res) => {
    renderWithLayout(res, 'popconfirm', { pageTitle: 'Popconfirm', currentPage: 'popconfirm', isPopconfirm: true });
});

app.get('/loaders', (req, res) => {
    renderWithLayout(res, 'loaders', { pageTitle: 'Loaders & Spinners', currentPage: 'loaders', isLoaders: true });
});

app.get('/tooltips', (req, res) => {
    renderWithLayout(res, 'tooltips', { pageTitle: 'Tooltips', currentPage: 'tooltips', isTooltips: true });
});

app.get('/command-palette', (req, res) => {
    renderWithLayout(res, 'command-palette', { pageTitle: 'Command Palette', currentPage: 'command-palette', isCommandPalette: true });
});

app.get('/tabs', (req, res) => {
    renderWithLayout(res, 'tabs', { pageTitle: 'Tabs', currentPage: 'tabs', isTabs: true });
});

app.get('/toasts', (req, res) => {
    renderWithLayout(res, 'toasts', { pageTitle: 'Toast Notifications', currentPage: 'toasts', isToasts: true });
});

app.get('/layouts', (req, res) => {
    renderWithLayout(res, 'layouts', { pageTitle: 'Layouts', currentPage: 'layouts', isLayouts: true });
});

app.get('/lists', (req, res) => {
    renderWithLayout(res, 'lists', { pageTitle: 'Lists', currentPage: 'lists', isLists: true });
});

app.get('/timeline', (req, res) => {
    renderWithLayout(res, 'timeline', { pageTitle: 'Timeline', currentPage: 'timeline', isTimeline: true });
});

app.get('/timeline-simple', (req, res) => {
    renderWithLayout(res, 'timeline-simple', { pageTitle: 'Simple Timeline', currentPage: 'timeline-simple', isTimelineSimple: true });
});

app.get('/timeline-block', (req, res) => {
    renderWithLayout(res, 'timeline-block', { pageTitle: 'Timeline Block', currentPage: 'timeline-block', isTimelineBlock: true });
});

app.get('/virtual-scroll', (req, res) => {
    renderWithLayout(res, 'virtual-scroll', { pageTitle: 'Virtual Scroll', currentPage: 'virtual-scroll', isVirtualScroll: true });
});

app.get('/virtual-scroll-code', (req, res) => {
    renderWithLayout(res, 'virtual-scroll-code', { pageTitle: 'Virtual Scroll Code', currentPage: 'virtual-scroll-code', isVirtualScrollCode: true });
});

app.get('/notifications', (req, res) => {
    renderWithLayout(res, 'notifications', { pageTitle: 'Notifications', currentPage: 'notifications', isNotifications: true });
});

app.get('/pagers', (req, res) => {
    renderWithLayout(res, 'pagers', { pageTitle: 'Pagers', currentPage: 'pagers', isPagers: true });
});

app.get('/detail-panel', (req, res) => {
    renderWithLayout(res, 'detail-panel', { pageTitle: 'Detail Panel', currentPage: 'detail-panel', isDetailPanel: true });
});

app.get('/data-display', (req, res) => {
    renderWithLayout(res, 'data-display', { pageTitle: 'Data Display', currentPage: 'data-display', isDataDisplay: true });
});

app.get('/data-display-2', (req, res) => {
    renderWithLayout(res, 'data-display-2', { pageTitle: 'Data Display v2', currentPage: 'data-display-2', isDataDisplay2: true });
});

app.get('/data-visualization', (req, res) => {
    renderWithLayout(res, 'data-visualization', { pageTitle: 'Data Visualization', currentPage: 'data-visualization', isDataVisualization: true });
});

app.get('/rtl-test', (req, res) => {
    renderWithLayout(res, 'rtl-test', { pageTitle: 'RTL Test', currentPage: 'rtl-test', isRtlTest: true });
});

app.get('/kpi-dashboard', (req, res) => {
    renderWithLayout(res, 'kpi-dashboard', { pageTitle: 'KPI Dashboard', currentPage: 'kpi-dashboard', isKpiDashboard: true });
});

app.get('/movies', (req, res) => {
    renderWithLayout(res, 'movies', { pageTitle: 'Movies', currentPage: 'movies', isMovies: true });
});

app.get('/movies/detail', (req, res) => {
    renderWithLayout(res, 'movie-detail', { pageTitle: 'Movie Detail', currentPage: 'movie-detail', isMovieDetail: true });
});

app.get('/movies-panel', (req, res) => {
    renderWithLayout(res, 'movies-panel', { pageTitle: 'Movies + Panel', currentPage: 'movies-panel', isMoviesPanel: true });
});

// Serve static files with cache headers (after routes so EJS takes precedence)

// Theme CSS files from separate theme packages
app.get('/dist/css/themes/:theme.css', (req, res) => {
    const themeName = req.params.theme;
    const themeDistPath = themePackages[themeName];

    if (!themeDistPath) {
        return res.status(404).send(`Theme "${themeName}" not found`);
    }

    const themeCssPath = path.join(themeDistPath, `${themeName}.css`);

    if (!fs.existsSync(themeCssPath)) {
        return res.status(404).send(`Theme CSS file not found: ${themeCssPath}`);
    }

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.sendFile(themeCssPath);
});

// Theme manifest files (theme.json)
app.get('/api/themes/:theme/manifest', (req, res) => {
    const themeName = req.params.theme;
    const themeDistPath = themePackages[themeName];

    if (!themeDistPath) {
        return res.status(404).json({ error: `Theme "${themeName}" not found` });
    }

    // theme.json is in the package root, not dist
    const themeManifestPath = path.join(themeDistPath, '..', 'theme.json');

    if (!fs.existsSync(themeManifestPath)) {
        return res.status(404).json({ error: `Theme manifest not found for "${themeName}"` });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.sendFile(themeManifestPath);
});

// All theme manifests combined
app.get('/api/themes/manifests', (req, res) => {
    const manifests = {};

    for (const [themeName, themeDistPath] of Object.entries(themePackages)) {
        const themeManifestPath = path.join(themeDistPath, '..', 'theme.json');

        if (fs.existsSync(themeManifestPath)) {
            try {
                const manifestContent = fs.readFileSync(themeManifestPath, 'utf-8');
                manifests[themeName] = JSON.parse(manifestContent);
            } catch (err) {
                console.error(`Error reading theme manifest for ${themeName}:`, err);
            }
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.json(manifests);
});

// JSON schemas from core package (served at /schemas for public access)
app.use('/schemas', express.static(path.join(corePackagePath, 'schemas'), {
    maxAge: 120000 // 2 minutes
}));

// Fonts from core package
app.use('/fonts', express.static(path.join(corePackagePath, 'dist', 'fonts'), {
    maxAge: 120000 // 2 minutes
}));

// Also serve fonts from core package fonts/ directory (source fonts)
app.use('/fonts', express.static(path.join(corePackagePath, 'fonts'), {
    maxAge: 120000 // 2 minutes
}));

// CSS from core package
app.use('/dist/css', express.static(path.join(corePackagePath, 'dist', 'css'), {
    maxAge: 120000, // 2 minutes
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'public, max-age=120'); // 2 minutes
    }
}));

// Other dist files from core package
app.use('/dist', express.static(path.join(corePackagePath, 'dist'), {
    maxAge: 120000 // 2 minutes
}));

// SCSS source files from core package
app.use('/src/scss', express.static(path.join(corePackagePath, 'src', 'scss'), {
    maxAge: 120000 // 2 minutes
}));

// JavaScript files from demo (local)
app.use('/src/js', express.static(path.join(__dirname, 'js'), {
    maxAge: 120000 // 2 minutes
}));

// Assets (images, icons) from demo (local)
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: 120000 // 2 minutes
}));

// Snippets from core package
app.use('/snippets', express.static(path.join(corePackagePath, 'snippets'), {
    maxAge: 120000 // 2 minutes
}));

// Node modules (workspace root)
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules'), {
    maxAge: 120000 // 2 minutes
}));

app.listen(port, () => {
    console.log(`Pure Admin server running at http://localhost:${port}`);
});