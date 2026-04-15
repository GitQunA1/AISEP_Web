import { useState, useEffect } from 'react';
import { Rocket, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, KeyRound, ShieldCheck, ChevronRight } from 'lucide-react';
import authService from '../services/authService';
import loginStyles from './LoginPage.module.css';
import rpStyles from './ResetPasswordPage.module.css';

/**
 * ResetPasswordPage - Premium, X-inspired password reset experience
 * Handles parameter extraction from URL and provides robust validation.
 */
export default function ResetPasswordPage({ onGoToLogin }) {
  const [params, setParams] = useState({ userId: '', token: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paramError, setParamError] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Extract params from URL on mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const uid = queryParams.get('userId');
    const tok = queryParams.get('token');
    
    if (!uid || !tok) {
      setParamError('Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    } else {
      setParams({ userId: uid, token: tok });
    }
  }, []);

  // Countdown for redirection
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      onGoToLogin();
    }
  }, [success, countdown, onGoToLogin]);

  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthMap = {
    0: { label: '', class: '' },
    1: { label: 'Yếu', class: 'weak' },
    2: { label: 'Trung bình', class: 'medium' },
    3: { label: 'Mạnh', class: 'strong' },
    4: { label: 'Rất mạnh', class: 'strong' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(params.userId, params.token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Đặt lại mật khẩu thất bại. Đường dẫn có thể đã hết hạn hoặc không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={loginStyles.container}>
      <div className={loginStyles.contentWrapper}>
        <div className={rpStyles.formCard}>
          {/* Logo */}
          <div className={rpStyles.centered}>
            <div className={loginStyles.desktopLogo} style={{ display: 'flex', marginBottom: 0 }}>
              <Rocket size={40} className={loginStyles.logoIcon} />
              <span className={loginStyles.logoText}>AISEP</span>
            </div>
          </div>

          {paramError ? (
            /* --- Error: Invalid Link --- */
            <div className={rpStyles.centered}>
              <div className={rpStyles.iconCircle} style={{ background: 'rgba(244,33,46,0.1)', color: '#f4212e' }}>
                <AlertCircle size={36} />
              </div>
              <h1 className={loginStyles.title}>Đường dẫn không hợp lệ</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 32, lineHeight: 1.6 }}>
                {paramError} <br />Vui lòng yêu cầu lại đường dẫn mới từ trang đăng nhập.
              </p>
              <button className={loginStyles.loginButton} onClick={onGoToLogin}>
                Quay lại đăng nhập
              </button>
            </div>
          ) : success ? (
            /* --- Success: Password Changed --- */
            <div className={rpStyles.centered}>
              <div className={rpStyles.successCheckmark}>
                <CheckCircle size={48} />
              </div>
              <h1 className={loginStyles.title} style={{ marginBottom: 16 }}>Thành công!</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 32, lineHeight: 1.6 }}>
                Mật khẩu của bạn đã được cập nhật thành công. <br />
                Đang chuyển hướng về trang đăng nhập trong <strong>{countdown}</strong> giây...
              </p>
              <button className={loginStyles.loginButton} onClick={onGoToLogin}>
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            /* --- Form: Reset Password --- */
            <>
              <div className={rpStyles.centered}>
                <h1 className={loginStyles.title} style={{ marginBottom: 8, textAlign: 'center' }}>Đặt lại mật khẩu</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 32, textAlign: 'center' }}>
                  Vui lòng tạo mật khẩu mới an toàn cho tài khoản của bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={loginStyles.form}>
                {/* New Password */}
                <div className={loginStyles.inputGroup}>
                  <div className={loginStyles.inputWrapper}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới"
                      className={loginStyles.input}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={loginStyles.passwordToggle}
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Enhanced Strength Indicator */}
                  {newPassword && (
                    <div className={rpStyles.strengthWrap}>
                      <div className={rpStyles.strengthHeader}>
                        <span className={rpStyles.strengthHint}>Độ bảo mật:</span>
                        <span className={`${rpStyles.strengthLabel} ${rpStyles[strengthMap[strength].class]}`}>
                          {strengthMap[strength].label}
                        </span>
                      </div>
                      <div className={rpStyles.strengthBarContainer}>
                        {[1, 2, 3, 4].map((seg) => (
                          <div 
                            key={seg} 
                            className={`${rpStyles.strengthSegment} ${strength >= seg ? rpStyles.active + ' ' + rpStyles[strengthMap[strength].class] : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={loginStyles.inputGroup}>
                  <div className={loginStyles.inputWrapper}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu mới"
                      className={loginStyles.input}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={loginStyles.passwordToggle}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={loginStyles.error} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={loginStyles.loginButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Đang xử lý...'
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>

                <button
                  type="button"
                  className={loginStyles.forgotButton}
                  onClick={onGoToLogin}
                  style={{ 
                    marginTop: '-8px', 
                    height: '52px', 
                    fontSize: '17px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Quay lại đăng nhập
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
