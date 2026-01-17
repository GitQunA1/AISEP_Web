import React, { useState } from 'react';
import styles from './MainLayout.module.css';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import FeedHeader from '../feed/FeedHeader';
import StartupCard from '../feed/StartupCard';
import mockStartups from '../../data/mockStartups';
import ProfilePage from '../../pages/ProfilePage';
import AdvisorsPage from '../../pages/AdvisorsPage';
import InvestorDiscovery from '../investors/InvestorDiscovery';

/**
 * MainLayout Component - Main application layout
 * Handles responsive 3-column flex layout (desktop) vs single column (mobile)
 * Includes sticky sidebars and scrollable feed
 */
function MainLayout({ onShowRegister, onShowLogin, onShowProfile, onShowHome, onShowAdvisors, onShowInvestors, user, onLogout, showProfile = false, showAdvisors = false, showInvestors = false }) {
  const [isPremium] = useState(false); // Hardcoded as false - shows blur overlay
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar - Desktop always visible, Mobile slide-out */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onShowRegister={onShowRegister}
        onShowLogin={onShowLogin}
        onShowProfile={onShowProfile}
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        onMenuItemClick={closeSidebar}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Mobile Top Bar */}
        <TopBar onMenuClick={openSidebar} />

        {/* Feed Content or Profile Page */}
        {showProfile ? (
          <ProfilePage user={user} onShowAdvisors={onShowAdvisors} />
        ) : showAdvisors ? (
          <AdvisorsPage />
        ) : showInvestors ? (
          <InvestorDiscovery />
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Right Panel - Desktop Only */}
      <RightPanel />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        user={user}
        onShowProfile={onShowProfile}
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        activeTab={showProfile ? 'Profile' : showAdvisors ? 'Advisors' : showInvestors ? 'Investors' : 'Home'}
      />
    </div>
  );
}

export default MainLayout;
