import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import styles from './RejectionReasonModal.module.css';

/**
 * RejectionReasonModal - Form to input rejection reason
 * Refactored for uniform design and theme support.
 */
export default function RejectionReasonModal({ onSubmit, onCancel, projectName }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do từ chối');
            return;
        }
        if (reason.trim().length < 10) {
            setError('Lý do từ chối phải có ít nhất 10 ký tự');
            return;
        }
        onSubmit(reason.trim());
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.headerTitle}>Từ chối dự án</h2>
                    <button onClick={onCancel} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Dự án</label>
                        <div className={styles.projectNameBox}>{projectName}</div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Lý do từ chối <span style={{ color: 'var(--score-poor)' }}>*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập lý do từ chối dự án (tối thiểu 10 ký tự)..."
                            className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
                        />
                        <div style={{ color: '#f4212e', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                            * Lưu ý: Không sử dụng dấu chấm (.) và dấu phẩy (,) do hạn chế của hệ thống.
                        </div>
                        {error && (
                            <div className={styles.errorText}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <div className={styles.charCount}>
                            {reason.length}/10+ ký tự
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <AlertCircle size={18} />
                        <span>Lý do này sẽ được gửi cho người sáng lập startup để họ có thể cải thiện dự án.</span>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.actions}>
                    <button onClick={onCancel} className={styles.secondaryBtn}>
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={reason.trim().length < 10}
                        className={styles.dangerBtn}
                    >
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>
    );
}
