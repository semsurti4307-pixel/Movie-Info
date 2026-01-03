import express from 'express';
import tmdbService from '../services/tmdbService.js';

const router = express.Router();

// @route   GET /api/person/:id
// @desc    Get person details
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tmdbService.getPersonDetails(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/person/:id/movie_credits
// @desc    Get person movie credits
// @access  Public
router.get('/:id/movie_credits', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tmdbService.getPersonMovies(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
