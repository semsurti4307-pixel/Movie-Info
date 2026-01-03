import axios from 'axios';
import { supabase } from '../config/supabase';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests (Keep this for Node calls if needed, though Supabase handles its own)
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Handle token expiration if using Node
        }
        return Promise.reject(error);
    }
);

// Movies API (Keep using Node Backend as Proxy to TMDB)
export const moviesAPI = {
    getTrending: (timeWindow = 'week') => api.get(`/movies/trending?timeWindow=${timeWindow}`),
    getPopular: (page = 1) => api.get(`/movies/popular?page=${page}`),
    getTopRated: (page = 1) => api.get(`/movies/top-rated?page=${page}`),
    getUpcoming: (page = 1) => api.get(`/movies/upcoming?page=${page}`),
    getNowPlaying: (page = 1) => api.get(`/movies/now-playing?page=${page}`),
    getGenres: () => api.get('/movies/genres'),
    getMovieDetails: (id) => api.get(`/movies/${id}`),
    getMovieCredits: (id) => api.get(`/movies/${id}/credits`),
    getMovieVideos: (id) => api.get(`/movies/${id}/videos`),
    getSimilarMovies: (id, page = 1) => api.get(`/movies/${id}/similar?page=${page}`),
    getMovieImages: (id) => api.get(`/movies/${id}/images`),
    searchMovies: (query, page = 1) => api.get(`/movies/search?query=${query}&page=${page}`),
    discoverMovies: (filters) => api.get('/movies/discover', { params: filters }),
    getMoviesByGenre: (genreId, page = 1) => api.get(`/movies/genre/${genreId}?page=${page}`),
    getPersonDetails: (personId) => api.get(`/person/${personId}`),
    getPersonCredits: (personId) => api.get(`/person/${personId}/movie_credits`)
};

// Helper: Get user from LocalStorage
const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || 'null');

// Auth API (Node.js Backend)
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// User API (Node.js Backend)
export const userAPI = {
    getFavorites: async () => {
        const user = getCurrentUser();
        // Fallback for non-logged in users (LocalStorage)
        if (!user || !user.token) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (!favorites.length) return { data: [] };
            const promises = favorites.map(id => moviesAPI.getMovieDetails(id).catch(() => ({ data: null })));
            const responses = await Promise.all(promises);
            return { data: responses.map(r => r.data).filter(Boolean) };
        }

        // Logged in: Fetch from Server
        return api.get('/users/favorites');
    },

    toggleFavorite: async (movieId) => {
        const user = getCurrentUser();
        // Fallback for non-logged in users
        if (!user || !user.token) {
            let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const wasInFavorites = favorites.includes(movieId);
            if (wasInFavorites) favorites = favorites.filter(id => id !== movieId);
            else favorites.push(movieId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            return { data: { favorites, isFavorite: !wasInFavorites } };
        }

        // Logged in: Call Server
        return api.put(`/users/favorites/${movieId}`);
    },

    getWatchlist: async () => {
        const user = getCurrentUser();
        if (!user || !user.token) {
            const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
            if (!watchlist.length) return { data: [] };
            const promises = watchlist.map(id => moviesAPI.getMovieDetails(id).catch(() => ({ data: null })));
            const responses = await Promise.all(promises);
            return { data: responses.map(r => r.data).filter(Boolean) };
        }
        return api.get('/users/watchlist');
    },

    toggleWatchlist: async (movieId) => {
        const user = getCurrentUser();
        if (!user || !user.token) {
            let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
            const wasInWatchlist = watchlist.includes(movieId);

            if (wasInWatchlist) {
                watchlist = watchlist.filter(id => id !== movieId);
            } else {
                watchlist.push(movieId);
            }

            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            return { data: { watchlist, inWatchlist: !wasInWatchlist } };
        }
        return api.put(`/users/watchlist/${movieId}`);
    },

    getRecentlyViewed: async () => {
        const user = getCurrentUser();
        if (!user || !user.token) {
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            if (!recentlyViewed.length) return { data: [] };
            const promises = recentlyViewed.map(id => moviesAPI.getMovieDetails(id).catch(() => ({ data: null })));
            const responses = await Promise.all(promises);
            return { data: responses.map(r => r.data).filter(Boolean) };
        }
        return api.get('/users/recently-viewed');
    },

    addRecentlyViewed: async (movieId) => {
        const user = getCurrentUser();
        if (!user || !user.token) {
            let list = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            list = list.filter(id => id !== movieId);
            list.unshift(movieId);
            if (list.length > 20) list.pop();
            localStorage.setItem('recentlyViewed', JSON.stringify(list));
            return { data: list };
        }
        return api.put(`/users/recently-viewed/${movieId}`);
    },

    checkMovieStatus: async (movieId) => {
        const user = getCurrentUser();
        if (!user || !user.token) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
            return {
                data: {
                    isFavorite: favorites.includes(movieId),
                    inWatchlist: watchlist.includes(movieId)
                }
            };
        }
        return api.get(`/users/check/${movieId}`);
    }
};

// Reviews API (Connected to Node.js backend)
export const reviewsAPI = {
    getMovieReviews: (movieId) => api.get(`/reviews/${movieId}`),
    createReview: (data) => api.post('/reviews', data),
    updateReview: (id, data) => api.put(`/reviews/${id}`, data),
    deleteReview: (id) => api.delete(`/reviews/${id}`),
    getMyReviews: () => api.get('/reviews/user/my-reviews')
};

// Admin API (Simplified for Supabase)
export const adminAPI = {
    getStats: async () => {
        // Mock stats or fetch real counts
        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        return { data: { totalUsers: usersCount, totalMovies: 0, totalReviews: 0 } };
    },
    getUsers: async () => {
        const { data } = await supabase.from('users').select('*');
        return { data };
    },
    updateUserRole: async (id, role) => {
        const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select();
        if (error) throw error;
        return { data };
    },
    deleteUser: async (id) => {
        // Only deletes profile, not auth (limit of Client SDK)
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return { data: { message: 'User profile deleted' } };
    },
    // Mock Movie/Review admin ops
    getReviews: () => Promise.resolve({ data: [] }),
    deleteReview: () => Promise.resolve({ data: {} }),
    getMovies: () => Promise.resolve({ data: [] }),
    addMovie: () => Promise.resolve({ data: {} }),
    updateMovie: () => Promise.resolve({ data: {} }),
    deleteMovie: () => Promise.resolve({ data: {} })
};

// Image URL helper (Keep)
export const getImageUrl = (path, size = 'w500') => {
    if (!path) return '/placeholder-movie.png';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default api;
