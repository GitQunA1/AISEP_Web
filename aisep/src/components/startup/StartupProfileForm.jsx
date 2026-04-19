import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Upload, X, FileText, Globe, User, MapPin, Briefcase, Tag, Mail, ExternalLink } from 'lucide-react';
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
    email: '',
    phoneNumber: '',
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
        email: initialData.email || initialData.Email || '',
        phoneNumber: initialData.phoneNumber || initialData.PhoneNumber || '',
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email liên hệ là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
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

      // Append basic fields matching backend DTO property names dokładnie
      dataPayload.append('CompanyName', formData.companyName);
      dataPayload.append('Founder', formData.founder);
      dataPayload.append('Email', formData.email);
      dataPayload.append('PhoneNumber', formData.phoneNumber);
      dataPayload.append('CountryCity', formData.countryCity);
      dataPayload.append('Website', formData.website);
      dataPayload.append('Industry', formData.industry);

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
        // Fix: Use the startup's own ID for update, not the userId
        const targetId = initialData.id || initialData.startupId;
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

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Section 1: Basic Information */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Briefcase size={20} />
            </div>
            <div>
              <h4 className={styles.sectionTitle}>Thông tin cơ bản</h4>
              <p className={styles.sectionSubtitle}>Các thông tin chính về doanh nghiệp của bạn</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tên công ty <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Briefcase className={styles.fieldIcon} size={18} />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
                  placeholder="Ví dụ: TechStartup Vietnam"
                />
              </div>
              {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Người sáng lập <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.fieldIcon} size={18} />
                <input
                  type="text"
                  name="founder"
                  value={formData.founder}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.founder ? styles.inputError : ''}`}
                  placeholder="Tên người sáng lập"
                />
              </div>
              {errors.founder && <span className={styles.errorText}>{errors.founder}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email liên hệ <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.fieldIcon} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Ví dụ: contact@startup.com"
                />
              </div>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Số điện thoại <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon} style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 1, /* Full opacity for the prefix */
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: '12px',
                  color: 'var(--text-secondary)'
                }}>+84</span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
                  placeholder="090..."
                  style={{ paddingLeft: '48px' }}
                />
              </div>
              {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Địa phương <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.fieldIcon} size={18} />
                <input
                  type="text"
                  name="countryCity"
                  value={formData.countryCity}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.countryCity ? styles.inputError : ''}`}
                  placeholder="Tỉnh/Thành phố"
                />
              </div>
              {errors.countryCity && <span className={styles.errorText}>{errors.countryCity}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Website <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Globe className={styles.fieldIcon} size={18} />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.website ? styles.inputError : ''}`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && <span className={styles.errorText}>{errors.website}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Lĩnh vực</label>
              <div className={styles.inputWrapper}>
                <Tag className={styles.fieldIcon} size={18} />
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className={styles.select}
                >
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
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Section 2: Branding & Legal */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Upload size={20} />
            </div>
            <div>
              <h4 className={styles.sectionTitle}>Hình ảnh & Pháp lý</h4>
              <p className={styles.sectionSubtitle}>Tải lên logo và giấy phép kinh doanh của bạn</p>
            </div>
          </div>

          <div className={styles.uploadRow}>
            {/* Logo Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Logo công ty</label>
              <div
                className={`${styles.uploadCard} ${logoFile || formData.logoUrl ? styles.hasFile : ''}`}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove(styles.dragOver); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.dragOver);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) setLogoFile(file);
                }}
              >
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className={styles.hiddenInput}
                />
                <label htmlFor="logoUpload" className={styles.uploadLabel}>
                  {logoFile || formData.logoUrl ? (
                    <div className={styles.previewContainer}>
                      <img src={logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl} alt="Logo Preview" className={styles.logoPreview} />
                      <div className={styles.previewActions}>
                        <a
                          href={logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.viewBtn}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button type="button" className={styles.removeBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLogoFile(null); if (!logoFile) setFormData(p => ({ ...p, logoUrl: '' })); }}>
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <Upload size={20} className={styles.uploadIcon} />
                      <div className={styles.uploadText}>
                        <span className={styles.uploadLink}>Tải Logo</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* License Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Giấy phép kinh doanh</label>
              <div
                className={`${styles.uploadCard} ${licenseFile || formData.businessLicenseUrl ? styles.hasFile : ''}`}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove(styles.dragOver); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.dragOver);
                  const file = e.dataTransfer.files[0];
                  if (file) setLicenseFile(file);
                }}
              >
                <input
                  type="file"
                  id="licenseUpload"
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  onChange={(e) => setLicenseFile(e.target.files[0])}
                  className={styles.hiddenInput}
                />
                <label htmlFor="licenseUpload" className={styles.uploadLabel}>
                  {licenseFile || formData.businessLicenseUrl ? (
                    <div className={styles.filePreviewMini}>
                      <FileText size={20} className={styles.fileIcon} />
                      <div className={styles.fileInfoMini}>
                        <span className={styles.fileNameMini}>
                          {licenseFile ? licenseFile.name : 'Giấy phép hiện tại'}
                        </span>
                      </div>
                      <div className={styles.fileActionsMini}>
                        {(licenseFile || formData.businessLicenseUrl) && (
                          <a
                            href={licenseFile ? URL.createObjectURL(licenseFile) : formData.businessLicenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.viewBtnMini}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button type="button" className={styles.removeBtnMini} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLicenseFile(null); if (!licenseFile) setFormData(p => ({ ...p, businessLicenseUrl: '' })); }}>
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <FileText size={20} className={styles.uploadIcon} />
                      <div className={styles.uploadText}>
                        <span className={styles.uploadLink}>Tải Giấy phép</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Error/Success Feedbacks */}
        {errors.submit && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{errors.submit}</span>
          </div>
        )}

        {successMessage && (
          <div className={styles.successBanner}>
            <Check size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className={styles.formFooter}>
          <button type="button" className={styles.cancelBtn} onClick={() => window.location.reload()}>
            Hủy thay đổi
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.saveBtn}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className={styles.spin} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>{initialData ? 'Lưu thay đổi' : 'Tạo hồ sơ ngay'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
