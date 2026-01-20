import React, { useState } from 'react';
import styles from './RegisterForms.module.css';

/**
 * OperationStaffRegisterForm Component
 * Registration form for Operation Staff members
 */
export default function OperationStaffRegisterForm({ onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    staffId: '',
    department: 'document_verification',
    permissions: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departmentOptions = [
    { value: 'document_verification', label: 'Document Verification' },
    { value: 'user_approval', label: 'User Approval & Verification' },
    { value: 'monitoring', label: 'Activity Monitoring' },
    { value: 'support', label: 'Support & Complaints' },
  ];

  const permissionOptions = [
    { value: 'verify_documents', label: 'Verify Startup Documents' },
    { value: 'approve_investors', label: 'Approve Investor Registrations' },
    { value: 'approve_advisors', label: 'Approve Advisor Registrations' },
    { value: 'monitor_activity', label: 'Monitor Platform Activity' },
    { value: 'approve_connections', label: 'Approve Connection Requests' },
    { value: 'validate_reports', label: 'Validate Consulting Reports' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.staffId.trim()) {
      newErrors.staffId = 'Staff ID is required';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Please select at least one permission';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const submissionData = {
        role: 'operation_staff',
        ...formData,
      };
      console.log('Operation Staff registration:', submissionData);
      onComplete?.(submissionData);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Operation Staff Registration</h2>

      {/* Personal Information Section */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Personal Information</h3>

        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., John Smith"
            className={errors.name ? styles.inputError : ''}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@company.com"
            className={errors.email ? styles.inputError : ''}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="staffId">Staff ID *</label>
          <input
            type="text"
            id="staffId"
            name="staffId"
            value={formData.staffId}
            onChange={handleInputChange}
            placeholder="e.g., STAFF-001"
            className={errors.staffId ? styles.inputError : ''}
          />
          {errors.staffId && <span className={styles.error}>{errors.staffId}</span>}
        </div>
      </div>

      {/* Department Section */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Department Assignment</h3>

        <div className={styles.formGroup}>
          <label htmlFor="department">Primary Department *</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
          >
            {departmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Section */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Permissions *</h3>
        <p className={styles.sectionDescription}>
          Select the permissions this staff member should have:
        </p>

        <div className={styles.checkboxGroup}>
          {permissionOptions.map((option) => (
            <label key={option.value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.permissions.includes(option.value)}
                onChange={() => handlePermissionToggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {errors.permissions && <span className={styles.error}>{errors.permissions}</span>}
      </div>

      {/* Password Section */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Security</h3>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Minimum 8 characters"
            className={errors.password ? styles.inputError : ''}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter your password"
            className={errors.confirmPassword ? styles.inputError : ''}
          />
          {errors.confirmPassword && (
            <span className={styles.error}>{errors.confirmPassword}</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Create Staff Account'}
      </button>

      <p className={styles.agreement}>
        By registering, you agree to AISEP's Terms of Service and acknowledge your role in
        platform management and oversight.
      </p>
    </form>
  );
}
