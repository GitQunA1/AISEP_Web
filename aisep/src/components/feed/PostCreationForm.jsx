import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './PostCreationForm.module.css';

/**
 * PostCreationForm Component - Form for startups to create posts
 * @param {function} onClose - Callback when closing the form
 * @param {function} onSubmit - Callback when submitting the form
 * @param {object} user - User object with startup info
 */
function PostCreationForm({ onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    tagline: '',
    industry: '',
    stage: '',
    problemStatement: '',
    solution: '',
    targetMarket: '',
    teamSize: '',
    fundingStage: '',
    fundingAmount: '',
    currentRevenue: '',
    monthlyBurn: '',
    website: '',
    videoLink: '',
    keyFeatures: '',
  });

  const [errors, setErrors] = useState({});

  const industries = [
    'AI/ML',
    'Fintech',
    'Healthtech',
    'EdTech',
    'E-commerce',
    'SaaS',
    'Logistics',
    'Real Estate',
    'Climate Tech',
    'Other'
  ];

  const stages = [
    'Idea',
    'MVP',
    'Early Traction',
    'Growth',
    'Series A',
    'Series B+',
    'Mature'
  ];

  const fundingStages = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Not Raising'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.tagline.trim()) {
      newErrors.tagline = 'Tagline is required';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.stage) {
      newErrors.stage = 'Stage is required';
    }
    if (!formData.problemStatement.trim()) {
      newErrors.problemStatement = 'Problem statement is required';
    }
    if (!formData.solution.trim()) {
      newErrors.solution = 'Solution is required';
    }
    if (!formData.targetMarket.trim()) {
      newErrors.targetMarket = 'Target market is required';
    }
    if (!formData.teamSize.trim()) {
      newErrors.teamSize = 'Team size is required';
    }
    if (!formData.fundingStage) {
      newErrors.fundingStage = 'Funding stage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const postData = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdBy: user?.name || 'Unknown',
        createdAt: new Date().toISOString(),
        logo: user?.logo || '',
        username: user?.username || 'startup',
        aiScore: Math.floor(Math.random() * 40) + 60,
      };
      onSubmit(postData);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Post Your Project</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollContainer}>
            {/* Basic Information Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Basic Information</h3>

              <div className={styles.formGroup}>
                <label htmlFor="projectName">Project Name *</label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter your project name"
                  className={errors.projectName ? styles.inputError : ''}
                />
                {errors.projectName && (
                  <span className={styles.error}>{errors.projectName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tagline">Tagline *</label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  placeholder="Brief project description (max 80 characters)"
                  maxLength="80"
                  className={errors.tagline ? styles.inputError : ''}
                />
                {errors.tagline && (
                  <span className={styles.error}>{errors.tagline}</span>
                )}
              </div>

              <div className={styles.twoColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="industry">Industry *</label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className={errors.industry ? styles.inputError : ''}
                  >
                    <option value="">Select industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <span className={styles.error}>{errors.industry}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="stage">Stage *</label>
                  <select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className={errors.stage ? styles.inputError : ''}
                  >
                    <option value="">Select stage</option>
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.stage && (
                    <span className={styles.error}>{errors.stage}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Problem & Solution Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💡 Problem & Solution</h3>

              <div className={styles.formGroup}>
                <label htmlFor="problemStatement">Problem Statement *</label>
                <textarea
                  id="problemStatement"
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  placeholder="Describe the problem your project solves"
                  rows="3"
                  className={errors.problemStatement ? styles.inputError : ''}
                />
                {errors.problemStatement && (
                  <span className={styles.error}>{errors.problemStatement}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="solution">Your Solution *</label>
                <textarea
                  id="solution"
                  name="solution"
                  value={formData.solution}
                  onChange={handleInputChange}
                  placeholder="Describe your solution and approach"
                  rows="3"
                  className={errors.solution ? styles.inputError : ''}
                />
                {errors.solution && (
                  <span className={styles.error}>{errors.solution}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="keyFeatures">Key Features</label>
                <textarea
                  id="keyFeatures"
                  name="keyFeatures"
                  value={formData.keyFeatures}
                  onChange={handleInputChange}
                  placeholder="List key features (one per line)"
                  rows="3"
                />
              </div>
            </div>

            {/* Market Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🎯 Market & Team</h3>

              <div className={styles.formGroup}>
                <label htmlFor="targetMarket">Target Market *</label>
                <textarea
                  id="targetMarket"
                  name="targetMarket"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  placeholder="Describe your target market"
                  rows="2"
                  className={errors.targetMarket ? styles.inputError : ''}
                />
                {errors.targetMarket && (
                  <span className={styles.error}>{errors.targetMarket}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="teamSize">Team Size *</label>
                <input
                  type="text"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  placeholder="E.g. 5 people (Founder, 2 Dev, 1 Designer, 1 PM)"
                  className={errors.teamSize ? styles.inputError : ''}
                />
                {errors.teamSize && (
                  <span className={styles.error}>{errors.teamSize}</span>
                )}
              </div>
            </div>

            {/* Financial Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💰 Financial Information</h3>

              <div className={styles.twoColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="fundingStage">Funding Stage *</label>
                  <select
                    id="fundingStage"
                    name="fundingStage"
                    value={formData.fundingStage}
                    onChange={handleInputChange}
                    className={errors.fundingStage ? styles.inputError : ''}
                  >
                    <option value="">Select stage</option>
                    {fundingStages.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {errors.fundingStage && (
                    <span className={styles.error}>{errors.fundingStage}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="fundingAmount">Funding Amount (Optional)</label>
                  <input
                    type="text"
                    id="fundingAmount"
                    name="fundingAmount"
                    value={formData.fundingAmount}
                    onChange={handleInputChange}
                    placeholder="E.g. $500K - $1M"
                  />
                </div>
              </div>

              <div className={styles.twoColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentRevenue">Current Revenue (Optional)</label>
                  <input
                    type="text"
                    id="currentRevenue"
                    name="currentRevenue"
                    value={formData.currentRevenue}
                    onChange={handleInputChange}
                    placeholder="E.g. $50K/month or $0 (none)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="monthlyBurn">Monthly Burn Rate (Optional)</label>
                  <input
                    type="text"
                    id="monthlyBurn"
                    name="monthlyBurn"
                    value={formData.monthlyBurn}
                    onChange={handleInputChange}
                    placeholder="E.g. $10K/month"
                  />
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🔗 Links</h3>

              <div className={styles.formGroup}>
                <label htmlFor="website">Website (Optional)</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="videoLink">Video Pitch (Optional)</label>
                <input
                  type="url"
                  id="videoLink"
                  name="videoLink"
                  onChange={handleInputChange}
                  value={formData.videoLink}
                  placeholder="https://youtube.com/... or https://vimeo.com/..."
                />
              </div>
            </div>

            {/* Description Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📝 Full Description</h3>

              <div className={styles.formGroup}>
                <label htmlFor="description">Full Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of your project, vision, and future plans"
                  rows="4"
                  className={errors.description ? styles.inputError : ''}
                />
                {errors.description && (
                  <span className={styles.error}>{errors.description}</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostCreationForm;
