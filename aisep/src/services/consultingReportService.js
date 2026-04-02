import apiClient from './apiClient';

/**
 * Consulting Report Service
 *
 * ConsultingReportResponse: {
 *   consultingReportId, bookingId, meetingTitle, location?, meetingTime,
 *   meetingPurpose?, content?, decisionsMade?, status, revisionCount,
 *   revisionRequestReason?, lastSubmittedAt, startupReviewDueAt?,
 *   advisorRevisionDueAt?, startupReviewedAt?, isPayoutProcessed,
 *   advisorPayoutAmount?, payoutProcessedAt?, createdAt,
 *   advisorId, advisorName, customerId, customerName
 * }
 */
const consultingReportService = {
  /**
   * Nộp báo cáo tư vấn (Advisor only).
   * POST /api/ConsultingReport
   * @param {{ bookingId: number, meetingTitle: string, location?: string, meetingTime: string, meetingPurpose?: string, content?: string, decisionsMade?: string }} data
   */
  createReport: async (data) => {
    const response = await apiClient.post('/api/ConsultingReport', data);
    return response?.data ?? response;
  },

  /**
   * Lấy báo cáo theo booking ID.
   * GET /api/ConsultingReport/booking/{bookingId}
   * @param {number} bookingId
   */
  getReportByBookingId: async (bookingId) => {
    const response = await apiClient.get(`/api/ConsultingReport/booking/${bookingId}`);
    return response?.data ?? response;
  },

  /**
   * Startup/Investor chấp nhận báo cáo.
   * PATCH /api/ConsultingReport/{id}/startup-approve
   * @param {number} reportId
   */
  approveReport: async (reportId) => {
    const response = await apiClient.patch(`/api/ConsultingReport/${reportId}/startup-approve`);
    return response?.data ?? response;
  },

  /**
   * Startup/Investor yêu cầu sửa đổi báo cáo.
   * PATCH /api/ConsultingReport/{id}/startup-request-revision
   * @param {number} reportId
   * @param {string} reason
   */
  requestRevision: async (reportId, reason) => {
    const response = await apiClient.patch(`/api/ConsultingReport/${reportId}/startup-request-revision`, { reason });
    return response?.data ?? response;
  },
};

export default consultingReportService;
