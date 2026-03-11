import React, { useState } from 'react';
import { Rocket } from 'lucide-react';
import styles from './MainLayout.module.css';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import FeedHeader from '../feed/FeedHeader';
import StartupCard from '../feed/StartupCard';
import StartupDetail from '../feed/StartupDetail';
import projectSubmissionService from '../../services/projectSubmissionService';
import AdvisorsPage from '../../pages/AdvisorsPage';
import InvestorDiscovery from '../investors/InvestorDiscovery';

/**
 * MainLayout Component - Main application layout
 * Handles strictly defined 3-column grid layout (desktop) vs single column (mobile)
 * Locks viewport width/height to prevent scrolling
 */
function MainLayout({ onShowRegister, onShowLogin, onShowHome, onShowAdvisors, onShowInvestors, onShowDashboard, user, onLogout, showAdvisors = false, showInvestors = false, activeView = 'main' }) {
  const [isPremium] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState(null);

  // Fetch all projects (we use getAllProjects to get public feed)
  const [allStartups, setAllStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
  });

  React.useEffect(() => {
    // Only fetch if we are showing the main feed
    if (showAdvisors || showInvestors) return;

    const fetchFeed = async () => {
      setIsLoading(true);
      setFeedError(null);
      try {
        const res = await projectSubmissionService.getAllProjects();
        if (res.statusCode === 200 && res.data && res.data.items) {
          // Filter for published projects and map to UI model
          const publishedProjects = res.data.items
            .filter(p => p.status === 'Published')
            .map(p => ({
              ...p,
              id: p.projectId,
              name: p.projectName,
              description: p.shortDescription,
              stage: p.developmentStage,
              // keySkills is a comma-separated string, e.g. "Technology, IoT"
              // Parse it into array of tags; used for industry/skill badges
              industry: p.keySkills
                ? p.keySkills.split(',').map(s => s.trim()).filter(Boolean)[0] || null
                : null,
              tags: p.keySkills
                ? p.keySkills.split(',').map(s => s.trim()).filter(Boolean)
                : [],
              aiScore: p.score || 0,
              timestamp: new Date(p.publishedAt).toLocaleDateString('vi-VN'),
              logo: null
            }));

          setAllStartups(publishedProjects);
          setFilteredStartups(publishedProjects);
        } else {
          setFeedError(res.message || "Không thể tải danh sách dự án.");
        }
      } catch (err) {
        console.error("Failed to load feed", err);
        setFeedError(err.message || "Đã xảy ra lỗi khi kết nối với máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, [showAdvisors, showInvestors]);

  // 2. Define Handlers
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);

    // Apply filters to startups
    const filtered = allStartups.filter(startup => {
      if (filters.industry && startup.industry !== filters.industry) return false;
      if (filters.stage && startup.stage !== filters.stage) return false;
      if (filters.minScore && (startup.aiEvaluation?.startupScore || 0) < filters.minScore) return false;
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
        {showAdvisors ? (
          <AdvisorsPage />
        ) : showInvestors ? (
          <InvestorDiscovery user={user} />
        ) : selectedStartupId ? (
          <StartupDetail
            startupId={selectedStartupId}
            onBack={() => setSelectedStartupId(null)}
          />
        ) : (
          <>
            {/* WRAPPER FOR CONSTRAINED STREAM */}
            <div className={styles.feedStreamWrapper}>
              <FeedHeader
                user={user}
                onFilterChange={handleFilterChange}
              />
              {isLoading ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <p>Đang tải dự án...</p>
                </div>
              ) : feedError ? (
                <div className={styles.emptyState}>
                  <Rocket size={48} className={styles.emptyIcon} style={{ color: '#ef4444' }} />
                  <h3>Lỗi tải dự án</h3>
                  <p>{feedError}</p>
                </div>
              ) : filteredStartups.length > 0 ? (
                filteredStartups.map((startup) => (
                  <StartupCard
                    key={startup.id}
                    startup={startup}
                    isPremium={isPremium}
                    user={user}
                    onViewProfile={(id) => setSelectedStartupId(id)}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <Rocket size={48} className={styles.emptyIcon} />
                  <h3>Không có dự án nào</h3>
                  <p>Hiện chưa có dự án startup nào để hiển thị trong bảng tin.</p>
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
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        onShowDashboard={onShowDashboard}
        activeTab={showAdvisors ? 'Advisors' : showInvestors ? 'Investors' : 'Home'}
      />

    </div>
  );
}

export default MainLayout;
