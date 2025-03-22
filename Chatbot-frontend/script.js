// Self-executing function to ensure immediate initialization
(function() {
    console.log('[DocuAid] Immediate execution started');
    
    // Create a style element to inject CSS directly
    const style = document.createElement('style');
    style.textContent = `
        #docuaid-root {
            position: fixed;
            z-index: 9999;
            font-family: Arial, sans-serif;
        }
        
        #docuaid-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: #467DF6;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            z-index: 9998;
            visibility: visible;
            opacity: 1;
            transition: all 0.3s ease;
            border: none;
        }
        
        #docuaid-container {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 350px;
            height: 500px;
            max-height: 70vh;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 9999;
            pointer-events: none;
            overflow: hidden;
            border: none;
        }
        
        #docuaid-container.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            pointer-events: auto;
        }
        
        #docuaid-messages {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            scroll-behavior: smooth;
            background-color: transparent;
        }
        
        .message {
            padding: 10px;
            border-radius: 8px;
            max-width: 80%;
            position: relative;
        }
        
        .user-message {
            align-self: flex-end;
            background-color: #467DF6;
            color: white;
        }
        
        .bot-message {
            align-self: flex-start;
            background-color: #f0f0f0;
            color: #333;
        }
    `;
    document.head.appendChild(style);
    
    // Create root element
    const rootElement = document.createElement('div');
    rootElement.id = 'docuaid-root';
    document.body.appendChild(rootElement);
    
    // Create chatbot icon
    const chatbotIcon = document.createElement('div');
    chatbotIcon.id = 'docuaid-icon';
    chatbotIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white"/></svg>';
    rootElement.appendChild(chatbotIcon);
    
    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'docuaid-container';
    rootElement.appendChild(chatbotContainer);
    
    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'docuaid-messages';
    chatbotContainer.appendChild(messagesContainer);
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message bot-message';
    welcomeMessage.innerHTML = '<div class="message-content">Hello! I\'m your DocuAid Assistant. How can I help you today?</div>';
    messagesContainer.appendChild(welcomeMessage);
    
    // Setup basic click event for icon
    chatbotIcon.addEventListener('click', function() {
        console.log('[DocuAid] Icon clicked in direct injection');
        chatbotContainer.classList.add('active');
    });
    
    console.log('[DocuAid] Direct injection complete');
})();

// Global API configuration
if (typeof apiConfig === 'undefined') {
    window.apiConfig = {
        API_URL: 'https://api.docuaid.online',
        CHAT_ENDPOINT: '/chat',
        EXTRACT_ENDPOINT: '/extract',
        handleApiError: function(error) {
            console.error('API Error:', error);
            return { isPineconeError: false };
        },
        getApiUrl: function() {
            return localStorage.getItem('docuaid-api-endpoint') || 'https://api.docuaid.online';
        }
    };
}

// Chat history data structure
let chatHistory = [];

// Function to get the current chat session ID
function getChatSessionId() {
    // Create a new session ID if one doesn't exist
    let sessionId = localStorage.getItem('docuaid-current-session-id');
    if (!sessionId) {
        sessionId = 'session_' + new Date().toISOString().replace(/[:.]/g, '_');
        localStorage.setItem('docuaid-current-session-id', sessionId);
    }
    return sessionId;
}

// Function to save message to chat history
function saveMessageToHistory(type, content) {
    // Check if history storage is enabled
    const storeHistory = localStorage.getItem('docuaid-store-history') !== 'false'; // Default true
    if (!storeHistory) return;
    
    const currentSession = getChatSessionId();
    const timestamp = new Date().toISOString();
    const message = {
        type: type,
        content: content,
        timestamp: timestamp,
        sessionId: currentSession,
        url: window.location.href,
        pageTitle: document.title
    };
    
    // Get existing history from localStorage
    let history = JSON.parse(localStorage.getItem('docuaid-chat-history') || '[]');
    
    // Add the new message
    history.push(message);
    
    // Limit history to 500 messages (to prevent localStorage overflow)
    if (history.length > 500) {
        history = history.slice(history.length - 500);
    }
    
    // Save updated history
    localStorage.setItem('docuaid-chat-history', JSON.stringify(history));
    
    // Update in-memory history
    chatHistory = history;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DocuAid] Content script loaded');
    initChatbot();
});

function initChatbot() {
    console.log('[DocuAid] Initializing chatbot...');

    // Check if chatbot already exists
    if (document.getElementById('docuaid-extension')) {
        console.log('[DocuAid] Chatbot already initialized');
        return;
    }

    // Create main container
    const docuaidExtension = document.createElement('div');
    docuaidExtension.id = 'docuaid-extension';
    docuaidExtension.style.position = 'fixed';
    docuaidExtension.style.zIndex = '9997';
    docuaidExtension.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(docuaidExtension);

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('docuaid-dark-mode');
    if (savedDarkMode === 'true') {
        console.log('[DocuAid] Applying saved dark mode preference');
        docuaidExtension.classList.add('dark-mode');
    }

    // Create chatbot icon with explicit styles to ensure visibility
    const chatbotIcon = document.createElement('div');
    chatbotIcon.className = 'chatbot-icon';
    chatbotIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white"/></svg>';
    
    // Apply inline styles to ensure visibility
    chatbotIcon.style.position = 'fixed';
    chatbotIcon.style.bottom = '20px';
    chatbotIcon.style.right = '20px';
    chatbotIcon.style.width = '50px';
    chatbotIcon.style.height = '50px';
    chatbotIcon.style.backgroundColor = '#467DF6';
    chatbotIcon.style.borderRadius = '50%';
    chatbotIcon.style.display = 'flex';
    chatbotIcon.style.justifyContent = 'center';
    chatbotIcon.style.alignItems = 'center';
    chatbotIcon.style.cursor = 'pointer';
    chatbotIcon.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    chatbotIcon.style.zIndex = '9998';
    chatbotIcon.style.visibility = 'visible';
    chatbotIcon.style.opacity = '1';
    chatbotIcon.style.transition = 'all 0.3s ease';
    chatbotIcon.style.border = 'none';
    
    docuaidExtension.appendChild(chatbotIcon);

    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    chatbotContainer.id = 'chatbot-container';

    // Apply explicit styles to ensure correct initial state
    chatbotContainer.style.position = 'fixed';
    chatbotContainer.style.bottom = '80px';
    chatbotContainer.style.right = '20px';
    chatbotContainer.style.width = '350px';
    chatbotContainer.style.height = '500px';
    chatbotContainer.style.maxHeight = '70vh';
    chatbotContainer.style.backgroundColor = '#fff';
    chatbotContainer.style.borderRadius = '10px';
    chatbotContainer.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.2)';
    chatbotContainer.style.display = 'flex';
    chatbotContainer.style.flexDirection = 'column';
    chatbotContainer.style.opacity = '0';
    chatbotContainer.style.visibility = 'hidden';
    chatbotContainer.style.transform = 'translateY(20px)';
    chatbotContainer.style.transition = 'all 0.3s ease';
    chatbotContainer.style.zIndex = '9999';
    chatbotContainer.style.pointerEvents = 'none';
    chatbotContainer.style.overflow = 'hidden';
    chatbotContainer.style.border = 'none';

    docuaidExtension.appendChild(chatbotContainer);

    // Create chatbot header
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chat-header';
    chatbotContainer.appendChild(chatbotHeader);

    // Create messages container with explicit styles
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chatbot-messages';
    messagesContainer.id = 'messages';
    
    // Apply explicit styles to ensure correct rendering
    messagesContainer.style.flex = '1';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.overflowX = 'hidden';
    messagesContainer.style.padding = '15px';
    messagesContainer.style.display = 'flex';
    messagesContainer.style.flexDirection = 'column';
    messagesContainer.style.gap = '10px';
    messagesContainer.style.scrollBehavior = 'smooth';
    messagesContainer.style.backgroundColor = 'transparent';
    
    // Append messages container to chatbot container
    chatbotContainer.appendChild(messagesContainer);
    
    // Add initial welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message bot-message';
    welcomeMessage.innerHTML = '<div class="message-content">Hello! I\'m your DocuAid Assistant. How can I help you today?</div>';
    messagesContainer.appendChild(welcomeMessage);

    // Create chatbot title
    const chatbotTitle = document.createElement('div');
    chatbotTitle.className = 'chatbot-title';
    chatbotTitle.textContent = 'DocuAid Assistant';
    chatbotHeader.appendChild(chatbotTitle);

    // Create chatbot controls
    const chatbotControls = document.createElement('div');
    chatbotControls.className = 'chatbot-controls';
    chatbotHeader.appendChild(chatbotControls);

    // Create theme toggle button
    const themeToggleButton = document.createElement('button');
    themeToggleButton.className = 'theme-toggle-button';
    themeToggleButton.id = 'theme-toggle';
    
    // Set the initial icon based on the current theme
    const isDarkMode = docuaidExtension.classList.contains('dark-mode');
    if (isDarkMode) {
        themeToggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"></path></svg>';
    } else {
        themeToggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    }
    
    themeToggleButton.setAttribute('title', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
    chatbotControls.appendChild(themeToggleButton);

    // Create clear chat button
    const clearChatButton = document.createElement('button');
    clearChatButton.className = 'clear-chat-button';
    clearChatButton.id = 'clear-chat';
    clearChatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    clearChatButton.setAttribute('title', 'Clear chat');
    chatbotControls.appendChild(clearChatButton);

    // Create settings button
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.id = 'settings-button';
    settingsButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>';
    chatbotControls.appendChild(settingsButton);

    // Create help button for keyboard shortcuts
    const helpButton = document.createElement('button');
    helpButton.className = 'help-button';
    helpButton.id = 'help-button';
    helpButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    helpButton.setAttribute('title', 'Keyboard shortcuts');
    chatbotControls.appendChild(helpButton);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-btn';
    closeBtn.className = 'close-button';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    chatbotControls.appendChild(closeBtn);

    // Create Settings Panel
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';
    settingsPanel.id = 'settings-panel';
    
    // Create settings header
    const settingsHeader = document.createElement('div');
    settingsHeader.className = 'settings-header';
    
    const settingsTitle = document.createElement('h2');
    settingsTitle.textContent = 'Settings';
    settingsHeader.appendChild(settingsTitle);
    
    const closeSettingsButton = document.createElement('button');
    closeSettingsButton.className = 'close-settings-button';
    closeSettingsButton.id = 'close-settings-button';
    closeSettingsButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>';
    settingsHeader.appendChild(closeSettingsButton);
    
    settingsPanel.appendChild(settingsHeader);
    
    // Create settings content
    const settingsContent = document.createElement('div');
    settingsContent.className = 'settings-content';
    
    // Appearance Section
    const appearanceSection = document.createElement('div');
    appearanceSection.className = 'settings-section';
    
    const appearanceTitle = document.createElement('h3');
    appearanceTitle.className = 'settings-section-title';
    appearanceTitle.textContent = 'Appearance';
    appearanceSection.appendChild(appearanceTitle);
    
    // Theme Option
    const themeOption = document.createElement('div');
    themeOption.className = 'settings-option';
    
    const themeLabel = document.createElement('span');
    themeLabel.textContent = 'Theme';
    themeOption.appendChild(themeLabel);
    
    const themeToggleContainer = document.createElement('div');
    themeToggleContainer.className = 'toggle-switch';
    
    const themeToggleSwitch = document.createElement('input');
    themeToggleSwitch.type = 'checkbox';
    themeToggleSwitch.id = 'theme-toggle-switch';
    themeToggleSwitch.className = 'toggle-switch-checkbox';
    themeToggleContainer.appendChild(themeToggleSwitch);
    
    const themeToggleSwitchLabel = document.createElement('label');
    themeToggleSwitchLabel.htmlFor = 'theme-toggle-switch';
    themeToggleSwitchLabel.className = 'toggle-switch-label';
    themeToggleSwitchLabel.innerHTML = '<span class="toggle-switch-inner"></span><span class="toggle-switch-switch"></span>';
    themeToggleContainer.appendChild(themeToggleSwitchLabel);
    
    const themeLabelText = document.createElement('span');
    themeLabelText.className = 'toggle-label';
    themeLabelText.id = 'theme-label';
    themeLabelText.textContent = 'Light';
    themeToggleContainer.appendChild(themeLabelText);
    
    themeOption.appendChild(themeToggleContainer);
    appearanceSection.appendChild(themeOption);
    
    // Font Size Option
    const fontSizeOption = document.createElement('div');
    fontSizeOption.className = 'settings-option';
    
    const fontSizeLabel = document.createElement('span');
    fontSizeLabel.textContent = 'Font Size';
    fontSizeOption.appendChild(fontSizeLabel);
    
    const fontSizeContainer = document.createElement('div');
    fontSizeContainer.className = 'select-container';
    
    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.id = 'font-size-select';
    fontSizeSelect.className = 'settings-select';
    
    const smallOption = document.createElement('option');
    smallOption.value = 'small';
    smallOption.textContent = 'Small';
    fontSizeSelect.appendChild(smallOption);
    
    const mediumOption = document.createElement('option');
    mediumOption.value = 'medium';
    mediumOption.textContent = 'Medium';
    mediumOption.selected = true;
    fontSizeSelect.appendChild(mediumOption);
    
    const largeOption = document.createElement('option');
    largeOption.value = 'large';
    largeOption.textContent = 'Large';
    fontSizeSelect.appendChild(largeOption);
    
    fontSizeContainer.appendChild(fontSizeSelect);
    fontSizeOption.appendChild(fontSizeContainer);
    appearanceSection.appendChild(fontSizeOption);
    
    settingsContent.appendChild(appearanceSection);
    
    // Behavior Section
    const behaviorSection = document.createElement('div');
    behaviorSection.className = 'settings-section';
    
    const behaviorTitle = document.createElement('h3');
    behaviorTitle.className = 'settings-section-title';
    behaviorTitle.textContent = 'Behavior';
    behaviorSection.appendChild(behaviorTitle);
    
    // Auto-extract Option
    const autoExtractOption = document.createElement('div');
    autoExtractOption.className = 'settings-option';
    
    const autoExtractLabel = document.createElement('span');
    autoExtractLabel.textContent = 'Auto-extract Content';
    autoExtractOption.appendChild(autoExtractLabel);
    
    const autoExtractToggleContainer = document.createElement('div');
    autoExtractToggleContainer.className = 'toggle-switch';
    
    const autoExtractSwitch = document.createElement('input');
    autoExtractSwitch.type = 'checkbox';
    autoExtractSwitch.id = 'auto-extract-switch';
    autoExtractSwitch.className = 'toggle-switch-checkbox';
    autoExtractToggleContainer.appendChild(autoExtractSwitch);
    
    const autoExtractSwitchLabel = document.createElement('label');
    autoExtractSwitchLabel.htmlFor = 'auto-extract-switch';
    autoExtractSwitchLabel.className = 'toggle-switch-label';
    autoExtractSwitchLabel.innerHTML = '<span class="toggle-switch-inner"></span><span class="toggle-switch-switch"></span>';
    autoExtractToggleContainer.appendChild(autoExtractSwitchLabel);
    
    autoExtractOption.appendChild(autoExtractToggleContainer);
    behaviorSection.appendChild(autoExtractOption);
    
    // Send on Enter Option
    const sendOnEnterOption = document.createElement('div');
    sendOnEnterOption.className = 'settings-option';
    
    const sendOnEnterLabel = document.createElement('span');
    sendOnEnterLabel.textContent = 'Send on Enter';
    sendOnEnterOption.appendChild(sendOnEnterLabel);
    
    const sendOnEnterToggleContainer = document.createElement('div');
    sendOnEnterToggleContainer.className = 'toggle-switch';
    
    const sendOnEnterSwitch = document.createElement('input');
    sendOnEnterSwitch.type = 'checkbox';
    sendOnEnterSwitch.id = 'send-on-enter-switch';
    sendOnEnterSwitch.className = 'toggle-switch-checkbox';
    sendOnEnterSwitch.checked = true;
    sendOnEnterToggleContainer.appendChild(sendOnEnterSwitch);
    
    const sendOnEnterSwitchLabel = document.createElement('label');
    sendOnEnterSwitchLabel.htmlFor = 'send-on-enter-switch';
    sendOnEnterSwitchLabel.className = 'toggle-switch-label';
    sendOnEnterSwitchLabel.innerHTML = '<span class="toggle-switch-inner"></span><span class="toggle-switch-switch"></span>';
    sendOnEnterToggleContainer.appendChild(sendOnEnterSwitchLabel);
    
    sendOnEnterOption.appendChild(sendOnEnterToggleContainer);
    behaviorSection.appendChild(sendOnEnterOption);
    
    settingsContent.appendChild(behaviorSection);
    
    // Privacy Section
    const privacySection = document.createElement('div');
    privacySection.className = 'settings-section';
    
    const privacyTitle = document.createElement('h3');
    privacyTitle.className = 'settings-section-title';
    privacyTitle.textContent = 'Privacy';
    privacySection.appendChild(privacyTitle);
    
    // Store Chat History Option
    const storeChatHistoryOption = document.createElement('div');
    storeChatHistoryOption.className = 'settings-option';
    
    const storeChatHistoryLabel = document.createElement('span');
    storeChatHistoryLabel.textContent = 'Store Chat History';
    storeChatHistoryOption.appendChild(storeChatHistoryLabel);
    
    const storeChatHistoryToggleContainer = document.createElement('div');
    storeChatHistoryToggleContainer.className = 'toggle-switch';
    
    const storeHistorySwitch = document.createElement('input');
    storeHistorySwitch.type = 'checkbox';
    storeHistorySwitch.id = 'store-history-switch';
    storeHistorySwitch.className = 'toggle-switch-checkbox';
    storeHistorySwitch.checked = true;
    storeChatHistoryToggleContainer.appendChild(storeHistorySwitch);
    
    const storeHistorySwitchLabel = document.createElement('label');
    storeHistorySwitchLabel.htmlFor = 'store-history-switch';
    storeHistorySwitchLabel.className = 'toggle-switch-label';
    storeHistorySwitchLabel.innerHTML = '<span class="toggle-switch-inner"></span><span class="toggle-switch-switch"></span>';
    storeChatHistoryToggleContainer.appendChild(storeHistorySwitchLabel);
    
    storeChatHistoryOption.appendChild(storeChatHistoryToggleContainer);
    privacySection.appendChild(storeChatHistoryOption);

    // View History Button Option
    const viewHistoryOption = document.createElement('div');
    viewHistoryOption.className = 'settings-option';
    
    const viewHistoryButton = document.createElement('button');
    viewHistoryButton.id = 'view-history-button';
    viewHistoryButton.className = 'settings-button';
    viewHistoryButton.textContent = 'View Chat History';
    viewHistoryOption.appendChild(viewHistoryButton);
    
    privacySection.appendChild(viewHistoryOption);
    
    // Clear History Button Option
    const clearHistoryOption = document.createElement('div');
    clearHistoryOption.className = 'settings-option';
    
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.id = 'clear-history-button';
    clearHistoryButton.className = 'settings-button';
    clearHistoryButton.textContent = 'Clear Chat History';
    clearHistoryOption.appendChild(clearHistoryButton);
    
    privacySection.appendChild(clearHistoryOption);
    
    settingsContent.appendChild(privacySection);
    
    // About Section
    const aboutSection = document.createElement('div');
    aboutSection.className = 'settings-section';
    
    const aboutTitle = document.createElement('h3');
    aboutTitle.className = 'settings-section-title';
    aboutTitle.textContent = 'About';
    aboutSection.appendChild(aboutTitle);
    
    const aboutInfo = document.createElement('div');
    aboutInfo.className = 'about-info';
    
    const versionInfo = document.createElement('p');
    versionInfo.textContent = 'Version: 1.0.0';
    aboutInfo.appendChild(versionInfo);
    
    const copyrightInfo = document.createElement('p');
    copyrightInfo.textContent = '© 2025 DocuAid. All rights reserved.';
    aboutInfo.appendChild(copyrightInfo);
    
    const privacyLink = document.createElement('p');
    const privacyAnchor = document.createElement('a');
    privacyAnchor.href = 'https://www.docuaid.online/privacy';
    privacyAnchor.target = '_blank';
    privacyAnchor.textContent = 'Privacy Policy';
    privacyLink.appendChild(privacyAnchor);
    aboutInfo.appendChild(privacyLink);
    
    const termsLink = document.createElement('p');
    const termsAnchor = document.createElement('a');
    termsAnchor.href = 'https://www.docuaid.online/terms';
    termsAnchor.target = '_blank';
    termsAnchor.textContent = 'Terms of Service';
    termsLink.appendChild(termsAnchor);
    aboutInfo.appendChild(termsLink);
    
    aboutSection.appendChild(aboutInfo);
    
    settingsContent.appendChild(aboutSection);
    
    settingsPanel.appendChild(settingsContent);
    chatbotContainer.appendChild(settingsPanel);

    // Create History Modal
    const historyModal = document.createElement('div');
    historyModal.className = 'history-modal';
    historyModal.id = 'history-modal';
    
    // Create history header
    const historyHeader = document.createElement('div');
    historyHeader.className = 'history-header';
    
    const historyTitle = document.createElement('h2');
    historyTitle.textContent = 'Chat History';
    historyHeader.appendChild(historyTitle);
    
    const closeHistoryButton = document.createElement('button');
    closeHistoryButton.className = 'close-history-button';
    closeHistoryButton.id = 'close-history-button';
    closeHistoryButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>';
    historyHeader.appendChild(closeHistoryButton);
    
    historyModal.appendChild(historyHeader);
    
    // Create history content
    const historyContent = document.createElement('div');
    historyContent.className = 'history-content';
    
    // Session list container
    const sessionList = document.createElement('div');
    sessionList.className = 'session-list';
    sessionList.id = 'session-list';
    historyContent.appendChild(sessionList);
    
    // Session messages container
    const sessionMessages = document.createElement('div');
    sessionMessages.className = 'session-messages';
    sessionMessages.id = 'session-messages';
    
    // Empty state for session messages
    const emptyState = document.createElement('div');
    emptyState.className = 'session-empty-state';
    emptyState.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>Select a chat session from the list to view its messages</p>
    `;
    sessionMessages.appendChild(emptyState);
    
    historyContent.appendChild(sessionMessages);
    historyModal.appendChild(historyContent);
    
    chatbotContainer.appendChild(historyModal);

    // Create user input container
    const userInputContainer = document.createElement('div');
    userInputContainer.className = 'user-input-container';
    chatbotContainer.appendChild(userInputContainer);

    // Create user input
    const userInput = document.createElement('textarea');
    userInput.id = 'user-input';
    userInput.placeholder = 'Ask me anything...';
    userInput.rows = 1;
    userInput.maxLength = 2000; // Set max length
    userInputContainer.appendChild(userInput);

    // Create character counter
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.innerHTML = '0/2000';
    userInputContainer.appendChild(charCounter);

    // Create send button
    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.id = 'send-button';
    sendButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    userInputContainer.appendChild(sendButton);

    // Create footer
    const chatbotFooter = document.createElement('div');
    chatbotFooter.className = 'chatbot-footer';
    chatbotContainer.appendChild(chatbotFooter);

    // Create extract button
    const extractButton = document.createElement('button');
    extractButton.className = 'action-button';
    extractButton.id = 'extract-btn';
    extractButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9M13 2L20 9M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    extractButton.title = 'Extract Content';
    chatbotFooter.appendChild(extractButton);

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'action-button';
    clearButton.id = 'clear-btn';
    clearButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    clearButton.title = 'Clear Chat';
    chatbotFooter.appendChild(clearButton);

    // Create version text
    const versionText = document.createElement('div');
    versionText.className = 'version';
    // Replace simple text with linked version
    const versionLink = document.createElement('a');
    versionLink.href = 'https://www.docuaid.online';
    versionLink.target = '_blank';
    versionLink.textContent = 'DocuAid V1.0';
    versionLink.style.color = 'inherit';
    versionLink.style.textDecoration = 'none';
    versionText.appendChild(versionLink);
    chatbotFooter.appendChild(versionText);

    // Add welcome message
    addMessage('bot', 'Hello! I\'m DocuAid Assistant. How can I help you understand this document?');

    // Create shortcuts help modal
    const shortcutsModal = document.createElement('div');
    shortcutsModal.className = 'shortcuts-modal';
    shortcutsModal.id = 'shortcuts-modal';
    
    const shortcutsContent = document.createElement('div');
    shortcutsContent.className = 'shortcuts-content';
    
    const shortcutsHeader = document.createElement('div');
    shortcutsHeader.className = 'shortcuts-header';
    
    const shortcutsTitle = document.createElement('h3');
    shortcutsTitle.textContent = 'Keyboard Shortcuts';
    shortcutsHeader.appendChild(shortcutsTitle);
    
    const closeShortcutsButton = document.createElement('button');
    closeShortcutsButton.className = 'close-shortcuts-button';
    closeShortcutsButton.id = 'close-shortcuts-button';
    closeShortcutsButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>';
    shortcutsHeader.appendChild(closeShortcutsButton);
    
    shortcutsContent.appendChild(shortcutsHeader);
    
    const shortcutsList = document.createElement('div');
    shortcutsList.className = 'shortcuts-list';
    
    // Add shortcuts
    const shortcuts = [
        { key: 'Ctrl + Enter', desc: 'Send message' },
        { key: 'Esc', desc: 'Close chatbot' },
        { key: 'Ctrl + L', desc: 'Clear chat' },
        { key: 'Ctrl + K', desc: 'Focus input' },
        { key: 'Ctrl + E', desc: 'Extract content' },
        { key: 'Ctrl + D', desc: 'Toggle dark mode' },
        { key: 'Ctrl + ?', desc: 'Show this help' }
    ];
    
    shortcuts.forEach(shortcut => {
        const shortcutItem = document.createElement('div');
        shortcutItem.className = 'shortcut-item';
        
        const shortcutKey = document.createElement('div');
        shortcutKey.className = 'shortcut-key';
        shortcutKey.innerHTML = `<kbd>${shortcut.key}</kbd>`;
        
        const shortcutDesc = document.createElement('div');
        shortcutDesc.className = 'shortcut-desc';
        shortcutDesc.textContent = shortcut.desc;
        
        shortcutItem.appendChild(shortcutKey);
        shortcutItem.appendChild(shortcutDesc);
        shortcutsList.appendChild(shortcutItem);
    });
    
    shortcutsContent.appendChild(shortcutsList);
    shortcutsModal.appendChild(shortcutsContent);
    docuaidExtension.appendChild(shortcutsModal);

    // Setup event listeners
    setupEventListeners();

    console.log('[DocuAid] Chatbot initialized successfully');
}

function setupEventListeners() {
    console.log('[DocuAid] Setting up event listeners');
    const chatbotIcon = document.querySelector('#docuaid-extension .chatbot-icon');
    const chatbotContainer = document.querySelector('#docuaid-extension .chatbot-container');
    const closeBtn = document.querySelector('#docuaid-extension #close-btn');
    const userInput = document.querySelector('#docuaid-extension #user-input');
    const sendButton = document.querySelector('#docuaid-extension .send-button');
    const extractButton = document.querySelector('#docuaid-extension #extract-btn');
    const clearButton = document.querySelector('#docuaid-extension #clear-btn');
    const settingsButton = document.querySelector('#docuaid-extension #settings-button');
    const closeSettingsButton = document.querySelector('#docuaid-extension #close-settings-button');
    const settingsPanel = document.querySelector('#docuaid-extension #settings-panel');
    const docuaidExtension = document.getElementById('docuaid-extension');
    
    if (!chatbotIcon) {
        console.error('[DocuAid] Chatbot icon not found!');
        return;
    }

    if (!chatbotContainer) {
        console.error('[DocuAid] Chatbot container not found!');
        return;
    }

    // Set up event listeners
    chatbotIcon.addEventListener('click', function (e) {
        console.log('[DocuAid] Chatbot icon clicked');
        e.stopPropagation(); // Prevent event bubbling
        
        // Add active class to show the chatbot
        chatbotContainer.classList.add('active');

        // Ensure the chatbot is visible with explicit styles
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.flexDirection = 'column';
        chatbotContainer.style.opacity = '1';
        chatbotContainer.style.visibility = 'visible';
        chatbotContainer.style.transform = 'translateY(0)';
        chatbotContainer.style.pointerEvents = 'auto';
        chatbotContainer.style.zIndex = '10000';
        
        // Focus the input field
        if (userInput) {
            setTimeout(() => userInput.focus(), 300);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
        console.log('[DocuAid] Close button clicked');
            e.stopPropagation(); // Prevent event bubbling
            
        chatbotContainer.classList.remove('active');
            
            // Hide with explicit styles
        chatbotContainer.style.opacity = '0';
        chatbotContainer.style.visibility = 'hidden';
        chatbotContainer.style.pointerEvents = 'none';
            chatbotContainer.style.transform = 'translateY(20px)';
    });
    } else {
        console.error('[DocuAid] Close button not found!');
    }

    // Settings button click handler
    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            console.log('[DocuAid] Settings button clicked');
            if (settingsPanel) {
                console.log('[DocuAid] Settings panel found, adding active class');
                // Add active class
                settingsPanel.classList.add('active');
                
                // Apply explicit styles to ensure visibility
                settingsPanel.style.transform = 'translateX(0)';
                settingsPanel.style.opacity = '1';
                settingsPanel.style.visibility = 'visible';
                settingsPanel.style.pointerEvents = 'auto';
                settingsPanel.style.display = 'flex';
                settingsPanel.style.zIndex = '100000';
                
                console.log('[DocuAid] Settings panel active state:', settingsPanel.classList.contains('active'));
                console.log('[DocuAid] Settings panel computed style:', window.getComputedStyle(settingsPanel).transform);
            } else {
                console.error('[DocuAid] Settings panel not found!');
            }
        });
    } else {
        console.error('[DocuAid] Settings button not found!');
    }

    // Close settings button click handler
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', function() {
            console.log('[DocuAid] Close settings button clicked');
            if (settingsPanel) {
                console.log('[DocuAid] Settings panel found, removing active class');
                // Remove active class
                settingsPanel.classList.remove('active');
                
                // Apply explicit styles to hide
                settingsPanel.style.transform = 'translateX(100%)';
                settingsPanel.style.opacity = '0';
                settingsPanel.style.visibility = 'hidden';
                settingsPanel.style.pointerEvents = 'none';
            } else {
                console.error('[DocuAid] Settings panel not found!');
            }
        });
    } else {
        console.error('[DocuAid] Close settings button not found!');
    }

    // Send message when send button is clicked
    sendButton.addEventListener('click', sendMessage);

    // Send message when Enter key is pressed (not when Shift+Enter)
    userInput.addEventListener('keydown', (e) => {
        // Check if we should send on enter
        const sendOnEnter = localStorage.getItem('docuaid-send-on-enter') !== 'false'; // Default to true
        
        if (e.key === 'Enter' && !e.shiftKey && sendOnEnter) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Extract content when extract button is clicked
    if (extractButton) {
        extractButton.addEventListener('click', extractContent);
    }

    // Clear chat when clear button is clicked
    if (clearButton) {
        clearButton.addEventListener('click', clearChat);
    }
    
    // Theme toggling in chat header
    const themeToggleBtn = document.querySelector('#docuaid-extension #theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // Toggle dark mode class
            docuaidExtension.classList.toggle('dark-mode');
            
            // Save the preference to localStorage
            const isDarkMode = docuaidExtension.classList.contains('dark-mode');
            localStorage.setItem('docuaid-dark-mode', isDarkMode);
            
            // Update button title and icon
            themeToggleBtn.setAttribute('title', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
            
            if (isDarkMode) {
                themeToggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"></path></svg>';
            } else {
                themeToggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
            }
        });
    }
    
    // Setup settings specific event listeners
    setupSettingsEventListeners();
    
    // Load saved settings
    loadSavedSettings();

    // Add event listener for clear chat button
    const clearChatButton = document.querySelector('#docuaid-extension #clear-chat');
    if (clearChatButton) {
        clearChatButton.addEventListener('click', clearChat);
    }

    // Add auto-resize and character counter for input
    const userInput = document.querySelector('#docuaid-extension #user-input');
    const charCounter = document.querySelector('#docuaid-extension .char-counter');
    
    if (userInput && charCounter) {
        // Update character counter
        userInput.addEventListener('input', function() {
            // Update character count
            const currentLength = userInput.value.length;
            charCounter.innerHTML = `${currentLength}/2000`;
            
            // Change color when approaching limit
            if (currentLength > 1800) {
                charCounter.classList.add('char-limit-warning');
            } else {
                charCounter.classList.remove('char-limit-warning');
            }
            
            // Auto-resize the textarea
            autoResizeTextarea(userInput);
        });
        
        // Initial sizing
        autoResizeTextarea(userInput);
    }

    // Help button for keyboard shortcuts
    const helpButton = document.querySelector('#docuaid-extension #help-button');
    const shortcutsModal = document.querySelector('#docuaid-extension #shortcuts-modal');
    const closeShortcutsButton = document.querySelector('#docuaid-extension #close-shortcuts-button');
    
    if (helpButton && shortcutsModal) {
        helpButton.addEventListener('click', function() {
            shortcutsModal.classList.add('active');
        });
    }
    
    if (closeShortcutsButton && shortcutsModal) {
        closeShortcutsButton.addEventListener('click', function() {
            shortcutsModal.classList.remove('active');
        });
    }
    
    // Setup global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        const chatbotContainer = document.querySelector('#docuaid-extension .chatbot-container');
        const isChatbotActive = chatbotContainer && chatbotContainer.classList.contains('active');
        const userInput = document.querySelector('#docuaid-extension #user-input');
        const isInputFocused = document.activeElement === userInput;
        
        // ESC key to close chatbot
        if (e.key === 'Escape' && isChatbotActive) {
            document.querySelector('#docuaid-extension #close-btn').click();
        }
        
        // Ctrl + Enter to send message (when input is focused)
        if (e.ctrlKey && e.key === 'Enter' && isInputFocused) {
            document.querySelector('#docuaid-extension #send-button').click();
        }
        
        // Ctrl + L to clear chat
        if (e.ctrlKey && e.key === 'l' && isChatbotActive) {
            e.preventDefault(); // Prevent browser address bar focus
            clearChat();
        }
        
        // Ctrl + K to focus input
        if (e.ctrlKey && e.key === 'k' && isChatbotActive) {
            e.preventDefault();
            userInput.focus();
        }
        
        // Ctrl + E to extract content
        if (e.ctrlKey && e.key === 'e' && isChatbotActive) {
            e.preventDefault();
            const extractButton = document.querySelector('#docuaid-extension #extract-btn');
            if (extractButton) extractButton.click();
        }
        
        // Ctrl + D to toggle dark mode
        if (e.ctrlKey && e.key === 'd' && isChatbotActive) {
            e.preventDefault();
            const themeToggleBtn = document.querySelector('#docuaid-extension #theme-toggle');
            if (themeToggleBtn) themeToggleBtn.click();
        }
        
        // Ctrl + ? to show shortcuts help
        if (e.ctrlKey && e.key === '/' && isChatbotActive) {
            e.preventDefault();
            shortcutsModal.classList.add('active');
        }
    });
}

function addMessage(type, content) {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) {
        console.error('[DocuAid] Messages container not found');
        
        // Try to find container with alternative selectors as fallback
        const altContainer = document.querySelector('#docuaid-extension .chatbot-messages') || 
                            document.querySelector('.chatbot-messages');
        
        if (!altContainer) {
            console.error('[DocuAid] Could not find messages container with alternative selectors');
            return;
        }
        
        console.log('[DocuAid] Using alternative messages container');
        messagesContainer = altContainer;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process the content to make URLs clickable
    const processedContent = makeLinksClickable(content);
    messageContent.innerHTML = processedContent;
    
    // Add copy button for bot messages
    if (type === 'bot') {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor" /></svg>';
        copyButton.title = 'Copy to clipboard';
        copyButton.addEventListener('click', () => {
            copyMessageToClipboard(content);
        });
        messageElement.appendChild(copyButton);
    }

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);

    // Save message to history
    saveMessageToHistory(type, content);

    // Scroll to bottom with a smooth animation
    scrollToBottom(messagesContainer);
}

// Function to convert URLs in text to clickable links
function makeLinksClickable(text) {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Replace URLs with clickable links
    return text.replace(urlRegex, (url) => {
        // Check if URL is already in an HTML tag
        const isInHtmlTag = isUrlInHtmlTag(text, url);
        if (isInHtmlTag) {
            return url;
        }
        
        // Clean the URL to remove any trailing punctuation
        let cleanUrl = url;
        const lastChar = cleanUrl.slice(-1);
        if (['.', ',', ')', ']', ';', ':', '!', '?'].includes(lastChar)) {
            cleanUrl = cleanUrl.slice(0, -1);
        }
        
        // Create a safe display URL (truncate if too long)
        let displayUrl = cleanUrl;
        if (displayUrl.length > 50) {
            displayUrl = displayUrl.substring(0, 47) + '...';
        }
        
        // Create a target="_blank" link with security attributes
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="external-link">${displayUrl}</a>${lastChar === url.slice(-1) ? lastChar : ''}`;
    });
}

// Helper function to check if URL is already in an HTML tag
function isUrlInHtmlTag(text, url) {
    const urlIndex = text.indexOf(url);
    const beforeUrl = text.substring(0, urlIndex);
    
    // Count number of opening and closing tags before the URL
    const openingTags = (beforeUrl.match(/<a/g) || []).length;
    const closingTags = (beforeUrl.match(/<\/a>/g) || []).length;
    
    // If there are more opening tags than closing tags, 
    // the URL is likely already in an HTML tag
    return openingTags > closingTags;
}

// Function to copy message content to clipboard
function copyMessageToClipboard(html) {
    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get the text content from the HTML
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Use the Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textContent)
            .then(() => {
                showCopySuccessToast();
            })
            .catch(err => {
                console.error('[DocuAid] Failed to copy text: ', err);
                fallbackCopyToClipboard(textContent);
            });
    } else {
        fallbackCopyToClipboard(textContent);
    }
}

// Fallback method for clipboard copy
function fallbackCopyToClipboard(text) {
    try {
        // Create text area
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Make it invisible
        textArea.style.position = 'fixed';
        textArea.style.opacity = 0;
        
        document.body.appendChild(textArea);
        textArea.select();
        
        // Execute copy command
        const successful = document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(textArea);
        
        if (successful) {
            showCopySuccessToast();
        }
    } catch (err) {
        console.error('[DocuAid] Fallback copy failed: ', err);
    }
}

// Show a toast notification when copy succeeds
function showCopySuccessToast() {
    let toast = document.getElementById('docuaid-copy-toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'docuaid-copy-toast';
        toast.className = 'copy-toast';
        toast.textContent = 'Copied to clipboard!';
        
        document.querySelector('#docuaid-extension').appendChild(toast);
    }
    
    // Show the toast
    toast.classList.add('active');
    
    // Hide after 2 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 2000);
}

// Smart scroll to bottom with animation
function scrollToBottom(container) {
    if (!container) {
        console.error('[DocuAid] Container not provided for scrollToBottom');
        return;
    }
    
    try {
        // Smooth scroll to bottom
        setTimeout(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    } catch (error) {
        console.error('[DocuAid] Error scrolling to bottom:', error);
        // Fallback to basic scrolling
        container.scrollTop = container.scrollHeight;
    }
}

// Show new message indicator when user isn't at the bottom
function showNewMessageIndicator(container) {
    // Check if indicator already exists
    let indicator = document.querySelector('#docuaid-new-message-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'docuaid-new-message-indicator';
        indicator.className = 'new-message-indicator';
        indicator.innerHTML = '<span>New message ↓</span>';
        indicator.addEventListener('click', () => {
            // Scroll to bottom when clicked
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
            // Hide the indicator
            indicator.style.display = 'none';
        });
        
        // Add to container
        document.querySelector('#docuaid-extension .chatbot-container').appendChild(indicator);
    } else {
        // Show existing indicator
        indicator.style.display = 'flex';
    }
}

function addSystemMessage(content) {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message system-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);

    // Save system message to history
    saveMessageToHistory('system', content);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingIndicator;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

// Function to send message to the bot
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const userMessage = userInput ? userInput.value.trim() : '';
    
    if(userMessage.length === 0) return;
    
    // Clear the input field
    if (userInput) {
        userInput.value = '';
        
        // Reset the character counter if it exists
        const charCounter = document.querySelector('#docuaid-extension .char-counter');
        if (charCounter) {
            charCounter.innerHTML = '0/2000';
            charCounter.classList.remove('char-limit-warning');
        }
        
        // Reset textarea height
        autoResizeTextarea(userInput);
    }

    // Add user message to chat
    addMessage('user', userMessage);

    // Show typing indicator instead of loading
    const typingIndicator = showTypingIndicator();

    try {
        // Check if content has been extracted
        const hasExtractedContent = window.docuaidExtractedContent && 
                                   window.docuaidExtractedContent.content && 
                                   window.docuaidExtractedContent.content.length > 0;
                                   
        // Check if auto-extract setting is enabled (default to false to prevent automatic extraction)
        const autoExtract = localStorage.getItem('docuaid-auto-extract') === 'true';
        
        // If no content has been extracted and auto-extract is enabled, extract first
        if (!hasExtractedContent && autoExtract && userMessage.toLowerCase().includes('this page')) {
            // Remove typing indicator temporarily
            removeTypingIndicator(typingIndicator);
            
            // Extract content and then proceed with answering
            return extractContent(() => {
                // After extraction is complete, call sendMessage again to process the original question
                sendMessageWithContent(userMessage);
            });
        }
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a response
        let response;
        if (hasExtractedContent) {
            // If we have extracted content, use it to generate a response
            response = generateAnswerFromExtractedContent(userMessage);
        } else {
            // Otherwise, generate a response based on general knowledge
            response = generateGeneralKnowledgeResponse(userMessage);
        }
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        // Add bot response to chat
        addMessage('bot', response);

    } catch (error) {
        console.error('[DocuAid] Error:', error);
        removeTypingIndicator(typingIndicator);

        let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Sorry, I could not connect to the server. Please check your connection and try again.';
        } else if (error.message.includes('Invalid response format')) {
            errorMessage = 'Sorry, I received an invalid response from the server. Please try again.';
        }

        addSystemMessage(errorMessage);

        // Try to handle the error using the config error handler
        if (apiConfig.handleApiError) {
            const errorResult = apiConfig.handleApiError(error);
            if (errorResult.isPineconeError) {
                console.log('[DocuAid] Continuing without vector store');
            }
        }
    } finally {
        // Hide loading indicator regardless of success or failure
        hideLoadingIndicator();
    }
}

// Function to show loading indicator
function showLoadingIndicator() {
    let messagesContainer = document.getElementById('messages');
    if (!messagesContainer) {
        console.error('[DocuAid] Messages container not found in showLoadingIndicator');
        
        // Try to find container with alternative selectors as fallback
        const altContainer = document.querySelector('#docuaid-extension .chatbot-messages') || 
                           document.querySelector('.chatbot-messages');
        
        if (!altContainer) {
            console.error('[DocuAid] Could not find messages container with alternative selectors');
            return;
        }
        
        console.log('[DocuAid] Using alternative messages container');
        messagesContainer = altContainer;
    }
    
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message bot-message loading-message';
    loadingMessage.id = 'loading-indicator';
    
    const loadingDots = document.createElement('div');
    loadingDots.className = 'loading-dots';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        loadingDots.appendChild(dot);
    }
    
    loadingMessage.appendChild(loadingDots);
    messagesContainer.appendChild(loadingMessage);
    
    // Scroll to bottom of chat
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to hide loading indicator
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Helper function to send message when content is available
async function sendMessageWithContent(userMessage, hadError = false) {
    // If there was an error during extraction, respond differently
    if (hadError) {
        const errorResponse = "I apologize, but I encountered an error while extracting content from this page. I'll still try to answer your question with my general knowledge.";
        addMessage('bot', errorResponse + "\n\n" + generateSriLankaFallbackResponse(userMessage));
        return;
    }
    
    const typingIndicator = showTypingIndicator();
    
    try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a demo response using the extracted content
        const demoResponse = generateDemoResponse(userMessage);
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        // Add bot response to chat
        addMessage('bot', demoResponse);
    } catch (error) {
        console.error('[DocuAid] Error:', error);
        removeTypingIndicator(typingIndicator);
        
        addSystemMessage('Sorry, I encountered an error while processing your request with the extracted content.');
        
        // Still try to provide some response
        const fallbackResponse = generateSriLankaFallbackResponse(userMessage);
        if (fallbackResponse) {
            addMessage('bot', "Let me try to answer with my general knowledge instead:\n\n" + fallbackResponse);
        }
    }
}

// Fallback responses for Sri Lanka related questions
function generateSriLankaFallbackResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // If the message doesn't mention Sri Lanka, return null
    if (!lowerCaseMessage.includes('sri lanka')) {
        return null;
    }
    
    // Define common Sri Lanka topics and their answers
    const sriLankaFacts = {
        "capital": "Sri Jayawardenepura Kotte is the administrative capital of Sri Lanka, while Colombo is the commercial capital and largest city.",
        "population": "As of recent estimates, Sri Lanka has a population of approximately 22 million people.",
        "language": "The official languages of Sri Lanka are Sinhala and Tamil. English is also commonly used, especially in government and education.",
        "religion": "Buddhism is the majority religion in Sri Lanka, practiced by about 70% of the population. Other religions include Hinduism, Islam, and Christianity.",
        "currency": "The currency of Sri Lanka is the Sri Lankan Rupee (LKR).",
        "independence": "Sri Lanka gained independence from British rule on February 4, 1948.",
        "flag": "The Sri Lankan flag features a golden lion holding a sword on a maroon background with four Bo tree leaves in the corners. The flag also has orange and green vertical stripes representing the Tamil and Muslim communities.",
        "president": "I have information about Sri Lanka's political system, but for the most current information about who is serving as president, you might want to check a more up-to-date source.",
        "tourist": "Sri Lanka is famous for its ancient ruins, beautiful beaches, tea plantations, wildlife, and cultural heritage. Popular tourist destinations include Sigiriya Rock Fortress, Kandy, Galle Fort, Yala National Park, and the hill country around Nuwara Eliya.",
        "food": "Sri Lankan cuisine is known for its complex flavors and spices. Popular dishes include rice and curry, hoppers (a type of pancake), string hoppers, kottu roti, and various seafood dishes. The cuisine often features coconut, chili peppers, and an array of spices.",
        "history": "Sri Lanka has a rich history dating back over 3,000 years. It was known as Ceylon during colonial times and has been influenced by various cultures including Indian, Portuguese, Dutch, and British.",
        "weather": "Sri Lanka has a tropical climate with distinct wet and dry seasons. The weather varies by region, with the central highlands being cooler than the coastal areas.",
        "economy": "Sri Lanka's economy is based on agriculture, tourism, and exports like tea, spices, textiles, and rubber. Tea exports, particularly Ceylon tea, are a significant source of revenue.",
        "geography": "Sri Lanka is an island nation in South Asia, located in the Indian Ocean. It features diverse landscapes including mountains, rainforests, beaches, and plains.",
        "wildlife": "Sri Lanka has diverse wildlife including elephants, leopards, sloth bears, and various species of birds. It's known for having one of the highest densities of leopards in the world."
    };
    
    // Check each topic to see if it's mentioned in the user message
    for (const [topic, answer] of Object.entries(sriLankaFacts)) {
        if (lowerCaseMessage.includes(topic)) {
            return answer;
        }
    }
    
    // Handle variations of 'Where is Sri Lanka'
    if (lowerCaseMessage.includes('where') || lowerCaseMessage.includes('located')) {
        return "Sri Lanka is an island nation located in South Asia, in the Indian Ocean. It sits southeast of India and is separated from the Indian subcontinent by the Gulf of Mannar and the Palk Strait.";
    }
    
    // Generic Sri Lanka query
    return "Sri Lanka is an island nation in South Asia known for its diverse landscapes, rich cultural heritage, and historical significance. It's famous for its ancient Buddhist ruins, beautiful beaches, tea plantations, and wildlife. Is there a specific aspect of Sri Lanka you'd like to know more about?";
}

// Helper function to generate demo responses
function generateDemoResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Check if we have extracted content
    const hasExtractedContent = window.docuaidExtractedContent && 
                               window.docuaidExtractedContent.content && 
                               window.docuaidExtractedContent.content.length > 0;
    
    // If we have extracted content, use it to generate a response
    if (hasExtractedContent) {
        return generateAnswerFromExtractedContent(userMessage);
    } else {
        // Otherwise, generate a response based on general knowledge
        return generateGeneralKnowledgeResponse(userMessage);
    }
}

function extractContent(callback) {
    console.log('[DocuAid] Extracting content...');
    addSystemMessage('Extracting content from the current page...');

    try {
    // Get the page content
    const pageTitle = document.title;
    const url = window.location.href;

    // For better extraction, get text content from main content areas
    let pageContent = '';

    // Try to target main content areas first
    const contentSelectors = [
        'article', 'main', '.content', '#content',
        '.article', '.post', '.page-content',
        '[role="main"]', 'section'
    ];

    let contentElement = null;
    for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
            // Find the largest content block
            let largestElement = elements[0];
            for (const el of elements) {
                if (el.textContent.length > largestElement.textContent.length) {
                    largestElement = el;
                }
            }
            contentElement = largestElement;
            break;
        }
    }

    // If no main content area found, use document.body
    pageContent = contentElement ?
        contentElement.textContent.trim() :
        document.body.textContent.trim();

        // Fallback if content is too short
        if (pageContent.length < 100) {
            console.log('[DocuAid] Content too short, using full body content');
            pageContent = document.body.textContent.trim();
        }

    // Limit content size to avoid API issues (max 50K characters)
    if (pageContent.length > 50000) {
        console.log('[DocuAid] Content too large, truncating');
        pageContent = pageContent.substring(0, 50000);
        addSystemMessage('Content is very large, using only the first part of the page.');
    }

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Simulate content extraction for demo
    setTimeout(() => {
            try {
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Show success message
        let displayContent = '';
        if (pageTitle) {
            displayContent += `**${pageTitle}**\n\n`;
        }
        displayContent += `Content extracted successfully! (${Math.round(pageContent.length / 1000)}K characters)`;
        displayContent += `\n\nMethod: Direct HTML Content Extraction`;
        
        addSystemMessage(displayContent);
        
        // Store the extracted content for later use
        window.docuaidExtractedContent = {
            title: pageTitle,
            content: pageContent,
            url: url,
            timestamp: new Date().toISOString()
        };
        
        console.log('[DocuAid] Content extracted and stored locally:', window.docuaidExtractedContent);
                
                // Call the callback if provided
                if (typeof callback === 'function') {
                    callback(false); // No error
                }
            } catch (innerError) {
                console.error('[DocuAid] Error in extraction callback:', innerError);
                removeTypingIndicator(typingIndicator);
                addSystemMessage('Sorry, I encountered an error processing the extracted content.');
            }
    }, 2000);
    } catch (error) {
        console.error('[DocuAid] Error during content extraction:', error);
        addSystemMessage('Sorry, I encountered an error while extracting content from this page. Please try again or try with a different page.');
        
        // Call the callback with error flag if provided
        if (typeof callback === 'function') {
            callback(true); // Indicate error occurred
        }
    }
}

function clearChat() {
    let messagesContainer = document.getElementById('messages');
    if (!messagesContainer) {
        console.error('[DocuAid] Messages container not found in clearChat');
        
        // Try to find container with alternative selectors as fallback
        const altContainer = document.querySelector('#docuaid-extension .chatbot-messages') || 
                           document.querySelector('.chatbot-messages');
        
        if (!altContainer) {
            console.error('[DocuAid] Could not find messages container with alternative selectors');
            return;
        }
        
        console.log('[DocuAid] Using alternative messages container');
        messagesContainer = altContainer;
    }
    
    // Clear all messages
    messagesContainer.innerHTML = '';
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message bot-message';
    welcomeMessage.innerHTML = '<div class="message-content">Chat cleared. How can I help you today?</div>';
    messagesContainer.appendChild(welcomeMessage);
    
    // Reset current session ID
    const newSessionId = 'session_' + new Date().toISOString().replace(/[:.]/g, '_');
    localStorage.setItem('docuaid-current-session-id', newSessionId);
    
    console.log('[DocuAid] Chat cleared, new session created:', newSessionId);
}

function checkHealth() {
    console.log('[DocuAid] Checking API health...');

    fetch(`${apiConfig.API_URL}/health`)
        .then(response => {
            if (response.ok) {
                console.log('[DocuAid] API is healthy');
                return true;
            } else {
                console.error('[DocuAid] API health check failed');
                return false;
            }
        })
        .catch(error => {
            console.error('[DocuAid] Health check error:', error);
            return false;
        });
}

// Debug functions to help troubleshoot
window.docuaidDebug = {
    checkElements: function () {
        const elements = {
            container: document.querySelector('#docuaid-extension'),
            icon: document.querySelector('#docuaid-extension .chatbot-icon'),
            chatContainer: document.querySelector('#docuaid-extension .chatbot-container'),
            header: document.querySelector('#docuaid-extension .chatbot-header'),
            messages: document.querySelector('#docuaid-extension .chatbot-messages'),
            inputContainer: document.querySelector('#docuaid-extension .user-input-container'),
            footer: document.querySelector('#docuaid-extension .chatbot-footer'),
            settingsPanel: document.querySelector('#docuaid-extension #settings-panel'),
            settingsButton: document.querySelector('#docuaid-extension #settings-button')
        };

        console.log('[DocuAid Debug] UI Elements:', elements);
        return elements;
    },

    toggleChatbot: function () {
        const chatbotContainer = document.querySelector('#docuaid-extension .chatbot-container');
        chatbotContainer.classList.toggle('active');
        console.log('[DocuAid Debug] Toggled chatbot, is active:', chatbotContainer.classList.contains('active'));
    },

    fixEmergency: function () {
        // Force show chatbot
        const container = document.querySelector('#docuaid-extension .chatbot-container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            container.style.pointerEvents = 'all';
            container.style.transform = 'translateY(0)';
            container.classList.add('active');
            console.log('[DocuAid Debug] Emergency fix applied');
        }
    },
    
    showSettings: function() {
        const settingsPanel = document.querySelector('#docuaid-extension #settings-panel');
        if (settingsPanel) {
            // Add active class
            settingsPanel.classList.add('active');
            
            // Apply explicit styles to ensure visibility
            settingsPanel.style.transform = 'translateX(0)';
            settingsPanel.style.opacity = '1';
            settingsPanel.style.visibility = 'visible';
            settingsPanel.style.pointerEvents = 'auto';
            settingsPanel.style.display = 'flex';
            settingsPanel.style.zIndex = '100000';
            
            console.log('[DocuAid Debug] Settings panel should be visible now');
            return true;
        } else {
            console.error('[DocuAid Debug] Settings panel not found!');
            return false;
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}

// Add a window load event for redundancy
window.addEventListener('load', function() {
    // Check if chatbot has already been initialized
    if (!document.getElementById('docuaid-extension')) {
        console.log('[DocuAid] Initializing via window load event');
        initChatbot();
    }
});

// Add a safety timeout to ensure initialization
setTimeout(function() {
    if (!document.getElementById('docuaid-extension')) {
        console.log('[DocuAid] Delayed initialization');
        initChatbot();
    }
}, 1000);

// Load saved settings function
function loadSavedSettings() {
    console.log('[DocuAid] Loading saved settings');
    
    // Load theme setting
    const savedDarkMode = localStorage.getItem('docuaid-dark-mode') === 'true';
    const themeToggleSwitch = document.getElementById('theme-toggle-switch');
    const themeLabel = document.getElementById('theme-label');
    
    if (themeToggleSwitch) {
        themeToggleSwitch.checked = savedDarkMode;
        if (themeLabel) {
            themeLabel.textContent = savedDarkMode ? 'Dark' : 'Light';
        }
    }
    
    // Load font size setting
    const savedFontSize = localStorage.getItem('docuaid-font-size') || 'medium';
    const fontSizeSelect = document.getElementById('font-size-select');
    
    
    if (fontSizeSelect) {
        fontSizeSelect.value = savedFontSize;
        applyFontSize(savedFontSize);
    }
    
    // Load auto-extract setting
    const savedAutoExtract = localStorage.getItem('docuaid-auto-extract') === 'true';
    const autoExtractSwitch = document.getElementById('auto-extract-switch');
    
    if (autoExtractSwitch) {
        autoExtractSwitch.checked = savedAutoExtract;
    }
    
    // Load send on enter setting
    const savedSendOnEnter = localStorage.getItem('docuaid-send-on-enter') !== 'false'; // Default true
    const sendOnEnterSwitch = document.getElementById('send-on-enter-switch');
    
    if (sendOnEnterSwitch) {
        sendOnEnterSwitch.checked = savedSendOnEnter;
    }
    
    // Load API endpoint
    const savedApiEndpoint = localStorage.getItem('docuaid-api-endpoint') || 'https://api.docuaid.online';
    const apiEndpointInput = document.getElementById('api-endpoint-input');
    
    if (apiEndpointInput) {
        apiEndpointInput.value = savedApiEndpoint;
    }
    
    // Load API key (if stored)
    const savedApiKey = localStorage.getItem('docuaid-api-key') || '';
    const apiKeyInput = document.getElementById('api-key-input');
    
    if (apiKeyInput && savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    
    // Load store history setting
    const savedStoreHistory = localStorage.getItem('docuaid-store-history') !== 'false'; // Default true
    const storeHistorySwitch = document.getElementById('store-history-switch');
    
    if (storeHistorySwitch) {
        storeHistorySwitch.checked = savedStoreHistory;
    }
}

// Apply font size function
function applyFontSize(size) {
    const container = document.getElementById('docuaid-extension');
    
    if (!container) return;
    
    // Remove existing font size classes
    container.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Add selected font size class
    container.classList.add(`font-size-${size}`);
    
    // Store in localStorage
    localStorage.setItem('docuaid-font-size', size);

    // Update theme button icon
    updateThemeButtonIcon(container.classList.contains('dark-mode'));
}

// Update theme button icon function
function updateThemeButtonIcon(isDarkMode) {
    const themeToggleBtn = document.querySelector('#docuaid-extension #theme-toggle');
    
    if (!themeToggleBtn) return;
    
    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
        themeToggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V5M12 19v-3M5 12H2M22 12h-3M19.07 5L17 7.07M7.07 7.07 5 5M7.07 17 5 19.07M19.07 19.07 17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
}

// Function to setup settings event listeners
function setupSettingsEventListeners() {
    console.log('[DocuAid] Setting up settings event listeners');
    
    // Theme toggle
    const themeToggleSwitch = document.getElementById('theme-toggle-switch');
    const themeLabel = document.getElementById('theme-label');
    
    if (themeToggleSwitch) {
        themeToggleSwitch.addEventListener('change', () => {
            const isDarkMode = themeToggleSwitch.checked;
            const docuaidExtension = document.getElementById('docuaid-extension');
            
            if (isDarkMode) {
                docuaidExtension.classList.add('dark-mode');
                if (themeLabel) themeLabel.textContent = 'Dark';
            } else {
                docuaidExtension.classList.remove('dark-mode');
                if (themeLabel) themeLabel.textContent = 'Light';
            }
            
            // Store preference in localStorage
            localStorage.setItem('docuaid-dark-mode', isDarkMode);
        });
    }
    
    // Font size select
    const fontSizeSelect = document.getElementById('font-size-select');
    
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', () => {
            applyFontSize(fontSizeSelect.value);
        });
    }
    
    // Auto-extract toggle
    const autoExtractSwitch = document.getElementById('auto-extract-switch');
    
    if (autoExtractSwitch) {
        autoExtractSwitch.addEventListener('change', () => {
            localStorage.setItem('docuaid-auto-extract', autoExtractSwitch.checked);
        });
    }
    
    // Send on enter toggle
    const sendOnEnterSwitch = document.getElementById('send-on-enter-switch');
    
    if (sendOnEnterSwitch) {
        sendOnEnterSwitch.addEventListener('change', () => {
            localStorage.setItem('docuaid-send-on-enter', sendOnEnterSwitch.checked);
        });
    }
    
    // API endpoint input
    const apiEndpointInput = document.getElementById('api-endpoint-input');
    
    if (apiEndpointInput) {
        apiEndpointInput.addEventListener('change', () => {
            localStorage.setItem('docuaid-api-endpoint', apiEndpointInput.value);
        });
    }
    
    // API key input
    const apiKeyInput = document.getElementById('api-key-input');
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('change', () => {
            localStorage.setItem('docuaid-api-key', apiKeyInput.value);
        });
    }
    
    // Toggle API key visibility
    const toggleApiVisibilityBtn = document.getElementById('toggle-api-visibility');
    
    if (toggleApiVisibilityBtn && apiKeyInput) {
        toggleApiVisibilityBtn.addEventListener('click', () => {
            const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
            apiKeyInput.setAttribute('type', type);
        });
    }
    
    // Store history toggle
    const storeHistorySwitch = document.getElementById('store-history-switch');
    
    if (storeHistorySwitch) {
        storeHistorySwitch.addEventListener('change', () => {
            localStorage.setItem('docuaid-store-history', storeHistorySwitch.checked);
        });
    }
    
    // Clear chat history button
    const clearHistoryButton = document.getElementById('clear-history-button');
    
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            // Clear chat history from localStorage
            localStorage.removeItem('docuaid-chat-history');
            
            // Also clear current chat
            clearChat();
            
            // Show confirmation message
            addSystemMessage('Chat history has been cleared.');
            
            // Close settings panel
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                settingsPanel.classList.remove('active');
            }
        });
    }
    
    // View chat history button
    const viewHistoryButton = document.getElementById('view-history-button');
    
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', () => {
            // Show chat history
            showChatHistory();
            
            // Close settings panel
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                settingsPanel.classList.remove('active');
            }
        });
    }
    
    // Close history modal button
    const closeHistoryButton = document.getElementById('close-history-button');
    
    if (closeHistoryButton) {
        closeHistoryButton.addEventListener('click', () => {
            const historyModal = document.getElementById('history-modal');
            if (historyModal) {
                historyModal.classList.remove('active');
                historyModal.style.transform = 'translateX(100%)';
                historyModal.style.opacity = '0';
                historyModal.style.visibility = 'hidden';
                historyModal.style.pointerEvents = 'none';
            }
        });
    }
}

// Function to load chat history from localStorage
function loadChatHistory() {
    try {
        const historyJson = localStorage.getItem('docuaid-chat-history');
        if (!historyJson) {
            return [];
        }
        
        const history = JSON.parse(historyJson);
        if (!Array.isArray(history)) {
            console.error('[DocuAid] Invalid chat history format');
            return [];
        }
        
        return history;
    } catch (error) {
        console.error('[DocuAid] Error loading chat history:', error);
        return [];
    }
}

// Function to group messages by session
function groupMessagesBySession(messages) {
    const sessions = {};
    
    messages.forEach(message => {
        const sessionId = message.sessionId || 'unknown_session';
        
        if (!sessions[sessionId]) {
            sessions[sessionId] = {
                id: sessionId,
                url: message.url || '',
                pageTitle: message.pageTitle || 'Unknown Page',
                date: message.timestamp ? new Date(message.timestamp) : new Date(),
                messages: []
            };
        }
        
        sessions[sessionId].messages.push(message);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(sessions).sort((a, b) => b.date - a.date);
}

// Function to render sessions list
function renderSessionsList(sessions) {
    const sessionListEl = document.getElementById('session-list');
    if (!sessionListEl) return;
    
    // Clear existing sessions
    sessionListEl.innerHTML = '';
    
    if (sessions.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'session-empty-state';
        emptyState.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>No chat history found</p>
        `;
        sessionListEl.appendChild(emptyState);
        return;
    }
    
    // Render each session as a list item
    sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item';
        sessionItem.dataset.sessionId = session.id;
        
        const sessionTitle = document.createElement('div');
        sessionTitle.className = 'session-title';
        sessionTitle.textContent = session.pageTitle || 'Chat Session';
        
        const sessionDate = document.createElement('div');
        sessionDate.className = 'session-date';
        sessionDate.textContent = formatDate(session.date);
        
        sessionItem.appendChild(sessionTitle);
        sessionItem.appendChild(sessionDate);
        
        // Add click event to show this session
        sessionItem.addEventListener('click', () => {
            // Remove active class from all sessions
            document.querySelectorAll('.session-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to this session
            sessionItem.classList.add('active');
            
            // Render this session's messages
            renderSessionMessages(session);
        });
        
        sessionListEl.appendChild(sessionItem);
    });
}

// Function to render a session's messages
function renderSessionMessages(session) {
    const sessionMessagesEl = document.getElementById('session-messages');
    if (!sessionMessagesEl) return;
    
    // Clear existing messages
    sessionMessagesEl.innerHTML = '';
    
    if (!session.messages || session.messages.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'session-empty-state';
        emptyState.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>No messages in this session</p>
        `;
        sessionMessagesEl.appendChild(emptyState);
        return;
    }
    
    // Add session info at the top
    const sessionInfo = document.createElement('div');
    sessionInfo.className = 'session-info';
    sessionInfo.innerHTML = `
        <h3>${session.pageTitle || 'Chat Session'}</h3>
        <p>${session.url ? `<a href="${session.url}" target="_blank">${session.url}</a>` : ''}</p>
        <p class="session-date">${formatDate(session.date, true)}</p>
    `;
    sessionMessagesEl.appendChild(sessionInfo);
    
    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'history-messages-container';
    
    // Add each message
    session.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `history-message ${message.type}-message`;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.innerHTML = message.content;
        
        const timestampEl = document.createElement('div');
        timestampEl.className = 'history-timestamp';
        timestampEl.textContent = formatTime(message.timestamp);
        
        messageEl.appendChild(contentEl);
        messageEl.appendChild(timestampEl);
        messagesContainer.appendChild(messageEl);
    });
    
    sessionMessagesEl.appendChild(messagesContainer);
    
    // Add "Load in Chat" button
    const loadButton = document.createElement('button');
    loadButton.className = 'settings-button';
    loadButton.textContent = 'Load in Current Chat';
    loadButton.addEventListener('click', () => {
        loadSessionInCurrentChat(session);
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'history-actions';
    buttonContainer.appendChild(loadButton);
    
    sessionMessagesEl.appendChild(buttonContainer);
}

// Function to show chat history viewer
function showChatHistory() {
    // Load history from storage
    const history = loadChatHistory();
    
    // Group by session
    const sessions = groupMessagesBySession(history);
    
    // Render sessions list
    renderSessionsList(sessions);
    
    // Show history modal
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
        historyModal.classList.add('active');
        historyModal.style.transform = 'translateX(0)';
        historyModal.style.opacity = '1';
        historyModal.style.visibility = 'visible';
        historyModal.style.pointerEvents = 'auto';
        historyModal.style.display = 'flex';
        historyModal.style.zIndex = '100001';
    }
}

// Function to load a session into the current chat
function loadSessionInCurrentChat(session) {
    // Clear current chat
    clearChat();
    
    // Close history modal
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
        historyModal.classList.remove('active');
        historyModal.style.transform = 'translateX(100%)';
        historyModal.style.opacity = '0';
        historyModal.style.visibility = 'hidden';
        historyModal.style.pointerEvents = 'none';
    }
    
    // Need a slight delay to ensure the chat is cleared
    setTimeout(() => {
        // Add welcome message first
        addMessage('bot', 'Hello! I\'m DocuAid Assistant. How can I help you understand this document?');
        
        // Add each message from the session
        session.messages.forEach(message => {
            if (message.type === 'system') {
                addSystemMessage(message.content);
            } else {
                // Don't add initial welcome message again
                if (message.content !== 'Hello! I\'m DocuAid Assistant. How can I help you understand this document?') {
                    addMessage(message.type, message.content);
                }
            }
        });
        
        // Show info that this is loaded from history
        addSystemMessage(`Loaded chat history from ${formatDate(session.date)}`);
    }, 100);
}

// Helper function to format date
function formatDate(date, includeTime = false) {
    if (!(date instanceof Date)) {
        if (typeof date === 'string') {
            date = new Date(date);
        } else {
            return 'Unknown date';
        }
    }
    
    // Check if date is today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
    
    // Check if date is yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();
    
    if (isToday) {
        return includeTime ? `Today at ${formatTime(date)}` : 'Today';
    } else if (isYesterday) {
        return includeTime ? `Yesterday at ${formatTime(date)}` : 'Yesterday';
    } else {
        const options = { month: 'short', day: 'numeric' };
        if (date.getFullYear() !== today.getFullYear()) {
            options.year = 'numeric';
        }
        const formattedDate = date.toLocaleDateString(undefined, options);
        return includeTime ? `${formattedDate} at ${formatTime(date)}` : formattedDate;
    }
}

// Helper function to format time
function formatTime(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// Function to generate answers from extracted content
function generateAnswerFromExtractedContent(userMessage) {
    console.log('[DocuAid] Generating answer from extracted content');
    
    const content = window.docuaidExtractedContent.content;
    const title = window.docuaidExtractedContent.title;
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Simple keyword matching to find relevant information
    // In a real implementation, this would use a more sophisticated approach like embeddings
    
    // Define some common question patterns and related keywords
    const patterns = [
        {
            // Capital/location questions
            patterns: ['capital', 'where is', 'located', 'location', 'where', 'city'],
            keywords: ['capital', 'located in', 'situated', 'lies', 'found in', 'city', 'province', 'region', 'state'],
            defaultResponse: `Based on the extracted content, I found information about locations and geography. The document discusses ${title}, which likely contains details about its capital, major cities, or geographical features.`
        },
        {
            // Historical/timeline questions
            patterns: ['when', 'history', 'founded', 'established', 'year', 'century', 'ancient', 'timeline'],
            keywords: ['founded', 'established', 'century', 'year', 'history', 'historical', 'ancient', 'era', 'period', 'dynasty', 'date'],
            defaultResponse: `The document contains historical information about ${title}. It appears to cover various historical periods and developments.`
        },
        {
            // People/person questions
            patterns: ['who', 'person', 'people', 'president', 'leader', 'king', 'queen', 'minister'],
            keywords: ['president', 'minister', 'leader', 'king', 'queen', 'ruled', 'govern', 'politician', 'notable', 'famous'],
            defaultResponse: `I found information about key people related to ${title}, including leaders, notable figures, and important individuals in its history and development.`
        },
        {
            // What/definition questions
            patterns: ['what is', 'what are', 'definition', 'define', 'meaning', 'explain'],
            keywords: ['refers to', 'defined as', 'known as', 'called', 'term for', 'concept of'],
            defaultResponse: `Based on the content, ${title} is a topic with multiple aspects and characteristics. The document provides extensive information about its definition, features, and significance.`
        },
        {
            // Why questions
            patterns: ['why', 'reason', 'cause', 'because', 'due to'],
            keywords: ['because', 'due to', 'result of', 'reason', 'cause', 'led to', 'contributed to'],
            defaultResponse: `The document discusses various causes, reasons, and factors related to ${title}. These include historical developments, social factors, and key events.`
        }
    ];
    
    // Try to match the user question to one of our patterns
    for (const patternGroup of patterns) {
        const matchesQuestion = patternGroup.patterns.some(pattern => lowerCaseMessage.includes(pattern));
        
        if (matchesQuestion) {
            // Look for relevant information in the content using keywords
            for (const keyword of patternGroup.keywords) {
                // Find paragraphs containing the keyword
                const contentLower = content.toLowerCase();
                const keywordIndex = contentLower.indexOf(keyword);
                
                if (keywordIndex !== -1) {
                    // Find the surrounding paragraph or sentence
                    const startOfParagraph = content.lastIndexOf('\n', keywordIndex) + 1;
                    const endOfParagraph = content.indexOf('\n', keywordIndex);
                    const paragraph = content.substring(
                        startOfParagraph, 
                        endOfParagraph === -1 ? content.length : endOfParagraph
                    ).trim();
                    
                    if (paragraph.length > 20) {  // Make sure it's substantial enough
                        return `Based on the extracted content: "${paragraph}"`;
                    }
                }
            }
            
            // If we couldn't find specific relevant content, return the default response
            return patternGroup.defaultResponse;
        }
    }
    
    // Special handling for specific question types
    if (lowerCaseMessage.includes('capital') && lowerCaseMessage.includes('sri lanka')) {
        return "Sri Jayawardenepura Kotte is the administrative capital of Sri Lanka, while Colombo is the commercial capital and largest city.";
    }
    
    if (lowerCaseMessage.includes('population') && lowerCaseMessage.includes('sri lanka')) {
        return "As of recent estimates, Sri Lanka has a population of approximately 22 million people.";
    }
    
    if (lowerCaseMessage.includes('language') && lowerCaseMessage.includes('sri lanka')) {
        return "The official languages of Sri Lanka are Sinhala and Tamil. English is also commonly used, especially in government and education.";
    }
    
    if (lowerCaseMessage.includes('religion') && lowerCaseMessage.includes('sri lanka')) {
        return "Buddhism is the majority religion in Sri Lanka, practiced by about 70% of the population. Other religions include Hinduism, Islam, and Christianity.";
    }
    
    if (lowerCaseMessage.includes('currency') && lowerCaseMessage.includes('sri lanka')) {
        return "The currency of Sri Lanka is the Sri Lankan Rupee (LKR).";
    }
    
    if (lowerCaseMessage.includes('independence') && lowerCaseMessage.includes('sri lanka')) {
        return "Sri Lanka gained independence from British rule on February 4, 1948.";
    }
    
    // If we couldn't match the question to any of our patterns
    return `I've analyzed the document about ${title}. While I found extensive information, I couldn't pinpoint the exact answer to your specific question. You might find it helpful to ask a more specific question or rephrase your query.`;
}

// Function to auto-resize textarea based on content
function autoResizeTextarea(textarea) {
    // Reset height to calculate correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height based on scrollHeight (with max height limit)
    const maxHeight = 150; // Maximum height in pixels
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    // Apply new height
    textarea.style.height = newHeight + 'px';
    
    // Add/remove scrollbar if needed
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
}

// Additional initialization methods to ensure chatbot appears
// Initialize immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('[DocuAid] Initializing immediately - document already loaded');
    setTimeout(function() {
        if (!document.getElementById('docuaid-extension')) {
            initChatbot();
        }
    }, 100);
}

// Add window load event as additional safety measure
window.addEventListener('load', function() {
    console.log('[DocuAid] Window load event triggered');
    if (!document.getElementById('docuaid-extension')) {
        console.log('[DocuAid] Initializing via window load event');
        initChatbot();
    }
});

// Add a safety timeout to ensure initialization happens
setTimeout(function() {
    console.log('[DocuAid] Delayed initialization check');
    if (!document.getElementById('docuaid-extension')) {
        console.log('[DocuAid] Performing delayed initialization');
        initChatbot();
    }
}, 1000);

// Function to generate responses based on general knowledge
function generateGeneralKnowledgeResponse(userMessage) {
    console.log('[DocuAid] Generating general knowledge response');
    
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Basic greeting responses
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
        return 'Hello! I\'m DocuAid Assistant. How can I help you today?';
    }
    
    // Help responses
    if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('what can you do')) {
        return 'I can help you in several ways:\n\n' +
               '1. Answer questions about general topics\n' +
               '2. Extract and analyze content from this page\n' +
               '3. Provide information about Sri Lanka\n' +
               '4. Assist with document understanding\n\n' +
               'Feel free to ask me anything!';
    }
    
    // Thank you responses
    if (lowerCaseMessage.includes('thank') || lowerCaseMessage.includes('thanks')) {
        return 'You\'re welcome! Is there anything else I can help you with?';
    }
    
    // About the chatbot
    if ((lowerCaseMessage.includes('who are you') || lowerCaseMessage.includes('what are you')) || 
        (lowerCaseMessage.includes('about') && lowerCaseMessage.includes('yourself'))) {
        return 'I\'m DocuAid Assistant, an AI-powered chatbot designed to help you understand documents and answer your questions. I can extract content from web pages and provide relevant information based on the content.';
    }
    
    // Extraction explanation
    if (lowerCaseMessage.includes('extract') || 
        (lowerCaseMessage.includes('how') && lowerCaseMessage.includes('content'))) {
        return 'To extract content from this page, click the "Extract" button at the bottom of the chat. This will help me understand the page content better and provide more accurate answers to your questions.';
    }
    
    // Settings related queries
    if (lowerCaseMessage.includes('settings') || lowerCaseMessage.includes('preferences')) {
        return 'You can access settings by clicking the gear icon in the top right corner of the chat. There, you can adjust theme preferences, font size, and other options.';
    }
    
    // Check for Sri Lanka related questions
    const sriLankaResponse = generateSriLankaFallbackResponse(userMessage);
    if (sriLankaResponse !== null) {
        return sriLankaResponse;
    }
    
    // Check for current page context
    if (lowerCaseMessage.includes('this page') || lowerCaseMessage.includes('this document') || 
        lowerCaseMessage.includes('current page')) {
        return 'To answer questions about this specific page, I recommend clicking the "Extract" button first. ' +
               'This will help me analyze the content and provide more accurate answers. ' +
               'Currently, I\'m responding based on my general knowledge.';
    }
    
    // Default response for unknown questions
    return 'I understand your question about "' + userMessage + '". ' +
           'I can provide better assistance if you extract the content from this page first using the Extract button, ' +
           'or if you ask me about general topics or about Sri Lanka, which I have specific information about.';
}
