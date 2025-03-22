// Direct content script injection
console.log("[DocuAid] Simple chatbot starting...");

// Force immediate execution
document.addEventListener('DOMContentLoaded', initializeChatbot);
window.addEventListener('load', initializeChatbot);

// Also try immediate execution
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeChatbot, 100);
}

// Safety timeout
setTimeout(initializeChatbot, 1000);

// Track initialization
let chatbotInitialized = false;

function initializeChatbot() {
  if (chatbotInitialized) {
    console.log("[DocuAid] Chatbot already initialized, skipping");
    return;
  }
  
  console.log("[DocuAid] Initializing chatbot");
  chatbotInitialized = true;
  
  // Inject minimal CSS directly
  injectStyles();
  
  // Create minimal DOM structure
  createChatbotElements();
  
  // Set up minimal event listeners
  setupMinimalEvents();
}

function injectStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Core styles for DocuAid chatbot */
    .docuaid-fixed {
      position: fixed;
      z-index: 9999999;
    }
    
    #docuaid-bubble {
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: #467DF6;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      opacity: 1 !important;
      visibility: visible !important;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    #docuaid-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 12px rgba(0,0,0,0.4);
    }
    
    #docuaid-bubble svg {
      width: 32px;
      height: 32px;
      fill: white;
    }
    
    #docuaid-chat {
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
    }
    
    #docuaid-chat.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    #docuaid-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: #467DF6;
      color: white;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }
    
    #docuaid-close {
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #docuaid-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background-color: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .docuaid-message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-family: Arial, sans-serif;
      position: relative;
    }
    
    .docuaid-bot {
      align-self: flex-start;
      background-color: #e9ecef;
      color: #212529;
    }
    
    .docuaid-user {
      align-self: flex-end;
      background-color: #467DF6;
      color: white;
    }
    
    #docuaid-input-area {
      display: flex;
      padding: 12px;
      border-top: 1px solid #ddd;
    }
    
    #docuaid-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ced4da;
      border-radius: 20px;
      outline: none;
      font-family: Arial, sans-serif;
      resize: none;
      height: 40px;
      max-height: 120px;
      overflow-y: auto;
    }
    
    #docuaid-send {
      width: 40px;
      height: 40px;
      margin-left: 8px;
      background-color: #467DF6;
      border: none;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  `;
  document.head.appendChild(styleElement);
}

function createChatbotElements() {
  // Create bubble
  const bubble = document.createElement('div');
  bubble.id = 'docuaid-bubble';
  bubble.className = 'docuaid-fixed';
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" />
    </svg>
  `;
  document.body.appendChild(bubble);
  
  // Create chat container
  const chat = document.createElement('div');
  chat.id = 'docuaid-chat';
  chat.className = 'docuaid-fixed';
  
  // Create chat header
  const header = document.createElement('div');
  header.id = 'docuaid-header';
  header.innerHTML = `
    <div>DocuAid Assistant</div>
    <div id="docuaid-close">✕</div>
  `;
  chat.appendChild(header);
  
  // Create messages area
  const messages = document.createElement('div');
  messages.id = 'docuaid-messages';
  chat.appendChild(messages);
  
  // Add welcome message
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'docuaid-message docuaid-bot';
  welcomeMsg.textContent = 'Hello! I\'m your DocuAid Assistant. How can I help you today?';
  messages.appendChild(welcomeMsg);
  
  // Create input area
  const inputArea = document.createElement('div');
  inputArea.id = 'docuaid-input-area';
  inputArea.innerHTML = `
    <textarea id="docuaid-input" placeholder="Type your message here..."></textarea>
    <button id="docuaid-send">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
      </svg>
    </button>
  `;
  chat.appendChild(inputArea);
  
  // Add to document
  document.body.appendChild(chat);
}

function setupMinimalEvents() {
  // Open chat when bubble is clicked
  const bubble = document.getElementById('docuaid-bubble');
  const chat = document.getElementById('docuaid-chat');
  
  if (bubble && chat) {
    bubble.addEventListener('click', () => {
      console.log("[DocuAid] Bubble clicked");
      chat.classList.add('visible');
    });
    
    // Close chat when X is clicked
    const closeBtn = document.getElementById('docuaid-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log("[DocuAid] Close button clicked");
        chat.classList.remove('visible');
      });
    }
    
    // Handle send button
    const sendBtn = document.getElementById('docuaid-send');
    const input = document.getElementById('docuaid-input');
    
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        sendMessage();
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }
  }
}

function sendMessage() {
  const input = document.getElementById('docuaid-input');
  const messages = document.getElementById('docuaid-messages');
  
  if (!input || !messages || !input.value.trim()) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'docuaid-message docuaid-user';
  userMsg.textContent = input.value.trim();
  messages.appendChild(userMsg);
  
  // Clear input
  const userInput = input.value.trim();
  input.value = '';
  
  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
  
  // Mock response after short delay
  setTimeout(() => {
    // Add bot message
    const botMsg = document.createElement('div');
    botMsg.className = 'docuaid-message docuaid-bot';
    botMsg.textContent = `I received your message: "${userInput}". This is a demo response. The real DocuAid assistant will provide helpful information based on your query.`;
    messages.appendChild(botMsg);
    
    // Scroll to bottom again
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
} 