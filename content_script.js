const API_KEY = "AIzaSyD-TyxeUph5lJp4YgdGrS7cWiFBvTG97Z0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let uploadedDocument = null;
let extractedPageContent = "";

// Create and inject the chat elements
function createChatElements() {
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chatbot-toggle';
    toggleButton.innerHTML = '💬';
    document.body.appendChild(toggleButton);

    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-container';
    chatContainer.innerHTML = `
        <div class="chat-header">
            <div class="header-info">
                <img src="${chrome.runtime.getURL('icon128.png')}" alt="Chat" class="chat-logo">
                <span class="logo-text">Docuaid Chatbot</span>
            </div>
            
            <button class="close-chat-btn">✖</button>
        </div>
        <button class="like-chat-btn">
    <img src="${chrome.runtime.getURL('123.png')}" alt="Like" class="like-icon">
</button>


        <div id="chat-box" class="chat-body"></div>
        <div class="chat-footer">
            <input type="text" id="user-input" placeholder="Type a message..." autocomplete="off">
            <div class="button-group">
                <label class="upload-btn" title="Upload Document">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <input type="file" id="file-input" accept=".txt,.pdf,.doc,.docx">
                </label>
                <button id="extract-btn" title="Extract Pages">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <line x1="9" y1="8" x2="15" y2="8"/>
                        <line x1="9" y1="12" x2="15" y2="12"/>
                        <line x1="9" y1="16" x2="13" y2="16"/>
                    </svg>
                </button>
                <button id="send-btn" title="Send Message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
        <div id="file-info" class="file-info"></div>
    `;
    document.body.appendChild(chatContainer);

    // Add event listeners
    toggleButton.addEventListener('click', toggleChat);
    chatContainer.querySelector('.close-chat-btn').addEventListener('click', toggleChat);

    // Initialize chat functionality
    initializeChatFunctionality();
}

// Toggle chat visibility
function toggleChat() {
    const chatContainer = document.getElementById('chatbot-container');
    const isOpen = chatContainer.classList.contains('open');
    
    if (isOpen) {
        chatContainer.classList.remove('open');
        document.body.classList.remove('chatbot-open');
    } else {
        chatContainer.classList.add('open');
        document.body.classList.add('chatbot-open');
    }
}

// Initialize chat functionality
function initializeChatFunctionality() {
    const fileInput = document.getElementById('file-input');
    const sendButton = document.getElementById('send-btn');
    const extractButton = document.getElementById('extract-btn');
    const userInput = document.getElementById('user-input');

    fileInput.addEventListener('change', handleFileUpload);
    sendButton.addEventListener('click', sendMessage);
    extractButton.addEventListener('click', extractPages);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedDocument = event.target.result;
            showFileInfo(file.name);
            addMessage('system', 'Document uploaded successfully!');
        };
        reader.readAsText(file);
    }
}

// Send message
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userText = inputField.value.trim();
    if (!userText) return;

    addMessage('user', userText);
    inputField.value = '';

    try {
        let context = uploadedDocument
            ? `Context from document: ${uploadedDocument}`
            : extractedPageContent
            ? `Page Context: ${extractedPageContent}`
            : "";
        const prompt = context ? `${context}\n\nUser Question: ${userText}` : userText;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your request.";
        addMessage('bot', botReply);
    } catch (error) {
        addMessage('bot', 'Error retrieving response.');
    }
}

// Extract pages
async function extractPages() {
    try {
        const pageText = document.body.innerText;
        extractedPageContent = pageText;
        addMessage('system', 'Page content extracted successfully!');
    } catch {
        addMessage('system', 'Error extracting page content.');
    }
}

// Add message to chat
function addMessage(type, text) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Show file info
function showFileInfo(fileName) {
    const fileInfo = document.getElementById('file-info');
    fileInfo.innerHTML = `
        <span>${fileName}</span>
        <button class="remove-file" onclick="removeFile()">×</button>
    `;
    fileInfo.className = 'file-info show';
}

// Remove file
function removeFile() {
    uploadedDocument = null;
    document.getElementById('file-input').value = '';
    document.getElementById('file-info').className = 'file-info';
    addMessage('system', 'Document removed');
}



// Initialize when the content script loads
createChatElements();