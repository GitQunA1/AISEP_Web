import React, { useState } from 'react';
import { MoreHorizontal, DollarSign, BarChart3, TrendingUp, Swords, Lightbulb, Lock, Heart, MessageSquare } from 'lucide-react';
import Badge from '../common/Badge';
import styles from './StartupCard.module.css';
import followerService from '../../services/followerService';
import RequestInfoModal from '../common/RequestInfoModal';

/**
 * StartupCard Component - "Visual Priority (Concept C)"
 * Clean, full-width data density
 */
function StartupCard({ startup, isPremium = false, user, followedProjectIds, sentConnectionIds, onViewProfile, onViewProject, index = 0, isReturning = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  
  // Check if user is investor
  // Backend returns role as string: "Investor", "Startup", "Advisor", "Staff", "Admin"
  // OR as number: 1=Investor, 0=Startup, 2=Advisor, 3=Staff, 4=Admin
  const isInvestor = user && (
    user.role === 'investor' || 
    user.role === 'Investor' || 
    user.role === 1 || 
    String(user.role) === '1'
  );

  // Initialize follow state from passed followedProjectIds (instant, no API call)
  React.useEffect(() => {
    if (isInvestor && startup.id && followedProjectIds) {
      const isFollowing = followedProjectIds.has(startup.id);
      console.log(`[StartupCard ${startup.id}] Using cached followedProjectIds. Is following: ${isFollowing}`);
      setIsInterested(isFollowing);
    }
  }, [isInvestor, startup.id, followedProjectIds]);

  // Initialize request state from passed sentConnectionIds (instant, no API call)
  React.useEffect(() => {
    if (isInvestor && startup.id && sentConnectionIds) {
      const hasRequest = sentConnectionIds.has(startup.id);
      console.log(`[StartupCard ${startup.id}] Using cached sentConnectionIds. Has request: ${hasRequest}`);
      setHasRequested(hasRequest);
    }
  }, [isInvestor, startup.id, sentConnectionIds]);
  
  // Handle interest button click - toggle follow/unfollow
  const handleInterestClick = async (e) => {
    e.stopPropagation();
    if (!user) return;
    
    console.log(`[StartupCard ${startup.id}] Interest click - current isInterested:`, isInterested);
    
    setIsLoading(true);
    try {
      if (isInterested) {
        // Already interested - unfollow
        console.log(`[StartupCard ${startup.id}] Unfollowing...`);
        const response = await followerService.unfollowProject(startup.id);
        console.log(`[StartupCard ${startup.id}] Unfollow response:`, response);
        
        if (response && (response.success || response.data)) {
          setIsInterested(false);
          setInterestMessage('✓ Đã bỏ theo dõi');
          setTimeout(() => setInterestMessage(''), 3000);
        } else {
          setInterestMessage('Lỗi: ' + (response?.message || 'Không thể xử lý yêu cầu'));
          setTimeout(() => setInterestMessage(''), 3000);
        }
      } else {
        // Not interested yet - follow
        console.log(`[StartupCard ${startup.id}] Following...`);
        const response = await followerService.followProject(startup.id);
        console.log(`[StartupCard ${startup.id}] Follow response:`, response);
        
        if (response && (response.success || response.data)) {
          setIsInterested(true);
          setInterestMessage('✓ Đã thêm vào danh sách quan tâm');
          setTimeout(() => setInterestMessage(''), 3000);
        } else {
          setInterestMessage('Lỗi: ' + (response?.message || 'Không thể xử lý yêu cầu'));
          setTimeout(() => setInterestMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error(`[StartupCard ${startup.id}] Failed to toggle follow:`, error);
      setInterestMessage('Lỗi: ' + (error?.message || 'Kết nối thất bại'));
      setTimeout(() => setInterestMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };
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
      // onClick={() => onViewProject && onViewProject(startup.id)} 
      // TEMPORARILY DISABLED TO TEST REQUEST INFO BUTTON
      style={{ 
        cursor: 'default', // onViewProject ? 'pointer' : 'default',
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

      {/* 6. Interest Button for Investors */}
      {isInvestor && (
        <>
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Follow/Unfollow Button */}
            <button
              onClick={handleInterestClick}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: isInterested ? '#dc2626' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'wait' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = isInterested ? '#b91c1c' : '#1976D2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = isInterested ? '#dc2626' : '#2196F3';
                }
              }}
            >
              <Heart 
                size={16} 
                fill={isInterested ? 'currentColor' : 'none'}
                strokeWidth={2} 
              />
              {isLoading ? 'Đang xử lý...' : (isInterested ? 'Hủy quan tâm' : 'Quan tâm')}
            </button>

            {/* Request Info Button */}
            <button
              onClick={() => !hasRequested && setShowRequestModal(true)}
              disabled={hasRequested}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: hasRequested ? '#10b981' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: hasRequested ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: hasRequested ? 0.8 : 1
              }}
              onMouseEnter={(e) => {
                if (!hasRequested) {
                  e.target.style.backgroundColor = '#6d28d9';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasRequested) {
                  e.target.style.backgroundColor = '#7c3aed';
                }
              }}
            >
              <MessageSquare size={16} />
              {hasRequested ? 'Đã yêu cầu' : 'Yêu cầu thông tin'}
            </button>
          </div>

          {/* RequestInfoModal */}
          <RequestInfoModal
            isOpen={showRequestModal}
            onClose={() => setShowRequestModal(false)}
            projectId={startup.id}
            projectName={startup.name}
            onSuccess={() => {
              setHasRequested(true);
            }}
          />
        </>
      )}

      {/* Interest Message */}
      {interestMessage && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: isInterested ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          color: isInterested ? '#4caf50' : '#f44336',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {interestMessage}
        </div>
      )}
    </article>
  );
}

export default StartupCard;
