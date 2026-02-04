/**
 * ProjectStatus.js
 * Defines all valid project status states and utility functions
 * Implements BR-03: Project Status States
 */

// Define all valid project statuses
const PROJECT_STATUS = {
  DRAFT: 'DRAFT',                          // BR-03: Unpublished projects
  IP_PROTECTED: 'IP_PROTECTED',            // BR-08: Blockchain hash confirmed
  SUBMITTED: 'SUBMITTED',                  // BR-19: Sent for staff review
  APPROVED: 'APPROVED',                    // BR-17: Staff approved
  PUBLISHED: 'PUBLISHED',                  // BR-19: Live on platform
  REJECTED: 'REJECTED'                     // BR-17: Staff rejected
};

// Status transition rules
const VALID_TRANSITIONS = {
  [PROJECT_STATUS.DRAFT]: [
    PROJECT_STATUS.IP_PROTECTED,
    PROJECT_STATUS.REJECTED
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
  [PROJECT_STATUS.PUBLISHED]: [],          // BR-20: No status change for published
  [PROJECT_STATUS.REJECTED]: [
    PROJECT_STATUS.DRAFT                   // BR-18: Allow re-editing
  ]
};

// Status display labels
const STATUS_LABELS = {
  [PROJECT_STATUS.DRAFT]: 'Draft',
  [PROJECT_STATUS.IP_PROTECTED]: 'IP Protected',
  [PROJECT_STATUS.SUBMITTED]: 'Under Review',
  [PROJECT_STATUS.APPROVED]: 'Approved',
  [PROJECT_STATUS.PUBLISHED]: 'Published',
  [PROJECT_STATUS.REJECTED]: 'Rejected'
};

// Status colors for UI
const STATUS_COLORS = {
  [PROJECT_STATUS.DRAFT]: '#6B7280',        // Gray
  [PROJECT_STATUS.IP_PROTECTED]: '#3B82F6', // Blue
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
