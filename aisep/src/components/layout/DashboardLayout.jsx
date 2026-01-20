import React, { useState } from 'react';
import styles from './DashboardLayout.module.css';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

/**
 * DashboardLayout - Wrapper layout for dashboard pages
 * Provides navigation (Sidebar, TopBar, BottomNav) while displaying dashboard content
 */
function DashboardLayout({ 
  children, 
  onShowRegister, 
  onShowLogin, 
  onShowProfile, 
  onShowHome, 
  onShowAdvisors, 
  onShowInvestors, 
  onShowDashboard,
  user, 
  onLogout 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        onShowDashboard={onShowDashboard}
        onMenuItemClick={closeSidebar}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Mobile Top Bar */}
        <TopBar onMenuClick={openSidebar} />

        {/* Dashboard Content */}
        <div className={styles.dashboardContainer}>
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        user={user}
        onShowProfile={onShowProfile}
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        onShowDashboard={onShowDashboard}
        activeTab="Dashboard"
      />
    </div>
  );
}

export default DashboardLayout;
