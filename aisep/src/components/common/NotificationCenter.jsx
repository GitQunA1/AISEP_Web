import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Trash2, Mail, Users, AlertTriangle, Info, CheckCheck, Briefcase, MessageCircle, Loader2 } from 'lucide-react';
import styles from './NotificationCenter.module.css';
import notificationService from '../../services/notificationService';
import chatService from '../../services/chatService';
import signalRService from '../../services/signalRService';

const NotificationCenter = ({ onOpenChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [errorIds, setErrorIds] = useState(new Set());
  const signalRSubscribed = useRef(false);

  // Load notifications on mount and setup SignalR
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Subscribe to real-time notifications via SignalR
    if (!signalRSubscribed.current) {
      signalRSubscribed.current = true;
      signalRService.onNotificationReceived((newNotification) => {
        console.log('[NotificationCenter] Real-time notification received:', newNotification);
        // Add new notification to the top of the list
        setNotifications(prev => [newNotification, ...prev]);
        // Increment unread count
        if (!newNotification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      });
    }
    
    return () => {
      // Clean up SignalR subscription
      signalRSubscribed.current = false;
    };
  }, []);

  // Safety net: if unread-count endpoint returns a wrong shape,
  // derive count from loaded notifications so badge still shows.
  useEffect(() => {
    const derivedUnread = Array.isArray(notifications)
      ? notifications.filter(n => !n?.isRead).length
      : 0;
    if (derivedUnread > 0 && unreadCount === 0) {
      setUnreadCount(derivedUnread);
    }
  }, [notifications, unreadCount]);

  const loadNotifications = async () => {
    try {
      // Fetch more notifications (100) to ensure historical data is visible
      const response = await notificationService.getNotifications({ pageSize: 100 });
      
      // Unwrap the ApiResponse structure: response.data is the PagedResult, response.data.items is the list
      const items = response?.data?.items || (Array.isArray(response) ? response : []);
      setNotifications(items);
      // Also derive unread count from the returned items (fallback).
      if (Array.isArray(items)) {
        const derivedUnread = items.filter(n => !n?.isRead).length;
        setUnreadCount(prev => Math.max(prev || 0, derivedUnread));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      // Extract unread count from multiple possible ApiResponse shapes
      const raw =
        (typeof response?.data === 'number' ? response.data : undefined) ??
        (typeof response?.data?.unreadCount === 'number' ? response.data.unreadCount : undefined) ??
        (typeof response?.data?.count === 'number' ? response.data.count : undefined) ??
        (typeof response?.unreadCount === 'number' ? response.unreadCount : undefined);

      const count = Number.isFinite(Number(raw)) ? Number(raw) : 0;
      setUnreadCount(prev => Math.max(prev || 0, count));
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
      // Refresh counts when opening (keeps badge accurate).
      loadNotifications();
      loadUnreadCount();
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
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.notificationId);
        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, (prev || 0) - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }

    if (!notification.referenceId) return;

    try {
      // Handle different notification types
      if (notification.referenceType === 'ChatSession') {
        console.log('[NotificationCenter] Opening chat session:', notification.referenceId);
        onOpenChat?.(notification.referenceId, notification);
        togglePanel();
      } else if (notification.referenceType === 'ConnectionRequest') {
        console.log('[NotificationCenter] Opening connection request chat');
        const session = await chatService.getChatSessionFromConnectionRequest(notification.referenceId);
        if (session && session.chatSessionId) {
          onOpenChat?.(session.chatSessionId, notification);
          togglePanel();
        }
      } else if (notification.referenceType === 'Deal') {
        console.log('[NotificationCenter] Navigating to deal:', notification.referenceId);
        // Navigate to appropriate dashboard section
        const userRole = localStorage.getItem('userRole');
        let dashboardUrl = '/dashboard';
        if (userRole === 'Investor') {
          dashboardUrl = '/investor-dashboard';
        } else if (userRole === 'Startup') {
          dashboardUrl = '/startup-dashboard';
        }
        window.location.href = dashboardUrl;
        togglePanel();
      } else if (notification.referenceType === 'Project') {
        console.log('[NotificationCenter] Navigating to project:', notification.referenceId);
        window.location.href = `/project/${notification.referenceId}`;
        togglePanel();
      }
    } catch (error) {
      console.error('[NotificationCenter] Error handling notification click:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    
    // Reset error state for this ID if it exists
    setErrorIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });

    // Add to loading set
    setLoadingIds(prev => new Set(prev).add(notificationId));
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Successfully deleted, start exit animation
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      setDeletingIds(prev => new Set(prev).add(notificationId));
      
      // Wait for animation to finish before removing from state
      setTimeout(() => {
        const deletedNotif = notifications.find(n => n.notificationId === notificationId);
        setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
        
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, (prev || 0) - 1));
        }
      }, 300);
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Remove loading state and add error state
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      setErrorIds(prev => new Set(prev).add(notificationId));
      
      // Clear error state after 3 seconds
      setTimeout(() => {
        setErrorIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 3000);
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

  const getNotificationIcon = (notification) => {
    const { type, referenceType, title } = notification;
    const iconSize = 18;
    
    // Check both type and referenceType for more accurate icon selection
    const iconType = type?.toLowerCase() || referenceType?.toLowerCase() || '';
    
    if (iconType.includes('deal') || referenceType === 'Deal') {
      return <Briefcase size={iconSize} style={{ color: '#0ea5e9' }} />;
    }
    if (iconType.includes('chat') || referenceType === 'ChatSession') {
      return <MessageCircle size={iconSize} style={{ color: '#06b6d4' }} />;
    }
    if (iconType.includes('connection') || referenceType === 'ConnectionRequest') {
      return <Users size={iconSize} style={{ color: '#8b5cf6' }} />;
    }
    if (iconType.includes('contract') || title?.includes('Contract')) {
      return <Mail size={iconSize} style={{ color: '#10b981' }} />;
    }
    if (iconType.includes('investment') || title?.includes('invest')) {
      return <Briefcase size={iconSize} style={{ color: '#6366f1' }} />;
    }
    if (iconType.includes('message')) {
      return <Mail size={iconSize} style={{ color: '#0ea5e9' }} />;
    }
    if (iconType.includes('alert') || iconType.includes('warning')) {
      return <AlertTriangle size={iconSize} style={{ color: '#f59e0b' }} />;
    }
    
    return <Info size={iconSize} style={{ color: '#64748b' }} />;
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
                  className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread} ${deletingIds.has(notification.notificationId) ? styles.deleting : ''}`}
                  onClick={() => !deletingIds.has(notification.notificationId) && handleNotificationClick(notification)}
                >
                  <div className={styles.notificationIcon}>
                    {getNotificationIcon(notification)}
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.message}>{notification.message}</div>
                    <div className={styles.timestamp}>{formatTime(notification.createdAt)}</div>
                  </div>
                  <button
                    className={`${styles.deleteBtn} ${loadingIds.has(notification.notificationId) ? styles.loading : ''} ${errorIds.has(notification.notificationId) ? styles.error : ''}`}
                    onClick={(e) => !loadingIds.has(notification.notificationId) && handleDeleteNotification(e, notification.notificationId)}
                    title={errorIds.has(notification.notificationId) ? "Lỗi khi xóa" : "Xóa thông báo"}
                    disabled={loadingIds.has(notification.notificationId)}
                  >
                    {loadingIds.has(notification.notificationId) ? (
                      <Loader2 size={14} className={styles.spinner} />
                    ) : errorIds.has(notification.notificationId) ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <Trash2 size={14} />
                    )}
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

