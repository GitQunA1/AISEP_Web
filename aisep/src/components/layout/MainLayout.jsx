import React, { useState } from 'react';
import { Rocket, Loader } from 'lucide-react';
import styles from './MainLayout.module.css';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import FeedHeader from '../feed/FeedHeader';
import StartupCard from '../feed/StartupCard';
import ProjectDetailView from '../feed/ProjectDetailView';
import StartupDetail from '../feed/StartupDetail';
import ProjectSubmissionForm from '../startup/ProjectSubmissionForm';
import investorService from '../../services/investorService';
import projectSubmissionService from '../../services/projectSubmissionService';
import AdvisorsPage from '../../pages/AdvisorsPage';
import advisorService from '../../services/advisorService';
import AdvisorDetailView from '../profile/AdvisorDetailView';
import InvestorDiscovery from '../investors/InvestorDiscovery';
import AIChatAssistant from '../../pages/AIChatAssistant';
import AIEvaluationService from '../../services/AIEvaluationService';

import ProfileRequiredModal from '../startup/ProfileRequiredModal';
import startupProfileService from '../../services/startupProfileService';
import SuccessModal from '../common/SuccessModal';

/**
 * MainLayout Component - Main application layout
 * Handles strictly defined 3-column grid layout (desktop) vs single column (mobile)
 * Locks viewport width/height to prevent scrolling
 */
function MainLayout({ 
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
  showAdvisors = false, 
  showInvestors = false, 
  showAI = false, 
  activeView = 'main' 
}) {
  const [isPremium] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedStartupProfileId, setSelectedStartupProfileId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  React.useEffect(() => {
    if (window.location.pathname.startsWith('/projects/')) {
      const id = window.location.pathname.split('/')[2];
      if (id) {
        setSelectedProjectId(id);
      }
    }
  }, []);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [hasStartupProfile, setHasStartupProfile] = useState(null); // null means checking
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch all projects (we use getAllProjects to get public feed)
  const [allStartups, setAllStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [topRatedStartups, setTopRatedStartups] = useState([]);
  const [trendingSectors, setTrendingSectors]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScoresLoading, setIsScoresLoading] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [investorCount, setInvestorCount] = useState(0);

  // Helper for RightPanel labels
  const SECTOR_LABELS = [
    'Xu hướng tuần này',
    'Tăng trưởng nhanh',
    'Nhiều nhà đầu tư theo dõi',
    'Mới nhất',
    'Đang nổi',
  ];
  const [activeFilters, setActiveFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
  });

  React.useEffect(() => {
    const checkProfile = async () => {
      const userRole = (user?.role !== undefined && user?.role !== null) ? user.role.toString().toLowerCase() : '';
      if (user && (userRole === 'startup' || userRole === '0') && user.userId) {
        try {
          const profile = await startupProfileService.getStartupProfileByUserId(user.userId);
          const hasProfile = !!profile;
          setHasStartupProfile(hasProfile);

          // If redirected with setup=true and no profile, show modal
          const params = new URLSearchParams(window.location.search);
          if (!hasProfile && params.get('setup') === 'true') {
            setShowProfileModal(true);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error("Failed to check profile", err);
        }
      } else {
        setHasStartupProfile(true);
      }
    };
    checkProfile();
  }, [user]);

  React.useEffect(() => {
    // Only fetch if we are showing the main feed
    if (showAdvisors || showInvestors) return;

    const fetchFeed = async () => {
      setIsLoading(true);
      setFeedError(null);
      try {
        // Fetch both projects and startup profiles to join them
        const [projectsRes, startupsRes] = await Promise.all([
          projectSubmissionService.getAllProjects(),
          startupProfileService.getAllStartups()
        ]);

        const startupMap = {};
        if (startupsRes?.data?.items) {
          startupsRes.data.items.forEach(s => {
            startupMap[s.startupId || s.id] = s.organizationName || s.companyName;
          });
        }

        if (projectsRes.statusCode === 200 && projectsRes.data && projectsRes.data.items) {
          // Filter for published projects and map to UI model
          let publishedProjects = projectsRes.data.items
            .map(p => ({
              ...p,
              id: p.projectId,
              startupId: p.startupId,
              startupName: startupMap[p.startupId] || null, // Join with startupMap
              name: p.projectName,
              description: p.shortDescription,
              stage: p.developmentStage,
              industry: p.keySkills
                ? p.keySkills.split(',').map(s => s.trim()).filter(Boolean)[0] || null
                : null,
              tags: p.keySkills
                ? p.keySkills.split(',').map(s => s.trim()).filter(Boolean)
                : [],
              aiScore: undefined,
              score: undefined,
              timestamp: new Date(p.approvedAt || p.createdAt).toLocaleDateString('vi-VN'),
              logo: null,
              // Full project details
              problemStatement: p.problemStatement,
              solutionDescription: p.solutionDescription,
              targetCustomers: p.targetCustomers,
              uniqueValueProposition: p.uniqueValueProposition,
              marketSize: p.marketSize,
              businessModel: p.businessModel,
              revenue: p.revenue,
              competitors: p.competitors,
              teamMembers: p.teamMembers,
              teamExperience: p.teamExperience,
              status: p.status,
              viewCount: p.viewCount
            }));

          setAllStartups(publishedProjects);
          setFilteredStartups(publishedProjects);

          // Extract trending sectors based on industry tags frequency
          const industryCounts = publishedProjects.reduce((acc, p) => {
            if (p.tags && p.tags.length > 0) {
              p.tags.forEach(t => {
                acc[t] = (acc[t] || 0) + 1;
              });
            } else if (p.industry) {
              acc[p.industry] = (acc[p.industry] || 0) + 1;
            }
            return acc;
          }, {});
          
          const trending = Object.entries(industryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
              label: name,
              name: name,
              count: count
            }));
            
          setTrendingSectors(trending);

          // Fetch AI Evaluation History asynchronously to not block the UI
          const fetchScoresAsync = async () => {
            setIsScoresLoading(true);
            const updatedProjects = await Promise.all(publishedProjects.map(async (p) => {
              try {
                const historyRes = await AIEvaluationService.getProjectAnalysisHistory(p.id);
                if (historyRes.success && historyRes.data && historyRes.data.length > 0) {
                  const finalScore = historyRes.data[0]?.potentialScore || historyRes.data[0]?.startupScore || p.score || null;
                  return { ...p, aiScore: finalScore, score: finalScore };
                }
              } catch (err) {
                console.error(`Failed to fetch AI history for project ${p.id}`, err);
              }
              // If no history exists or fetch failed, set scores to null
              return { ...p, aiScore: null, score: null };
            }));

            // Update main lists with new scores
            setAllStartups(updatedProjects);
            setFilteredStartups(updatedProjects);

            // Update Top Rated Startups based on aiScore
            const sortedByScore = [...updatedProjects].filter(p => p.aiScore > 0).sort((a, b) => b.aiScore - a.aiScore);
            setTopRatedStartups(sortedByScore.slice(0, 3));
            setIsScoresLoading(false);
          };

          fetchScoresAsync();

        } else {
          setFeedError(projectsRes.message || "Không thể tải danh sách dự án.");
        }
      } catch (err) {
        console.error("Failed to load feed", err);
        setFeedError(err.message || "Đã xảy ra lỗi khi kết nối với máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchStats = async () => {
      try {
        const invRes = await investorService.getAllInvestors({ pageSize: 1 });
        setInvestorCount(invRes.totalCount || 0);
      } catch (err) {
        console.error("Failed to fetch investor count", err);
      }
    };

    fetchFeed();
    fetchStats();
  }, [showAdvisors, showInvestors, user]);

  // 2. Define Handlers
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // Combined Filtering Logic
  React.useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = allStartups.filter(startup => {
      // 1. Core Filters (Industry, Stage, Score)
      if (activeFilters.industry && startup.industry !== activeFilters.industry) return false;
      if (activeFilters.stage && startup.stage !== activeFilters.stage) return false;
      if (activeFilters.minScore && (startup.aiScore || 0) < activeFilters.minScore) return false;
      if (activeFilters.fundingStage && startup.fundingStage !== activeFilters.fundingStage) return false;

      // 2. Search Query (Name, Description, Tags)
      if (query) {
        const matchesName = (startup.name || '').toLowerCase().includes(query);
        const matchesDesc = (startup.description || '').toLowerCase().includes(query);
        const matchesTags = (startup.tags || []).some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });

    // 3. Sort Logic
    if (activeFilters.sort) {
      switch (activeFilters.sort) {
        case 'newest':
          filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
          break;
        case 'trending':
          filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        case 'rated':
          filtered.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
          break;
        case 'funded':
          // Keep only projects explicitly indicating they are actively raising or having a funding stage
          filtered = filtered.filter(p => p.fundingStage && p.fundingStage !== 'Không gọi vốn' && p.fundingStage.trim() !== '');
          break;
        default:
          break;
      }
    }

    setFilteredStartups(filtered);
  }, [allStartups, activeFilters, searchQuery]);

  return (
    <div className={`${styles.mainContainer} ${showAI ? styles.aiMode : ''}`}>

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
          onShowAI={onShowAI}
          onMenuItemClick={closeMobileMenu}
          user={user}
          onLogout={onLogout}
          activeView={activeView}
        />
      </div>

      {/* 2. Main Feed (Scrollable) */}
        {/* MOBILE HEADER (Fixed Top) */}
        {/* TopBar visibility is controlled by CSS (display: none on desktop) */}
        <TopBar onMenuClick={toggleMobileMenu} />

        <main 
          key={activeView}
          className={`${styles.mainContent} ${showAI ? styles.noScroll : ''} view-enter`}
        >
          {/* Feed Content or Profile Page */}
          {children ? (
          children
        ) : showAdvisors ? (
          selectedAdvisor ? (
            <AdvisorDetailView
              user={user}
              advisor={selectedAdvisor}
              onBack={() => setSelectedAdvisor(null)}
            />
          ) : (
            <AdvisorsPage user={user} onSelectAdvisor={(advisor) => setSelectedAdvisor(advisor)} />
          )
        ) : showInvestors ? (
          <InvestorDiscovery user={user} />
        ) : showAI ? (
          <AIChatAssistant />
        ) : selectedStartupProfileId ? (
          <StartupDetail
            startupId={selectedStartupProfileId}
            onBack={() => setSelectedStartupProfileId(null)}
          />
        ) : selectedProjectId ? (
          <ProjectDetailView
            projectId={selectedProjectId}
            onBack={() => {
              setSelectedProjectId(null);
              if (window.location.pathname.startsWith('/projects/')) {
                 window.history.pushState({}, '', '/');
              }
            }}
          />
        ) : (
          <>
            {/* WRAPPER FOR CONSTRAINED STREAM */}
            <div className={styles.feedStreamWrapper}>
              <FeedHeader
                user={user}
                onFilterChange={handleFilterChange}
                showStats={true}
                onShowProjectForm={() => {
                  const userRole = (user?.role !== undefined && user?.role !== null) ? user.role.toString().toLowerCase() : '';
                  if ((userRole === 'startup' || userRole === '0') && !hasStartupProfile) {
                    setShowProfileModal(true);
                  } else {
                    setShowProjectForm(true);
                  }
                }}
                stats={{
                  approvedCount: allStartups.length,
                  investorCount: investorCount,
                  industryCount: new Set(allStartups.flatMap(s => s.tags)).size
                }}
                industryCounts={
                  allStartups.reduce((acc, s) => {
                    s.tags.forEach(tag => {
                      acc[tag] = (acc[tag] || 0) + 1;
                    });
                    return acc;
                  }, {})
                }
              />

              {showProfileModal && (
                <ProfileRequiredModal
                  onRedirect={() => onShowDashboard()}
                  onDismiss={() => setShowProfileModal(false)}
                />
              )}
              {isLoading || (isScoresLoading && activeFilters.sort === 'rated') ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  {isScoresLoading && activeFilters.sort === 'rated' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Loader size={24} className={styles.spinIcon} />
                      <p style={{ margin: 0 }}>Đang phân tích điểm AI...</p>
                    </div>
                  ) : (
                    <p>Đang tải dự án...</p>
                  )}
                </div>
              ) : feedError ? (
                <div className={styles.emptyState}>
                  <Rocket size={48} className={styles.emptyIcon} style={{ color: '#ef4444' }} />
                  <h3>Lỗi tải dự án</h3>
                  <p>{feedError}</p>
                </div>
              ) : filteredStartups.length > 0 ? (
                <div className={styles.feedGrid}>
                  {filteredStartups.map((startup) => (
                    <StartupCard
                      key={startup.id}
                      startup={startup}
                      isPremium={isPremium}
                      user={user}
                      onViewProfile={(id) => setSelectedStartupProfileId(id)}
                      onViewProject={(id) => {
                        setSelectedProjectId(id);
                        window.history.pushState({}, '', `/projects/${id}`);
                      }}
                    />
                  ))}
                </div>
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
        <RightPanel 
          searchQuery={searchQuery} 
          onSearchChange={(e) => setSearchQuery(e.target.value)} 
          showSearch={activeView === 'main' && !selectedProjectId && !selectedStartupProfileId && !selectedAdvisor}
          onFilterChange={handleFilterChange}
          onShowHome={onShowHome}
          topRatedStartups={topRatedStartups}
          trendingSectors={trendingSectors}
          isLoading={isLoading || isScoresLoading}
        />
      </div>

      {/* Project Submission Form Modal */}
      {showProjectForm && (
        <ProjectSubmissionForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={(data) => {
            setShowProjectForm(false);
            setShowSuccessModal(true);
          }}
          user={user}
        />
      )}

      {/* Project Submission Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          title="Tạo Dự Án Thành Công!"
          message={
            <span style={{ lineHeight: '1.6' }}>
              Dự án của bạn đã được tạo thành công. Bạn có thể tải lên các tài liệu bổ sung (Pitch Deck, Business Plan) và nộp dự án bất cứ lúc nào tại mục <strong>Quản lý dự án</strong> trong <strong>Startup Dashboard</strong>.
            </span>
          }
          primaryBtnText="Tuyệt vời"
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav
        user={user}
        onShowHome={onShowHome}
        onShowAdvisors={onShowAdvisors}
        onShowInvestors={onShowInvestors}
        onShowDashboard={onShowDashboard}
        onShowAI={onShowAI}
        activeTab={activeView === 'main' ? 'Home' : activeView === 'advisors' ? 'Advisors' : activeView === 'investors' ? 'Investors' : activeView === 'ai' ? 'AI' : ''}
      />

    </div>
  );
}

export default MainLayout;
