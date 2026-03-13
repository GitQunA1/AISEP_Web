/**
 * ProjectStatus.js
 * Defines all valid project status states and utility functions
 * Implements BR-03: Project Status States
 */

// Define all valid project statuses
const PROJECT_STATUS = {
  DRAFT: 'Draft',
  IP_PROTECTED: 'IpProtected',
  PENDING: 'Pending',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected'
};

// Status transition rules
const VALID_TRANSITIONS = {
  [PROJECT_STATUS.DRAFT]: [
    PROJECT_STATUS.SUBMITTED,
    PROJECT_STATUS.REJECTED
  ],
  [PROJECT_STATUS.PENDING]: [
    PROJECT_STATUS.SUBMITTED
  ],
  [PROJECT_STATUS.IP_PROTECTED]: [
    PROJECT_STATUS.SUBMITTED
  ],
  [PROJECT_STATUS.SUBMITTED]: [
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.REJECTED
  ],
  [PROJECT_STATUS.APPROVED]: [
    PROJECT_STATUS.PUBLISHED
  ],
  [PROJECT_STATUS.PUBLISHED]: [],
  [PROJECT_STATUS.REJECTED]: [
    PROJECT_STATUS.SUBMITTED
  ]
};

// Status display labels - Simplified to 4 as requested
const STATUS_LABELS = {
  [PROJECT_STATUS.DRAFT]: 'Đang chờ duyệt',
  [PROJECT_STATUS.IP_PROTECTED]: 'Đang chờ duyệt',
  [PROJECT_STATUS.PENDING]: 'Đang chờ duyệt',
  [PROJECT_STATUS.SUBMITTED]: 'Đang chờ duyệt',
  [PROJECT_STATUS.APPROVED]: 'Đã duyệt',
  [PROJECT_STATUS.PUBLISHED]: 'Đã công khai',
  [PROJECT_STATUS.REJECTED]: 'Bị từ chối'
};

// Status colors for UI
const STATUS_COLORS = {
  [PROJECT_STATUS.DRAFT]: '#F59E0B',        // Amber (using Submitted's color)
  [PROJECT_STATUS.IP_PROTECTED]: '#F59E0B', // Amber
  [PROJECT_STATUS.PENDING]: '#F59E0B',      // Amber
  [PROJECT_STATUS.SUBMITTED]: '#F59E0B',    // Amber
  [PROJECT_STATUS.APPROVED]: '#10B981',     // Green
  [PROJECT_STATUS.PUBLISHED]: '#059669',    // Dark Green
  [PROJECT_STATUS.REJECTED]: '#EF4444'      // Red
};

// Which statuses allow editing (BR-04)
const EDITABLE_STATUSES = [
  PROJECT_STATUS.DRAFT,
  PROJECT_STATUS.REJECTED      // BR-18: Allow re-editing after rejection
];

// Which statuses can be edited by startup owner (vs system-only statuses)
const USER_EDITABLE_STATUSES = [
  PROJECT_STATUS.DRAFT,
  PROJECT_STATUS.REJECTED
];

// Status publish prerequisites (BR-19)
const PUBLISH_PREREQUISITES = {
  IP_PROTECTED: 'Documents must be protected on blockchain',
  AI_EVALUATED: 'AI evaluation must be completed',
  STAFF_APPROVED: 'Project must be approved by staff'
};

/**
 * Check if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - Is transition valid
 */
function isValidTransition(fromStatus, toStatus) {
  const validNextStatuses = VALID_TRANSITIONS[fromStatus];
  if (!validNextStatuses) return false;
  return validNextStatuses.includes(toStatus);
}

/**
 * Check if project can be edited in current status (BR-04)
 * @param {string} status - Project status
 * @returns {boolean} - Can be edited
 */
function isEditable(status) {
  return EDITABLE_STATUSES.includes(status);
}

/**
 * Check if project can be edited by user (not system-only) (BR-04)
 * @param {string} status - Project status
 * @returns {boolean} - User can edit
 */
function isUserEditable(status) {
  return USER_EDITABLE_STATUSES.includes(status);
}

/**
 * Check if project is published (BR-20, BR-22)
 * @param {string} status - Project status
 * @returns {boolean} - Is published
 */
function isPublished(status) {
  return status === PROJECT_STATUS.PUBLISHED;
}

/**
 * Check if project is visible to investors/advisors (BR-22)
 * @param {string} status - Project status
 * @returns {boolean} - Is visible
 */
function isVisibleToInvestors(status) {
  return status === PROJECT_STATUS.PUBLISHED;
}

/**
 * Check if project needs staff review (BR-15)
 * @param {string} status - Project status
 * @returns {boolean} - Needs review
 */
function needsStaffReview(status) {
  return status === PROJECT_STATUS.SUBMITTED;
}

/**
 * Check if project has IP protection (BR-09, BR-19)
 * @param {string} status - Project status
 * @returns {boolean} - Has IP protection
 */
function hasIPProtection(status) {
  return [
    PROJECT_STATUS.IP_PROTECTED,
    PROJECT_STATUS.SUBMITTED,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.PUBLISHED,
    PROJECT_STATUS.REJECTED
  ].includes(status);
}

/**
 * Check if project can be published (BR-19)
 * @param {string} status - Project status
 * @param {boolean} hasAIEvaluation - Has AI evaluation
 * @returns {boolean} - Can be published
 */
function canBePublished(status, hasAIEvaluation = true) {
  // Must be APPROVED status (which means: IP Protected + AI Evaluated + Staff Approved)
  return status === PROJECT_STATUS.APPROVED && hasAIEvaluation;
}

export {
  PROJECT_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  EDITABLE_STATUSES,
  USER_EDITABLE_STATUSES,
  PUBLISH_PREREQUISITES,
  VALID_TRANSITIONS,
  isValidTransition,
  isEditable,
  isUserEditable,
  isPublished,
  isVisibleToInvestors,
  needsStaffReview,
  hasIPProtection,
  canBePublished
};
