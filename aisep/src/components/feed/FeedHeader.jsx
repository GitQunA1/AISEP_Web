import React from 'react';
import { Plus, Search } from 'lucide-react';
import styles from './FeedHeader.module.css';
import FeedFilter from './FeedFilter';
import NotificationCenter from '../common/NotificationCenter';

/**
 * FeedHeader Component - Header for the main feed
 * Shows title, subtitle, filter, and project submission button for startups
 * @param {object} user - Current user object
 * @param {function} onFilterChange - Callback when filters change
 * @param {function} onShowProjectForm - Callback to show project submission form
 * @param {function} onOpenChat - Callback to open chat from notification
 */
function FeedHeader({
  user,
  onFilterChange,
  activeFilters,
  onShowProjectForm,
  title = "Khám phá dự án",
  subtitle = "Khám phá các dự án sáng tạo được hỗ trợ bởi AI",
  showFilter = true,
  showStats = false,
  stats = { approvedCount: 0, investorCount: 0, industryCount: 0 },
  industryCounts = {},
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm dự án...",
  onOpenChat,
  customAction = null,
  showNotification = false
}) {
  return (
    <div className={styles.container}>
      <header className={styles.feedHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerContent}>
            <div className={styles.mainHeaderInfo}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
              </div>
            </div>

            <div className={styles.actionsSection}>
              {onSearchChange && (
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} size={18} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className={styles.headerRightActions}>
              {/* "Đăng Dự Án" button for startups - moved here to sit next to the notification bell */}
              {((user?.role?.toString().toLowerCase() === 'startup') || user?.role === 0 || user?.role === '0') && onShowProjectForm && (
                <button
                  onClick={onShowProjectForm}
                  className={styles.primaryBtn}
                >
                  <Plus size={18} />
                  Đăng Dự Án
                </button>
              )}
              {customAction}
              {user && (onOpenChat || showNotification) && <NotificationCenter onOpenChat={onOpenChat} />}
            </div>
          </div>
        </div>

        {/* Feed Filter (Tabs) — now Row 2 */}
        {showFilter && (
          <FeedFilter
            user={user}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            industryCounts={industryCounts}
            totalCount={stats?.approvedCount ?? 0}
          />
        )}

        {/* Stats Strip is hidden */}
        {/* Removed: showStats mode hidden per user request */}
      </header>
    </div>
  );
}

export default FeedHeader;
