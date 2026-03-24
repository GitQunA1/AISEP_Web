import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
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
          <Avatar src={startup.logo} alt={startup.name} name={startup.name} size="md" className={styles.avatar} />
        </button>
      </div>

      {/* RIGHT COLUMN: CONTENT */}
      <div className={styles.contentColumn}>

        {/* ROW 1: Name · Date · Approved · Score · Menu */}
        <div className={styles.headerRow}>
          <div className={styles.nameGroup}>
            <h3
              className={`${styles.name} ${onViewProfile ? styles.nameClickable : ''}`}
              onClick={() => onViewProfile && onViewProfile(startup.startupId ?? startup.id)}
            >
              {startup.name}
            </h3>
            <span className={styles.time}>{startup.timestamp}</span>
          </div>

          <div className={styles.headerActions}>
            <Badge
              label={startup.aiScore != null && startup.aiScore !== '' ? String(startup.aiScore) : '__'}
              variant={
                startup.aiScore == null || startup.aiScore === ''
                  ? 'updating'
                  : startup.aiScore >= 80
                  ? 'score-good'
                  : startup.aiScore >= 50
                  ? 'score-medium'
                  : 'score-poor'
              }
              size="sm"
            />
            <button className={styles.menuBtn}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* ROW 2: #hashtags only */}
        <div className={styles.tagRow}>
          {(startup.tags && startup.tags.length > 0
            ? startup.tags
            : startup.industry
              ? [startup.industry]
              : []
          ).map(tag => (
            <span key={tag} className={styles.hashtag}>#{tag}</span>
          ))}
        </div>

        {/* ROW 3: Description */}
        <p className={styles.description}>{startup.description}</p>

        {/* ROW 3.5: Business Info Section */}
        <div className={styles.businessInfo}>
          {startup.stage && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Giai đoạn:</span>
              <span className={styles.infoValue}>{startup.stage}</span>
            </div>
          )}
          {startup.revenue && startup.revenue !== 0 && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Doanh thu:</span>
              <span className={styles.infoValue}>{startup.revenue.toLocaleString('vi-VN')} VND</span>
            </div>
          )}
          {startup.marketSize && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Thị trường:</span>
              <span className={styles.infoValue}>${(startup.marketSize / 1000000000).toFixed(1)}B</span>
            </div>
          )}
          {startup.businessModel && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Mô hình:</span>
              <span className={styles.infoValue}>{startup.businessModel}</span>
            </div>
          )}
          {startup.competitors && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Đối thủ:</span>
              <span className={styles.infoValue}>{startup.competitors}</span>
            </div>
          )}
          {startup.targetCustomers && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Khách hàng:</span>
              <span className={styles.infoValue}>{startup.targetCustomers}</span>
            </div>
          )}
          {startup.uniqueValueProposition && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Đề xuất giá trị:</span>
              <span className={styles.infoValue}>{startup.uniqueValueProposition}</span>
            </div>
          )}
        </div>

        {/* ROW 3.7: Team Info */}
        {startup.teamMembers && (
          <div className={styles.teamInfo}>
            <span className={styles.teamLabel}>Thành viên team:</span>
            <span className={styles.teamMembers}>{startup.teamMembers}</span>
          </div>
        )}
        <div className={styles.actionRow}>
          <button className={`${styles.actionBtn} ${styles.replyBtn}`}>
            <MessageCircle size={17} />
            <span className={styles.actionCount}>24</span>
          </button>

          <button
            className={`${styles.actionBtn} ${styles.repostBtn}`}
          >
            <Repeat size={17} />
            <span className={styles.actionCount}>124</span>
          </button>

          <button
            className={`${styles.actionBtn} ${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            <Heart size={17} />
            <span className={styles.actionCount}>24</span>
          </button>

          <button
            className={`${styles.actionBtn} ${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={handleBookmark}
          >
            <Bookmark size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default StartupCard;
