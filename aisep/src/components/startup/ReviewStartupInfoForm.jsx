import React, { useState } from 'react';
import { AlertCircle, Check, Loader2, ArrowLeft, ClipboardList } from 'lucide-react';
import styles from './ReviewStartupInfoForm.module.css';
import startupProfileService from '../../services/startupProfileService';

/**
 * ReviewStartupInfoForm - Review and confirm submitted startup info
 * Improved with professional styling and theme support.
 */
export default function ReviewStartupInfoForm({ formData, onConfirm, onEdit, user }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Stage label map
  const stageLabels = {
    'idea': 'Ý tưởng',
    'mvp': 'MVP',
    'customers': 'Có khách hàng',
    'growth': 'Tăng trưởng'
  };

  const handleUpdateProfile = async () => {
    setUpdateError('');
    setUpdateSuccess(false);
    setIsUpdating(true);

    try {
      // Prepare profile update data
      const profileData = {
        companyName: formData.projectName,
        founder: formData.teamRoles?.split('\n')[0]?.substring(0, 100) || 'Founder',
        website: '',
        industry: formData.industry === 'agriculture' ? 'Agriculture' :
                 formData.industry === 'education' ? 'Education' :
                 formData.industry === 'technology' ? 'Technology' :
                 formData.industry === 'social' ? 'Social' :
                 formData.industry === 'healthcare' ? 'Healthcare' :
                 formData.industry === 'fintech' ? 'Fintech' :
                 formData.industry === 'ecommerce' ? 'E-commerce' : 'Other',
        countryCity: formData.location || 'Not specified',
        contactInfo: `${user?.email || 'contact@startup.com'}`,
        about: formData.proposedSolution?.substring(0, 500) || 'Startup profile',
        logoUrl: '',
        followers: [],
        projects: []
      };

      const response = await startupProfileService.updateStartupProfile(profileData);

      if (response && response.isSuccess) {
        setUpdateSuccess(true);
        setTimeout(() => {
          if (onConfirm) {
            onConfirm(formData);
          }
        }, 1500);
      } else {
        setUpdateError(response?.message || 'Lỗi khi cập nhật profile. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(
        error?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.reviewCard}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '100%' }} />
        </div>
        <p className={styles.stepIndicator}>Xem lại thông tin dự án</p>
      </div>

      {/* BODY */}
      <div className={styles.body}>
        {updateSuccess && (
          <div className={styles.successBanner}>
            <Check size={20} />
            Cập nhật profile thành công. Dự án đã được lưu.
          </div>
        )}

        {updateError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={20} />
            {updateError}
          </div>
        )}

        {/* Review Content */}
        <div className={styles.content}>
          <div className={styles.titleSection}>
            <ClipboardList className={styles.titleIcon} size={24} />
            <div>
              <h2 className={styles.title}>Xem lại thông tin dự án</h2>
              <p className={styles.subtitle}>
                Vui lòng kiểm tra lại tất cả thông tin trước khi cập nhật profile
              </p>
            </div>
          </div>

          {/* Step 1 Review */}
          <div className={`${styles.section} ${styles.sectionBlue}`}>
            <h3 className={styles.sectionTitle}>1. Thông tin cơ bản</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tên dự án</label>
                <div className={styles.fieldValue}>{formData.projectName}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Lĩnh vực</label>
                <div className={styles.fieldValue}>{formData.industry}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Địa phương triển khai</label>
                <div className={styles.fieldValue}>{formData.location}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Giai đoạn</label>
                <div className={styles.fieldValue}>{stageLabels[formData.stage]}</div>
              </div>
            </div>
          </div>

          {/* Step 2 Review */}
          <div className={`${styles.section} ${styles.sectionYellow}`}>
            <h3 className={styles.sectionTitle}>2. Vấn đề cần giải quyết</h3>
            <div className={styles.stack}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Vấn đề</label>
                <div className={styles.fieldValue}>{formData.problemDescription}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Ai gặp vấn đề</label>
                <div className={styles.fieldValue}>{formData.problemAffects}</div>
              </div>
              {formData.currentSolution && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Cách giải quyết hiện tại</label>
                  <div className={styles.fieldValue}>{formData.currentSolution}</div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 Review */}
          <div className={`${styles.section} ${styles.sectionGreen}`}>
            <h3 className={styles.sectionTitle}>3. Giải pháp của bạn</h3>
            <div className={styles.stack}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Giải pháp đề xuất</label>
                <div className={styles.fieldValue}>{formData.proposedSolution}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Điểm khác biệt</label>
                <div className={styles.fieldValue}>{formData.differentiator}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Bắt đầu nhỏ</label>
                <div className={styles.fieldValue}>{formData.minimumViable}</div>
              </div>
            </div>
          </div>

          {/* Step 4 Review */}
          <div className={`${styles.section} ${styles.sectionPurple}`}>
            <h3 className={styles.sectionTitle}>4. Khách hàng & Thị trường</h3>
            <div className={styles.stack}>
              {formData.stage === 'idea' ? (
                <>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Khách hàng lý tưởng</label>
                    <div className={styles.fieldValue}>{formData.idealCustomerBuyer}</div>
                  </div>
                  {formData.willPayFor && (
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Sẵn sàng trả tiền</label>
                      <div className={styles.fieldValue}>{formData.willPayFor}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {formData.customerCount && (
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Số lượng khách hàng</label>
                      <div className={styles.fieldValue}>{formData.customerCount}</div>
                    </div>
                  )}
                  {formData.currentRevenue && (
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Doanh thu hiện tại</label>
                      <div className={styles.fieldValue}>{formData.currentRevenue}</div>
                    </div>
                  )}
                  {formData.growthRate && (
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Tốc độ tăng trưởng</label>
                      <div className={styles.fieldValue}>{formData.growthRate}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Step 5 Review */}
          <div className={`${styles.section} ${styles.sectionPink}`}>
            <h3 className={styles.sectionTitle}>5. Mô hình kiếm tiền</h3>
            <div className={styles.stack}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Cách kiếm tiền</label>
                <div className={styles.fieldValue}>{formData.revenueMethod}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Loại doanh thu</label>
                <div className={styles.fieldValue}>
                  {formData.revenueType === 'product' ? 'Bán sản phẩm' :
                   formData.revenueType === 'service' ? 'Thu phí dịch vụ' :
                   formData.revenueType === 'commission' ? 'Hoa hồng' :
                   formData.revenueType === 'hybrid' ? 'Kết hợp nhiều cách' : formData.revenueType}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Chiến lược giá</label>
                <div className={styles.fieldValue}>{formData.pricingStrategy}</div>
              </div>
            </div>
          </div>

          {/* Step 6 Review */}
          <div className={`${styles.section} ${styles.sectionCyan}`}>
            <h3 className={styles.sectionTitle}>6. Đội ngũ</h3>
            <div className={styles.stack}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Số lượng thành viên</label>
                <div className={styles.fieldValue}>{formData.teamSize}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Vai trò từng người</label>
                <div className={styles.fieldValue} style={{ whiteSpace: 'pre-wrap' }}>{formData.teamRoles}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Loại hình làm việc</label>
                <div className={styles.fieldValue}>
                  {formData.employmentType === 'fulltime' ? 'Full-time' :
                   formData.employmentType === 'parttime' ? 'Part-time' :
                   formData.employmentType === 'mixed' ? 'Kết hợp' : formData.employmentType}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <button
          onClick={onEdit}
          className={styles.secondaryBtn}
          disabled={isUpdating}
        >
          <ArrowLeft size={18} />
          Quay lại chỉnh sửa
        </button>

        <button
          onClick={handleUpdateProfile}
          className={styles.primaryBtn}
          disabled={isUpdating || updateSuccess}
        >
          {isUpdating ? (
            <>
              <Loader2 size={18} className={styles.spin} />
              Đang cập nhật...
            </>
          ) : updateSuccess ? (
            <>
              <Check size={18} />
              Đã cập nhật
            </>
          ) : (
            <>
              <Check size={18} />
              Cập nhật Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
