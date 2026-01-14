// Blog Authentication System - Simple password protection using Web Crypto API

class BlogAuth {
    constructor() {
        this.PASSWORD_KEY = 'blog_admin_password';
        this.SESSION_KEY = 'blog_admin_session';
        this.SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    }

    // ====================================
    // Password Management
    // ====================================

    /**
     * Check if password has been set up
     * @returns {boolean} True if password exists
     */
    isPasswordSet() {
        return localStorage.getItem(this.PASSWORD_KEY) !== null;
    }

    /**
     * Set up password for first time
     * @param {string} password - Plain text password
     * @returns {Promise<boolean>} True if successful
     */
    async setPassword(password) {
        try {
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const hash = await this.hashPassword(password);
            localStorage.setItem(this.PASSWORD_KEY, hash);
            return true;
        } catch (error) {
            console.error('Error setting password:', error);
            return false;
        }
    }

    /**
     * Verify password against stored hash
     * @param {string} password - Plain text password to verify
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(password) {
        try {
            const storedHash = localStorage.getItem(this.PASSWORD_KEY);
            if (!storedHash) return false;

            const inputHash = await this.hashPassword(password);
            return inputHash === storedHash;
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }

    /**
     * Hash password using SHA-256
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hex string hash
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Change password (requires current password)
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<boolean>} True if successful
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const isValid = await this.verifyPassword(currentPassword);
            if (!isValid) {
                throw new Error('Current password is incorrect');
            }

            return await this.setPassword(newPassword);
        } catch (error) {
            console.error('Error changing password:', error);
            return false;
        }
    }

    /**
     * Reset password (clears existing password - use with caution!)
     */
    resetPassword() {
        if (confirm('Are you sure you want to reset the admin password? You will need to set a new one.')) {
            localStorage.removeItem(this.PASSWORD_KEY);
            this.logout();
            return true;
        }
        return false;
    }

    // ====================================
    // Session Management
    // ====================================

    /**
     * Create authenticated session
     * @param {boolean} rememberMe - Extend session duration
     */
    createSession(rememberMe = false) {
        const session = {
            authenticated: true,
            timestamp: Date.now(),
            expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : this.SESSION_DURATION)
        };

        // Use sessionStorage for temporary, localStorage for "remember me"
        if (rememberMe) {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } else {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
    }

    /**
     * Check if user is authenticated with valid session
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        // Check sessionStorage first (temporary session)
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);

        // If not in sessionStorage, check localStorage (remember me)
        if (!sessionData) {
            sessionData = localStorage.getItem(this.SESSION_KEY);
        }

        if (!sessionData) return false;

        try {
            const session = JSON.parse(sessionData);

            // Check if session is expired
            if (Date.now() > session.expiresAt) {
                this.logout();
                return false;
            }

            return session.authenticated === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get session info
     * @returns {Object|null} Session data or null
     */
    getSession() {
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);
        if (!sessionData) {
            sessionData = localStorage.getItem(this.SESSION_KEY);
        }

        if (!sessionData) return null;

        try {
            return JSON.parse(sessionData);
        } catch (error) {
            return null;
        }
    }

    /**
     * Logout and clear session
     */
    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
    }

    /**
     * Extend current session (renew timestamp)
     */
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = Date.now() + this.SESSION_DURATION;

            // Update in appropriate storage
            if (sessionStorage.getItem(this.SESSION_KEY)) {
                sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            } else {
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            }
        }
    }

    // ====================================
    // Login Flow
    // ====================================

    /**
     * Complete login flow
     * @param {string} password - Password to verify
     * @param {boolean} rememberMe - Remember session
     * @returns {Promise<Object>} Result object with success and message
     */
    async login(password, rememberMe = false) {
        try {
            // Check if this is first-time setup
            if (!this.isPasswordSet()) {
                const success = await this.setPassword(password);
                if (success) {
                    this.createSession(rememberMe);
                    return {
                        success: true,
                        message: 'Password set successfully! Welcome to your blog admin.',
                        firstTime: true
                    };
                } else {
                    return {
                        success: false,
                        message: 'Failed to set password. Please try again.'
                    };
                }
            }

            // Verify password
            const isValid = await this.verifyPassword(password);
            if (isValid) {
                this.createSession(rememberMe);
                return {
                    success: true,
                    message: 'Login successful!',
                    firstTime: false
                };
            } else {
                return {
                    success: false,
                    message: 'Incorrect password. Please try again.'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'An error occurred during login.'
            };
        }
    }

    /**
     * Require authentication (redirect to login if not authenticated)
     * @param {string} loginUrl - URL to redirect to for login
     */
    requireAuth(loginUrl = '../admin/index.html') {
        if (!this.isAuthenticated()) {
            // Store intended destination
            sessionStorage.setItem('blog_redirect_after_login', window.location.href);

            // Redirect to login
            window.location.href = loginUrl;
            return false;
        }
        return true;
    }

    /**
     * Get redirect URL after login
     * @returns {string|null} Stored redirect URL or null
     */
    getRedirectUrl() {
        const url = sessionStorage.getItem('blog_redirect_after_login');
        sessionStorage.removeItem('blog_redirect_after_login');
        return url;
    }

    // ====================================
    // Security Utilities
    // ====================================

    /**
     * Get time until session expires
     * @returns {number} Minutes until expiration, or 0 if not authenticated
     */
    getSessionTimeRemaining() {
        const session = this.getSession();
        if (!session) return 0;

        const remaining = session.expiresAt - Date.now();
        return Math.max(0, Math.floor(remaining / (60 * 1000))); // Convert to minutes
    }

    /**
     * Check if session will expire soon (within 5 minutes)
     * @returns {boolean} True if expiring soon
     */
    isSessionExpiringSoon() {
        return this.getSessionTimeRemaining() <= 5;
    }

    /**
     * Auto-extend session on activity
     */
    setupAutoExtend() {
        if (!this.isAuthenticated()) return;

        // Extend session on user activity
        const extendOnActivity = () => {
            if (this.isSessionExpiringSoon()) {
                this.extendSession();
            }
        };

        // Listen to user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, extendOnActivity, { once: true, passive: true });
        });

        // Set up recurring check
        setTimeout(() => this.setupAutoExtend(), 5 * 60 * 1000); // Check every 5 minutes
    }
}

// Create global instance
window.BlogAuth = new BlogAuth();

// Auto-setup session extension if authenticated
if (window.BlogAuth.isAuthenticated()) {
    window.BlogAuth.setupAutoExtend();
}
