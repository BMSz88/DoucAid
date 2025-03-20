// Import config
// Use this method since we're in a Chrome extension content script
let config;
fetch(chrome.runtime.getURL('config.js'))
    .then(response => response.text())
    .then(text => {
        // Create a function from the text and execute it to get the config
        const configFunc = new Function(text.replace('export default', 'return'));
        config = configFunc();
        console.log('Config loaded:', config);
    })
    .catch(error => {
        console.error('Error loading config:', error);
        // Fallback config
        config = {
            API_URL: 'http://localhost:3001',
            ENDPOINTS: {
                CHAT: '/api/chat',
                EXTRACT: '/api/extract'
            }
        };
    });

// Add this at the beginning of the file to track messages
let chatbotMessagesHistory = [];

// Global variable to store extracted content
window.extractedContent = null;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeChatbot();
});

// In case DOMContentLoaded already fired
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initializeChatbot();
}

function initializeChatbot() {
    // Create chatbot container
    const container = document.createElement('div');

    // Fully gradient-filled bubble with no white space
    const chatBubbleSVG = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="paint0_linear" x1="5" y1="5" x2="45" y2="45" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#467DF6"/>
                <stop offset="100%" stop-color="#E54AA0"/>
            </linearGradient>
        </defs>
        <circle cx="25" cy="25" r="25" fill="url(#paint0_linear)"/>
        <path d="M20 17L36 25L20 33V17Z" fill="white"/>
    </svg>`;

    // Add custom fonts
    const fontStyle = document.createElement('style');
    fontStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        #docuaid-extension {
            font-family: 'Inter', sans-serif;
        }
    `;
    document.head.appendChild(fontStyle);

    container.innerHTML = `
    <div id="docuaid-extension">
        <!-- Chatbot Icon -->
        <div class="chatbot-icon" id="chatbot-icon">
            ${chatBubbleSVG}
        </div>

        <!-- Chatbot Container -->
        <div class="chatbot-container" id="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-title">DocuAid</div>
                <div class="chatbot-controls">
                    <button class="settings-button">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                        </svg>
                    </button>
                    <button class="close-button" id="close-button">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="chatbot-messages" id="chatbot-messages">
                <div class="message bot-message">
                    <div class="message-content">
                        Welcome to DocuAid! How can I help you with your documentation today?
                    </div>
                </div>
            </div>

            <div class="user-input-container">
                <input type="text" id="user-input" placeholder="Hello! Would you take my assist?">
                <button id="send-button" class="send-button">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>

            <div class="chatbot-footer">
                <div class="action-buttons">
                    <button class="action-button clear-button" title="Clear Chat">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                    </button>
                    <button class="action-button theme-button" title="Toggle Light/Dark Mode">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="light-icon">
                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                        </svg>
                    </button>
                    <button class="action-button extract-button" title="Extract Web Page">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                    </button>
                </div>
                <div class="version"><a href="https://www.docuaid.online" target="_blank" style="text-decoration: none; color: inherit;">DocuAid V1.0</a></div>
            </div>
        </div>
    </div>
    `;

    document.body.appendChild(container);

    // Add enhanced styles for the UI shown in the image
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        #docuaid-extension {
            --primary-color: #467DF6;
            --secondary-color: #E54AA0;
            --gradient: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }
        
        #docuaid-extension .chatbot-container {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 350px;
            bottom: 100px;
        }
        
        #docuaid-extension .chatbot-header {
            background: var(--gradient);
            padding: 15px;
        }
        
        #docuaid-extension .chatbot-title {
            font-weight: 600;
            font-size: 18px;
        }
        
        #docuaid-extension .message {
            margin: 10px;
            max-width: 80%;
            border-radius: 18px;
            padding: 10px 15px;
            font-size: 14px;
            line-height: 1.4;
        }
        
        #docuaid-extension .bot-message {
            background-color: #f0f2f5;
            color: #000;
        }
        
        #docuaid-extension .user-message {
            background: var(--gradient);
            color: white;
            margin-left: auto;
        }
        
        /* Loading animation */
        #docuaid-extension .loading .message-content {
            display: flex;
            align-items: center;
        }
        
        #docuaid-extension .loading .message-content:after {
            content: "...";
            animation: loading-dots 1.5s infinite;
            width: 20px;
            text-align: left;
            display: inline-block;
            margin-left: 4px;
        }
        
        @keyframes loading-dots {
            0%, 20% { content: "."; }
            40% { content: ".."; }
            60%, 100% { content: "..."; }
        }
        
        #docuaid-extension .user-input-container {
            padding: 10px 15px;
            border-top: 1px solid #eaeaea;
        }
        
        #docuaid-extension #user-input {
            border-radius: 20px;
            padding: 10px 15px;
            font-size: 14px;
            border: 1px solid #ddd;
        }
        
        #docuaid-extension .send-button {
            background: var(--gradient);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-left: 8px;
        }
        
        #docuaid-extension .action-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            color: #555;
        }
        
        #docuaid-extension .action-button:hover {
            background-color: #f0f2f5;
        }
    `;
    document.head.appendChild(enhancedStyles);

    // Initialize chatbot functionality after a short delay to ensure DOM is ready
    setTimeout(function () {
        setupChatbotEventListeners();
    }, 100);
}

function setupChatbotEventListeners() {
    // Get elements
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeButton = document.getElementById('close-button');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const clearButton = document.querySelector('.clear-button');
    const themeButton = document.querySelector('.theme-button');
    const extractButton = document.querySelector('.extract-button');
    const docuaidExtension = document.getElementById('docuaid-extension');

    // Store reference to chatbotMessages globally to avoid undefined errors
    window.chatbotMessages = chatbotMessages;

    // Toggle chatbot visibility when clicking the icon
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', function () {
            if (chatbotContainer) {
                chatbotContainer.classList.toggle('active');
                // Focus on input field when opening
                if (chatbotContainer.classList.contains('active') && userInput) {
                    setTimeout(() => userInput.focus(), 300);
                }
            }
        });
    }

    // Close chatbot when clicking the close button
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            if (chatbotContainer) {
                chatbotContainer.classList.remove('active');
            }
        });
    }

    // Send message when clicking send button or pressing Enter
    if (sendButton && userInput) {
        sendButton.addEventListener('click', async function () {
            sendMessage();
        });

        userInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Clear chat
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            if (chatbotMessages) {
                // Keep only the first welcome message
                const welcomeMessage = chatbotMessages.querySelector('.bot-message');
                chatbotMessages.innerHTML = '';
                if (welcomeMessage) {
                    chatbotMessages.appendChild(welcomeMessage);
                }
            }
        });
    }

    // Toggle dark mode
    if (themeButton) {
        themeButton.addEventListener('click', function () {
            if (docuaidExtension) {
                docuaidExtension.classList.toggle('dark-mode');
            }
        });
    }

    // Handle extraction of webpage content
    if (extractButton) {
        extractButton.addEventListener('click', async function () {
            // Show a loading message
            addMessage('Extracting content from this page...', 'bot');

            try {
                // Get the current URL
                const currentUrl = window.location.href;

                // Show extraction in progress
                addMessage(`Extracting content from: ${currentUrl}`, 'bot');

                // Extract content using our backend
                const extractedContent = await extractWebContent(currentUrl);

                if (extractedContent && extractedContent.content) {
                    // Show success message
                    addMessage('Content extracted successfully! You can now ask questions about this page.', 'bot');

                    // Store the content for reference
                    window.extractedPageContent = extractedContent.content;
                    window.extractedPageTitle = extractedContent.title || document.title;
                } else {
                    addMessage('Sorry, I was unable to extract meaningful content from this page.', 'bot');
                }
            } catch (error) {
                console.error('Error extracting content:', error);
                addMessage(`Error extracting content: ${error.message || 'Unknown error'}`, 'bot');
            }
        });
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (!message) return;

    // Clear input field
    userInput.value = '';

    // Add user message to chat
    addMessage(message, 'user');

    // Show typing indicator
    const loadingId = showLoadingMessage();

    try {
        // Get context if available from a previous extraction
        const context = window.extractedContent || null;

        // Call the chat API
        const response = await callChatAPI(message, context);

        // Handle the response
        removeLoadingMessage(loadingId);
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error in send message flow:', error);
        removeLoadingMessage(loadingId);
        addMessage(`Sorry, there was an error: ${error.message}`, 'bot');
    }
}

// Helper function to show a loading message
function showLoadingMessage(text) {
    const loadingId = 'loading-' + Date.now();
    const messagesContainer = window.chatbotMessages || document.getElementById('chatbot-messages');

    if (!messagesContainer) return loadingId;

    const loadingElement = document.createElement('div');
    loadingElement.className = 'message bot-message loading';
    loadingElement.id = loadingId;

    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = text;

    loadingElement.appendChild(contentElement);
    messagesContainer.appendChild(loadingElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return loadingId;
}

// Helper function to remove a loading message
function removeLoadingMessage(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Add API functions
async function callChatAPI(message, context = null) {
    const API_URL = 'http://localhost:3001/api/chat';

    try {
        console.log('Calling chat API with message:', message);

        // If we have extracted content, use it as context
        if (!context && window.extractedContent) {
            context = {
                type: 'webpage',
                title: window.extractedContent.title,
                content: window.extractedContent.content,
                url: window.extractedContent.url
            };
            console.log('Using extracted content as context', context.title);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
                question: message,
                context: context
            })
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);

        // Handle both formats, whether answer is directly in data or in data.answer
        if (data.answer) {
            return data.answer;
        } else if (data.response) {
            return data.response;
        } else {
            return JSON.stringify(data); // Fallback: just return the stringified data
        }
    } catch (error) {
        console.error('Error calling chat API:', error);
        return `Error: ${error.message}. Please try again later.`;
    }
}

async function extractWebContent(url = null) {
    try {
        console.log('Extracting content from URL:', url || window.location.href);

        // Show extraction status
        const extractionStatus = document.createElement('div');
        extractionStatus.className = 'extraction-status';
        extractionStatus.textContent = 'Extracting content from this page...';

        const chatbotContainer = document.getElementById('chatbot-container');
        chatbotContainer.appendChild(extractionStatus);

        const API_URL = 'http://localhost:3001/api/extract';

        // Add single message to show extraction is in progress
        addMessage('Extracting content from this page... Please wait.', 'bot');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({ url: url || window.location.href })
        });

        console.log('Extraction API response status:', response.status);

        // Remove the status indicator
        chatbotContainer.removeChild(extractionStatus);

        if (!response.ok) {
            throw new Error(`Error extracting content: ${response.status} - ${response.statusText}`);
        }

        const extractedContent = await response.json();
        console.log('Extracted content:', extractedContent);

        // Store the extracted content globally
        window.extractedContent = extractedContent;

        // Update the existing message instead of adding new ones
        updateLastBotMessage('Content extracted successfully! You can now ask questions about this page.');

        return extractedContent;
    } catch (error) {
        console.error('Error extracting content:', error);
        updateLastBotMessage(`Error extracting content: ${error.message}`);
        return null;
    }
}

/**
 * Updates the last bot message instead of adding a new one
 */
function updateLastBotMessage(text) {
    const messages = document.querySelectorAll('.bot-message');
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const contentElement = lastMessage.querySelector('.message-content');
        if (contentElement) {
            contentElement.textContent = text;
        }
    } else {
        // Fallback to adding a new message if no message exists
        addMessage(text, 'bot');
    }
}

// Add typing indicator functions
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatbotMessages.appendChild(typingIndicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = chatbotMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Add styles for new message types and typing indicator
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .bot-source {
        font-size: 12px;
        color: #666;
        font-style: italic;
    }
    
    .bot-error {
        background-color: #fee;
        color: #e44;
    }
    
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .typing-indicator span {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: typing 1s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }
`;
document.head.appendChild(additionalStyles);

// Helper function to add messages to the chat
function addMessage(text, sender) {
    // Store message in history
    chatbotMessagesHistory.push({ text, sender });

    // Get the messages container
    const messagesContainer = window.chatbotMessages || document.getElementById('chatbot-messages');

    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }

    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;

    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = text;

    messageElement.appendChild(contentElement);
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add message listener for commands from popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "toggle_chatbot") {
        // Find the chatbot container
        const chatbotContainer = document.getElementById('chatbot-container');
        if (chatbotContainer) {
            chatbotContainer.classList.toggle('active');
            sendResponse({ status: "toggled" });
        } else {
            // If container doesn't exist, initialize it
            initializeChatbot();
            setTimeout(() => {
                const container = document.getElementById('chatbot-container');
                if (container) container.classList.add('active');
                sendResponse({ status: "initialized" });
            }, 500);
        }
    } else if (message.action === "status_check") {
        // Check if chatbot exists on the page
        const chatbotContainer = document.getElementById('chatbot-container');
        if (chatbotContainer) {
            sendResponse({
                status: chatbotContainer.classList.contains('active') ? "active" : "inactive",
                initialized: true
            });
        } else {
            sendResponse({ status: "not_found", initialized: false });
        }
    }

    // Return true to indicate we want to send a response asynchronously
    return true;
}); 