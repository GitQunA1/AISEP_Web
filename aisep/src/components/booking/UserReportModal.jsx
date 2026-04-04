import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, AlertCircle, ShieldAlert, Send, Loader, Camera, Video, Image as ImageIcon
} from 'lucide-react';
import userReportService from '../../services/userReportService';
import styles from './UserReportModal.module.css';

/**
 * UserReportModal
 * 
 * Props:
 *   bookingId     {number}   - Optional: Booking ID associated with the report
 *   targetUserId  {string}   - Optional: ID of the user being reported
 *   targetUserName {string}   - Optional: Name of the user being reported
 *   onClose       {fn}
 *   onDone        {fn}       - Callback after success
 */
export default function UserReportModal({ bookingId, targetUserId, targetUserName, onClose, onDone }) {
  const [phase, setPhase] = useState('form'); // form | loading | success | error
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    category: 'PaymentDispute',
    description: '',
    videoEvidenceUrl: '',
  });
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'PaymentDispute', label: 'Tranh chấp thanh toán / báo cáo tư vấn' },
    { value: 'UnprofessionalBehavior', label: 'Hành vi thiếu chuyên nghiệp' },
    { value: 'Harassment', label: 'Quấy rối' },
    { value: 'Scam', label: 'Dấu hiệu lừa đảo' },
    { value: 'Impersonation', label: 'Mạo danh' },
    { value: 'InappropriateContent', label: 'Nội dung không phù hợp' },
    { value: 'Other', label: 'Lý do khác' },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Tối đa 5 hình ảnh minh chứng.');
      return;
    }
    setImages([...images, ...files]);
    setError('');
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      setError('Vui lòng nhập mô tả chi tiết vấn đề.');
      return;
    }

    setPhase('loading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('description', form.description.trim());
      if (bookingId) formData.append('bookingId', bookingId);
      if (targetUserId) formData.append('reportedUserId', targetUserId);
      if (form.videoEvidenceUrl) formData.append('videoEvidenceUrl', form.videoEvidenceUrl.trim());
      
      images.forEach((file) => {
        formData.append('evidenceImages', file);
      });

      await userReportService.createReport(formData);
      setPhase('success');
    } catch (e) {
      setError(e?.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.');
      setPhase('form');
    }
  };

  const content = (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Gửi Khiếu Nại / Báo Cáo</h2>
              <p className={styles.subtitle}>
                {targetUserName ? `Báo cáo về: ${targetUserName}` : bookingId ? `Khiếu nại về Booking #${bookingId}` : 'Báo cáo vi phạm hệ thống'}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {phase === 'loading' && (
            <div className={styles.centered}>
              <Loader size={32} className={styles.spinning} />
              <p className={styles.mutedText}>Đang gửi báo cáo của bạn...</p>
            </div>
          )}

          {phase === 'success' && (
            <div className={styles.centered}>
              <div style={{ color: '#17bf63', marginBottom: '16px' }}>
                <ShieldAlert size={56} />
              </div>
              <h3 className={styles.successTitle}>Khiếu nại đã được gửi thành công</h3>
              <p className={styles.mutedText}>
                Khiếu nại của bạn đã được ghi nhận. Đội ngũ quản trị viên AISEP sẽ xem xét
                và liên hệ với cả hai bên để giải quyết trong vòng 24–48 giờ làm việc.
                Kết quả xử lý sẽ được thông báo qua hệ thống.
              </p>
              <button className={styles.primaryBtn} onClick={() => { onClose(); onDone?.(); }} style={{ marginTop: '24px' }}>
                Đã hiểu
              </button>
            </div>
          )}

          {phase === 'form' && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Loại vi phạm</label>
                <select 
                  className={styles.select}
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Mô tả chi tiết</label>
                <textarea 
                  className={styles.textarea}
                  rows={4}
                  placeholder="Vui lòng mô tả rõ sự việc đã xảy ra..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Bằng chứng hình ảnh (Tối đa 5)</label>
                <div 
                  className={styles.evidenceSection}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={24} style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Nhấn để tải lên ảnh chụp màn hình hoặc bằng chứng</p>
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    multiple 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                
                {images.length > 0 && (
                  <div className={styles.evidenceGrid}>
                    {images.map((img, i) => (
                      <div key={i} className={styles.evidenceItem}>
                        <img src={URL.createObjectURL(img)} alt={`Evidence ${i}`} />
                        <button className={styles.removeImg} onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Link video minh chứng (Nếu có)</label>
                <div style={{ position: 'relative' }}>
                  <Video size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                  <input 
                    className={styles.input}
                    style={{ paddingLeft: '40px' }}
                    placeholder="Link Google Drive, YouTube, v.v."
                    value={form.videoEvidenceUrl}
                    onChange={e => setForm(p => ({ ...p, videoEvidenceUrl: e.target.value }))}
                  />
                </div>
              </div>

              {error && (
                <div className={styles.errorRow}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.footerRow}>
                <button className={styles.secondaryBtn} onClick={onClose}>Hủy</button>
                <button className={styles.primaryBtn} onClick={handleSubmit}>
                  <Send size={16} /> Gửi báo cáo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
