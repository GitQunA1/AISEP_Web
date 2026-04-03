import { apiClient } from './apiClient';

/**
 * Payment Service
 * Handles booking payment flows via SePay QR.
 *
 * CheckoutResponse: { transactionId, amount, paymentCode, qrCodeUrl }
 * BookingPaymentStatusResponse: { bookingId, bookingStatus, isPaid, transactionId?, transactionStatus?, paymentCode?, amount }
 * TransactionStatusResponse: { transactionId, status, paymentCode, amount }
 */
const paymentService = {
  /**
   * Khởi tạo checkout cho booking → trả về QR code URL.
   * POST /api/payments/bookings/{bookingId}/checkout
   * Idempotent: nếu đã có transaction Pending chưa hết hạn, BE trả lại transaction cũ.
   * @param {number} bookingId
   * @returns {Promise<{ transactionId: number, amount: number, paymentCode: string, qrCodeUrl: string }>}
   */
  checkoutBooking: async (bookingId) => {
    const response = await apiClient.post(`/api/payments/bookings/${bookingId}/checkout`);
    return response?.data ?? response;
  },

  /**
   * Lấy trạng thái thanh toán của booking (dùng để poll).
   * GET /api/payments/bookings/{bookingId}/status
   * @param {number} bookingId
   * @returns {Promise<{ bookingId: number, bookingStatus: string, isPaid: boolean, transactionId?: number, transactionStatus?: string, paymentCode?: string, amount: number }>}
   */
  getBookingPaymentStatus: async (bookingId) => {
    const response = await apiClient.get(`/api/payments/bookings/${bookingId}/status`);
    return response?.data ?? response;
  },

  /**
   * Lấy trạng thái của một transaction cụ thể (poll sau khi redirect về).
   * GET /api/payments/{transactionId}/status
   * @param {number} transactionId
   * @returns {Promise<{ transactionId: number, status: string, paymentCode: string, amount: number }>}
   */
  getTransactionStatus: async (transactionId) => {
    const response = await apiClient.get(`/api/payments/${transactionId}/status`);
    return response?.data ?? response;
  },
};

export default paymentService;
