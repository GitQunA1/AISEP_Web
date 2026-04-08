import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader, MapPin, User, Mail, Phone, Globe, AlertTriangle } from 'lucide-react';
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

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={(e) => { e.stopPropagation(); handleClose(); }}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Send size={24} className={styles.titleIcon} />
            <div>
              <h2 className={styles.title}>Yêu cầu thông tin dự án</h2>
              <p className={styles.subtitle}>{projectName}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Dự án</label>
            <div className={styles.staticField}>{projectName}</div>
          </div>
          
          {/* Founder Info Section */}
          {isLoadingFounder ? (
            <div className={styles.infoBox}>
              <Loader size={18} className={styles.spinner} />
              <p>Đang tải thông tin liên hệ...</p>
            </div>
          ) : founderInfo ? (
            <div className={styles.founderSection}>
              <h4 className={styles.label}>Thông tin liên lạc</h4>
              <div className={styles.founderGrid}>
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
            </div>
          ) : null}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="message">Tin nhắn (Bắt buộc)</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hãy giới thiệu bản thân và lý do bạn quan tâm đến dự án này..."
                rows={5}
                disabled={isLoading}
                className={styles.textarea}
              />
              <p className={styles.hint}>Min 10 ký tự, max 500 ký tự</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorBox}>
                <AlertTriangle size={18} />
                <p className={styles.errorText}>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={styles.successBox}>
                <div className={styles.successContent}>
                  <div className={styles.successIcon}>✓</div>
                  <p className={styles.successText}>{success}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            {!success && (
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleClose}
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
                      <Loader size={18} className={styles.spinner} />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Gửi yêu cầu
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RequestInfoModal;
