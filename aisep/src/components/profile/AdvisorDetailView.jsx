import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Star, DollarSign, Globe, Briefcase, 
  Award, Mail, Phone, Calendar, CheckCircle, Clock 
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import AdvisorBookingModal from './AdvisorBookingModal';
import styles from './AdvisorDetailView.module.css';
import advisorService from '../../services/advisorService';
import ProfileLoading from '../common/ProfileLoading';
import ProfileErrorScreen from '../common/ProfileErrorScreen';
import AuthRequirementScreen from '../common/AuthRequirementScreen';

/**
 * AdvisorDetailView - Enhanced profile view for an Advisor
 * Mirrors the structure of StartupDetail and InvestorDetail
 */
const AdvisorDetailView = ({ user, advisor, onBack, onShowLogin }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingStatus, setBookingStatus] = useState(null);
  
  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Define role check
  const roleValue = user?.role;
  const roleStr = typeof roleValue === 'string' ? roleValue.toLowerCase() : '';
  const canConnect = roleStr === 'startup' || roleStr === 'advisor' || roleValue === 0 || roleValue === 2;

  useEffect(() => {
    const fetchStatus = async () => {
        if (!user || !advisor || !canConnect) return;
        const userId = user.id || user.userId || user.nameid;
        if (!userId) return;

        try {
            const response = await bookingService.getMyCustomerBookings(userId);
            const items = response?.items || response?.data?.items || response || [];
            const bookingsList = Array.isArray(items) ? items : (items.data && Array.isArray(items.data) ? items.data : []);
            const currentBooking = bookingsList.find(b => b.advisorId === advisor.advisorId);
            
            if (currentBooking) {
                setBookingStatus(currentBooking.status);
            }
        } catch (err) {
            console.error('Failed to load booking status for detail view:', err);
        }
    };
    fetchStatus();
  }, [user, advisor, canConnect]);

  const handleConnect = () => {
      if (!canConnect) return;
      setShowBookingModal(true);
  };
  
  const handleBookingSuccess = (advisorId) => {
      setBookingStatus(0); // Optimistically update to Pending
  };

  if (!user) {
    return (
      <AuthRequirementScreen 
        type="cố vấn" 
        onBack={onBack} 
        onLogin={onShowLogin} 
      />
    );
  }

  if (!advisor) {
    return (
      <ProfileErrorScreen
        title="cố vấn"
        message="Không thể tải thông tin cố vấn. Vui lòng quay lại và thử lại."
        onBack={onBack}
      />
    );
  }

  const handle = `@${advisor.userName?.toLowerCase().replace(/\s/g, '') || 'advisor'}`;
  const displayName = advisor.userName || advisor.name || 'A';
  const initial = String(displayName).charAt(0).toUpperCase() || 'A';
  const isApproved = advisor.approvalStatus === 'Approved';

  // Formatting currency/numbers
  const formatSalary = (val) => {
    if (!val) return 'Thỏa thuận';
    return val.toLocaleString('vi-VN');
  };

  // Derivative styles
  const getAvatarGradient = () => {
    const spec = (advisor.expertise || '').toLowerCase();
    if (spec.includes('fintech') || spec.includes('saas')) return 'linear-gradient(135deg,#2D7EFF,#00ba7c)';
    if (spec.includes('agritech')) return 'linear-gradient(135deg,#00ba7c,#009960)';
    if (spec.includes('ai') || spec.includes('ml')) return 'linear-gradient(135deg,#794bc4,#2D7EFF)';
    return 'linear-gradient(135deg,#2D7EFF,#00ba7c)';
  };

  const expertiseTags = advisor.expertise ? advisor.expertise.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className={styles.container}>
      {/* 1. Sticky Top Nav (Preserved) */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Quay lại">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.navTitle}>
          <h2>{advisor.userName}</h2>
          <span>Cố vấn chuyên gia</span>
        </div>
      </div>

      {/* 2. Cover Banner (Refactored) */}
      <div className={styles.coverWrapper}>
        <div className={styles.coverOverlay}></div>
      </div>

      {/* 3. Floating Profile Card (Refactored) */}
      <div className={styles.profileCard}>
        {/* Top row: avatar left, action buttons right */}
        <div className={styles.cardHeaderRow}>
          <div className={styles.avatar} style={{ background: getAvatarGradient() }}>
            {(advisor.profileImage && 
              typeof advisor.profileImage === 'string' && 
              advisor.profileImage.startsWith('http') && 
              !advisor.profileImage.includes('ui-avatars.com'))
              ? <img src={advisor.profileImage} alt={advisor.userName} className={styles.avatarImg} />
              : <span className={styles.initialText}>{initial}</span>
            }
          </div>
          <div className={styles.actionButtons}>
            {canConnect && (() => {
                if (bookingStatus === 0 || bookingStatus === 'Pending') {
                    return (
                        <button className={styles.connectBtn} disabled style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--text-secondary)' }}>
                            Đang chờ...
                        </button>
                    );
                }
                if (bookingStatus === 1 || bookingStatus === 'Confirmed' || bookingStatus === 'Accepted') {
                    return (
                        <button className={styles.connectBtn} disabled style={{ backgroundColor: '#10b981', color: 'white' }}>
                            Đã kết nối
                        </button>
                    );
                }
                
                return (
                    <button className={styles.connectBtn} onClick={handleConnect}>
                      ↗ Kết nối
                    </button>
                );
            })()}
          </div>
        </div>

        {/* Name, handle, verified badge */}
        <div className={styles.nameRow}>
          <h1 className={styles.name}>{advisor.userName}</h1>
          {isApproved && (
            <span className={styles.verifiedChip}>
              ✓ Đã xác minh
            </span>
          )}
        </div>
        <div className={styles.handle}>{handle}</div>

        {/* Bio */}
        <div className={styles.bio}>
          {advisor.bio || 'Chưa có thông tin giới thiệu.'}
        </div>

        {/* Specialty tags */}
        <div className={styles.specialtyTags}>
          {expertiseTags.map((tag, i) => (
            <span key={i} className={styles.tag}>#{tag}</span>
          ))}
        </div>

        {/* Meta row: location + join date */}
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>📍 {advisor.location || 'Nghề nghiệp tự do'}</span>
          <span className={styles.metaItem}>📅 Tham gia Tháng 3 2024</span>
        </div>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <div className={styles.statEmoji}>💵</div>
            <div className={styles.statValue}>{formatSalary(advisor.hourlyRate)}</div>
            <div className={styles.statLabel}>VNĐ/giờ</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statEmoji}>⭐</div>
            <div className={styles.statValue}>{advisor.rating || '4.8'}</div>
            <div className={styles.statLabel}>Đánh giá</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statEmoji}>🌐</div>
            <div className={styles.statValue}>{advisor.languagesSpoken || 'VI · EN'}</div>
            <div className={styles.statLabel}>Ngôn ngữ</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statEmoji}>⏱</div>
            <div className={styles.statValue}>24h</div>
            <div className={styles.statLabel}>Phản hồi</div>
          </div>
        </div>
      </div>

      {/* 4. Tabs Navigation (Restyled) */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
          {activeTab === 'overview' && <div className={styles.indicator} />}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'experience' ? styles.active : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Kinh nghiệm
          {activeTab === 'experience' && <div className={styles.indicator} />}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'contact' ? styles.active : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Liên hệ
          {activeTab === 'contact' && <div className={styles.indicator} />}
        </button>
      </div>

      {/* 5. Tab Content (Feed-Style Rows) */}
      <div className={styles.feedContent}>
        {activeTab === 'overview' && (
          <>
            <div className={styles.feedRow}>
              <div className={`${styles.iconBox} ${styles.blueBox}`}>📋</div>
              <div className={styles.rowContent}>
                <div className={styles.rowTitle}>Giới thiệu chuyên môn</div>
                <div className={styles.rowText}>
                  {advisor.bio || 'Đang cập nhật'}
                </div>
                <div className={styles.chipRow}>
                  {expertiseTags.map((tag, i) => (
                    <span key={i} className={styles.chip}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.feedRow}>
              <div className={`${styles.iconBox} ${styles.greenBox}`}>📅</div>
              <div className={styles.rowContent}>
                <div className={styles.rowTitle}>Lịch đặt tư vấn</div>
                <div className={styles.rowText}>
                  {advisor.schedule || 'Đang cập nhật'}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'experience' && (
          <>
            <div className={styles.feedRow}>
              <div className={`${styles.iconBox} ${styles.purpleBox}`}>🏆</div>
              <div className={styles.rowContent}>
                <div className={styles.rowTitle}>Lịch sử làm việc & Kinh nghiệm</div>
                <div className={styles.rowText}>
                  {advisor.previousExperience || 'Đang cập nhật'}
                </div>
                <div className={styles.metaText}>Hiện tại · {advisor.location || 'Đang cập nhật'}</div>
              </div>
            </div>
            
            <div className={styles.feedRow}>
              <div className={`${styles.iconBox} ${styles.purpleBox}`}>💼</div>
              <div className={styles.rowContent}>
                <div className={styles.rowTitle}>Chứng chỉ & Bằng cấp</div>
                <div className={styles.certGrid}>
                  {advisor.certifications ? (
                    advisor.certifications.split('|').map((cert, i) => (
                      <div key={i} className={styles.certCard}>
                        <Award size={16} className={styles.certIcon} />
                        <span className={styles.certName}>{cert.trim()}</span>
                      </div>
                    ))
                  ) : (
                    <div className={styles.rowText}>Đang cập nhật</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'contact' && (
          <div className={styles.feedRow}>
            <div className={`${styles.iconBox} ${styles.blueBox}`}>📧</div>
            <div className={styles.rowContent}>
              <div className={styles.rowTitle}>Thông tin liên hệ</div>
              <div className={styles.rowText}>
                Email: {advisor.email || 'Đang cập nhật'}
              </div>
              <div className={styles.rowText}>
                Số điện thoại: {advisor.phoneNumber || advisor.phone || 'Đang cập nhật'}
              </div>
              <div className={styles.rowText}>
                Vị trí: {advisor.location || 'Đang cập nhật'}
              </div>
            </div>
          </div>
        )}
      </div>

      {showBookingModal && (
        <AdvisorBookingModal
          advisor={advisor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default AdvisorDetailView;
