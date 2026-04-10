import React from 'react';
import { Lock, Zap, X, ShieldAlert, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import styles from './UnlockConfirmationModal.module.css';

/**
 * UnlockConfirmationModal
 * A premium modal to confirm consuming a project view quota point.
 */
const UnlockConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isUnlocking,
  isLoadingQuota,
  projectName,
  remainingViews,
  packageName
}) => {
  if (!isOpen) return null;

  const afterUnlock = Math.max(0, remainingViews - 1);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Header Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.pulseRing}></div>
          <div className={styles.mainIcon}>
            <Lock size={32} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title & Info */}
        <h2 className={styles.title}>Mở khóa thông tin</h2>
        <p className={styles.description}>
          Bạn đang yêu cầu mở khóa toàn bộ thông tin dự án: 
          <br />
          <strong className={styles.projectName}>{projectName || 'Dự án này'}</strong>
        </p>

        {/* Quota Insight Card */}
        <div className={styles.quotaCard}>
          <div className={styles.quotaHeader}>
            <Zap size={16} fill="currentColor" />
            <span>Quota chi tiết ({packageName || '...'})</span>
          </div>
          
          <div className={styles.quotaStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Lượt hiện tại</span>
              {isLoadingQuota ? (
                <Loader2 className={styles.spinIcon} size={18} />
              ) : (
                <span className={styles.statValue}>{remainingViews}</span>
              )}
            </div>
            <div className={styles.statDivider}>
              <ChevronRight size={16} />
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Sau khi mở</span>
              {isLoadingQuota ? (
                <Loader2 className={styles.spinIcon} size={18} />
              ) : (
                <span className={`${styles.statValue} ${styles.highlight}`}>{afterUnlock}</span>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer / Benefits */}
        <div className={styles.benefitList}>
           <div className={styles.benefitItem}>
             <CheckCircle size={14} className={styles.checkIcon} />
             <span>Xem Doanh thu, Mô hình KD & Team đầy đủ</span>
           </div>
           <div className={styles.benefitItem}>
             <CheckCircle size={14} className={styles.checkIcon} />
             <span>Dự án được lưu vào danh sách "Đã mở khóa" vĩnh viễn</span>
           </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            className={styles.confirmBtn} 
            onClick={onConfirm}
            disabled={isUnlocking || remainingViews <= 0}
          >
            {isUnlocking ? (
              <>
                <Loader2 size={18} className={styles.spin} />
                Đang mở khóa...
              </>
            ) : (
              'Xác nhận mở khóa'
            )}
          </button>
          
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isUnlocking}
          >
            Hủy bỏ
          </button>
        </div>

        {remainingViews <= 0 && (
          <div className={styles.errorBox}>
            <ShieldAlert size={16} />
            <span>Số lượt xem đã hết. Vui lòng nâng cấp gói.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnlockConfirmationModal;
