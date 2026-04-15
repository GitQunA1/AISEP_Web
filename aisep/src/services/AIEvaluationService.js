/**
 * AIEvaluationService.js
 * AI-powered evaluation of startup projects
 * Implements: BR-10, BR-11, BR-12, BR-13, BR-14
 */
import { apiClient } from './apiClient';

const requestCache = new Map();

class AIEvaluationService {
  /**
   * BR-10: Run AI evaluation after IP protection
   * Analyzes project metadata and documents
   * @param {object} project - Project object with data
   * @param {File[]} documents - Uploaded documents
   * @returns {Promise<object>} - AI evaluation result
   */
  static async evaluateProject(project, documents = []) {
    // BR-10: Can only run after blockchain protection
    if (!project.blockchainHash || !project.transactionHash) {
      return {
        success: false,
        error: 'Project must be IP protected before AI evaluation',
        evaluation: null
      };
    }

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // BR-11: Analyze project metadata
      const metadataAnalysis = this._analyzeMetadata(project);

      // BR-11: Analyze uploaded documents
      const documentAnalysis = await this._analyzeDocuments(documents);

      // BR-12: Generate AI evaluation results
      const evaluation = {
        id: this._generateEvaluationId(),
        projectId: project.id,
        evaluatedAt: new Date().toISOString(),
        
        // BR-12: Startup Score (0-100)
        startupScore: this._calculateScore(metadataAnalysis, documentAnalysis),
        
        // BR-12: Strengths
        strengths: this._identifyStrengths(metadataAnalysis, documentAnalysis),
        
        // BR-12: Weaknesses
        weaknesses: this._identifyWeaknesses(metadataAnalysis, documentAnalysis),
        
        // BR-12: Risk Indicators
        riskIndicators: this._identifyRisks(metadataAnalysis, documentAnalysis),
        
        // BR-13: Disclaimer that this is reference only
        disclaimer: 'This AI Score is for reference only and does not determine investment decisions.',
        
        // BR-14: Results are read-only
        isReadOnly: true,
        
        // Additional metadata
        analysisMetadata: {
          metadataScore: metadataAnalysis.overallScore,
          documentScore: documentAnalysis.overallScore,
          documentCount: documents.length,
          analysisVersion: '1.0'
        }
      };

      console.log('[AI EVALUATION] Analysis complete:', {
        projectId: project.id,
        score: evaluation.startupScore,
        strengthsCount: evaluation.strengths.length,
        weaknessesCount: evaluation.weaknesses.length,
        risksCount: evaluation.riskIndicators.length
      });

      return {
        success: true,
        error: null,
        evaluation
      };
    } catch (error) {
      console.error('[AI EVALUATION] Evaluation failed:', error);
      return {
        success: false,
        error: error.message,
        evaluation: null
      };
    }
  }

  /**
   * BR-11: Analyze project metadata
   * @param {object} project - Project object
   * @returns {object} - Metadata analysis
   */
  static _analyzeMetadata(project) {
    let score = 50; // Base score

    // Positive factors
    if (project.projectName && project.projectName.length > 3) score += 5;
    if (project.shortDescription && project.shortDescription.length >= 20) score += 5;
    if (project.solutionDescription && project.solutionDescription.length > 50) score += 8;
    if (project.stage && ['growth', 'early'].includes(project.stage.toLowerCase())) score += 10;
    if (project.category) score += 5;
    if (project.industry) score += 5;
    if (project.currentRevenue && project.currentRevenue !== '') score += 15;
    if (project.marketSize && project.marketSize !== '') score += 10;
    if (project.uniqueValueProposition && project.uniqueValueProposition.length > 20) score += 7;

    return {
      overallScore: Math.min(score, 100),
      hasProjectName: !!project.projectName,
      hasDescription: !!project.shortDescription,
      hasSolution: !!project.solutionDescription,
      stage: project.stage,
      hasRevenue: !!project.currentRevenue,
      hasMarketSize: !!project.marketSize,
      teamSize: project.teamMembers ? (project.teamMembers.match(/,/g) || []).length + 1 : 0
    };
  }

  /**
   * BR-11: Analyze uploaded documents
   * @param {File[]} documents - Document files
   * @returns {Promise<object>} - Document analysis
   */
  static async _analyzeDocuments(documents) {
    if (!documents || documents.length === 0) {
      return {
        overallScore: 30,
        documentCount: 0,
        hasPitchDeck: false,
        hasBusinessPlan: false,
        avgDocumentSize: 0,
        analysisDetail: 'No documents provided'
      };
    }

    let score = 50;
    let totalSize = 0;

    const documentTypes = documents.map(d => ({
      name: d.name,
      size: d.size,
      type: d.type
    }));

    // Document presence boosts score
    score += Math.min(documents.length * 15, 30);

    // Document size analysis (larger documents usually more detailed)
    totalSize = documentTypes.reduce((sum, doc) => sum + doc.size, 0);
    const avgSize = totalSize / documents.length;

    if (avgSize > 100 * 1024) score += 10; // > 100KB
    if (avgSize > 500 * 1024) score += 5;  // > 500KB

    // Document type analysis
    const hasBusinessPlan = documentTypes.some(d => d.name.toLowerCase().includes('business') || d.name.toLowerCase().includes('plan'));
    const hasPitchDeck = documentTypes.some(d => d.name.toLowerCase().includes('pitch') || d.name.toLowerCase().includes('deck'));
    const hasTechnical = documentTypes.some(d => d.name.toLowerCase().includes('technical') || d.name.toLowerCase().includes('architecture'));

    if (hasBusinessPlan) score += 15;
    if (hasPitchDeck) score += 15;
    if (hasTechnical) score += 10;

    return {
      overallScore: Math.min(score, 100),
      documentCount: documents.length,
      hasPitchDeck,
      hasBusinessPlan,
      hasTechnical,
      avgDocumentSize,
      totalSize,
      documentTypes
    };
  }

  /**
   * BR-12: Calculate startup score
   * @param {object} metadataAnalysis - Metadata analysis result
   * @param {object} documentAnalysis - Document analysis result
   * @returns {number} - Final score 0-100
   */
  static _calculateScore(metadataAnalysis, documentAnalysis) {
    // Weighted average: 60% metadata, 40% documents
    const score = (metadataAnalysis.overallScore * 0.6) + (documentAnalysis.overallScore * 0.4);
    return Math.round(score);
  }

  /**
   * BR-12: Identify project strengths
   * @param {object} metadataAnalysis
   * @param {object} documentAnalysis
   * @returns {array} - List of strengths
   */
  static _identifyStrengths(metadataAnalysis, documentAnalysis) {
    const strengths = [];

    if (metadataAnalysis.hasRevenue) {
      strengths.push('Existing revenue generation demonstrates market traction');
    }

    if (metadataAnalysis.hasMarketSize) {
      strengths.push('Clear market sizing and opportunity identification');
    }

    if (metadataAnalysis.stage && ['growth', 'early'].includes(metadataAnalysis.stage.toLowerCase())) {
      strengths.push(`Already at ${metadataAnalysis.stage} stage with established product-market fit indicators`);
    }

    if (metadataAnalysis.teamSize >= 3) {
      strengths.push(`Strong team with ${metadataAnalysis.teamSize} members`);
    } else if (metadataAnalysis.teamSize > 0) {
      strengths.push('Founding team identified');
    }

    if (documentAnalysis.hasPitchDeck && documentAnalysis.hasBusinessPlan) {
      strengths.push('Complete documentation with both pitch deck and business plan');
    }

    if (documentAnalysis.hasTechnical) {
      strengths.push('Technical architecture properly documented');
    }

    if (strengths.length === 0) {
      strengths.push('Project submitted with foundational information');
    }

    return strengths;
  }

  /**
   * BR-12: Identify project weaknesses
   * @param {object} metadataAnalysis
   * @param {object} documentAnalysis
   * @returns {array} - List of weaknesses
   */
  static _identifyWeaknesses(metadataAnalysis, documentAnalysis) {
    const weaknesses = [];

    if (!metadataAnalysis.hasRevenue) {
      weaknesses.push('No revenue yet - pre-revenue stage');
    }

    if (!metadataAnalysis.hasSolution) {
      weaknesses.push('Solution description needs more detail');
    }

    if (metadataAnalysis.stage && metadataAnalysis.stage.toLowerCase() === 'idea') {
      weaknesses.push('Still in idea phase - concept validation needed');
    }

    if (documentAnalysis.documentCount < 2) {
      weaknesses.push('Limited supporting documentation');
    }

    if (!documentAnalysis.hasBusinessPlan) {
      weaknesses.push('Business plan not provided');
    }

    if (!documentAnalysis.hasTechnical && metadataAnalysis.category?.includes('AI')) {
      weaknesses.push('Technical architecture not documented for AI/ML project');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('Project documentation is comprehensive');
    }

    return weaknesses;
  }

  /**
   * BR-12: Identify risk indicators
   * @param {object} metadataAnalysis
   * @param {object} documentAnalysis
   * @returns {array} - List of risk indicators
   */
  static _identifyRisks(metadataAnalysis, documentAnalysis) {
    const risks = [];

    if (metadataAnalysis.stage === 'idea') {
      risks.push({
        level: 'HIGH',
        description: 'Early stage - execution and market validation are primary risks'
      });
    }

    if (!metadataAnalysis.hasMarketSize) {
      risks.push({
        level: 'MEDIUM',
        description: 'Market size not clearly defined - market opportunity risk'
      });
    }

    if (metadataAnalysis.teamSize < 2) {
      risks.push({
        level: 'MEDIUM',
        description: 'Small founding team - key person dependency risk'
      });
    }

    if (documentAnalysis.documentCount === 0) {
      risks.push({
        level: 'HIGH',
        description: 'No supporting documentation - planning and execution risk'
      });
    }

    if (!metadataAnalysis.hasRevenue && metadataAnalysis.stage !== 'growth') {
      risks.push({
        level: 'MEDIUM',
        description: 'No proven revenue model yet'
      });
    }

    if (risks.length === 0) {
      risks.push({
        level: 'LOW',
        description: 'Risk profile appears well-managed'
      });
    }

    return risks;
  }

  /**
   * Helper: Generate unique evaluation ID
   * @returns {string}
   */
  static _generateEvaluationId() {
    return 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get evaluation display data
   * BR-13: Includes disclaimer about reference-only nature
   * @param {object} evaluation - Evaluation object
   * @returns {object} - Display-ready evaluation
   */
  static getEvaluationDisplay(evaluation) {
    if (!evaluation) {
      return null;
    }

    return {
      ...evaluation,
      scoreCategory: this._scoreToCategory(evaluation.startupScore),
      scoreDescription: this._scoreToDescription(evaluation.startupScore),
      disclaimer: evaluation.disclaimer // BR-13
    };
  }

  /**
   * Call API to analyze project and get AI score
   * POST /api/StartupAIAnalysis/{projectId}/analyze
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data: { score, strengths, weaknesses, risks, ... }, message }
   */
  static async analyzeProjectAPI(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      console.log('[AI ANALYSIS] API Call via apiClient:', projectId);
      const result = await apiClient.post(`/api/StartupAIAnalysis/${projectId}/analyze`);
      
      console.log('[AI ANALYSIS] Success - data received with score:', result.data?.potentialScore);
      
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'Analysis complete'
      };
    } catch (error) {
      console.error('[AI ANALYSIS] Error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Network error while analyzing project'
      };
    }
  }

  /**
   * Call API to evaluate project and get eligibility/score
   * POST /api/StartupAIAnalysis/{projectId}/evaluate
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data: { isEligibleStartup, score, ... }, message }
   */
  static async evaluateProjectAPI(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      console.log('[AI EVALUATE] API Call via apiClient:', projectId);
      const result = await apiClient.post(`/api/StartupAIAnalysis/${projectId}/analyze`, {});
      
      console.log('[AI EVALUATE] Success - result received:', result.data);
      
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'Evaluation complete'
      };
    } catch (error) {
      console.error('[AI EVALUATE] Error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Network error while evaluating project'
      };
    }
  }

  /**
   * Staff-specific API to analyze project
   * POST /api/AIEvaluation/eligibility-evaluate-staff
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data, message }
   */
  static async evaluateProjectByStaffAPI(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      console.log('[STAFF AI EVALUATE] API Call:', projectId);
      const result = await apiClient.post(`/api/StartupAIAnalysis/${projectId}/eligibility-evaluate-staff`);
      
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'Staff evaluation complete'
      };
    } catch (error) {
      console.error('[STAFF AI EVALUATE] Error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Lỗi trong quá trình phân tích (Nhân viên)'
      };
    }
  }

  /**
   * Helper: Convert score to category
   * @param {number} score
   * @returns {string}
   */
  static _scoreToCategory(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Helper: Convert score to description
   * @param {number} score
   * @returns {string}
   */
  static _scoreToDescription(score) {
    if (score >= 80) return 'Project shows strong potential with solid fundamentals';
    if (score >= 60) return 'Project has good foundation with some areas for improvement';
    if (score >= 40) return 'Project needs development in key areas';
    return 'Project requires significant refinement before investment consideration';
  }

  /**
   * Get previous AI analysis results for a project
   * GET /api/StartupAIAnalysis/{projectId}
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data: Array of results, message }
   */
  static async getProjectAnalysisHistory(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      const cacheKey = `history_${projectId}`;
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
      }

      console.log('[AI HISTORY] Fetching for project:', projectId);
      
      const fetchPromise = apiClient.get(`/api/StartupAIAnalysis/${projectId}`)
        .then(result => {
          // Normalize data to always be an array
          const rawData = result.data || result;
          const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
          
          return {
            success: true,
            data: normalizedData,
            message: result.message || 'History fetched successfully'
          };
        })
        .catch(error => {
          requestCache.delete(cacheKey);
          throw error;
        });

      requestCache.set(cacheKey, fetchPromise);
      
      // Clear cache after 10 seconds to allow fresh data retrieval later
      setTimeout(() => requestCache.delete(cacheKey), 10000);

      return await fetchPromise;
    } catch (error) {
      console.error('[AI HISTORY] Error:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error fetching history'
      };
    }
  }

  /**
   * Get staff-specific AI analysis history for a project
   * GET /api/AIEvaluation/eligibility-evaluate-staff/{projectId}
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data: Array of results, message }
   */
  static async getStaffAnalysisHistory(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      console.log('[STAFF AI HISTORY] Fetching for project:', projectId);
      
      const result = await apiClient.get(`/api/StartupAIAnalysis/${projectId}/eligibility-evaluate-staff`);
      const rawData = result.data || result;
      const normalizedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
      
      return {
        success: true,
        data: normalizedData,
        message: result.message || 'Staff history fetched successfully'
      };
    } catch (error) {
      console.error('[STAFF AI HISTORY] Error:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error fetching staff history'
      };
    }
  }

  /**
   * Investor-specific API to analyze project
   * POST /api/InvestorAIAnalysis/{projectId}/analyze
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data, message }
   */
  static async analyzeProjectByInvestorAPI(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      console.log('[INVESTOR AI ANALYSIS] API Call:', projectId);
      const result = await apiClient.post(`/api/InvestorAIAnalysis/${projectId}/analyze`);
      
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'Investor analysis complete'
      };
    } catch (error) {
      console.error('[INVESTOR AI ANALYSIS] Error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Lỗi trong quá trình phân tích (Nhà đầu tư)'
      };
    }
  }

  /**
   * Get investor-specific AI analysis history for a project
   * GET /api/InvestorAIAnalysis/{projectId}
   * @param {number} projectId - Project ID
   * @returns {Promise<object>} - { success, data: Array of results, message }
   */
  static async getInvestorAnalysisHistory(projectId) {
    try {
      if (!projectId && projectId !== 0) {
        return { success: false, message: 'Invalid projectId' };
      }

      console.log('[INVESTOR AI HISTORY] Fetching for project:', projectId);
      
      const result = await apiClient.get(`/api/InvestorAIAnalysis/${projectId}`);
      const rawData = result.data || result;
      // Backend returns a single object for investor analysis GET {projectId}, or null
      const normalizedData = rawData ? [rawData] : [];
      
      return {
        success: true,
        data: normalizedData,
        message: result.message || 'Investor history fetched successfully'
      };
    } catch (error) {
      console.error('[INVESTOR AI HISTORY] Error:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error fetching investor history'
      };
    }
  }

  /**
   * Get all investor-specific AI analysis history
   * GET /api/InvestorAIAnalysis
   * @param {object} params - Sieve filters/pagination
   * @returns {Promise<object>} - { success, data: PagedResult, message }
   */
  static async getAllInvestorAnalyses(params = {}) {
    try {
      console.log('[INVESTOR AI HISTORY ALL] Fetching with params:', params);
      
      const result = await apiClient.get('/api/InvestorAIAnalysis', { params });
      
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'Investor analysis list fetched successfully'
      };
    } catch (error) {
      console.error('[INVESTOR AI HISTORY ALL] Error:', error);
      return {
        success: false,
        data: { items: [], totalCount: 0 },
        message: error.message || 'Error fetching investor analysis list'
      };
    }
  }
}

export default AIEvaluationService;
