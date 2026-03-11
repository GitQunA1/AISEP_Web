import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Upload, AlertCircle } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import SubmissionReviewStep from './SubmissionReviewStep';
import ProjectValidationService from '../../services/ProjectValidation';
// Import the shared styles from the auth module to match the design
import styles from '../auth/RegisterForms.module.css';

/**
 * CompleteStartupInfoForm - Wizard style form for comprehensive startup profile
 * Implements BR-02 (email verification), BR-05 (required fields), BR-06 (validation)
 * Steps 1-6: Basic, Business, Market, Team, Documents, Review
 */
export default function CompleteStartupInfoForm({ onSubmit, onCancel, onDirtyChange, user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // A. Basic Info (BR-05 required)
    startupName: '',
    projectName: '',                     // BR-05: Required
    logo: null,
    founders: '',
    contactEmail: '',
    phone: '',
    country: '',
    city: '',
    website: '',

    // B. Business Info (BR-05 required)
    category: '',                         // BR-05: Required (distinct from industry)
    industry: '',
    stage: 'idea',                        // BR-05: Required
    problemStatement: '',
    solutionDescription: '',
    shortDescription: '',                 // BR-05: Required
    targetCustomers: '',
    uniqueValueProposition: '',

    // C. Market & Model
    marketSize: '',
    businessModel: '',
    currentRevenue: '',
    competitors: '',

    // D. Team
    teamMembers: '',
    keySkills: '',
    experience: '',

    // E. Documents
    pitchDeck: null,
    businessPlan: null,
  });

  const [errors, setErrors] = useState({});
  const [emailVerificationError, setEmailVerificationError] = useState('');

  // Check for dirty state
  useEffect(() => {
    // A simple check: if any string value is non-empty, consider it dirty
    const isDirty = Object.values(formData).some(value => {
      if (typeof value === 'string') return value.length > 0;
      return value !== null;
    });

    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [formData, onDirtyChange]);

  // BR-02: Check email verification on component mount
  useEffect(() => {
    if (user && !user.emailVerified) {
      setEmailVerificationError(
        'Please verify your email address before creating a project. Check your inbox for the verification link.'
      );
    }
  }, [user]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileSelect = (field, file) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (field === 'pitchDeck' && errors.pitchDeck) setErrors((prev) => ({ ...prev, pitchDeck: '' }));
  };

  const handleLogoUpload = (e) => {
    // Simple file handling for logo input
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files[0] }));
    }
  };

  // --- Validation ---
  const validateStep = () => {
    const newErrors = {};

    // Step 1: Basic Info (BR-05, BR-06)
    if (currentStep === 1) {
      if (!formData.startupName.trim()) newErrors.startupName = 'Startup Name is required';
      if (!formData.projectName.trim()) newErrors.projectName = 'Project Name is required';   // BR-05
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact Email is required';
      if (!formData.founders.trim()) newErrors.founders = 'Founders are required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
    }

    // Step 2: Business (BR-05, BR-06)
    if (currentStep === 2) {
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.category) newErrors.category = 'Category is required';                   // BR-05
      if (!formData.stage) newErrors.stage = 'Stage is required';                            // BR-05
      if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Problem Statement is required';
      if (!formData.solutionDescription.trim()) newErrors.solutionDescription = 'Solution Description is required';
      if (!formData.shortDescription.trim()) {                                              // BR-05
        newErrors.shortDescription = 'Short description is required';
      } else if (formData.shortDescription.trim().length < 20) {
        newErrors.shortDescription = 'Short description must be at least 20 characters';
      } else if (formData.shortDescription.trim().length > 255) {
        newErrors.shortDescription = 'Short description must be less than 255 characters';
      }
    }

    // Step 3: Market (Optional but recommended, no strict errors)

    // Step 4: Team (Optional but recommended)

    // Step 5: Documents (BR-05 file validation)
    if (currentStep === 5) {
      if (!formData.pitchDeck) {
        newErrors.pitchDeck = 'Pitch Deck is required';
      } else {
        // BR-07: Validate file format
        const fileValidation = ProjectValidationService.validateFileFormat(formData.pitchDeck);
        if (!fileValidation.isValid) {
          newErrors.pitchDeck = fileValidation.error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // BR-02: Check email verification before submission
    if (user && !user.emailVerified) {
      setEmailVerificationError(
        'Please verify your email address before creating a project.'
      );
      return;
    }
    if (validateStep()) onSubmit(formData);
  };

  return (
    <div className={styles.formCard}>
      {/* HEADER */}
      <div className={styles.cardHeader}>
        {/* X Close Button Removed */}

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
        </div>
        <p className={styles.stepIndicator}>Step {currentStep} of {totalSteps}</p>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>

        {/* BR-02: Email Verification Warning */}
        {emailVerificationError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={20} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', color: '#991B1B', marginBottom: '4px' }}>Email Verification Required</div>
              <div style={{ fontSize: '14px', color: '#7F1D1D' }}>
                {emailVerificationError}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Basic Information</h2>
              <p className={styles.stepSubtitle}>Let's start with the essentials (Step A)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Startup Name <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="startupName"
                value={formData.startupName}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.startupName ? styles.inputError : ''}`}
                placeholder="e.g. Acme AI"
              />
              {errors.startupName && <p className={styles.errorText}>{errors.startupName}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Project Name <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.projectName ? styles.inputError : ''}`}
                placeholder="e.g. AI Analytics Platform"
              />
              {errors.projectName && <p className={styles.errorText}>{errors.projectName}</p>}
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                The name of your project/product
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Logo</label>
              <div
                style={{
                  border: '1px dashed var(--border-color)',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)'
                }}
                onClick={() => document.getElementById('logo-upload').click()}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {formData.logo ? (
                    <img
                      src={URL.createObjectURL(formData.logo)}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <Upload size={20} color="var(--text-secondary)" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    {formData.logo ? formData.logo.name : 'Upload Logo'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    JPG, PNG max 2MB
                  </div>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Founder(s) <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="founders"
                value={formData.founders}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.founders ? styles.inputError : ''}`}
                placeholder="e.g. Jane Doe, John Smith"
              />
              {errors.founders && <p className={styles.errorText}>{errors.founders}</p>}
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Email <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.contactEmail ? styles.inputError : ''}`}
                  placeholder="contact@startup.com"
                />
                {errors.contactEmail && <p className={styles.errorText}>{errors.contactEmail}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="+1 (555) ..."
                />
              </div>
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Country <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.country ? styles.inputError : ''}`}
                  placeholder="e.g. Vietnam"
                />
                {errors.country && <p className={styles.errorText}>{errors.country}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g. Ho Chi Minh"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://"
              />
            </div>
          </div>
        )}

        {/* Step 2: Business Info */}
        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Business Details</h2>
              <p className={styles.stepSubtitle}>Describe your solution (Step B)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category <span className={styles.required}>*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
              >
                <option value="">Select Category</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Blockchain">Blockchain</option>
                <option value="IoT">IoT</option>
                <option value="Mobile">Mobile</option>
                <option value="Web">Web</option>
                <option value="Desktop">Desktop</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className={styles.errorText}>{errors.category}</p>}
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Primary technology category of your project
              </p>
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Industry <span className={styles.required}>*</span></label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.industry ? styles.inputError : ''}`}
                >
                  <option value="">Select Industry</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Fintech">Fintech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Other">Other</option>
                </select>
                {errors.industry && <p className={styles.errorText}>{errors.industry}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Stage <span className={styles.required}>*</span></label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.stage ? styles.inputError : ''}`}
                >
                  <option value="">Select Stage</option>
                  <option value="idea">Idea</option>
                  <option value="mvp">MVP</option>
                  <option value="early">Early</option>
                  <option value="growth">Growth</option>
                </select>
                {errors.stage && <p className={styles.errorText}>{errors.stage}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Short Description <span className={styles.required}>*</span></label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.shortDescription ? styles.inputError : ''}`}
                placeholder="Brief description of your project (20-255 characters)"
                style={{ minHeight: '60px' }}
              />
              {errors.shortDescription && <p className={styles.errorText}>{errors.shortDescription}</p>}
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {formData.shortDescription.length} / 255 characters
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Problem Statement <span className={styles.required}>*</span></label>
              <textarea
                name="problemStatement"
                value={formData.problemStatement}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.problemStatement ? styles.inputError : ''}`}
                placeholder="What core problem are you solving?"
              />
              {errors.problemStatement && <p className={styles.errorText}>{errors.problemStatement}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Solution Description <span className={styles.required}>*</span></label>
              <textarea
                name="solutionDescription"
                value={formData.solutionDescription}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.solutionDescription ? styles.inputError : ''}`}
                placeholder="How does your product solve it?"
              />
              {errors.solutionDescription && <p className={styles.errorText}>{errors.solutionDescription}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Unique Value Proposition</label>
              <textarea
                name="uniqueValueProposition"
                value={formData.uniqueValueProposition}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="What makes you different?"
                style={{ minHeight: '100px' }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Market & Model */}
        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Market & Model</h2>
              <p className={styles.stepSubtitle}>Your business potential (Step C)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Target Customers</label>
              <input
                type="text"
                name="targetCustomers"
                value={formData.targetCustomers}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g. Gen Z, SMEs in SE Asia"
              />
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Market Size</label>
                <input
                  type="text"
                  name="marketSize"
                  value={formData.marketSize}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g. $5B TAM"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Revenue</label>
                <input
                  type="text"
                  name="currentRevenue"
                  value={formData.currentRevenue}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g. $10k MRR"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Business Model</label>
              <textarea
                name="businessModel"
                value={formData.businessModel}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="How do you make money?"
                style={{ minHeight: '100px' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Competitors</label>
              <textarea
                name="competitors"
                value={formData.competitors}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Who are your main competitors?"
                style={{ minHeight: '100px' }}
              />
            </div>
          </div>
        )}

        {/* Step 4: Team */}
        {currentStep === 4 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Team Info</h2>
              <p className={styles.stepSubtitle}>Who is building this? (Step D)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Team Members</label>
              <textarea
                name="teamMembers"
                value={formData.teamMembers}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="List key members and their roles"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Key Skills</label>
              <textarea
                name="keySkills"
                value={formData.keySkills}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="e.g. Python, Marketing, Sales"
                style={{ minHeight: '100px' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Experience</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Relevant past experience of the team"
                style={{ minHeight: '100px' }}
              />
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {currentStep === 5 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Documents</h2>
              <p className={styles.stepSubtitle}>Upload verification files (Step E)</p>
            </div>

            <FileUpload
              label="Pitch Deck (Required)"
              required
              accept=".pdf,.ppt,.pptx"
              onFileSelect={(f) => handleFileSelect('pitchDeck', f)}
              error={errors.pitchDeck}
            />

            <FileUpload
              label="Business Plan (Optional)"
              accept=".pdf,.docx,.doc"
              onFileSelect={(f) => handleFileSelect('businessPlan', f)}
            />
          </div>
        )}

        {/* Step 6: Review & Summary */}
        {currentStep === 6 && (
          <SubmissionReviewStep
            formData={formData}
            onJumpToStep={setCurrentStep}
            onFileRemove={(field) => setFormData(prev => ({ ...prev, [field]: null }))}
            onFileReplace={(field, file) => setFormData(prev => ({ ...prev, [field]: file }))}
          />
        )}

      </div>

      {/* FOOTER */}
      <div className={styles.cardFooter}>
        <button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className={styles.secondaryButton}
        >
          {currentStep === 1 ? 'Cancel' : (
            <>
              <ChevronLeft size={20} /> Previous
            </>
          )}
        </button>

        <button
          onClick={currentStep === totalSteps ? handleSubmit : handleNext}
          className={styles.primaryButton}
        >
          {currentStep === totalSteps ? 'Confirm & Submit' : (
            <>
              Next Step <ChevronRight size={20} />
            </>
          )}
        </button>
        {/* BR-02: Disable submit if email not verified */}
        {currentStep === totalSteps && emailVerificationError && (
          <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '8px', textAlign: 'center' }}>
            Please verify your email to submit
          </p>
        )}
      </div>
    </div>
  );
}
