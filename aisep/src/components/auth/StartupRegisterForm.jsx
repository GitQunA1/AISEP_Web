import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import styles from './RegisterForms.module.css';

/**
 * StartupRegisterForm Component
 * Refactored to include Contact Info (Phone) and improved layout
 */
function StartupRegisterForm({ onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account & Basic Info
    startupName: '',
    email: '',
    phone: '',          // ADDED
    password: '',
    website: '',
    country: '',
    city: '',
    logo: null,

    // Step 2: Business Details
    industry: '',
    stage: '',
    problemStatement: '',
    solutionDescription: '',

    // Step 3: Market & Team
    targetCustomers: '',
    revenue: '',
    teamSize: '',

    // Step 4: Documents
    pitchDeck: null,
    businessPlan: null,
  });

  const [errors, setErrors] = useState({});

  const industries = ['Fintech', 'HealthTech', 'EduTech', 'E-commerce', 'SaaS', 'AI/ML', 'Blockchain', 'Other'];
  const stages = ['Idea', 'MVP', 'Growth'];

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

  // --- Validation ---
  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.startupName) newErrors.startupName = 'Startup Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone Number is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }
    if (currentStep === 2) {
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.stage) newErrors.stage = 'Stage is required';
      if (!formData.problemStatement) newErrors.problemStatement = 'Problem statement is required';
    }
    if (currentStep === 4) {
      if (!formData.pitchDeck) newErrors.pitchDeck = 'Pitch deck is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setCurrentStep((prev) => prev + 1); };
  const handlePrevious = () => { setCurrentStep((prev) => prev - 1); };
  const handleSubmit = () => { if (validateStep()) onComplete && onComplete(formData); };

  return (
    <div className={styles.formCard}>
      
      {/* HEADER */}
      <div className={styles.cardHeader}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(currentStep / 4) * 100}%` }} />
        </div>
        <p className={styles.stepIndicator}>Step {currentStep} of 4</p>
      </div>

      {/* BODY (Scrollable) */}
      <div className={styles.cardBody}>
        
        {/* STEP 1: Account & Contact */}
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Let's get started</h2>
              <p className={styles.stepSubtitle}>Create your startup account and contact details</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Startup Name <span className={styles.required}>*</span></label>
              <input type="text" name="startupName" value={formData.startupName} onChange={handleInputChange} 
                className={`${styles.input} ${errors.startupName ? styles.inputError : ''}`} placeholder="e.g., TechVenture Inc." />
              {errors.startupName && <p className={styles.errorText}>{errors.startupName}</p>}
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} 
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="founder@startup.com" />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} placeholder="+1 (555) 000-0000" />
                {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password <span className={styles.required}>*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} 
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`} placeholder="••••••••" />
              {errors.password && <p className={styles.errorText}>{errors.password}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Website URL</label>
              <input type="text" name="website" value={formData.website} onChange={handleInputChange} 
                className={styles.input} placeholder="https://yourstartup.com" />
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Country <span className={styles.required}>*</span></label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} 
                  className={`${styles.input} ${errors.country ? styles.inputError : ''}`} placeholder="Vietnam" />
                 {errors.country && <p className={styles.errorText}>{errors.country}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} 
                  className={styles.input} placeholder="Ho Chi Minh" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Business Details */}
        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Business Details</h2>
              <p className={styles.stepSubtitle}>Tell us about your solution</p>
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Industry <span className={styles.required}>*</span></label>
                <select name="industry" value={formData.industry} onChange={handleInputChange} 
                  className={`${styles.select} ${errors.industry ? styles.inputError : ''}`}>
                  <option value="">Select industry</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {errors.industry && <p className={styles.errorText}>{errors.industry}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Stage <span className={styles.required}>*</span></label>
                 <select name="stage" value={formData.stage} onChange={handleInputChange} 
                  className={`${styles.select} ${errors.stage ? styles.inputError : ''}`}>
                  <option value="">Select stage</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.stage && <p className={styles.errorText}>{errors.stage}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Problem Statement <span className={styles.required}>*</span></label>
              <textarea name="problemStatement" value={formData.problemStatement} onChange={handleInputChange} 
                className={`${styles.textarea} ${errors.problemStatement ? styles.inputError : ''}`} 
                placeholder="What core problem are you solving? (Max 200 words)" maxLength={1000} />
              <p className={styles.charCount}>{formData.problemStatement.length} chars</p>
              {errors.problemStatement && <p className={styles.errorText}>{errors.problemStatement}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Solution Description</label>
              <textarea name="solutionDescription" value={formData.solutionDescription} onChange={handleInputChange} 
                className={styles.textarea} placeholder="How does your product solve this?" />
            </div>
          </div>
        )}

        {/* STEP 3: Market & Team */}
        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Market & Team</h2>
              <p className={styles.stepSubtitle}>Define your opportunity</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Target Customers</label>
              <input type="text" name="targetCustomers" value={formData.targetCustomers} onChange={handleInputChange} 
                className={styles.input} placeholder="e.g., Gen Z, SMEs, Enterprise" />
            </div>

            <div className={styles.twoColumnGrid}>
               <div className={styles.formGroup}>
                <label className={styles.label}>Expected Revenue</label>
                <input type="text" name="revenue" value={formData.revenue} onChange={handleInputChange} 
                  className={styles.input} placeholder="e.g. $500k ARR" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Team Size</label>
                <input type="number" name="teamSize" value={formData.teamSize} onChange={handleInputChange} 
                  className={styles.input} placeholder="e.g. 5" min="1" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Documents */}
        {currentStep === 4 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Verification</h2>
              <p className={styles.stepSubtitle}>Upload documents for AI scoring</p>
            </div>

            <FileUpload 
              label="Pitch Deck (Required)" 
              required 
              onFileSelect={(f) => handleFileSelect('pitchDeck', f)} 
              error={errors.pitchDeck} 
            />

            <FileUpload 
              label="Business Plan (Optional)" 
              onFileSelect={(f) => handleFileSelect('businessPlan', f)} 
            />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.cardFooter}>
        <button onClick={currentStep === 1 ? onBack : handlePrevious} className={styles.secondaryButton}>
          <ChevronLeft size={20} />
          <span>{currentStep === 1 ? 'Back' : 'Previous'}</span>
        </button>
        
        <button onClick={currentStep === 4 ? handleSubmit : handleNext} className={styles.primaryButton}>
          <span>{currentStep === 4 ? 'Complete Registration' : 'Next Step'}</span>
          {currentStep !== 4 && <ChevronRight size={20} />}
        </button>
      </div>

    </div>
  );
}

export default StartupRegisterForm;