import { apiClient } from './apiClient';

const API_URL = '/api/project-advisor-assignments';

const projectAssignmentService = {
  /**
   * Get assigned advisors for a project
   * GET /api/project-advisor-assignments/project/{projectId}
   * @param {number} projectId 
   * @returns {Promise<Array<{ projectId: number, projectName: string, advisorId: number, advisorName: string, assignedAt: string }>>}
   */
  getAssignedAdvisorsByProject: async (projectId) => {
    try {
      const response = await apiClient.get(`${API_URL}/project/${projectId}`);
      // API returns ApiResponse<List<ProjectAssignedAdvisorResponse>>
      // apiClient likely unwraps the response but we check for both cases
      return response?.data ?? response ?? [];
    } catch (error) {
      console.error(`[ProjectAssignmentService] Error fetching assigned advisors for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get assigned projects for the current advisor
   * GET /api/project-advisor-assignments/me/projects
   */
  getAssignedProjectsForMe: async (filters = '', sorts = '', page = 1, pageSize = 50) => {
    const params = new URLSearchParams();
    if (filters) params.append('filters', filters);
    if (sorts) params.append('sorts', sorts);
    params.append('page', page);
    params.append('pageSize', pageSize);
    
    try {
      const response = await apiClient.get(`${API_URL}/me/projects?${params.toString()}`);
      return response?.data ?? response;
    } catch (error) {
      console.error('[ProjectAssignmentService] Error fetching my assigned projects:', error);
      throw error;
    }
  }
};

export default projectAssignmentService;
