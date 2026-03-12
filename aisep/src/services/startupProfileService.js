import apiClient from './apiClient';

const startupProfileService = {
  /**
   * Fetch the startup profile for a specific user ID
   * @param {number} userId - The ID of the authenticated user
   * @returns {Promise<Object|null>} The startup object if found, or null if not created yet
   */
  getStartupProfileByUserId: async (userId) => {
    try {
      // apiClient interceptor returns the ApiResponse<T> wrapper, so data is at response.data
      const response = await apiClient.get('/api/Startups', {
        params: {
          filters: `userId==${userId}`,
          pageSize: 1
        }
      });
      
      const items = response?.data?.items || response?.items || [];
      if (items.length > 0) {
        // Explicitly check that the returned startup belongs to the logged in user
        // Since backend currently omits userId in StartupResponse, this will safely return null
        // rather than auto-mapping a random startup to the current user's profile.
        const match = items.find(s => s.userId === userId || s.UserId === userId);
        return match || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching startup profile by userId:', error);
      // If it's a 404 or fails, treat it as "no profile" to prevent blocking the UI layout
      return null;
    }
  },

  /**
   * Fetch a startup by its ID
   * @param {number} id - The ID of the startup
   * @returns {Promise<Object|null>} The startup object or null
   */
  getStartupById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Startups/${id}`);
      // apiClient interceptor returns ApiResponse<T>; the data is at response.data
      return response?.data ?? null;
    } catch (error) {
      console.error(`Error fetching startup by id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch all startups
   * @param {Object} queryParams - Sieve query params (page, pageSize, filters, etc.)
   * @returns {Promise<Object>} Response data containing items array
   */
  getAllStartups: async (queryParams = {}) => {
    try {
      // apiClient interceptor returns ApiResponse<T> wrapper; data is at response.data
      return await apiClient.get('/api/Startups', { params: queryParams });
    } catch (error) {
      console.error('Error fetching all startups:', error);
      throw error;
    }
  },

  /**
   * Create a new startup profile
   * @param {Object} startupData - The data payload matching CreateStartupRequest
   * @returns {Promise<Object>} The created startup object
   */
  createStartupProfile: async (startupData) => {
    try {
      return await apiClient.post('/api/Startups', startupData);
    } catch (error) {
      console.error('Error creating startup profile:', error);
      throw error;
    }
  },

  /**
   * Update an existing startup profile
   * @param {Object} startupData - The data payload matching UpdateStartupRequest
   * @returns {Promise<Object>} The updated startup object
   */
  updateStartupProfile: async (startupData) => {
    try {
      return await apiClient.put('/api/Startups', startupData);
    } catch (error) {
      console.error('Error updating startup profile:', error);
      throw error;
    }
  }
};

export default startupProfileService;
