// DocuAid Login Management

// Add some improved styles for the login UI
const loginStyles = `
.login-form, .signup-form {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.login-form label, .signup-form label {
    display: inline-block;
    width: 80px;
    margin-bottom: 5px;
    font-weight: 500;
}

.login-form input, .signup-form input {
    margin-bottom: 15px;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
}

.primary-button, .danger-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    align-self: flex-start;
    margin-top: 5px;
}

.primary-button {
    background-color: #467DF6;
    color: white;
}

.danger-button {
    background-color: #e74c3c;
    color: white;
}

.user-profile {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 4px;
    background-color: #f8f9fa;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #467DF6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 10px;
}

.user-info {
    flex: 1;
}

.user-info p {
    margin: 0 0 5px 0;
}

#welcome-message {
    font-weight: 500;
}

#username-display {
    font-weight: bold;
}
`;

class DocuAidLoginManager {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.loginForm = null;
        this.signupForm = null;
        this.userProfile = null;
        
        // Add login styles to the document
        const styleEl = document.createElement('style');
        styleEl.textContent = loginStyles;
        document.head.appendChild(styleEl);
        
        // Try to load user data from localStorage
        this.loadUserData();
        
        // Initialize UI elements when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initUI();
            this.checkLoggedInStatus();
        });
    }
    
    // Initialize login UI and event listeners
    initUI() {
        // Get UI elements
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.userProfile = document.getElementById('user-profile');
        
        if (!this.loginForm || !this.signupForm || !this.userProfile) {
            console.error('[DocuAid] Login UI elements not found');
            return;
        }
        
        // Add event listeners for the login form
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Add event listeners for the signup form
        if (this.signupForm) {
            this.signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
        
        // Add event listener for the logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // Update UI based on login state
        this.updateUI();
    }
    
    // Check if user is logged in
    checkLoggedInStatus() {
        const savedUser = localStorage.getItem('docuaid_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                this.isLoggedIn = true;
                this.currentUser = userData;
                this.updateUI();
            } catch (error) {
                console.error('[DocuAid] Error parsing user data:', error);
                this.isLoggedIn = false;
                this.currentUser = null;
            }
        } else {
            this.isLoggedIn = false;
            this.currentUser = null;
        }
        
        // Return login status
        return this.isLoggedIn;
    }
    
    // Handle login form submission
    handleLogin() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (!usernameInput || !passwordInput) {
            console.error('[DocuAid] Login form inputs not found');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        // Show a loading indicator
        this.toggleLoading(true);
        
        // Call the backend API for authentication
        this.loginWithBackend(username, password)
            .then(data => {
                if (data && data.user && data.token) {
                    // Login successful
                    this.isLoggedIn = true;
                    this.currentUser = data.user;
                    
                    // Store token in localStorage
                    localStorage.setItem('docuaid-auth-token', data.token);
                    
                    // Save user data to localStorage
                    this.saveUserData();
                    
                    // Update UI
                    this.updateUI();
                    
                    // Dispatch login state change event
                    this.dispatchLoginStateChange();
                    
                    console.log('[DocuAid] Login successful:', this.currentUser);
                } else {
                    console.error('[DocuAid] Invalid login response');
                    alert('Login failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('[DocuAid] Login error:', error);
                alert(error.message || 'Login failed. Please try again.');
            })
            .finally(() => {
                this.toggleLoading(false);
            });
    }
    
    // Handle signup form submission
    handleSignup() {
        const usernameInput = document.getElementById('signup-username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('signup-password');
        
        if (!usernameInput || !emailInput || !passwordInput) {
            console.error('[DocuAid] Signup form inputs not found');
            return;
        }
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate email format
        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Show a loading indicator
        this.toggleLoading(true);
        
        // Call the backend API for registration
        this.registerWithBackend(username, email, password)
            .then(data => {
                if (data && data.user && data.token) {
                    // Registration successful
                    this.isLoggedIn = true;
                    this.currentUser = data.user;
                    
                    // Store token in localStorage
                    localStorage.setItem('docuaid-auth-token', data.token);
                    
                    // Save user data to localStorage
                    this.saveUserData();
                    
                    // Update UI
                    this.updateUI();
                    
                    // Dispatch login state change event
                    this.dispatchLoginStateChange();
                    
                    console.log('[DocuAid] Signup successful:', this.currentUser);
                } else {
                    console.error('[DocuAid] Invalid registration response');
                    alert('Registration failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('[DocuAid] Registration error:', error);
                alert(error.message || 'Registration failed. Please try again.');
            })
            .finally(() => {
                this.toggleLoading(false);
            });
    }
    
    // Handle logout
    handleLogout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // Clear stored user data
        localStorage.removeItem('docuaid_user');
        // Clear auth token
        localStorage.removeItem('docuaid-auth-token');
        
        // Update UI
        this.updateUI();
        
        // Dispatch login state change event
        this.dispatchLoginStateChange();
        
        console.log('[DocuAid] User logged out');
    }
    
    // Update UI based on login state
    updateUI() {
        if (!this.loginForm || !this.signupForm || !this.userProfile) {
            console.error('[DocuAid] UI elements not initialized');
            return;
        }
        
        if (this.isLoggedIn && this.currentUser) {
            // User is logged in, show profile and hide forms
            this.loginForm.style.display = 'none';
            this.signupForm.style.display = 'none';
            this.userProfile.style.display = 'flex';
            
            // Update welcome message
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = this.currentUser.username;
            }
        } else {
            // User is not logged in, show login form
            this.loginForm.style.display = 'flex';
            this.signupForm.style.display = 'none';
            this.userProfile.style.display = 'none';
        }
    }
    
    // Dispatch an event when login state changes
    dispatchLoginStateChange() {
        const event = new CustomEvent('docuaid-login-state-changed', {
            detail: {
                isLoggedIn: this.isLoggedIn,
                user: this.isLoggedIn ? this.currentUser : null
            }
        });
        document.dispatchEvent(event);
    }
    
    // Save user data to localStorage
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('docuaid_user', JSON.stringify(this.currentUser));
        }
    }
    
    // Load user data from localStorage
    loadUserData() {
        const savedUser = localStorage.getItem('docuaid_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
            } catch (error) {
                console.error('[DocuAid] Error parsing saved user data:', error);
                this.currentUser = null;
                this.isLoggedIn = false;
            }
        }
    }
    
    // Check if user is logged in
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Function to login with backend API
    async loginWithBackend(username, password) {
        try {
            // Get API URL
            const apiUrl = typeof apiConfig.getApiUrl === 'function' ?
                apiConfig.getApiUrl() : apiConfig.API_URL;
                
            // Make API request
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            return data;
        } catch (error) {
            console.error('[DocuAid] Login API error:', error);
            throw error;
        }
    }
    
    // Function to register with backend API
    async registerWithBackend(username, email, password) {
        try {
            // Get API URL
            const apiUrl = typeof apiConfig.getApiUrl === 'function' ?
                apiConfig.getApiUrl() : apiConfig.API_URL;
                
            // Make API request
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            return data;
        } catch (error) {
            console.error('[DocuAid] Registration API error:', error);
            throw error;
        }
    }
    
    // Toggle loading state
    toggleLoading(isLoading) {
        // In a real implementation, this would show/hide a loading spinner
        console.log('[DocuAid] Loading state:', isLoading);
    }
    
    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Create and export the login manager instance
window.docuaidLoginManager = new DocuAidLoginManager(); 