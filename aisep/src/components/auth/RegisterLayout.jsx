import React from 'react';
import { Rocket } from 'lucide-react';
import styles from './RegisterLayout.module.css';

/**
 * RegisterLayout Component
 * Wrapper layout for registration forms
 * Provides header, logo, and centered container
 */
function RegisterLayout({ children, onBack, step, totalSteps }) {
  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <Rocket size={28} className={styles.logoIcon} />
          <span className={styles.logoText}>AISEP</span>
        </div>
      </div>

      {/* Form Content */}
      <main className={styles.formWrapper}>{children}</main>

      {/* Footer Spacer */}
      <div className={styles.spacer} />
    </div>
  );
}

export default RegisterLayout;
