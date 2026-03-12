import { useState } from 'react';
import { ArrowLeft, Rocket, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLoginSuccess, onShowRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      // Check for success using multiple possible backend structures
      const accessToken = response?.accessToken || response?.token || response?.data?.accessToken;
      const refreshToken = response?.refreshToken || response?.data?.refreshToken;
      const isActuallySuccess = !!accessToken;

      if (isActuallySuccess) {
        // Decode the JWT access token to extract user claims
        // The backend returns standard .NET Identity Claim URIs
        let decodedToken = {};
        try {
          const payloadBase64 = accessToken.split('.')[1];
          // Base64Url to Base64
          const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          decodedToken = JSON.parse(jsonPayload);
        } catch (e) {
          console.error("Failed to decode token", e);
        }

        const fallbackData = response?.data || response;
        const rawUser = fallbackData?.user || fallbackData;
        
        // C# Claim URIs
        const claimId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        const claimEmail = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const claimName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const claimRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        // Build a normalized user object with guaranteed userId field
        const user = {
          userId: claimId || rawUser?.id || rawUser?.userId || rawUser?.Id || fallbackData?.id || fallbackData?.userId,
          name: claimName || rawUser?.name || rawUser?.fullName || rawUser?.Name || email.split('@')[0],
          email: claimEmail || rawUser?.email || rawUser?.Email || email,
          role: claimRole || (rawUser?.role !== undefined ? rawUser.role : (rawUser?.Role !== undefined ? rawUser.Role : 'startup')),
        };
        
        // Trigger successful login redirect
        onLoginSuccess(user, accessToken, refreshToken);
      } else {
        setError(response?.message || 'Email hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <button className={styles.mobileBackButton} onClick={onBack} aria-label="Quay lại">
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerLogo}>
          <Rocket size={20} className={styles.headerLogoIcon} />
          <span className={styles.headerLogoText}>AISEP</span>
        </div>
        <div style={{ width: 40 }} />
      </header>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.loginCard}>
          {/* Logo */}
          <div className={styles.desktopLogo}>
            <Rocket size={36} className={styles.logoIcon} />
            <span className={styles.logoText}>AISEP</span>
          </div>

          <h1 className={styles.title}>Đăng nhập vào AISEP</h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Địa chỉ email"
                  className={styles.input}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className={styles.input}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <button
              type="button"
              className={styles.forgotButton}
            >
              Quên mật khẩu?
            </button>
          </form>

          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          <div className={styles.signupPrompt}>
            Chưa có tài khoản?{' '}
            <button onClick={onShowRegister} className={styles.signupLink}>
              Đăng ký ngay
            </button>
          </div>

          {/* Desktop Back Button */}
          <button className={styles.desktopBackButton} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Quay lại trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
