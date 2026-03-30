/**
 * Command Palette - macOS Spotlight-style search
 * Keyboard shortcut: Ctrl+K / Cmd+K
 * Context switching: /p (products), /o (orders), /u (users), /i (invoices)
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
        const contextLabel = document.getElementById('commandPaletteContext');
        const results = document.getElementById('commandPaletteResults');

        // Check if elements exist
        if (!palette || !backdrop || !input || !contextLabel || !results) {
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

    // Context definitions
    const contexts = {
        p: { name: 'Products', label: 'Searching in Products' },
        o: { name: 'Orders', label: 'Searching in Orders' },
        u: { name: 'Users', label: 'Searching in Users' },
        i: { name: 'Invoices', label: 'Searching in Invoices' }
    };

    // Dummy data
    const dummyData = {
        products: [
            { id: 1, title: 'MacBook Pro 16"', meta: 'SKU: MBP-16-001 • $2,499.00', icon: '💻', badge: 'In Stock' },
            { id: 2, title: 'iPhone 15 Pro', meta: 'SKU: IP15P-256 • $999.00', icon: '📱', badge: 'New' },
            { id: 3, title: 'AirPods Pro', meta: 'SKU: APP-GEN2 • $249.00', icon: '🎧', badge: 'Popular' },
            { id: 4, title: 'iPad Air', meta: 'SKU: IPAD-AIR-5 • $599.00', icon: '📱', badge: 'In Stock', badgeVariant: 'success' },
            { id: 5, title: 'Apple Watch Ultra', meta: 'SKU: AW-ULTRA • $799.00', icon: '⌚', badge: 'Limited', badgeVariant: 'warning' },
            { id: 6, title: 'Magic Keyboard', meta: 'SKU: MK-US • $99.00', icon: '⌨️', badge: 'In Stock', badgeVariant: 'success' },
            { id: 7, title: 'Magic Mouse', meta: 'SKU: MM-BLK • $79.00', icon: '🖱️', badge: 'In Stock', badgeVariant: 'success' },
            { id: 8, title: 'HomePod mini', meta: 'SKU: HPM-WHT • $99.00', icon: '🔊', badge: 'New', badgeVariant: 'info' },
            { id: 9, title: 'Apple TV 4K', meta: 'SKU: ATV-4K-128 • $149.00', icon: '📺', badge: 'In Stock', badgeVariant: 'success' },
            { id: 10, title: 'AirTag 4 Pack', meta: 'SKU: AT-4PK • $99.00', icon: '📍', badge: 'Popular', badgeVariant: 'info' },
            { id: 11, title: 'Studio Display', meta: 'SKU: SD-27-STD • $1,599.00', icon: '🖥️', badge: 'Premium', badgeVariant: 'primary' },
            { id: 12, title: 'Mac Studio', meta: 'SKU: MS-M2-MAX • $1,999.00', icon: '💻', badge: 'Pro', badgeVariant: 'primary' }
        ],
        orders: [
            { id: 1001, title: 'Order #1001', meta: 'John Doe • $1,234.56 • 2 items', icon: '📦', badge: 'Shipped', badgeVariant: 'info' },
            { id: 1002, title: 'Order #1002', meta: 'Jane Smith • $567.89 • 1 item', icon: '📦', badge: 'Processing', badgeVariant: 'warning' },
            { id: 1003, title: 'Order #1003', meta: 'Bob Johnson • $2,345.67 • 5 items', icon: '📦', badge: 'Delivered', badgeVariant: 'success' },
            { id: 1004, title: 'Order #1004', meta: 'Alice Williams • $890.12 • 3 items', icon: '📦', badge: 'Pending' },
            { id: 1005, title: 'Order #1005', meta: 'Charlie Brown • $456.78 • 2 items', icon: '📦', badge: 'Shipped', badgeVariant: 'info' },
            { id: 1006, title: 'Order #1006', meta: 'Diana Prince • $3,456.89 • 7 items', icon: '📦', badge: 'Processing', badgeVariant: 'warning' },
            { id: 1007, title: 'Order #1007', meta: 'Eve Davis • $123.45 • 1 item', icon: '📦', badge: 'Cancelled', badgeVariant: 'danger' },
            { id: 1008, title: 'Order #1008', meta: 'Frank Miller • $678.90 • 4 items', icon: '📦', badge: 'Delivered', badgeVariant: 'success' },
            { id: 1009, title: 'Order #1009', meta: 'Grace Lee • $1,890.23 • 6 items', icon: '📦', badge: 'Shipped', badgeVariant: 'info' },
            { id: 1010, title: 'Order #1010', meta: 'Henry Ford • $234.56 • 2 items', icon: '📦', badge: 'Pending' }
        ],
        users: [
            { id: 1, title: 'John Doe', meta: 'john.doe@example.com • Customer', icon: '👤', badge: 'Active', badgeVariant: 'success' },
            { id: 2, title: 'Jane Smith', meta: 'jane.smith@example.com • Admin', icon: '👤', badge: 'Active', badgeVariant: 'success' },
            { id: 3, title: 'Bob Johnson', meta: 'bob.johnson@example.com • Customer', icon: '👤', badge: 'Inactive', badgeVariant: 'warning' },
            { id: 4, title: 'Alice Williams', meta: 'alice.w@example.com • Manager', icon: '👤', badge: 'Active', badgeVariant: 'success' },
            { id: 5, title: 'Charlie Brown', meta: 'charlie.b@example.com • Customer', icon: '👤', badge: 'Active', badgeVariant: 'success' },
            { id: 6, title: 'Diana Prince', meta: 'diana.p@example.com • VIP', icon: '👤', badge: 'Premium', badgeVariant: 'primary' },
            { id: 7, title: 'Eve Davis', meta: 'eve.davis@example.com • Customer', icon: '👤', badge: 'Active', badgeVariant: 'success' },
            { id: 8, title: 'Frank Miller', meta: 'frank.m@example.com • Support', icon: '👤', badge: 'Active', badgeVariant: 'success' },
            { id: 9, title: 'Grace Lee', meta: 'grace.lee@example.com • Customer', icon: '👤', badge: 'New', badgeVariant: 'info' },
            { id: 10, title: 'Henry Ford', meta: 'henry.f@example.com • Customer', icon: '👤', badge: 'Active', badgeVariant: 'success' }
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
        results.innerHTML = '<div class="pa-command-palette__empty">Type to search or use /p for products, /o for orders, /u for users, /i for invoices</div>';
    }

    /**
     * Show loader (inline in results area)
     */
    function showLoader() {
        // Add loading class to results container
        results.classList.add('pa-command-palette__results--loading');

        // If there are no existing results, show loader message
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
                    <span class="pa-badge${item.badgeVariant ? ' pa-badge--' + item.badgeVariant : ''}">${item.badge}</span>
                </div>
            `;
        });

        // Add pagination indicator if multiple pages
        if (totalPages > 1) {
            html += `
                <div class="pa-command-palette__pagination">
                    Page ${page} of ${totalPages} • ${items.length} results
                </div>
            `;
        }

        results.innerHTML = html;

        // Add click handlers to items
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

        // Update context label
        if (context) {
            currentContext = context;
            contextLabel.textContent = context.label;
            contextLabel.classList.add('pa-command-palette__context--visible');
        } else {
            currentContext = null;
            contextLabel.classList.remove('pa-command-palette__context--visible');
        }

        // If no query, show empty state
        if (!searchQuery && !context) {
            renderEmptyState();
            currentResults = [];
            activeIndex = -1;
            hideLoader();
            return;
        }

        // Show loader
        showLoader();

        // Simulate search delay
        setTimeout(() => {
            // Get data based on context
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
                // Search all categories
                data = [
                    ...dummyData.products,
                    ...dummyData.orders,
                    ...dummyData.users,
                    ...dummyData.invoices
                ];
            }

            // Filter results
            currentResults = filterResults(data, searchQuery);
            activeIndex = currentResults.length > 0 ? 0 : -1;
            currentPage = 1;

            // Hide loader and render results
            hideLoader();
            renderResults(currentResults, searchQuery, currentPage);
        }, 300);
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
            // Go to previous page, last item
            currentPage--;
            activeIndex = Math.min((currentPage * resultsPerPage) - 1, currentResults.length - 1);
        } else {
            // Wrap to last page, last item
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
            // Go to next page, first item
            currentPage++;
            activeIndex = (currentPage - 1) * resultsPerPage;
        } else {
            // Wrap to first page, first item
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
        // In real app, navigate to item or trigger action
        alert(`Selected: ${item.title}\n${item.meta}`);
        closePalette();
    }

    /**
     * Global keyboard shortcut (Ctrl+K / Cmd+K)
     */
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K
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
        performSearch(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                closePalette();
                break;

            case 'ArrowUp':
                e.preventDefault();
                navigatePrevious();
                break;

            case 'ArrowDown':
                e.preventDefault();
                navigateNext();
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
                e.preventDefault();
                if (activeIndex >= 0 && currentResults[activeIndex]) {
                    selectItem(currentResults[activeIndex]);
                }
                break;
        }
    });

    } // end init()

})();
