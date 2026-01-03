import express from 'express';
import supabase from '../config/supabase.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/reviews/:movieId
// @desc    Get reviews for a movie
// @access  Public
router.get('/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;

        // Assuming table 'reviews' has 'user_id' FK to 'users' table
        // We select user details via join
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users (
                    name,
                    avatar
                )
            `)
            .eq('movieId', parseInt(movieId)) // Assuming column name is movieId
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(reviews || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check if user already reviewed this movie
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .match({ user_id: userId, movieId: movieId })
            .single();

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this movie' });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .insert([
                {
                    user_id: userId,
                    movieId,
                    rating,
                    comment
                }
            ])
            .select(`
                *,
                user:users (
                    name,
                    avatar
                )
            `)
            .single();

        if (error) throw error;

        // Format for response if needed (Supabase returns joined object structure differently than Mongoose populate?)
        // Supabase returns { ..., user: { name: '', avatar: '' } } which matches expected JSON structure mostly.

        // Mongoose might return user as object directly on property 'user'. Supabase does too if defined in select.

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch review to check ownership
        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        // Note: req.user.id is int/uuid, review.user_id should match
        if (review.user_id != req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const updates = {};
        if (req.body.rating) updates.rating = req.body.rating;
        if (req.body.comment) updates.comment = req.body.comment;

        const { data: updatedReview, error } = await supabase
            .from('reviews')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                user:users (
                    name,
                    avatar
                )
            `)
            .single();

        if (error) throw error;
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review or is admin
        if (review.user_id != req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews/user/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/user/my-reviews', protect, async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users (
                    name,
                    avatar
                )
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(reviews || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

