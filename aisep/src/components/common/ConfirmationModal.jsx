import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

/**
 * ConfirmationModal - Replacement for window.confirm() with better styling
 * Types: 'info', 'warning', 'success', 'error'
 */
export default function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    type = 'info',
    primaryBtnText = 'OK',
    secondaryBtnText = 'Cancel',
    onPrimaryClick,
    onSecondaryClick,
    onClose,
    isLoading = false,
    autoClose = null
}) {
    // Auto-close timer
    React.useEffect(() => {
        if (!isOpen || !autoClose) return;
        
        const timer = setTimeout(() => {
            onSecondaryClick?.();
        }, autoClose);
        
        return () => clearTimeout(timer);
    }, [isOpen, autoClose, onSecondaryClick]);

    if (!isOpen) return null;

    const getIcon = () => {
        const iconSize = 48; // Larger icon for the 80px container
        switch(type) {
            case 'success':
                return <CheckCircle size={iconSize} style={{ color: '#17bf63' }} />;
            case 'error':
                return <XCircle size={iconSize} style={{ color: '#dc2626' }} />;
            case 'warning':
                return <AlertCircle size={iconSize} style={{ color: '#d97706' }} />;
            case 'info':
            default:
                return <AlertCircle size={iconSize} style={{ color: '#1d9bf0' }} />;
        }
    };

    const handlePrimary = (e) => {
        e.stopPropagation();
        if (onPrimaryClick) onPrimaryClick();
        if (onClose) onClose();
    };

    const handleSecondary = (e) => {
        e.stopPropagation();
        if (onSecondaryClick) onSecondaryClick();
        if (onClose) onClose();
    };

    return (
        <div className={styles.backdrop} onClick={handleSecondary}>
            <div className={`${styles.modal} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
                {/* Icon */}
                <div className={styles.iconContainer}>
                    {getIcon()}
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {message && <p className={styles.message}>{message}</p>}
                </div>

                {/* Footer Buttons */}
                <div className={styles.footer}>
                    <button 
                        className={`${styles.primaryBtn} ${styles[type]}`}
                        onClick={handlePrimary}
                        disabled={isLoading}
                    >
                        {isLoading && <span className={styles.spinner}></span>}
                        {primaryBtnText}
                    </button>
                    <button 
                        className={styles.secondaryBtn} 
                        onClick={handleSecondary}
                        disabled={isLoading}
                    >
                        {secondaryBtnText}
                    </button>
                </div>
            </div>
        </div>
    );
}
