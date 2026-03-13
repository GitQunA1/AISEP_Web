import React, { useEffect } from 'react';
import { AlertTriangle, LogIn, Home } from 'lucide-react';
import styles from './SessionExpiredModal.module.css';

/**
 * SessionExpiredModal - A global modal that blocks the UI when the user's session ends.
 * It forces the user to log in again or go to the home page as a guest.
 */
const SessionExpiredModal = ({ onLogin, onHome }) => {
  useEffect(() => {
    // Immediately clear sensitive locally stored auth data when rendered
    localStorage.removeItem('aisep_token');
    localStorage.removeItem('aisep_refresh_token');
    localStorage.removeItem('aisep_user');
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalBody}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={32} />
          </div>

          <h2 className={styles.title}>Phiên Đăng Nhập Đã Hết Hạn</h2>
          <p className={styles.description}>
            Phiên làm việc của bạn đã kết thúc để đảm bảo an toàn. Vui lòng đăng nhập lại để tiếp tục sử dụng các tính năng của AISEP.
          </p>

          <div className={styles.warningBox}>
            <span>Tài khoản của bạn đã được đăng xuất khỏi thiết bị này.</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onLogin}>
            Đăng nhập lại
            <LogIn size={18} />
          </button>
          
          <button className={styles.secondaryBtn} onClick={onHome}>
            <Home size={18} />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
