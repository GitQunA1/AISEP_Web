import React, { useState, useEffect } from 'react';
import styles from './NotificationCenter.module.css';
import notificationService from '../../services/notificationService';
import chatService from '../../services/chatService';

const NotificationCenter = ({ onOpenChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      // Safely handle paginated or object-based responses
      const items = Array.isArray(response) ? response : (response?.items || []);
      setNotifications(items);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    try {
      await notificationService.markAsRead(notification.notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notification.notificationId
            ? { ...n, isRead: true }
            : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }

    // Deep-link logic based on referenceType
    if (!notification.referenceId) {
      console.warn('Notification has no referenceId, cannot deep-link');
      return;
    }

    try {
      if (notification.referenceType === 'ChatSession') {
        // Direct: Open chat with this session ID
        onOpenChat?.(notification.referenceId, notification);
      } else if (notification.referenceType === 'ConnectionRequest') {
        // Indirect: Get session from connection request
        const session = await chatService.getChatSessionFromConnectionRequest(notification.referenceId);
        if (session && session.chatSessionId) {
          onOpenChat?.(session.chatSessionId, notification);
        } else {
          console.warn('Could not get session from connection request');
        }
      }
    } catch (error) {
      console.error('Error opening chat from notification:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
      const deletedNotif = notifications.find(n => n.notificationId === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'connection':
        return '🤝';
      case 'alert':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={styles.notificationCenter}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title={`${unreadCount} unread notifications`}
      >
        <span style={{ fontSize: '20px' }}>🔔</span>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.notificationPanel}>
          <div className={styles.panelHeader}>
            <h3>Notifications</h3>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <span style={{ fontSize: '32px' }}>📭</span>
              <p>No notifications</p>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {notifications.map(notification => (
                <div
                  key={notification.notificationId}
                  className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.message}>{notification.message}</div>
                    <div className={styles.timestamp}>{formatTime(notification.createdAt)}</div>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDeleteNotification(e, notification.notificationId)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <button
                onClick={handleClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
