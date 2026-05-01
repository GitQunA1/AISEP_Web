import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, ChatCenteredText, CircleNotch, PaperPlaneTilt, Sparkle } from '@phosphor-icons/react';
import styles from './ReviewModal.module.css';
import reviewService from '../../services/reviewService';

/**
 * ReviewModal
 * 
 * Props:
 *   booking {object} - The booking object being rated
 *   onClose {fn}     - Close modal callback
 *   onDone  {fn}     - Success callback
 */
export default function ReviewModal({ booking, onClose, onDone, viewerRole = 'Customer' }) {
    const existingReview = booking?.existingReview;
    const isReadOnly = !!existingReview;

    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState(existingReview?.reviewContent || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const advisorName = booking.advisorName || 'Cố vấn';
    const projectName = booking.projectName || 'Dự án';

    const handleSubmit = async () => {
        if (isReadOnly) {
            onClose();
            return;
        }

        if (rating === 0) {
            setError('Vui lòng chọn số sao để đánh giá.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                bookingId: booking.id || booking.bookingId,
                rating: rating,
                reviewContent: content.trim() || undefined
            };

            await reviewService.createReview(payload);
            onDone?.();
        } catch (err) {
            console.error('[ReviewModal] Submit failed:', err);
            setError(err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalContent = (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <div className={styles.headerIcon}>
                            <Sparkle size={24} weight="fill" />
                        </div>
                        <h2 className={styles.title}>
                            {isReadOnly ? (['Advisor', 'Staff'].includes(viewerRole) ? 'Đánh giá từ khách hàng' : 'Đánh giá của bạn') : 'Đánh giá buổi tư vấn'}
                        </h2>
                        <p className={styles.subtitle}>
                            {isReadOnly ? (['Advisor', 'Staff'].includes(viewerRole) ? 'Nội dung đánh giá cho buổi tư vấn này' : 'Nội dung bạn đã gửi cho buổi tư vấn này') : 'Chia sẻ trải nghiệm của bạn về buổi tư vấn này'}
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Advisor Details */}
                    <div className={styles.advisorPreview}>
                        <div className={styles.advisorAvatar}>
                            {advisorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className={styles.advisorName}>{advisorName}</div>
                            <div className={styles.advisorRole}>{projectName}</div>
                        </div>
                    </div>

                    {/* Star Rating Section */}
                    <div>
                        <label className={styles.ratingLabel}>
                            {isReadOnly ? (['Advisor', 'Staff'].includes(viewerRole) ? 'Mức độ hài lòng của khách hàng' : 'Đánh giá của bạn') : 'Bạn cảm thấy buổi tư vấn thế nào?'}
                        </label>
                        <div className={styles.starRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`${styles.starBtn} ${isReadOnly ? styles.readOnly : ''}`}
                                    onMouseEnter={() => !isReadOnly && setHoverRating(star)}
                                    onMouseLeave={() => !isReadOnly && setHoverRating(0)}
                                    onClick={() => !isReadOnly && setRating(star)}
                                    type="button"
                                    disabled={isReadOnly}
                                >
                                    <Star 
                                        size={42} 
                                        weight={(hoverRating || rating) >= star ? "fill" : "regular"}
                                        className={(hoverRating || rating) >= star ? styles.starActive : ''}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className={styles.commentField}>
                        <label className={styles.label}>Nhận xét thêm</label>
                        <textarea
                            className={styles.textarea}
                            rows={4}
                            placeholder={isReadOnly ? "Không có nhận xét" : "Điều gì khiến bạn hài lòng hoặc cần cải thiện?"}
                            value={content}
                            onChange={(e) => !isReadOnly && setContent(e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#f4212e', fontSize: '13px', marginTop: '12px', textAlign: 'center', fontWeight: '600' }}>
                           {error}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.footer}>
                    {isReadOnly ? (
                        <button className={styles.primaryBtn} onClick={onClose} style={{ width: '100%' }}>
                            Đóng
                        </button>
                    ) : (
                        <>
                            <button className={styles.secondaryBtn} onClick={onClose} disabled={isSubmitting}>
                                Bỏ qua
                            </button>
                            <button 
                                className={styles.primaryBtn} 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || rating === 0}
                            >
                                {isSubmitting ? (
                                    <CircleNotch size={18} className={styles.spinning} weight="bold" />
                                ) : (
                                    <PaperPlaneTilt size={18} weight="bold" />
                                )}
                                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
