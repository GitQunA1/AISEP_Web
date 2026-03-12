import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import styles from './AdvisorBookingModal.module.css';
import bookingService from '../../services/bookingService';

export default function AdvisorBookingModal({ advisor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '09:00',
    endTime: '10:00',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initial = (advisor.userName || 'A').charAt(0).toUpperCase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingDate) {
      setError('Vui lòng chọn ngày hẹn');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create true DateTime strings for submission
      const startDateTime = new Date(`${formData.bookingDate}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.bookingDate}T${formData.endTime}:00`);
      
      const payload = {
        advisorId: advisor.advisorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };

      await bookingService.createBooking(payload);
      
      if (onSuccess) {
          onSuccess(advisor.advisorId);
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi tạo lịch đặt:', err);
      setError('Đã xảy ra lỗi khi tạo lịch hẹn. Hãy thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.headerTitle}>Đặt Hẹn Với Cố Vấn</h2>
            <p className={styles.headerSubtitle}>Gửi yêu cầu kết nối và sắp xếp thời gian biểu</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          {/* Advisor Preview Card */}
          <div className={styles.advisorPreview}>
            {advisor.profileImage ? (
              <img src={advisor.profileImage} alt={advisor.userName} className={styles.avatar} />
            ) : (
              <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {initial}
              </div>
            )}
            <div className={styles.advisorInfo}>
              <span className={styles.advisorName}>{advisor.userName}</span>
              <span className={styles.advisorExpertise}>{advisor.expertise || 'Cố vấn chuyên gia'}</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ngày Hẹn <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              min={minDate}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Thời Gian Bắt Đầu <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Thời Gian Kết Thúc <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup} style={{ marginTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              *Lưu ý: Thời gian hẹn có thể được điều chỉnh sau khi hai bên thỏa thuận.
            </p>
          </div>
        </form>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.secondaryBtn}
            disabled={isSubmitting}
          >
            Hủy Bỏ
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.bookingDate}
            className={styles.primaryBtn}
          >
            {isSubmitting ? '⏳ Đang gửi...' : 'Gửi Yêu Cầu Kết Nối'}
          </button>
        </div>
      </div>
    </div>
  );
}
