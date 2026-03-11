import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import styles from './SuccessModal.module.css';

/**
 * SuccessModal - Shows success confirmation after form submission
 */
export default function SuccessModal({ onClose, title, message }) {
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
                    {title || 'Submission Successful!'}
                </h2>

                <p className={styles.message}>
                    {message || 'Your startup profile has been submitted successfully. Our team will review it and get back to you soon.'}
                </p>

                <button className={styles.primaryButton} onClick={onClose}>
                    Done
                </button>
            </div>
        </div>
    );
}
