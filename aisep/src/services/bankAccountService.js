import apiClient from './apiClient';

/**
 * Service for managing Advisor Bank Accounts
 */
const bankAccountService = {
  /**
   * Advisor: Get their own active bank account
   */
  async getMyBank() {
    try {
      const response = await apiClient.get('/api/advisor-bank-accounts/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) return null;
      throw error;
    }
  },

  /**
   * Advisor: Create a new bank account
   */
  async createMyBank(data) {
    const response = await apiClient.post('/api/advisor-bank-accounts', data);
    return response.data;
  },

  /**
   * Advisor: Update existing bank account
   */
  async updateMyBank(id, data) {
    const response = await apiClient.put(`/api/advisor-bank-accounts/${id}`, data);
    return response.data;
  },

  /**
   * Advisor: Deactivate a bank account
   */
  async deactivateBank(id) {
    const response = await apiClient.patch(`/api/advisor-bank-accounts/${id}/deactivate`);
    return response.data;
  },

  /**
   * Staff/Admin: Get all bank accounts
   */
  async getAllBanks(params) {
    const response = await apiClient.get('/api/advisor-bank-accounts', { params });
    return response.data;
  },

  /**
   * Get specific bank account by ID
   */
  async getBankById(id) {
    const response = await apiClient.get(`/api/advisor-bank-accounts/${id}`);
    return response.data;
  }
};

export default bankAccountService;
