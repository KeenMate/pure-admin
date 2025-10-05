const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = 3000;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts for layout support
app.use(expressLayouts);
app.set('layout', 'layout');

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

    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('dashboard', {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/forms', (req, res) => {
    res.render('forms', {
        pageTitle: 'Forms',
        currentPage: 'forms',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/cards', (req, res) => {
    res.render('cards', {
        pageTitle: 'Cards',
        currentPage: 'cards',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/buttons', (req, res) => {
    res.render('buttons', {
        pageTitle: 'Buttons',
        currentPage: 'buttons',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/alerts', (req, res) => {
    res.render('alerts', {
        pageTitle: 'Alerts',
        currentPage: 'alerts',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/components', (req, res) => {
    res.render('components', {
        pageTitle: 'Components',
        currentPage: 'components',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/tables', (req, res) => {
    res.render('tables', {
        pageTitle: 'Tables',
        currentPage: 'tables',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/tables-sizing', (req, res) => {
    res.render('tables-sizing', {
        pageTitle: 'Tables - Sizing',
        currentPage: 'tables-sizing',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/tables-lazy', (req, res) => {
    res.render('tables-lazy', {
        pageTitle: 'Tables - Lazy Load',
        currentPage: 'tables-lazy',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/badges', (req, res) => {
    res.render('badges', {
        pageTitle: 'Badges & Labels',
        currentPage: 'badges',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/modals', (req, res) => {
    res.render('modals', {
        pageTitle: 'Modal Windows',
        currentPage: 'modals',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/loaders', (req, res) => {
    res.render('loaders', {
        pageTitle: 'Loaders & Spinners',
        currentPage: 'loaders',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/tooltips', (req, res) => {
    res.render('tooltips', {
        pageTitle: 'Tooltips',
        currentPage: 'tooltips',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/tabs', (req, res) => {
    res.render('tabs', {
        pageTitle: 'Tabs',
        currentPage: 'tabs',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/toasts', (req, res) => {
    res.render('toasts', {
        pageTitle: 'Toast Notifications',
        currentPage: 'toasts',
        currentTheme: res.locals.currentTheme
    });
});

app.get('/layouts', (req, res) => {
    res.render('layouts', {
        pageTitle: 'Layouts',
        currentPage: 'layouts',
        currentTheme: res.locals.currentTheme
    });
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