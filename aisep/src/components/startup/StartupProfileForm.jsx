import React, { useState, useEffect } from 'react';
import styles from '../auth/RegisterForms.module.css';
import startupProfileService from '../../services/startupProfileService';

/**
 * StartupProfileForm - Form for updating startup profile information
 * Fields: companyName, logoUrl, founder, contactInfo, countryCity, website, industry, businessLicenseUrl
 */
export default function StartupProfileForm({ initialData, user, onSuccess }) {
  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    founder: '',
    contactInfo: '',
    countryCity: '',
    website: '',
    industry: 0,
    businessLicenseUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Pre-populate form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        logoUrl: initialData.logoUrl || '',
        founder: initialData.founder || '',
        contactInfo: initialData.contactInfo || '',
        countryCity: initialData.countryCity || '',
        website: initialData.website || '',
        industry: initialData.industry || 0,
        businessLicenseUrl: initialData.businessLicenseUrl || '',
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Tên công ty là bắt buộc';
    if (!formData.founder.trim()) newErrors.founder = 'Tên người sáng lập là bắt buộc';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Thông tin liên hệ là bắt buộc';
    if (!formData.countryCity.trim()) newErrors.countryCity = 'Địa phương là bắt buộc';
    if (!formData.website.trim()) newErrors.website = 'Website là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await startupProfileService.updateStartupProfile(formData);
      
      if (response && response.isSuccess) {
        setSuccessMessage('✅ Thông tin startup đã được cập nhật thành công!');
        if (onSuccess) {
          onSuccess(formData);
        }
      } else {
        setErrors({ submit: response?.message || 'Cập nhật thất bại. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error?.message || 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card} style={{ padding: '24px' }}>
      <h3 className={styles.cardTitle}>Thông tin Startup</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        Cập nhật thông tin công ty để nhà đầu tư và cố vấn hiểu rõ hơn về doanh nghiệp của bạn.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Error Message */}
        {errors.submit && (
          <div style={{
            padding: '12px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            color: '#c33',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {errors.submit}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '12px',
            background: '#efe',
            border: '1px solid #cfc',
            borderRadius: '6px',
            color: '#3c3',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {successMessage}
          </div>
        )}

        {/* Row 1: Company Name & Founder */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên công ty <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
              placeholder="Ví dụ: TechStartup Vietnam"
            />
            {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Người sáng lập <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="founder"
              value={formData.founder}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.founder ? styles.inputError : ''}`}
              placeholder="Tên người sáng lập"
            />
            {errors.founder && <span className={styles.errorText}>{errors.founder}</span>}
          </div>
        </div>

        {/* Row 2: Contact & Location */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Thông tin liên hệ <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.contactInfo ? styles.inputError : ''}`}
              placeholder="Email hoặc số điện thoại"
            />
            {errors.contactInfo && <span className={styles.errorText}>{errors.contactInfo}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Địa phương <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="countryCity"
              value={formData.countryCity}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.countryCity ? styles.inputError : ''}`}
              placeholder="Tỉnh/Thành phố"
            />
            {errors.countryCity && <span className={styles.errorText}>{errors.countryCity}</span>}
          </div>
        </div>

        {/* Row 3: Website & Industry */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Website <span className={styles.required}>*</span></label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.website ? styles.inputError : ''}`}
              placeholder="https://example.com"
            />
            {errors.website && <span className={styles.errorText}>{errors.website}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Lĩnh vực</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="0">Chọn lĩnh vực</option>
              <option value="1">Nông nghiệp</option>
              <option value="2">Giáo dục</option>
              <option value="3">Công nghệ</option>
              <option value="4">Xã hội</option>
              <option value="5">Y tế</option>
              <option value="6">Fintech</option>
              <option value="7">E-commerce</option>
              <option value="8">Khác</option>
            </select>
          </div>
        </div>

        {/* Row 4: URLs */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>URL Logo</label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>URL Giấy phép kinh doanh</label>
            <input
              type="url"
              name="businessLicenseUrl"
              value={formData.businessLicenseUrl}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="https://example.com/license.pdf"
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '32px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.primaryBtn}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: isSubmitting ? '#9CA3AF' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'all 0.3s ease',
              boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ animation: 'spin 1s infinite linear', display: 'inline-block' }}>⏳</span>
                Đang cập nhật thông tin...
              </>
            ) : (
              <>
                <span style={{ fontSize: '18px' }}>✔️</span>
                Cập nhật thông tin startup
              </>
            )}
          </button>
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
