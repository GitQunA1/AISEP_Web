import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import styles from './ChatWindow.module.css';
import chatService from '../../services/chatService';
import signalRService from '../../services/signalRService';

/**
 * ChatWindow Component - Display chat interface for startup-investor communication
 * Props:
 *   - chatSessionId: ID of chat session (required)
 *   - displayName: Name to display in header (required)
 *   - currentUserId: Current user ID for role detection (required)
 *   - sentTime: (optional) Time request was sent
 *   - onClose: Callback when closing chat
 */
export default function ChatWindow({ 
  chatSessionId,
  displayName = 'Chat',
  currentUserId,
  sentTime,
  onClose
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const signalRSubscribed = useRef(false);

  // Load messages on mount and setup SignalR listeners
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!chatSessionId) {
          console.error('[ChatWindow] No chatSessionId provided');
          setError('ID phiên chat không hợp lệ.');
          setIsLoading(false);
          return;
        }

        console.log('[ChatWindow] Loading messages for sessionId:', chatSessionId);
        const response = await chatService.getChatMessages(chatSessionId);
        console.log('[ChatWindow] Messages response:', response);
        
        let messagesList = [];
        if (Array.isArray(response?.data)) {
          messagesList = response.data;
        } else if (response?.data?.items && Array.isArray(response.data.items)) {
          messagesList = response.data.items;
        }
        
        console.log('[ChatWindow] Loaded', messagesList.length, 'messages, currentUserId:', currentUserId);
        
        // Transform messages: determine if current user sent them
        const transformedMessages = messagesList.map(msg => {
          const isSender = String(msg.senderId) === String(currentUserId);
          console.log('[ChatWindow] Message:', { 
            senderId: msg.senderId,
            senderId_type: typeof msg.senderId,
            currentUserId: currentUserId,
            currentUserId_type: typeof currentUserId,
            isSender,
            senderName: msg.senderName,
            content: msg.content
          });
          return {
            ...msg,
            id: msg.chatMessageId,
            text: msg.content,
            sender: isSender ? 'user' : 'other',
            timestamp: msg.sentAt
          };
        });
        
        setMessages(transformedMessages);
        setError(null);
      } catch (err) {
        console.error('[ChatWindow] Failed to load messages:', err);
        setError('Không thể tải tin nhắn. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    // Load messages initially
    loadMessages();

    // Setup SignalR event listeners for real-time messages
    if (!signalRSubscribed.current) {
      signalRSubscribed.current = true;

      // Subscribe to new chat messages
      signalRService.onChatMessageReceived((newMessage) => {
        console.log('[ChatWindow] Real-time message received:', newMessage);
        
        const isSender = String(newMessage.senderId) === String(currentUserId);
        
        // Transform message
        const transformedMessage = {
          ...newMessage,
          id: newMessage.chatMessageId,
          text: newMessage.content,
          sender: isSender ? 'user' : 'other',
          timestamp: newMessage.sentAt
        };

        // Add to messages list
        setMessages(prev => [...prev, transformedMessage]);
      });

      // Subscribe to session closed event
      signalRService.onChatSessionClosed((sessionId) => {
        if (sessionId === chatSessionId) {
          console.log('[ChatWindow] Chat session closed by server');
          setError('Cuộc hội thoại đã đóng.');
        }
      });

      // Join chat room
      signalRService.joinChatSession(chatSessionId);
    }

    // Cleanup
    return () => {
      // Leave chat room when unmounting
      signalRService.leaveChatSession(chatSessionId);
    };
  }, [chatSessionId, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatSessionId) return;

    setIsSending(true);
    try {
      const messageContent = inputMessage;
      setInputMessage('');
      
      console.log('[ChatWindow] Sending message to sessionId:', chatSessionId);
      const sendResponse = await chatService.sendChatMessage(chatSessionId, messageContent);
      console.log('[ChatWindow] Message sent response:', sendResponse);
      
      // Fetch updated messages list
      const messagesResponse = await chatService.getChatMessages(chatSessionId);
      console.log('[ChatWindow] Updated messages:', messagesResponse);
      
      let messagesList = [];
      if (Array.isArray(messagesResponse?.data)) {
        messagesList = messagesResponse.data;
      } else if (messagesResponse?.data?.items && Array.isArray(messagesResponse.data.items)) {
        messagesList = messagesResponse.data.items;
      }
      
      // Transform messages with role detection
      const transformedMessages = messagesList.map(msg => ({
        ...msg,
        id: msg.chatMessageId,
        text: msg.content,
        sender: String(msg.senderId) === String(currentUserId) ? 'user' : 'other',
        timestamp: msg.sentAt
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('[ChatWindow] Failed to send message:', error);
      setInputMessage(inputMessage);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseChat = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.header}>
          <div className={styles.title}>Đang tải cuộc chat...</div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.loadingContainer}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Khởi tạo phiên chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.header}>
          <div className={styles.title}>Lỗi</div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={onClose} style={{ marginTop: '16px' }}>
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.title}>
            {displayName || 'Chat'}
          </div>
          {sentTime && (
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
              Gửi: {sentTime}
            </div>
          )}
        </div>
        <button className={styles.closeBtn} onClick={handleCloseChat} title="Đóng">
          <X size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Bắt đầu cuộc hội thoại</p>
            <small>Nhắn tin đầu tiên của bạn</small>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`${styles.messageItem} ${msg.sender === 'user' ? styles.userMessage : styles.otherMessage}`}
              data-sender={msg.sender}
            >
              <div className={styles.msgContent}>
                <div className={styles.senderNameLabel}>
                  {msg.senderName}
                </div>
                <div className={styles.messageBubble}>
                  {msg.text || msg.message || msg.content}
                </div>
              </div>
              <div className={styles.messageTime}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.input}
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isSending}
          autoFocus
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!inputMessage.trim() || isSending}
          title="Gửi"
        >
          {isSending ? (
            <Loader2 size={18} className={styles.spinner} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}
