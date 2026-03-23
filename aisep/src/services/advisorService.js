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
      console.log('[ADVISOR_SERVICE] Fetching advisor profile from /api/Advisor/me');
      const response = await apiClient.get('/api/Advisor/me');
      console.log('[ADVISOR_SERVICE] Raw response:', response);
      
      // API returns ApiResponse wrapper with data inside
      // Structure: { success, message, data: { advisorId, userName, email, bio, ... }, errors, statusCode }
      const data = response?.data?.data ?? response?.data ?? response;
      console.log('[ADVISOR_SERVICE] Extracted advisor data:', data);
      return data;
    } catch (error) {
      console.error('[ADVISOR_SERVICE] Error fetching advisor profile:', error);
      console.error('[ADVISOR_SERVICE] Error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        data: error.data
      });
      if (error.statusCode === 404) {
        console.log('[ADVISOR_SERVICE] Profile not found (404), returning null');
        return null;
      }
      throw error;
    }
  },

  /**
   * Update the current advisor's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>}
   */
  updateMyProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/Advisor/me', profileData);
      return response?.data ?? response;
    } catch (error) {
      console.error('Error updating advisor profile:', error);
      throw error;
    }
  }
};

export default advisorService;
