# Business Rules Analysis Report

## Summary
This document analyzes the AISEP application against the comprehensive business rules provided and identifies missing features, incorrect implementations, and gaps that need to be fixed.

---

## I. Project Initialization & Management (BR-01 to BR-05)

### BR-01: One Project Per Account - 6 Month Rule
**Status:** ❌ NOT IMPLEMENTED
**Current State:** No validation for number of projects per startup account
**Required Implementation:**
- Track project creation date
- Prevent multiple active projects
- Enforce 6-month waiting period before replacement
- Add validation in CompleteStartupInfoForm

**Files to Modify:**
- `src/components/startup/CompleteStartupInfoForm.jsx` - Add project count validation
- `src/pages/StartupDashboard.jsx` - Implement project replacement logic
- Create: `src/services/ProjectValidation.js`

### BR-02: Email Verification Required
**Status:** ❌ NOT IMPLEMENTED
**Current State:** Form accepts project creation without email verification
**Required Implementation:**
- Check email_verified flag before allowing project creation
- Show warning if email not verified
- Require email verification link
- Block project form if email not verified

**Files to Modify:**
- `src/components/startup/CompleteStartupInfoForm.jsx` - Add email verification check
- `src/pages/StartupDashboard.jsx` - Block form access

### BR-03: Project Status States
**Status:** ❌ INCOMPLETE - Only uses 'pending' and 'approved'
**Current State:** 
```
- project.status = 'pending' | 'approved'
```
**Required States:**
```
- DRAFT (unpublished projects)
- IP_PROTECTED (blockchain hash confirmed)
- SUBMITTED (sent for staff review)
- APPROVED (staff approved)
- PUBLISHED (live on platform)
- REJECTED (staff rejected)
```

**Files to Create:**
- `src/constants/ProjectStatus.js` - Define all status constants and transitions

### BR-04: Edit Restrictions Based on Status
**Status:** ❌ NOT IMPLEMENTED
**Current State:** No edit restriction logic
**Required Implementation:**
- Allow editing only when status ≠ PUBLISHED
- Allow editing when status = REJECTED (to fix issues)
- Disable edit buttons for PUBLISHED projects
- Show status-specific UI messages

**Files to Modify:**
- `src/components/startup/CompleteStartupInfoForm.jsx` - Add status-based disabled logic
- `src/pages/StartupDashboard.jsx` - Manage form visibility by status

### BR-05: Required Fields for Project Creation
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Current Fields Required:**
- ✅ Startup Name (as startupName)
- ❌ **Project Name** - MISSING
- ❌ **Category** - MISSING (has industry instead)
- ✅ Stage (implemented)
- ❌ **Short Description** - Missing (has full description)

**Current Form Fields:** startupName, logo, founders, contactEmail, phone, country, city, website, industry, stage, problemStatement, solutionDescription, targetCustomers, uniqueValueProposition, marketSize, businessModel, currentRevenue, competitors, teamMembers, keySkills, experience, pitchDeck, businessPlan

**Required Modifications:**
- Add "Project Name" field
- Rename/add "Category" field (distinct from industry)
- Add "Short Description" (255 characters max)
- Update validation rules

**Files to Modify:**
- `src/components/startup/CompleteStartupInfoForm.jsx` - Add missing required fields

---

## II. Data Validation & Business Errors (BR-6 to BR-09)

### BR-6: Missing Required Information Validation
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Current State:** Has validation but not comprehensive
**Required Implementation:**
- Strict validation of all required fields (BR-05)
- Show validation errors immediately
- Block save if any required field is empty
- Implement before form submission

**Files to Modify:**
- `src/components/startup/CompleteStartupInfoForm.jsx` - Enhanced validation

### BR-7: File Format Validation
**Status:** ⚠️ MINIMAL IMPLEMENTATION
**Current State:** FileUpload component exists but validation is basic
**Required Implementation:**
- Validate file formats: PDF, DOCX, XLSX, PPT
- Max file size: 10MB per file
- Return specific format error messages
- Show validation feedback to user

**Files to Modify:**
- `src/components/common/FileUpload.jsx` - Add comprehensive format validation

### BR-08: IP Protection Status (Blockchain Hash)
**Status:** ❌ NOT IMPLEMENTED
**Current State:** Documents have mock 'hash' field but no blockchain integration
**Required Implementation:**
- Call blockchain API to record document hash
- Confirm successful recording
- Store: transaction_hash, timestamp, verification_status
- Update project status to IP_PROTECTED upon success

**Files to Create:**
- `src/services/BlockchainService.js` - Blockchain integration

### BR-09: Cannot Publish Without IP Protection
**Status:** ❌ NOT IMPLEMENTED
**Current State:** No publish button or logic
**Required Implementation:**
- Block publish button if status ≠ IP_PROTECTED
- Show requirement message: "Please protect your documents on blockchain first"
- Implement publish workflow

**Files to Modify:**
- `src/pages/StartupDashboard.jsx` - Add IP protection check before publish

---

## III. AI Evaluation Rules (BR-10 to BR-14)

### BR-10: AI Evaluation Only After Blockchain Protection
**Status:** ❌ NOT IMPLEMENTED
**Current State:** No AI evaluation feature
**Required Implementation:**
- Trigger AI evaluation AFTER IP_PROTECTED status confirmed
- Auto-generate AI report on documents

**Files to Create:**
- `src/services/AIEvaluationService.js` - AI evaluation logic

### BR-11: AI Analysis Scope
**Status:** ❌ NOT IMPLEMENTED
**Should Analyze:**
- Project metadata: name, description, category, stage
- Uploaded documents: content analysis

### BR-12: AI Evaluation Output
**Status:** ❌ NOT IMPLEMENTED
**Must Generate:**
- Startup Score (0-100)
- Strengths (list)
- Weaknesses (list)
- Risk Indicators (list)

### BR-13: Score is Reference Only
**Status:** ❌ NOT IMPLEMENTED
**Must Display:** "This AI Score is for reference only and does not determine investment decisions"

### BR-14: Startup Cannot Edit AI Results
**Status:** ❌ NOT IMPLEMENTED
**Must Implement:** Make AI evaluation results read-only

**Files to Modify:**
- Create new tab in StartupDashboard for AI Evaluation
- Display read-only evaluation results
- Show disclaimer message

---

## IV. Staff Review Rules (BR-15 to BR-18)

### BR-15: Staff Review Required Before Publish
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Current State:** OperationStaffDashboard has project review tab but limited functionality
**Current Statuses:** 'pending' | 'approved' | 'rejected'
**Issues:**
- No specific state for "SUBMITTED" (waiting for review)
- No feedback mechanism
- No connection to startup side

**Required Implementation:**
- Status: SUBMITTED → APPROVED or REJECTED
- Staff can add feedback/comments
- Changes sync to startup dashboard

### BR-16: Staff Actions - Approve or Reject with Feedback
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Current State:** handleApproveProject, handleRejectProject exist but no feedback
**Required Implementation:**
- Add feedback/comment field for rejections
- Require reason for rejection
- Optional feedback for approvals
- Store feedback in project record

**Files to Modify:**
- `src/pages/OperationStaffDashboard.jsx` - Add feedback mechanism
- Create: `src/components/operations/StaffReviewModal.jsx` - Dedicated review modal

### BR-17: Rejected Status Change
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Current State:** Sets status to 'rejected'
**Required:** Status = REJECTED exactly

### BR-18: Edit After Rejection
**Status:** ❌ NOT IMPLEMENTED
**Current State:** No re-editing after rejection
**Required Implementation:**
- Allow startup to edit when status = REJECTED
- Show "Fix issues and resubmit" message
- Reset status to DRAFT on resubmission
- Track resubmission history

**Files to Modify:**
- `src/pages/StartupDashboard.jsx` - Allow editing for REJECTED status
- `src/components/startup/CompleteStartupInfoForm.jsx` - Handle resubmission

---

## V. Publish & Display Rules (BR-19 to BR-22)

### BR-19: Publish Prerequisites
**Status:** ❌ NOT IMPLEMENTED
**Must Have ALL THREE:**
1. ✅ IP Protected (blockchain hash confirmed)
2. ❌ AI Evaluated (AI score generated)
3. ❌ Staff Approved (APPROVED status)

**Required Implementation:**
- Create publish checklist
- Show which steps are complete
- Block publish if any missing
- Validate all three before allowing publish

**Files to Modify:**
- `src/pages/StartupDashboard.jsx` - Add publish checklist and button

### BR-20: Published Project Restrictions
**Status:** ❌ NOT IMPLEMENTED
**Rules:**
- Cannot edit original content (name, description, documents)
- Can only update: tags, visibility settings
- Create separate "edit metadata" interface

**Files to Modify:**
- `src/pages/StartupDashboard.jsx` - Show different edit options for published
- Create: `src/components/startup/PublishedProjectEditor.jsx`

### BR-21: Public Blockchain Proof Display
**Status:** ❌ NOT IMPLEMENTED
**Must Show:**
- Transaction Hash (e.g., 0x7f3a1b2c...)
- Timestamp (e.g., 2024-01-18 14:30:00)
- Verification Status (Success/Failed)

**Files to Create:**
- `src/components/common/BlockchainProofDisplay.jsx` - Display proof

### BR-22: Published Project Visibility
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Current State:** Projects visible in feed but no published/draft distinction
**Required:** Only PUBLISHED projects shown to investors/advisors

**Files to Modify:**
- `src/components/feed/FeedFilter.jsx` - Filter by publication status
- `src/pages/InvestorDashboard.jsx` - Only show PUBLISHED

---

## VI. Investor/Advisor Verification (BR-23 to BR-26)

### BR-23: Investor/Advisor Document Verification Rights
**Status:** ❌ NOT IMPLEMENTED
**Must Allow:**
- Request document verification from startup
- View verification status
- See blockchain proof

**Files to Create:**
- `src/components/common/VerificationRequestModal.jsx`

### BR-24: Hash Comparison Implementation
**Status:** ❌ NOT IMPLEMENTED
**Logic:**
```
if (hash_of_current_document == hash_on_blockchain) {
  status = "VERIFIED"
} else {
  status = "MISMATCH"
}
```

**Files to Modify:**
- `src/services/BlockchainService.js` - Add verification function

### BR-25: Verified Display
**Status:** ❌ NOT IMPLEMENTED
**Must Show:** "Verified on Blockchain" badge

**Files to Create:**
- `src/components/common/VerificationBadge.jsx`

### BR-26: Mismatch Display
**Status:** ❌ NOT IMPLEMENTED
**Must Show:** "Document mismatch" warning with details

---

## Implementation Priority

### Critical (Must Have) - Phase 1
1. ✅ Project Status Constants (BR-03)
2. ✅ Email Verification Check (BR-02)
3. ✅ Required Fields Validation (BR-05, BR-06)
4. ✅ File Format Validation (BR-07)
5. ✅ Edit Restrictions by Status (BR-04)

### High Priority - Phase 2
6. ✅ Blockchain Integration (BR-08, BR-21, BR-24-26)
7. ✅ Staff Review with Feedback (BR-15-18)
8. ✅ One Project Per Account (BR-01)
9. ✅ Publish Workflow (BR-19-22)

### Medium Priority - Phase 3
10. ✅ AI Evaluation Service (BR-10-14)
11. ✅ Investor/Advisor Verification (BR-23-26)
12. ✅ Analytics & Reporting

---

## Summary of Missing Files to Create

1. `src/constants/ProjectStatus.js` - Status constants and validators
2. `src/services/ProjectValidation.js` - BR-01, BR-05, BR-06 validation
3. `src/services/BlockchainService.js` - BR-08, BR-21, BR-24-26 blockchain
4. `src/services/AIEvaluationService.js` - BR-10-14 AI evaluation
5. `src/components/operations/StaffReviewModal.jsx` - BR-15-18 review UI
6. `src/components/common/BlockchainProofDisplay.jsx` - BR-21 proof display
7. `src/components/common/VerificationBadge.jsx` - BR-25-26 verification UI
8. `src/components/startup/PublishedProjectEditor.jsx` - BR-20 metadata editing

---

## Files to Modify

1. `src/pages/StartupDashboard.jsx` - Overall project management
2. `src/pages/OperationStaffDashboard.jsx` - Staff review workflow
3. `src/pages/InvestorDashboard.jsx` - Document verification
4. `src/pages/AdvisorDashboard.jsx` - Verification requests
5. `src/components/startup/CompleteStartupInfoForm.jsx` - Form and validation
6. `src/components/common/FileUpload.jsx` - Enhanced validation
7. `src/components/feed/FeedFilter.jsx` - Filter published only

