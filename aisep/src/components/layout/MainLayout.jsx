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
function MainLayout({ onShowRegister, onShowLogin, user, onLogout, onOpenDashboard }) {
  const [isPremium] = useState(false); // Hardcoded as false - shows blur overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Top Bar */}
      <TopBar onMenuClick={toggleMobileMenu} />

      {/* Mobile Menu Overlay - Close menu when clicking overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
      )}

      {/* Main 3-Column Flex Layout - Centered Container */}
      <div className={styles.centeredWrapper}>
        <div className={styles.mainGrid}>
          {/* Left Sidebar - Desktop Only / Mobile with Toggle */}
          <div className={`${styles.leftColumn} ${isMobileMenuOpen ? styles.mobileMenuVisible : ''}`}>
            <Sidebar onShowRegister={onShowRegister} onMenuItemClick={closeMobileMenu} onShowLogin={onShowLogin} />
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
            <RightPanel 
              user={user}
              onLogout={onLogout}
              onOpenDashboard={onOpenDashboard}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default MainLayout;
