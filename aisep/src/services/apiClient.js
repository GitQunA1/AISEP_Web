import axios from 'axios';
import { translateMessage } from '../utils/errorMessages';

// In development, use an empty string so that paths starting with /api
// are handled correctly by Vite's dev proxy. In production, use the absolute URL.
const baseURL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aisep_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles message translation and automatic token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the standard ApiResponse<T> wrapper from C# backend
    const data = response.data;
    // Translate the message field if present
    if (data && data.message) {
      data.message = translateMessage(data.message);
    }
    return data;
  },
  async (error) => {
    const originalRequest = error.config;
    const responseData = error.response?.data;

    // Translate error message from backend
    if (responseData?.message) {
      responseData.message = translateMessage(responseData.message);
    }

    // Handle 401 Unauthorized — attempt to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('aisep_refresh_token');

      if (refreshToken) {
        try {
          // Use a clean axios instance for refresh to avoid interceptor loop
          const refreshResponse = await axios.post(`${baseURL}/api/Auth/refresh-token`, {
            refreshToken: refreshToken
          }, {
             headers: { 'Content-Type': 'application/json' }
          });

          // Unwrap and check success
          const apiResponse = refreshResponse.data;
          const tokenData = apiResponse?.data;

          if (apiResponse?.success && tokenData?.accessToken) {
            // Store new tokens
            localStorage.setItem('aisep_token', tokenData.accessToken);
            localStorage.setItem('aisep_refresh_token', tokenData.refreshToken);

            // Update header and retry original request
            originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // If no refresh token or refresh failed, clear session and redirect
      localStorage.removeItem('aisep_token');
      localStorage.removeItem('aisep_refresh_token');
      localStorage.removeItem('aisep_user');
      
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    // Build a normalized error object for components
    const normalizedError = {
      message: responseData?.message
        ? responseData.message
        : error.message?.includes('Network Error') || error.code === 'ERR_NETWORK'
          ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
          : translateMessage(error.message || 'Đã xảy ra lỗi không xác định.'),
      errors: responseData?.errors || [],
      statusCode: error.response?.status,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
