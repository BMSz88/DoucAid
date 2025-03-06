const API_KEY = "AIzaSyD-TyxeUph5lJp4YgdGrS7cWiFBvTG97Z0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let uploadedDocument = null;
let extractedPageContent = "";
let chatHistory = [];

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

    // Create share interface with tabs
    

    const shareInterface = document.createElement('div');
    shareInterface.className = 'share-interface';
    shareInterface.innerHTML = `
        <div class="nav-tabs">
            <button class="nav-tab" data-tab="settings">Settings</button>
            <button class="nav-tab" data-tab="history">Chat History</button>
        </div>
        <div class="tab-content">
            <div id="settings-tab" class="tab-pane">
                <h2>SHARE US WITH YOUR FRIENDS</h2>
                <div class="share-buttons">
                    <a href="#" class="share-button whatsapp-share">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjVEMzY2Ij48cGF0aCBkPSJNMTcuNDcyIDEzLjM1N2MuMjk3LS4xNjkuNDk2LS40NTguNTQtLjc5Mi4wNDMtLjMzMy0uMDg2LS42NTMtLjM1Mi0uODc2TDE1LjM1IDkuNzljLS43MzMtLjQyNC0xLjY0Ny0uNDI0LTIuMzggMEwxMC42NiAxMS42OWMtLjI2Ni4yMjMtLjM5NS41NDMtLjM1Mi44NzYuMDQ0LjMzNC4yNDMuNjIzLjU0Ljc5MmwzLjMxIDEuOTFjLjczMy40MjQgMS42NDcuNDI0IDIuMzggMGwuOTM0LS41NHoiLz48cGF0aCBkPSJNMTIgMkM2LjQ4NiAyIDIgNi40ODYgMiAxMmMwIDEuNjY1LjQxMiAzLjIzMyAxLjEzNiA0LjYxbC0xLjEzIDMuMzkzIDMuMzk0LTEuMTNjMS4zNzcuNzI0IDIuOTQyIDEuMTM2IDQuNiAxLjEzNiA1LjUxNCAwIDEwLTQuNDg2IDEwLTEwUzE3LjUxNCAyIDEyIDJ6bTAgMTguNDJjLTEuNTIyIDAtMi45MzctLjQzLTQuMTQtMS4xN2wtMi44OTUuOTY1Ljk2NS0yLjg5NWMtLjc0LTEuMjAzLTEuMTctMi42MTgtMS4xNy00LjE0IDAtNC4zNSAzLjU3LTcuOTIgNy45Mi03LjkyIDQuMzUgMCA3LjkyIDMuNTcgNy45MiA3Ljkycy0zLjU3IDcuOTItNy45MiA3LjkyeiIvPjwvc3ZnPg==" alt="WhatsApp">
                        <span>WhatsApp</span>
                    </a>
                    <a href="#" class="share-button facebook-share">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMTg3N0YyIj48cGF0aCBkPSJNMjQgMTJjMC02LjYyNy01LjM3My0xMi0xMi0xMlMwIDUuMzczIDAgMTJjMCA1Ljk5IDQuMzg4IDEwLjk1NCAxMC4xMjUgMTEuODU0di04LjM4NUg3LjA3OFYxMmgzLjA0N1Y5LjM1NmMwLTMuMDA3IDEuNzkyLTQuNjY4IDQuNTMzLTQuNjY4YzEuMzEyIDAgMi42ODYuMjM0IDIuNjg2LjIzNHYyLjk1M0gxNS44M2MtMS40OTEgMC0xLjk1Ni45MjUtMS45NTYgMS44NzRWMTJoMy4zMjhsLS41MzIgMy40NjloLTIuNzk2djguMzg1QzE5LjYxMiAyMi45NTQgMjQgMTcuOTkgMjQgMTJ6Ii8+PC9zdmc+" alt="Facebook">
                        <span>Facebook</span>
                    </a>
                    <a href="#" class="share-button telegram-share">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjdBNkU2Ij48cGF0aCBkPSJNMjAuNjY1IDMuNzE3bC0xNy43MyA2LjgzN2MtMS4yMS40ODYtMS4yMDMgMS4xNjEtLjIyMiAxLjQ2Mmw0LjU1MiAxLjQyIDEwLjUzMi02LjQ3M2MuNDk4LS4zMDMuOTUyLS4xNC41NzguLjE5MmwtOC41MzMgNy43MDEtLjMzNSA0Ljk5YzAuMzMyIDAgLjQ3OC0uMTUuNjY4LS4zMzRsMi42MDEtMi41MjMgNC41MzcgMy4zNDNjLjgzOC40NjIgMS40NDEuMjE3IDEuNjQ5LS43NzRsMi45OTMtMTQuMDljLjMwNi0xLjIzNC0uNDctMS45MS0xLjI5LTEuNTF6Ii8+PC9zdmc+" alt="Telegram">
                        <span>Telegram</span>
                    </a>
                    <a href="#" class="share-button email-share">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjMyMzIzIj48cGF0aCBkPSJNMjAgNEg0Yy0xLjEgMC0yIC45LTIgMnYxMmMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjZjMC0xLjEtLjktMi0yLTJ6bTAgNGwtOCA1LTgtNVY2bDggNSA4LTV2MnoiLz48L3N2Zz4=" alt="Email">
                        <span>Email</span>
                    </a>
                    <button class="share-button copy-link">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA3NkZGIj48cGF0aCBkPSJNMTYgMTN2LTJIMTR2Mmgyem0tNi00aDJ2LTJIMTB2MnptMTQgNHYtMmgtMnYyaDJ6TTQgMTd2Mmgydi0ySDR6TTIwIDlIMTh2MmgyVjl6TTQgOUgydjJoMlY5em0xNi00VjNoLTJ2Mmgyem0wIDEydjJoMnYtMmgtMnpNMiAxN2gydjJIMnYtMnptMC04aDJ2LTJIMG0yIDBoMnYySDJ2LTJ6bTE2IDR2LTJoLTJ2Mmgyem0tOCAwdi0ySDh2MmgyeiIvPjwvc3ZnPg==" alt="Copy Link">
                        <span>Copy Link</span>
                    </button>
                </div>
            </div>
            <div id="history-tab" class="tab-pane">
                <div id="chat-history-list"></div>
            </div>
        </div>
    `;
    document.body.appendChild(shareInterface);


    // Add event listeners
    toggleButton.addEventListener('click', toggleChat);
    chatContainer.querySelector('.close-chat-btn').addEventListener('click', toggleChat);
    
    const likeButton = chatContainer.querySelector('.like-chat-btn');
    likeButton.addEventListener('click', toggleShareInterface);

    const shareButtons = shareInterface.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', handleShare);
    });

    const navTabs = shareInterface.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });

    // Close share interface when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.share-interface') && !e.target.closest('.like-chat-btn')) {
            shareInterface.classList.remove('show');
        }
    });

    // Load chat history from storage
    loadChatHistory();
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

// Toggle share interface visibility
    function toggleShareInterface(e) {
        e.stopPropagation();
        const shareInterface = document.querySelector('.share-interface');
        shareInterface.classList.toggle('show');
    }


// Handle share button clicks
    function handleShare(e) {
        e.preventDefault();
        const shareUrl = encodeURIComponent(window.location.href);
        const shareTitle = encodeURIComponent(document.title);
        const shareText = encodeURIComponent('Check out this awesome chatbot!');

        switch(e.currentTarget.className.split(' ')[1]) {
            case 'whatsapp-share':
                window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`);
                break;
            case 'facebook-share':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
                break;
            case 'telegram-share':
                window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`);
                break;
            case 'email-share':
                window.location.href = `mailto:?subject=${shareTitle}&body=${shareText}%20${shareUrl}`;
                break;
            case 'copy-link':
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        const button = e.currentTarget;
                        const originalText = button.querySelector('span').textContent;
                        button.querySelector('span').textContent = 'Copied!';
                        setTimeout(() => {
                            button.querySelector('span').textContent = originalText;
                        }, 2000);
                    });
                break;
        }
    }


// Handle tab clicks
    function handleTabClick(e) {
        const tabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        e.currentTarget.classList.add('active');
        const tabName = e.currentTarget.getAttribute('data-tab');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'history') {
            displayChatHistory();
        }
    }

// Send message
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userText = inputField.value.trim();
    if (!userText) return;

    const timestamp = new Date().toISOString();
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
        
        // Save to chat history
        chatHistory.push({
            timestamp,
            messages: [
                { type: 'user', text: userText },
                { type: 'bot', text: botReply }
            ]
        });
        saveChatHistory();
        
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

// Save chat history to storage
    function saveChatHistory() {
        chrome.storage.local.set({ chatHistory: chatHistory });
    }


// Load chat history from storage


// Display chat history

// Delete conversation from history


// Initialize when the content script loads
createChatElements();