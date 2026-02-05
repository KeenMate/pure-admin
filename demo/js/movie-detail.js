// Movie Detail Page — renders info cards + actor panel logic
(function () {
    var basicInfoEl = document.getElementById('movieBasicInfo');
    if (!basicInfoEl) return; // Not on detail page

    var technicalInfoEl = document.getElementById('movieTechnicalInfo');
    var actorsTableBody = document.getElementById('movieActorsBody');
    var movieTitleEl = document.getElementById('movieTitle');
    var actorPanel = document.getElementById('actorDetailPanel');
    var actorPanelTitle = document.getElementById('actorPanelTitle');
    var actorPanelBody = document.getElementById('actorPanelBody');
    var castTable = document.getElementById('movieCastTable');

    // Get movie ID from URL
    var params = new URLSearchParams(window.location.search);
    var movieId = parseInt(params.get('id'));
    var movie = null;

    if (window.MOVIE_DATA) {
        movie = window.MOVIE_DATA.find(function (m) { return m.id === movieId; });
    }

    if (!movie) {
        basicInfoEl.innerHTML = '<p>Movie not found. <a href="/movies">Back to Movies</a></p>';
        return;
    }

    // Set page title
    if (movieTitleEl) {
        movieTitleEl.textContent = movie.title;
    }

    // Rating badge class
    function getRatingBadgeClass(rating) {
        if (rating >= 9.0) return 'pa-badge--success';
        if (rating >= 8.5) return 'pa-badge--info';
        return 'pa-badge--secondary';
    }

    // Render basic info
    basicInfoEl.innerHTML =
        '<div class="pa-fields pa-fields--cols-2">' +
            '<div class="pa-field">' +
                '<span class="pa-field__label">Title</span>' +
                '<span class="pa-field__value"><strong>' + movie.title + '</strong></span>' +
            '</div>' +
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
            '<div class="pa-field pa-field--full">' +
                '<span class="pa-field__label">Plot Summary</span>' +
                '<span class="pa-field__value">' + movie.plot + '</span>' +
            '</div>' +
        '</div>';

    // Render technical details
    if (technicalInfoEl) {
        technicalInfoEl.innerHTML =
            '<div class="pa-fields pa-fields--cols-2">' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Runtime</span>' +
                    '<span class="pa-field__value">' + movie.runtime + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Language</span>' +
                    '<span class="pa-field__value">' + movie.language + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Country</span>' +
                    '<span class="pa-field__value">' + movie.country + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Budget</span>' +
                    '<span class="pa-field__value">' + movie.budget + '</span>' +
                '</div>' +
                '<div class="pa-field">' +
                    '<span class="pa-field__label">Box Office</span>' +
                    '<span class="pa-field__value">' + movie.boxOffice + '</span>' +
                '</div>' +
            '</div>';
    }

    // Render actors table
    if (actorsTableBody && movie.actors) {
        var html = '';
        movie.actors.forEach(function (actor) {
            html += '<tr data-actor-id="' + actor.id + '" onclick="selectActor(' + actor.id + ')" style="cursor: pointer;">';
            html += '<td>' + actor.name + '</td>';
            html += '<td>' + actor.role + '</td>';
            html += '<td>' + actor.nationality + '</td>';
            html += '</tr>';
        });
        actorsTableBody.innerHTML = html;
    }

    // Actor panel logic
    var loadTimer = null;

    window.selectActor = function (actorId) {
        var actor = movie.actors.find(function (a) { return a.id === actorId; });
        if (!actor || !actorPanel) return;

        // Open panel
        actorPanel.classList.add('pa-detail-view__panel--open');

        // Mark row selected
        if (castTable) {
            castTable.querySelectorAll('tbody tr').forEach(function (tr) {
                tr.classList.remove('is-selected');
            });
            var row = castTable.querySelector('tr[data-actor-id="' + actorId + '"]');
            if (row) row.classList.add('is-selected');
        }

        // Show loading spinner
        if (actorPanelTitle) actorPanelTitle.textContent = 'Loading\u2026';
        if (actorPanelBody) {
            actorPanelBody.innerHTML =
                '<div class="pa-loader-center" style="padding: 4rem 0;">' +
                    '<div class="pa-spinner"></div>' +
                '</div>';
        }

        // Simulate loading delay
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(function () {
            if (actorPanelTitle) actorPanelTitle.textContent = actor.name;
            if (actorPanelBody) {
                var initial = actor.name.charAt(0);
                actorPanelBody.innerHTML =
                    '<div style="display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.6rem;">' +
                        '<div style="width: 5.6rem; height: 5.6rem; border-radius: 50%; background: var(--pa-accent-light, #e8eaf6); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; color: var(--pa-accent, #3b82f6); flex-shrink: 0; font-weight: 600;">' +
                            initial +
                        '</div>' +
                        '<div>' +
                            '<div style="font-weight: 600; font-size: 1.6rem; color: var(--pa-text-color-1);">' + actor.name + '</div>' +
                            '<div style="color: var(--pa-text-color-2); font-size: 1.3rem;">' + actor.role + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="pa-fields">' +
                        '<div class="pa-field">' +
                            '<span class="pa-field__label">Born</span>' +
                            '<span class="pa-field__value">' + actor.born + '</span>' +
                        '</div>' +
                        '<div class="pa-field">' +
                            '<span class="pa-field__label">Nationality</span>' +
                            '<span class="pa-field__value">' + actor.nationality + '</span>' +
                        '</div>' +
                        '<div class="pa-field">' +
                            '<span class="pa-field__label">Known For</span>' +
                            '<span class="pa-field__value">' + actor.knownFor + '</span>' +
                        '</div>' +
                        '<div class="pa-field">' +
                            '<span class="pa-field__label">Bio</span>' +
                            '<span class="pa-field__value">' + actor.bio + '</span>' +
                        '</div>' +
                    '</div>';
            }
            loadTimer = null;
        }, 500);
    };

    window.closeActorPanel = function () {
        if (loadTimer) {
            clearTimeout(loadTimer);
            loadTimer = null;
        }
        if (actorPanel) {
            actorPanel.classList.remove('pa-detail-view__panel--open');
        }
        if (castTable) {
            castTable.querySelectorAll('tbody tr').forEach(function (tr) {
                tr.classList.remove('is-selected');
            });
        }
    };

    // Escape key to close panel
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && actorPanel && actorPanel.classList.contains('pa-detail-view__panel--open')) {
            window.closeActorPanel();
        }
    });

    // Resize handle
    var resizeHandle = actorPanel ? actorPanel.querySelector('.pa-detail-panel-resize') : null;
    if (resizeHandle && actorPanel) {
        var isResizing = false;
        var startX = 0;
        var startWidth = 0;

        resizeHandle.addEventListener('mousedown', function (e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = actorPanel.offsetWidth;
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
            actorPanel.style.setProperty('--pa-local-detail-panel-width', newWidth + 'px');
        });

        document.addEventListener('mouseup', function () {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
})();
