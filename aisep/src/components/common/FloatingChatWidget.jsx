import React, { useState, useEffect } from 'react';
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
  handle,
  currentUserId,
  sentTime,
  onClose
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Sync state: if a new sessionId is provided, make sure it's open
  useEffect(() => {
    if (chatSessionId) {
      setIsOpen(true);
      setIsClosing(false);
    }
  }, [chatSessionId]);

  // Only show if chatSessionId is provided
  if (!chatSessionId) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation (200ms matches CSS)
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (onClose) {
        onClose();
      }
    }, 200);
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  return (
    <>
      {/* Chat Widget is now shown outright when chatSessionId is present */}
      {isOpen && (
        <div className={`${styles.chatContainer} ${isClosing ? styles.closing : ''}`}>
          <ChatWindow
            chatSessionId={chatSessionId}
            displayName={displayName}
            handle={handle}
            currentUserId={currentUserId}
            sentTime={sentTime}
            onClose={handleClose}
          />
        </div>
      )}
    </>
  );
}
