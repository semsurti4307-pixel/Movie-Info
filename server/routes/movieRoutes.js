import express from 'express';
import tmdbService from '../services/tmdbService.js';

const router = express.Router();

// @route   GET /api/movies/trending
// @desc    Get trending movies
// @access  Public
router.get('/trending', async (req, res) => {
    try {
        const { timeWindow = 'week' } = req.query;
        const data = await tmdbService.getTrending(timeWindow);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/popular
// @desc    Get popular movies
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const data = await tmdbService.getPopular(page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/top-rated
// @desc    Get top rated movies
// @access  Public
router.get('/top-rated', async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const data = await tmdbService.getTopRated(page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/upcoming
// @desc    Get upcoming movies
// @access  Public
router.get('/upcoming', async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const data = await tmdbService.getUpcoming(page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/now-playing
// @desc    Get now playing movies
// @access  Public
router.get('/now-playing', async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const data = await tmdbService.getNowPlaying(page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/genres
// @desc    Get all genres
// @access  Public
router.get('/genres', async (req, res) => {
    try {
        const data = await tmdbService.getGenres();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/search
// @desc    Search movies
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { query, page = 1 } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }
        const data = await tmdbService.searchMovies(query, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/discover
// @desc    Discover movies with filters
// @access  Public
router.get('/discover', async (req, res) => {
    try {
        const filters = {
            page: req.query.page || 1,
            sort_by: req.query.sort_by || 'popularity.desc',
            with_genres: req.query.genre,
            'primary_release_date.gte': req.query.year_from,
            'primary_release_date.lte': req.query.year_to,
            with_original_language: req.query.language,
            'vote_average.gte': req.query.rating_min,
            'vote_average.lte': req.query.rating_max
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key =>
            filters[key] === undefined && delete filters[key]
        );

        const data = await tmdbService.discoverMovies(filters);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/genre/:genreId
// @desc    Get movies by genre
// @access  Public
router.get('/genre/:genreId', async (req, res) => {
    try {
        const { genreId } = req.params;
        const { page = 1 } = req.query;
        const data = await tmdbService.getMoviesByGenre(genreId, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/:id
// @desc    Get movie details
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tmdbService.getMovieDetails(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/:id/credits
// @desc    Get movie credits (cast & crew)
// @access  Public
router.get('/:id/credits', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tmdbService.getMovieCredits(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/:id/videos
// @desc    Get movie videos (trailers)
// @access  Public
router.get('/:id/videos', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tmdbService.getMovieVideos(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/:id/similar
// @desc    Get similar movies
// @access  Public
router.get('/:id/similar', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1 } = req.query;
        const data = await tmdbService.getSimilarMovies(id, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/movies/:id/images
// @desc    Get movie images
// @access  Public
router.get('/:id/images', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tmdbService.getMovieImages(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
