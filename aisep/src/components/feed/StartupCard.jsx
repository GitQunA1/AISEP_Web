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
function StartupCard({ startup, isPremium = false, user, onViewProfile }) {
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
      {/* LEFT COLUMN: AVATAR — clickable */}
      <div className={styles.avatarColumn}>
        <button
          className={styles.avatarBtn}
          onClick={() => onViewProfile && onViewProfile(startup.startupId ?? startup.id)}
          title={`Xem hồ sơ ${startup.name}`}
        >
          <Avatar src={startup.logo} alt={startup.name} name={startup.name} size="md" />
        </button>
      </div>

      {/* RIGHT COLUMN: CONTENT */}
      <div className={styles.contentColumn}>

        {/* ROW 1: HEADLINE (Name, Badges, Time, Menu) */}
        <div className={styles.headerRow}>
          <div className={styles.infoGroup}>
            <h3
              className={`${styles.name} ${onViewProfile ? styles.nameClickable : ''}`}
              onClick={() => onViewProfile && onViewProfile(startup.startupId ?? startup.id)}
            >
              {startup.name}
            </h3>
            {/* Verified/Score Badge */}
            <Badge
              label="Điểm AI: cập nhật"
              variant="updating"
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

        {/* Industry/Stage Badges - from keySkills (real API data) */}
        <div className={styles.badgeRow}>
          {(startup.tags && startup.tags.length > 0
            ? startup.tags.slice(0, 3)
            : startup.industry
              ? [startup.industry]
              : []
          ).map(tag => (
            <Badge key={tag} label={tag} variant="industry" size="xs" />
          ))}
          {startup.stage && <Badge label={startup.stage} variant="stage" size="xs" />}
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
              <span className={styles.teaseText}>Mở khóa dữ liệu tài chính & nhu cầu gọi vốn</span>
              <button className={styles.subscribeBtn}>Đăng ký</button>
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
