import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, ChevronDown } from 'lucide-react';
import styles from './ChatWindow.module.css';
import chatService from '../../services/chatService';
import signalRService from '../../services/signalRService';

/**
 * ChatWindow Component - Redesigned with X (Twitter) DM style
 */
export default function ChatWindow({
  chatSessionId,
  displayName = 'Chat',
  handle,
  currentUserId,
  sentTime,
  onClose
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isSessionOpen, setIsSessionOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const signalRSubscribed = useRef(false);

  // Load messages and setup SignalR
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!chatSessionId) {
          setError('ID phiên chat không hợp lệ.');
          setIsLoading(false);
          return;
        }

        const sessionData = await chatService.getSession(chatSessionId);
        setIsSessionOpen(sessionData.isOpen);

        const messagesList = Array.isArray(sessionData.messages) ? sessionData.messages : [];

        const transformedMessages = messagesList.map(msg => ({
          ...msg,
          id: msg.chatMessageId,
          text: msg.content,
          sender: String(msg.senderId) === String(currentUserId) ? 'user' : 'other',
          timestamp: msg.sentAt
        }));

        setMessages(transformedMessages);
        setError(null);
      } catch (err) {
        console.error('[ChatWindow] Load failed:', err);
        setError('Không thể tải tin nhắn. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    if (chatSessionId && currentUserId) {
      // Set up listeners
      signalRService.onChatMessageReceived((newMessage) => {
        // FILTER: Only process messages for this specific chat session
        if (String(newMessage.chatSessionId) !== String(chatSessionId)) {
          return;
        }

        const isSender = String(newMessage.senderId) === String(currentUserId);

        // Transform message
        const transformedMessage = {
          ...newMessage,
          id: newMessage.chatMessageId,
          text: newMessage.content,
          sender: isSender ? 'user' : 'other',
          timestamp: newMessage.sentAt
        };

        // Add to messages list, avoiding duplicates if already added optimistically
        setMessages(prev => {
          const exists = prev.some(m => m.id === transformedMessage.id);
          if (exists) return prev;
          // Also filter out any optimistic message with same text if it's very recent
          const withoutOptimistic = prev.filter(m => !(m.isOptimistic && m.text === transformedMessage.text));
          return [...withoutOptimistic, transformedMessage];
        });
      });

      signalRService.onChatSessionClosed((sessionId) => {
        if (String(sessionId) === String(chatSessionId)) setIsSessionOpen(false);
      });

      // Subscribe to SignalR connection state changes
      signalRService.onChatStateChanged((status) => {
        setConnectionStatus(status);
      });

      // Join the specific session room on server
      signalRService.joinChatSession(chatSessionId);
    }

    return () => {
      // Potentially clear listeners here if the service supported multiple, 
      // but for now we just leave the session
      signalRService.leaveChatSession(chatSessionId);
    };
  }, [chatSessionId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !chatSessionId || isSending) return;

    const content = inputMessage;
    const tempId = `temp-${Date.now()}`;

    // OPTIMISTIC UPDATE: Add message to UI immediately
    const optimisticMsg = {
      id: tempId,
      text: content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      await chatService.sendChatMessage(chatSessionId, content);
      // The real message will arrive via SignalR and replace the optimistic one
    } catch (error) {
      console.error('[ChatWindow] Send failed:', error);
      // Remove optimistic message on failure and restore input
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputMessage(content);
      setError('Không thể gửi tin nhắn.');
    } finally {
      setIsSending(true); // Keep sending state briefly to avoid double clicks
      setTimeout(() => setIsSending(false), 500);
    }
  };

  const handleCloseChat = (e) => {
    if (e) e.stopPropagation();
    if (onClose) onClose();
  };

  if (isLoading) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.loadingContainer}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Mở cuộc hội thoại...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.header}>
          <div className={styles.headerInfo}><div className={styles.title}>Thông báo</div></div>
          <button className={styles.closeBtn} onClick={handleCloseChat} title="Đóng">
            <X size={20} />
          </button>
        </div>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button className={styles.viewProfileBtn} onClick={handleCloseChat}>Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      {/* X Style Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.title}>{displayName}</div>
        </div>
        <div className={styles.headerActions}>
          <div
            className={`${styles.statusIndicator} ${styles[connectionStatus?.toLowerCase() || 'disconnected']}`}
            title={`Trạng thái: ${connectionStatus}`}
          />
          <button className={styles.closeBtn} onClick={handleCloseChat} title="Đóng">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {/* Welcome State (X style) */}
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeAvatar}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h3 className={styles.welcomeName}>{displayName}</h3>
        </div>

        {messages.map((msg, index) => {
          const showTime = index === messages.length - 1 ||
            messages[index + 1]?.sender !== msg.sender ||
            new Date(messages[index + 1]?.timestamp) - new Date(msg.timestamp) > 300000;

          return (
            <div
              key={msg.id || index}
              className={`${styles.messageItem} ${msg.sender === 'user' ? styles.userMessage : styles.otherMessage}`}
            >
              <div className={styles.messageBubble}>
                {msg.text || msg.message || msg.content}
              </div>
              {showTime && (
                <div className={styles.messageTime}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* X Style Input Footer */}
      <div className={styles.inputContainer}>
        {isSessionOpen ? (
          <>
            <form className={styles.inputWrapper} onSubmit={handleSendMessage}>
              <input
                type="text"
                className={styles.input}
                placeholder="Bắt đầu tin nhắn mới"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                autoFocus
              />
            </form>

            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              title="Gửi"
            >
              {isSending ? (
                <Loader2 size={20} className={styles.spinner} />
              ) : (
                <Send size={20} fill={inputMessage.trim() ? "currentColor" : "none"} />
              )}
            </button>
          </>
        ) : (
          <div className={styles.closedSessionBanner}>
            <span>Phiên tư vấn này đã kết thúc. Bạn chỉ có thể xem lại lịch sử tin nhắn.</span>
          </div>
        )}
      </div>
    </div>
  );
}
