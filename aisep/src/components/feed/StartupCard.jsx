import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  Lock,
  Heart,
  MessageCircle,
} from 'lucide-react';
import styles from './StartupCard.module.css';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * StartupCard Component - Displays individual startup profile in feed
 * Mimics Twitter/X card design with premium content blur
 * @param {object} startup - Startup data object
 * @param {boolean} isPremium - Whether user has premium access (default: false)
 */
function StartupCard({ startup, isPremium = false }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Determine AI score badge variant
  const getScoreBadgeVariant = () => {
    if (startup.aiScore >= 80) return 'score-good';
    if (startup.aiScore >= 50) return 'score-medium';
    return 'score-poor';
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <article className={styles.card}>
      {/* Card Header with Avatar, Name, Username, Timestamp */}
      <div className={styles.header}>
        <Avatar src={startup.logo} alt={startup.name} name={startup.name} size="md" />
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{startup.name}</h3>
            <Badge
              label={`AI Score: ${startup.aiScore}`}
              variant={getScoreBadgeVariant()}
            />
          </div>
          <p className={styles.username}>{startup.username}</p>
          <p className={styles.timestamp}>{startup.timestamp}</p>
        </div>
      </div>

      {/* Sub-header with Industry and Stage Badges */}
      <div className={styles.badgeRow}>
        <Badge label={startup.industry} variant="industry" />
        <Badge label={startup.stage} variant="stage" />
      </div>

      {/* Pitch Description */}
      <p className={styles.description}>{startup.description}</p>

      {/* Premium Zone - Sensitive Data with Blur Overlay */}
      <div className={styles.premiumZone}>
        {/* Fake blurred data - always shown but blurred if not premium */}
        <div className={`${styles.dataGrid} ${!isPremium ? styles.dataGridBlurred : ''}`}>
          <div className={styles.dataItem}>
            <span className={styles.label}>Monthly Revenue</span>
            <span className={styles.value}>{startup.sensitiveData.revenue}</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.label}>Funding Ask</span>
            <span className={styles.value}>{startup.sensitiveData.fundingAsk}</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.label}>Contact</span>
            <span className={styles.value}>{startup.sensitiveData.email}</span>
          </div>
        </div>

        {/* Blur Overlay - Only visible if not premium */}
        {!isPremium && (
          <div className={styles.blurOverlay}>
            <div className={styles.overlayContent}>
              <Lock size={32} color="var(--text-black)" strokeWidth={2.5} />
              <p className={styles.overlayText}>Subscribe to View</p>
              <Button variant="primary">
                Unlock Premium
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer - Save, Share, Like */}
      <div className={styles.footer}>
        <button
          className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
          onClick={handleLike}
          aria-label="Like startup"
        >
          <Heart size={18} />
          <span>Like</span>
        </button>
        <button
          className={styles.actionBtn}
          aria-label="Comment"
        >
          <MessageCircle size={18} />
          <span>Message</span>
        </button>
        <button
          className={styles.actionBtn}
          aria-label="Share"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
        <button
          className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
          onClick={handleBookmark}
          aria-label="Bookmark startup"
        >
          <Bookmark size={18} />
          <span>Save</span>
        </button>
      </div>
    </article>
  );
}

export default StartupCard;
