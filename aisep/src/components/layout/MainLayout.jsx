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
function MainLayout({ onShowRegister, onShowLogin, onShowProfile, onShowHome, onShowAdvisors, onShowInvestors, onShowDashboard, user, onLogout, showProfile = false, showAdvisors = false, showInvestors = false }) {
  const [isPremium] = useState(false); // Hardcoded as false - shows blur overlay
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const [filteredStartups, setFilteredStartups] = useState(mockStartups);
  const [activeFilters, setActiveFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
  });

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

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
        onShowDashboard={onShowDashboard}
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
            <FeedHeader 
              user={user}
              onFilterChange={handleFilterChange}
            />
            <div className={styles.feedContainer}>
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
        onShowDashboard={onShowDashboard}
        activeTab={showProfile ? 'Profile' : showAdvisors ? 'Advisors' : showInvestors ? 'Investors' : 'Home'}
      />
    </div>
  );
}

export default MainLayout;
