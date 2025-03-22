// Authentication routes for DocuAid

const express = require('express');
const jwt = require('jsonwebtoken');
const { userService } = require('../services/userService');

const router = express.Router();

/**
 * Register a new user
 * POST /auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Username, email, and password are required'
            });
        }
        
        // Register user
        const user = await userService.registerUser({
            username,
            email,
            password
        });
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token expires in 7 days
        });
        
        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key errors
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                error: 'Registration failed',
                message: error.message
            });
        }
        
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration'
        });
    }
});

/**
 * Login a user
 * POST /auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Username/email and password are required'
            });
        }
        
        // Login user
        const user = await userService.loginUser(username, password);
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token expires in 7 days
        });
        
        res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        
        // Invalid credentials
        if (error.message.includes('Invalid username or password')) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid username or password'
            });
        }
        
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
});

/**
 * Get current user profile
 * GET /auth/profile
 * Requires authentication
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Get user by ID
        const user = await userService.User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User not found'
            });
        }
        
        res.json({
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to get profile',
            message: 'An error occurred while retrieving user profile'
        });
    }
});

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
    // Get the auth header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Authentication token is required'
        });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'Authentication token is invalid or expired'
            });
        }
        
        // Set user ID in request
        req.userId = decoded.userId;
        next();
    });
}

// Export the authenticateToken middleware for use in other routes
router.authenticateToken = authenticateToken;

module.exports = router; 