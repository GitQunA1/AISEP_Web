import { apiClient } from './apiClient';

/**
 * Investor Service
 * Interacts with /api/Investor endpoints
 */
const investorService = {
  /**
   * Fetch all investors (optionally with Sieve filters)
   * @param {Object} queryParams - e.g., { page, pageSize, filters }
   * @returns {Promise<Object>} Object containing data.items and pagination info
   */
  getAllInvestors: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/api/Investor', { params: queryParams });
      
      // Handle the success response where items might be empty
      if (response && response.data) {
        return response.data;
      }
      return { items: [], totalCount: 0 };
    } catch (error) {
       // If 404 is returned because there are no investors, handle gracefully
       if (error?.statusCode === 404 || error?.response?.status === 404) {
          return { items: [], totalCount: 0 };
       }
       console.error('Error fetching all investors:', error);
       throw error;
    }
  },

  /**
   * Fetch investor details by ID
   * @param {number|string} investorId 
   * @returns {Promise<Object>} Investor details
   */
  getInvestorById: async (investorId) => {
    try {
      const response = await apiClient.get(`/api/Investor/${investorId}`);
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      // If 404, return null cleanly
      if (error?.statusCode === 404 || error?.response?.status === 404) {
         return null;
      }
      console.error(`Error fetching investor ${investorId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch current authenticated investor's profile
   * @returns {Promise<Object>} Investor profile
   */
  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/api/Investor/me');
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      if (error?.statusCode === 404 || error?.response?.status === 404) {
        return null;
      }
      console.error('Error fetching my investor profile:', error);
      throw error;
    }
  },

  /**
   * Update investor profile details
   * @param {number|string} investorId 
   * @param {FormData|Object} data 
   * @returns {Promise<Object>} Updated investor details
   */
  updateInvestor: async (investorId, data) => {
    try {
      // Backend expects [FromForm] so we use multipart/form-data if data is FormData
      // Else apiClient handles JSON.
      const response = await apiClient.put(`/api/Investor/${investorId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating investor ${investorId}:`, error);
      throw error;
    }
  }
};

export default investorService;
