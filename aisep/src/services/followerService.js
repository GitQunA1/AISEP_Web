import { apiClient } from './apiClient';

/**
 * Follower Service - Handles project following/interest interactions
 */
const followerService = {
  /**
   * Follow a project (show interest)
   * POST /api/projects/{projectId}/follow
   * @param {number} projectId - The project ID
   * @returns {Promise<any>}
   */
  followProject: async (projectId) => {
    try {
      const response = await apiClient.post(`/api/projects/${projectId}/follow`);
      return response;
    } catch (error) {
      console.error('Failed to follow project:', error);
      throw error;
    }
  },

  /**
   * Unfollow a project
   * DELETE /api/projects/{projectId}/follow
   * @param {number} projectId - The project ID
   * @returns {Promise<any>}
   */
  unfollowProject: async (projectId) => {
    try {
      const response = await apiClient.delete(`/api/projects/${projectId}/follow`);
      return response;
    } catch (error) {
      console.error('Failed to unfollow project:', error);
      throw error;
    }
  },

  /**
   * Get all projects followed by current investor
   * GET /api/projects/my-followed - paginated list with full details
   * @returns {Promise<any>}
   */
  getMyFollowing: async () => {
    try {
      // Returns paginated response with items array
      const response = await apiClient.get('/api/projects/my-followed');
      return response;
    } catch (error) {
      console.error('Failed to get followed projects:', error);
      throw error;
    }
  },

  /**
   * Check if investor is following a project
   * Uses GET /api/projects/my-followed to get full list and check if projectId exists
   * @param {number} projectId - The project ID
   * @returns {Promise<any>}
   */
  checkFollowStatus: async (projectId) => {
    try {
      console.log(`[checkFollowStatus] Checking follow status for projectId: ${projectId}`);
      
      const response = await apiClient.get('/api/projects/my-followed');
      console.log('[checkFollowStatus] Response from my-followed:', response);
      
      // Handle paginated response structure
      let followedProjects = [];
      
      if (response && response.data) {
        // Response has data.items (paginated structure)
        if (response.data.items && Array.isArray(response.data.items)) {
          followedProjects = response.data.items;
        }
        // Or data is array directly
        else if (Array.isArray(response.data)) {
          followedProjects = response.data;
        }
      }
      // Or response is array directly
      else if (Array.isArray(response)) {
        followedProjects = response;
      }
      
      console.log('[checkFollowStatus] Followed projects array:', followedProjects);
      
      // Check if projectId is in the followed list
      // projectId might be stored as 'projectId' or 'id' field
      const isFollowing = followedProjects.some(p => {
        const pid = p.projectId || p.id;
        console.log(`[checkFollowStatus] Comparing projectId: ${pid} with ${projectId}`);
        return pid === projectId || pid == projectId;
      });
      
      console.log(`[checkFollowStatus] Is following: ${isFollowing}`);
      
      return {
        success: true,
        data: { isFollowing: isFollowing }
      };
    } catch (error) {
      console.error('[checkFollowStatus] Error checking follow status:', error);
      return { success: true, data: { isFollowing: false } };
    }
  }
};

export default followerService;
