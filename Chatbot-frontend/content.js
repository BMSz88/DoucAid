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
        const sendMessage = function () {
            const message = userInput.value.trim();
            if (message) {
                // Add user message
                addMessage(message, 'user');
                // Clear input
                userInput.value = '';
                // Simulate bot response (replace with actual API call)
                setTimeout(function () {
                    simulateBotResponse(message);
                }, 1000);
            }
        };

        sendButton.addEventListener('click', sendMessage);
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

    // Extract page content
    if (extractButton) {
        extractButton.addEventListener('click', function () {
            extractPageContent();
        });
    }
}

function addMessage(content, sender) {
    const chatbotMessages = document.getElementById('chatbot-messages');
    if (chatbotMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        chatbotMessages.appendChild(messageDiv);
        // Scroll to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

function simulateBotResponse(userMessage) {
    // In a real application, this would be an API call to your backend
    let botResponse = "I'm sorry, but I cannot access external content such as specific principles of object-oriented programming (OOP) from the provided URL. However, the four main principles of OOP are encapsulation, inheritance, polymorphism, and abstraction.";
    addMessage(botResponse, 'bot');
}

function extractPageContent() {
    // Get page title
    const pageTitle = document.title;

    // Get page content (simplified)
    let pageContent = "";
    const paragraphs = document.querySelectorAll('p');
    const maxParagraphs = Math.min(paragraphs.length, 3);

    for (let i = 0; i < maxParagraphs; i++) {
        pageContent += paragraphs[i].textContent + " ";
    }

    // Truncate if too long
    if (pageContent.length > 300) {
        pageContent = pageContent.substring(0, 300) + "...";
    }

    // Add message to chatbot
    addMessage(`<strong>Extracted from: ${pageTitle}</strong><br>${pageContent || "No content extracted. This page may have a different structure."}`, 'bot');

    // Show chatbot if not already visible
    const chatbotContainer = document.getElementById('chatbot-container');
    if (chatbotContainer && !chatbotContainer.classList.contains('active')) {
        chatbotContainer.classList.add('active');
    }
} 