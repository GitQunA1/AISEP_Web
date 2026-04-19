import React, { useState } from 'react';
import { X, AlertCircle, Clock, Calendar, Users, Briefcase, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './BookingRejectionModal.module.css';

/**
 * BookingRejectionModal - Modal để advisor nhập lý do từ chối booking
 */
export default function BookingRejectionModal({ booking, onSubmit, onCancel, submitError }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do từ chối');
            return;
        }
        if (reason.trim().length < 5) {
            setError('Lý do từ chối phải có ít nhất 5 ký tự');
            return;
        }
        if (reason.length > 500) {
            setError('Lý do từ chối không được vượt quá 500 ký tự');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await onSubmit(reason.trim());
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    // Format date và time
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.getUTCHours().toString().padStart(2, '0') + ':' +
               d.getUTCMinutes().toString().padStart(2, '0');
    };

    const displayProjectName = booking.projectName || 'Dự án';
    const customerName = booking.customerName || 'Khách hàng';

    return createPortal(
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerIcon} style={{ background: 'rgba(244, 33, 46, 0.1)', color: '#f4212e' }}>
                        <AlertCircle size={24} />
                    </div>
                    <h2 className={styles.headerTitle}>Từ chối booking</h2>
                    <p className={styles.headerSubtitle}>
                        Bạn đang từ chối yêu cầu tư vấn từ <strong>{customerName}</strong>
                    </p>
                    <button onClick={onCancel} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {/* Booking Info Summary */}
                    <div className={styles.bookingSummary}>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryIcon}><Briefcase size={16} /></div>
                            <div className={styles.summaryContent}>
                                <span className={styles.summaryLabel}>Dự án</span>
                                <span className={styles.summaryValue}>{displayProjectName}</span>
                            </div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryIcon}><Calendar size={16} /></div>
                            <div className={styles.summaryContent}>
                                <span className={styles.summaryLabel}>Ngày</span>
                                <span className={styles.summaryValue}>{formatDate(booking.startTime)}</span>
                            </div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryIcon}><Clock size={16} /></div>
                            <div className={styles.summaryContent}>
                                <span className={styles.summaryLabel}>Thời gian</span>
                                <span className={styles.summaryValue}>
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryIcon}><Users size={16} /></div>
                            <div className={styles.summaryContent}>
                                <span className={styles.summaryLabel}>Khách hàng</span>
                                <span className={styles.summaryValue}>{customerName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className={styles.formSection}>
                        <label className={styles.label}>
                            Lý do từ chối <span style={{ color: '#f4212e' }}>*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                                if (submitError) {} // Clear parent error when user types
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập lý do bạn từ chối booking này. Lý do này sẽ được gửi cho khách hàng."
                            className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
                            maxLength={500}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            {(error || submitError) && (
                                <div className={styles.errorText}>
                                    <AlertCircle size={14} />
                                    {error || submitError}
                                </div>
                            )}
                            <div className={styles.charCount}>
                                {reason.length}/500 ký tự
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className={styles.infoBox}>
                        <AlertCircle size={16} />
                        <div>
                            <strong>Lưu ý:</strong>
                            <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '13px' }}>
                                <li>Lý do từ chối sẽ được gửi thông báo cho khách hàng</li>
                                <li>Khoảng thời gian đã chọn sẽ được giải phóng để khách hàng đặt lại</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button onClick={onCancel} disabled={isLoading} className={styles.cancelBtn}>
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={reason.trim().length < 5 || isLoading}
                        className={styles.confirmBtn}
                    >
                        {isLoading ? (
                            <span className={styles.loadingContainer}>
                                <Loader2 className={styles.spinner} size={16} />
                                Đang xử lý...
                            </span>
                        ) : (
                            'Xác nhận từ chối'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
