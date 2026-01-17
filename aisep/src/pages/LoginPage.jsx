import { useState } from 'react';
import { Rocket, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser, getDemoAccounts } from '../data/mockAuth';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLoginSuccess, onShowRegister }) {
  const [email, setEmail] = useState('demo@startup.com');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

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
  };

  const demoAccounts = getDemoAccounts();

  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Login Form */}
      <div className={styles.loginCard}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoBox}>
            <Rocket size={48} color="white" strokeWidth={1.5} />
          </div>
          <h1 className={styles.appTitle}>AISEP</h1>
          <p className={styles.appSubtitle}>
            Connect Startups, Investors & Advisors
          </p>
        </div>

        {/* Demo Accounts Section */}
        {showDemoAccounts && (
          <div className={styles.demoAccountsSection}>
            <div className={styles.demoHeader}>
              <h3>📋 Quick Login (Demo)</h3>
              <button
                className={styles.closeDemoBtn}
                onClick={() => setShowDemoAccounts(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className={styles.demoAccountsList}>
              {demoAccounts.map((acc, idx) => (
                <div
                  key={idx}
                  className={styles.demoAccountItem}
                  onClick={() => handleQuickLogin(acc)}
                >
                  <div className={`${styles.demoAccountRole} ${styles[`role${acc.role.charAt(0).toUpperCase() + acc.role.slice(1)}`]}`}>
                    {acc.role === 'startup' && '🚀'}
                    {acc.role === 'investor' && '💰'}
                    {acc.role === 'advisor' && '👨‍💼'}
                    <span>{acc.role}</span>
                  </div>
                  <div className={styles.demoAccountInfo}>
                    <p className={styles.demoName}>{acc.name}</p>
                    <p className={styles.demoEmail}>{acc.email}</p>
                  </div>
                  <span className={styles.quickLoginArrow}>→</span>
                </div>
              ))}
            </div>
            <p className={styles.demoHint}>💡 Click any account to auto-fill credentials</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className={styles.loginFooter}>
          <p>
            New to AISEP?{' '}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={onShowRegister}
            >
              Create account
            </button>
          </p>
          <p className={styles.forgotLink}>
            <a href="#forgot">Forgot password?</a>
          </p>
        </div>
      </div>

      {/* Right Side - Features & Benefits */}
      <div className={styles.loginSidebar}>
        <div className={styles.sidebarContent}>
          <h2 className={styles.sidebarTitle}>Welcome to AISEP</h2>
          <p className={styles.sidebarSubtitle}>
            The ultimate ecosystem for startups, investors, and advisors
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.startup}`}>🚀</div>
              <h3>For Startups</h3>
              <ul>
                <li>Present your project</li>
                <li>Get AI evaluation</li>
                <li>Find investors & advisors</li>
                <li>Verify your IP</li>
              </ul>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.investor}`}>💰</div>
              <h3>For Investors</h3>
              <ul>
                <li>Search startups</li>
                <li>AI-powered insights</li>
                <li>Trend analysis</li>
                <li>Easy collaboration</li>
              </ul>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.advisor}`}>👨‍💼</div>
              <h3>For Advisors</h3>
              <ul>
                <li>Consulting requests</li>
                <li>Manage appointments</li>
                <li>Share expertise</li>
                <li>Build reputation</li>
              </ul>
            </div>
          </div>

          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Startups</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>200+</span>
              <span className={styles.statLabel}>Investors</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>150+</span>
              <span className={styles.statLabel}>Advisors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
