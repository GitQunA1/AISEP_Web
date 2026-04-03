import * as signalR from '@microsoft/signalr';

// Get API URL from Vite environment
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * SignalR Service - Real-time communication with backend hubs
 * Handles NotificationHub (notifications) and ChatHub (chat messages)
 */

class SignalRService {
  constructor() {
    this.notificationConnection = null;
    this.chatConnection = null;
    this.accessToken = null;
  }

  /**
   * Initialize connections with JWT token
   * @param {string} token - JWT access token
   */
  async initialize(token) {
    if (!token) {
      console.error('[SignalRService] No token provided');
      return;
    }

    this.accessToken = token;

    try {
      // Connect to NotificationHub
      await this.connectNotificationHub();
      console.log('[SignalRService] NotificationHub connected');

      // Connect to ChatHub
      await this.connectChatHub();
      console.log('[SignalRService] ChatHub connected');
    } catch (error) {
      console.error('[SignalRService] Failed to initialize:', error);
    }
  }

  /**
   * Connect to NotificationHub
   */
  async connectNotificationHub() {
    if (this.notificationConnection && this.notificationConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/notificationHub?access_token=${this.accessToken}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .withHubProtocol(new signalR.JsonHubProtocol())
      .build();

    this.notificationConnection.on('notification_received', (notification) => {
      console.log('[SignalRService] Notification received:', notification);
      this.notificationReceived?.(notification);
    });

    this.notificationConnection.onreconnected(() => {
      console.log('[SignalRService] NotificationHub reconnected');
    });

    this.notificationConnection.onreconnecting(() => {
      console.log('[SignalRService] NotificationHub reconnecting...');
    });

    this.notificationConnection.on('disconnect', () => {
      console.log('[SignalRService] NotificationHub disconnected');
    });

    await this.notificationConnection.start();
  }

  /**
   * Connect to ChatHub
   */
  async connectChatHub() {
    if (this.chatConnection && this.chatConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.chatConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/chatHub?access_token=${this.accessToken}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .withHubProtocol(new signalR.JsonHubProtocol())
      .build();

    this.chatConnection.on('chat_message_received', (message) => {
      console.log('[SignalRService] Chat message received:', message);
      this.chatMessageReceived?.(message);
    });

    this.chatConnection.on('chat_session_closed', (sessionId) => {
      console.log('[SignalRService] Chat session closed:', sessionId);
      this.chatSessionClosed?.(sessionId);
    });

    this.chatConnection.onreconnected(() => {
      console.log('[SignalRService] ChatHub reconnected');
    });

    this.chatConnection.onreconnecting(() => {
      console.log('[SignalRService] ChatHub reconnecting...');
    });

    this.chatConnection.on('disconnect', () => {
      console.log('[SignalRService] ChatHub disconnected');
    });

    await this.chatConnection.start();
  }

  /**
   * Register notification received callback
   */
  onNotificationReceived(callback) {
    this.notificationReceived = callback;
  }

  /**
   * Register chat message received callback
   */
  onChatMessageReceived(callback) {
    this.chatMessageReceived = callback;
  }

  /**
   * Register chat session closed callback
   */
  onChatSessionClosed(callback) {
    this.chatSessionClosed = callback;
  }

  /**
   * Send JOIN to specific chat room
   */
  async joinChatSession(sessionId) {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.chatConnection.invoke('JoinChatSession', sessionId);
        console.log('[SignalRService] Joined chat session:', sessionId);
      } catch (error) {
        console.error('[SignalRService] Failed to join chat session:', error);
      }
    }
  }

  /**
   * Send LEAVE from chat room
   */
  async leaveChatSession(sessionId) {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.chatConnection.invoke('LeaveChatSession', sessionId);
        console.log('[SignalRService] Left chat session:', sessionId);
      } catch (error) {
        console.error('[SignalRService] Failed to leave chat session:', error);
      }
    }
  }

  /**
   * Disconnect all connections
   */
  async disconnect() {
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
    }
    if (this.chatConnection) {
      await this.chatConnection.stop();
    }
    console.log('[SignalRService] Disconnected');
  }

  /**
   * Get connection state
   */
  getNotificationConnectionState() {
    return this.notificationConnection?.state;
  }

  getChatConnectionState() {
    return this.chatConnection?.state;
  }
}

export default new SignalRService();
