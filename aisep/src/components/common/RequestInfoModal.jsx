import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader, MapPin, User, Mail, Phone, Globe } from 'lucide-react';
import styles from './RequestInfoModal.module.css';
import connectionService from '../../services/connectionService';

/**
 * RequestInfoModal - Modal for investor to request info/contact startup
 * Shows when investor clicks "Yêu cầu thông tin" button
 */
function RequestInfoModal({ isOpen, onClose, projectId, projectName, onSuccess }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [founderInfo, setFounderInfo] = useState(null);
  const [isLoadingFounder, setIsLoadingFounder] = useState(false);

  // Fetch founder contact info when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      fetchFounderInfo();
    }
  }, [isOpen, projectId]);

  const fetchFounderInfo = async () => {
    setIsLoadingFounder(true);
    try {
      const response = await connectionService.getFounderContact(projectId);
      console.log('[RequestInfoModal] Founder info:', response);
      
      if (response && response.data) {
        setFounderInfo(response.data);
      }
    } catch (err) {
      console.error('[RequestInfoModal] Failed to fetch founder info:', err);
      // Don't show error to user, just fail silently
    } finally {
      setIsLoadingFounder(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Vui lòng nhập tin nhắn');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await connectionService.createConnectionRequest(projectId, message);
      console.log('[RequestInfoModal] Request sent:', response);
      
      if (response && (response.success || response.data)) {
        setSuccess('✓ Yêu cầu đã được gửi! Startup sẽ xem xét và liên hệ với bạn.');
        setMessage('');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setError(response?.message || 'Không thể gửi yêu cầu');
      }
    } catch (err) {
      console.error('[RequestInfoModal] Error:', err);
      setError(err?.message || 'Lỗi: Không thể gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Yêu cầu thông tin dự án</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.projectName}>Dự án: <strong>{projectName}</strong></p>
          
          {/* Founder Info Section */}
          {isLoadingFounder ? (
            <div className={styles.loadingSection}>
              <Loader size={16} className={styles.spinner} />
              <span>Đang tải thông tin...</span>
            </div>
          ) : founderInfo ? (
            <div className={styles.founderInfo}>
              <h4 className={styles.founderTitle}>Thông tin liên lạc</h4>
              
              {founderInfo.companyName && (
                <div className={styles.infoRow}>
                  <Globe size={14} />
                  <span>{founderInfo.companyName}</span>
                </div>
              )}
              
              {founderInfo.founder && (
                <div className={styles.infoRow}>
                  <User size={14} />
                  <span>{founderInfo.founder}</span>
                </div>
              )}
              
              {founderInfo.email && (
                <div className={styles.infoRow}>
                  <Mail size={14} />
                  <span>{founderInfo.email}</span>
                </div>
              )}
              
              {founderInfo.phoneNumber && (
                <div className={styles.infoRow}>
                  <Phone size={14} />
                  <span>{founderInfo.phoneNumber}</span>
                </div>
              )}
              
              {founderInfo.country_city && (
                <div className={styles.infoRow}>
                  <MapPin size={14} />
                  <span>{founderInfo.country_city}</span>
                </div>
              )}
            </div>
          ) : null}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="message">Tin nhắn (Bắt buộc)</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hãy giới thiệu bản thân và lý do bạn quan tâm đến dự án này..."
                rows={6}
                disabled={isLoading}
                className={styles.textarea}
              />
              <p className={styles.hint}>Min 10 ký tự, max 500 ký tự</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={styles.successMessage}>
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={styles.cancelBtn}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={styles.submitBtn}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className={styles.spinner} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RequestInfoModal;
