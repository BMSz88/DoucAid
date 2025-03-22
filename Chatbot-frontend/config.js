/**
 * Configuration settings for DocuAid
 * 
 * This file contains all configuration settings for the DocuAid chatbot.
 * Edit this file to customize the behavior of the chatbot.
 */

const apiConfig = {
    // API configuration
    API_URL: 'http://localhost:3001',
    API_TIMEOUT: 30000, // 30 seconds
    
    // Get API URL, with optional fallback sequence
    getApiUrl: function() {
        // Try production URL first if it exists
        if (this.PRODUCTION_API_URL && window.location.hostname !== 'localhost') {
            return this.PRODUCTION_API_URL;
        }
        
        // Return development URL
        return this.API_URL;
    },
    
    // Authentication settings
    AUTH_REQUIRED: true, // Set to false to bypass authentication
    AUTH_TOKEN_KEY: 'docuaid-auth-token',
    
    // Chat interface settings
    CHATBOT_POSITION: 'right', // 'left', 'right'
    DEFAULT_OPEN: false, // Start with chatbot open
    BOT_NAME: 'DocuAid',
    USER_NAME: 'You',
    PLACEHOLDER_TEXT: 'Ask anything about this document...',
    WELCOME_MESSAGE: 'Hi there! I\'m DocuAid, your AI document assistant. Ask me anything about the current document or webpage.',
    
    // Storage settings
    STORAGE_KEY: 'docuaid-settings', // Local storage key for settings
    HISTORY_STORAGE_KEY: 'docuaid-chat-history', // Local storage key for chat history
    MAX_HISTORY_ITEMS: 100, // Maximum number of messages to store in history
    
    // Appearance
    DEFAULT_THEME: 'light', // 'light' or 'dark'
    DEFAULT_FONT_SIZE: 'medium', // 'small', 'medium', 'large'
    CHAT_WIDTH: '340px',
    CHAT_HEIGHT: '500px',
    
    // Advanced settings
    DEBUG_MODE: false, // Enable console logging
    ENABLE_DEMO_MODE: false  // Enable demo mode (no API calls)
};

// Make the configuration available globally
window.apiConfig = apiConfig;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiConfig;
} 