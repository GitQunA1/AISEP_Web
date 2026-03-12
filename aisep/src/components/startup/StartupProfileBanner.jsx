import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import styles from './StartupProfileBanner.module.css';

/**
 * StartupProfileBanner - A persistent, non-intrusive header notification
 * for the Startup Dashboard when the profile is missing.
 */
const StartupProfileBanner = ({ onRedirect }) => {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        <div className={styles.leftSection}>
          <div className={styles.iconCircle}>
            <AlertCircle size={20} />
          </div>
          <div className={styles.textWrapper}>
            <h4 className={styles.title}>Hồ sơ Startup của bạn chưa hoàn thiện</h4>
            <p className={styles.description}>
              Hoàn thiện hồ sơ để có thể đăng dự án, thu hút nhà đầu tư và sử dụng đầy đủ tính năng của AISEP.
            </p>
          </div>
        </div>
        <button className={styles.actionBtn} onClick={onRedirect}>
          <span>Hoàn thiện ngay</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default StartupProfileBanner;
