import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import styles from './SuccessModal.module.css';

/**
 * ErrorModal - Shows error message after failed action
 */
export default function ErrorModal({ onClose, title, message }) {
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
                    <AlertCircle size={64} style={{ color: '#ef4444' }} />
                </div>

                <h2 className={styles.title}>
                    {title || 'Lỗi!'}
                </h2>

                <p className={styles.message} style={{ color: '#dc2626' }}>
                    {message || 'Đã xảy ra lỗi. Vui lòng thử lại.'}
                </p>

                <button className={styles.primaryButton} onClick={onClose}>
                    Đóng
                </button>
            </div>
        </div>
    );
}
