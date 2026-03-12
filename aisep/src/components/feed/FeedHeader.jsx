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
          {user?.role === 'startup' && onShowProjectForm && (
            <button
              onClick={onShowProjectForm}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
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
