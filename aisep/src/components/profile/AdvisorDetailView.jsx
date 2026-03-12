import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Star, DollarSign, Globe, Briefcase, 
  Award, Mail, Phone, Calendar, CheckCircle, Clock 
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import AdvisorBookingModal from './AdvisorBookingModal';
import styles from './AdvisorDetailView.module.css';

/**
 * AdvisorDetailView - Enhanced profile view for an Advisor
 * Mirrors the structure of StartupDetail and InvestorDetail
 */
const AdvisorDetailView = ({ user, advisor, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingStatus, setBookingStatus] = useState(null);
  
  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Define role check
  const roleValue = user?.role;
  const roleStr = typeof roleValue === 'string' ? roleValue.toLowerCase() : '';
  const canConnect = roleStr === 'startup' || roleStr === 'investor' || roleValue === 0 || roleValue === 1;

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

  if (!advisor) return null;

  const handle = `@${advisor.userName?.toLowerCase().replace(/\s/g, '')}`;
  const initial = (advisor.userName || 'A').charAt(0).toUpperCase();
  const isApproved = advisor.approvalStatus === 'Approved';

  // Formatting currency/numbers
  const formatSalary = (val) => {
    if (!val) return 'Thỏa thuận';
    return `${val.toLocaleString('vi-VN')} VNĐ/giờ`;
  };

  return (
    <div className={styles.container}>
      {/* 1. Sticky Top Nav */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Quay lại">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.navTitle}>
          <h2>{advisor.userName}</h2>
          <span>Cố vấn chuyên gia</span>
        </div>
      </div>

      {/* 2. Cover Banner */}
      <div className={styles.coverBanner}></div>

      {/* 3. Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.headerTop}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {advisor.profileImage 
                ? <img src={advisor.profileImage} alt={advisor.userName} className={styles.avatarImg} />
                : <span>{initial}</span>
              }
            </div>
          </div>
          <div className={styles.headerActions}>
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
                        <button className={styles.connectBtn} disabled style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', opacity: 0.9 }}>
                            Đã kết nối
                        </button>
                    );
                }
                
                return (
                    <button 
                        className={styles.connectBtn} 
                        onClick={handleConnect}
                    >
                        Kết nối ngay
                    </button>
                );
            })()}
          </div>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.nameSection}>
            <h1 className={styles.name}>
              {advisor.userName}
              {isApproved && (
                <span className={styles.verifiedChip}>
                  <CheckCircle size={14} />
                  Đã xác minh
                </span>
              )}
            </h1>
            <div className={styles.handle}>{handle}</div>
          </div>

          <div className={styles.bio}>
            <p>{advisor.bio || 'Chưa có thông tin giới thiệu.'}</p>
            <span className={styles.expertiseBadge}>{advisor.expertise}</span>
          </div>

          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <MapPin size={16} />
              <span>{advisor.location || 'Nghề nghiệp tự do'}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar size={16} />
              <span>Tham gia Tháng 3 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabs Navigation */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'experience' ? styles.active : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Kinh nghiệm
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'contact' ? styles.active : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Liên hệ
        </button>
      </div>

      {/* 5. Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.tabPane}>
            {/* Stat Cards Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <DollarSign size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Mức phí</div>
                <div className={styles.cardValueSmall}>{formatSalary(advisor.hourlyRate)}</div>
              </div>
              <div className={styles.statCard}>
                <Star size={24} className={styles.statIconLg} fill="currentColor" />
                <div className={styles.cardLabel}>Đánh giá</div>
                <div className={styles.cardValueSmall}>{advisor.rating || 'Chưa có'}</div>
              </div>
              <div className={styles.statCard}>
                <Globe size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Ngôn ngữ</div>
                <div className={styles.cardValueSmall}>{advisor.languagesSpoken || 'Tiếng Việt'}</div>
              </div>
              <div className={styles.statCard}>
                <Clock size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Phản hồi</div>
                <div className={styles.cardValueSmall}>Trong 24h</div>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Giới thiệu chuyên môn</h3>
              <p className={styles.description}>
                {advisor.bio || 'Chưa có thông tin giới thiệu chi tiết cho cố vấn này.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className={styles.tabPane}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Lịch sử làm việc & Kinh nghiệm</h3>
              <p className={styles.description}>
                {advisor.previousExperience || 'Thông tin kinh nghiệm thực tế đang được cập nhật.'}
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Chứng chỉ & Bằng cấp</h3>
              <div className={styles.description}>
                {advisor.certifications ? (
                   <ul style={{ paddingLeft: '20px', margin: '0' }}>
                     {advisor.certifications.split('|').map((cert, i) => (
                       <li key={i}>{cert.trim()}</li>
                     ))}
                   </ul>
                ) : 'Đang cập nhật chứng chỉ chuyên môn.'}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className={styles.tabPane}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Thông tin liên hệ</h3>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <Mail size={18} />
                  <span>{advisor.email || 'Email chưa công khai'}</span>
                </div>
                <div className={styles.contactItem}>
                  <Phone size={18} />
                  <span>09x xxx xxxx</span>
                </div>
                <div className={styles.contactItem}>
                  <MapPin size={18} />
                  <span>{advisor.location || 'Nghề nghiệp tự do'}</span>
                </div>
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
