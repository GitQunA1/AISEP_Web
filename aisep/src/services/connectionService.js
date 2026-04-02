import apiClient from './apiClient';

/**
 * Connection Service - Handles investor-startup connections and interactions
 */
const connectionService = {
  /**
   * Create a connection request (investor shows interest in a startup project)
   * POST /api/connections/requests
   * @param {number} projectId - The project ID
   * @param {string} message - Optional message from investor
   * @returns {Promise<any>}
   */
  createConnectionRequest: async (projectId, message = '') => {
    try {
      const payload = {
        projectId: projectId,
        message: message || 'Tôi quan tâm đến dự án này'
      };
      const response = await apiClient.post('/api/connections/requests', payload);
      return response;
    } catch (error) {
      console.error('Failed to create connection request:', error);
      throw error;
    }
  },

  /**
   * Get founder contact information for a project
   * GET /api/projects/{id}/founder-contact
   * @param {number} projectId - The project ID
   * @returns {Promise<any>}
   */
  getFounderContact: async (projectId) => {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/founder-contact`);
      return response;
    } catch (error) {
      console.error('Failed to get founder contact:', error);
      throw error;
    }
  },

  /**
   * Get all connection requests sent by current investor
   * GET /api/connections/requests - Get requests sent by investor
   * @returns {Promise<any>}
   */
  getMyConnections: async () => {
    try {
      const response = await apiClient.get('/api/connections/requests');
      console.log('[connectionService] My connections:', response);
      return response;
    } catch (error) {
      console.error('Failed to get connections:', error);
      throw error;
    }
  },

  /**
   * Alias for getMyConnections - Get sent requests with pagination support
   * @param {object} params - Query params (page, pageSize, status, filters, sorts)
   * @returns {Promise<any>}
   */
  getMyConnectionRequests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/connections/requests?${queryString}` : '/api/connections/requests';
      const response = await apiClient.get(url);
      console.log('[connectionService] My connection requests:', response);
      return response;
    } catch (error) {
      console.error('Failed to get my connection requests:', error);
      throw error;
    }
  },

  /**
   * Respond to a connection request
   * PATCH /api/connections/requests/{id}/respond
   * @param {number} requestId - The connection request ID
   * @param {boolean} isAccepted - Accept or reject the request
   * @returns {Promise<any>}
   */
  respondToConnection: async (requestId, isAccepted) => {
    try {
      const response = await apiClient.patch(
        `/api/connections/requests/${requestId}/respond`,
        { isAccepted: isAccepted }
      );
      return response;
    } catch (error) {
      console.error('Failed to respond to connection:', error);
      throw error;
    }
  },

  /**
   * Get connection requests received by startup (for startup dashboard)
   * Tries multiple endpoints with fallback logic
   * @returns {Promise<any>}
   */
  getReceivedConnectionRequests: async () => {
    try {
      // Try the received endpoint first
      console.log('[connectionService] Attempting to fetch from /api/connections/requests/received');
      try {
        const response = await apiClient.get('/api/connections/requests/received');
        console.log('[connectionService] Received requests response:', response);
        return response;
      } catch (receivedError) {
        console.warn('[connectionService] /api/connections/requests/received failed, trying alternative endpoint');
        
        // Fallback: Try /api/connections/requests with filter parameter
        const altResponse = await apiClient.get('/api/connections/requests?type=received');
        console.log('[connectionService] Alternative endpoint response:', altResponse);
        return altResponse;
      }
    } catch (error) {
      console.error('[connectionService] All endpoints failed. Error:', error);
      // Return empty response structure
      return {
        success: false,
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0
        },
        message: error?.message || 'Failed to fetch received requests'
      };
    }
  }
};

export default connectionService;
