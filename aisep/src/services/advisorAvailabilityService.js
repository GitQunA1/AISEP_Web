import apiClient from './apiClient';

const BASE_URL = '/api/advisor-availabilities';

/**
 * Advisor Availability Service
 * Quản lý lịch rảnh của advisor.
 * Backend DTO: { AdvisorAvailabilityId, AdvisorId, SlotDate, StartTime, EndTime, Status }
 * Status: 0 = Available, 1 = Booked
 */
const advisorAvailabilityService = {
  /**
   * Lấy danh sách slot của advisor hiện tại (Advisor only)
   * GET /api/advisor-availabilities/me
   */
  getMyAvailabilities: async () => {
    const response = await apiClient.get(`${BASE_URL}/me`, {
      params: { pageSize: 200, sorts: 'SlotDate,StartTime' },
    });
    // apiClient interceptor unwraps ApiResponse<T> → response là data field
    // data có thể là array trực tiếp hoặc PagedResult với items
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  },

  /**
   * Tạo slot lịch rảnh mới (Advisor only)
   * POST /api/advisor-availabilities/me
   * @param {{ slotDate: string, startTime: string, endTime: string }} data
   *   slotDate: "YYYY-MM-DD", startTime: "HH:mm:ss", endTime: "HH:mm:ss"
   */
  createMyAvailability: async (data) => {
    const response = await apiClient.post(`${BASE_URL}/me`, {
      SlotDate: data.slotDate,
      StartTime: data.startTime,
      EndTime: data.endTime,
    });
    return response?.data ?? response;
  },

  /**
   * Cập nhật một slot (Advisor only)
   * PUT /api/advisor-availabilities/me/{availabilityId}
   * @param {number} availabilityId
   * @param {{ slotDate: string, startTime: string, endTime: string }} data
   */
  updateMyAvailability: async (availabilityId, data) => {
    const response = await apiClient.put(`${BASE_URL}/me/${availabilityId}`, {
      SlotDate: data.slotDate,
      StartTime: data.startTime,
      EndTime: data.endTime,
    });
    return response?.data ?? response;
  },

  /**
   * Xóa một slot (Advisor only - chỉ xóa được slot Available)
   * DELETE /api/advisor-availabilities/me/{availabilityId}
   * @param {number} availabilityId
   * @returns {boolean} true nếu xóa thành công
   */
  deleteMyAvailability: async (availabilityId) => {
    await apiClient.delete(`${BASE_URL}/me/${availabilityId}`);
    return true;
  },

  /**
   * Lấy danh sách slot của một advisor cụ thể (dùng cho booking)
   * GET /api/advisor-availabilities/advisor/{advisorId}
   * @param {number} advisorId
   * @returns {Promise<Array>} Chỉ lọc status === 0 (Available) ở client side
   */
  getByAdvisorId: async (advisorId) => {
    const response = await apiClient.get(`${BASE_URL}/advisor/${advisorId}`, {
      params: { pageSize: 200, sorts: 'SlotDate,StartTime' },
    });
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  },
};

export default advisorAvailabilityService;
