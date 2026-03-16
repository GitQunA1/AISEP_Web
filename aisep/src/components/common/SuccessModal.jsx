import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import styles from './SuccessModal.module.css';

/**
 * SuccessModal - Shows success confirmation after form submission
 */
export default function SuccessModal({ onClose, title, message, primaryBtnText, secondaryBtnText, onSecondaryClick }) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className={styles.iconContainer}>
                    <CheckCircle size={64} className={styles.successIcon} />
                </div>

                <h2 className={styles.title}>
                    {title || 'Thành công!'}
                </h2>

                <p className={styles.message}>
                    {message || 'Thông tin đã được lưu thành công.'}
                </p>

                <div className={styles.buttonGroup}>
                    {secondaryBtnText && (
                        <button className={styles.secondaryButton} onClick={onSecondaryClick || onClose}>
                            {secondaryBtnText}
                        </button>
                    )}
                    <button className={styles.primaryButton} onClick={onClose}>
                        {primaryBtnText || 'Xong'}
                    </button>
                </div>
            </div>
        </div>
    );
}
