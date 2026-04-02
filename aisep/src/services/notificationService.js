import apiClient from './apiClient';

/**
 * Notification Service - Handle notification-related API calls
 */
const notificationService = {
  /**
   * Get all notifications
   * GET /api/notifications
   * @param {object} params - Query parameters (page, pageSize, isRead, etc)
   * @returns {Promise<any>}
   */
  getNotifications: async (params = {}) => {
    try {
      console.log('[notificationService] Fetching notifications', params);
      const response = await apiClient.get('/api/notifications', { params });
      console.log('[notificationService] Notifications response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to get notifications:', error);
      throw error;
    }
  },

  /**
   * Get single notification
   * GET /api/notifications/{notificationId}
   * @param {number} notificationId - Notification ID
   * @returns {Promise<any>}
   */
  getNotification: async (notificationId) => {
    try {
      console.log('[notificationService] Fetching notification:', notificationId);
      const response = await apiClient.get(`/api/notifications/${notificationId}`);
      console.log('[notificationService] Notification response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to get notification:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * PATCH /api/notifications/{notificationId}/read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<any>}
   */
  markAsRead: async (notificationId) => {
    try {
      console.log('[notificationService] Marking as read:', notificationId);
      const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
      console.log('[notificationService] Mark as read response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to mark as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   * @returns {Promise<any>}
   */
  markAllAsRead: async () => {
    try {
      console.log('[notificationService] Marking all as read');
      const response = await apiClient.patch('/api/notifications/read-all');
      console.log('[notificationService] Mark all as read response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to mark all as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   * DELETE /api/notifications/{notificationId}
   * @param {number} notificationId - Notification ID
   * @returns {Promise<any>}
   */
  deleteNotification: async (notificationId) => {
    try {
      console.log('[notificationService] Deleting notification:', notificationId);
      const response = await apiClient.delete(`/api/notifications/${notificationId}`);
      console.log('[notificationService] Delete response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to delete notification:', error);
      throw error;
    }
  },

  /**
   * Get unread count
   * GET /api/notifications/unread-count
   * @returns {Promise<any>}
   */
  getUnreadCount: async () => {
    try {
      console.log('[notificationService] Fetching unread count');
      const response = await apiClient.get('/api/notifications/unread-count');
      console.log('[notificationService] Unread count response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to get unread count:', error);
      throw error;
    }
  }
};

export default notificationService;
