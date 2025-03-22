document.addEventListener('DOMContentLoaded', () => {
    console.log('[DocuAid] Content script loaded');
    initChatbot();
});

function initChatbot() {
    console.log('[DocuAid] Initializing chatbot...');

    // Create main container
    const docuaidExtension = document.createElement('div');
    docuaidExtension.id = 'docuaid-extension';
    document.body.appendChild(docuaidExtension);

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('docuaid-dark-mode');
    if (savedDarkMode === 'true') {
        console.log('[DocuAid] Applying saved dark mode preference');
        docuaidExtension.classList.add('dark-mode');
    }

    // Create chatbot icon
    const chatbotIcon = document.createElement('div');
    chatbotIcon.className = 'chatbot-icon';
    chatbotIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white"/></svg>';
    docuaidExtension.appendChild(chatbotIcon);

    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    chatbotContainer.id = 'chatbot-container';
    docuaidExtension.appendChild(chatbotContainer);

    // Create chatbot header
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chatbot-header';
    chatbotContainer.appendChild(chatbotHeader);

    // Create chatbot title
    const chatbotTitle = document.createElement('div');
    chatbotTitle.className = 'chatbot-title';
    chatbotTitle.textContent = 'DocuAid Assistant';
    chatbotHeader.appendChild(chatbotTitle);

    // Create chatbot controls
    const chatbotControls = document.createElement('div');
    chatbotControls.className = 'chatbot-controls';
    chatbotHeader.appendChild(chatbotControls);

    // Create settings button
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.id = 'settings-button';
    settingsButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>';
    chatbotControls.appendChild(settingsButton);

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
    
    // Advanced Section
    const advancedSection = document.createElement('div');
    advancedSection.className = 'settings-section';
    
    const advancedTitle = document.createElement('h3');
    advancedTitle.className = 'settings-section-title';
    advancedTitle.textContent = 'Advanced';
    advancedSection.appendChild(advancedTitle);
    
    // API Endpoint Option
    const apiEndpointOption = document.createElement('div');
    apiEndpointOption.className = 'settings-option';
    
    const apiEndpointLabel = document.createElement('span');
    apiEndpointLabel.textContent = 'API Endpoint';
    apiEndpointOption.appendChild(apiEndpointLabel);
    
    const apiEndpointInput = document.createElement('input');
    apiEndpointInput.type = 'text';
    apiEndpointInput.id = 'api-endpoint-input';
    apiEndpointInput.className = 'settings-input';
    apiEndpointInput.value = 'https://api.docuaid.online';
    apiEndpointOption.appendChild(apiEndpointInput);
    
    advancedSection.appendChild(apiEndpointOption);
    
    // API Key Option
    const apiKeyOption = document.createElement('div');
    apiKeyOption.className = 'settings-option';
    
    const apiKeyLabel = document.createElement('span');
    apiKeyLabel.textContent = 'API Key';
    apiKeyOption.appendChild(apiKeyLabel);
    
    const apiKeyContainer = document.createElement('div');
    apiKeyContainer.className = 'api-key-container';
    
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.id = 'api-key-input';
    apiKeyInput.className = 'settings-input';
    apiKeyInput.placeholder = 'Enter your API key...';
    apiKeyContainer.appendChild(apiKeyInput);
    
    const toggleApiVisibilityButton = document.createElement('button');
    toggleApiVisibilityButton.id = 'toggle-api-visibility';
    toggleApiVisibilityButton.className = 'toggle-visibility-button';
    toggleApiVisibilityButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>';
    apiKeyContainer.appendChild(toggleApiVisibilityButton);
    
    apiKeyOption.appendChild(apiKeyContainer);
    advancedSection.appendChild(apiKeyOption);
    
    settingsContent.appendChild(advancedSection);
    
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

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chatbot-messages';
    messagesContainer.id = 'chatbot-messages';
    chatbotContainer.appendChild(messagesContainer);

    // Create user input container
    const userInputContainer = document.createElement('div');
    userInputContainer.className = 'user-input-container';
    chatbotContainer.appendChild(userInputContainer);

    // Create user input
    const userInput = document.createElement('textarea');
    userInput.id = 'user-input';
    userInput.placeholder = 'Ask me anything...';
    userInput.rows = 1;
    userInputContainer.appendChild(userInput);

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
    versionText.textContent = 'v1.0.0';
    chatbotFooter.appendChild(versionText);

    // Add welcome message
    addMessage('bot', 'Hello! I\'m DocuAid Assistant. How can I help you understand this document?');

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

    // Set up event listeners
    chatbotIcon.addEventListener('click', function () {
        console.log('[DocuAid] Chatbot icon clicked');
        chatbotContainer.classList.add('active');

        // Ensure the chatbot is visible with these explicit styles
        chatbotContainer.style.opacity = '1';
        chatbotContainer.style.visibility = 'visible';
        chatbotContainer.style.pointerEvents = 'auto';
        chatbotContainer.style.transform = 'translateY(0)';
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.flexDirection = 'column';

        // Make sure the controls are visible too
        const controls = document.querySelector('.chatbot-controls');
        if (controls) {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
        }

        // Initialize the chat area if it hasn't been initialized yet
        if (!document.querySelector('.chatbot-messages')) {
            initChatArea();
        }
    });

    closeBtn.addEventListener('click', function () {
        console.log('[DocuAid] Close button clicked');
        chatbotContainer.classList.remove('active');
        chatbotContainer.style.opacity = '0';
        chatbotContainer.style.visibility = 'hidden';
        chatbotContainer.style.pointerEvents = 'none';
    });

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
    
    // Theme toggling
    const docuaidExtension = document.getElementById('docuaid-extension');
    const themeToggleBtn = document.querySelector('#docuaid-extension #theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // Toggle dark mode class
            docuaidExtension.classList.toggle('dark-mode');
            
            // Save the preference to localStorage
            const isDarkMode = docuaidExtension.classList.contains('dark-mode');
            localStorage.setItem('docuaid-dark-mode', isDarkMode);
            
            // Update the button icon
            updateThemeButtonIcon(isDarkMode);
        });
    }
    
    // Setup settings specific event listeners
    setupSettingsEventListeners();
    
    // Load saved settings
    loadSavedSettings();
}

function addMessage(type, content) {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content;

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

async function sendMessage() {
    const userInput = document.querySelector('#docuaid-extension #user-input');
    const userMessage = userInput.value.trim();

    if (!userMessage) return;

    // Add user message to chat
    addMessage('user', userMessage);

    // Clear input
    userInput.value = '';

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
        // Get API URL either from config or function
        const apiUrl = typeof apiConfig.getApiUrl === 'function' ?
            apiConfig.getApiUrl() : apiConfig.API_URL;

        console.log('[DocuAid] Sending message to:', `${apiUrl}${apiConfig.CHAT_ENDPOINT}`);

        // Create the request body with both parameters to ensure compatibility
        const requestBody = {
            question: userMessage,
            message: userMessage
        };

        console.log('[DocuAid] Request body:', JSON.stringify(requestBody));

        const response = await fetch(`${apiUrl}${apiConfig.CHAT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        if (!data || (!data.answer && !data.response)) {
            throw new Error('Invalid response format');
        }

        // Add bot response to chat
        const botResponse = data.answer || data.response;
        addMessage('bot', botResponse);

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
    }
}

function extractContent() {
    console.log('[DocuAid] Extracting content...');
    addSystemMessage('Extracting content from the current page...');

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

    // Limit content size to avoid API issues (max 50K characters)
    if (pageContent.length > 50000) {
        console.log('[DocuAid] Content too large, truncating');
        pageContent = pageContent.substring(0, 50000);
        addSystemMessage('Content is very large, using only the first part of the page.');
    }

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Get API URL either from config or function
    const apiUrl = typeof apiConfig.getApiUrl === 'function' ?
        apiConfig.getApiUrl() : apiConfig.API_URL;

    console.log('[DocuAid] Sending content to API for extraction:', `${apiUrl}${apiConfig.EXTRACT_ENDPOINT}`);

    // Create the request body
    const extractRequestBody = {
        url: url,
        title: pageTitle,
        content: pageContent,
        html: document.documentElement.outerHTML
    };

    console.log('[DocuAid] Extract request body length:', JSON.stringify(extractRequestBody).length);

    // Send content to API
    fetch(`${apiUrl}${apiConfig.EXTRACT_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(extractRequestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);

            if (!data || (!data.content && !data.title)) {
                throw new Error('Invalid extraction response format');
            }

            // Show success message
            let displayContent = '';
            if (data.title) {
                displayContent += `**${data.title}**\n\n`;
            }
            displayContent += `Content extracted successfully! (${data.content ? Math.round(data.content.length / 1000) : 0}K characters)`;
            if (data.extraction_method) {
                displayContent += `\n\nMethod: ${data.extraction_method}`;
            }

            addSystemMessage(displayContent);
        })
        .catch(error => {
            console.error('[DocuAid] Extraction error:', error);
            removeTypingIndicator(typingIndicator);

            let errorMessage = 'Sorry, I encountered an error while extracting content. Please try again later.';

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Sorry, I could not connect to the server. Please check your connection and try again.';
            } else if (error.message.includes('Invalid extraction response format')) {
                errorMessage = 'Sorry, I received an invalid response while extracting content. Please try again.';
            }

            addSystemMessage(errorMessage);

            // Try to handle the error using the config error handler
            if (apiConfig.handleApiError) {
                const errorResult = apiConfig.handleApiError(error);
                if (errorResult.isPineconeError) {
                    console.log('[DocuAid] Continuing without vector store');
                }
            }
        });
}

function clearChat() {
    const messagesContainer = document.querySelector('#docuaid-extension .chatbot-messages');

    // Remove all messages except the welcome message
    while (messagesContainer.childNodes.length > 1) {
        messagesContainer.removeChild(messagesContainer.lastChild);
    }

    addSystemMessage('Chat cleared.');
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

// Setup settings event listeners
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
}
