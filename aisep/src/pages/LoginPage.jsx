import { useState } from 'react';
import { ArrowLeft, Rocket, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { loginUser, getDemoAccounts } from '../data/mockAuth';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLoginSuccess, onShowRegister, onBack }) {
  const [email, setEmail] = useState('demo@startup.com');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const result = loginUser(email, password);

      if (result.success) {
        onLoginSuccess(result.user, result.token);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleQuickLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setShowDemoDropdown(false);
  };

  const demoAccounts = getDemoAccounts();

  return (
    <div className={styles.container}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <button className={styles.mobileBackButton} onClick={onBack} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerLogo}>
          <Rocket size={20} className={styles.headerLogoIcon} />
          <span className={styles.headerLogoText}>AISEP</span>
        </div>
        <div style={{ width: 40 }} /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.loginCard}>
          {/* Logo */}
          <div className={styles.desktopLogo}>
            <Rocket size={36} className={styles.logoIcon} />
            <span className={styles.logoText}>AISEP</span>
          </div>

          <h1 className={styles.title}>Sign in to AISEP</h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className={styles.input}
                  required
                />
                {/* Demo Dropdown Button - Desktop Only */}
                <button
                  type="button"
                  className={styles.demoDropdownBtn}
                  onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                  title="Quick demo login"
                >
                  <ChevronDown size={20} />
                </button>

                {/* Demo Dropdown Menu */}
                {showDemoDropdown && (
                  <div className={styles.demoDropdown}>
                    {demoAccounts.map((acc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className={styles.demoDropdownItem}
                      >
                        <span className={styles.demoIcon}>
                          {acc.role === 'startup' && '🚀'}
                          {acc.role === 'investor' && '💰'}
                          {acc.role === 'advisor' && '👨‍💼'}
                          {acc.role === 'operation_staff' && '⚙️'}
                        </span>
                        <div className={styles.demoInfo}>
                          <div className={styles.demoName}>{acc.name}</div>
                          <div className={styles.demoEmail}>{acc.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              className={styles.forgotButton}
            >
              Forgot password?
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.signupPrompt}>
            Don't have an account?{' '}
            <button onClick={onShowRegister} className={styles.signupLink}>
              Sign up
            </button>
          </div>

          {/* Desktop Back Button - Moved to bottom */}
          <button className={styles.desktopBackButton} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
