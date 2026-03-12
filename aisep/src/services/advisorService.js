import apiClient from './apiClient';

/**
 * Advisor Service
 * Handles fetching advisor data from the backend
 */
const advisorService = {
  /**
   * Fetch all advisors with optional filtering
   * @param {Object} queryParams - Sieve query params (page, pageSize, filters, etc.)
   * @returns {Promise<Object>} Response data containing items array
   */
  getAllAdvisors: async (queryParams = {}) => {
    try {
      // apiClient interceptor returns ApiResponse<T> wrapper; data is at response.data
      return await apiClient.get('/api/Advisor', { params: queryParams });
    } catch (error) {
      console.error('Error fetching all advisors:', error);
      throw error;
    }
  },

  /**
   * Fetch a specific advisor by their ID
   * @param {number} id - The ID of the advisor
   * @returns {Promise<Object|null>} The advisor object or null
   */
  getAdvisorById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Advisor/${id}`);
      // apiClient interceptor returns ApiResponse<T>; the data is at response.data
      return response?.data ?? response;
    } catch (error) {
      console.error(`Error fetching advisor by id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get the current user's advisor profile
   * @returns {Promise<Object|null>}
   */
  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/api/Advisor/me');
      return response?.data ?? response;
    } catch (error) {
      if (error.statusCode === 404) return null;
      console.error('Error fetching advisor profile:', error);
      throw error;
    }
  }
};

export default advisorService;
