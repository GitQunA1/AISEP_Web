import React from 'react';
import styles from './FeedHeader.module.css';

/**
 * FeedHeader Component - Header for the main feed
 * Shows title and subtitle
 */
function FeedHeader() {
  return (
    <div className={styles.feedHeader}>
      <div className={styles.headerContent}>
        <h2 className={styles.title}>Discover Startups</h2>
        <p className={styles.subtitle}>Explore innovative AI-powered startups</p>
      </div>
    </div>
  );
}

export default FeedHeader;
