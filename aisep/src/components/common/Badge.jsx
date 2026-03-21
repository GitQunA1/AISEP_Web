import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from './Badge.module.css';

/**
 * Badge Component - Reusable badge for industries, stages, and AI scores
 * @param {string} label - Text to display
 * @param {string} variant - 'industry', 'stage', 'score-good', 'score-medium', 'score-poor', 'updating', 'success'
 * @param {string} className - Optional additional classes
 * @param {boolean} showIcon - Show icon for score badges (default: false)
 * @param {string} size - 'xs', 'sm', 'md' (default: 'md')
 */
function Badge({ label, variant = 'default', size = 'md' }) {
  const isScore = variant.startsWith('score-') || variant === 'updating';
  
  return (
    <div className={`${styles.badge} ${styles[`badge--${variant}`]} ${styles[`badge--${size}`]}`}>
      {isScore && (
        <Sparkles size={size === 'sm' ? 12 : 14} className={styles.badgeIcon} />
      )}
      <span>{label}</span>
    </div>
  );
}

export default Badge;
