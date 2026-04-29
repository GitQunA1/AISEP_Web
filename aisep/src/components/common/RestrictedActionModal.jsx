import React from 'react';
import { createPortal } from 'react-dom';
import { WarningCircle, X, ShieldWarning, IdentificationCard } from '@phosphor-icons/react';
import styles from './RestrictedActionModal.module.css';

/**
 * RestrictedActionModal - Standard modal for blocking unapproved users from sensitive actions
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {string} message - Descriptive message about the restricted action
 */
const RestrictedActionModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  // Render to portal to ensure it's on top
  return createPortal(
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <ShieldWarning size={24} weight="fill" color="#f59e0b" />
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>Hành động bị hạn chế</h2>
          <div className={styles.messageBox}>
            <WarningCircle size={20} weight="bold" className={styles.alertIcon} />
            <p className={styles.message}>{message || 'Bạn không có quyền thực hiện hành động này.'}</p>
          </div>
          
          <div className={styles.guidance}>
            <IdentificationCard size={32} weight="duotone" className={styles.guidanceIcon} />
            <div className={styles.guidanceText}>
              <p><strong>Yêu cầu phê duyệt hồ sơ</strong></p>
              <p>Để đảm bảo an toàn cho nền tảng, các hành động quan trọng chỉ dành cho người dùng đã được Quản trị viên phê duyệt hồ sơ chính thức.</p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.actionBtn} onClick={onClose}>
            Tôi đã hiểu
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RestrictedActionModal;
