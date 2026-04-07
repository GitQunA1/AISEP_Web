import apiClient from './apiClient';

const commissionService = {
  /**
   * Get current active system commission configuration
   */
  getCurrentCommission: async () => {
    return await apiClient.get('/api/system-commissions/current');
  },

  /**
   * Staff/Admin: Update current system commission
   * @param {Object} data { percent, reason }
   */
  updateCommission: async (data) => {
    return await apiClient.put('/api/system-commissions/current', data);
  },

  /**
   * Staff/Admin: Get commission change history
   * @param {string} filters Sieve filters/sorts/paging
   */
  getHistory: async (filters = '') => {
    return await apiClient.get(`/api/system-commissions/history?${filters}`);
  }
};

export default commissionService;
