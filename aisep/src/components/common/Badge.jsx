import React from 'react';
import styles from './Badge.module.css';

/**
 * Badge Component - Reusable badge for industries, stages, and AI scores
 * @param {string} label - Text to display
 * @param {string} variant - 'industry', 'stage', 'score-good', 'score-medium', 'score-poor'
 * @param {string} className - Optional additional classes
 */
function Badge({ label, variant = 'industry', className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${variant}`]} ${className}`}>
      {label}
    </span>
  );
}

export default Badge;
