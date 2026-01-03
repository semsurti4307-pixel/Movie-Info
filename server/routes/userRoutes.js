import express from 'express';
import supabase from '../config/supabase.js';
import { protect } from '../middleware/authMiddleware.js';
import tmdbService from '../services/tmdbService.js';

const router = express.Router();

// @route   GET /api/users/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        const user = req.user; // Already fetched by protect middleware

        // Fetch movie details for each favorite
        const moviesPromises = (user.favorites || []).map(id =>
            tmdbService.getMovieDetails(id).catch(() => null)
        );
        const movies = await Promise.all(moviesPromises);

        res.json(movies.filter(m => m !== null));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/favorites/:movieId
// @desc    Toggle movie in favorites
// @access  Private
router.put('/favorites/:movieId', protect, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const user = req.user;
        let favorites = user.favorites || [];

        const index = favorites.indexOf(movieId);

        if (index === -1) {
            // Add to favorites
            favorites.push(movieId);
        } else {
            // Remove from favorites
            favorites.splice(index, 1);
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ favorites })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            favorites: updatedUser.favorites,
            isFavorite: index === -1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/watchlist
// @desc    Get user watchlist
// @access  Private
router.get('/watchlist', protect, async (req, res) => {
    try {
        const user = req.user;

        // Fetch movie details for each watchlist item
        const moviesPromises = (user.watchlist || []).map(id =>
            tmdbService.getMovieDetails(id).catch(() => null)
        );
        const movies = await Promise.all(moviesPromises);

        res.json(movies.filter(m => m !== null));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/watchlist/:movieId
// @desc    Toggle movie in watchlist
// @access  Private
router.put('/watchlist/:movieId', protect, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const user = req.user;
        let watchlist = user.watchlist || [];

        const index = watchlist.indexOf(movieId);

        if (index === -1) {
            // Add to watchlist
            watchlist.push(movieId);
        } else {
            // Remove from watchlist
            watchlist.splice(index, 1);
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ watchlist })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            watchlist: updatedUser.watchlist,
            inWatchlist: index === -1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/recently-viewed/:movieId
// @desc    Add movie to recently viewed
// @access  Private
router.put('/recently-viewed/:movieId', protect, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const user = req.user;
        let recentlyViewed = user.recentlyViewed || [];

        // Remove if already exists
        const index = recentlyViewed.indexOf(movieId);
        if (index !== -1) {
            recentlyViewed.splice(index, 1);
        }

        // Add to beginning (most recent)
        recentlyViewed.unshift(movieId);

        // Keep only last 20
        if (recentlyViewed.length > 20) {
            recentlyViewed = recentlyViewed.slice(0, 20);
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ recentlyViewed })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ recentlyViewed: updatedUser.recentlyViewed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/recently-viewed
// @desc    Get recently viewed movies
// @access  Private
router.get('/recently-viewed', protect, async (req, res) => {
    try {
        const user = req.user;

        // Fetch movie details for recently viewed
        const moviesPromises = (user.recentlyViewed || []).slice(0, 10).map(id =>
            tmdbService.getMovieDetails(id).catch(() => null)
        );
        const movies = await Promise.all(moviesPromises);

        res.json(movies.filter(m => m !== null));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/check/:movieId
// @desc    Check if movie is in favorites/watchlist
// @access  Private
router.get('/check/:movieId', protect, async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const user = req.user;

        res.json({
            isFavorite: (user.favorites || []).includes(movieId),
            inWatchlist: (user.watchlist || []).includes(movieId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

