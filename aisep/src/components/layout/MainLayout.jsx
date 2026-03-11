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
 * Handles strictly defined 3-column grid layout (desktop) vs single column (mobile)
 * Locks viewport width/height to prevent scrolling
 */
function MainLayout({ onShowRegister, onShowLogin, onShowProfile, onShowHome, onShowAdvisors, onShowInvestors, onShowDashboard, user, onLogout, showProfile = false, showAdvisors = false, showInvestors = false, activeView = 'main' }) {
  const [isPremium] = useState(false); // Hardcoded as false - shows blur overlay

  // 1. Initialize State for Mobile Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [filteredStartups, setFilteredStartups] = useState(mockStartups);
  const [activeFilters, setActiveFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
  });

  // 2. Define Handlers
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);

    // Apply filters to startups
    const filtered = mockStartups.filter(startup => {
      if (filters.industry && startup.industry !== filters.industry) return false;
      if (filters.stage && startup.stage !== filters.stage) return false;
      if (filters.minScore && startup.aiScore < filters.minScore) return false;
      if (filters.fundingStage && startup.fundingStage !== filters.fundingStage) return false;
      return true;
    });

    setFilteredStartups(filtered);
  };

  return (
    <div className={styles.mainContainer}>

      {/* 1. Left Sidebar (Fixed) */}
      <div className={styles.leftSidebar}>
        {/* Pass state AND close handler to Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          onShowRegister={onShowRegister}
          onShowLogin={onShowLogin}
          onShowProfile={onShowProfile}
          onShowHome={onShowHome}
          onShowAdvisors={onShowAdvisors}
          onShowInvestors={onShowInvestors}
          onShowDashboard={onShowDashboard}
          onMenuItemClick={closeMobileMenu}
          user={user}
          onLogout={onLogout}
          activeView={activeView}
        />
      </div>

      {/* 2. Main Feed (Scrollable) */}
      <main className={styles.mainContent}>
        {/* MOBILE HEADER (Fixed Top) */}
        {/* Pass the toggle function to the Hamburger Button */}
        <div className="md:hidden">
          <TopBar onMenuClick={toggleMobileMenu} />
        </div>

        {/* Feed Content or Profile Page */}
        {showProfile ? (
          <ProfilePage user={user} onShowAdvisors={onShowAdvisors} />
        ) : showAdvisors ? (
          <AdvisorsPage />
        ) : showInvestors ? (
          <InvestorDiscovery />
        ) : (
          <>
            {/* WRAPPER FOR CONSTRAINED STREAM */}
            <div className={styles.feedStreamWrapper}>
              <FeedHeader
                user={user}
                onFilterChange={handleFilterChange}
              />
              {filteredStartups.length > 0 ? (
                filteredStartups.map((startup) => (
                  <StartupCard
                    key={startup.id}
                    startup={startup}
                    isPremium={isPremium}
                    user={user}
                  />
                ))
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <p>No projects found matching your filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 3. Right Panel (Fixed) */}
      <div className={styles.rightPanel}>
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation - Kept outside strict grid flow if fixed, or handled by media queries */}
      <BottomNav
        user={user}
        onShowProfile={onShowProfile}
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        onShowDashboard={onShowDashboard}
        activeTab={showProfile ? 'Profile' : showAdvisors ? 'Advisors' : showInvestors ? 'Investors' : 'Home'}
      />

    </div>
  );
}

export default MainLayout;
