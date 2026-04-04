import { apiClient } from './apiClient';

/**
 * Chat Service - Handles chat messaging and session operations
 *
 * APIs used:
 *   Connection-based chat (Investor/Startup connection flow):
 *     GET  /api/ChatMessage?sessionId={id}   — messages
 *     POST /api/ChatMessage?sessionId={id}   — send message
 *
 *   Booking-based chat (after booking Confirmed):
 *     POST  /api/ChatSession/{bookingId}       — open/get session
 *     GET   /api/ChatSession/{sessionId}       — get session + messages
 *     GET   /api/ChatSession                   — get my sessions
 *     PATCH /api/ChatSession/{sessionId}/close — close session
 *
 * ChatSessionResponse: { chatSessionId, bookingId?, connectionRequestId?, sessionType,
 *   isOpen, startTime, endTime?, advisorName, customerName, startupName, investorName, messages[] }
 */
const chatService = {
  /**
   * Get all chat messages for a session
   * GET /api/ChatMessage?sessionId={sessionId}
   */
  getChatMessages: async (sessionId) => {
    const response = await apiClient.get(`/api/ChatMessage?sessionId=${sessionId}`);
    return response;
  },

  /**
   * Send a new chat message
   * POST /api/ChatMessage?sessionId={sessionId}
   */
  sendChatMessage: async (sessionId, content) => {
    const response = await apiClient.post(`/api/ChatMessage?sessionId=${sessionId}`, { content });
    return response;
  },

  // ── Booking Chat Session ────────────────────────────────────────────────

  /**
   * Mở hoặc lấy chat session cho booking (Confirmed).
   * Idempotent: nếu session đã tồn tại, BE trả session cũ.
   * POST /api/ChatSession/{bookingId}
   * @param {number} bookingId
   * @returns {Promise<ChatSessionResponse>}
   */
  openBookingSession: async (bookingId) => {
    const response = await apiClient.post(`/api/ChatSession/${bookingId}`);
    return response?.data ?? response;
  },

  /**
   * Alias for openBookingSession used by the UI components.
   */
  createOrGetBookingChat: async (bookingId) => {
    return await chatService.openBookingSession(bookingId);
  },

  /**
   * Lấy thông tin session và messages.
   * GET /api/ChatSession/{sessionId}
   * @param {number} sessionId
   */
  getSession: async (sessionId) => {
    const response = await apiClient.get(`/api/ChatSession/${sessionId}`);
    return response?.data ?? response;
  },

  /**
   * Lấy tất cả chat sessions của user hiện tại.
   * GET /api/ChatSession
   */
  getMySessions: async () => {
    const response = await apiClient.get('/api/ChatSession');
    return response?.data ?? response ?? [];
  },

  /**
   * Đóng chat session (khi booking hoàn thành).
   * PATCH /api/ChatSession/{sessionId}/close
   * @param {number} sessionId
   */
  closeSession: async (sessionId) => {
    const response = await apiClient.patch(`/api/ChatSession/${sessionId}/close`);
    return response?.data ?? response;
  },
};

export default chatService;

