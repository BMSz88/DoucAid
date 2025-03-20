document.addEventListener('DOMContentLoaded', function () {
    // Get buttons
    const toggleButton = document.getElementById('toggle-button');
    const extractButton = document.getElementById('extract-button');

    // Toggle chatbot visibility
    toggleButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: toggleChatbot
            });
        });
    });

    // Extract current page content
    extractButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: extractPage
            });
        });
    });
});

// Function to toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotIcon = document.getElementById('chatbot-icon');

    if (chatbotContainer && chatbotIcon) {
        if (chatbotContainer.classList.contains('active')) {
            chatbotContainer.classList.remove('active');
        } else {
            chatbotContainer.classList.add('active');
            const userInput = document.getElementById('user-input');
            if (userInput) userInput.focus();
        }
    }
}

// Function to extract page content
function extractPage() {
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotContainer = document.getElementById('chatbot-container');

    if (chatbotMessages && chatbotContainer) {
        // Make chatbot visible
        chatbotContainer.classList.add('active');

        // Get page content
        const pageTitle = document.title;
        const pageContent = document.body.innerText.substring(0, 500) + '...';

        // Add bot message with extracted content
        const botMessage = document.createElement('div');
        botMessage.classList.add('message', 'bot-message');
        botMessage.innerHTML = `
            <div class="message-content">
                <strong>Extracted from: ${pageTitle}</strong><br><br>
                ${pageContent}
            </div>
        `;
        chatbotMessages.appendChild(botMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
} 