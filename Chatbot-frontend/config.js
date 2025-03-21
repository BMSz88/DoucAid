// DocuAid API Configuration
const apiConfig = {
    // API base URL - can be either remote or local
    API_URL: 'https://doucaid-production.up.railway.app',
    // For local development, uncomment the line below
    // API_URL: 'http://localhost:3001',

    // API endpoints
    CHAT_ENDPOINT: '/api/chat',
    EXTRACT_ENDPOINT: '/api/extract',
    HEALTH_ENDPOINT: '/health',

    // Helper function to get API URL based on environment
    getApiUrl: function () {
        // Check if we're in a local/dev environment
        const isLocalDev = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        // Use Railway URL by default, fallback to local only for development
        return isLocalDev ? 'http://localhost:3002' : 'https://doucaid-production.up.railway.app';
    },

    // Handle API connection errors gracefully
    handleApiError: function (error) {
        console.error('[DocuAid] API Error:', error);

        // Check for specific error types
        if (error.name === 'PineconeError') {
            console.warn('[DocuAid] Pinecone error - continuing without vector store');
            return {
                success: false,
                error: 'Vector store temporarily unavailable - basic functionality will continue',
                isPineconeError: true
            };
        }

        if (error.message && (error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError'))) {
            return {
                success: false,
                error: 'Network error: Could not connect to the API service. Please check your connection.',
                isConnectionError: true
            };
        }

        return {
            success: false,
            error: 'An error occurred: ' + (error.message || 'Unknown error'),
            isConnectionError: false
        };
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.apiConfig = apiConfig;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiConfig;
} 