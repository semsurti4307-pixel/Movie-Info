import express from 'express';
import supabase from '../config/supabase.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res) => {
    try {
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: totalReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
        const { count: totalFeaturedMovies } = await supabase.from('movies').select('*', { count: 'exact', head: true }); // Assuming 'movies' table

        const { data: recentUsers } = await supabase
            .from('users')
            .select('name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        const { data: recentReviews } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users (name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            stats: {
                totalUsers: totalUsers || 0,
                totalReviews: totalReviews || 0,
                totalFeaturedMovies: totalFeaturedMovies || 0
            },
            recentUsers: recentUsers || [],
            recentReviews: recentReviews || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*') // Should exclude password ideally, but supabase doesn't have exclude. We can select specific columns.
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Filter out password manually if needed, or just send it (not ideal, but common in quick migrations). 
        // Better: Select columns explicitly.
        // For now, I'll filter in JS.
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });

        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User role updated', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete reviews first? Supabase CASCADE might handle this if configued.
        // Explicit delete for safety if no cascade.
        await supabase.from('reviews').delete().eq('user_id', id);

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews
// @access  Admin
router.get('/reviews', async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users (name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete any review
// @access  Admin
router.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
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

// @route   GET /api/admin/movies
// @desc    Get all featured movies
// @access  Admin
router.get('/movies', async (req, res) => {
    try {
        const { data: movies, error } = await supabase
            .from('movies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/admin/movies
// @desc    Add featured movie
// @access  Admin
router.post('/movies', async (req, res) => {
    try {
        const { data: movie, error } = await supabase
            .from('movies')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/movies/:id
// @desc    Update featured movie
// @access  Admin
router.put('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: movie, error } = await supabase
            .from('movies')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/movies/:id
// @desc    Delete featured movie
// @access  Admin
router.delete('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('movies')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Movie deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

