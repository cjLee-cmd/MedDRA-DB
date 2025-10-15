/**
 * Application Initialization
 * Global app setup and utilities
 */

import db from './db/database.js';

// Initialize database on app load
let dbInitialized = false;

export async function initApp() {
    try {
        await db.init();
        dbInitialized = true;
        updateDBStatus('connected');
        console.log('✓ Application initialized successfully');
        return true;
    } catch (error) {
        console.error('✗ Application initialization failed:', error);
        updateDBStatus('error');
        showError('데이터베이스 초기화 실패: ' + error.message);
        return false;
    }
}

// Update database status indicator
function updateDBStatus(status) {
    const statusElement = document.getElementById('db-status');
    if (statusElement) {
        if (status === 'connected') {
            statusElement.textContent = 'IndexedDB: 연결됨';
            statusElement.classList.add('connected');
            statusElement.classList.remove('error');
        } else if (status === 'error') {
            statusElement.textContent = 'IndexedDB: 오류';
            statusElement.classList.add('error');
            statusElement.classList.remove('connected');
        } else {
            statusElement.textContent = 'IndexedDB: 연결 중...';
            statusElement.classList.remove('connected', 'error');
        }
    }
}

// Global error handler
export function showError(message) {
    const errorElement = document.getElementById('error');
    const errorMessageElement = document.getElementById('error-message');

    if (errorElement && errorMessageElement) {
        errorMessageElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert('오류: ' + message);
    }
}

// Show toast notification
export function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = 'toast ' + type;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}

// Show loading state
export function showLoading(show = true) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// Format date for display
export function formatDate(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Format datetime for display
export function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';

    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Escape HTML to prevent XSS
export function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Confirm action
export function confirm(message) {
    return window.confirm(message);
}

// Check if database is initialized
export function isDBInitialized() {
    return dbInitialized;
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for global use
window.showToast = showToast;
window.showError = showError;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
