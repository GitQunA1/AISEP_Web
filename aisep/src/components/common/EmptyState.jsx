import React from 'react';
import styles from './EmptyState.module.css';

/**
 * EmptyState - A premium, reusable empty or error view with glassmorphism effects.
 * 
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.title - Main heading text
 * @param {string} props.message - Descriptive message
 * @param {Function} [props.onRetry] - Optional callback for a retry button
 * @param {boolean} [props.isError=false] - Whether this represents an error state
 */
const EmptyState = ({ icon: Icon, title, message, onRetry, isError = false }) => {
    return (
        <div className={styles.emptyStateContainer}>
            <div className={styles.emptyStateIconWrapper}>
                <Icon 
                    size={32} 
                    strokeWidth={2} 
                    color={isError ? '#ef4444' : 'var(--primary-blue)'} 
                />
            </div>
            <h4 className={styles.emptyStateTitle}>{title}</h4>
            <p className={styles.emptyStateMessage}>{message}</p>
            {onRetry && (
                <button className={styles.retryBtn} onClick={onRetry}>
                    Thử lại
                </button>
            )}
        </div>
    );
};

export default EmptyState;
