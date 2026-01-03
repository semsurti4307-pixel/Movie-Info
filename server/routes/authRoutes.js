import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const { data: userExists } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'user',
                    avatar: '',
                    favorites: [],
                    watchlist: [], // Assuming column name matches
                    recentlyViewed: [] // Assuming column name matches. Note Supabase columns are usually snake_case but strict mode OFF might allow this
                }
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                favorites: user.favorites || [],
                watchlist: user.watchlist || [],
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        // req.user is already attached by protect middleware
        if (req.user) {
            res.json(req.user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = {};

        if (req.body.name) updates.name = req.body.name;
        if (req.body.email) updates.email = req.body.email;
        if (req.body.avatar) updates.avatar = req.body.avatar;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password, salt);
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        if (updatedUser) {
            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser.id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

