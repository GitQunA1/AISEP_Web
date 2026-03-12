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
function FeedHeader({ user, onFilterChange, onShowProjectForm, title = "Khám phá dự án", subtitle = "Khám phá các dự án sáng tạo được hỗ trợ bởi AI", showFilter = true }) {
  return (
    <>
      <div className={styles.feedHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
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

      {/* Feed Filter for Investors (Optional) */}
      {showFilter && <FeedFilter user={user} onFilterChange={onFilterChange} />}
    </>
  );
}

export default FeedHeader;
