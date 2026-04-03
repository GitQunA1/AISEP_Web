import { apiClient } from './apiClient';

/**
 * Authentication Service
 * Handles user login, registration, and email confirmation
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} data - { email, password, confirmPassword, fullName, ... }
   * @returns {Promise<any>} Response from the backend
   */
  register: async (data) => {
    // Backend RegisterRequest fields: Name, Email, Password, ConfirmPassword, Role
    const payload = {
      name: data.fullName || data.name || '',
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role ?? 0,  // UserRole enum: 0=Startup, 1=Investor, 2=Advisor, 3=Staff, 4=Admin
    };

    const response = await apiClient.post('/api/Auth/register', payload);
    return response;
  },

  /**
   * Log in a user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<any>} The whole ApiResponse containing the token
   */
  login: async (credentials) => {
    const response = await apiClient.post('/api/Auth/login', credentials);
    return response;
  },

  /**
   * Confirm an email address
   * @param {string} userId - ID from the confirmation link
   * @param {string} token - Token from the confirmation link
   * @returns {Promise<any>} 
   */
  confirmEmail: async (userId, token) => {
    const response = await apiClient.get('/api/Auth/confirm-email', {
      params: { userId, token }
    });
    return response;
  },
  
  /**
   * Refresh the access token
   * @param {string} refreshToken 
   * @returns {Promise<any>}
   */
  refreshToken: async (refreshToken) => {
     const response = await apiClient.post('/api/Auth/refresh-token', { refreshToken });
     return response;
  },
  
  /**
   * Logout user from backend
   * @returns {Promise<any>}
   */
  logout: async () => {
    const response = await apiClient.post('/api/Auth/logout');
    return response;
  }
};

export default authService;
