import apiClient from './apiClient';

const API_URL = '/api/Booking';

const bookingService = {
  /**
   * Tạo booking mới
   * POST /api/Booking
   * @param {{ AdvisorId: number, ProjectId: number, AdvisorAvailabilitySlotIds: number[], SourceBookingId?: number, Note?: string }} data
   */
  createBooking: async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response;
  },

  /**
   * Lấy danh sách project để chọn khi booking (Investor thấy tất cả Approved, Startup thấy project của mình)
   * GET /api/Booking/project-options
   * @returns {Promise<Array<{ projectId: number, projectName: string }>>}
   */
  getProjectOptions: async () => {
    const response = await apiClient.get(`${API_URL}/project-options`);
    return response?.data ?? response ?? [];
  },

  /**
   * Lấy danh sách advisor được phân công cho project
   * GET /api/Booking/advisor-options?projectId={id}
   * @param {number} projectId
   * @returns {Promise<Array<{ advisorId: number, advisorName: string }>>}
   */
  getAdvisorOptions: async (projectId) => {
    const response = await apiClient.get(`${API_URL}/advisor-options`, {
      params: { projectId },
    });
    return response?.data ?? response ?? [];
  },

  /**
   * Lấy danh sách advisor thay thế cho booking đã bị reject hoặc NoResponse
   * GET /api/Booking/{id}/replacement-advisor-options
   * @param {number} bookingId
   * @returns {Promise<Array<{ advisorId: number, advisorName: string }>>}
   */
  getReplacementAdvisorOptions: async (bookingId) => {
    const response = await apiClient.get(`${API_URL}/${bookingId}/replacement-advisor-options`);
    return response?.data ?? response ?? [];
  },

  /**
   * Lấy tất cả bookings (có filter bằng Sieve)
   * GET /api/Booking
   */
  getAllBookings: async (filters = '', sorts = '', page = 1, pageSize = 50) => {
    const params = new URLSearchParams();
    if (filters) params.append('filters', filters);
    if (sorts) params.append('sorts', sorts);
    params.append('page', page);
    params.append('pageSize', pageSize);
    const response = await apiClient.get(`${API_URL}?${params.toString()}`);
    return response?.data ?? response;
  },

  /**
   * Lấy booking theo ID
   * GET /api/Booking/{id}
   */
  getBookingById: async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response?.data ?? response;
  },

  /**
   * Advisor chấp nhận booking → chuyển sang ApprovedAwaitingPayment
   * PATCH /api/Booking/{id}/approve
   * @param {number} id
   */
  approveBooking: async (id) => {
    const response = await apiClient.patch(`${API_URL}/${id}/approve`);
    return response?.data ?? response;
  },

  /**
   * Advisor từ chối booking → chuyển sang Cancel, giải phóng slot
   * PATCH /api/Booking/{id}/reject
   * @param {number} id
   * @param {string|null} reason
   */
  rejectBooking: async (id, reason = null) => {
    const response = await apiClient.patch(`${API_URL}/${id}/reject`, { reason });
    return response?.data ?? response;
  },

  /**
   * Xóa booking
   * DELETE /api/Booking/{id}
   */
  deleteBooking: async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response?.data ?? response;
  },
};

export default bookingService;
