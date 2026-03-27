import React from 'react';
import { MoreHorizontal, DollarSign, BarChart3, TrendingUp, Swords, Lightbulb, Lock } from 'lucide-react';
import Badge from '../common/Badge';
import styles from './StartupCard.module.css';

/**
 * StartupCard Component - "Visual Priority (Concept C)"
 * Clean, full-width data density
 */
function StartupCard({ startup, isPremium = false, user, onViewProfile, onViewProject, index = 0, isReturning = false }) {
  // Utility for avatar gradient based on tag/industry
  const getAvatarGradient = (mainTag) => {
    const t = (mainTag || '').toLowerCase();
    if (t.includes('fintech')) return 'linear-gradient(135deg, #2D7EFF, #5BA8FF)'; // blue
    if (t.includes('agritech') || t.includes('nông nghiệp')) return 'linear-gradient(135deg, #00BA7C, #43E5A0)'; // green
    if (t.includes('ai') || t.includes('saas')) return 'linear-gradient(135deg, #8B5CF6, #B794F4)'; // purple
    if (t.includes('hardware') || t.includes('phần cứng')) return 'linear-gradient(135deg, #FFAD1F, #FFC85C)'; // amber
    return 'linear-gradient(135deg, #F4212E, #FF7A85)'; // red fallback
  };

  const getStageColor = (stage) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('mvp')) return { bg: 'rgba(45, 126, 255, 0.15)', color: '#2D7EFF' }; // Blue dim
    if (s.includes('growth') || s.includes('vận hành') || s.includes('tăng trưởng')) return { bg: 'rgba(0, 186, 124, 0.15)', color: '#00ba7c' }; // Green dim
    if (s.includes('idea') || s.includes('ý tưởng')) return { bg: 'rgba(255, 173, 31, 0.15)', color: '#ffad1f' }; // Amber dim
    return { bg: 'var(--surface2, rgba(255,255,255,0.05))', color: 'var(--text-muted)' };
  };

  const mainTag = (startup.tags && startup.tags.length > 0) ? startup.tags[0] : (startup.industry || '');
  const stageStyles = getStageColor(startup.stage);
  
  // Priority: mapped startupName > organization > company > project-owner-name fallback
  // The 'startup' object passed from MainLayout should have either startupName or the original fields
  const startupNameDisp = startup.startupName || startup.organizationName || startup.companyName || 'Startup';
  
  // Robust ID extraction for navigation
  const sid = startup.startupId || startup.userId || startup.id;

  const PremiumLock = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#ffad1f', background: 'rgba(255, 173, 31, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
      <Lock size={12} strokeWidth={2.5} /> Premium
    </div>
  );

  const PremiumLockText = () => (
    <span style={{ color: '#ffad1f', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <Lock size={12} strokeWidth={2.5} /> Yêu cầu Premium
    </span>
  );

  return (
    <article 
      key={startup.id}
      className={styles.card} 
      onClick={() => onViewProject && onViewProject(startup.id)} 
      style={{ 
        cursor: onViewProject ? 'pointer' : 'default',
        '--index': index,
        ...(isReturning ? { animation: 'none', opacity: 1, transform: 'none' } : {})
      }}
    >
      {/* 1. Header Row */}
      <div className={styles.cardHeader}>
        <div 
          className={`${styles.avatarCircle} ${onViewProfile ? styles.clickable : ''}`}
          style={{ background: getAvatarGradient(mainTag) }}
          onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(sid); }}
        >
          {startupNameDisp.charAt(0).toUpperCase()}
        </div>
        
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <span 
              className={`${styles.name} ${onViewProfile ? styles.clickableName : ''}`}
              onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(sid); }}
            >
              {startupNameDisp}
            </span>
            <span className={styles.date}>{startup.timestamp}</span>
          </div>
          <div className={styles.badgeRow}>
            {/* AI Badge */}
            <Badge
              label={startup.score === undefined ? '' : (startup.score === null ? '__' : String(startup.score))}
              isLoading={startup.score === undefined}
              variant={
                startup.score === undefined || startup.score === null
                  ? 'updating'
                  : startup.score >= 80
                  ? 'score-good'
                  : startup.score >= 50
                  ? 'score-medium'
                  : 'score-poor'
              }
              size="sm"
            />
            
            {/* Stage Pill */}
            {startup.stage && (
              <span 
                className={styles.stagePill} 
                style={{ background: stageStyles.bg, color: stageStyles.color }}
              >
                {startup.stage}
              </span>
            )}

            {/* Tags */}
            {(startup.tags && startup.tags.length > 0 ? startup.tags : (startup.industry ? [startup.industry] : [])).slice(0, 3).map(tag => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        </div>
        
        <div className={styles.menuIconWrapper}>
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* 2. Main Content (Side-by-side on desktop) */}
      <div className={styles.bodyWrapper}>
        <div className={styles.mainInfo}>
          <h3 className={styles.projectName}>{startup.name}</h3>

          {/* Description (2-line clamp) */}
          <div className={styles.description}>
            {startup.description}
          </div>
        </div>

        {/* Project Image Thumbnail */}
        {startup.imageUrl && (
          <div className={styles.imageWrapper}>
            <img 
              src={startup.imageUrl} 
              alt={startup.name}
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* 3. Three-column Highlight Grid */}
      <div className={styles.gridRow}>
        {/* Revenue */}
        <div className={styles.highlightBox} style={{ backgroundColor: 'rgba(45, 126, 255, 0.08)', borderColor: 'rgba(45, 126, 255, 0.2)' }}>
          <div className={styles.boxIcon}><DollarSign size={20} style={{ color: '#2D7EFF' }} strokeWidth={2.5} /></div>
          {startup.revenue !== undefined ? (
            <div className={`${styles.boxValue} ${styles.blueText}`} style={{ fontSize: '15px' }}>
              {startup.revenue ? `${startup.revenue.toLocaleString('vi-VN')} VND` : '0 VND'}
            </div>
          ) : <PremiumLock />}
          <div className={styles.boxLabel}>Doanh thu</div>
        </div>

        {/* Market Size */}
        <div className={styles.highlightBox} style={{ backgroundColor: 'rgba(0, 186, 124, 0.08)', borderColor: 'rgba(0, 186, 124, 0.2)' }}>
          <div className={styles.boxIcon}><BarChart3 size={20} style={{ color: '#00ba7c' }} strokeWidth={2.5} /></div>
          {startup.marketSize !== undefined ? (
            <div className={`${styles.boxValue} ${styles.greenText}`} style={{ fontSize: '15px' }}>
              {startup.marketSize ? `${startup.marketSize.toLocaleString('vi-VN')} VND` : '0 VND'}
            </div>
          ) : <PremiumLock />}
          <div className={styles.boxLabel}>Thị trường</div>
        </div>

        {/* Competitors (Always Show) */}
        <div className={styles.highlightBox} style={{ backgroundColor: 'rgba(113, 118, 123, 0.08)', borderColor: 'rgba(113, 118, 123, 0.2)' }}>
          <div className={styles.boxIcon}><Swords size={20} style={{ color: '#71767b' }} strokeWidth={2.5} /></div>
          {startup.competitors !== undefined ? (
            <div className={`${styles.boxValue} ${styles.grayText}`} style={{ fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {startup.competitors || '—'}
            </div>
          ) : <PremiumLock />}
          <div className={styles.boxLabel}>Đối thủ chính</div>
        </div>
      </div>

      {/* 4. Detail Rows */}
      <div className={styles.detailRows}>
        {(startup.businessModel === undefined || startup.businessModel) && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Mô hình KD</span>
            <span className={styles.detailValue}>
               {startup.businessModel !== undefined ? startup.businessModel : <PremiumLockText />}
            </span>
          </div>
        )}
        {startup.targetCustomers && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Khách hàng</span>
            <span className={styles.detailValue}>{startup.targetCustomers}</span>
          </div>
        )}
        {startup.uniqueValueProposition && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Giá trị</span>
            <span className={`${styles.detailValue} ${styles.blueText}`}>{startup.uniqueValueProposition}</span>
          </div>
        )}
      </div>

      {/* 5. Team Line */}
      {(startup.teamMembers === undefined || startup.teamMembers) && (
        <div className={styles.teamLine}>
          <strong style={{ color: 'var(--text-primary)' }}>Team:</strong>{' '}
          {startup.teamMembers !== undefined ? startup.teamMembers : <PremiumLockText />}
        </div>
      )}
    </article>
  );
}

export default StartupCard;
