// DocuAid Login Management
class DocuAidLoginManager {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.loginContainer = null;
        this.loginForm = null;
        this.signupForm = null;
        this.userProfile = null;
        
        // Try to load user data from localStorage
        this.loadUserData();
    }
    
    // Initialize login UI and event listeners
    init() {
        // Get UI elements
        this.loginContainer = document.querySelector('#docuaid-extension .login-container');
        this.loginForm = document.querySelector('#docuaid-extension .login-form');
        this.signupForm = document.querySelector('#docuaid-extension .signup-form');
        this.userProfile = document.querySelector('#docuaid-extension .user-profile');
        
        if (!this.loginContainer) {
            console.error('Login container not found');
            return;
        }
        
        // Add event listeners
        this.addLoginEventListeners();
        
        // Show the appropriate UI based on login state
        this.updateUI();
    }
    
    // Add all event listeners for login/signup forms
    addLoginEventListeners() {
        // Login form submission
        const loginButton = document.querySelector('#docuaid-extension .login-button');
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Switch to signup form
        const signupLink = document.querySelector('#docuaid-extension .signup-link');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignupForm();
            });
        }
        
        // Signup form submission
        const createAccountButton = document.querySelector('#docuaid-extension .create-account-button');
        if (createAccountButton) {
            createAccountButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
        
        // Switch back to login form
        const loginLink = document.querySelector('#docuaid-extension .login-link');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
        
        // Logout button
        const logoutButton = document.querySelector('#docuaid-extension .logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }
    
    // Handle login form submission
    handleLogin() {
        const usernameInput = document.querySelector('#docuaid-extension .login-form input[name="username"]');
        const passwordInput = document.querySelector('#docuaid-extension .login-form input[name="password"]');
        
        if (!usernameInput || !passwordInput) {
            console.error('Login form inputs not found');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            this.showMessage('Please enter both username and password', 'error');
            return;
        }
        
        // For demo purposes, we'll simulate authentication
        // In a real app, this would be an API call
        setTimeout(() => {
            // Simulated successful login
            this.isLoggedIn = true;
            this.currentUser = {
                username: username,
                email: `${username.toLowerCase()}@example.com`,
                avatarLetter: username.charAt(0).toUpperCase()
            };
            
            // Save user data
            this.saveUserData();
            
            // Update UI
            this.updateUI();
            this.showMessage('Login successful!', 'success');
        }, 1000);
    }
    
    // Handle signup form submission
    handleSignup() {
        const usernameInput = document.querySelector('#docuaid-extension .signup-form input[name="username"]');
        const emailInput = document.querySelector('#docuaid-extension .signup-form input[name="email"]');
        const passwordInput = document.querySelector('#docuaid-extension .signup-form input[name="password"]');
        const confirmPasswordInput = document.querySelector('#docuaid-extension .signup-form input[name="confirm-password"]');
        
        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error('Signup form inputs not found');
            return;
        }
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // Validate inputs
        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // For demo purposes, we'll simulate account creation
        // In a real app, this would be an API call
        setTimeout(() => {
            // Simulated successful signup
            this.isLoggedIn = true;
            this.currentUser = {
                username: username,
                email: email,
                avatarLetter: username.charAt(0).toUpperCase()
            };
            
            // Save user data
            this.saveUserData();
            
            // Update UI
            this.updateUI();
            this.showMessage('Account created successfully!', 'success');
        }, 1000);
    }
    
    // Handle logout
    handleLogout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // Clear stored user data
        localStorage.removeItem('docuaid_user');
        
        // Update UI
        this.updateUI();
        this.showMessage('You have been logged out', 'info');
    }
    
    // Show login form
    showLoginForm() {
        if (this.loginForm && this.signupForm) {
            this.loginForm.style.display = 'block';
            this.signupForm.style.display = 'none';
        }
    }
    
    // Show signup form
    showSignupForm() {
        if (this.loginForm && this.signupForm) {
            this.loginForm.style.display = 'none';
            this.signupForm.style.display = 'block';
        }
    }
    
    // Update UI based on login state
    updateUI() {
        if (!this.loginContainer || !this.loginForm || !this.signupForm || !this.userProfile) {
            return;
        }
        
        if (this.isLoggedIn && this.currentUser) {
            // User is logged in, show profile
            this.loginForm.style.display = 'none';
            this.signupForm.style.display = 'none';
            this.userProfile.style.display = 'block';
            
            // Update profile information
            const avatarSpan = document.querySelector('#docuaid-extension .profile-avatar span');
            const usernameElement = document.querySelector('#docuaid-extension .profile-info h4');
            const emailElement = document.querySelector('#docuaid-extension .profile-info p');
            
            if (avatarSpan && this.currentUser.avatarLetter) {
                avatarSpan.textContent = this.currentUser.avatarLetter;
            }
            
            if (usernameElement && this.currentUser.username) {
                usernameElement.textContent = this.currentUser.username;
            }
            
            if (emailElement && this.currentUser.email) {
                emailElement.textContent = this.currentUser.email;
            }
        } else {
            // User is not logged in, show login form
            this.loginForm.style.display = 'block';
            this.signupForm.style.display = 'none';
            this.userProfile.style.display = 'none';
        }
        
        // Dispatch login state change event
        const loginStateEvent = new Event('docuaid-login-state-changed');
        document.dispatchEvent(loginStateEvent);
    }
    
    // Show a message to the user
    showMessage(message, type = 'info') {
        // Create message element if it doesn't exist
        let messageElement = document.querySelector('#docuaid-extension .login-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'login-message';
            this.loginContainer.appendChild(messageElement);
        }
        
        // Set message content and style
        messageElement.textContent = message;
        messageElement.className = `login-message ${type}`;
        
        // Show the message
        messageElement.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
    
    // Save user data to localStorage
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('docuaid_user', JSON.stringify({
                isLoggedIn: this.isLoggedIn,
                currentUser: this.currentUser
            }));
        }
    }
    
    // Load user data from localStorage
    loadUserData() {
        const userData = localStorage.getItem('docuaid_user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                this.isLoggedIn = parsed.isLoggedIn;
                this.currentUser = parsed.currentUser;
            } catch (e) {
                console.error('Error parsing user data', e);
                this.isLoggedIn = false;
                this.currentUser = null;
            }
        }
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.docuAidLoginManager = new DocuAidLoginManager();
    
    // Wait a short time to ensure the UI elements are created
    setTimeout(() => {
        window.docuAidLoginManager.init();
    }, 500);
}); 