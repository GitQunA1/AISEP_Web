import apiClient from './apiClient';

/**
 * Project Submission Service
 * Handles project creation, document upload, and AI evaluation interactions.
 */
export const projectSubmissionService = {
  /**
   * Creates a new startup project
   * @param {Object} projectData 
   * @returns {Promise<any>} The newly created project ID inside response.data
   */
  createProject: async (projectData) => {
    const response = await apiClient.post('/api/Projects', projectData);
    return response;
  },

  /**
   * Update an existing draft project
   * @param {string|number} id - The project ID
   * @param {Object} projectData 
   * @returns {Promise<any>}
   */
  updateProject: async (id, projectData) => {
      const response = await apiClient.put(`/api/Projects/${id}`, projectData);
      return response;
  },

  /**
   * Uploads a document to a specific project
   * @param {string|number} projectId 
   * @param {File} file - The file to upload
   * @returns {Promise<any>}
   */
  uploadDocument: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Explicitly set multipart/form-data for this call
    const response = await apiClient.post(`/api/projects/${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * Trigger the Gemini AI analysis for a project
   * @param {string|number} projectId 
   * @returns {Promise<any>} Wait for analysis to complete
   */
  triggerAIAnalysis: async (projectId) => {
    const response = await apiClient.post(`/api/StartupAIAnalysis/${projectId}/analyze`);
    return response;
  },

  /**
   * Get the saved AI Analysis results
   * @param {string|number} projectId 
   * @returns {Promise<any>}
   */
  getAIAnalysisResults: async (projectId) => {
    const response = await apiClient.get(`/api/StartupAIAnalysis/${projectId}`);
    return response;
  },

  /**
   * Get My Projects (for the Startup Dashboard list validation)
   * @returns {Promise<any>}
   */
  getMyProjects: async () => {
    try {
      // Empty SieveModel query gets defaults
      const response = await apiClient.get('/api/Projects/my');
      return response;
    } catch (error) {
      if (error?.response?.status === 404) {
        return { isSuccess: true, data: [] };
      }
      throw error;
    }
  },

  /**
   * Get All Projects (for the public feed)
   * @returns {Promise<any>}
   */
  getAllProjects: async () => {
    const response = await apiClient.get('/api/Projects');
    return response;
  }
};

export default projectSubmissionService;
