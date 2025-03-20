// Add event listeners when the popup is loaded
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggleBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    const statusDiv = document.querySelector('.status');

    // Toggle the chatbot
    toggleBtn.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_chatbot" });
            window.close(); // Close the popup after toggling
        });
    });

    // Reload the extension in the current tab
    reloadBtn.addEventListener('click', function () {
        statusDiv.textContent = "Status: Reloading...";

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            // Reload the tab
            chrome.tabs.reload(tabs[0].id, function () {
                // Close the popup after reload is initiated
                window.close();
            });
        });
    });

    // Check if the chatbot is initialized on the current page
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "status_check" }, function (response) {
            if (chrome.runtime.lastError) {
                // Content script not running or connection error
                statusDiv.textContent = "Status: Not initialized";
                return;
            }

            if (response && response.status === "active") {
                statusDiv.textContent = "Status: Active on this page";
                toggleBtn.textContent = "Show DocuAid";
            } else {
                statusDiv.textContent = "Status: Initialized";
                toggleBtn.textContent = "Open DocuAid";
            }
        });
    });
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