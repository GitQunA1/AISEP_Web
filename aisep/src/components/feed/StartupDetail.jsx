import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Globe, Phone, Building2, CheckCircle,
  Users, Calendar, AlertCircle, Loader, Mail, User, Briefcase
} from 'lucide-react';
import styles from './StartupDetail.module.css';
import startupProfileService from '../../services/startupProfileService';

const DISPLAY = (val, fallback = 'Đang cập nhật') =>
  val && String(val).trim() ? val : fallback;

export default function StartupDetail({ startupId, onBack }) {
  const [startup, setStartup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStartup = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await startupProfileService.getStartupById(startupId);
        if (data) {
          setStartup(data);
        } else {
          setError('Không tìm thấy thông tin startup.');
        }
      } catch (err) {
        setError(err?.message || 'Lỗi khi tải thông tin startup. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (startupId) fetchStartup();
  }, [startupId]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader size={32} className={styles.spinIcon} />
          <p>Đang tải thông tin startup...</p>
        </div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className={styles.container}>
        <div className={styles.topNav}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className={styles.emptyState}>
          <AlertCircle size={48} className={styles.emptyIcon} style={{ color: '#ef4444' }} />
          <h3>Không thể tải thông tin</h3>
          <p>{error || 'Thông tin startup chưa được cập nhật đầy đủ.'}</p>
          <button className={styles.backLinkBtn} onClick={onBack}>← Quay lại</button>
        </div>
      </div>
    );
  }

  // Helpers
  const initial = (startup.companyName || 'S').charAt(0).toUpperCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Đang cập nhật';
    const d = new Date(dateStr);
    return `Tháng ${d.getMonth() + 1} ${d.getFullYear()}`;
  };

  const isApproved = startup.approvalStatus === 'Approved';

  return (
    <div className={styles.container}>
      {/* Sticky Top Nav */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.navTitle}>
          <h2>{DISPLAY(startup.companyName)}</h2>
          <span>Startup</span>
        </div>
      </div>

      {/* Cover Banner */}
      <div className={styles.coverBanner} />

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.headerTop}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {startup.logoUrl
                ? <img src={startup.logoUrl} alt={startup.companyName} className={styles.logoImg} />
                : <span>{initial}</span>
              }
            </div>
          </div>
          <div className={styles.headerActions}>
            {isApproved && (
              <span className={styles.approvedChip}>
                <CheckCircle size={14} />
                Đã xác minh
              </span>
            )}
          </div>
        </div>

        <div className={styles.profileInfo}>
          {/* Name */}
          <div className={styles.nameSection}>
            <h1 className={styles.name}>{DISPLAY(startup.companyName)}</h1>
          </div>

          {/* Bio placeholder */}
          {startup.founder && (
            <div className={styles.bio}>
              <User size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Sáng lập bởi <strong>{startup.founder}</strong>
            </div>
          )}

          {/* Metadata row */}
          <div className={styles.metadata}>
            {startup.countryCity && (
              <div className={styles.metaItem}>
                <MapPin size={15} />
                <span>{startup.countryCity}</span>
              </div>
            )}
            {startup.website && (
              <div className={styles.metaItem}>
                <Globe size={15} />
                <a href={startup.website} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                  {startup.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className={styles.metaItem}>
              <Calendar size={15} />
              <span>Tham gia {formatDate(startup.createdAt)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{startup.followerCount ?? 0}</span>
              <span className={styles.statLabel}>Người theo dõi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'contact' ? styles.active : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Liên hệ
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Info cards grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Briefcase size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Ngành nghề</div>
                <div className={styles.cardValueSmall}>{DISPLAY(startup.industry)}</div>
              </div>
              <div className={styles.statCard}>
                <MapPin size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Khu vực</div>
                <div className={styles.cardValueSmall}>{DISPLAY(startup.countryCity)}</div>
              </div>
              <div className={styles.statCard}>
                <Users size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Người theo dõi</div>
                <div className={styles.cardValueSmall}>{startup.followerCount ?? 0}</div>
              </div>
              <div className={styles.statCard}>
                <CheckCircle size={24} className={styles.statIconLg} />
                <div className={styles.cardLabel}>Trạng thái</div>
                <div className={styles.cardValueSmall} style={{ color: isApproved ? '#10b981' : 'var(--text-secondary)' }}>
                  {startup.approvalStatus === 'Approved' ? 'Đã xác minh'
                    : startup.approvalStatus === 'Rejected' ? 'Bị từ chối'
                    : 'Chờ xét duyệt'}
                </div>
              </div>
            </div>

            {/* Founder Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Thông tin người sáng lập</h3>
              <p className={styles.description}>
                <strong>Nhà sáng lập:</strong> {DISPLAY(startup.founder)}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className={styles.overview}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Thông tin liên hệ</h3>
              {startup.contactInfo ? (
                <div className={styles.contactList}>
                  {startup.contactInfo.split('|').map((info, i) => {
                    const trimmed = info.trim();
                    const isEmail = trimmed.includes('@');
                    const isPhone = /^\d[\d\s\-+]+$/.test(trimmed);
                    return (
                      <div key={i} className={styles.contactItem}>
                        {isEmail ? <Mail size={16} /> : isPhone ? <Phone size={16} /> : <Building2 size={16} />}
                        <span>{trimmed}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.description}>Đang cập nhật</p>
              )}
            </div>

            {startup.website && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Website</h3>
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  <Globe size={16} />
                  {startup.website}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
