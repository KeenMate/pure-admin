/**
 * Command Palette - macOS Spotlight-style search with Query Builder
 * Keyboard shortcut: Ctrl+K / Cmd+K
 * Context switching: /p (products), /o (orders), /u (users), /i (invoices)
 * Query builder: :field operator value syntax with autocomplete
 * Navigation: ↑↓ (items), ←→ (pages), Enter (select), Esc (close)
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // DOM elements
        const palette = document.getElementById('commandPalette');
        const backdrop = document.getElementById('commandPaletteBackdrop');
        const input = document.getElementById('commandPaletteInput');
        const tokensContainer = document.getElementById('commandPaletteTokens');
        const contextLabel = document.getElementById('commandPaletteContext');
        const results = document.getElementById('commandPaletteResults');

        // Check if elements exist
        if (!palette || !backdrop || !input || !tokensContainer || !contextLabel || !results) {
            console.warn('Command palette elements not found');
            return;
        }

    // State
    let isOpen = false;
    let currentContext = null;
    let currentResults = [];
    let activeIndex = -1;
    let currentPage = 1;
    let totalPages = 1;
    const resultsPerPage = 8;
    let resolvedTokens = []; // Array of { type: 'field'|'operator'|'value', value: string, variant: string }
    let currentQueryState = 'idle'; // 'idle' | 'expecting-field' | 'expecting-operator' | 'expecting-value'
    let autocompleteResults = [];
    let autocompleteActive = -1;

    // Context definitions
    const contexts = {
        p: { name: 'Products', label: 'Searching in Products' },
        o: { name: 'Orders', label: 'Searching in Orders' },
        u: { name: 'Users', label: 'Searching in Users' },
        i: { name: 'Invoices', label: 'Searching in Invoices' }
    };

    // Available fields for query builder
    const availableFields = [
        { value: 'name', label: 'Name', description: 'Filter by name' },
        { value: 'price', label: 'Price', description: 'Filter by price' },
        { value: 'status', label: 'Status', description: 'Filter by status' },
        { value: 'category', label: 'Category', description: 'Filter by category' },
        { value: 'date', label: 'Date', description: 'Filter by date' },
        { value: 'quantity', label: 'Quantity', description: 'Filter by quantity' }
    ];

    const availableOperators = [
        { value: '=', label: 'Equals', shorthand: 'eq', description: 'Exact match' },
        { value: '!=', label: 'Not Equals', shorthand: 'ne', description: 'Does not match' },
        { value: '>', label: 'Greater Than', shorthand: 'gt', description: 'Greater than value' },
        { value: '<', label: 'Less Than', shorthand: 'lt', description: 'Less than value' },
        { value: '>=', label: 'Greater or Equal', shorthand: 'gte', description: 'Greater than or equal to value' },
        { value: '<=', label: 'Less or Equal', shorthand: 'lte', description: 'Less than or equal to value' },
        { value: 'contains', label: 'Contains', shorthand: 'ct', description: 'Contains substring' },
        { value: 'starts_with', label: 'Starts With', shorthand: 'sw', description: 'Starts with substring' },
        { value: 'ends_with', label: 'Ends With', shorthand: 'ew', description: 'Ends with substring' }
    ];

    // Dummy data
    const dummyData = {
        products: [
            { id: 1, title: 'MacBook Pro 16"', meta: 'SKU: MBP-16-001 • $2,499.00', icon: '💻', badge: 'In Stock' },
            { id: 2, title: 'iPhone 15 Pro', meta: 'SKU: IP15P-256 • $999.00', icon: '📱', badge: 'New' },
            { id: 3, title: 'AirPods Pro', meta: 'SKU: APP-GEN2 • $249.00', icon: '🎧', badge: 'Popular' },
            { id: 4, title: 'iPad Air', meta: 'SKU: IPAD-AIR-5 • $599.00', icon: '📱', badge: 'In Stock' },
            { id: 5, title: 'Apple Watch Ultra', meta: 'SKU: AW-ULTRA • $799.00', icon: '⌚', badge: 'Limited' },
            { id: 6, title: 'Magic Keyboard', meta: 'SKU: MK-US • $99.00', icon: '⌨️', badge: 'In Stock' },
            { id: 7, title: 'Magic Mouse', meta: 'SKU: MM-BLK • $79.00', icon: '🖱️', badge: 'In Stock' },
            { id: 8, title: 'HomePod mini', meta: 'SKU: HPM-WHT • $99.00', icon: '🔊', badge: 'New' },
            { id: 9, title: 'Apple TV 4K', meta: 'SKU: ATV-4K-128 • $149.00', icon: '📺', badge: 'In Stock' },
            { id: 10, title: 'AirTag 4 Pack', meta: 'SKU: AT-4PK • $99.00', icon: '📍', badge: 'Popular' },
            { id: 11, title: 'Studio Display', meta: 'SKU: SD-27-STD • $1,599.00', icon: '🖥️', badge: 'Premium' },
            { id: 12, title: 'Mac Studio', meta: 'SKU: MS-M2-MAX • $1,999.00', icon: '💻', badge: 'Pro' }
        ],
        orders: [
            { id: 1001, title: 'Order #1001', meta: 'John Doe • $1,234.56 • 2 items', icon: '📦', badge: 'Shipped' },
            { id: 1002, title: 'Order #1002', meta: 'Jane Smith • $567.89 • 1 item', icon: '📦', badge: 'Processing' },
            { id: 1003, title: 'Order #1003', meta: 'Bob Johnson • $2,345.67 • 5 items', icon: '📦', badge: 'Delivered' },
            { id: 1004, title: 'Order #1004', meta: 'Alice Williams • $890.12 • 3 items', icon: '📦', badge: 'Pending' },
            { id: 1005, title: 'Order #1005', meta: 'Charlie Brown • $456.78 • 2 items', icon: '📦', badge: 'Shipped' },
            { id: 1006, title: 'Order #1006', meta: 'Diana Prince • $3,456.89 • 7 items', icon: '📦', badge: 'Processing' },
            { id: 1007, title: 'Order #1007', meta: 'Eve Davis • $123.45 • 1 item', icon: '📦', badge: 'Cancelled' },
            { id: 1008, title: 'Order #1008', meta: 'Frank Miller • $678.90 • 4 items', icon: '📦', badge: 'Delivered' },
            { id: 1009, title: 'Order #1009', meta: 'Grace Lee • $1,890.23 • 6 items', icon: '📦', badge: 'Shipped' },
            { id: 1010, title: 'Order #1010', meta: 'Henry Ford • $234.56 • 2 items', icon: '📦', badge: 'Pending' }
        ],
        users: [
            { id: 1, title: 'John Doe', meta: 'john.doe@example.com • Customer', icon: '👤', badge: 'Active' },
            { id: 2, title: 'Jane Smith', meta: 'jane.smith@example.com • Admin', icon: '👤', badge: 'Active' },
            { id: 3, title: 'Bob Johnson', meta: 'bob.johnson@example.com • Customer', icon: '👤', badge: 'Inactive' },
            { id: 4, title: 'Alice Williams', meta: 'alice.w@example.com • Manager', icon: '👤', badge: 'Active' },
            { id: 5, title: 'Charlie Brown', meta: 'charlie.b@example.com • Customer', icon: '👤', badge: 'Active' },
            { id: 6, title: 'Diana Prince', meta: 'diana.p@example.com • VIP', icon: '👤', badge: 'Premium' },
            { id: 7, title: 'Eve Davis', meta: 'eve.davis@example.com • Customer', icon: '👤', badge: 'Active' },
            { id: 8, title: 'Frank Miller', meta: 'frank.m@example.com • Support', icon: '👤', badge: 'Active' },
            { id: 9, title: 'Grace Lee', meta: 'grace.lee@example.com • Customer', icon: '👤', badge: 'New' },
            { id: 10, title: 'Henry Ford', meta: 'henry.f@example.com • Customer', icon: '👤', badge: 'Active' }
        ],
        invoices: [
            { id: 501, title: 'Invoice #INV-501', meta: 'Order #1001 • $1,234.56 • Due in 5 days', icon: '📄', badge: 'Unpaid' },
            { id: 502, title: 'Invoice #INV-502', meta: 'Order #1002 • $567.89 • Paid 2 days ago', icon: '📄', badge: 'Paid' },
            { id: 503, title: 'Invoice #INV-503', meta: 'Order #1003 • $2,345.67 • Paid 1 week ago', icon: '📄', badge: 'Paid' },
            { id: 504, title: 'Invoice #INV-504', meta: 'Order #1004 • $890.12 • Due today', icon: '📄', badge: 'Overdue' },
            { id: 505, title: 'Invoice #INV-505', meta: 'Order #1005 • $456.78 • Due in 3 days', icon: '📄', badge: 'Unpaid' },
            { id: 506, title: 'Invoice #INV-506', meta: 'Order #1006 • $3,456.89 • Due in 7 days', icon: '📄', badge: 'Unpaid' },
            { id: 507, title: 'Invoice #INV-507', meta: 'Order #1007 • $123.45 • Cancelled', icon: '📄', badge: 'Void' },
            { id: 508, title: 'Invoice #INV-508', meta: 'Order #1008 • $678.90 • Paid 3 days ago', icon: '📄', badge: 'Paid' },
            { id: 509, title: 'Invoice #INV-509', meta: 'Order #1009 • $1,890.23 • Due in 10 days', icon: '📄', badge: 'Unpaid' },
            { id: 510, title: 'Invoice #INV-510', meta: 'Order #1010 • $234.56 • Due in 2 days', icon: '📄', badge: 'Unpaid' }
        ]
    };

    /**
     * Determine current query state based on tokens
     */
    function updateQueryState() {
        const tokenCount = resolvedTokens.length % 3;

        if (tokenCount === 0) {
            currentQueryState = 'idle'; // Ready for new query or field
        } else if (tokenCount === 1) {
            currentQueryState = 'expecting-operator';
        } else if (tokenCount === 2) {
            currentQueryState = 'expecting-value';
        }
    }

    /**
     * Search autocomplete suggestions
     */
    function searchAutocomplete(query) {
        if (currentQueryState === 'idle' || currentQueryState === 'expecting-field') {
            // Search for fields (must start with :)
            if (query.startsWith(':')) {
                const searchTerm = query.substring(1).toLowerCase();
                return availableFields.filter(field =>
                    field.value.toLowerCase().includes(searchTerm) ||
                    field.label.toLowerCase().includes(searchTerm)
                );
            }
        } else if (currentQueryState === 'expecting-operator') {
            // Search for operators (by shorthand or full name)
            const searchTerm = query.toLowerCase();
            return availableOperators.filter(op =>
                op.value.toLowerCase().includes(searchTerm) ||
                op.label.toLowerCase().includes(searchTerm) ||
                op.shorthand.toLowerCase().includes(searchTerm)
            );
        }

        return [];
    }

    /**
     * Render autocomplete dropdown
     */
    function renderAutocomplete() {
        if (autocompleteResults.length === 0) {
            results.innerHTML = '';
            renderEmptyState();
            return;
        }

        let html = '';
        const isFieldSearch = currentQueryState === 'idle' || currentQueryState === 'expecting-field';

        autocompleteResults.forEach((item, index) => {
            const isActive = index === autocompleteActive;
            const icon = isFieldSearch ? '🔍' : '⚡';

            html += `
                <div class="pa-command-palette__item ${isActive ? 'pa-command-palette__item--active' : ''}" data-index="${index}">
                    <div class="pa-command-palette__item-icon">${icon}</div>
                    <div class="pa-command-palette__item-content">
                        <div class="pa-command-palette__item-title">${item.label}</div>
                        <div class="pa-command-palette__item-meta">${item.description}</div>
                    </div>
                    <div class="pa-command-palette__item-badge">${item.value}</div>
                </div>
            `;
        });

        results.innerHTML = html;

        // Add click handlers
        document.querySelectorAll('.pa-command-palette__item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                selectAutocomplete(autocompleteResults[index]);
            });
        });
    }

    /**
     * Select autocomplete item
     */
    function selectAutocomplete(item) {
        if (!item) return;

        // Determine token type based on state
        let tokenType, variant;

        if (currentQueryState === 'idle' || currentQueryState === 'expecting-field') {
            tokenType = 'field';
            variant = 'primary';
        } else if (currentQueryState === 'expecting-operator') {
            tokenType = 'operator';
            variant = 'secondary';
        }

        // Add token
        resolvedTokens.push({
            type: tokenType,
            value: item.value,
            variant: variant
        });

        // Update state
        updateQueryState();

        // Clear input and autocomplete
        input.value = '';
        autocompleteResults = [];
        autocompleteActive = -1;

        // Re-render
        renderTokens();
        renderEmptyState();
        input.focus();
    }

    /**
     * Resolve value token (when user presses Enter or Tab in expecting-value state)
     */
    function resolveValueToken() {
        const value = input.value.trim();

        if (value && currentQueryState === 'expecting-value') {
            resolvedTokens.push({
                type: 'value',
                value: value,
                variant: 'success'
            });

            updateQueryState();
            input.value = '';
            renderTokens();
            renderEmptyState();
        }
    }

    /**
     * Render resolved tokens as badges
     */
    function renderTokens() {
        tokensContainer.innerHTML = '';

        // Group tokens into sets of 3 (field, operator, value)
        for (let i = 0; i < resolvedTokens.length; i += 3) {
            const queryTokens = resolvedTokens.slice(i, i + 3);

            // Create a group container for this query
            const group = document.createElement('div');
            group.className = 'pa-command-palette__token-group';
            group.style.display = 'inline-flex';
            group.style.gap = '2px';
            group.style.marginRight = '0.5rem';
            group.style.marginBottom = '0.25rem';

            queryTokens.forEach((token, index) => {
                const badge = document.createElement('span');
                badge.className = `pa-badge pa-badge--${token.variant}`;
                badge.textContent = token.value;
                badge.style.margin = '0';
                badge.style.borderRadius = '0';

                // Round first and last badges
                if (index === 0) {
                    badge.style.borderTopLeftRadius = '4px';
                    badge.style.borderBottomLeftRadius = '4px';
                }
                if (index === queryTokens.length - 1 || i + index === resolvedTokens.length - 1) {
                    badge.style.borderTopRightRadius = '4px';
                    badge.style.borderBottomRightRadius = '4px';
                }

                group.appendChild(badge);
            });

            // Add remove button to the group
            const removeBtn = document.createElement('button');
            removeBtn.className = 'pa-badge__remove';
            removeBtn.innerHTML = '×';
            removeBtn.style.marginLeft = '0.25rem';
            removeBtn.style.border = 'none';
            removeBtn.style.background = 'transparent';
            removeBtn.style.color = 'currentColor';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.fontSize = '1.2em';
            removeBtn.style.lineHeight = '1';
            removeBtn.style.padding = '0 0.25rem';
            removeBtn.style.opacity = '0.7';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                removeTokenGroup(i);
            };

            group.appendChild(removeBtn);
            tokensContainer.appendChild(group);
        }
    }

    /**
     * Remove a token group (set of 3 tokens)
     */
    function removeTokenGroup(startIndex) {
        resolvedTokens.splice(startIndex, 3);
        updateQueryState();
        renderTokens();
        input.focus();
    }

    /**
     * Open command palette
     */
    function openPalette() {
        isOpen = true;
        palette.classList.add('pa-command-palette--active');
        input.focus();
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close command palette
     */
    function closePalette() {
        isOpen = false;
        palette.classList.remove('pa-command-palette--active');
        input.value = '';
        resolvedTokens = [];
        currentQueryState = 'idle';
        autocompleteResults = [];
        autocompleteActive = -1;
        renderTokens();
        contextLabel.textContent = '';
        contextLabel.classList.remove('pa-command-palette__context--visible');
        currentContext = null;
        currentResults = [];
        activeIndex = -1;
        currentPage = 1;
        document.body.style.overflow = '';
        renderEmptyState();
    }

    /**
     * Detect context from search query
     */
    function detectContext(query) {
        const match = query.match(/^\/([poui])\s*/);
        if (match) {
            const contextKey = match[1];
            return contexts[contextKey] || null;
        }
        return null;
    }

    /**
     * Get search query without context prefix
     */
    function getSearchQuery(query) {
        return query.replace(/^\/[poui]\s*/, '').trim();
    }

    /**
     * Filter results based on search query
     */
    function filterResults(data, query) {
        if (!query) return data;

        const lowerQuery = query.toLowerCase();
        return data.filter(item => {
            return item.title.toLowerCase().includes(lowerQuery) ||
                   item.meta.toLowerCase().includes(lowerQuery);
        });
    }

    /**
     * Highlight matching text
     */
    function highlightText(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Render empty state
     */
    function renderEmptyState() {
        let message = 'Type to search or use /p for products, /o for orders, /u for users, /i for invoices<br><small>Build queries: :field operator value (e.g., :name contains macbook)</small>';

        if (currentQueryState === 'expecting-operator') {
            message = '<strong>Enter operator:</strong><br><small>sw (starts with), ct (contains), eq (equals), gt (greater than), etc.</small>';
        } else if (currentQueryState === 'expecting-value') {
            message = '<strong>Enter value and press Tab or Enter</strong>';
        }

        results.innerHTML = `<div class="pa-command-palette__empty">${message}</div>`;
    }

    /**
     * Show loader (inline in results area)
     */
    function showLoader() {
        results.classList.add('pa-command-palette__results--loading');

        if (currentResults.length === 0) {
            results.innerHTML = `
                <div class="pa-command-palette__loader">
                    <div class="pa-spinner pa-spinner--sm pa-spinner--primary"></div>
                    <span>Searching...</span>
                </div>
            `;
        }
    }

    /**
     * Hide loader
     */
    function hideLoader() {
        results.classList.remove('pa-command-palette__results--loading');
    }

    /**
     * Render results
     */
    function renderResults(items, query, page = 1) {
        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        const pageItems = items.slice(startIndex, endIndex);

        totalPages = Math.ceil(items.length / resultsPerPage);

        if (pageItems.length === 0) {
            results.innerHTML = '<div class="pa-command-palette__empty">No results found</div>';
            return;
        }

        let html = '';

        pageItems.forEach((item, index) => {
            const globalIndex = startIndex + index;
            const isActive = globalIndex === activeIndex;
            const highlightedTitle = highlightText(item.title, query);

            html += `
                <div class="pa-command-palette__item ${isActive ? 'pa-command-palette__item--active' : ''}" data-index="${globalIndex}">
                    <div class="pa-command-palette__item-icon">${item.icon}</div>
                    <div class="pa-command-palette__item-content">
                        <div class="pa-command-palette__item-title">${highlightedTitle}</div>
                        <div class="pa-command-palette__item-meta">${item.meta}</div>
                    </div>
                    <div class="pa-command-palette__item-badge">${item.badge}</div>
                </div>
            `;
        });

        if (totalPages > 1) {
            html += `
                <div class="pa-command-palette__pagination">
                    Page ${page} of ${totalPages} • ${items.length} results
                </div>
            `;
        }

        results.innerHTML = html;

        document.querySelectorAll('.pa-command-palette__item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                selectItem(currentResults[index]);
            });
        });
    }

    /**
     * Perform search
     */
    function performSearch(query) {
        const context = detectContext(query);
        const searchQuery = getSearchQuery(query);

        if (context) {
            currentContext = context;
            contextLabel.textContent = context.label;
            contextLabel.classList.add('pa-command-palette__context--visible');
        } else {
            currentContext = null;
            contextLabel.classList.remove('pa-command-palette__context--visible');
        }

        if (!searchQuery && !context) {
            renderEmptyState();
            currentResults = [];
            activeIndex = -1;
            hideLoader();
            return;
        }

        showLoader();

        setTimeout(() => {
            let data = [];
            if (context) {
                switch (context.name) {
                    case 'Products':
                        data = dummyData.products;
                        break;
                    case 'Orders':
                        data = dummyData.orders;
                        break;
                    case 'Users':
                        data = dummyData.users;
                        break;
                    case 'Invoices':
                        data = dummyData.invoices;
                        break;
                }
            } else {
                data = [
                    ...dummyData.products,
                    ...dummyData.orders,
                    ...dummyData.users,
                    ...dummyData.invoices
                ];
            }

            currentResults = filterResults(data, searchQuery);
            activeIndex = currentResults.length > 0 ? 0 : -1;
            currentPage = 1;

            hideLoader();
            renderResults(currentResults, searchQuery, currentPage);
        }, 300);
    }

    /**
     * Navigate autocomplete
     */
    function navigateAutocompletePrevious() {
        if (autocompleteResults.length === 0) return;

        autocompleteActive = autocompleteActive <= 0
            ? autocompleteResults.length - 1
            : autocompleteActive - 1;

        renderAutocomplete();
    }

    function navigateAutocompleteNext() {
        if (autocompleteResults.length === 0) return;

        autocompleteActive = autocompleteActive >= autocompleteResults.length - 1
            ? 0
            : autocompleteActive + 1;

        renderAutocomplete();
    }

    /**
     * Navigate to previous item
     */
    function navigatePrevious() {
        if (currentResults.length === 0) return;

        const startIndex = (currentPage - 1) * resultsPerPage;

        if (activeIndex > startIndex) {
            activeIndex--;
        } else if (currentPage > 1) {
            currentPage--;
            activeIndex = Math.min((currentPage * resultsPerPage) - 1, currentResults.length - 1);
        } else {
            currentPage = totalPages;
            activeIndex = currentResults.length - 1;
        }

        renderResults(currentResults, getSearchQuery(input.value), currentPage);
    }

    /**
     * Navigate to next item
     */
    function navigateNext() {
        if (currentResults.length === 0) return;

        const endIndex = Math.min(currentPage * resultsPerPage, currentResults.length);

        if (activeIndex < endIndex - 1) {
            activeIndex++;
        } else if (currentPage < totalPages) {
            currentPage++;
            activeIndex = (currentPage - 1) * resultsPerPage;
        } else {
            currentPage = 1;
            activeIndex = 0;
        }

        renderResults(currentResults, getSearchQuery(input.value), currentPage);
    }

    /**
     * Navigate to previous page
     */
    function navigatePreviousPage() {
        if (currentResults.length === 0 || totalPages <= 1) return;

        currentPage = currentPage > 1 ? currentPage - 1 : totalPages;
        activeIndex = (currentPage - 1) * resultsPerPage;

        renderResults(currentResults, getSearchQuery(input.value), currentPage);
    }

    /**
     * Navigate to next page
     */
    function navigateNextPage() {
        if (currentResults.length === 0 || totalPages <= 1) return;

        currentPage = currentPage < totalPages ? currentPage + 1 : 1;
        activeIndex = (currentPage - 1) * resultsPerPage;

        renderResults(currentResults, getSearchQuery(input.value), currentPage);
    }

    /**
     * Select item
     */
    function selectItem(item) {
        console.log('Selected:', item);
        alert(`Selected: ${item.title}\n${item.meta}`);
        closePalette();
    }

    /**
     * Global keyboard shortcut (Ctrl+K / Cmd+K)
     */
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (isOpen) {
                closePalette();
            } else {
                openPalette();
            }
        }
    });

    /**
     * Backdrop click to close
     */
    backdrop.addEventListener('click', closePalette);

    /**
     * Input events
     */
    input.addEventListener('input', (e) => {
        const inputValue = e.target.value;

        // Check for autocomplete
        if (currentQueryState === 'idle' || currentQueryState === 'expecting-operator') {
            autocompleteResults = searchAutocomplete(inputValue);
            autocompleteActive = autocompleteResults.length > 0 ? 0 : -1;

            if (autocompleteResults.length > 0) {
                renderAutocomplete();
                return;
            }
        }

        // Check for context switching
        const context = detectContext(inputValue);
        if (context || inputValue.startsWith('/')) {
            performSearch(inputValue);
            return;
        }

        // Normal search
        if (!inputValue.startsWith(':') && currentQueryState === 'idle') {
            performSearch(inputValue);
        } else {
            renderEmptyState();
        }
    });

    input.addEventListener('keydown', (e) => {
        // Handle autocomplete navigation
        if (autocompleteResults.length > 0) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateAutocompletePrevious();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateAutocompleteNext();
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                selectAutocomplete(autocompleteResults[autocompleteActive]);
                return;
            }
        }

        // Handle value resolution
        if (currentQueryState === 'expecting-value' && (e.key === 'Enter' || e.key === 'Tab')) {
            e.preventDefault();
            resolveValueToken();
            return;
        }

        // Backspace at start - remove last token
        if (e.key === 'Backspace' && input.value === '' && resolvedTokens.length > 0) {
            e.preventDefault();
            resolvedTokens.pop();
            updateQueryState();
            renderTokens();
            renderEmptyState();
            return;
        }

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                closePalette();
                break;

            case 'ArrowUp':
                if (currentResults.length > 0) {
                    e.preventDefault();
                    navigatePrevious();
                }
                break;

            case 'ArrowDown':
                if (currentResults.length > 0) {
                    e.preventDefault();
                    navigateNext();
                }
                break;

            case 'ArrowLeft':
                e.preventDefault();
                navigatePreviousPage();
                break;

            case 'ArrowRight':
                e.preventDefault();
                navigateNextPage();
                break;

            case 'Enter':
                if (activeIndex >= 0 && currentResults[activeIndex]) {
                    e.preventDefault();
                    selectItem(currentResults[activeIndex]);
                }
                break;
        }
    });

    // Initialize
    updateQueryState();

    } // end init()

})();
