// Chat history routes for DocuAid

const express = require('express');
const { userService } = require('../services/userService');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Middleware to authenticate requests
const authenticateToken = authRoutes.authenticateToken;

/**
 * Get chat history for current user
 * GET /history
 * Requires authentication
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Get pagination parameters
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const sessionId = req.query.sessionId;
        
        // Get chat history for user
        const history = await userService.getChatHistory(req.userId, {
            limit,
            skip,
            sessionId
        });
        
        res.json({
            history,
            pagination: {
                limit,
                skip,
                total: history.length // In a real app, we would calculate the total count
            }
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            error: 'Failed to get chat history',
            message: 'An error occurred while retrieving chat history'
        });
    }
});

/**
 * Get specific chat session
 * GET /history/:sessionId
 * Requires authentication
 */
router.get('/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Get chat history for session
        const history = await userService.getChatHistory(req.userId, {
            sessionId
        });
        
        if (history.length === 0) {
            return res.status(404).json({
                error: 'Session not found',
                message: 'Chat session not found'
            });
        }
        
        res.json({
            history: history[0]
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            error: 'Failed to get chat session',
            message: 'An error occurred while retrieving chat session'
        });
    }
});

/**
 * Save a message to chat history
 * POST /history/:sessionId/messages
 * Requires authentication
 */
router.post('/:sessionId/messages', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { type, content } = req.body;
        const { pageUrl, pageTitle } = req.body;
        
        // Validate message
        if (!type || !content) {
            return res.status(400).json({
                error: 'Invalid message',
                message: 'Message type and content are required'
            });
        }
        
        // Save message
        const chatHistory = await userService.saveChatMessage(
            req.userId,
            sessionId,
            { type, content },
            { url: pageUrl, title: pageTitle }
        );
        
        res.status(201).json({
            message: 'Message saved',
            chatHistory
        });
    } catch (error) {
        console.error('Save message error:', error);
        res.status(500).json({
            error: 'Failed to save message',
            message: 'An error occurred while saving the message'
        });
    }
});

/**
 * Clear chat history
 * DELETE /history
 * Requires authentication
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.query;
        
        // Clear chat history
        const result = await userService.clearChatHistory(req.userId, sessionId);
        
        res.json({
            message: 'Chat history cleared',
            result
        });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            error: 'Failed to clear chat history',
            message: 'An error occurred while clearing chat history'
        });
    }
});

module.exports = router; 