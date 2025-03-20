// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
    console.log('DocuAid Extension installed:', details.reason);
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
    // Execute script in the active tab to toggle chatbot
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: toggleChatbot
    });
});

// Function to toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotIcon = document.getElementById('chatbot-icon');
    const userInput = document.getElementById('user-input');

    if (chatbotContainer) {
        // Toggle active class
        if (chatbotContainer.classList.contains('active')) {
            chatbotContainer.classList.remove('active');
        } else {
            chatbotContainer.classList.add('active');
            // Focus on input field
            if (userInput) {
                setTimeout(() => userInput.focus(), 300);
            }
        }
    } else {
        // If chatbot not yet initialized, initialize it
        if (typeof initializeChatbot === 'function') {
            initializeChatbot();
            // After initialization, make it active
            setTimeout(() => {
                const container = document.getElementById('chatbot-container');
                if (container) {
                    container.classList.add('active');
                    const input = document.getElementById('user-input');
                    if (input) input.focus();
                }
            }, 300);
        }
    }
} 