import apiClient from './apiClient';

const walletService = {
  /**
   * Advisor: Create a new withdrawal request
   * @param {Object} dto { amount, bankName, bankAccount }
   */
  createWithdrawRequest: async (dto) => {
    return await apiClient.post('/api/wallets/withdraw-requests', dto);
  },

  /**
   * Advisor: Get own withdrawal requests history
   * @param {string} filters Sieve filters/sorts/paging
   */
  getMyWithdrawRequests: async (filters = '') => {
    return await apiClient.get(`/api/wallets/withdraw-requests/me?${filters}`);
  },

  /**
   * Advisor: Get own wallet summary (balance, pending)
   */
  getMyWallet: async () => {
    return await apiClient.get('/api/wallets/me');
  },

  /**
   * Advisor: Get own wallet transaction history
   * @param {string} filters Sieve filters/sorts/paging
   */
  getMyTransactions: async (filters = '') => {
    return await apiClient.get(`/api/wallets/me/transactions?${filters}`);
  },

  /**
   * Staff/Admin: Get all withdrawal requests
   * @param {string} filters Sieve filters/sorts/paging
   */
  getAllWithdrawRequests: async (filters = '') => {
    return await apiClient.get(`/api/wallets/withdraw-requests?${filters}`);
  },

  /**
   * Staff/Admin: Approve a withdrawal request
   * @param {number} id 
   * @param {string} proofImageUrl 
   */
  approveWithdrawal: async (id, proofImageUrl) => {
    return await apiClient.patch(`/api/wallets/withdraw-requests/${id}/approve`, { proofImageUrl });
  },

  /**
   * Staff/Admin: Reject a withdrawal request
   * @param {number} id 
   * @param {string} reason 
   */
  rejectWithdrawal: async (id, reason) => {
    return await apiClient.patch(`/api/wallets/withdraw-requests/${id}/reject`, { reason });
  }
};

export default walletService;
