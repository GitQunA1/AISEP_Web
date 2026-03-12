import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from '../auth/RegisterForms.module.css';
import projectSubmissionService from '../../services/projectSubmissionService';

/**
 * ProjectSubmissionForm - Form for submitting new startup projects
 * 13 fields: projectName, shortDescription, developmentStage, problemStatement, 
 * solutionDescription, targetCustomers, uniqueValueProposition, marketSize, 
 * businessModel, revenue, competitors, teamMembers, keySkills, teamExperience
 */
export default function ProjectSubmissionForm({ onClose, onSuccess, user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    projectName: '',
    shortDescription: '',
    developmentStage: 0,
    problemStatement: '',
    solutionDescription: '',
    targetCustomers: '',
    uniqueValueProposition: '',
    marketSize: 0,
    businessModel: '',
    revenue: 0,
    competitors: '',
    teamMembers: '',
    keySkills: '',
    teamExperience: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.projectName.trim()) newErrors.projectName = 'Tên dự án là bắt buộc';
      if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Mô tả ngắn là bắt buộc';
      if (!formData.developmentStage) newErrors.developmentStage = 'Vui lòng chọn giai đoạn phát triển';
      if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Mô tả vấn đề là bắt buộc';
    }

    if (currentStep === 2) {
      if (!formData.solutionDescription.trim()) newErrors.solutionDescription = 'Mô tả giải pháp là bắt buộc';
      if (!formData.targetCustomers.trim()) newErrors.targetCustomers = 'Mô tả khách hàng mục tiêu là bắt buộc';
      if (!formData.uniqueValueProposition.trim()) newErrors.uniqueValueProposition = 'Mô tả giá trị độc đáo là bắt buộc';
      if (!formData.businessModel.trim()) newErrors.businessModel = 'Mô tả mô hình kinh doanh là bắt buộc';
    }

    if (currentStep === 3) {
      if (!formData.competitors.trim()) newErrors.competitors = 'Mô tả đối thủ cạnh tranh là bắt buộc';
      if (!formData.teamMembers.trim()) newErrors.teamMembers = 'Mô tả thành viên đội là bắt buộc';
      if (!formData.keySkills.trim()) newErrors.keySkills = 'Kỹ năng chính là bắt buộc';
      if (!formData.teamExperience.trim()) newErrors.teamExperience = 'Kinh nghiệm đội là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        developmentStage: parseInt(formData.developmentStage),
        marketSize: parseInt(formData.marketSize) || 0,
        revenue: parseInt(formData.revenue) || 0,
      };

      const response = await projectSubmissionService.submitStartupInfo(payload);

      if (response && response.isSuccess) {
        onSuccess?.(formData);
        onClose();
      } else {
        setSubmitError(response?.message || 'Lỗi khi gửi dự án. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setSubmitError(error?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          background: 'white'
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              Đăng Dự Án
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Bước {currentStep}/{totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '3px',
          background: '#f3f4f6',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            background: '#3b82f6',
            width: `${(currentStep / totalSteps) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {submitError && (
            <div style={{
              padding: '12px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              color: '#c33',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {submitError}
            </div>
          )}

          {/* Step 1: Basic Project Info */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Tên Dự Án <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Tên dự án của bạn"
                  style={{ width: '100%' }}
                />
                {errors.projectName && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.projectName}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Mô Tả Ngắn <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Mô tả ngắn về dự án của bạn (1-2 dòng)"
                  rows={3}
                  style={{ width: '100%' }}
                />
                {errors.shortDescription && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.shortDescription}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Giai Đoạn Phát Triển <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="developmentStage"
                  value={formData.developmentStage}
                  onChange={handleInputChange}
                  className={styles.select}
                  style={{ width: '100%' }}
                >
                  <option value="0">Chọn giai đoạn</option>
                  <option value="1">Ý tưởng (Idea)</option>
                  <option value="2">MVP</option>
                  <option value="3">Beta</option>
                  <option value="4">Vận hành (Production)</option>
                </select>
                {errors.developmentStage && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.developmentStage}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Vấn Đề Cần Giải Quyết <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Mô tả vấn đề mà dự án giải quyết"
                  rows={3}
                  style={{ width: '100%' }}
                />
                {errors.problemStatement && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.problemStatement}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Solution & Market */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Mô Tả Giải Pháp <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="solutionDescription"
                  value={formData.solutionDescription}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Giải pháp của bạn giải quyết vấn đề như thế nào?"
                  rows={3}
                  style={{ width: '100%' }}
                />
                {errors.solutionDescription && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.solutionDescription}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Khách Hàng Mục Tiêu <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="targetCustomers"
                  value={formData.targetCustomers}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Ai là khách hàng lý tưởng của bạn?"
                  rows={2}
                  style={{ width: '100%' }}
                />
                {errors.targetCustomers && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.targetCustomers}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Giá Trị Độc Đáo (UVP) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="uniqueValueProposition"
                  value={formData.uniqueValueProposition}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Điều gì làm cho dự án này khác biệt?"
                  rows={2}
                  style={{ width: '100%' }}
                />
                {errors.uniqueValueProposition && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.uniqueValueProposition}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Kích Thước Thị Trường (USD)
                  </label>
                  <input
                    type="number"
                    name="marketSize"
                    value={formData.marketSize}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="0"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Doanh Thu (USD)
                  </label>
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="0"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Mô Hình Kinh Doanh <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="businessModel"
                  value={formData.businessModel}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Bạn kiếm tiền như thế nào?"
                  rows={2}
                  style={{ width: '100%' }}
                />
                {errors.businessModel && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.businessModel}</span>}
              </div>
            </div>
          )}

          {/* Step 3: Competition & Team */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Đối Thủ Cạnh Tranh <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="competitors"
                  value={formData.competitors}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Ai là đối thủ cạnh tranh chính?"
                  rows={3}
                  style={{ width: '100%' }}
                />
                {errors.competitors && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.competitors}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Thành Viên Đội <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Liệt kê thành viên đội và vai trò của họ"
                  rows={3}
                  style={{ width: '100%' }}
                />
                {errors.teamMembers && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.teamMembers}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Kỹ Năng Chính <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="keySkills"
                  value={formData.keySkills}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ví dụ: AI, Blockchain, Mobile Dev"
                  style={{ width: '100%' }}
                />
                {errors.keySkills && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.keySkills}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Kinh Nghiệm Đội <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="teamExperience"
                  value={formData.teamExperience}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Kinh nghiệm liên quan của đội"
                  rows={3}
                  style={{ width: '100%' }}
                />
                {errors.teamExperience && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.teamExperience}</span>}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              >
                Quay lại
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: 'white'
                }}
              >
                Tiếp theo
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: isSubmitting ? '#9ca3af' : '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: 'white',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? '⏳ Đang gửi...' : '✅ Gửi Dự Án'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
