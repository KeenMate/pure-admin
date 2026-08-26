// Movies Panel Page — list with inline detail panel
(function () {
    var tableBody = document.getElementById('moviesTableBody');
    var panel = document.getElementById('movieDetailPanel');
    if (!tableBody || !panel) return; // Not on this page

    var ITEMS_PER_PAGE = 8;
    var currentPage = 1;
    var filteredMovies = [];
    var selectedMovieId = null;

    var searchInput = document.getElementById('movieSearch');
    var genreSelect = document.getElementById('movieGenre');
    var ratingSelect = document.getElementById('movieRating');
    var clearBtn = document.getElementById('movieClearFilters');
    var prevBtn = document.getElementById('moviePrevPage');
    var nextBtn = document.getElementById('movieNextPage');
    var pageInput = document.getElementById('moviePageInput');
    var totalPagesEl = document.getElementById('movieTotalPages');
    var itemCountEl = document.getElementById('movieItemCount');
    var tableCountEl = document.getElementById('movieTableCount');
    var searchClear = document.getElementById('movieSearchClear');
    var panelTitle = document.getElementById('moviePanelTitle');
    var panelBody = document.getElementById('moviePanelBody');
    var table = document.getElementById('moviesTable');

    function getFilteredMovies() {
        var search = (searchInput.value || '').toLowerCase();
        var genre = genreSelect.value;
        var minRating = parseFloat(ratingSelect.value) || 0;

        return window.MOVIE_DATA.filter(function (m) {
            if (search && m.title.toLowerCase().indexOf(search) === -1 && m.director.toLowerCase().indexOf(search) === -1) return false;
            if (genre && m.genre !== genre) return false;
            if (m.rating < minRating) return false;
            return true;
        });
    }

    function getRatingBadgeClass(rating) {
        if (rating >= 9.0) return 'pa-badge--success';
        if (rating >= 8.5) return 'pa-badge--info';
        return 'pa-badge--secondary';
    }

    function render() {
        filteredMovies = getFilteredMovies();
        var totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));
        if (currentPage > totalPages) currentPage = totalPages;

        var start = (currentPage - 1) * ITEMS_PER_PAGE;
        var end = Math.min(start + ITEMS_PER_PAGE, filteredMovies.length);
        var pageMovies = filteredMovies.slice(start, end);

        // Render table rows
        var html = '';
        if (pageMovies.length === 0) {
            html = '<tr><td colspan="6" style="text-align: center; padding: 3rem;">No movies found matching your filters.</td></tr>';
        } else {
            pageMovies.forEach(function (m) {
                var selectedClass = m.id === selectedMovieId ? ' class="is-selected"' : '';
                html += '<tr data-id="' + m.id + '"' + selectedClass + ' onclick="selectMovie(' + m.id + ')" style="cursor: pointer;">';
                html += '<td class="text-nowrap"><strong>' + m.title + '</strong></td>';
                html += '<td class="text-nowrap">' + m.year + '</td>';
                html += '<td class="text-nowrap">' + m.director + '</td>';
                html += '<td class="text-nowrap"><span class="pa-badge">' + m.genre + '</span></td>';
                html += '<td class="text-nowrap"><span class="pa-badge ' + getRatingBadgeClass(m.rating) + '">' + m.rating.toFixed(1) + '</span></td>';
                html += '<td></td>';
                html += '</tr>';
            });
        }
        tableBody.innerHTML = html;

        // Update pager
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        pageInput.value = currentPage;
        pageInput.max = totalPages;
        totalPagesEl.textContent = 'of ' + totalPages;

        // Update counts
        if (filteredMovies.length === 0) {
            itemCountEl.textContent = 'No results';
        } else {
            itemCountEl.textContent = 'Showing ' + (start + 1) + '-' + end + ' of ' + filteredMovies.length + ' movies';
        }
        tableCountEl.textContent = filteredMovies.length + ' movies';

        // Search clear button visibility
        if (searchClear) {
            searchClear.style.display = searchInput.value ? '' : 'none';
        }
    }

    // Select movie and show in panel
    window.selectMovie = function (id) {
        var movie = window.MOVIE_DATA.find(function (m) { return m.id === id; });
        if (!movie) return;

        selectedMovieId = id;

        // Update row selection
        table.querySelectorAll('tbody tr').forEach(function (tr) {
            tr.classList.remove('is-selected');
        });
        var row = table.querySelector('tr[data-id="' + id + '"]');
        if (row) row.classList.add('is-selected');

        // Open panel
        panel.classList.add('pa-detail-view__panel--open');

        // Show loading
        panelTitle.textContent = 'Loading\u2026';
        panelBody.innerHTML = '<div class="pa-loader-center" style="padding: 4rem 0;"><div class="pa-spinner"></div></div>';

        // Simulate loading delay
        setTimeout(function () {
            panelTitle.textContent = movie.title;
            panelBody.innerHTML = renderMovieDetails(movie);
        }, 300);
    };

    function renderMovieDetails(movie) {
        var actorsHtml = '';
        if (movie.actors && movie.actors.length > 0) {
            actorsHtml = '<div class="pa-field-group">' +
                '<div class="pa-field-group__title">Cast</div>' +
                '<div class="pa-fields pa-fields--compact">';
            movie.actors.forEach(function (actor) {
                actorsHtml += '<div class="pa-field">' +
                    '<span class="pa-field__label">' + actor.role + '</span>' +
                    '<span class="pa-field__value">' + actor.name + '</span>' +
                '</div>';
            });
            actorsHtml += '</div></div>';
        }

        return '<div class="pa-field-group">' +
            '<div class="pa-field-group__title">Movie Info</div>' +
            '<div class="pa-fields pa-fields--cols-2">' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Year</span>' +
                    '<span class="pa-field__value">' + movie.year + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Director</span>' +
                    '<span class="pa-field__value">' + movie.director + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Genre</span>' +
                    '<span class="pa-field__value"><span class="pa-badge">' + movie.genre + '</span></span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Rating</span>' +
                    '<span class="pa-field__value"><span class="pa-badge ' + getRatingBadgeClass(movie.rating) + '">' + movie.rating.toFixed(1) + ' / 10</span></span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Runtime</span>' +
                    '<span class="pa-field__value">' + movie.runtime + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Language</span>' +
                    '<span class="pa-field__value">' + movie.language + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="pa-field-group">' +
            '<div class="pa-field-group__title">Plot</div>' +
            '<div class="pa-fields">' +
                '<div class="pa-field">' +
                    '<span class="pa-field__value">' + movie.plot + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="pa-field-group">' +
            '<div class="pa-field-group__title">Box Office</div>' +
            '<div class="pa-fields pa-fields--cols-2">' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Budget</span>' +
                    '<span class="pa-field__value">' + movie.budget + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Box Office</span>' +
                    '<span class="pa-field__value">' + movie.boxOffice + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        actorsHtml +
        '<div class="pa-field-group">' +
            '<div class="pa-field-group__title">Actions</div>' +
            '<div class="pa-btn-group">' +
                '<a href="/showcases/movies/detail?id=' + movie.id + '" class="pa-btn pa-btn--primary pa-btn--sm"><i class="fas fa-external-link-alt"></i> Full Details</a>' +
            '</div>' +
        '</div>';
    }

    window.closeMoviePanel = function () {
        panel.classList.remove('pa-detail-view__panel--open');
        selectedMovieId = null;
        table.querySelectorAll('tbody tr').forEach(function (tr) {
            tr.classList.remove('is-selected');
        });
    };

    // Event listeners
    searchInput.addEventListener('input', function () { currentPage = 1; render(); });
    genreSelect.addEventListener('change', function () { currentPage = 1; render(); });
    ratingSelect.addEventListener('change', function () { currentPage = 1; render(); });

    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        genreSelect.value = '';
        ratingSelect.value = '';
        currentPage = 1;
        render();
    });

    prevBtn.addEventListener('click', function () {
        if (currentPage > 1) { currentPage--; render(); }
    });

    nextBtn.addEventListener('click', function () {
        var totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) { currentPage++; render(); }
    });

    pageInput.addEventListener('change', function () {
        var totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));
        var val = parseInt(this.value) || 1;
        if (val < 1) val = 1;
        if (val > totalPages) val = totalPages;
        currentPage = val;
        render();
    });

    if (searchClear) {
        searchClear.addEventListener('click', function () {
            searchInput.value = '';
            currentPage = 1;
            render();
        });
    }

    // Escape key to close panel
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('pa-detail-view__panel--open')) {
            window.closeMoviePanel();
        }
    });

    // Resize handle
    var resizeHandle = panel.querySelector('.pa-detail-panel-resize');
    if (resizeHandle) {
        var isResizing = false;
        var startX = 0;
        var startWidth = 0;

        resizeHandle.addEventListener('mousedown', function (e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = panel.offsetWidth;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isResizing) return;
            var isRTL = document.documentElement.dir === 'rtl';
            var diff = isRTL ? (e.clientX - startX) : (startX - e.clientX);
            var newWidth = startWidth + diff;
            newWidth = Math.max(280, Math.min(640, newWidth));
            panel.style.setProperty('--pc-local-detail-panel-width', newWidth + 'px');
        });

        document.addEventListener('mouseup', function () {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    // Initial render
    render();
})();
