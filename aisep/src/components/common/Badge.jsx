import { Sparkles, Loader2 } from 'lucide-react';
import styles from './Badge.module.css';

/**
 * Badge Component - Reusable badge for industries, stages, and AI scores
 * @param {string} label - Text to display
 * @param {string} variant - 'industry', 'stage', 'score-good', 'score-medium', 'score-poor', 'updating', 'success'
 * @param {string} className - Optional additional classes
 * @param {boolean} showIcon - Show icon for score badges (default: false)
 * @param {string} size - 'xs', 'sm', 'md' (default: 'md')
 * @param {boolean} isLoading - Show loading spinner
 */
function Badge({ label, variant = 'default', size = 'md', isLoading = false }) {
  const isScore = variant.startsWith('score-') || variant === 'updating';
  
  return (
    <div className={`${styles.badge} ${styles[`badge--${variant}`]} ${styles[`badge--${size}`]}`}>
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 12 : 14} className={`${styles.badgeIcon} ${styles.spinIcon}`} />
      ) : isScore ? (
        <Sparkles size={size === 'sm' ? 12 : 14} className={styles.badgeIcon} />
      ) : null}
      {label && <span>{label}</span>}
    </div>
  );
}

export default Badge;
