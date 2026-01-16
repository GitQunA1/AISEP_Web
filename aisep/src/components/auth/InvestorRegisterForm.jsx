import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import styles from './RegisterForms.module.css';

function InvestorRegisterForm({ onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '',          // ADDED
    phone: '',          // ADDED
    organizationName: '', 
    linkedinUrl: '', 
    website: '',        // ADDED
    industries: [], 
    stages: [], 
    verificationDocument: null,
  });
  
  const [errors, setErrors] = useState({});
  const industries = ['Fintech', 'HealthTech', 'EduTech', 'E-commerce', 'SaaS', 'AI/ML', 'Blockchain'];
  const stages = ['Idea', 'MVP', 'Growth', 'Scaling'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleToggleSelection = (field, item) => {
    setFormData((prev) => {
      const list = prev[field];
      const newList = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
      return { ...prev, [field]: newList };
    });
  };

  const handleFileSelect = (file) => {
    setFormData((prev) => ({ ...prev, verificationDocument: file }));
    if (errors.verificationDocument) setErrors((prev) => ({ ...prev, verificationDocument: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full Name is required';
      if (!formData.email) newErrors.email = 'Email address is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (formData.industries.length === 0) newErrors.industries = 'Select at least one industry';
    }
    if (currentStep === 2) {
      if (!formData.verificationDocument) newErrors.verificationDocument = 'Verification document is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setCurrentStep((prev) => prev + 1); };
  const handlePrevious = () => { setCurrentStep((prev) => prev - 1); };
  const handleSubmit = () => { if (validateStep()) onComplete && onComplete(formData); };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(currentStep / 2) * 100}%` }} />
        </div>
        <p className={styles.stepIndicator}>Step {currentStep} of 2</p>
      </div>

      <div className={styles.cardBody}>
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Your Profile</h2>
              <p className={styles.stepSubtitle}>Tell us about your investment background and contact details</p>
            </div>
            
            {/* Contact Information Section */}
            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`} placeholder="John Doe" />
                {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="john@vc.com" />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
            </div>

            <div className={styles.twoColumnGrid}>
               <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} placeholder="+1 (555) 000-0000" />
                {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
              </div>
               <div className={styles.formGroup}>
                <label className={styles.label}>Organization / Fund Name</label>
                <input type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange}
                  className={styles.input} placeholder="e.g., Venture Fund XYZ" />
              </div>
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>LinkedIn URL</label>
                <input type="text" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange}
                  className={styles.input} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Website</label>
                <input type="text" name="website" value={formData.website} onChange={handleInputChange}
                  className={styles.input} placeholder="https://yourfund.com" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Interested Industries <span className={styles.required}>*</span></label>
              <div className={styles.pillGroup}>
                {industries.map((item) => (
                  <button key={item} type="button" className={`${styles.pill} ${formData.industries.includes(item) ? styles.pillActive : ''}`}
                    onClick={() => handleToggleSelection('industries', item)}>{item}</button>
                ))}
              </div>
              {errors.industries && <p className={styles.errorText}>{errors.industries}</p>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Preferred Investment Stages</label>
              <div className={styles.pillGroup}>
                {stages.map((item) => (
                  <button key={item} type="button" className={`${styles.pill} ${formData.stages.includes(item) ? styles.pillActive : ''}`}
                    onClick={() => handleToggleSelection('stages', item)}>{item}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Identity Verification</h2>
              <p className={styles.stepSubtitle}>To ensure platform integrity, we require verification</p>
            </div>
            <div className={styles.kycInfo}>
              <p>Please upload a valid government-issued ID or business registration document to verify your accredited investor status.</p>
            </div>
            <FileUpload label="ID / Business License (Required)" required onFileSelect={handleFileSelect} error={errors.verificationDocument} />
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <button onClick={currentStep === 1 ? onBack : handlePrevious} className={styles.secondaryButton}>
          <ChevronLeft size={20} />
          <span>{currentStep === 1 ? 'Back' : 'Previous'}</span>
        </button>
        <button onClick={currentStep === 2 ? handleSubmit : handleNext} className={styles.primaryButton}>
          <span>{currentStep === 2 ? 'Complete Registration' : 'Next Step'}</span>
          {currentStep !== 2 && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}

export default InvestorRegisterForm;