import { apiClient } from './apiClient';

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
   * PUT /api/notifications/{notificationId}/read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<any>}
   */
  markAsRead: async (notificationId) => {
    try {
      console.log('[notificationService] Marking as read:', notificationId);
      const response = await apiClient.put(`/api/notifications/${notificationId}/read`);
      console.log('[notificationService] Mark as read response:', response);
      return response;
    } catch (error) {
      console.error('[notificationService] Failed to mark as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   * @returns {Promise<any>}
   */
  markAllAsRead: async () => {
    try {
      console.log('[notificationService] Marking all as read');
      const response = await apiClient.put('/api/notifications/read-all');
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
  },

  /**
   * Get notification type icon and color
   */
  getNotificationStyle(type) {
    const styles = {
      Deal: { icon: '📋', color: '#0ea5e9', bgColor: '#e0f2fe' },
      ConnectionRequest: { icon: '💬', color: '#8b5cf6', bgColor: '#f3e8ff' },
      ChatSession: { icon: '💭', color: '#06b6d4', bgColor: '#cffafe' },
      Contract: { icon: '✍️', color: '#10b981', bgColor: '#d1fae5' },
      Project: { icon: '🚀', color: '#f59e0b', bgColor: '#fef3c7' },
      Investment: { icon: '💼', color: '#6366f1', bgColor: '#e0e7ff' },
    };
    return styles[type] || { icon: '🔔', color: '#64748b', bgColor: '#f1f5f9' };
  },

  /**
   * Get action URL based on notification type and reference
   */
  getNotificationActionUrl(notification) {
    const { type, referenceType, referenceId } = notification;
    
    if (referenceType === 'Deal') {
      return `/dashboard/investments`; // Navigate to investments/deals view
    }
    if (referenceType === 'ChatSession') {
      return `/messages`; // Open messages/chat
    }
    if (referenceType === 'ConnectionRequest') {
      return `/dashboard/connections`; // View connection requests
    }
    if (referenceType === 'Project') {
      return `/project/${referenceId}`; // View specific project
    }
    
    return null;
  },

  /**
   * Determine if notification needs action
   */
  isActionableNotification(notification) {
    return notification.referenceType && notification.referenceId;
  }
};

export default notificationService;
