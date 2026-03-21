import React, { useState } from 'react';
import styles from './DashboardLayout.module.css';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

/**
 * DashboardLayout - Wrapper layout for dashboard pages
 * Provides navigation (Sidebar, TopBar, BottomNav) while displaying dashboard content
 * Uses strict 3-column grid layout
 */
function DashboardLayout({
  children,
  onShowRegister,
  onShowLogin,
  onShowHome,
  onShowAdvisors,
  onShowInvestors,
  onShowDashboard,
  onShowAI,
  user,
  onLogout,
  activeView = 'dashboard'
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.mainContainer}>
      {/* 1. Left Sidebar (Fixed) */}
      <div className={styles.leftSidebar}>
        {/* Pass activeView to sidebar for highlighting */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onShowRegister={onShowRegister}
          onShowLogin={onShowLogin}
          onShowHome={onShowHome}
          onShowAdvisors={onShowAdvisors}
          onShowInvestors={onShowInvestors}
          onShowDashboard={onShowDashboard}
          onShowAI={onShowAI}
          onMenuItemClick={closeSidebar}
          user={user}
          onLogout={onLogout}
          activeView={activeView}
        />
      </div>

      {/* 2. Main Content (Scrollable) */}
      <main 
        key={activeView}
        className={`${styles.mainContent} mainContent view-enter`}
      >
        {/* Mobile Top Bar */}
        <TopBar onMenuClick={openSidebar} />

        {/* Dashboard Content */}
        <div className={styles.dashboardContainer}>
          {children}
        </div>
      </main>

      {/* 3. Right Panel (Fixed) */}
      <div className={`${styles.rightPanel} rightPanel`}>
        <RightPanel showSearch={false} />
      </div>

      {/* Mobile Bottom Navigation - Kept outside strict grid flow if fixed, or handled by media queries */}
      <BottomNav
        user={user}
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        onShowDashboard={onShowDashboard}
        onShowAI={onShowAI}
        activeTab="Dashboard"
      />
    </div>
  );
}

export default DashboardLayout;
