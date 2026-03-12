import React, { useState } from 'react';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import styles from './ProjectSubmissionForm.module.css';
import projectSubmissionService from '../../services/projectSubmissionService';

/**
 * ProjectSubmissionForm - Form for submitting new startup projects
 * Improved with professional styling and theme support.
 */
export default function ProjectSubmissionForm({ onClose, onSuccess, user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    projectName: '',
    shortDescription: '',
    developmentStage: '',
    problemStatement: '',
    solutionDescription: '',
    targetCustomers: '',
    uniqueValueProposition: '',
    marketSize: '',
    businessModel: '',
    revenue: '',
    competitors: '',
    teamMembers: [{ name: '', role: '' }],
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

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', role: '' }]
    }));
  };

  const removeTeamMember = (index) => {
    if (formData.teamMembers.length <= 1) return;
    const newMembers = [...formData.teamMembers];
    newMembers.splice(index, 1);
    setFormData(prev => ({ ...prev, teamMembers: newMembers }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index][field] = value;
    setFormData(prev => ({ ...prev, teamMembers: newMembers }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.projectName.trim()) newErrors.projectName = 'Tên dự án là bắt buộc';
      if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Mô tả ngắn là bắt buộc';
      if (formData.developmentStage === '') newErrors.developmentStage = 'Vui lòng chọn giai đoạn phát triển';
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
      const hasEmptyMembers = formData.teamMembers.some(m => !m.name.trim() || !m.role.trim());
      if (hasEmptyMembers) newErrors.teamMembers = 'Vui lòng nhập đầy đủ tên và vai trò thành viên';
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
        teamMembers: formData.teamMembers
          .map(m => `${m.name.trim()} (${m.role.trim()})`)
          .join(', '),
      };

      const response = await projectSubmissionService.submitStartupInfo(payload);

      if (response && response.success) {
        onSuccess?.(formData);
        onClose();
      } else {
        setSubmitError(response?.message || 'Lỗi khi gửi dự án. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setSubmitError(error?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      if (error?.errors) {
        setErrors(prev => ({ ...prev, api: error.errors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.headerTitle}>Đăng Dự Án</h2>
            <p className={styles.headerSubtitle}>Bước {currentStep} của {totalSteps}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBarTrack}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
          />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className={styles.formContent}>
        {submitError && (
            <div className={styles.errorBanner}>
              <div className={styles.errorHeader}>
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
              {errors.api && errors.api.length > 0 && (
                <ul className={styles.errorList}>
                  {errors.api.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 1: Basic Project Info */}
          {currentStep === 1 && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tên Dự Án <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ví dụ: AI Smart Assistant"
                />
                {errors.projectName && <span className={styles.errorText}>{errors.projectName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mô Tả Ngắn <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Mô tả tóm tắt dự án của bạn"
                  rows={2}
                />
                {errors.shortDescription && <span className={styles.errorText}>{errors.shortDescription}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Giai Đoạn Phát Triển <span className={styles.required}>*</span>
                </label>
                <select
                  name="developmentStage"
                  value={formData.developmentStage}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="" disabled>Chọn giai đoạn...</option>
                  <option value="0">Ý tưởng (Idea)</option>
                  <option value="1">MVP</option>
                  <option value="2">Vận hành (Growth)</option>
                </select>
                {errors.developmentStage && <span className={styles.errorText}>{errors.developmentStage}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Vấn Đề Cần Giải Quyết <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Vấn đề lớn nhất mà startup của bạn đang giải quyết là gì?"
                  rows={3}
                />
                {errors.problemStatement && <span className={styles.errorText}>{errors.problemStatement}</span>}
              </div>
            </>
          )}

          {/* Step 2: Solution & Market */}
          {currentStep === 2 && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mô Tả Giải Pháp <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="solutionDescription"
                  value={formData.solutionDescription}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Giải pháp của bạn hoạt động như thế nào?"
                  rows={2}
                />
                {errors.solutionDescription && <span className={styles.errorText}>{errors.solutionDescription}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Khách Hàng Mục Tiêu <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="targetCustomers"
                  value={formData.targetCustomers}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Ai là người sẽ trả tiền cho giải pháp của bạn?"
                  rows={2}
                />
                {errors.targetCustomers && <span className={styles.errorText}>{errors.targetCustomers}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Giá Trị Độc Đáo (UVP) <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="uniqueValueProposition"
                  value={formData.uniqueValueProposition}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Tại sao khách hàng chọn bạn thay vì đối thủ?"
                  rows={2}
                />
                {errors.uniqueValueProposition && <span className={styles.errorText}>{errors.uniqueValueProposition}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kích Thước Thị Trường (VND)</label>
                  <input
                    type="number"
                    name="marketSize"
                    value={formData.marketSize}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Doanh Thu (VND)</label>
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mô Hình Kinh Doanh <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="businessModel"
                  value={formData.businessModel}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Bạn dự định kiếm tiền như thế nào?"
                  rows={2}
                />
                {errors.businessModel && <span className={styles.errorText}>{errors.businessModel}</span>}
              </div>
            </>
          )}

          {/* Step 3: Competition & Team */}
          {currentStep === 3 && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Đối Thủ Cạnh Tranh <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="competitors"
                  value={formData.competitors}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Liệt kê các đối thủ chính của bạn"
                  rows={2}
                />
                {errors.competitors && <span className={styles.errorText}>{errors.competitors}</span>}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>
                    Thành Viên Đội <span className={styles.required}>*</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={addTeamMember}
                    className={styles.addMemberBtn}
                  >
                    <Plus size={14} /> Thêm người
                  </button>
                </div>
                
                <div className={styles.membersList}>
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className={styles.memberRow}>
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Vai trò (VD: CEO, CTO)"
                        value={member.role}
                        onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                        className={styles.input}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeTeamMember(index)}
                        className={styles.removeMemberBtn}
                        disabled={formData.teamMembers.length <= 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.teamMembers && <span className={styles.errorText}>{errors.teamMembers}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Kỹ Năng Cốt Lõi Của Đội Ngũ <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="keySkills"
                  value={formData.keySkills}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ví dụ: AI, Machine Learning, Quản lý chuỗi cung ứng..."
                />
                <span className={styles.hintText}>Tập trung vào các kỹ năng chuyên môn giúp startup thành công.</span>
                {errors.keySkills && <span className={styles.errorText}>{errors.keySkills}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Kinh Nghiệm Đội <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="teamExperience"
                  value={formData.teamExperience}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Các dự án hoặc kinh nghiệm thành công trước đây"
                  rows={3}
                />
                {errors.teamExperience && <span className={styles.errorText}>{errors.teamExperience}</span>}
              </div>
            </>
          )}
        </form>

        {/* Actions Footer */}
        <div className={styles.actions}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className={styles.secondaryBtn}
            >
              Quay lại
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className={styles.primaryBtn}
            >
              Tiếp theo
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={styles.successBtn}
            >
              {isSubmitting ? '⏳ Đang gửi...' : 'Gửi Dự Án'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
