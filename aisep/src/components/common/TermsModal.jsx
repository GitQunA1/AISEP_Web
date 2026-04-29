import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, AlertCircle, Loader } from 'lucide-react';
import styles from './TermsModal.module.css';

/**
 * TermsModal - Displays T&C content with full error and loading state support
 */
export default function TermsModal({ isOpen, onClose, termsContent, termsVersion, error, isLoading }) {
    if (!isOpen) return null;

    // Helper to extract error message
    const getErrorMessage = () => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.errors && error.errors.length > 0) return error.errors[0];
        return 'Đã xảy ra lỗi không xác định khi tải điều khoản.';
    };

    const errorMessage = getErrorMessage();

    return createPortal(
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <ShieldCheck size={24} style={{ color: '#1d9bf0' }} />
                        Điều khoản sử dụng {termsVersion && `(${termsVersion})`}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={22} />
                    </button>
                </div>

                {/* Content area */}
                <div className={styles.content}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <Loader size={40} className={styles.spin} style={{ color: 'var(--primary-blue)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Đang tải nội dung điều khoản...</p>
                        </div>
                    ) : errorMessage ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Không thể tải điều khoản</h3>
                            <p style={{ color: '#ef4444', lineHeight: '1.5' }}>{errorMessage}</p>
                        </div>
                    ) : (
                        <div 
                            style={{ lineHeight: '1.7', color: 'var(--text-primary)', fontSize: '15px' }}
                            dangerouslySetInnerHTML={{ __html: termsContent || 'Không có nội dung điều khoản để hiển thị.' }}
                        />
                    )}
                </div>

                {/* Footer - centered for both success and error states */}
                {!isLoading && (
                    <div className={styles.footer}>
                        {errorMessage ? (
                            <button 
                                className={styles.secondaryBtn} 
                                onClick={onClose}
                            >
                                Đóng
                            </button>
                        ) : (
                            <button
                                className={styles.primaryBtn}
                                onClick={onClose}
                            >
                                Tôi đã hiểu
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
