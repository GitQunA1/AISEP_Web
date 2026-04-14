import React from 'react';
import { Sparkles, Zap, X, ShieldAlert, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import styles from './AIAnalyzeConfirmationModal.module.css';

/**
 * AIAnalyzeConfirmationModal
 * A premium modal to confirm consuming an AI analysis quota point.
 */
const AIAnalyzeConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isAnalyzing,
  isLoadingQuota,
  projectName,
  remainingQuota,
  packageName
}) => {
  if (!isOpen) return null;

  const afterAnalyze = Math.max(0, remainingQuota - 1);

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
            <Sparkles size={32} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title & Info */}
        <h2 className={styles.title}>Phân tích AI chuyên sâu</h2>
        <p className={styles.description}>
          Bạn đang yêu cầu hệ thống AI thực hiện phân tích tiềm năng và rủi ro cho dự án:
          <br />
          <strong className={styles.projectName}>{projectName || 'Dự án này'}</strong>
        </p>

        {/* Quota Insight Card */}
        <div className={styles.quotaCard}>
          <div className={styles.quotaHeader}>
            <Zap size={16} fill="currentColor" />
            <span>Hạn mức AI ({packageName || 'Gói của bạn'})</span>
          </div>
          
          <div className={styles.quotaStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Lượt hiện tại</span>
              {isLoadingQuota ? (
                <Loader2 className={styles.spinIcon} size={18} />
              ) : (
                <span className={styles.statValue}>{remainingQuota}</span>
              )}
            </div>
            <div className={styles.statDivider}>
              <ChevronRight size={16} />
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Sau khi dùng</span>
              {isLoadingQuota ? (
                <Loader2 className={styles.spinIcon} size={18} />
              ) : (
                <span className={`${styles.statValue} ${styles.highlight}`}>{afterAnalyze}</span>
              )}
            </div>
          </div>
        </div>

        {/* AI Benefits */}
        <div className={styles.benefitList}>
           <div className={styles.benefitItem}>
             <CheckCircle size={16} className={styles.checkIcon} />
             <span>Chấm điểm tiềm năng khởi nghiệp (0-100)</span>
           </div>
           <div className={styles.benefitItem}>
             <CheckCircle size={16} className={styles.checkIcon} />
             <span>Phân tích Điểm mạnh, Điểm yếu & Rủi ro</span>
           </div>
           <div className={styles.benefitItem}>
             <CheckCircle size={16} className={styles.checkIcon} />
             <span>Báo cáo tóm tắt cho Nhà đầu tư & Cố vấn</span>
           </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            className={styles.confirmBtn} 
            onClick={onConfirm}
            disabled={isAnalyzing || remainingQuota <= 0}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className={styles.spin} />
                Đang khởi tạo AI...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Bắt đầu phân tích
              </>
            )}
          </button>
          
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isAnalyzing}
          >
            Hủy bỏ
          </button>
        </div>

        {remainingQuota <= 0 && !isLoadingQuota && (
          <div className={styles.errorBox}>
            <ShieldAlert size={16} />
            <span>Hạn mức AI đã hết. Vui lòng nâng cấp gói dịch vụ.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyzeConfirmationModal;
