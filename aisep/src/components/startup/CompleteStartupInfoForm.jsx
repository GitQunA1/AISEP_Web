import { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import styles from './CompleteStartupInfoForm.module.css';

export default function CompleteStartupInfoForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    // A. Basic Info
    startupName: '',
    logo: null,
    logoPreview: null,
    founders: '',
    contactEmail: '',
    country: '',
    city: '',
    website: '',

    // B. Business Info
    industry: '',
    stage: 'idea',
    problemStatement: '',
    solutionDescription: '',
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
    pitchDeckName: '',
    businessPlan: null,
    businessPlanName: '',
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [fieldName === 'pitchDeck' ? 'pitchDeckName' : 'businessPlanName']: file.name
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.startupName.trim()) newErrors.startupName = 'Startup name is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.founders.trim()) newErrors.founders = 'Founder(s) is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Problem statement is required';
    if (!formData.solutionDescription.trim()) newErrors.solutionDescription = 'Solution description is required';
    if (!formData.pitchDeck) newErrors.pitchDeck = 'Pitch deck is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const SectionButton = ({ id, label, icon }) => (
    <button
      type="button"
      onClick={() => setActiveSection(id)}
      className={`${styles.sectionBtn} ${activeSection === id ? styles.active : ''}`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Complete Startup Information</h2>
        <p>Fill in all required information for your startup profile</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Section Navigation */}
        <div className={styles.sectionNav}>
          <SectionButton id="basic" label="A. Basic Info" icon="📋" />
          <SectionButton id="business" label="B. Business Info" icon="💼" />
          <SectionButton id="market" label="C. Market & Model" icon="📊" />
          <SectionButton id="team" label="D. Team" icon="👥" />
          <SectionButton id="documents" label="E. Documents" icon="📄" />
        </div>

        {/* Form Sections */}
        <div className={styles.formContent}>

          {/* A. Basic Info */}
          {activeSection === 'basic' && (
            <div className={styles.section}>
              <h3>A. Basic Information (REQUIRED)</h3>

              <div className={styles.formGroup}>
                <label>Startup Name *</label>
                <input
                  type="text"
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleInputChange}
                  placeholder="Your startup name"
                  className={errors.startupName ? styles.error : ''}
                />
                {errors.startupName && <span className={styles.errorMsg}>{errors.startupName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Logo</label>
                <div className={styles.logoUpload}>
                  {formData.logoPreview ? (
                    <div className={styles.logoPreview}>
                      <img src={formData.logoPreview} alt="Logo preview" />
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => setFormData(prev => ({ ...prev, logo: null, logoPreview: null }))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadArea}>
                      <Upload size={24} />
                      <span>Upload logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                    </label>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Founder(s) *</label>
                <input
                  type="text"
                  name="founders"
                  value={formData.founders}
                  onChange={handleInputChange}
                  placeholder="Full name(s) of founder(s)"
                  className={errors.founders ? styles.error : ''}
                />
                {errors.founders && <span className={styles.errorMsg}>{errors.founders}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="contact@startup.com"
                  className={errors.contactEmail ? styles.error : ''}
                />
                {errors.contactEmail && <span className={styles.errorMsg}>{errors.contactEmail}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., Vietnam"
                    className={errors.country ? styles.error : ''}
                  />
                  {errors.country && <span className={styles.errorMsg}>{errors.country}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Ho Chi Minh City"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Website (if available)</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* B. Business Info */}
          {activeSection === 'business' && (
            <div className={styles.section}>
              <h3>B. Business Information (IMPORTANT)</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Industry / Sector *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className={errors.industry ? styles.error : ''}
                  >
                    <option value="">Select industry</option>
                    <option value="AI/ML">AI/Machine Learning</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="EdTech">EdTech</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="SaaS">SaaS</option>
                    <option value="IoT">IoT</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && <span className={styles.errorMsg}>{errors.industry}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Stage *</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                  >
                    <option value="idea">Idea Stage</option>
                    <option value="prototype">Prototype</option>
                    <option value="mvp">MVP (Minimum Viable Product)</option>
                    <option value="growth">Growth Stage</option>
                    <option value="scale">Scale Stage</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Problem Statement *</label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  placeholder="What problem are you solving? Who has this problem?"
                  rows={4}
                  className={errors.problemStatement ? styles.error : ''}
                />
                {errors.problemStatement && <span className={styles.errorMsg}>{errors.problemStatement}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Solution Description *</label>
                <textarea
                  name="solutionDescription"
                  value={formData.solutionDescription}
                  onChange={handleInputChange}
                  placeholder="How does your solution work? What makes it unique?"
                  rows={4}
                  className={errors.solutionDescription ? styles.error : ''}
                />
                {errors.solutionDescription && <span className={styles.errorMsg}>{errors.solutionDescription}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Target Customers</label>
                <input
                  type="text"
                  name="targetCustomers"
                  value={formData.targetCustomers}
                  onChange={handleInputChange}
                  placeholder="Who are your primary target customers?"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Unique Value Proposition</label>
                <textarea
                  name="uniqueValueProposition"
                  value={formData.uniqueValueProposition}
                  onChange={handleInputChange}
                  placeholder="What makes your solution different from competitors?"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* C. Market & Model */}
          {activeSection === 'market' && (
            <div className={styles.section}>
              <h3>C. Market & Business Model</h3>

              <div className={styles.formGroup}>
                <label>Market Size (estimate)</label>
                <input
                  type="text"
                  name="marketSize"
                  value={formData.marketSize}
                  onChange={handleInputChange}
                  placeholder="e.g., $5 billion TAM in Asia"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Business Model</label>
                <textarea
                  name="businessModel"
                  value={formData.businessModel}
                  onChange={handleInputChange}
                  placeholder="How do you make money? (e.g., SaaS subscription, commission, licensing)"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Current Revenue (if any)</label>
                <input
                  type="text"
                  name="currentRevenue"
                  value={formData.currentRevenue}
                  onChange={handleInputChange}
                  placeholder="e.g., $0, $50k/month, $1M/year"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Competitors & Market Positioning</label>
                <textarea
                  name="competitors"
                  value={formData.competitors}
                  onChange={handleInputChange}
                  placeholder="Who are your main competitors and how do you differentiate?"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* D. Team */}
          {activeSection === 'team' && (
            <div className={styles.section}>
              <h3>D. Team Information</h3>

              <div className={styles.formGroup}>
                <label>Team Members</label>
                <textarea
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleInputChange}
                  placeholder="List team members and their roles (e.g., John - CEO, Sarah - CTO)"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Key Skills</label>
                <textarea
                  name="keySkills"
                  value={formData.keySkills}
                  onChange={handleInputChange}
                  placeholder="What are the key skills your team possesses? (e.g., AI/ML, sales, operations)"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Relevant Experience</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Previous experience of key team members (e.g., worked at Google, founded 2 startups)"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* E. Documents */}
          {activeSection === 'documents' && (
            <div className={styles.section}>
              <h3>E. Documents & Materials</h3>

              <div className={styles.alert}>
                <AlertCircle size={20} />
                <span>Pitch Deck is required. Business Plan is encouraged.</span>
              </div>

              <div className={styles.formGroup}>
                <label>Pitch Deck (PDF/PPT) *</label>
                <div className={styles.fileUpload}>
                  {formData.pitchDeck ? (
                    <div className={styles.fileItem}>
                      <span>📄 {formData.pitchDeckName}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => setFormData(prev => ({ ...prev, pitchDeck: null, pitchDeckName: '' }))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadArea}>
                      <Upload size={24} />
                      <span>Upload Pitch Deck</span>
                      <small>(PDF, PPT, PPTX)</small>
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={(e) => handleFileUpload(e, 'pitchDeck')}
                        hidden
                      />
                    </label>
                  )}
                </div>
                {errors.pitchDeck && <span className={styles.errorMsg}>{errors.pitchDeck}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Business Plan (PDF/DOCX) - Encouraged</label>
                <div className={styles.fileUpload}>
                  {formData.businessPlan ? (
                    <div className={styles.fileItem}>
                      <span>📄 {formData.businessPlanName}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => setFormData(prev => ({ ...prev, businessPlan: null, businessPlanName: '' }))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadArea}>
                      <Upload size={24} />
                      <span>Upload Business Plan</span>
                      <small>(PDF, DOCX)</small>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'businessPlan')}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Save Complete Information
          </button>
        </div>
      </form>
    </div>
  );
}
