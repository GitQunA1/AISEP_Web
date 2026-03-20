import React from 'react';
import { CheckCircle, X, AlertCircle, XCircle, InfoIcon } from 'lucide-react';
import styles from './SuccessModal.module.css';

/**
 * SuccessModal - Shows success/error/warning/info confirmation
 * Types: 'success', 'error', 'warning', 'info'
 */
export default function SuccessModal({ 
    onClose, 
    title, 
    message, 
    primaryBtnText, 
    secondaryBtnText, 
    onSecondaryClick,
    type = 'success'
}) {
    const getIcon = () => {
        switch(type) {
            case 'error':
                return <XCircle size={64} className={styles.errorIcon} />;
            case 'warning':
                return <AlertCircle size={64} className={styles.warningIcon} />;
            case 'info':
                return <InfoIcon size={64} className={styles.infoIcon} />;
            case 'success':
            default:
                return <CheckCircle size={64} className={styles.successIcon} />;
        }
    };

    const getDefaultTitle = () => {
        switch(type) {
            case 'error':
                return 'Có lỗi xảy ra!';
            case 'warning':
                return 'Cảnh báo';
            case 'info':
                return 'Thông tin';
            case 'success':
            default:
                return 'Thành công!';
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className={styles.iconContainer}>
                    {getIcon()}
                </div>

                <h2 className={styles.title}>
                    {title || getDefaultTitle()}
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
                    <button className={`${styles.primaryButton} ${styles[type]}`} onClick={onClose}>
                        {primaryBtnText || 'Xong'}
                    </button>
                </div>
            </div>
        </div>
    );
}
