import { apiClient } from './apiClient';

/**
 * Review Service
 * 
 * CreateReviewRequest: { bookingId: number, rating: number, reviewContent?: string }
 * ReviewResponse: { id, bookingId, advisorName, reviewerId, reviewerName, rating, reviewContent, createdAt }
 */
const reviewService = {
    /**
     * Tạo đánh giá cho một booking đã hoàn thành
     * POST /api/Review
     * @param {{ bookingId: number, rating: number, reviewContent?: string }} data
     */
    createReview: async (data) => {
        const response = await apiClient.post('/api/Review', data);
        return response?.data ?? response;
    },

    /**
     * Lấy danh sách đánh giá của chính mình (vai trò người đánh giá)
     * GET /api/Review/my-reviews
     */
    getMyReviews: async (filters = '', sorts = '', page = 1, pageSize = 100) => {
        const params = new URLSearchParams();
        if (filters) params.append('filters', filters);
        if (sorts) params.append('sorts', sorts);
        params.append('page', page);
        params.append('pageSize', pageSize);

        const response = await apiClient.get(`/api/Review/my-reviews?${params.toString()}`);
        return response?.data ?? response;
    },

    /**
     * Lấy danh sách đánh giá của một advisor
     * GET /api/Review/advisor/{advisorId}
     */
    getReviewsByAdvisor: async (advisorId, filters = '', sorts = '', page = 1, pageSize = 50) => {
        const params = new URLSearchParams();
        if (filters) params.append('filters', filters);
        if (sorts) params.append('sorts', sorts);
        params.append('page', page);
        params.append('pageSize', pageSize);

        const response = await apiClient.get(`/api/Review/advisor/${advisorId}?${params.toString()}`);
        return response?.data ?? response;
    },

    /**
     * Lấy đánh giá chi tiết theo ID
     * GET /api/Review/{id}
     */
    getReviewById: async (id) => {
        const response = await apiClient.get(`/api/Review/${id}`);
        return response?.data ?? response;
    },

    /**
     * Xóa đánh giá của chính mình
     * DELETE /api/Review/{id}
     */
    deleteReview: async (id) => {
        const response = await apiClient.delete(`/api/Review/${id}`);
        return response?.data ?? response;
    }
};

export default reviewService;
