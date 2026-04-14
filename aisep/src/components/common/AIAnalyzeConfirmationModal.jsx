import React from 'react';
import { Sparkles, Zap, X, ShieldAlert, CheckCircle, ChevronRight, Loader2, Brain } from 'lucide-react';
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
  remainingAiRequests,
  packageName
}) => {
  if (!isOpen) return null;

  const safeRemaining = Number.isFinite(Number(remainingAiRequests)) ? Number(remainingAiRequests) : 0;
  const afterAnalyze = Math.max(0, safeRemaining - 1);

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Header Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.pulseRing}></div>
          <div className={styles.mainIcon}>
            <Brain size={32} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title & Info */}
        <h2 className={styles.title}>Phân tích Dự án bằng AI</h2>
        <p className={styles.description}>
          Hệ thống AI sẽ thực hiện quét sâu và đánh giá chi tiết dự án:
          <br />
          <strong className={styles.projectName}>{projectName || 'Dự án này'}</strong>
        </p>

        {/* Quota Insight Card */}
        <div className={styles.quotaCard}>
          <div className={styles.quotaHeader}>
            <Zap size={14} fill="currentColor" />
            <span>Quota AI ({packageName || 'Gói của bạn'})</span>
          </div>
          
          <div className={styles.quotaStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Hiện tại</span>
              {isLoadingQuota ? (
                <Loader2 className={styles.spinIcon} size={18} />
              ) : (
                <span className={styles.statValue}>{safeRemaining}</span>
              )}
            </div>
            <div className={styles.statDivider}>
              <ChevronRight size={16} />
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Dự kiến còn</span>
              {isLoadingQuota ? (
                <Loader2 className={styles.spinIcon} size={18} />
              ) : (
                <span className={`${styles.statValue} ${styles.highlight}`}>{afterAnalyze}</span>
              )}
            </div>
          </div>
        </div>

        {/* AI Benefits List */}
        <div className={styles.benefitList}>
           <div className={styles.benefitItem}>
             <CheckCircle size={14} className={styles.checkIcon} />
             <span>Phân tích tiềm năng & chỉ số rủi ro chi tiết</span>
           </div>
           <div className={styles.benefitItem}>
             <CheckCircle size={14} className={styles.checkIcon} />
             <span>Khuyến nghị đầu tư & các bước tiếp theo từ AI</span>
           </div>
           <div className={styles.benefitItem}>
             <CheckCircle size={14} className={styles.checkIcon} />
             <span>Lưu kết quả vào lịch sử để xem lại bất cứ lúc nào</span>
           </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            className={styles.confirmBtn} 
            onClick={onConfirm}
            disabled={isAnalyzing || safeRemaining <= 0}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className={styles.spin} />
                Đang khởi chạy AI...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Xác nhận Phân tích
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

        {safeRemaining <= 0 && !isLoadingQuota && (
          <div className={styles.errorBox}>
            <ShieldAlert size={16} />
            <span>Số lượt phân tích AI đã hết. Vui lòng nâng cấp gói.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyzeConfirmationModal;
