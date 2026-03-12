import React from 'react';
import { AlertCircle, Rocket, ArrowRight, X } from 'lucide-react';
import styles from './ProfileRequiredModal.module.css';

/**
 * ProfileRequiredModal - A premium, theme-aware modal to enforce profile creation.
 * Supporting persistent mode (no close button) for dashboard enforcement.
 */
const ProfileRequiredModal = ({ onRedirect, onDismiss }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onDismiss} aria-label="Đóng">
          <X size={20} />
        </button>
        
        <div className={styles.iconWrapper}>
          <div className={styles.iconPulse}></div>
          <Rocket size={32} className={styles.rocketIcon} />
        </div>

        <h2 className={styles.title}>Cập nhật Hồ sơ Startup</h2>
        <p className={styles.description}>
          Chào mừng bạn đến với AISEP! Để bắt đầu hành trình gọi vốn và tiếp cận nhà đầu tư, bạn cần hoàn thiện hồ sơ doanh nghiệp của mình.
        </p>

        <div className={styles.warningBox}>
          <AlertCircle size={20} className={styles.warningIcon} />
          <span>Bạn sẽ không thể <strong>đăng dự án</strong> cho đến khi hồ sơ được tạo.</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onRedirect}>
            Bắt đầu tạo hồ sơ ngay
            <ArrowRight size={18} />
          </button>
          
          <button className={styles.secondaryBtn} onClick={onDismiss}>
            Để sau (Bỏ qua)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileRequiredModal;
