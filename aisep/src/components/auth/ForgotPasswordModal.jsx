import React, { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import authService from '../../services/authService';
import styles from './ForgotPasswordModal.module.css';

/**
 * ForgotPasswordModal — triggered from the "Quên mật khẩu?" button on LoginPage.
 * 
 * Sends POST /api/Auth/forgot-password with the user's email.
 * The backend sends a reset link: {FrontendUrl}/reset-password?userId=...&token=...
 */
export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Icon */}
        <div className={styles.iconCircle}>
          <KeyRound size={28} />
        </div>

        {!success ? (
          <>
            <h2 className={styles.title}>Quên mật khẩu?</h2>
            <p className={styles.desc}>
              Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu đến hộp thư của bạn.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="forgot-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Địa chỉ email"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className={styles.errorMsg}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading || !email.trim()}
              >
                {isLoading
                  ? <><Loader2 size={16} className={styles.spinner} /> Đang gửi...</>
                  : 'Gửi đường dẫn đặt lại'
                }
              </button>

              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Quay lại đăng nhập
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckCircle size={40} />
            </div>
            <h2 className={styles.title}>Đã gửi!</h2>
            <p className={styles.desc}>
              Nếu địa chỉ email <strong>{email}</strong> tồn tại trong hệ thống, 
              chúng tôi đã gửi đường dẫn đặt lại mật khẩu. 
              Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).
            </p>
            <button className={styles.submitBtn} onClick={onClose} style={{ marginTop: 8 }}>
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
