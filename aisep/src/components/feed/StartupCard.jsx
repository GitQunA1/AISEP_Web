import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  Lock,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import styles from './StartupCard.module.css';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * StartupCard Component - "Smart Density" Redesign
 * Layout: Avatar (Left Side) | Content (Right Side)
 */
function StartupCard({ startup, isPremium = false, user }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAdvisorActions, setShowAdvisorActions] = useState(false);

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
      {/* LEFT COLUMN: AVATAR */}
      <div className={styles.avatarColumn}>
        <Avatar src={startup.logo} alt={startup.name} name={startup.name} size="md" />
      </div>

      {/* RIGHT COLUMN: CONTENT */}
      <div className={styles.contentColumn}>

        {/* ROW 1: HEADLINE (Name, Badges, Time, Menu) */}
        <div className={styles.headerRow}>
          <div className={styles.infoGroup}>
            <h3 className={styles.name}>{startup.name}</h3>
            {/* Verified/Score Badge */}
            <Badge
              label={`${startup.aiScore}`}
              variant={getScoreBadgeVariant()}
              showIcon={true}
              size="sm"
            />
            <span className={styles.separator}>·</span>
            <span className={styles.time}>{startup.timestamp}</span>
          </div>

          <button className={styles.menuBtn}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Industry/Stage Badges (Optional secondary line or inline) */}
        <div className={styles.badgeRow}>
          <Badge label={startup.industry} variant="industry" size="xs" />
          <Badge label={startup.stage} variant="stage" size="xs" />
        </div>

        {/* ROW 2: DESCRIPTION */}
        <p className={styles.description}>{startup.description}</p>

        {/* ROW 3: PREMIUM CTA (Slim Strip) */}
        <div className={styles.premiumZone}>
          {!isPremium ? (
            <div className={styles.premiumTease}>
              <div className={styles.lockIcon}>
                <Lock size={14} />
              </div>
              <span className={styles.teaseText}>Unlock financial data & funding ask</span>
              <button className={styles.subscribeBtn}>Subscribe</button>
            </div>
          ) : (
            <div className={styles.dataGrid}>
              {/* Real Data for Premium Users */}
              <span>{startup.sensitiveData.revenue}</span>
              <span>{startup.sensitiveData.fundingAsk}</span>
            </div>
          )}
        </div>

        {/* ROW 4: ACTIONS */}
        <div className={styles.actionRow}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            <Heart size={16} />
            <span>24</span>
          </button>

          <button className={styles.actionBtn}>
            <MessageCircle size={16} />
            <span>Reply</span>
          </button>

          <button className={styles.actionBtn}>
            <Share2 size={16} />
          </button>

          <button
            className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={handleBookmark}
          >
            <Bookmark size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default StartupCard;
