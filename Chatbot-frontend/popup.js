// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggle-chatbot');
    const extractButton = document.getElementById('extract-page');

    // Toggle chatbot visibility
    if (toggleButton) {
        toggleButton.addEventListener('click', function () {
            // Query for the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                // Execute script in the active tab
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: toggleChatbot
                });
            });
            // Close popup
            window.close();
        });
    }

    // Extract current page content
    if (extractButton) {
        extractButton.addEventListener('click', function () {
            // Query for the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                // Execute script in the active tab
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: extractPage
                });
            });
            // Close popup
            window.close();
        });
    }
});

// Function to toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
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
        console.log('Chatbot container not found on this page');
    }
}

// Function to extract page content
function extractPage() {
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotMessages = document.getElementById('chatbot-messages');

    if (chatbotContainer && chatbotMessages) {
        // Make chatbot visible
        chatbotContainer.classList.add('active');

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
        const botMessage = document.createElement('div');
        botMessage.classList.add('message', 'bot-message');
        botMessage.innerHTML = `
            <div class="message-content">
                <strong>Extracted from: ${pageTitle}</strong><br>
                ${pageContent || "No content extracted. This page may have a different structure."}
            </div>
        `;
        chatbotMessages.appendChild(botMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    } else {
        console.log('Chatbot container or messages element not found on this page');
    }
} 