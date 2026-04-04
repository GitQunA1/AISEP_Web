import React, { useState, useEffect } from 'react';
import { Bell, X, Trash2, Mail, Users, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import styles from './NotificationCenter.module.css';
import notificationService from '../../services/notificationService';
import chatService from '../../services/chatService';

const NotificationCenter = ({ onOpenChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  const togglePanel = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 250);
    } else {
      setIsOpen(true);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.notificationId);
        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }

    if (!notification.referenceId) return;

    try {
      if (notification.referenceType === 'ChatSession') {
        onOpenChat?.(notification.referenceId, notification);
        togglePanel();
      } else if (notification.referenceType === 'ConnectionRequest') {
        const session = await chatService.getChatSessionFromConnectionRequest(notification.referenceId);
        if (session && session.chatSessionId) {
          onOpenChat?.(session.chatSessionId, notification);
          togglePanel();
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
      const deletedNotif = notifications.find(n => n.notificationId === notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
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
    switch (type?.toLowerCase()) {
      case 'message':
        return <Mail size={18} style={{ color: '#0ea5e9' }} />;
      case 'connection':
        return <Users size={18} style={{ color: '#8b5cf6' }} />;
      case 'alert':
        return <AlertTriangle size={18} style={{ color: '#f59e0b' }} />;
      default:
        return <Info size={18} style={{ color: '#64748b' }} />;
    }
  };

  return (
    <div className={styles.notificationCenter}>
      <button
        className={styles.bellButton}
        onClick={togglePanel}
        title={`${unreadCount} thông báo chưa đọc`}
      >
        <Bell size={22} fill={unreadCount > 0 ? "currentColor" : "none"} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {(isOpen || isClosing) && (
        <div className={`${styles.notificationPanel} ${isClosing ? styles.closing : ''}`}>
          <div className={styles.panelHeader}>
            <h3>Thông báo</h3>
            <button className={styles.closeBtn} onClick={togglePanel}>
              <X size={18} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Mail size={48} opacity={0.2} />
              </div>
              <p>Không có thông báo nào</p>
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
                    title="Xóa thông báo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className={styles.clearAllContainer}>
              <button onClick={handleClearAll} className={styles.clearAllBtn}>
                <CheckCheck size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

