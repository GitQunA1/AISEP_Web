import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import styles from './FloatingChatWidget.module.css';
import ChatWindow from './ChatWindow';

/**
 * FloatingChatWidget - Floating chat widget in bottom-right corner
 * Props:
 *   - chatSessionId: ID of chat session (enables chat)
 *   - displayName: Name to display in widget header
 *   - currentUserId: Current user ID for role detection (required)
 *   - sentTime: (optional) When request was sent
 *   - onClose: Callback when widget closes
 */
export default function FloatingChatWidget({ 
  chatSessionId,
  displayName = 'Chat',
  currentUserId,
  sentTime,
  onClose
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show if chatSessionId is provided
  if (!chatSessionId) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={handleToggle}
          title="Mở chat"
        >
          <MessageCircle size={24} />
          <span className={styles.badge}>💬</span>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <>
          {/* Chat Header Preview */}
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <div className={styles.headerTitle}>
                <MessageCircle size={18} style={{ color: '#667eea' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{displayName || 'Chat'}</span>
                </div>
              </div>
              <button
                className={styles.closeButton}
                onClick={handleCloseClick}
                title="Đóng chat"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.chatContent}>
              <ChatWindow
                chatSessionId={chatSessionId}
                displayName={displayName}
                currentUserId={currentUserId}
                sentTime={sentTime}
                onClose={handleClose}
              />
            </div>
          </div>

          {/* Backdrop */}
          <div className={styles.backdrop} onClick={handleCloseClick} />
        </>
      )}
    </>
  );
}
