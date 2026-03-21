// Constants
const TMDB_TOKEN = 'YOUR_TOKEN_HERE'; 
const API_BASE_URL = 'https://api.themoviedb.org/3';
// 3. Image Optimization: Using w342 instead of w500 for faster grid loading
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w342'; 

const queryInput = document.getElementById('searchInput');
const movieGrid = document.getElementById('movieGrid');
const statusArea = document.getElementById('statusArea');
const searchButton = document.getElementById('searchIcon');

// Initialize User (No changes needed here)
const initializeUser = () => {
    let userName = localStorage.getItem('movieNightName');
    if (!userName || userName === 'null') {
        userName = prompt('What would you like to be called?') || "Friend";
        localStorage.setItem('movieNightName', userName);
    }
    document.getElementById('userGreeting').innerHTML = `Welcome, <span class="text-blue-400 font-bold">${userName}</span>`;
    document.getElementById('mainHeading').innerHTML = `${userName}, find your next <br> favorite movie`;
};
initializeUser();

const debounce = (func, delay = 500) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const searchMovies = async (query) => {
    const trimmedQuery = query?.trim();
    if (!trimmedQuery) {
        movieGrid.innerHTML = '';
        statusArea.innerHTML = '<p class="text-gray-500 italic">Enter a movie title to get started...</p>';
        return;
    }

    // 4. Caching Strategy: Check sessionStorage before calling the API
    const cacheKey = `search_${trimmedQuery}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        console.log('Serving from cache...');
        renderMovies(JSON.parse(cachedData));
        return;
    }

    statusArea.innerHTML = `<p class="text-blue-400 animate-pulse">Searching for "${trimmedQuery}"...</p>`;
    
    try {
        const response = await axios.get(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(trimmedQuery)}&include_adult=false`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });

        const movies = response.data.results;

        if (movies.length === 0) {
            statusArea.innerHTML = `<p class="text-yellow-500">No movies found for "${trimmedQuery}".</p>`;
            return;
        }

        // Save result to cache
        sessionStorage.setItem(cacheKey, JSON.stringify(movies));
        
        statusArea.innerHTML = '';
        renderMovies(movies);
    } catch (error) {
        statusArea.innerHTML = '<p class="text-red-500 font-bold">❌ Connection Error.</p>';
    }
};

const renderMovies = (movies) => {
    movieGrid.innerHTML = movies.map(movie => {
        const posterUrl = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Poster';
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        
        return `
            <div class="group cursor-pointer animate-in fade-in duration-500">
                <div class="relative overflow-hidden rounded-xl aspect-[2/3] bg-gray-900 border border-gray-800 shadow-lg">
                    <img 
                        src="${posterUrl}" 
                        alt="${movie.title}" 
                        loading="lazy" 
                        decoding="async"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    >
                    <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                        <button onclick="getTrailer(${movie.id})" class="px-5 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition">▶ Watch Trailer</button>
                    </div>
                </div>
                <h3 class="mt-3 font-semibold text-gray-200 truncate">${movie.title}</h3>
                <p class="text-sm text-gray-500">${releaseYear}</p>
            </div>`;
    }).join('');
};

const getTrailer = async (movieId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/movie/${movieId}/videos`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const trailer = response.data.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
        if (trailer) window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
        else alert('No trailer found');
    } catch (e) { alert("Error loading trailer"); }
};

const handleInput = debounce((val) => searchMovies(val), 600);
queryInput.addEventListener('input', (e) => handleInput(e.target.value));