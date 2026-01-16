import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import styles from './RegisterForms.module.css';

function AdvisorRegisterForm({ onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '',          // ADDED
    phone: '',          // ADDED
    professionalTitle: '', 
    linkedinUrl: '',    // ADDED
    bio: '', 
    skills: [], 
    cv: null, 
    certifications: null,
  });
  const [errors, setErrors] = useState({});
  const availableSkills = ['Legal', 'Marketing', 'Technical', 'Fundraising', 'Product', 'Operations', 'Finance', 'HR', 'Sales'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleToggleSkill = (skill) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleFileSelect = (field, file) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (field === 'cv' && errors.cv) setErrors((prev) => ({ ...prev, cv: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full Name is required';
      if (!formData.email) newErrors.email = 'Email address is required';
      if (!formData.professionalTitle) newErrors.professionalTitle = 'Professional Title is required';
      if (!formData.bio) newErrors.bio = 'Bio is required';
    }
    if (currentStep === 2) {
      if (!formData.cv) newErrors.cv = 'CV/Resume is required';
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
              <h2 className={styles.stepTitle}>Expertise & Bio</h2>
              <p className={styles.stepSubtitle}>Highlight your professional experience and contact details</p>
            </div>

            {/* Contact Details */}
            <div className={styles.twoColumnGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`} placeholder="Jane Smith" />
                {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="jane@expert.com" />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
            </div>

             <div className={styles.twoColumnGrid}>
               <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className={styles.input} placeholder="+1 (555) 000-0000" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>LinkedIn URL</label>
                <input type="text" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange}
                  className={styles.input} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Professional Title <span className={styles.required}>*</span></label>
              <input type="text" name="professionalTitle" value={formData.professionalTitle} onChange={handleInputChange}
                className={`${styles.input} ${errors.professionalTitle ? styles.inputError : ''}`} placeholder="e.g. Senior Product Manager" />
              {errors.professionalTitle && <p className={styles.errorText}>{errors.professionalTitle}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio / Summary <span className={styles.required}>*</span></label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange}
                className={`${styles.textarea} ${errors.bio ? styles.inputError : ''}`}
                placeholder="Briefly describe your experience..." />
              {errors.bio && <p className={styles.errorText}>{errors.bio}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Key Skills</label>
              <div className={styles.tagGroup}>
                {availableSkills.map((skill) => (
                  <button key={skill} type="button" className={`${styles.tag} ${formData.skills.includes(skill) ? styles.tagActive : ''}`}
                    onClick={() => handleToggleSkill(skill)}>{skill}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>Credentials</h2>
              <p className={styles.stepSubtitle}>Verify your professional background</p>
            </div>
            <FileUpload label="CV / Resume (Required)" required onFileSelect={(file) => handleFileSelect('cv', file)} error={errors.cv} />
            <FileUpload label="Certifications (Optional)" onFileSelect={(file) => handleFileSelect('certifications', file)} />
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

export default AdvisorRegisterForm;