/**
 * API Module for Smart College Venue Booking System
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = '/api';

// API object with all methods
const API = {
    /**
     * Get the authentication token from localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Logout user by clearing localStorage
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Make an authenticated fetch request
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ==================== Authentication ====================

    /**
     * Register a new user
     */
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    /**
     * Login user
     */
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    /**
     * Get current user info
     */
    async getCurrentUserInfo() {
        return this.request('/auth/me');
    },

    // ==================== Venues ====================

    /**
     * Get all venues with optional filters
     */
    async getVenues(search = '', type = '', minCapacity = '', status = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (type) params.append('venue_type', type);
        if (minCapacity) params.append('min_capacity', minCapacity);
        if (status) params.append('status', status);
        
        const queryString = params.toString();
        return this.request(`/venues${queryString ? '?' + queryString : ''}`);
    },

    /**
     * Get venue by ID
     */
    async getVenue(venueId) {
        return this.request(`/venues/${venueId}`);
    },

    /**
     * Get venues by category
     */
    async getVenuesByCategory(category) {
        return this.request(`/venues/category/${encodeURIComponent(category)}`);
    },

    /**
     * Check venue availability
     */
    async checkVenueAvailability(venueId, date) {
        return this.request(`/venues/${venueId}/availability?date=${date}`);
    },

    /**
     * Get venue types
     */
    async getVenueTypes() {
        return this.request('/venues/types');
    },

    /**
     * Create venue (Admin only)
     */
    async createVenue(venueData) {
        return this.request('/venues', {
            method: 'POST',
            body: JSON.stringify(venueData)
        });
    },

    /**
     * Update venue (Admin only)
     */
    async updateVenue(venueId, venueData) {
        return this.request(`/venues/${venueId}`, {
            method: 'PUT',
            body: JSON.stringify(venueData)
        });
    },

    /**
     * Delete venue (Admin only)
     */
    async deleteVenue(venueId) {
        return this.request(`/venues/${venueId}`, {
            method: 'DELETE'
        });
    },

    // ==================== Bookings ====================

    /**
     * Create a new booking
     */
    async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    /**
     * Get current user's bookings
     */
    async getMyBookings(status = '') {
        const params = status ? `?status=${status}` : '';
        return this.request(`/bookings/my${params}`);
    },

    /**
     * Get all bookings
     */
    async getAllBookings(status = '') {
        const params = status ? `?status=${status}` : '';
        return this.request(`/bookings/all${params}`);
    },

    /**
     * Get booking by ID
     */
    async getBooking(bookingId) {
        return this.request(`/bookings/${bookingId}`);
    },

    /**
     * Get booking schedule (upcoming events)
     */
    async getBookingSchedule(limit = 20) {
        return this.request(`/bookings/schedule?limit=${limit}`);
    },

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId) {
        return this.request(`/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
    },

    // ==================== Admin ====================

    /**
     * Get admin dashboard stats
     */
    async getAdminDashboard() {
        return this.request('/admin/dashboard');
    },

    /**
     * Get pending bookings
     */
    async getPendingBookings() {
        return this.request('/admin/pending-bookings');
    },

    /**
     * Approve booking
     */
    async approveBooking(bookingId, adminRemarks = '') {
        return this.request(`/admin/bookings/${bookingId}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ admin_remarks: adminRemarks })
        });
    },

    /**
     * Reject booking
     */
    async rejectBooking(bookingId, adminRemarks = '') {
        return this.request(`/admin/bookings/${bookingId}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ admin_remarks: adminRemarks })
        });
    },

    /**
     * Delete booking (Admin)
     */
    async adminDeleteBooking(bookingId) {
        return this.request(`/admin/bookings/${bookingId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Get all users
     */
    async getAllUsers(role = '') {
        const params = role ? `?role=${role}` : '';
        return this.request(`/admin/users${params}`);
    },

    /**
     * Get venue utilization report
     */
    async getVenueUtilization() {
        return this.request('/admin/reports/venue-utilization');
    },

    /**
     * Get monthly bookings report
     */
    async getMonthlyBookings(year = null) {
        const params = year ? `?year=${year}` : '';
        return this.request(`/admin/reports/monthly-bookings${params}`);
    }
};

// Make API globally available
window.API = API;
