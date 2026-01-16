import React from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './FeedHeader.module.css';
import { useTheme } from '../../context/ThemeContext';

/**
 * FeedHeader Component - Header for the main feed
 * Shows title and theme toggle on the right side
 */
function FeedHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.feedHeader}>
      <div className={styles.headerContent}>
        <h2 className={styles.title}>Discover Startups</h2>
        <p className={styles.subtitle}>Explore innovative AI-powered startups</p>
      </div>
      
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon size={20} />
        ) : (
          <Sun size={20} />
        )}
      </button>
    </div>
  );
}

export default FeedHeader;
