// DocuAid Content Script
// This script injects the DocuAid chatbot into web pages

// Check if we should inject the chatbot
chrome.storage.sync.get(['enabled'], function (result) {
    const enabled = result.enabled !== undefined ? result.enabled : true;
    if (enabled) {
        injectChatbot();
    }
});

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'toggleChatbot') {
        if (request.enabled) {
            injectChatbot();
        } else {
            removeChatbot();
        }
        sendResponse({ success: true });
    }
});

// Function to inject chatbot HTML and CSS
function injectChatbot() {
    // Check if chatbot already exists
    if (document.getElementById('docuaid-chatbot-container')) {
        return;
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'docuaid-chatbot-container';

    // Add chatbot icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'docuaid-chatbot-icon';
    iconDiv.id = 'docuaid-chatbot-icon';
    iconDiv.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
    `;

    // Add chatbot window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'docuaid-chatbot-window';
    chatWindow.id = 'docuaid-chatbot-window';

    // Create the chatbot HTML structure
    chatWindow.innerHTML = `
        <div class="docuaid-chatbot-header">
            <div class="docuaid-chatbot-title">DocuAid</div>
            <div class="docuaid-chatbot-controls">
                <button class="docuaid-settings-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                </button>
                <button class="docuaid-close-button" id="docuaid-close-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="docuaid-chatbot-messages" id="docuaid-chatbot-messages">
            <div class="docuaid-message docuaid-bot-message">
                <div class="docuaid-message-content">
                    Welcome to DocuAid! How can I help you with your documentation today?
                </div>
            </div>
        </div>
        
        <div class="docuaid-user-input-container">
            <input type="text" id="docuaid-user-input" placeholder="Hello! Would you take my assist?">
            <button id="docuaid-send-button" class="docuaid-send-button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            </button>
        </div>
        
        <div class="docuaid-chatbot-footer">
            <button class="docuaid-action-button docuaid-clear-button" title="Clear Chat">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
            <button class="docuaid-action-button docuaid-theme-button" title="Toggle Light/Dark Mode">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
            </button>
            <button class="docuaid-action-button docuaid-extract-button" title="Extract Web Page">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
            </button>
            <div class="docuaid-version">DocuAid V1.0</div>
        </div>
    `;

    // Add Font Awesome if it's not already on the page
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    // Append elements to container
    container.appendChild(iconDiv);
    container.appendChild(chatWindow);

    // Append container to body
    document.body.appendChild(container);

    // Add event listeners
    setupChatbotEventListeners();
}

// Remove chatbot
function removeChatbot() {
    const container = document.getElementById('docuaid-chatbot-container');
    if (container) {
        container.remove();
    }
}

// Setup event listeners for chatbot functionality
function setupChatbotEventListeners() {
    // DOM Elements
    const chatbotIcon = document.getElementById('docuaid-chatbot-icon');
    const chatbotWindow = document.getElementById('docuaid-chatbot-window');
    const closeButton = document.getElementById('docuaid-close-button');
    const sendButton = document.getElementById('docuaid-send-button');
    const userInput = document.getElementById('docuaid-user-input');
    const chatbotMessages = document.getElementById('docuaid-chatbot-messages');
    const clearButton = document.querySelector('.docuaid-clear-button');
    const themeButton = document.querySelector('.docuaid-theme-button');
    const extractButton = document.querySelector('.docuaid-extract-button');

    // Toggle chatbot visibility
    chatbotIcon.addEventListener('click', function () {
        chatbotWindow.classList.add('active');
        userInput.focus();
    });

    closeButton.addEventListener('click', function () {
        chatbotWindow.classList.remove('active');
    });

    // Send message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');

        // Clear input
        userInput.value = '';

        // Simulate bot response (replace with actual API call)
        setTimeout(() => {
            processUserMessage(message);
        }, 500);
    }

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Clear chat
    clearButton.addEventListener('click', function () {
        // Keep the welcome message
        while (chatbotMessages.children.length > 1) {
            chatbotMessages.removeChild(chatbotMessages.lastChild);
        }
    });

    // Toggle theme
    themeButton.addEventListener('click', function () {
        const container = document.getElementById('docuaid-chatbot-container');
        container.classList.toggle('docuaid-dark-mode');

        if (container.classList.contains('docuaid-dark-mode')) {
            themeButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
            `;
        } else {
            themeButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
            `;
        }
    });

    // Extract web page
    extractButton.addEventListener('click', function () {
        addMessage("I'm extracting information from this web page...", 'bot');

        // Get the page content (simplified example)
        const pageTitle = document.title;
        const pageContent = document.body.innerText.substring(0, 500) + '...';

        // In a real implementation, you would send this to your API for processing
        setTimeout(() => {
            addMessage(`Page Title: ${pageTitle}\n\nHere's a summary of the content from this page.`, 'bot');
        }, 1000);
    });
}

// Process user message
function processUserMessage(message) {
    // Here you would typically call your API
    // For now, let's just echo a response
    const responses = [
        "I can help you understand documentation better. What specific information are you looking for?",
        "Let me extract the key information from that document for you.",
        "That's an interesting question about the documentation. Here's what I found...",
        "I'm analyzing the documentation to find the most relevant information for you.",
        "I can summarize that documentation to save you time. Here's what's important..."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage(randomResponse, 'bot');
}

// Add message to chat
function addMessage(message, sender) {
    const chatbotMessages = document.getElementById('docuaid-chatbot-messages');

    const messageElement = document.createElement('div');
    messageElement.classList.add('docuaid-message', `docuaid-${sender}-message`);

    const contentElement = document.createElement('div');
    contentElement.classList.add('docuaid-message-content');
    contentElement.textContent = message;

    messageElement.appendChild(contentElement);
    chatbotMessages.appendChild(messageElement);

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
} 