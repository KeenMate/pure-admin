// Shared movie data + list page filter/pager logic
window.MOVIE_DATA = [
    {
        id: 1,
        title: 'The Shawshank Redemption',
        year: 1994,
        director: 'Frank Darabont',
        genre: 'Drama',
        rating: 9.3,
        runtime: '142 min',
        language: 'English',
        country: 'USA',
        budget: '$25 million',
        boxOffice: '$58.3 million',
        plot: 'A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.',
        actors: [
            { id: 1, name: 'Tim Robbins', role: 'Andy Dufresne', born: 'October 16, 1958', nationality: 'American', knownFor: 'The Shawshank Redemption, Mystic River, The Player', bio: 'Timothy Francis Robbins is an American actor and filmmaker. He has received several accolades including an Academy Award for Best Supporting Actor.' },
            { id: 2, name: 'Morgan Freeman', role: 'Ellis "Red" Redding', born: 'June 1, 1937', nationality: 'American', knownFor: 'The Shawshank Redemption, Se7en, The Dark Knight', bio: 'Morgan Freeman is an American actor, producer, and narrator known for his distinctive deep voice and a wide range of film roles.' },
            { id: 3, name: 'Bob Gunton', role: 'Warden Norton', born: 'November 15, 1945', nationality: 'American', knownFor: 'The Shawshank Redemption, Daredevil, Patch Adams', bio: 'Robert Patrick Gunton Jr. is an American actor known for playing stern authority figures in film and television.' },
            { id: 4, name: 'William Sadler', role: 'Heywood', born: 'April 13, 1950', nationality: 'American', knownFor: 'The Shawshank Redemption, Die Hard 2, Bill & Ted', bio: 'William Thomas Sadler is an American actor known for his versatile roles in both film and television.' }
        ]
    },
    {
        id: 2,
        title: 'The Godfather',
        year: 1972,
        director: 'Francis Ford Coppola',
        genre: 'Crime',
        rating: 9.2,
        runtime: '175 min',
        language: 'English, Italian',
        country: 'USA',
        budget: '$6 million',
        boxOffice: '$250 million',
        plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son, who must navigate a world of violence, loyalty, and betrayal.',
        actors: [
            { id: 5, name: 'Marlon Brando', role: 'Don Vito Corleone', born: 'April 3, 1924', nationality: 'American', knownFor: 'The Godfather, A Streetcar Named Desire, Apocalypse Now', bio: 'Marlon Brando Jr. was an American actor considered one of the most influential actors of the 20th century.' },
            { id: 6, name: 'Al Pacino', role: 'Michael Corleone', born: 'April 25, 1940', nationality: 'American', knownFor: 'The Godfather, Scarface, Scent of a Woman', bio: 'Alfredo James Pacino is an American actor and filmmaker regarded as one of the greatest and most influential actors of all time.' },
            { id: 7, name: 'James Caan', role: 'Sonny Corleone', born: 'March 26, 1940', nationality: 'American', knownFor: 'The Godfather, Misery, Elf', bio: 'James Edmund Caan was an American actor known for his tough-guy roles and his portrayal of Sonny Corleone.' },
            { id: 8, name: 'Robert Duvall', role: 'Tom Hagen', born: 'January 5, 1931', nationality: 'American', knownFor: 'The Godfather, Apocalypse Now, The Judge', bio: 'Robert Selden Duvall is an American actor and filmmaker with a career spanning over six decades.' }
        ]
    },
    {
        id: 3,
        title: 'The Dark Knight',
        year: 2008,
        director: 'Christopher Nolan',
        genre: 'Action',
        rating: 9.0,
        runtime: '152 min',
        language: 'English',
        country: 'USA, UK',
        budget: '$185 million',
        boxOffice: '$1.006 billion',
        plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        actors: [
            { id: 9, name: 'Christian Bale', role: 'Bruce Wayne / Batman', born: 'January 30, 1974', nationality: 'British', knownFor: 'The Dark Knight, American Psycho, The Fighter', bio: 'Christian Charles Philip Bale is a British actor known for his versatility and intense method acting.' },
            { id: 10, name: 'Heath Ledger', role: 'The Joker', born: 'April 4, 1979', nationality: 'Australian', knownFor: 'The Dark Knight, Brokeback Mountain, 10 Things I Hate About You', bio: 'Heath Andrew Ledger was an Australian actor and music video director. His portrayal of the Joker earned a posthumous Academy Award.' },
            { id: 11, name: 'Aaron Eckhart', role: 'Harvey Dent', born: 'March 12, 1968', nationality: 'American', knownFor: 'The Dark Knight, Thank You for Smoking, Sully', bio: 'Aaron Edward Eckhart is an American actor known for dramatic roles in independent and mainstream films.' }
        ]
    },
    {
        id: 4,
        title: 'Pulp Fiction',
        year: 1994,
        director: 'Quentin Tarantino',
        genre: 'Crime',
        rating: 8.9,
        runtime: '154 min',
        language: 'English, Spanish, French',
        country: 'USA',
        budget: '$8 million',
        boxOffice: '$213.9 million',
        plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption set in the criminal underworld of Los Angeles.',
        actors: [
            { id: 12, name: 'John Travolta', role: 'Vincent Vega', born: 'February 18, 1954', nationality: 'American', knownFor: 'Pulp Fiction, Grease, Saturday Night Fever', bio: 'John Joseph Travolta is an American actor and dancer known for his iconic roles in both drama and musical films.' },
            { id: 13, name: 'Uma Thurman', role: 'Mia Wallace', born: 'April 29, 1970', nationality: 'American', knownFor: 'Pulp Fiction, Kill Bill, Gattaca', bio: 'Uma Karuna Thurman is an American actress and model known for her roles in Quentin Tarantino films.' },
            { id: 14, name: 'Samuel L. Jackson', role: 'Jules Winnfield', born: 'December 21, 1948', nationality: 'American', knownFor: 'Pulp Fiction, Django Unchained, The Avengers', bio: 'Samuel Leroy Jackson is an American actor and producer. One of the most widely recognized actors of his generation.' }
        ]
    },
    {
        id: 5,
        title: 'Inception',
        year: 2010,
        director: 'Christopher Nolan',
        genre: 'Sci-Fi',
        rating: 8.8,
        runtime: '148 min',
        language: 'English, Japanese, French',
        country: 'USA, UK',
        budget: '$160 million',
        boxOffice: '$836.8 million',
        plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
        actors: [
            { id: 15, name: 'Leonardo DiCaprio', role: 'Dom Cobb', born: 'November 11, 1974', nationality: 'American', knownFor: 'Inception, Titanic, The Revenant', bio: 'Leonardo Wilhelm DiCaprio is an American actor and film producer known for his work in biographical and period films.' },
            { id: 16, name: 'Joseph Gordon-Levitt', role: 'Arthur', born: 'February 17, 1981', nationality: 'American', knownFor: 'Inception, 500 Days of Summer, The Dark Knight Rises', bio: 'Joseph Leonard Gordon-Levitt is an American actor and filmmaker who has been acting since childhood.' },
            { id: 17, name: 'Elliot Page', role: 'Ariadne', born: 'February 21, 1987', nationality: 'Canadian', knownFor: 'Inception, Juno, The Umbrella Academy', bio: 'Elliot Page is a Canadian actor and producer, known for both independent and mainstream film work.' },
            { id: 18, name: 'Tom Hardy', role: 'Eames', born: 'September 15, 1977', nationality: 'British', knownFor: 'Inception, Mad Max: Fury Road, The Dark Knight Rises', bio: 'Edward Thomas Hardy is a British actor and producer known for his roles in blockbuster films and independent productions.' }
        ]
    },
    {
        id: 6,
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genre: 'Sci-Fi',
        rating: 8.7,
        runtime: '136 min',
        language: 'English',
        country: 'USA, Australia',
        budget: '$63 million',
        boxOffice: '$467.2 million',
        plot: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth — the life he knows is the elaborate deception of an evil cyber-intelligence.',
        actors: [
            { id: 19, name: 'Keanu Reeves', role: 'Neo', born: 'September 2, 1964', nationality: 'Canadian', knownFor: 'The Matrix, John Wick, Speed', bio: 'Keanu Charles Reeves is a Canadian actor known for his roles in action and science fiction films.' },
            { id: 20, name: 'Laurence Fishburne', role: 'Morpheus', born: 'July 30, 1961', nationality: 'American', knownFor: 'The Matrix, Boyz n the Hood, John Wick', bio: 'Laurence John Fishburne III is an American actor, playwright, producer, screenwriter, and film director.' },
            { id: 21, name: 'Carrie-Anne Moss', role: 'Trinity', born: 'August 21, 1967', nationality: 'Canadian', knownFor: 'The Matrix, Memento, Jessica Jones', bio: 'Carrie-Anne Moss is a Canadian actress best known for her role as Trinity in The Matrix franchise.' }
        ]
    },
    {
        id: 7,
        title: 'Forrest Gump',
        year: 1994,
        director: 'Robert Zemeckis',
        genre: 'Drama',
        rating: 8.8,
        runtime: '142 min',
        language: 'English',
        country: 'USA',
        budget: '$55 million',
        boxOffice: '$678.2 million',
        plot: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
        actors: [
            { id: 22, name: 'Tom Hanks', role: 'Forrest Gump', born: 'July 9, 1956', nationality: 'American', knownFor: 'Forrest Gump, Cast Away, Saving Private Ryan', bio: 'Thomas Jeffrey Hanks is an American actor and filmmaker regarded as an American cultural icon.' },
            { id: 23, name: 'Robin Wright', role: 'Jenny Curran', born: 'April 8, 1966', nationality: 'American', knownFor: 'Forrest Gump, House of Cards, The Princess Bride', bio: 'Robin Gayle Wright is an American actress and director known for both film and television roles.' },
            { id: 24, name: 'Gary Sinise', role: 'Lt. Dan Taylor', born: 'March 17, 1955', nationality: 'American', knownFor: 'Forrest Gump, Apollo 13, CSI: NY', bio: 'Gary Alan Sinise is an American actor, director, and musician. He received an Academy Award nomination for Forrest Gump.' }
        ]
    },
    {
        id: 8,
        title: 'The Grand Budapest Hotel',
        year: 2014,
        director: 'Wes Anderson',
        genre: 'Comedy',
        rating: 8.1,
        runtime: '99 min',
        language: 'English, French, German',
        country: 'USA, Germany',
        budget: '$25 million',
        boxOffice: '$174.6 million',
        plot: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.',
        actors: [
            { id: 25, name: 'Ralph Fiennes', role: 'M. Gustave', born: 'December 22, 1962', nationality: 'British', knownFor: 'The Grand Budapest Hotel, Schindler\'s List, Harry Potter', bio: 'Ralph Nathaniel Twisleton-Wykeham-Fiennes is a British actor, director, and producer with an extensive career in both film and theatre.' },
            { id: 26, name: 'Tony Revolori', role: 'Zero Moustafa', born: 'April 28, 1996', nationality: 'American', knownFor: 'The Grand Budapest Hotel, Spider-Man: Homecoming', bio: 'Tony Revolori is an American actor of Guatemalan descent, best known for his role as Zero in The Grand Budapest Hotel.' },
            { id: 27, name: 'Saoirse Ronan', role: 'Agatha', born: 'April 12, 1994', nationality: 'Irish-American', knownFor: 'The Grand Budapest Hotel, Lady Bird, Little Women', bio: 'Saoirse Una Ronan is an Irish and American actress. She has received several accolades, including a Golden Globe Award.' }
        ]
    },
    {
        id: 9,
        title: 'Interstellar',
        year: 2014,
        director: 'Christopher Nolan',
        genre: 'Sci-Fi',
        rating: 8.7,
        runtime: '169 min',
        language: 'English',
        country: 'USA, UK, Canada',
        budget: '$165 million',
        boxOffice: '$701.7 million',
        plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft along with a team of researchers to find a new planet for humans.',
        actors: [
            { id: 28, name: 'Matthew McConaughey', role: 'Joseph Cooper', born: 'November 4, 1969', nationality: 'American', knownFor: 'Interstellar, Dallas Buyers Club, True Detective', bio: 'Matthew David McConaughey is an American actor and producer who gained fame through a series of romantic comedies before transitioning to dramatic roles.' },
            { id: 29, name: 'Anne Hathaway', role: 'Dr. Amelia Brand', born: 'November 12, 1982', nationality: 'American', knownFor: 'Interstellar, Les Miserables, The Dark Knight Rises', bio: 'Anne Jacqueline Hathaway is an American actress who has received numerous awards, including an Academy Award and a Golden Globe.' },
            { id: 30, name: 'Jessica Chastain', role: 'Murph (adult)', born: 'March 24, 1977', nationality: 'American', knownFor: 'Interstellar, Zero Dark Thirty, The Help', bio: 'Jessica Michelle Chastain is an American actress and producer known for her roles in films with feminist themes.' }
        ]
    },
    {
        id: 10,
        title: 'Goodfellas',
        year: 1990,
        director: 'Martin Scorsese',
        genre: 'Crime',
        rating: 8.7,
        runtime: '146 min',
        language: 'English, Italian',
        country: 'USA',
        budget: '$25 million',
        boxOffice: '$46.8 million',
        plot: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.',
        actors: [
            { id: 31, name: 'Robert De Niro', role: 'Jimmy Conway', born: 'August 17, 1943', nationality: 'American', knownFor: 'Goodfellas, Taxi Driver, Raging Bull', bio: 'Robert Anthony De Niro Jr. is an American actor and producer who is considered one of the greatest actors of all time.' },
            { id: 32, name: 'Ray Liotta', role: 'Henry Hill', born: 'December 18, 1954', nationality: 'American', knownFor: 'Goodfellas, Field of Dreams, Cop Land', bio: 'Raymond Allen Liotta was an American actor, best known for his portrayal of real-life mobster Henry Hill in Goodfellas.' },
            { id: 33, name: 'Joe Pesci', role: 'Tommy DeVito', born: 'February 9, 1943', nationality: 'American', knownFor: 'Goodfellas, My Cousin Vinny, Home Alone', bio: 'Joseph Frank Pesci is an American actor known for his roles as volatile, tough characters in crime films.' }
        ]
    },
    {
        id: 11,
        title: 'Fight Club',
        year: 1999,
        director: 'David Fincher',
        genre: 'Drama',
        rating: 8.8,
        runtime: '139 min',
        language: 'English',
        country: 'USA, Germany',
        budget: '$63 million',
        boxOffice: '$101.2 million',
        plot: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much more, challenging the very foundations of consumer society.',
        actors: [
            { id: 34, name: 'Brad Pitt', role: 'Tyler Durden', born: 'December 18, 1963', nationality: 'American', knownFor: 'Fight Club, Se7en, Once Upon a Time in Hollywood', bio: 'William Bradley Pitt is an American actor and film producer known for both his leading man roles and his character work.' },
            { id: 35, name: 'Edward Norton', role: 'The Narrator', born: 'August 18, 1969', nationality: 'American', knownFor: 'Fight Club, American History X, Birdman', bio: 'Edward Harrison Norton is an American actor known for his roles in acclaimed films spanning multiple genres.' },
            { id: 36, name: 'Helena Bonham Carter', role: 'Marla Singer', born: 'May 26, 1966', nationality: 'British', knownFor: 'Fight Club, Harry Potter, The King\'s Speech', bio: 'Helena Bonham Carter is a British actress with a diverse career spanning period dramas, fantasy films, and dark comedies.' }
        ]
    },
    {
        id: 12,
        title: 'The Big Lebowski',
        year: 1998,
        director: 'Joel Coen',
        genre: 'Comedy',
        rating: 8.1,
        runtime: '117 min',
        language: 'English, German',
        country: 'USA, UK',
        budget: '$15 million',
        boxOffice: '$46.2 million',
        plot: 'Jeff "The Dude" Lebowski, mistaken for a millionaire of the same name, seeks restitution for his ruined rug and becomes entangled in a complicated kidnapping scheme.',
        actors: [
            { id: 37, name: 'Jeff Bridges', role: 'Jeffrey "The Dude" Lebowski', born: 'December 4, 1949', nationality: 'American', knownFor: 'The Big Lebowski, Crazy Heart, True Grit', bio: 'Jeffrey Leon Bridges is an American actor, singer, and producer. He comes from a prominent acting family.' },
            { id: 38, name: 'John Goodman', role: 'Walter Sobchak', born: 'June 20, 1952', nationality: 'American', knownFor: 'The Big Lebowski, Monsters Inc., 10 Cloverfield Lane', bio: 'John Stephen Goodman is an American actor known for his roles in both comedic and dramatic productions.' },
            { id: 39, name: 'Steve Buscemi', role: 'Theodore Donald "Donny" Kerabatsos', born: 'December 13, 1957', nationality: 'American', knownFor: 'The Big Lebowski, Fargo, Boardwalk Empire', bio: 'Steven Vincent Buscemi is an American actor, director, and former firefighter known for his distinctive appearance and versatile acting.' }
        ]
    }
];

// ─── List Page Logic ───────────────────────────────────────────────
(function () {
    var tableBody = document.getElementById('moviesTableBody');
    if (!tableBody) return; // Not on list page

    var ITEMS_PER_PAGE = 5;
    var currentPage = 1;
    var filteredMovies = [];

    var searchInput = document.getElementById('movieSearch');
    var genreSelect = document.getElementById('movieGenre');
    var yearFromSelect = document.getElementById('movieYearFrom');
    var yearToSelect = document.getElementById('movieYearTo');
    var ratingSelect = document.getElementById('movieRating');
    var clearBtn = document.getElementById('movieClearFilters');
    var prevBtn = document.getElementById('moviePrevPage');
    var nextBtn = document.getElementById('movieNextPage');
    var pageInput = document.getElementById('moviePageInput');
    var totalPagesEl = document.getElementById('movieTotalPages');
    var itemCountEl = document.getElementById('movieItemCount');
    var tableCountEl = document.getElementById('movieTableCount');
    var searchClear = document.getElementById('movieSearchClear');

    function getFilteredMovies() {
        var search = (searchInput.value || '').toLowerCase();
        var genre = genreSelect.value;
        var yearFrom = parseInt(yearFromSelect.value) || 0;
        var yearTo = parseInt(yearToSelect.value) || 9999;
        var minRating = parseFloat(ratingSelect.value) || 0;

        return window.MOVIE_DATA.filter(function (m) {
            if (search && m.title.toLowerCase().indexOf(search) === -1 && m.director.toLowerCase().indexOf(search) === -1) return false;
            if (genre && m.genre !== genre) return false;
            if (m.year < yearFrom || m.year > yearTo) return false;
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
            html = '<tr><td colspan="7" style="text-align: center; padding: 3rem;">No movies found matching your filters.</td></tr>';
        } else {
            pageMovies.forEach(function (m) {
                html += '<tr onclick="window.location.href=\'/movies/detail?id=' + m.id + '\'" style="cursor: pointer;">';
                html += '<td><a href="/movies/detail?id=' + m.id + '" class="pa-btn pa-btn--outline-primary pa-btn--xs" onclick="event.stopPropagation()">View</a></td>';
                html += '<td><strong>' + m.title + '</strong></td>';
                html += '<td>' + m.year + '</td>';
                html += '<td>' + m.director + '</td>';
                html += '<td><span class="pa-badge">' + m.genre + '</span></td>';
                html += '<td><span class="pa-badge ' + getRatingBadgeClass(m.rating) + '">' + m.rating.toFixed(1) + '</span></td>';
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

    // Event listeners
    searchInput.addEventListener('input', function () { currentPage = 1; render(); });
    genreSelect.addEventListener('change', function () { currentPage = 1; render(); });
    yearFromSelect.addEventListener('change', function () { currentPage = 1; render(); });
    yearToSelect.addEventListener('change', function () { currentPage = 1; render(); });
    ratingSelect.addEventListener('change', function () { currentPage = 1; render(); });

    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        genreSelect.value = '';
        yearFromSelect.value = '';
        yearToSelect.value = '';
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

    // Initial render
    render();
})();
