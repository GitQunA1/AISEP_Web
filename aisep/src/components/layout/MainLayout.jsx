import React, { useState, useRef, useEffect } from 'react';
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
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [hasStartupProfile, setHasStartupProfile] = useState(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  
  const mainContentRef = useRef(null);
  const homeScrollPos = useRef(0);
  const prevViewRef = useRef({
    projectId: null,
    profileId: null,
    advisor: null,
    activeView: activeView
  });

  // Scroll Management: Persistence & Scroll-to-Top
  useEffect(() => {
    const main = mainContentRef.current;
    const isMobile = window.innerWidth < 1024;
    
    const isDetailView = !!(selectedProjectId || selectedStartupProfileId || selectedAdvisor);
    const wasDetailView = !!(prevViewRef.current.projectId || prevViewRef.current.profileId || prevViewRef.current.advisor);
    const viewChanged = activeView !== prevViewRef.current.activeView;

    // Helper to get/set scroll
    const getScroll = () => isMobile ? window.scrollY : (main ? main.scrollTop : 0);
    const setScroll = (val) => {
      if (isMobile) {
        window.scrollTo({ top: val, behavior: 'instant' });
      } else if (main) {
        main.scrollTop = val;
      }
    };

    // Transition Logic
    if (isDetailView && !wasDetailView) {
      // ENTERING DETAIL FROM HOME: Save position (double-check if not already saved by handler)
      if (homeScrollPos.current === 0) {
        homeScrollPos.current = getScroll();
      }
      setScroll(0);
    } else if (!isDetailView && wasDetailView) {
      // RETURNING TO HOME FROM DETAIL: Restore position instantly
      setIsReturning(true);
      setScroll(homeScrollPos.current);
    } else if (isDetailView && wasDetailView) {
      // SWITCHING BETWEEN DIFFERENT DETAILS
      setIsReturning(false);
      setScroll(0);
    } else if (viewChanged) {
      // SWITCHING MAIN TABS: Reset scroll and allow animations
      setScroll(0);
      setIsReturning(false);
      homeScrollPos.current = 0; 
    }

    // Update refs for next change
    prevViewRef.current = {
      projectId: selectedProjectId,
      profileId: selectedStartupProfileId,
      advisor: selectedAdvisor,
      activeView: activeView
    };
  }, [selectedProjectId, selectedStartupProfileId, selectedAdvisor, activeView]);

  // Handle Browser Back/Forward and URL sync
  useEffect(() => {
    const handlePopState = () => {
      // If we're going back to root, clear all detail states
      if (window.location.pathname === '/' || window.location.pathname === '') {
        setSelectedProjectId(null);
        setSelectedStartupProfileId(null);
        setSelectedAdvisor(null);
      } else if (window.location.pathname.startsWith('/projects/')) {
        const id = window.location.pathname.split('/')[2];
        setSelectedProjectId(id);
      }
    };

    // Initial check for URL projects
    if (window.location.pathname.startsWith('/projects/')) {
      const id = window.location.pathname.split('/')[2];
      if (id) setSelectedProjectId(id);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    sort: 'newest',
  });

  useEffect(() => {
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

  useEffect(() => {
    // Only fetch if we are showing the main feed
    if (showAdvisors || showInvestors) return;

    const fetchFeed = async () => {
      setIsLoading(true);
      setFeedError(null);
      try {
        // Fetch both projects and startup profiles with large pageSize to ensure all are joined
        const [projectsRes, startupsRes] = await Promise.all([
          projectSubmissionService.getAllProjects(),
          startupProfileService.getAllStartups({ pageSize: 100 })
        ]);

        const startupMap = {};
        const startups = startupsRes?.data?.items || startupsRes?.items || (Array.isArray(startupsRes?.data) ? startupsRes.data : []);
        
        if (startups.length > 0) {
          startups.forEach(s => {
            const name = s.organizationName || s.companyName;
            if (!name) return;
            
            // Map by all possible ID fields to be safe
            if (s.startupId) startupMap[s.startupId] = name;
            if (s.StartupId) startupMap[s.StartupId] = name;
            if (s.userId) startupMap[s.userId] = name;
            if (s.UserId) startupMap[s.UserId] = name;
            if (s.id) startupMap[s.id] = name;
          });
        }

        if (projectsRes.statusCode === 200 && projectsRes.data && projectsRes.data.items) {
          // Filter for published projects and map to UI model
          let publishedProjects = projectsRes.data.items
            .map(p => {
              // Try every possible ID field that backend might use to link project to startup/owner
              const sid = p.startupId || p.StartupId || p.userId || p.UserId || p.ownerId || p.authorId;
              const mappedName = startupMap[sid] || p.startupName || p.organizationName || null;
              
              return {
                ...p,
                id: p.projectId,
                startupId: sid,
                startupName: mappedName, 
                name: p.projectName,
              description: p.shortDescription,
              stage: p.developmentStage,
              industry: p.industry,
              imageUrl: p.projectImageUrl,
              tags: [], // No tags from new API
              aiScore: undefined,
              score: p.startupPotentialScore || undefined,
              timestamp: new Date().toLocaleDateString('vi-VN'),
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
              };
            });

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

          // Fetch AI Evaluation History asynchronously to not block the UI (Skip for staff to avoid 403 errors)
          const fetchScoresAsync = async () => {
            const roleStr = user?.role?.toString().toLowerCase() || '';
            const roleNum = Number(user?.role);
            const isStaff = roleStr === 'operationstaff' || roleStr === 'operation_staff' || roleStr === 'staff' || roleNum === 3;
            
            if (isStaff) {
              console.log('Skipping AI score fetch for staff role');
              return;
            }

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
    // When filters change, reset isReturning so the new list can animate
    setIsReturning(false);
    setActiveFilters(filters);
  };

  // Combined Filtering Logic
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = allStartups.filter(startup => {
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
        case 'oldest':
          filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
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
          onMenuItemClick={() => {
            // Reset cached scroll if user navigates via sidebar
            homeScrollPos.current = 0;
            closeMobileMenu();
          }}
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
          ref={mainContentRef}
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
              onShowLogin={onShowLogin}
            />
          ) : (
            <AdvisorsPage 
              user={user} 
              onShowLogin={onShowLogin}
              onSelectAdvisor={(advisor) => {
                // Save scroll position
                const isMobile = window.innerWidth < 1024;
                const scrollPos = isMobile ? window.scrollY : (mainContentRef.current ? mainContentRef.current.scrollTop : 0);
                homeScrollPos.current = scrollPos;
                setSelectedAdvisor(advisor);
              }} 
            />
          )
        ) : showInvestors ? (
          <InvestorDiscovery user={user} onShowLogin={onShowLogin} />
        ) : showAI ? (
          <AIChatAssistant />
        ) : selectedStartupProfileId ? (
          <StartupDetail
            startupId={selectedStartupProfileId}
            onBack={() => setSelectedStartupProfileId(null)}
            user={user}
            onShowLogin={onShowLogin}
          />
        ) : selectedProjectId ? (
          <ProjectDetailView
            projectId={selectedProjectId}
            user={user}
            onShowLogin={onShowLogin}
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
                activeFilters={activeFilters}
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
                  {filteredStartups.map((startup, index) => (
                    <StartupCard
                      key={startup.id}
                      index={index}
                      startup={startup}
                      isPremium={isPremium}
                      user={user}
                      isReturning={isReturning}
                      onViewProfile={(id) => {
                        // Save scroll position
                        const isMobile = window.innerWidth < 1024;
                        const scrollPos = isMobile ? window.scrollY : (mainContentRef.current ? mainContentRef.current.scrollTop : 0);
                        homeScrollPos.current = scrollPos;
                        setSelectedStartupProfileId(id);
                      }}
                      onViewProject={(id) => {
                        // Capture scroll BEFORE state change
                        const isMobile = window.innerWidth < 1024;
                        const scrollPos = isMobile ? window.scrollY : (mainContentRef.current ? mainContentRef.current.scrollTop : 0);
                        homeScrollPos.current = scrollPos;
                        
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
          onShowLogin={onShowLogin}
          topRatedStartups={topRatedStartups}
          trendingSectors={trendingSectors}
          isLoading={isLoading || isScoresLoading}
          user={user}
        />
      </div>

      {/* Project Submission Form Modal */}
      {showProjectForm && (
        <ProjectSubmissionForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={async (data) => {
            // User clicked "Đến Startup Dashboard" button
            // Navigate to dashboard
            onShowDashboard?.();
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
          primaryBtnText="Đến Startup Dashboard"
          onPrimaryClick={() => {
            setShowSuccessModal(false);
            onShowDashboard?.();
          }}
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
        activeTab={
          activeView === 'main' ? 'Home' : 
          activeView === 'advisors' ? 'Advisors' : 
          activeView === 'investors' ? 'Investors' : 
          activeView === 'ai' ? 'AI' : 
          activeView.startsWith('dashboard') ? (
            activeView === 'dashboard' ? 'Dashboard' : 
            activeView === 'dashboard_project_management' ? 'Projects' :
            activeView === 'dashboard_bookings' ? 'Bookings' :
            activeView === 'dashboard_approvals' ? 'Approvals' :
            activeView === 'dashboard_activity' ? 'Activity' : 'Dashboard'
          ) : ''
        }
      />

    </div>
  );
}

export default MainLayout;
