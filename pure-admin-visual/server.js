const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const app = express();
const port = 3000;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts for layout support
app.use(expressLayouts);
app.set('layout', 'layout');

// Routes
app.get('/', (req, res) => {
    res.render('dashboard', {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard'
    });
});

app.get('/forms', (req, res) => {
    res.render('forms', {
        pageTitle: 'Forms',
        currentPage: 'forms'
    });
});

app.get('/cards', (req, res) => {
    res.render('cards', {
        pageTitle: 'Cards',
        currentPage: 'cards'
    });
});

app.get('/buttons', (req, res) => {
    res.render('buttons', {
        pageTitle: 'Buttons',
        currentPage: 'buttons'
    });
});

app.get('/alerts', (req, res) => {
    res.render('alerts', {
        pageTitle: 'Alerts',
        currentPage: 'alerts'
    });
});

app.get('/components', (req, res) => {
    res.render('components', {
        pageTitle: 'Components',
        currentPage: 'components'
    });
});

// Serve static files (after routes so EJS takes precedence)
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.listen(port, () => {
    console.log(`Pure Admin server running at http://localhost:${port}`);
});