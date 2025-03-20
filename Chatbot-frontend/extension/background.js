// Simple background script to handle extension initialization
chrome.runtime.onInstalled.addListener((details) => {
    console.log('DocuAid extension installed or updated:', details.reason);
});

// Handle extension icon click to toggle the chatbot
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: toggleChatbot
        });
    });
});

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

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getState') {
        chrome.storage.sync.get(['enabled', 'theme'], function (result) {
            sendResponse(result);
        });
        return true;
    }

    if (request.action === 'setState') {
        chrome.storage.sync.set(request.state, function () {
            sendResponse({ success: true });
        });
        return true;
    }
}); 