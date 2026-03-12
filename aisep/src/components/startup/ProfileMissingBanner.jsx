import React from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import styles from './ProfileMissingBanner.module.css';

/**
 * ProfileMissingBanner - Notifies startup users that they need a profile
 * Used on dashboard and home page to encourage profile completion.
 */
const ProfileMissingBanner = ({ onRedirect, onDismiss }) => {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        <div className={styles.iconWrapper}>
          <AlertCircle size={24} className={styles.warningIcon} />
        </div>
        <div className={styles.textContent}>
          <h4 className={styles.bannerTitle}>Bạn chưa hoàn thiện Hồ sơ Startup</h4>
          <p className={styles.bannerMessage}>
            Để có thể đăng dự án và tiếp cận các nhà đầu tư, bạn cần tạo Hồ sơ Startup cho doanh nghiệp của mình trước.
          </p>
          <div className={styles.bannerActions}>
            <button className={styles.primaryBtn} onClick={onRedirect}>
              <ExternalLink size={16} />
              Tạo hồ sơ ngay
            </button>
            <button className={styles.secondaryBtn} onClick={onDismiss}>
              Để sau
            </button>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onDismiss}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProfileMissingBanner;
