const express = require('express');
const mustacheExpress = require('mustache-express');
const Mustache = require('mustache');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

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
    const theme = req.query.theme || req.cookies.selectedTheme || 'audi';
    res.locals.currentTheme = theme;

    // Set cookie if theme was changed via query param
    if (req.query.theme) {
        res.cookie('selectedTheme', theme, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
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
    const navbarHtml = Mustache.render(navbarTemplate, viewData);
    const sidebarHtml = Mustache.render(sidebarTemplate, viewData);

    // Read layout template fresh on each request (for development)
    const layoutTemplate = fs.readFileSync(path.join(__dirname, 'views', 'layout.mustache'), 'utf-8');

    // Render the layout with the page content and rendered partials
    const finalData = {
        ...viewData,
        body: pageHtml,
        partials: {
            navbar: navbarHtml,
            sidebar: sidebarHtml
        }
    };
    const finalHtml = Mustache.render(layoutTemplate, finalData);

    res.send(finalHtml);
};

// Routes
app.get('/', (req, res) => {
    renderWithLayout(res, 'dashboard', {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard'
    });
});

app.get('/forms', (req, res) => {
    renderWithLayout(res, 'forms', { pageTitle: 'Forms', currentPage: 'forms' });
});

app.get('/checkbox-lists', (req, res) => {
    renderWithLayout(res, 'checkbox-lists', { pageTitle: 'Checkbox Lists', currentPage: 'checkbox-lists', isCheckboxLists: true });
});

app.get('/cards', (req, res) => {
    renderWithLayout(res, 'cards', { pageTitle: 'Cards', currentPage: 'cards' });
});

app.get('/buttons', (req, res) => {
    renderWithLayout(res, 'buttons', { pageTitle: 'Buttons', currentPage: 'buttons' });
});

app.get('/alerts', (req, res) => {
    renderWithLayout(res, 'alerts', { pageTitle: 'Alerts', currentPage: 'alerts' });
});

app.get('/components', (req, res) => {
    renderWithLayout(res, 'components', { pageTitle: 'Components', currentPage: 'components' });
});

app.get('/tables', (req, res) => {
    renderWithLayout(res, 'tables', { pageTitle: 'Tables', currentPage: 'tables' });
});

app.get('/tables-sizing', (req, res) => {
    renderWithLayout(res, 'tables-sizing', { pageTitle: 'Tables - Sizing', currentPage: 'tables-sizing', isTablesSizing: true });
});

app.get('/table-filters', (req, res) => {
    renderWithLayout(res, 'table-filters', { pageTitle: 'Table Filters', currentPage: 'table-filters', isTableFilters: true });
});

app.get('/comparison', (req, res) => {
    renderWithLayout(res, 'comparison', { pageTitle: 'Comparison Tables', currentPage: 'comparison', isComparison: true });
});

app.get('/code', (req, res) => {
    renderWithLayout(res, 'code', { pageTitle: 'Code Display', currentPage: 'code' });
});

app.get('/badges', (req, res) => {
    renderWithLayout(res, 'badges', { pageTitle: 'Badges & Labels', currentPage: 'badges' });
});

app.get('/modals', (req, res) => {
    renderWithLayout(res, 'modals', { pageTitle: 'Modal Windows', currentPage: 'modals' });
});

app.get('/popconfirm', (req, res) => {
    renderWithLayout(res, 'popconfirm', { pageTitle: 'Popconfirm', currentPage: 'popconfirm' });
});

app.get('/loaders', (req, res) => {
    renderWithLayout(res, 'loaders', { pageTitle: 'Loaders & Spinners', currentPage: 'loaders' });
});

app.get('/tooltips', (req, res) => {
    renderWithLayout(res, 'tooltips', { pageTitle: 'Tooltips', currentPage: 'tooltips' });
});

app.get('/command-palette', (req, res) => {
    renderWithLayout(res, 'command-palette', { pageTitle: 'Command Palette', currentPage: 'command-palette', isCommandPalette: true });
});

app.get('/tabs', (req, res) => {
    renderWithLayout(res, 'tabs', { pageTitle: 'Tabs', currentPage: 'tabs' });
});

app.get('/toasts', (req, res) => {
    renderWithLayout(res, 'toasts', { pageTitle: 'Toast Notifications', currentPage: 'toasts' });
});

app.get('/layouts', (req, res) => {
    renderWithLayout(res, 'layouts', { pageTitle: 'Layouts', currentPage: 'layouts' });
});

app.get('/lists', (req, res) => {
    renderWithLayout(res, 'lists', { pageTitle: 'Lists', currentPage: 'lists' });
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

// Serve static files with cache headers (after routes so EJS takes precedence)

// Fonts - short cache for development
app.use('/fonts', express.static(path.join(__dirname, 'fonts'), {
    maxAge: 120000 // 2 minutes
}));

// CSS - short cache for development
app.use('/dist/css', express.static(path.join(__dirname, 'dist/css'), {
    maxAge: 120000, // 2 minutes
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'public, max-age=120'); // 2 minutes
    }
}));

// Other dist files (JS, etc)
app.use('/dist', express.static(path.join(__dirname, 'dist'), {
    maxAge: 120000 // 2 minutes
}));

// Assets (images, icons) - short cache for development
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: 120000 // 2 minutes
}));

// Source files (for development)
app.use('/src', express.static(path.join(__dirname, 'src'), {
    maxAge: 120000 // 2 minutes
}));

app.listen(port, () => {
    console.log(`Pure Admin server running at http://localhost:${port}`);
});