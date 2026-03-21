const userGreeting = document.getElementById('userGreeting');
const mainHeading = document.getElementById('mainHeading');

const initializeUser = () => {
    let userName = localStorage.getItem('movieNightName');
    if (!userName || userName === 'null') {
        userName = prompt('Welcome aboard! What would you like to be called?');
        userName = userName ? userName.trim() : "Friend";
        localStorage.setItem('movieNightName', userName);
    }
    userGreeting.innerHTML = `Welcome, <span class="text-blue-400 font-bold">${userName}</span>`;
    mainHeading.innerHTML = `${userName}, find your next <br> favorite movie`;
};
initializeUser();

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNTJiMWQyNWQ4OTdkYjU2MDA1YWY2YmRmZmEwNDg2NSIsIm5iZiI6MTc3MzEzNzYwNS44NDA5OTk4LCJzdWIiOiI2OWFmZWVjNTJjOTJjYTg5Y2ZjMWViYjUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qoCm2J_A3aqi7Tat-_4rRaRkC5ZaYxdEGMikswbp31s';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w342';
const API_BASE_URL = 'https://api.themoviedb.org/3';

const queryInput = document.getElementById('searchInput');
const movieGrid = document.getElementById('movieGrid');
const statusArea = document.getElementById('statusArea');
const searchButton = document.getElementById('searchIcon');

const debounce = (func, delay = 500) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const searchMovies = async (query) => {
    if (!query || !query.trim()) {
        movieGrid.innerHTML = '';
        statusArea.innerHTML = '<p class="text-gray-500 italic">Enter a movie title to get started...</p>';
        return;
    }

    statusArea.innerHTML = `
        <div class="flex flex-col items-center justify-center gap-4 py-10">
            <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-blue-400 font-medium tracking-wide">Searching for "${query}"...</p>
        </div>`;
    
    movieGrid.innerHTML = '';

    try {
        const response = await axios.get(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_TOKEN}`
            }
        });

        const movies = response.data.results;

        if (movies.length === 0) {
            statusArea.innerHTML = `<p class="text-yellow-500 text-lg font-medium">Hmm, we couldn't find any movies matching "${query}".</p>`;
            return;
        }

        statusArea.innerHTML = '';
        renderMovies(movies);
    } catch (error) {
        console.error(error);
        statusArea.innerHTML = '<p class="text-red-500 font-bold">❌ Error connecting to TMDB. Check your token or internet.</p>';
    }
};

const renderMovies = (movies) => {
    movieGrid.innerHTML = movies.map(movie => {
        const posterUrl = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const brief = movie.overview ? movie.overview.substring(0, 150) + '...' : "No description available";
        
        return `
            <div class="group cursor-pointer">
                <div class="relative overflow-hidden rounded-xl aspect-[2/3] bg-gray-900 border border-gray-800 shadow-lg">
                    <img src="${posterUrl}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                        <p class="text-xs text-blue-400 mb-2 font-bold uppercase tracking-widest">Rating: ${movie.vote_average.toFixed(1)}/10</p>
                        <p class="text-xs text-gray-300 mb-6 italic leading-relaxed">"${brief}"</p>
                        <button onclick="getTrailer(${movie.id})" class="px-5 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition shadow-lg">▶ Watch Trailer</button>
                    </div>
                </div>
                <h3 class="mt-3 font-semibold text-gray-200 truncate">${movie.title}</h3>
                <p class="text-sm text-gray-500">${releaseYear}</p>
            </div>`;
    }).join('');
};

const getTrailer = async (movieId) => {
    const videoURL = `${API_BASE_URL}/movie/${movieId}/videos`;
    try {
        const response = await axios.get(videoURL, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const videos = response.data.results;
        const trailer = videos.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');

        if (trailer) {
            window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
        } else {
            alert('Sorry, no official trailer was found for this title');
        }
    } catch (error) {
        console.error("Error fetching trailer:", error);
        alert("Could not load trailer at this time");
    }
};

const handleInput = debounce((val) => searchMovies(val), 800);
queryInput.addEventListener('input', (e) => handleInput(e.target.value));

queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchMovies(queryInput.value);
});

searchButton.addEventListener('click', () => searchMovies(queryInput.value));