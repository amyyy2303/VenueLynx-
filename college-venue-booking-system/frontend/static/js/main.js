/**
 * Main JavaScript Module for Smart College Venue Booking System
 * Contains utility functions and global initialization
 */

// ==================== Utility Functions ====================

/**
 * Format date for display
 */
function formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format time for display
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 
                    type === 'error' ? 'bg-danger' : 
                    type === 'warning' ? 'bg-warning' : 'bg-info';

    const toastHtml = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body d-flex align-items-center">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();

    // Remove toast element after it's hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

/**
 * Show a loading spinner
 */
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">${message}</p>
            </div>
        `;
    }
}

/**
 * Handle API errors consistently
 */
function handleApiError(error, fallbackMessage = 'An error occurred') {
    console.error('API Error:', error);
    const message = error.message || fallbackMessage;
    showToast(message, 'error');
    return message;
}

/**
 * Check if user is authenticated
 */
function requireAuth() {
    const user = API.getCurrentUser();
    if (!user) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return false;
    }
    return true;
}

/**
 * Check if user is admin
 */
function requireAdmin() {
    const user = API.getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

/**
 * Get URL parameter
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Set URL parameter without page reload
 */
function setUrlParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.pushState({}, '', url);
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge bg-warning text-dark">Pending</span>',
        approved: '<span class="badge bg-success">Approved</span>',
        rejected: '<span class="badge bg-danger">Rejected</span>',
        cancelled: '<span class="badge bg-secondary">Cancelled</span>',
        available: '<span class="badge bg-success">Available</span>',
        unavailable: '<span class="badge bg-danger">Unavailable</span>',
        maintenance: '<span class="badge bg-warning">Maintenance</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number format
 */
function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Generate a unique ID
 */
function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ==================== Form Helpers ====================

/**
 * Serialize form data to object
 */
function serializeForm(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (like checkboxes)
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

/**
 * Populate form with data
 */
function populateForm(formId, data) {
    const form = document.getElementById(formId);
    
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = Boolean(data[key]);
            } else if (input.type === 'radio') {
                const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                input.value = data[key];
            }
        }
    });
}

/**
 * Clear form
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    form.reset();
    
    // Clear any custom validators
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
}

// ==================== Table Helpers ====================

/**
 * Sort table data
 */
function sortTableData(data, column, direction = 'asc') {
    return [...data].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle dates
        if (column.includes('date') || column.includes('time')) {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle strings
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (direction === 'asc') {
            return aVal.localeCompare(bVal);
        } else {
            return bVal.localeCompare(aVal);
        }
    });
}

/**
 * Paginate table data
 */
function paginateData(data, page, pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
        data: data.slice(start, end),
        total: data.length,
        totalPages: Math.ceil(data.length / pageSize),
        currentPage: page
    };
}

// ==================== Storage Helpers ====================

/**
 * Get from localStorage with expiry
 */
function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    return item.value;
}

/**
 * Set to localStorage with expiry
 */
function setWithExpiry(key, value, ttl) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// ==================== Global Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

    // Add active class to current nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });
});

// Export functions for use in other modules
window.formatDate = formatDate;
window.formatTime = formatTime;
window.debounce = debounce;
window.showToast = showToast;
window.showLoading = showLoading;
window.handleApiError = handleApiError;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.getUrlParam = getUrlParam;
window.setUrlParam = setUrlParam;
window.copyToClipboard = copyToClipboard;
window.formatNumber = formatNumber;
window.getStatusBadge = getStatusBadge;
window.isValidEmail = isValidEmail;
window.serializeForm = serializeForm;
window.populateForm = populateForm;
window.clearForm = clearForm;
window.sortTableData = sortTableData;
window.paginateData = paginateData;
