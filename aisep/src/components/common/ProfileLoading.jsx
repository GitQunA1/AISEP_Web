import React from 'react';
import { Loader } from 'lucide-react';
import styles from './ProfileLoading.module.css';

const ProfileLoading = ({ message = "Đang tải thông tin..." }) => {
  return (
    <div className={styles.container}>
      <div className={styles.coverWrapper}>
        <div className={styles.coverOverlay} />
      </div>
      
      <div className={styles.loaderContent}>
        <div className={styles.loaderCard}>
          <div className={styles.spinnerWrapper}>
            <Loader size={36} className={styles.spinIcon} />
          </div>
          <p className={styles.loaderMessage}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileLoading;
