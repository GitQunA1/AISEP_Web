import React, { useState } from 'react';
import styles from './MainLayout.module.css';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import FeedHeader from '../feed/FeedHeader';
import StartupCard from '../feed/StartupCard';
import mockStartups from '../../data/mockStartups';

/**
 * MainLayout Component - Main application layout
 * Handles responsive 3-column flex layout (desktop) vs single column (mobile)
 * Includes sticky sidebars and scrollable feed
 */
function MainLayout() {
  const [isPremium] = useState(false); // Hardcoded as false - shows blur overlay

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Top Bar */}
      <TopBar />

      {/* Main 3-Column Flex Layout - Centered Container */}
      <div className={styles.centeredWrapper}>
        <div className={styles.mainGrid}>
          {/* Left Sidebar - Desktop Only */}
          <div className={styles.leftColumn}>
            <Sidebar />
          </div>

          {/* Center Feed Column */}
          <main className={styles.centerColumn}>
            <FeedHeader />
            <div className={styles.feedContainer}>
              {mockStartups.map((startup) => (
                <StartupCard
                  key={startup.id}
                  startup={startup}
                  isPremium={isPremium}
                />
              ))}
            </div>
          </main>

          {/* Right Panel - Desktop Only */}
          <div className={styles.rightColumn}>
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default MainLayout;
