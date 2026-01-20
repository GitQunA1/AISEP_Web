import React, { useState } from 'react';
import { Eye, EyeOff, Loader, ChevronLeft } from 'lucide-react';
import styles from './RegistrationUnique.module.css';

/**
 * InvestorRegisterForm - Simplified credentials
 * Only collects: Full Name, Email, Password
 */
function InvestorRegisterForm({ onBack, onComplete }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Min 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mismatch';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Simulate success response
      const mockResponse = { ...formData, role: 'Investor' };
      onComplete && onComplete(mockResponse);
    }, 1500);
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword;

  return (
    <div className={styles.reg_formCard}>
      <div className={styles.reg_cardHeader}>
        <div className={styles.reg_progressBar}>
          <div className={styles.reg_progressFill} style={{ width: '100%' }} />
        </div>
        <p className={styles.reg_stepIndicator}>Create Your Account</p>
      </div>

      <div className={styles.reg_cardBody}>
        <div className={styles.reg_stepContainer}>
          <div>
            <h2 className={styles.reg_stepTitle}>Welcome to AISEP</h2>
            <p className={styles.reg_stepSubtitle}>Join as an Investor</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.reg_Form}>
            <div className={styles.reg_formGroup} style={{ marginBottom: '16px' }}>
              <label htmlFor="fullName" className={styles.reg_label}>
                Full Name <span className={styles.reg_required}>*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`${styles.reg_input} ${errors.fullName ? styles.reg_inputError : ''}`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.fullName && <p className={styles.reg_errorText}>{errors.fullName}</p>}
            </div>

            <div className={styles.reg_formGroup} style={{ marginBottom: '16px' }}>
              <label htmlFor="email" className={styles.reg_label}>
                Email Address <span className={styles.reg_required}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.reg_input} ${errors.email ? styles.reg_inputError : ''}`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className={styles.reg_errorText}>{errors.email}</p>}
            </div>

            <div className={styles.reg_formGroup} style={{ marginBottom: '16px' }}>
              <label htmlFor="password" className={styles.reg_label}>
                Password <span className={styles.reg_required}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${styles.reg_input} ${errors.password ? styles.reg_inputError : ''}`}
                  placeholder="Minimum 8 characters"
                  disabled={isLoading}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className={styles.reg_errorText}>{errors.password}</p>}
            </div>

            <div className={styles.reg_formGroup} style={{ marginBottom: '16px' }}>
              <label htmlFor="confirmPassword" className={styles.reg_label}>
                Confirm Password <span className={styles.reg_required}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.reg_input} ${errors.confirmPassword ? styles.reg_inputError : ''}`}
                  placeholder="Re-enter password"
                  disabled={isLoading}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className={styles.reg_errorText}>{errors.confirmPassword}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className={styles.reg_submitError}>
                {errors.submit}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className={styles.reg_cardFooter}>
        <button onClick={onBack} className={styles.reg_secondaryButton} disabled={isLoading}>
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={handleSubmit}
          className={styles.reg_primaryButton}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );
}

export default InvestorRegisterForm;