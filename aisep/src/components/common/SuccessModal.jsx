import React from 'react';
import { CheckCircle, X, AlertCircle, XCircle, InfoIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
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
    onPrimaryClick,
    secondaryBtnText, 
    onSecondaryClick,
    type = 'success'
}) {
    const [isClosing, setIsClosing] = React.useState(false);

    const handleInternalClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handlePrimaryClick = () => {
        if (onPrimaryClick) {
            // If custom handler provided, let it run but also handle closing
            onPrimaryClick();
            handleInternalClose();
        } else {
            handleInternalClose();
        }
    };

    const handleSecondaryClick = () => {
        if (onSecondaryClick) {
            onSecondaryClick();
        }
        handleInternalClose();
    };
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

    const modalContent = (
        <div 
            className={`${styles.overlay} ${isClosing ? styles.closingOverlay : ''}`} 
            onClick={handleInternalClose}
        >
            <div 
                className={`${styles.modal} ${styles[type]} ${isClosing ? styles.closingModal : ''}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={styles.closeButton}
                    onClick={handleInternalClose}
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
                        <button 
                            className={styles.secondaryButton} 
                            onClick={handleSecondaryClick}
                        >
                            {secondaryBtnText}
                        </button>
                    )}
                    <button 
                        className={`${styles.primaryButton} ${styles[type]}`} 
                        onClick={handlePrimaryClick}
                    >
                        {primaryBtnText || 'Xong'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
