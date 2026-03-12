import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import styles from './StartupProfileForm.module.css';
import startupProfileService from '../../services/startupProfileService';

/**
 * StartupProfileForm - Form for updating startup profile information
 * Improved with professional styling and theme support.
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
      // Determine if we should create or update
      const isUpdate = !!(initialData && (initialData.id || initialData.startupId));
      let response;
      
      if (isUpdate) {
        // Ensure ID is included in payload for update
        const payload = {
          ...formData,
          startupId: initialData.startupId || initialData.id
        };
        response = await startupProfileService.updateStartupProfile(payload);
      } else {
        response = await startupProfileService.createStartupProfile(formData);
      }
      
      if (response && response.isSuccess) {
        setSuccessMessage(isUpdate ? 'Thông tin startup đã được cập nhật thành công!' : 'Hồ sơ startup đã được tạo thành công!');
        if (onSuccess) {
          // Return the full data from response if available, or current formData
          onSuccess(response.data || formData);
        }
      } else {
        setErrors({ submit: response?.message || (isUpdate ? 'Cập nhật thất bại. Vui lòng thử lại.' : 'Tạo hồ sơ thất bại. Vui lòng thử lại.') });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: error?.message || 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h3 className={styles.title}>
        {initialData ? 'Cập nhật Thông tin Startup' : 'Tạo Hồ sơ Startup'}
      </h3>
      <p className={styles.subtitle}>
        {initialData 
          ? 'Cập nhật thông tin công ty để nhà đầu tư và cố vấn hiểu rõ hơn về doanh nghiệp của bạn.' 
          : 'Vì bạn chưa có hồ sơ, vui lòng điền các thông tin cơ bản của doanh nghiệp để bắt đầu.'}
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Error Message */}
        {errors.submit && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            {errors.submit}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successBanner}>
            <Check size={18} />
            {successMessage}
          </div>
        )}

        {/* Row 1: Company Name & Founder */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên công ty <span className={styles.required}>*</span>
            </label>
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
            <label className={styles.label}>
              Người sáng lập <span className={styles.required}>*</span>
            </label>
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
            <label className={styles.label}>
              Thông tin liên hệ <span className={styles.required}>*</span>
            </label>
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
            <label className={styles.label}>
              Địa phương <span className={styles.required}>*</span>
            </label>
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
            <label className={styles.label}>
              Website <span className={styles.required}>*</span>
            </label>
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
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className={styles.spin} />
              {initialData ? 'Đang cập nhật thông tin...' : 'Đang tạo hồ sơ...'}
            </>
          ) : (
            <>
              <Check size={18} />
              {initialData ? 'Cập nhật thông tin startup' : 'Tạo hồ sơ startup ngay'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
