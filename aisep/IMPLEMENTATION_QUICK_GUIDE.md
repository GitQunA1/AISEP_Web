# Business Rules Implementation - Quick Reference Guide

## 📌 What Was Implemented

### Phase 1: Complete Infrastructure (✅ DONE)

Your application was missing **critical business rule implementations**. Here's what was added:

---

## 🎯 1. Project Status System

**File:** `src/constants/ProjectStatus.js`

All projects now follow a complete lifecycle:
```
DRAFT → IP_PROTECTED → SUBMITTED → APPROVED → PUBLISHED
                                        ↓
                                     REJECTED → (back to DRAFT)
```

**Key Features:**
- 6 distinct statuses (was only 2 before: pending/approved)
- Automatic status transitions
- Edit/visibility rules per status
- Color coding for UI

**Usage in code:**
```javascript
import { PROJECT_STATUS, isEditable, isPublished } from '@/constants/ProjectStatus';

// Check if project can be edited
if (isEditable(project.status)) {
  // Show edit form
}

// Check if published
if (isPublished(project.status)) {
  // Show public view
}
```

---

## 🔐 2. Validation Service

**File:** `src/services/ProjectValidation.js`

Validates all business rules for project creation:

### BR-01: One Project Per Account (6-month rule)
```javascript
const eligibility = ProjectValidationService.checkProjectCreationEligibility(userProjects);
if (!eligibility.canCreate) {
  // Show: "You can create a new project in X days"
}
```

### BR-02: Email Verification Required
```javascript
const emailCheck = ProjectValidationService.checkEmailVerification(user);
if (!emailCheck.isValid) {
  // Block project creation - show email verification warning
}
```

### BR-05: Required Fields
**Now required:**
- ✅ Project Name (new)
- ✅ Category (new)
- ✅ Stage (Idea/MVP/Early/Growth)
- ✅ Short Description (new)

```javascript
const validation = ProjectValidationService.validateRequiredFields(formData);
if (!validation.isValid) {
  // Show: validation.errors object
}
```

### BR-07: File Format Validation
```javascript
const fileCheck = ProjectValidationService.validateFileFormat(file);
// Validates: PDF, DOCX, XLSX, PPTX (max 10MB)
if (!fileCheck.isValid) {
  // Show: fileCheck.error (e.g., "File size exceeds 10MB limit")
}
```

### BR-09, BR-19: IP Protection & Publish Requirements
```javascript
const publishChecklist = ProjectValidationService.getPublicationChecklist(project);
// Returns: { canPublish, checklist, remainingItems }
// Checklist items: ipProtected, aiEvaluated, staffApproved
```

---

## ⛓️ 3. Blockchain Service

**File:** `src/services/BlockchainService.js`

Handles document protection and verification:

### BR-08: Protect Documents on Blockchain
```javascript
const result = await BlockchainService.protectDocumentsOnBlockchain(documents, projectId);
// Returns: {
//   success: true,
//   blockchainHash: '0x...',
//   transactionHash: '0x...',
//   timestamp: '2024-01-18T14:30:00Z',
//   status: 'SUCCESS'
// }

// Update project:
// project.blockchainHash = result.blockchainHash
// project.transactionHash = result.transactionHash
// project.ipProtectionDate = result.timestamp
// project.status = PROJECT_STATUS.IP_PROTECTED
```

### BR-21: Display Blockchain Proof
```javascript
const proof = BlockchainService.getBlockchainProof(project);
// Returns: {
//   transactionHash: '0x7f3a1b2c...',
//   timestamp: 'January 18, 2024 14:30:00 UTC',
//   verificationStatus: 'Verified',
//   blockchainLink: 'https://blockchain.explorer/tx/0x...'
// }

// Display to users: Transaction Hash, Timestamp, Verification Status
```

### BR-24-26: Verify Document Hash
```javascript
const verification = await BlockchainService.verifyDocumentHash(
  currentDocument,
  storedBlockchainHash
);

if (verification.verified) {
  // Show: "Verified on Blockchain" ✓ (BR-25)
} else {
  // Show: "Document mismatch" ⚠️ (BR-26)
}
```

---

## 🤖 4. AI Evaluation Service

**File:** `src/services/AIEvaluationService.js`

Automatic AI analysis of projects (triggered after IP protection):

### BR-10-14: Run AI Evaluation
```javascript
const result = await AIEvaluationService.evaluateProject(project, documents);

// Returns: {
//   evaluation: {
//     startupScore: 78,              // BR-12: Score 0-100
//     strengths: [...],              // BR-12: List of strengths
//     weaknesses: [...],             // BR-12: List of weaknesses
//     riskIndicators: [...],         // BR-12: List of risks with levels
//     disclaimer: "This AI Score...", // BR-13: Reference only
//     isReadOnly: true               // BR-14: Cannot edit results
//   }
// }
```

**AI Analysis includes:**
- Metadata analysis: name, description, stage, revenue, team, market
- Document analysis: presence, quality, completeness
- Risk assessment: execution risk, key person dependency, market validation

**Display Requirements:**
- Show Startup Score with category (Excellent/Good/Fair/Needs Improvement)
- List Strengths
- List Weaknesses
- Display Risk Indicators with severity levels
- **Always show disclaimer:** "This AI Score is for reference only and does not determine investment decisions"
- Make results read-only (no editing)

---

## 📝 5. Enhanced Startup Form

**File:** `src/components/startup/CompleteStartupInfoForm.jsx`

### What's New:
1. **Email Verification Check** (BR-02)
   - Shows warning if email not verified
   - Blocks submission with clear message

2. **New Required Fields** (BR-05)
   - "Project Name" - distinct from Startup Name
   - "Category" - tech category (AI/ML, Blockchain, IoT, etc.)
   - "Short Description" - 20-255 characters with counter
   
3. **Enhanced Validation** (BR-06, BR-07)
   - Real-time error clearing
   - Character count display
   - File format validation with specific error messages
   - File size validation (10MB limit)

4. **Updated Stage Options** (BR-05)
   - Now: Idea, MVP, Early, Growth (was: idea, mvp, growth, scale)

---

## 🔗 How Everything Works Together

```
1. User clicks "Create Project"
   ↓
2. BR-02: Check email verified?
   → If NO: Show warning, block submission
   → If YES: Continue
   ↓
3. BR-01: Check 6-month rule
   → If user has active project < 6 months old: Show "You can create in X days"
   → If OK: Show form
   ↓
4. BR-05, BR-06: Fill form with required fields
   - Startup Name, Project Name, Category, Stage, Short Description, etc.
   → Form validates all required fields
   ↓
5. BR-07: Upload documents
   → Validate file format (PDF, DOCX, XLSX, PPTX only)
   → Validate file size (max 10MB)
   → Show format errors if needed
   ↓
6. Submit form
   → Create project with status = DRAFT
   ↓
7. BR-08: Protect on Blockchain
   → User clicks "Protect Documents" button
   → System generates document hash
   → Simulated blockchain records hash
   → Project status → IP_PROTECTED
   → Display blockchain proof (hash, timestamp, verification status)
   ↓
8. BR-10: Auto-trigger AI Evaluation
   → After IP protection confirmed
   → AI analyzes metadata + documents
   → Generates score (0-100), strengths, weaknesses, risks
   → Displays with disclaimer (BR-13)
   ↓
9. BR-15: Submit for Staff Review
   → Project status → SUBMITTED
   → Staff can approve or reject with feedback
   ↓
10. BR-19: Publish Requirements Checked
    ✓ IP Protected (done)
    ✓ AI Evaluated (done)
    ✓ Staff Approved (done)
    → Publish button enabled
    ↓
11. BR-20, BR-22: Project Published
    → Status → PUBLISHED
    → Visible to investors/advisors
    → Can only edit tags/visibility (not core content)
    → Display blockchain proof publicly
```

---

## 🛠️ Integration Checklist

### For StartupDashboard (`src/pages/StartupDashboard.jsx`):
- [ ] Pass `user` prop to CompleteStartupInfoForm
- [ ] Initialize project with status = DRAFT
- [ ] Add "Protect on Blockchain" button
- [ ] Call BlockchainService after documents uploaded
- [ ] Auto-trigger AIEvaluationService after IP protection
- [ ] Show publication checklist
- [ ] Add "Publish" button (only when all prerequisites met)
- [ ] Restrict editing based on status (use `isUserEditable()`)
- [ ] Show blockchain proof when available
- [ ] Display AI evaluation results with disclaimer

### For OperationStaffDashboard (`src/pages/OperationStaffDashboard.jsx`):
- [ ] Update project status to SUBMITTED when startup submits
- [ ] Add feedback/comment field for rejections
- [ ] Implement approve/reject logic
- [ ] Change status to APPROVED or REJECTED
- [ ] Allow startups to re-edit if REJECTED

### For InvestorDashboard & AdvisorDashboard:
- [ ] Filter projects (only show PUBLISHED)
- [ ] Show blockchain proof for verification
- [ ] Add "Verify Documents" button
- [ ] Implement document verification (BR-24)
- [ ] Show verification badge (BR-25) or mismatch warning (BR-26)

---

## 📊 Key Functions Reference

### ProjectStatus.js
```javascript
isValidTransition(fromStatus, toStatus)        // Check if transition allowed
isEditable(status)                              // Can be edited
isUserEditable(status)                          // Can user edit (not system-only)
isPublished(status)                             // Is published
isVisibleToInvestors(status)                    // Visible to investors/advisors
hasIPProtection(status)                         // Has blockchain protection
canBePublished(status, hasAIEvaluation)         // Can publish now
```

### ProjectValidation.js
```javascript
checkEmailVerification(user)                    // BR-02
checkProjectCreationEligibility(userProjects)  // BR-01
validateRequiredFields(formData)                // BR-05, BR-06
validateFileFormat(file)                        // BR-07
checkEditPermission(status, userRole)           // BR-04
checkIPProtectionStatus(project)                // BR-09
getPublicationChecklist(project)                // BR-19
```

### BlockchainService.js
```javascript
await protectDocumentsOnBlockchain(docs, id)   // BR-08
await verifyDocumentHash(doc, hash)            // BR-24
getBlockchainProof(project)                    // BR-21
getVerificationBadge(result)                    // BR-25, BR-26
hasIPProtection(project)                        // Check protection status
```

### AIEvaluationService.js
```javascript
await evaluateProject(project, docs)           // BR-10, BR-11, BR-12
getEvaluationDisplay(evaluation)                // Get display-ready evaluation
```

---

## 🎓 Common Scenarios

### Scenario 1: User Tries to Create 2nd Project Too Soon
```javascript
const projects = user.projects; // Only has 1 active project from 2 months ago
const check = ProjectValidationService.checkProjectCreationEligibility(projects);

check.canCreate // false
check.daysUntilEligible // 120 days
check.message // "You can create a new one in 120 days..."
```

### Scenario 2: User Not Email Verified
```javascript
const user = { emailVerified: false };
const check = ProjectValidationService.checkEmailVerification(user);

check.isValid // false
check.message // "Please verify your email..."
// Block form display or show warning
```

### Scenario 3: Publish Checklist
```javascript
const project = {
  blockchainHash: '0x...', // ✓
  aiEvaluation: {...},      // ✓
  status: 'APPROVED'        // ✓
};

const checklist = ProjectValidationService.getPublicationChecklist(project);

checklist.canPublish // true
checklist.remainingItems // []
```

### Scenario 4: Staff Rejects Project
```javascript
// Staff reviews project and rejects with feedback
project.status = PROJECT_STATUS.REJECTED;
project.rejectionFeedback = "Please add more market analysis";

// Now startup can re-edit
const permission = ProjectValidationService.checkEditPermission(
  PROJECT_STATUS.REJECTED,
  'startup'
);

permission.canEdit // true
// Show edit form again
```

---

## ⚠️ Important Notes

1. **Blockchain Service is Simulated**
   - Uses simulated hashing for development
   - Ready to integrate with real blockchain (Web3.js, ethers.js)
   - All function signatures match blockchain standards

2. **AI Evaluation is Simulated**
   - Uses heuristic-based scoring
   - Can integrate with real AI APIs
   - Output format matches requirements

3. **All Services are Stateless**
   - No database calls in services
   - Integration layer (components/pages) handles data persistence
   - Easy to test and mock

4. **Email Verification**
   - Currently checks `user.emailVerified` flag
   - Assumes your auth system sets this
   - Add actual email verification flow if needed

5. **6-Month Rule**
   - Checks `createdAt` field on project
   - Make sure projects have this field with timestamp

---

## 🚀 Next Priority Actions

### Must Do:
1. Test all Phase 1 functions
2. Integrate into StartupDashboard
3. Add status management UI
4. Implement IP protection workflow

### Should Do:
1. Create StaffReviewModal
2. Add feedback mechanism to staff dashboard
3. Implement project resubmission flow

### Nice to Have:
1. Create verification components
2. Add blockchain explorer links
3. Create analytics dashboard
4. Add notifications system

---

## 📞 Questions?

Refer to:
- `BUSINESS_RULES_ANALYSIS.md` - Detailed analysis of all rules
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation checklist
- Individual service files - JSDoc comments explain each function

