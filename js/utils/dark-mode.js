/**
 * Dark Mode Toggle Utility
 * CIOMS-I Form Management System
 */

const THEME_KEY = 'cioms-theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

/**
 * Initialize dark mode
 */
export function initDarkMode() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (systemPrefersDark ? THEME_DARK : THEME_LIGHT);

    setTheme(initialTheme, false);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
            setTheme(e.matches ? THEME_DARK : THEME_LIGHT, false);
        }
    });
}

/**
 * Set theme
 * @param {string} theme - 'light' or 'dark'
 * @param {boolean} save - Whether to save to localStorage
 */
export function setTheme(theme, save = true) {
    const validTheme = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;

    document.documentElement.setAttribute('data-theme', validTheme);

    if (save) {
        localStorage.setItem(THEME_KEY, validTheme);
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: validTheme } }));
}

/**
 * Get current theme
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getTheme() {
    return document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
}

/**
 * Toggle theme
 */
export function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setTheme(newTheme);
    return newTheme;
}

/**
 * Create theme toggle button
 * @param {HTMLElement} container - Container element to append button
 * @returns {HTMLElement} Toggle button element
 */
export function createThemeToggle(container) {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');
    button.setAttribute('title', 'Toggle dark mode');

    updateToggleButton(button);

    button.addEventListener('click', () => {
        toggleTheme();
        updateToggleButton(button);
    });

    // Listen for theme changes from other sources
    window.addEventListener('themechange', () => {
        updateToggleButton(button);
    });

    if (container) {
        container.appendChild(button);
    }

    return button;
}

/**
 * Update toggle button appearance
 * @param {HTMLElement} button - Toggle button element
 */
function updateToggleButton(button) {
    const theme = getTheme();
    const isDark = theme === THEME_DARK;

    button.innerHTML = `
        <svg class="theme-toggle-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg class="theme-toggle-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <span>${isDark ? '라이트 모드' : '다크 모드'}</span>
    `;

    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('title', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
}

/**
 * Auto-initialize when script loads
 */
if (typeof window !== 'undefined') {
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        initDarkMode();
    }
}

// Export functions
export default {
    init: initDarkMode,
    setTheme,
    getTheme,
    toggleTheme,
    createThemeToggle,
    THEME_LIGHT,
    THEME_DARK
};
