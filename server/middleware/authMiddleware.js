import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

// Protect routes - user must be logged in
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (error || !user) {
                throw new Error('User not found');
            }

            delete user.password;
            // Map id to _id for compatibility if needed, or just keep user as is. 
            // Existing frontend likely checks _id.
            user._id = user.id;
            req.user = user;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin only middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Optional auth - attach user if token exists
export const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (user) {
                delete user.password;
                user._id = user.id;
                req.user = user;
            }
        } catch (error) {
            // Token invalid, continue without user
        }
    }
    next();
};

