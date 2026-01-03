import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_IMAGE_URL = process.env.TMDB_IMAGE_URL;

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: TMDB_API_KEY
    }
});

// Get trending movies
export const getTrending = async (timeWindow = 'week') => {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data;
};

// Get popular movies
export const getPopular = async (page = 1) => {
    const response = await tmdbApi.get('/movie/popular', { params: { page } });
    return response.data;
};

// Get top rated movies
export const getTopRated = async (page = 1) => {
    const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
    return response.data;
};

// Get upcoming movies
export const getUpcoming = async (page = 1) => {
    const response = await tmdbApi.get('/movie/upcoming', { params: { page } });
    return response.data;
};

// Get now playing movies
export const getNowPlaying = async (page = 1) => {
    const response = await tmdbApi.get('/movie/now_playing', { params: { page } });
    return response.data;
};

// Get movie details
export const getMovieDetails = async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
};

// Get movie credits (cast & crew)
export const getMovieCredits = async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
};

// Get movie videos (trailers)
export const getMovieVideos = async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    return response.data;
};

// Get similar movies
export const getSimilarMovies = async (movieId, page = 1) => {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, { params: { page } });
    return response.data;
};

// Get movie images
export const getMovieImages = async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/images`);
    return response.data;
};

// Search movies
export const searchMovies = async (query, page = 1) => {
    const response = await tmdbApi.get('/search/movie', { params: { query, page } });
    return response.data;
};

// Search multi (movies, TV, people)
export const searchMulti = async (query, page = 1) => {
    const response = await tmdbApi.get('/search/multi', { params: { query, page } });
    return response.data;
};

// Get movies by genre
export const getMoviesByGenre = async (genreId, page = 1) => {
    const response = await tmdbApi.get('/discover/movie', {
        params: {
            with_genres: genreId,
            page,
            sort_by: 'popularity.desc'
        }
    });
    return response.data;
};

// Discover movies with filters
export const discoverMovies = async (filters = {}) => {
    const response = await tmdbApi.get('/discover/movie', { params: filters });
    return response.data;
};

// Get all genres
export const getGenres = async () => {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
};

// Get person details
export const getPersonDetails = async (personId) => {
    const response = await tmdbApi.get(`/person/${personId}`);
    return response.data;
};

// Get person movie credits
export const getPersonMovies = async (personId) => {
    const response = await tmdbApi.get(`/person/${personId}/movie_credits`);
    return response.data;
};

// Helper to build image URLs
export const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `${TMDB_IMAGE_URL}/${size}${path}`;
};

export default {
    getTrending,
    getPopular,
    getTopRated,
    getUpcoming,
    getNowPlaying,
    getMovieDetails,
    getMovieCredits,
    getMovieVideos,
    getSimilarMovies,
    getMovieImages,
    searchMovies,
    searchMulti,
    getMoviesByGenre,
    discoverMovies,
    getGenres,
    getPersonDetails,
    getPersonMovies,
    getImageUrl
};
