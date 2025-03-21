// Simple script to test the chatbot UI functionality
document.addEventListener('DOMContentLoaded', function () {
    console.log('DocuAid Test Script Loaded');

    // DOM elements
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeButton = document.getElementById('close-button');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const messagesContainer = document.getElementById('chatbot-messages');
    const extractButton = document.querySelector('.extract-button');

    // Toggle chatbot visibility when icon is clicked
    if (chatbotIcon) {
        console.log('Chatbot icon found in DOM');
        chatbotIcon.addEventListener('click', function () {
            console.log('Chatbot icon clicked');
            chatbotContainer.classList.toggle('active');
        });
    } else {
        console.error('Chatbot icon not found!');
    }

    // Close chatbot when close button is clicked
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            console.log('Close button clicked');
            chatbotContainer.classList.remove('active');
        });
    }

    // Send message when send button is clicked or Enter key is pressed
    if (sendButton && userInput) {
        sendButton.addEventListener('click', function () {
            sendMessage();
        });

        userInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Handle extract button click
    if (extractButton) {
        extractButton.addEventListener('click', function () {
            console.log('Extract button clicked');
            addMessage('Extracting page content... (Test mode)', 'bot');
        });
    }

    // Function to send a message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            console.log('Sending message:', message);
            addMessage(message, 'user');
            userInput.value = '';

            // Simulate bot response for testing
            setTimeout(() => {
                addMessage(`This is a test response to: "${message}"`, 'bot');
            }, 1000);
        }
    }

    // Function to add a message to the chat
    function addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender + '-message');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = content;

        messageElement.appendChild(messageContent);
        messagesContainer.appendChild(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Log UI status for debugging
    console.log('UI Elements:');
    console.log('- Chatbot Icon:', chatbotIcon ? 'Found' : 'Not found');
    console.log('- Chatbot Container:', chatbotContainer ? 'Found' : 'Not found');
    console.log('- User Input:', userInput ? 'Found' : 'Not found');
    console.log('- Send Button:', sendButton ? 'Found' : 'Not found');
    console.log('- Extract Button:', extractButton ? 'Found' : 'Not found');
}); 