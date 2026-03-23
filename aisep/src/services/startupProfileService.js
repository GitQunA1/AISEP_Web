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
        // Using loose equality (==) since localStorage/JWT might store userId as a string while API returns a number.
        const match = items.find(s => s.userId == userId || s.UserId == userId);
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
      const formData = new FormData();
      Object.keys(startupData).forEach(key => {
        if (startupData[key] !== null && startupData[key] !== undefined) {
          // Flatten objects if needed, but for files we append directly
          formData.append(key, startupData[key]);
        }
      });
      
      const response = await apiClient.post('/api/Startups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
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
      const { userId, LogoFile, BusinessLicenseFile, ...restData } = startupData;
      
      const formData = new FormData();
      
      // Append text fields
      Object.keys(restData).forEach(key => {
        if (restData[key] !== null && restData[key] !== undefined) {
          formData.append(key, restData[key]);
        }
      });
      
      // Append files with exact names matching backend [FromForm] UpdateStartupRequest
      if (LogoFile) formData.append('LogoFile', LogoFile);
      if (BusinessLicenseFile) formData.append('BusinessLicenseFile', BusinessLicenseFile);
      
      const response = await apiClient.put(`/api/Startups/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    } catch (error) {
      console.error('Error updating startup profile:', error);
      throw error;
    }
  },

  /**
   * Approve a pending startup profile
   * @param {number} id - The ID of the startup to approve
   * @returns {Promise<Object>} Response from the server
   */
  approveStartup: async (id) => {
    try {
      return await apiClient.patch(`/api/Startups/${id}/approve`);
    } catch (error) {
      console.error(`Error approving startup ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reject a pending startup profile
   * @param {number} id - The ID of the startup to reject
   * @param {string} reason - The reason for rejection
   * @returns {Promise<Object>} Response from the server
   */
  rejectStartup: async (id, reason) => {
    try {
      return await apiClient.patch(`/api/Startups/${id}/reject`, { reason });
    } catch (error) {
      console.error(`Error rejecting startup ${id}:`, error);
      throw error;
    }
  }
};

export default startupProfileService;
