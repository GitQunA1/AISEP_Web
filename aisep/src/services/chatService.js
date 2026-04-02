import apiClient from './apiClient';

/**
 * Chat Service - Handles chat messaging operations
 * Uses 3 main APIs:
 *   1. GET /api/connections/requests - Get connection requests with chatSessionId
 *   2. GET /api/ChatMessage?sessionId={sessionId} - Get all messages in a chat
 *   3. POST /api/ChatMessage - Send a new message
 */
const chatService = {
  /**
   * Get all chat messages for a session
   * GET /api/ChatMessage?sessionId={sessionId}
   * @param {number} sessionId - The chat session ID
   * @returns {Promise<any>}
   */
  getChatMessages: async (sessionId) => {
    try {
      console.log('[chatService] Fetching chat messages for sessionId:', sessionId);
      const response = await apiClient.get(`/api/ChatMessage?sessionId=${sessionId}`);
      console.log('[chatService] Chat messages response:', response);
      return response;
    } catch (error) {
      console.error('[chatService] Failed to get chat messages:', error);
      throw error;
    }
  },

  /**
   * Send a new chat message
   * POST /api/ChatMessage?sessionId={sessionId}
   * @param {number} sessionId - The chat session ID
   * @param {string} content - The message content
   * @returns {Promise<any>}
   */
  sendChatMessage: async (sessionId, content) => {
    try {
      console.log('[chatService] Sending chat message for sessionId:', sessionId);
      const response = await apiClient.post(`/api/ChatMessage?sessionId=${sessionId}`, {
        content
      });
      console.log('[chatService] Send message response:', response);
      return response;
    } catch (error) {
      console.error('[chatService] Failed to send chat message:', error);
      throw error;
    }
  }
};

export default chatService;
