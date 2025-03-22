// User service for handling authentication and chat history

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Define chat history schema
const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    messages: [{
        type: {
            type: String,
            enum: ['user', 'bot', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    pageUrl: String,
    pageTitle: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash passwords
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password along with the new salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create models
const User = mongoose.model('User', userSchema);
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// User service methods
const userService = {
    /**
     * Register a new user
     * @param {Object} userData - User data with username, email, and password
     * @returns {Promise<Object>} - Registered user object (without password)
     */
    async registerUser(userData) {
        try {
            const { username, email, password } = userData;
            
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { username: username },
                    { email: email }
                ]
            });
            
            if (existingUser) {
                throw new Error('User with this username or email already exists');
            }
            
            // Create new user
            const user = new User({
                username,
                email,
                password
            });
            
            await user.save();
            
            // Return user without password
            const userObject = user.toObject();
            delete userObject.password;
            
            return userObject;
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * Login a user
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Promise<Object>} - User object (without password)
     */
    async loginUser(username, password) {
        try {
            // Find user by username or email
            const user = await User.findOne({
                $or: [
                    { username: username },
                    { email: username }
                ]
            });
            
            if (!user) {
                throw new Error('Invalid username or password');
            }
            
            // Compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid username or password');
            }
            
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            
            // Return user without password
            const userObject = user.toObject();
            delete userObject.password;
            
            return userObject;
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * Save chat message to history
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID
     * @param {Object} message - Message object with type, content
     * @param {Object} pageInfo - Optional page info with url and title
     * @returns {Promise<Object>} - Updated chat history
     */
    async saveChatMessage(userId, sessionId, message, pageInfo = {}) {
        try {
            // Find existing chat history for this session
            let chatHistory = await ChatHistory.findOne({
                userId: userId,
                sessionId: sessionId
            });
            
            // If no history exists, create a new one
            if (!chatHistory) {
                chatHistory = new ChatHistory({
                    userId: userId,
                    sessionId: sessionId,
                    messages: [],
                    pageUrl: pageInfo.url,
                    pageTitle: pageInfo.title
                });
            }
            
            // Add the message
            chatHistory.messages.push({
                type: message.type,
                content: message.content,
                timestamp: message.timestamp || new Date()
            });
            
            // Update the updated timestamp
            chatHistory.updatedAt = new Date();
            
            // Save the chat history
            await chatHistory.save();
            
            return chatHistory;
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * Get chat history for a user
     * @param {string} userId - User ID
     * @param {Object} options - Optional filters and pagination
     * @returns {Promise<Array>} - Array of chat history objects
     */
    async getChatHistory(userId, options = {}) {
        try {
            const query = { userId: userId };
            
            // Add session filter if provided
            if (options.sessionId) {
                query.sessionId = options.sessionId;
            }
            
            // Create query
            let historyQuery = ChatHistory.find(query);
            
            // Sort by updated time, newest first
            historyQuery = historyQuery.sort({ updatedAt: -1 });
            
            // Apply limit if provided
            if (options.limit) {
                historyQuery = historyQuery.limit(options.limit);
            }
            
            // Apply skip for pagination
            if (options.skip) {
                historyQuery = historyQuery.skip(options.skip);
            }
            
            return await historyQuery.exec();
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * Clear chat history for a user
     * @param {string} userId - User ID
     * @param {string} sessionId - Optional session ID to clear specific session
     * @returns {Promise<Object>} - Result with deleted count
     */
    async clearChatHistory(userId, sessionId = null) {
        try {
            const query = { userId: userId };
            
            // Add session filter if provided
            if (sessionId) {
                query.sessionId = sessionId;
            }
            
            const result = await ChatHistory.deleteMany(query);
            
            return {
                success: true,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = {
    User,
    ChatHistory,
    userService
}; 