import React from 'react';
import styles from './FeedHeader.module.css';
import FeedFilter from './FeedFilter';

/**
 * FeedHeader Component - Header for the main feed
 * Shows title, subtitle, and filter
 * @param {object} user - Current user object
 * @param {function} onFilterChange - Callback when filters change
 */
function FeedHeader({ user, onFilterChange }) {
  return (
    <>
      <div className={styles.feedHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h2 className={styles.title}>Discover Projects</h2>
              <p className={styles.subtitle}>Explore innovative AI-powered projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Filter for Investors */}
      <FeedFilter user={user} onFilterChange={onFilterChange} />
    </>
  );
}

export default FeedHeader;
