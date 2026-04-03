/**
 * API Debug Utility - Comprehensive debugging for API calls
 * Use this to verify token, headers, response structure, and errors
 */

export const apiDebug = {
  /**
   * Check if user is authenticated
   */
  checkAuth: () => {
    const token = localStorage.getItem('aisep_token');
    const refreshToken = localStorage.getItem('aisep_refresh_token');
    const user = localStorage.getItem('aisep_user');
    
    console.log('[API Debug] Authentication Check:');
    console.log('  ✓ aisep_token:', token ? `${token.substring(0, 20)}...` : '❌ NOT FOUND');
    console.log('  ✓ aisep_refresh_token:', refreshToken ? '✓ Present' : '❌ NOT FOUND');
    console.log('  ✓ aisep_user:', user ? JSON.parse(user) : '❌ NOT FOUND');
    
    return {
      isAuthenticated: !!token,
      hasRefreshToken: !!refreshToken,
      user: user ? JSON.parse(user) : null,
      token: token ? token.substring(0, 20) + '...' : null
    };
  },

  /**
   * Log API request details
   */
  logRequest: (method, url, data = null, token = null) => {
    console.log(`\n[API Debug] ${method} Request:`, {
      method,
      url,
      hasToken: !!token,
      data
    });
  },

  /**
   * Log API response details
   */
  logResponse: (method, url, response, error = null) => {
    if (error) {
      console.error(`\n[API Debug] ${method} ${url} - ERROR:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        errorData: error.response?.data,
        headers: error.response?.headers
      });
      return;
    }

    console.log(`\n[API Debug] ${method} ${url} - SUCCESS:`, {
      status: response.status || response.statusCode,
      data: response.data,
      message: response.message,
      success: response.success
    });
  },

  /**
   * Test GET /api/Deals endpoint
   */
  testGetDeals: async (apiClient) => {
    console.log('\n\n=== TESTING GET /api/Deals ===');
    
    const auth = this.checkAuth();
    console.log('\nStep 1: Auth Check:', auth);
    
    if (!auth.isAuthenticated) {
      console.error('❌ NOT AUTHENTICATED - Cannot test API');
      return null;
    }

    try {
      console.log('\nStep 2: Making GET /api/Deals request...');
      const response = await apiClient.get('/api/Deals');
      
      console.log('\nStep 3: Response received:', response);
      console.log('  ✓ Status:', response.status || response.statusCode);
      console.log('  ✓ Success:', response.success);
      console.log('  ✓ Message:', response.message);
      console.log('  ✓ Data structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasItems: response.data?.items ? '✓ Has items array' : 'No items array',
        length: Array.isArray(response.data) ? response.data.length : Array.isArray(response.data?.items) ? response.data.items.length : 0
      });
      console.log('  ✓ Full data:', response.data);

      return response;
    } catch (error) {
      console.error('\n❌ ERROR during GET /api/Deals:', {
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        errorMessage: error.response?.data?.message,
        fullError: error
      });
      return null;
    }
  },

  /**
   * Test GET /api/Deals/{dealId}/contract-status endpoint
   */
  testContractStatus: async (apiClient, dealId) => {
    console.log(`\n\n=== TESTING GET /api/Deals/${dealId}/contract-status ===`);
    
    const auth = this.checkAuth();
    if (!auth.isAuthenticated) {
      console.error('❌ NOT AUTHENTICATED');
      return null;
    }

    try {
      console.log(`Making request for dealId: ${dealId}...`);
      const response = await apiClient.get(`/api/Deals/${dealId}/contract-status`);
      
      console.log('✓ Response:', response);
      console.log('  Status:', response.status || response.statusCode);
      console.log('  Data:', response.data);
      
      return response;
    } catch (error) {
      console.error(`❌ ERROR:`, {
        status: error.response?.status,
        message: error.message,
        errorData: error.response?.data
      });
      return null;
    }
  },

  /**
   * Test POST /api/Deals endpoint
   */
  testCreateDeal: async (apiClient, projectId) => {
    console.log(`\n\n=== TESTING POST /api/Deals (projectId: ${projectId}) ===`);
    
    const auth = this.checkAuth();
    if (!auth.isAuthenticated) {
      console.error('❌ NOT AUTHENTICATED');
      return null;
    }

    try {
      console.log('Making POST request...');
      const response = await apiClient.post('/api/Deals', {
        projectId: projectId
      });
      
      console.log('✓ Response:', response);
      console.log('  Status:', response.status || response.statusCode);
      console.log('  Success:', response.success);
      console.log('  Message:', response.message);
      console.log('  Data:', response.data);
      console.log('  DealId:', response.data?.dealId);
      
      return response;
    } catch (error) {
      console.error(`❌ ERROR:`, {
        status: error.response?.status,
        message: error.message,
        errorData: error.response?.data
      });
      return null;
    }
  }
};

export default apiDebug;
