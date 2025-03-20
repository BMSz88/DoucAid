document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeButton = document.getElementById('close-button');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const clearButton = document.querySelector('.clear-button');
    const themeButton = document.querySelector('.theme-button');
    const extractButton = document.querySelector('.extract-button');

    // State variables
    let isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize theme
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
        `;
    }

    // Toggle chatbot visibility
    chatbotIcon.addEventListener('click', function () {
        chatbotContainer.classList.add('active');
        userInput.focus();
    });

    closeButton.addEventListener('click', function () {
        chatbotContainer.classList.remove('active');
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
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.textContent = message;

        messageElement.appendChild(contentElement);
        chatbotMessages.appendChild(messageElement);

        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Clear chat
    clearButton.addEventListener('click', function () {
        // Keep the welcome message
        while (chatbotMessages.children.length > 1) {
            chatbotMessages.removeChild(chatbotMessages.lastChild);
        }
    });

    // Toggle theme
    themeButton.addEventListener('click', function () {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');

        if (isDarkMode) {
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

        localStorage.setItem('darkMode', isDarkMode);
    });

    // Extract web page (demonstration)
    extractButton.addEventListener('click', function () {
        addMessage("I'm extracting information from this web page...", 'bot');

        setTimeout(() => {
            addMessage("Here's the key information I found on this page:", 'bot');
            // In a real implementation, this would analyze the page content
        }, 1000);
    });

    // Create a version of the chatbot that can be injected into other websites
    function createChatbotScript() {
        // Get the current script
        const currentScript = document.currentScript;

        // Create container for chatbot
        const container = document.createElement('div');
        container.id = 'docuaid-chatbot-container';

        // Clone the HTML structure
        container.innerHTML = `
            <div class="chatbot-icon" id="docuaid-chatbot-icon">
                <i class="fa fa-comment"></i>
            </div>
            <div class="chatbot-container" id="docuaid-chatbot-window">
                <!-- Chatbot content would be here -->
            </div>
        `;

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `/* Chatbot styles would be here */`;

        // Append to document
        document.body.appendChild(container);
        document.head.appendChild(style);

        // Initialize functionality
        // chatbotInit();
    }

    // If this script is loaded on an external website, initialize the chatbot
    if (document.currentScript && document.currentScript.getAttribute('data-init') === 'true') {
        createChatbotScript();
    }
});

// Function to create a script that can be embedded in other websites
function createEmbeddableScript() {
    const script = document.createElement('script');
    script.src = 'https://www.docuaid.online/chatbot/embed.js';
    script.setAttribute('data-init', 'true');
    return script;
}

// Function to inject the chatbot into a webpage programmatically
function injectChatbot() {
    const script = createEmbeddableScript();
    document.body.appendChild(script);
}

// Export for use in Chrome extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        injectChatbot
    };
}
