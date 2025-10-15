/**
 * Authentication Module
 * Handles user login, logout, and session management
 */

// Master credentials
const MASTER_CREDENTIALS = {
    username: 'acuzen',
    password: 'acuzen'
};

// Session storage key
const AUTH_KEY = 'cioms-auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Login user with credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {boolean} - True if login successful
 */
export function login(username, password) {
    if (username === MASTER_CREDENTIALS.username && password === MASTER_CREDENTIALS.password) {
        const session = {
            username: username,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return true;
    }

    return false;
}

/**
 * Logout current user
 */
export function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated and session valid
 */
export function checkAuth() {
    const sessionData = localStorage.getItem(AUTH_KEY);

    if (!sessionData) {
        return false;
    }

    try {
        const session = JSON.parse(sessionData);
        const now = Date.now();

        // Check if session has expired
        if (now > session.expiresAt) {
            localStorage.removeItem(AUTH_KEY);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem(AUTH_KEY);
        return false;
    }
}

/**
 * Get current session data
 * @returns {Object|null} - Session data or null if not authenticated
 */
export function getSession() {
    const sessionData = localStorage.getItem(AUTH_KEY);

    if (!sessionData) {
        return null;
    }

    try {
        const session = JSON.parse(sessionData);

        // Check if session has expired
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(AUTH_KEY);
            return null;
        }

        return session;
    } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem(AUTH_KEY);
        return null;
    }
}

/**
 * Require authentication - redirect to login if not authenticated
 * Call this function at the start of protected pages
 */
export function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'index.html';
    }
}

/**
 * Extend current session expiration
 */
export function extendSession() {
    const session = getSession();

    if (session) {
        session.expiresAt = Date.now() + SESSION_DURATION;
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    }
}

// Auto-extend session on user activity
let activityTimeout;
function resetActivityTimer() {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        extendSession();
    }, 5 * 60 * 1000); // Extend after 5 minutes of activity
}

// Listen for user activity
if (typeof window !== 'undefined') {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });
}
