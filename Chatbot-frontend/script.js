document.addEventListener('DOMContentLoaded', () => {
    console.log('[DocuAid] Content script loaded');
    initChatbot();
});

function initChatbot() {
    console.log('[DocuAid] Initializing chatbot...');

    // Create main container
    const docuaidExtension = document.createElement('div');
    docuaidExtension.id = 'docuaid-extension';
    document.body.appendChild(docuaidExtension);

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('docuaid-dark-mode');
    if (savedDarkMode === 'true') {
        console.log('[DocuAid] Applying saved dark mode preference');
        docuaidExtension.classList.add('dark-mode');
    }

    // Create chatbot icon
    const chatbotIcon = document.createElement('div');
    chatbotIcon.className = 'chatbot-icon';
    chatbotIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white"/></svg>';
    docuaidExtension.appendChild(chatbotIcon);

    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    docuaidExtension.appendChild(chatbotContainer);

    // Create chatbot header
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chatbot-header';
    chatbotContainer.appendChild(chatbotHeader);

    // Create chatbot title
    const chatbotTitle = document.createElement('div');
    chatbotTitle.className = 'chatbot-title';
    chatbotTitle.textContent = 'DocuAid Assistant';
    chatbotHeader.appendChild(chatbotTitle);

    // Create chatbot controls
    const chatbotControls = document.createElement('div');
    chatbotControls.className = 'chatbot-controls';
    chatbotHeader.appendChild(chatbotControls);

    // Create theme toggle button based on current mode
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.id = 'theme-toggle';
    themeToggleBtn.title = 'Toggle Dark/Light Mode';

    // Set the icon based on the current mode
    const isDarkMode = docuaidExtension.classList.contains('dark-mode');
    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
        themeToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V5M12 19v-3M5 12H2M22 12h-3M19.07 5L17 7.07M7.07 7.07 5 5M7.07 17 5 19.07M19.07 19.07 17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    chatbotControls.appendChild(themeToggleBtn);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-btn';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    chatbotControls.appendChild(closeBtn);

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chatbot-messages';
    chatbotContainer.appendChild(messagesContainer);

    // Create user input container
    const userInputContainer = document.createElement('div');
    userInputContainer.className = 'user-input-container';
    chatbotContainer.appendChild(userInputContainer);

    // Create user input
    const userInput = document.createElement('textarea');
    userInput.id = 'user-input';
    userInput.placeholder = 'Ask me anything...';
    userInput.rows = 1;
    userInputContainer.appendChild(userInput);

    // Create send button
    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    userInputContainer.appendChild(sendButton);

    // Create footer
    const chatbotFooter = document.createElement('div');
    chatbotFooter.className = 'chatbot-footer';
    chatbotContainer.appendChild(chatbotFooter);

    // Create extract button
    const extractButton = document.createElement('button');
    extractButton.className = 'action-button';
    extractButton.id = 'extract-btn';
    extractButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9M13 2L20 9M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    extractButton.title = 'Extract Content';
    chatbotFooter.appendChild(extractButton);

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'action-button';
    clearButton.id = 'clear-btn';
    clearButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    clearButton.title = 'Clear Chat';
    chatbotFooter.appendChild(clearButton);

    // Create version text
    const versionText = document.createElement('div');
    versionText.className = 'version';
    versionText.textContent = 'v1.0.0';
    chatbotFooter.appendChild(versionText);

    // Add welcome message
    addMessage('bot', 'Hello! I\'m DocuAid Assistant. How can I help you understand this document?');

    // Setup event listeners
    setupEventListeners();

    console.log('[DocuAid] Chatbot initialized successfully');
}

function setupEventListeners() {
    console.log('[DocuAid] Setting up event listeners');
    const chatbotIcon = document.querySelector('#docuaid-extension .chatbot-icon');
    const chatbotContainer = document.querySelector('#docuaid-extension .chatbot-container');
    const closeBtn = document.querySelector('#docuaid-extension #close-btn');
    const userInput = document.querySelector('#docuaid-extension #user-input');
    const sendButton = document.querySelector('#docuaid-extension .send-button');
    const themeToggleBtn = document.querySelector('#docuaid-extension #theme-toggle');
    const extractButton = document.querySelector('#docuaid-extension #extract-btn');
    const clearButton = document.querySelector('#docuaid-extension #clear-btn');

    // Set up event listeners
    chatbotIcon.addEventListener('click', function () {
        console.log('[DocuAid] Chatbot icon clicked');
        chatbotContainer.classList.add('active');

        // Ensure the chatbot is visible with these explicit styles
        chatbotContainer.style.opacity = '1';
        chatbotContainer.style.visibility = 'visible';
        chatbotContainer.style.pointerEvents = 'auto';
        chatbotContainer.style.transform = 'translateY(0)';
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.flexDirection = 'column';

        // Make sure the controls are visible too
        const controls = document.querySelector('.chatbot-controls');
        if (controls) {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
        }

        // Initialize the chat area if it hasn't been initialized yet
        if (!document.querySelector('.chatbot-messages')) {
            initChatArea();
        }
    });

    closeBtn.addEventListener('click', function () {
        console.log('[DocuAid] Close button clicked');
        chatbotContainer.classList.remove('active');
        chatbotContainer.style.opacity = '0';
        chatbotContainer.style.visibility = 'hidden';
        chatbotContainer.style.pointerEvents = 'none';
    });

    // Send message when send button is clicked
    sendButton.addEventListener('click', sendMessage);

    // Send message when Enter key is pressed (not when Shift+Enter)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Toggle dark mode
    themeToggleBtn.addEventListener('click', () => {
        console.log('[DocuAid] Theme toggle clicked');
        const docuaidExtension = document.querySelector('#docuaid-extension');
        docuaidExtension.classList.toggle('dark-mode');

        // Store preference in localStorage
        const isDarkMode = docuaidExtension.classList.contains('dark-mode');
        localStorage.setItem('docuaid-dark-mode', isDarkMode);

        // Update icon
        if (isDarkMode) {
            themeToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else {
            themeToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V5M12 19v-3M5 12H2M22 12h-3M19.07 5L17 7.07M7.07 7.07 5 5M7.07 17 5 19.07M19.07 19.07 17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
    });

    // Extract content from the page
    extractButton.addEventListener('click', () => {
        extractContent();
    });

    // Clear chat
    clearButton.addEventListener('click', () => {
        clearChat();
    });

    // Toggle settings panel
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsButton = document.getElementById('close-settings-button');
    
    if (settingsButton && settingsPanel && closeSettingsButton) {
        settingsButton.addEventListener('click', () => {
            console.log('[DocuAid] Settings button clicked');
            settingsPanel.classList.add('active');
            // Prevent scrolling of messages when settings panel is open
            document.querySelector('.chatbot-messages').style.overflow = 'hidden';
        });
        
        closeSettingsButton.addEventListener('click', () => {
            console.log('[DocuAid] Close settings button clicked');
            settingsPanel.classList.remove('active');
            // Re-enable scrolling of messages when settings panel is closed
            document.querySelector('.chatbot-messages').style.overflow = 'auto';
        });
    } else {
        console.error('[DocuAid] Cannot find settings elements');
    }
}

function addMessage(type, content) {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content;

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(content) {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message system-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingIndicator;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

async function sendMessage() {
    const userInput = document.querySelector('#docuaid-extension #user-input');
    const userMessage = userInput.value.trim();

    if (!userMessage) return;

    // Add user message to chat
    addMessage('user', userMessage);

    // Clear input
    userInput.value = '';

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
        // Get API URL either from config or function
        const apiUrl = typeof apiConfig.getApiUrl === 'function' ?
            apiConfig.getApiUrl() : apiConfig.API_URL;

        console.log('[DocuAid] Sending message to:', `${apiUrl}${apiConfig.CHAT_ENDPOINT}`);

        // Create the request body with both parameters to ensure compatibility
        const requestBody = {
            question: userMessage,
            message: userMessage
        };

        console.log('[DocuAid] Request body:', JSON.stringify(requestBody));

        const response = await fetch(`${apiUrl}${apiConfig.CHAT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        if (!data || (!data.answer && !data.response)) {
            throw new Error('Invalid response format');
        }

        // Add bot response to chat
        const botResponse = data.answer || data.response;
        addMessage('bot', botResponse);

    } catch (error) {
        console.error('[DocuAid] Error:', error);
        removeTypingIndicator(typingIndicator);

        let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Sorry, I could not connect to the server. Please check your connection and try again.';
        } else if (error.message.includes('Invalid response format')) {
            errorMessage = 'Sorry, I received an invalid response from the server. Please try again.';
        }

        addSystemMessage(errorMessage);

        // Try to handle the error using the config error handler
        if (apiConfig.handleApiError) {
            const errorResult = apiConfig.handleApiError(error);
            if (errorResult.isPineconeError) {
                console.log('[DocuAid] Continuing without vector store');
            }
        }
    }
}

function extractContent() {
    console.log('[DocuAid] Extracting content...');
    addSystemMessage('Extracting content from the current page...');

    // Get the page content
    const pageTitle = document.title;
    const url = window.location.href;

    // For better extraction, get text content from main content areas
    let pageContent = '';

    // Try to target main content areas first
    const contentSelectors = [
        'article', 'main', '.content', '#content',
        '.article', '.post', '.page-content',
        '[role="main"]', 'section'
    ];

    let contentElement = null;
    for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
            // Find the largest content block
            let largestElement = elements[0];
            for (const el of elements) {
                if (el.textContent.length > largestElement.textContent.length) {
                    largestElement = el;
                }
            }
            contentElement = largestElement;
            break;
        }
    }

    // If no main content area found, use document.body
    pageContent = contentElement ?
        contentElement.textContent.trim() :
        document.body.textContent.trim();

    // Limit content size to avoid API issues (max 50K characters)
    if (pageContent.length > 50000) {
        console.log('[DocuAid] Content too large, truncating');
        pageContent = pageContent.substring(0, 50000);
        addSystemMessage('Content is very large, using only the first part of the page.');
    }

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Get API URL either from config or function
    const apiUrl = typeof apiConfig.getApiUrl === 'function' ?
        apiConfig.getApiUrl() : apiConfig.API_URL;

    console.log('[DocuAid] Sending content to API for extraction:', `${apiUrl}${apiConfig.EXTRACT_ENDPOINT}`);

    // Create the request body
    const extractRequestBody = {
        url: url,
        title: pageTitle,
        content: pageContent,
        html: document.documentElement.outerHTML
    };

    console.log('[DocuAid] Extract request body length:', JSON.stringify(extractRequestBody).length);

    // Send content to API
    fetch(`${apiUrl}${apiConfig.EXTRACT_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(extractRequestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);

            if (!data || (!data.content && !data.title)) {
                throw new Error('Invalid extraction response format');
            }

            // Show success message
            let displayContent = '';
            if (data.title) {
                displayContent += `**${data.title}**\n\n`;
            }
            displayContent += `Content extracted successfully! (${data.content ? Math.round(data.content.length / 1000) : 0}K characters)`;
            if (data.extraction_method) {
                displayContent += `\n\nMethod: ${data.extraction_method}`;
            }

            addSystemMessage(displayContent);
        })
        .catch(error => {
            console.error('[DocuAid] Extraction error:', error);
            removeTypingIndicator(typingIndicator);

            let errorMessage = 'Sorry, I encountered an error while extracting content. Please try again later.';

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Sorry, I could not connect to the server. Please check your connection and try again.';
            } else if (error.message.includes('Invalid extraction response format')) {
                errorMessage = 'Sorry, I received an invalid response while extracting content. Please try again.';
            }

            addSystemMessage(errorMessage);

            // Try to handle the error using the config error handler
            if (apiConfig.handleApiError) {
                const errorResult = apiConfig.handleApiError(error);
                if (errorResult.isPineconeError) {
                    console.log('[DocuAid] Continuing without vector store');
                }
            }
        });
}

function clearChat() {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');

    // Remove all messages except the welcome message
    while (messagesContainer.childNodes.length > 1) {
        messagesContainer.removeChild(messagesContainer.lastChild);
    }

    addSystemMessage('Chat cleared.');
}

function checkHealth() {
    console.log('[DocuAid] Checking API health...');

    fetch(`${apiConfig.API_URL}/health`)
        .then(response => {
            if (response.ok) {
                console.log('[DocuAid] API is healthy');
                return true;
            } else {
                console.error('[DocuAid] API health check failed');
                return false;
            }
        })
        .catch(error => {
            console.error('[DocuAid] Health check error:', error);
            return false;
        });
}

// Debug functions to help troubleshoot
window.docuaidDebug = {
    checkElements: function () {
        const elements = {
            container: document.querySelector('#docuaid-extension'),
            icon: document.querySelector('#docuaid-extension .chatbot-icon'),
            chatContainer: document.querySelector('#docuaid-extension .chatbot-container'),
            header: document.querySelector('#docuaid-extension .chatbot-header'),
            messages: document.querySelector('#docuaid-extension .chatbot-messages'),
            inputContainer: document.querySelector('#docuaid-extension .user-input-container'),
            footer: document.querySelector('#docuaid-extension .chatbot-footer')
        };

        console.log('[DocuAid Debug] UI Elements:', elements);
        return elements;
    },

    toggleChatbot: function () {
        const chatbotContainer = document.querySelector('#docuaid-extension .chatbot-container');
        chatbotContainer.classList.toggle('active');
        console.log('[DocuAid Debug] Toggled chatbot, is active:', chatbotContainer.classList.contains('active'));
    },

    fixEmergency: function () {
        // Force show chatbot
        const container = document.querySelector('#docuaid-extension .chatbot-container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            container.style.pointerEvents = 'all';
            container.style.transform = 'translateY(0)';
            container.classList.add('active');
            console.log('[DocuAid Debug] Emergency fix applied');
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}
