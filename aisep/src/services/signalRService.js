import * as signalR from '@microsoft/signalr';

// Get API URL from Vite environment
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper to determine correctly formatted Hub URL based on environment.
 * In development, we use relative paths to route through Vite proxy (handles WebSockets and CORS).
 * In production (Vercel), we use absolute URLs as the proxy no longer exists.
 * @param {string} path - Relative hub path (e.g., '/hubs/chat')
 * @returns {string} - The final URL to use
 */
const getHubUrl = (path) => {
  if (import.meta.env.DEV) {
    return path; // Use Vite proxy (must be configured in vite.config.js)
  }
  // Remove possible trailing slash from API_URL and ensure path starts with /
  const sanitizedBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
};

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
      .withUrl(getHubUrl('/hubs/notifications'), {
        accessTokenFactory: () => this.accessToken
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

    try {
      await this.notificationConnection.start();
      console.log('[SignalRService] NotificationHub connection started');
    } catch (err) {
      console.error('[SignalRService] NotificationHub start failed:', err);
    }
  }

  /**
   * Connect to ChatHub
   */
  async connectChatHub() {
    if (this.chatConnection && this.chatConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.chatConnection = new signalR.HubConnectionBuilder()
      .withUrl(getHubUrl('/hubs/chat'), {
        accessTokenFactory: () => this.accessToken
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
      this.chatStateChanged?.('Connected');
    });

    this.chatConnection.onreconnecting(() => {
      console.log('[SignalRService] ChatHub reconnecting...');
      this.chatStateChanged?.('Reconnecting');
    });

    this.chatConnection.onclose(() => {
      console.log('[SignalRService] ChatHub connection closed');
      this.chatStateChanged?.('Disconnected');
    });

    try {
      await this.chatConnection.start();
      console.log('[SignalRService] ChatHub connection started');
      this.chatStateChanged?.('Connected');
    } catch (err) {
      console.error('[SignalRService] ChatHub start failed:', err);
      this.chatStateChanged?.('Disconnected');
    }
  }

  /**
   * Register chat connection state changed callback
   */
  onChatStateChanged(callback) {
    this.chatStateChanged = callback;
    // Call immediately with current state
    if (this.chatConnection) {
      const stateMap = {
        [signalR.HubConnectionState.Connected]: 'Connected',
        [signalR.HubConnectionState.Connecting]: 'Reconnecting',
        [signalR.HubConnectionState.Reconnecting]: 'Reconnecting',
        [signalR.HubConnectionState.Disconnected]: 'Disconnected',
        [signalR.HubConnectionState.Disconnecting]: 'Disconnected'
      };
      callback(stateMap[this.chatConnection.state] || 'Disconnected');
    }
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
   * Wait for ChatHub to be connected
   */
  async waitForChatConnection(maxRetries = 20) {
    let retries = 0;
    while (retries < maxRetries) {
      if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
        return true;
      }
      console.log(`[SignalRService] Waiting for ChatHub connection... (attempt ${retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }
    return false;
  }

  /**
   * Send JOIN to specific chat room
   */
  async joinChatSession(sessionId) {
    const isConnected = await this.waitForChatConnection();
    if (isConnected) {
      try {
        // BACKEND SYNC: Method is 'JoinSession', not 'JoinChatSession'
        await this.chatConnection.invoke('JoinSession', sessionId);
        console.log('[SignalRService] Joined chat session:', sessionId);
      } catch (error) {
        console.error('[SignalRService] Failed to join chat session:', error);
      }
    } else {
      console.error('[SignalRService] Could not join session: ChatHub not connected after retries');
    }
  }

  /**
   * Send LEAVE from chat room
   */
  async leaveChatSession(sessionId) {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        // BACKEND SYNC: Method is 'LeaveSession', not 'LeaveChatSession'
        await this.chatConnection.invoke('LeaveSession', sessionId);
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
