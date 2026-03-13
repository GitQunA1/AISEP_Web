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
  
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Pre-populate form with existing data
  useEffect(() => {
    if (initialData) {
      // Map API string Enum to corresponding integer index for the <select> element
      let industryVal = initialData.industry || 0;
      if (typeof industryVal === 'string') {
        const industryMap = {
          'Fintech': 0, 'Edtech': 1, 'Healthtech': 2, 'Agritech': 3,
          'E_Commerce': 4, 'Logistics': 5, 'Proptech': 6, 'Cleantech': 7,
          'SaaS': 8, 'AI_BigData': 9, 'Web3_Crypto': 10, 'Food_Beverage': 11,
          'Manufacturing': 12, 'Media_Entertainment': 13, 'Other': 14
        };
        industryVal = industryMap[industryVal] !== undefined ? industryMap[industryVal] : 0;
      }

      setFormData({
        companyName: initialData.companyName || initialData.CompanyName || '',
        logoUrl: initialData.logoUrl || initialData.LogoUrl || '',
        founder: initialData.founder || initialData.Founder || '',
        contactInfo: initialData.contactInfo || initialData.ContactInfo || '',
        countryCity: initialData.countryCity || initialData.CountryCity || '',
        website: initialData.website || initialData.Website || '',
        industry: industryVal,
        businessLicenseUrl: initialData.businessLicenseUrl || initialData.BusinessLicenseUrl || '',
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
      // Create FormData properly for multipart/form-data
      const dataPayload = new FormData();
      
      // Append basic fields
      dataPayload.append('companyName', formData.companyName);
      dataPayload.append('founder', formData.founder);
      dataPayload.append('contactInfo', formData.contactInfo);
      dataPayload.append('countryCity', formData.countryCity);
      dataPayload.append('website', formData.website);
      dataPayload.append('industry', formData.industry);
      
      // Append files with keys matching backend IFormFile properties
      if (logoFile) {
        dataPayload.append('LogoFile', logoFile);
      }
      if (licenseFile) {
        dataPayload.append('BusinessLicenseFile', licenseFile);
      }

      // Determine if we should create or update
      const isUpdate = !!(initialData && (initialData.id || initialData.startupId));
      let response;
      
      if (isUpdate) {
        // Ensure ID is included in payload for update
        const targetId = user?.userId || initialData?.userId || initialData.startupId || initialData.id;
        response = await startupProfileService.updateStartupProfile({ 
          ...Object.fromEntries(dataPayload), 
          LogoFile: logoFile, 
          BusinessLicenseFile: licenseFile, 
          userId: targetId 
        });
      } else {
        response = await startupProfileService.createStartupProfile({ 
          ...Object.fromEntries(dataPayload), 
          LogoFile: logoFile, 
          BusinessLicenseFile: licenseFile 
        });
      }
      
      if (response && (response.isSuccess || response.success)) {
        setSuccessMessage(isUpdate ? 'Thông tin startup đã được cập nhật thành công!' : 'Hồ sơ startup đã được tạo thành công!');
        if (onSuccess) {
          // Priority: response.data (actual updated object) -> response (if it is the object) -> formData (fallback)
          const updatedData = response.data || (response.companyName ? response : null) || formData;
          onSuccess(updatedData);
        }
      } else {
        setErrors({ submit: response?.message || (isUpdate ? 'Cập nhật thất bại. Vui lòng thử lại.' : 'Tạo hồ sơ thất bại. Vui lòng thử lại.') });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Backend validation messages might come directly via catch block from apiClient reject
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
              {/* Mapped exactly to AISEP.DAL.Enums.Industry */}
              <option value="0">Fintech</option>
              <option value="1">Edtech</option>
              <option value="2">Healthtech</option>
              <option value="3">Agritech</option>
              <option value="4">E-Commerce</option>
              <option value="5">Logistics</option>
              <option value="6">Proptech</option>
              <option value="7">Cleantech</option>
              <option value="8">SaaS</option>
              <option value="9">AI & Big Data</option>
              <option value="10">Web3 & Crypto</option>
              <option value="11">Food & Beverage</option>
              <option value="12">Manufacturing</option>
              <option value="13">Media & Entertainment</option>
              <option value="14">Khác (Other)</option>
            </select>
          </div>
        </div>

        {/* Row 4: File Uploads */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tải lên Logo</label>
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                name="logoFile"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className={styles.fileInput}
              />
              <span className={styles.fileHint}>Định dạng hỗ trợ: PNG, JPG, JPEG, WEBP</span>
              {formData.logoUrl && !logoFile && (
                <div className={styles.currentFile}>
                  <span>Hiện tại: </span>
                  <a href={formData.logoUrl} target="_blank" rel="noreferrer">Xem ảnh</a>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Giấy phép kinh doanh</label>
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                name="licenseFile"
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                onChange={(e) => setLicenseFile(e.target.files[0])}
                className={styles.fileInput}
              />
              <span className={styles.fileHint}>Định dạng hỗ trợ: PNG, JPG, PDF</span>
              {formData.businessLicenseUrl && !licenseFile && (
                <div className={styles.currentFile}>
                  <span>Hiện tại: </span>
                  <a href={formData.businessLicenseUrl} target="_blank" rel="noreferrer">Xem tài liệu</a>
                </div>
              )}
            </div>
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
