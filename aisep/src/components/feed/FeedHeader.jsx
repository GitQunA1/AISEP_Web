import React from 'react';
import { Plus } from 'lucide-react';
import styles from './FeedHeader.module.css';
import FeedFilter from './FeedFilter';

/**
 * FeedHeader Component - Header for the main feed
 * Shows title, subtitle, filter, and project submission button for startups
 * @param {object} user - Current user object
 * @param {function} onFilterChange - Callback when filters change
 * @param {function} onShowProjectForm - Callback to show project submission form
 */
function FeedHeader({ 
  user, 
  onFilterChange, 
  onShowProjectForm, 
  title = "Khám phá dự án", 
  subtitle = "Khám phá các dự án sáng tạo được hỗ trợ bởi AI", 
  showFilter = true,
  showStats = false,
  stats = { approvedCount: 0, investorCount: 0, industryCount: 0 },
  industryCounts = {}
}) {
  return (
    <div className={styles.container}>
      <header className={styles.feedHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>

            {/* "Đăng Dự Án" button for startups */}
            {((user?.role?.toString().toLowerCase() === 'startup') || user?.role === 0 || user?.role === '0') && onShowProjectForm && (
              <button
                onClick={onShowProjectForm}
                className={styles.primaryBtn}
              >
                <Plus size={18} />
                Đăng Dự Án
              </button>
            )}
          </div>
        </div>

        {/* Feed Filter (Tabs) — now Row 2 */}
        {showFilter && (
          <FeedFilter 
            user={user} 
            onFilterChange={onFilterChange} 
            industryCounts={industryCounts}
            totalCount={stats.approvedCount}
          />
        )}

        {/* Stats Strip — Row 3: New Flat Layout */}
        {showStats && (
          <div className={styles.statsStrip}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.approvedCount}</span>
              <span className={styles.statLabel}>Đã được duyệt</span>
            </div>
            
            <div className={styles.statDivider} />
            
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.investorCount.toLocaleString()}</span>
              <span className={styles.statLabel}>Nhà đầu tư tham gia</span>
            </div>
            
            <div className={styles.statDivider} />
            
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.industryCount}</span>
              <span className={styles.statLabel}>Lĩnh vực nổi bật</span>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default FeedHeader;
