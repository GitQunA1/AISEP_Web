import { apiClient } from './apiClient';

/**
 * Terms and Conditions Service
 * Handles fetching active terms and user acceptance
 */
export const termsService = {
  /**
   * Fetch the currently active T&C version and content
   * @returns {Promise<any>} Response { termsId, content, version, lastUpdated }
   */
  getActiveTerms: async () => {
    return await apiClient.get('/api/terms/active');
  },

  /**
   * Mark a user as having accepted a specific T&C version
   * Called for existing users who need to re-accept updated terms
   * @param {string} version - The version string (e.g. 'v1.1')
   * @returns {Promise<any>}
   */
  acceptTerms: async (version) => {
    return await apiClient.put('/api/auth/accept-terms', { termsVersion: version });
  }
};

export default termsService;
