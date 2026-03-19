/**
 * ProjectValidation.js
 * Validates project creation and updates against business rules
 * Implements: BR-01, BR-02, BR-04, BR-05, BR-06, BR-07
 */

import { PROJECT_STATUS, isEditable, hasIPProtection } from '../constants/ProjectStatus.js';

class ProjectValidationService {
  /**
   * BR-02: Check if user has verified email
   * @param {object} user - User object
   * @returns {object} - { isValid: boolean, message: string }
   */
  static checkEmailVerification(user) {
    if (!user.emailVerified) {
      return {
        isValid: false,
        message: 'Please verify your email address before creating a project. Check your inbox for the verification link.'
      };
    }
    return { isValid: true, message: '' };
  }

  /**
   * BR-01: Check if user can create a new project
   * Validates: Only 1 project per account, 6 month replacement rule
   * @param {array} userProjects - Array of user's existing projects
   * @returns {object} - { canCreate: boolean, message: string, daysUntilEligible: number }
   */
  static checkProjectCreationEligibility(userProjects) {
    const activeProject = userProjects.find(p => p.status !== PROJECT_STATUS.REJECTED);

    if (!activeProject) {
      return {
        canCreate: true,
        message: '',
        daysUntilEligible: 0
      };
    }

    // User has an active project - check 6 month rule
    const projectCreatedDate = new Date(activeProject.createdAt);
    const sixMonthsLater = new Date(projectCreatedDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    const today = new Date();
    if (today >= sixMonthsLater) {
      // 6 months passed, can create new project
      return {
        canCreate: true,
        message: '',
        daysUntilEligible: 0
      };
    }

    const daysRemaining = Math.ceil((sixMonthsLater - today) / (1000 * 60 * 60 * 24));
    return {
      canCreate: false,
      message: `You already have an active project. You can create a new one in ${daysRemaining} days (${sixMonthsLater.toLocaleDateString()}).`,
      daysUntilEligible: daysRemaining
    };
  }

  /**
   * BR-05, BR-06: Validate required fields for project creation
   * Required fields: projectName, category, stage, shortDescription
   * @param {object} formData - Form data object
   * @returns {object} - { isValid: boolean, errors: object }
   */
  static validateRequiredFields(formData) {
    const errors = {};
    const stage = (formData.stage || formData.developmentStage || '').toString().toLowerCase();

    // 1. Basic Info (Always required)
    if (!formData.projectName || !formData.projectName.trim()) {
      errors.projectName = 'Tên dự án là bắt buộc';
    }

    if (!formData.shortDescription || !formData.shortDescription.trim()) {
      errors.shortDescription = 'Mô tả ngắn là bắt buộc';
    }

    if (!stage) {
      errors.stage = 'Vui lòng chọn giai đoạn phát triển';
    }

    // 2. Step 2 Fields (Conditional)
    if (!formData.problemStatement && !formData.problemDescription) {
      errors.problemStatement = 'Vấn đề cần giải quyết là bắt buộc';
    }

    if (!formData.solutionDescription && !formData.proposedSolution) {
      errors.solutionDescription = 'Mô tả giải pháp là bắt buộc';
    }

    if (!formData.targetCustomers && !formData.idealCustomerBuyer) {
      errors.targetCustomers = 'Khách hàng mục tiêu là bắt buộc';
    }

    // MVP & Growth Requirements
    if (stage === '1' || stage === 'mvp' || stage === '2' || stage === 'growth') {
      if (!formData.uniqueValueProposition && !formData.differentiator) {
        errors.uniqueValueProposition = 'Giá trị độc đáo (UVP) là bắt buộc';
      }
      if (!formData.businessModel && !formData.revenueMethod) {
        errors.businessModel = 'Mô hình kinh doanh là bắt buộc';
      }
      if (!formData.keySkills) {
        errors.keySkills = 'Kỹ năng cốt lõi là bắt buộc';
      }
      if (!formData.competitors) {
        errors.competitors = 'Đối thủ cạnh tranh là bắt buộc';
      }
      if (!formData.documents || formData.documents.length === 0) {
        errors.documents = 'Tài liệu (Pitch Deck/Demo) là bắt buộc';
      }
    }

    // Growth Specific Requirements
    if (stage === '2' || stage === 'growth') {
      if (!formData.revenue || parseInt(formData.revenue) <= 0) {
        errors.revenue = 'Doanh thu phải lớn hơn 0 cho giai đoạn Tăng trưởng';
      }
      if (!formData.marketSize || parseInt(formData.marketSize) <= 0) {
        errors.marketSize = 'Quy mô thị trường phải lớn hơn 0 cho giai đoạn Tăng trưởng';
      }
      if (!formData.teamExperience) {
        errors.teamExperience = 'Kinh nghiệm đội ngũ là bắt buộc';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * BR-07: Validate file formats and sizes
   * Accepted formats: PDF, DOCX, XLSX, PPT
   * Max size: 10MB per file
   * @param {File} file - File object
   * @returns {object} - { isValid: boolean, error: string }
   */
  static validateFileFormat(file) {
    if (!file) {
      return { isValid: false, error: 'File is required' };
    }

    const allowedFormats = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',        // .xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/msword',                                                        // .doc
      'application/vnd.ms-excel'                                                   // .xls
    ];

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file format
    if (!allowedFormats.includes(file.type)) {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toUpperCase();
      return {
        isValid: false,
        error: `File format .${fileExtension} is not supported. Please use: PDF, DOCX, XLSX, or PPTX`
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * BR-04: Check if project can be edited based on status
   * @param {string} status - Project status
   * @param {string} userRole - User role (startup, advisor, etc)
   * @returns {object} - { canEdit: boolean, reason: string }
   */
  static checkEditPermission(status, userRole = 'startup') {
    if (userRole !== 'startup') {
      return {
        canEdit: false,
        reason: 'Only startup owners can edit projects'
      };
    }

    if (status === PROJECT_STATUS.PUBLISHED) {
      return {
        canEdit: false,
        reason: 'Published projects cannot be edited. You can only update tags and visibility settings.'
      };
    }

    if (status === PROJECT_STATUS.SUBMITTED) {
      return {
        canEdit: false,
        reason: 'Project is under staff review. You cannot edit until review is complete.'
      };
    }

    if (status === PROJECT_STATUS.APPROVED && !hasIPProtection(status)) {
      return {
        canEdit: false,
        reason: 'Project is in review. You cannot edit until IP protection is confirmed.'
      };
    }

    if (isEditable(status)) {
      return {
        canEdit: true,
        reason: ''
      };
    }

    return {
      canEdit: false,
      reason: `Project cannot be edited in ${status} status`
    };
  }

  /**
   * BR-09, BR-19: Check if project has IP protection before publish
   * @param {object} project - Project object
   * @returns {object} - { hasIPProtection: boolean, message: string }
   */
  static checkIPProtectionStatus(project) {
    const hasIPProtection = project.blockchainHash && project.ipProtectionDate;

    if (!hasIPProtection) {
      return {
        hasIPProtection: false,
        message: 'Project must be protected on blockchain before publishing. Please upload documents and protect them.'
      };
    }

    return {
      hasIPProtection: true,
      message: ''
    };
  }

  /**
   * Helper: Simple email validation
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper: Check if documents are uploaded
   * @param {array} documents - Array of document objects
   * @returns {boolean}
   */
  static hasDocuments(documents) {
    return documents && documents.length > 0;
  }

  /**
   * Helper: Get publication checklist status (BR-19)
   * @param {object} project - Project object
   * @returns {object} - { canPublish: boolean, checklist: object }
   */
  static getPublicationChecklist(project) {
    const checklist = {
      ipProtected: {
        complete: !!project.blockchainHash && !!project.ipProtectionDate,
        label: 'IP Protected',
        message: 'Documents protected on blockchain'
      },
      aiEvaluated: {
        complete: !!project.aiEvaluation,
        label: 'AI Evaluated',
        message: 'AI analysis completed'
      },
      staffApproved: {
        complete: project.status === PROJECT_STATUS.APPROVED,
        label: 'Staff Approved',
        message: 'Approved by operation staff'
      }
    };

    const canPublish = Object.values(checklist).every(item => item.complete);

    return {
      canPublish,
      checklist,
      remainingItems: Object.entries(checklist)
        .filter(([_, item]) => !item.complete)
        .map(([_, item]) => item.label)
    };
  }
}

export default ProjectValidationService;
