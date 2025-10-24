import express from 'express';
import bcrypt from 'bcrypt';
import { generateToken, revokeToken, verifyToken, authMiddleware, getWhitelistStats } from '../middleware/auth.js';
import { getUserByEmail, createUser, getUser } from '../models/index.js';

const router = express.Router();

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = getUserByEmail(email) as any;
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token (with remember me option)
        const token = generateToken(user.id, user.email, remember || false);

        // Return token and user data (exclude password)
        const { password_hash, ...userData } = user;

        res.json({
            token,
            user: userData,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /auth/signup
 * Register new user
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, username, name } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = createUser(
            email,
            password_hash,
            username || email.split('@')[0],
            name || email.split('@')[0]
        );

        // Get created user
        const newUser = getUser(result.lastInsertRowid as number) as any;

        // Generate token
        const token = generateToken(newUser.id, newUser.email);

        // Return token and user data (exclude password)
        const { password_hash: _, ...userData } = newUser;

        res.status(201).json({
            token,
            user: userData,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

/**
 * POST /auth/logout
 * Logout and revoke token
 */
router.post('/logout', authMiddleware, (req, res) => {
    try {
        if (req.user) {
            revokeToken(req.user.jti);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

/**
 * GET /auth/validate
 * Validate current token
 */
router.get('/validate', authMiddleware, (req, res) => {
    try {
        // If middleware passed, token is valid
        res.json({
            valid: true,
            user: {
                userId: req.user!.userId,
                email: req.user!.email,
            },
        });
    } catch (error) {
        console.error('Validate error:', error);
        res.status(500).json({ error: 'Validation failed' });
    }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware, (req, res) => {
    try {
        const user = getUser(req.user!.userId) as any;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Exclude password
        const { password_hash, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

/**
 * PUT /auth/profile
 * Update current user profile
 */
router.put('/profile', authMiddleware, (req, res) => {
    try {
        const { name, username, avatar, specialization, year, interests } = req.body;

        // Build update object (only include provided fields)
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (username !== undefined) updates.username = username;
        if (avatar !== undefined) updates.avatar = avatar;
        if (specialization !== undefined) updates.specialization = specialization;
        if (year !== undefined) updates.year = year;
        if (interests !== undefined) updates.interests = JSON.stringify(interests);

        // Update user
        const { updateUser } = require('../model.js');
        updateUser(req.user!.userId, updates);

        // Get updated user
        const user = getUser(req.user!.userId) as any;
        const { password_hash, ...userData } = user;

        res.json(userData);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * GET /auth/stats (debug endpoint)
 * Get token whitelist stats
 */
router.get('/stats', (req, res) => {
    try {
        const stats = getWhitelistStats();
        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

export default router;