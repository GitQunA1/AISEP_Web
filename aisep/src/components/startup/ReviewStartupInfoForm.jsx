import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import styles from '../auth/RegisterForms.module.css';
import startupProfileService from '../../services/startupProfileService';

/**
 * ReviewStartupInfoForm - Review and confirm submitted startup info
 * Shows all 6 steps data in review format
 * Allows user to update profile or go back to edit
 */
export default function ReviewStartupInfoForm({ formData, onConfirm, onEdit, user }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Stage label map
  const stageLabels = {
    'idea': '🔍 Ý tưởng',
    'mvp': '🛠️ MVP',
    'customers': '👥 Có khách hàng',
    'growth': '📈 Tăng trưởng'
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

      // Call update API
      const response = await startupProfileService.updateStartupProfile(profileData);

      if (response && response.isSuccess) {
        setUpdateSuccess(true);
        // Show success and call parent callback after 2 seconds
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
    <div className={styles.formCard}>
      {/* HEADER */}
      <div className={styles.cardHeader}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '100%' }} />
        </div>
        <p className={styles.stepIndicator}>Xem lại thông tin dự án</p>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>
        {/* Success Message */}
        {updateSuccess && (
          <div style={{
            padding: '16px',
            background: '#D1FAE5',
            border: '1px solid #6EE7B7',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px'
          }}>
            <Check size={20} />
            ✅ Cập nhật profile thành công! Dự án đã được lưu.
          </div>
        )}

        {/* Error Message */}
        {updateError && (
          <div style={{
            padding: '16px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px'
          }}>
            <AlertCircle size={20} />
            {updateError}
          </div>
        )}

        {/* Review Content */}
        <div>
          <h2 className={styles.stepTitle}>📋 Xem lại thông tin dự án</h2>
          <p className={styles.stepSubtitle} style={{ marginBottom: '24px' }}>
            Vui lòng kiểm tra lại tất cả thông tin trước khi cập nhật profile
          </p>

          {/* Step 1 Review */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            borderLeft: '4px solid #3B82F6'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>1️ Thông tin cơ bản</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Tên dự án</div>
                <div style={{ fontWeight: '500' }}>{formData.projectName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Lĩnh vực</div>
                <div style={{ fontWeight: '500' }}>{formData.industry}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Địa phương triển khai</div>
                <div style={{ fontWeight: '500' }}>{formData.location}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Giai đoạn</div>
                <div style={{ fontWeight: '500' }}>{stageLabels[formData.stage]}</div>
              </div>
            </div>
          </div>

          {/* Step 2 Review */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            borderLeft: '4px solid #F59E0B'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>2️ Vấn đề cần giải quyết</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Vấn đề</div>
                <div>{formData.problemDescription}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Ai gặp vấn đề</div>
                <div>{formData.problemAffects}</div>
              </div>
              {formData.currentSolution && (
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Cách giải quyết hiện tại</div>
                  <div>{formData.currentSolution}</div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 Review */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            borderLeft: '4px solid #10B981'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>3️ Giải pháp của bạn</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Giải pháp đề xuất</div>
                <div>{formData.proposedSolution}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Điểm khác biệt</div>
                <div>{formData.differentiator}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Bắt đầu nhỏ</div>
                <div>{formData.minimumViable}</div>
              </div>
            </div>
          </div>

          {/* Step 4 Review */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            borderLeft: '4px solid #8B5CF6'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>4️ Khách hàng & Thị trường</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {formData.stage === 'idea' ? (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Khách hàng lý tưởng</div>
                    <div>{formData.idealCustomerBuyer}</div>
                  </div>
                  {formData.willPayFor && (
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Sẵn sàng trả tiền</div>
                      <div>{formData.willPayFor}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {formData.customerCount && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Số lượng khách hàng</div>
                      <div>{formData.customerCount}</div>
                    </div>
                  )}
                  {formData.currentRevenue && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Doanh thu hiện tại</div>
                      <div>{formData.currentRevenue}</div>
                    </div>
                  )}
                  {formData.growthRate && (
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Tốc độ tăng trưởng</div>
                      <div>{formData.growthRate}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Step 5 Review */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            borderLeft: '4px solid #EC4899'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>5️ Mô hình kiếm tiền</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Cách kiếm tiền</div>
                <div>{formData.revenueMethod}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Loại doanh thu</div>
                <div style={{ fontWeight: '500' }}>
                  {formData.revenueType === 'product' ? '💳 Bán sản phẩm' :
                   formData.revenueType === 'service' ? '🔄 Thu phí dịch vụ' :
                   formData.revenueType === 'commission' ? '💰 Hoa hồng' :
                   formData.revenueType === 'hybrid' ? '🎯 Kết hợp nhiều cách' : formData.revenueType}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Chiến lược giá</div>
                <div>{formData.pricingStrategy}</div>
              </div>
            </div>
          </div>

          {/* Step 6 Review */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '12px',
            borderLeft: '4px solid #06B6D4'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>6️ Đội ngũ</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Số lượng thành viên</div>
                <div style={{ fontWeight: '500' }}>{formData.teamSize}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Vai trò từng người</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{formData.teamRoles}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Loại hình làm việc</div>
                <div style={{ fontWeight: '500' }}>
                  {formData.employmentType === 'fulltime' ? '⏰ Full-time' :
                   formData.employmentType === 'parttime' ? '⌛ Part-time' :
                   formData.employmentType === 'mixed' ? '🔀 Kết hợp' : formData.employmentType}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.cardFooter}>
        <button
          onClick={onEdit}
          className={styles.secondaryButton}
          disabled={isUpdating}
        >
          ← Quay lại chỉnh sửa
        </button>

        <button
          onClick={handleUpdateProfile}
          className={styles.primaryButton}
          disabled={isUpdating || updateSuccess}
          style={{
            opacity: isUpdating || updateSuccess ? 0.6 : 1,
            cursor: isUpdating || updateSuccess ? 'not-allowed' : 'pointer'
          }}
        >
          {isUpdating ? (
            <>
              ⏳ Đang cập nhật...
            </>
          ) : updateSuccess ? (
            <>
              ✅ Đã cập nhật
            </>
          ) : (
            '✔️ Cập nhật Profile'
          )}
        </button>
      </div>
    </div>
  );
}
