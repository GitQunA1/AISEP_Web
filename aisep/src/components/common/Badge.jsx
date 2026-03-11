import React from 'react';
import { Zap } from 'lucide-react';
import styles from './Badge.module.css';

/**
 * Badge Component - Reusable badge for industries, stages, and AI scores
 * @param {string} label - Text to display
 * @param {string} variant - 'industry', 'stage', 'score-good', 'score-medium', 'score-poor'
 * @param {string} className - Optional additional classes
 * @param {boolean} showIcon - Show icon for score badges (default: false)
 */
function Badge({ label, variant = 'industry', className = '', showIcon = false }) {
  const isScoreBadge = variant.startsWith('score-');

  return (
    <span className={`${styles.badge} ${styles[`badge--${variant}`]} ${className}`}>
      {isScoreBadge && showIcon && (
        <Zap size={14} className={styles.badgeIcon} />
      )}
      {variant === 'updating' && showIcon && (
        <Zap size={14} className={styles.badgeIcon} />
      )}
      {isScoreBadge ? `AI ${label}` : label}
    </span>
  );
}

export default Badge;
