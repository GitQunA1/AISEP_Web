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
  },

  /**
   * Submit startup info from CompleteStartupInfoForm (6 steps)
   * Maps form data to API format and creates project
   * @param {Object} formData - Data from CompleteStartupInfoForm
   * @returns {Promise<any>} Created project response
   */
  submitStartupInfo: async (formData) => {
    // Map stage to developmentStage enum: idea=0, mvp=1, customers=2, growth=3
    const stageMap = {
      'idea': 0,
      'mvp': 1,
      'customers': 2,
      'growth': 3
    };

    // Parse revenue from currentRevenue (e.g., "$5k/tháng" -> 5000)
    const parseRevenue = (revenueStr) => {
      if (!revenueStr) return 0;
      const match = revenueStr.match(/\d+/);
      return match ? parseInt(match[0]) * 1000 : 0; // Convert to base unit
    };

    // Parse market size (e.g., "$5B TAM" -> 5000000000)
    const parseMarketSize = (sizeStr) => {
      if (!sizeStr) return 0;
      const upper = sizeStr.toUpperCase();
      const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
      if (!match) return 0;
      
      const base = parseFloat(match[1]);
      if (upper.includes('B')) return base * 1000000000;
      if (upper.includes('M')) return base * 1000000;
      if (upper.includes('K')) return base * 1000;
      return base;
    };

    // Construct short description from solution + differentiator
    const shortDescription = `${formData.proposedSolution.substring(0, 100)}...` || 'New startup project';

    // Combine problem info into single targetCustomers field
    const targetCustomers = [
      formData.problemAffects,
      formData.stage === 'idea' ? `Potential: ${formData.idealCustomerBuyer}` : `Customers: ${formData.customerCount}`,
      formData.stage !== 'idea' ? `Revenue: ${formData.currentRevenue}` : `Price range: ${formData.willPayFor}`
    ].filter(v => v && v.trim()).join(' | ');

    // API payload matching Swagger format
    const payload = {
      projectName: formData.projectName.trim(),
      shortDescription: shortDescription.trim(),
      developmentStage: stageMap[formData.stage] || 0,
      problemStatement: formData.problemDescription.trim(),
      solutionDescription: formData.proposedSolution.trim(),
      targetCustomers: targetCustomers.trim(),
      uniqueValueProposition: formData.differentiator.trim(),
      marketSize: 0, // Backend should analyze this separately if needed
      businessModel: `${formData.revenueType}: ${formData.revenueMethod}. Pricing: ${formData.pricingStrategy}`.trim(),
      revenue: parseRevenue(formData.currentRevenue),
      competitors: '', // Not collected in new form
      teamMembers: formData.teamRoles.trim(),
      keySkills: '', // Could extract from teamRoles
      teamExperience: `${formData.teamSize} team members, ${formData.employmentType}`.trim()
    };

    const response = await apiClient.post('/api/Projects', payload);
    return response;
  }
};

export default projectSubmissionService;
