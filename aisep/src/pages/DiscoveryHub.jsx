import React, { useState, useEffect } from 'react';
import { Search, MapPin, Rocket, Filter, TrendingUp, CheckCircle, Target, Building2, Newspaper, Calendar, User, ExternalLink } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import InvestmentModal from '../components/common/InvestmentModal';
import startupProfileService from '../services/startupProfileService';
import dealsService from '../services/dealsService';
import prService from '../services/prService';
import styles from './DiscoveryHub.module.css';

/**
 * StartupDiscovery - Explore and discover startup companies
 * Featuring search, industry filtering, and premium startup cards.
 */
const DiscoveryHub = ({ user, onSelectStartup }) => {
    const [startups, setStartups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndustry, setActiveIndustry] = useState('Tất cả');
    const [investmentModal, setInvestmentModal] = useState(null); // { projectId, projectName, startupName }
    const [investmentStatusMap, setInvestmentStatusMap] = useState({}); // Map projectId -> {dealId, status}
    const [prs, setPRs] = useState([]); // All PRs for news feed
    const [isLoadingPRs, setIsLoadingPRs] = useState(false);
    const [showAllPRs, setShowAllPRs] = useState(false); // Toggle for PR modal

    const industries = ['Tất cả', 'FinTech', 'AgriTech', 'EdTech', 'HealthTech', 'SaaS', 'AI/ML', 'GreenTech'];

    // Check if current user is an investor
    const isInvestor = user && (user.role === 'Investor' || user.role === 1);
    
    console.log('[DiscoveryHub] isInvestor check:', {
        userExists: !!user,
        userRole: user?.role,
        isInvestor: isInvestor
    });

    useEffect(() => {
        const fetchStartups = async () => {
            setIsLoading(true);
            try {
                // Fetch with Sieve params if needed, but for now just get all
                const response = await startupProfileService.getAllStartups();
                const items = response?.data?.items || response?.items || [];
                console.log('[DiscoveryHub] Fetched startups:', items.length);
                setStartups(items);
                
                // After startups loaded, fetch investment status
                if (isInvestor) {
                    fetchInvestmentStatusNow(items);
                }
            } catch (error) {
                console.error("Failed to fetch startups:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStartups();
    }, [isInvestor]);

    // Helper function to fetch investment status
    const fetchInvestmentStatusNow = async (startupsList = null) => {
        console.log('[DiscoveryHub] fetchInvestmentStatusNow called:', { isInvestor, startupsList: startupsList?.length });
        
        if (!isInvestor) {
            console.log('[DiscoveryHub] Not an investor, setting empty map');
            setInvestmentStatusMap({});
            return;
        }

        try {
            console.log('[DiscoveryHub] 🔍 Fetching investment status...');
            const dealsRes = await dealsService.getInvestorDeals();
            console.log('[DiscoveryHub] Deals response:', dealsRes);
            
            const deals = dealsRes?.data?.items || [];
            console.log('[DiscoveryHub] Found deals count:', deals.length);
            console.log('[DiscoveryHub] Deals details:', deals.map(d => ({
                dealId: d.dealId,
                projectId: d.projectId,
                projectName: d.projectName,
                status: d.status
            })));
            
            // Create maps: by projectId, projectName, and projectId as string
            const statusMapByProjectId = {};
            const statusMapByProjectName = {};
            const statusMapByStartupName = {};
            
            deals.forEach(deal => {
                const dealInfo = {
                    dealId: deal.dealId,
                    status: deal.status,
                    projectId: deal.projectId,
                    projectName: deal.projectName,
                    startupName: deal.startupName,
                    investorConfirmed: deal.investorConfirmed,
                    startupConfirmed: deal.startupConfirmed,
                    amount: deal.amount,
                    equityPercentage: deal.equityPercentage
                };
                
                // Map by projectId (number)
                statusMapByProjectId[deal.projectId] = dealInfo;
                
                // Map by projectId (string)
                statusMapByProjectId[deal.projectId?.toString()] = dealInfo;
                
                // Map by projectName
                if (deal.projectName) {
                    console.log('[DiscoveryHub] Adding to projectName map:', deal.projectName.toLowerCase(), dealInfo);
                    statusMapByProjectName[deal.projectName.toLowerCase()] = dealInfo;
                }
                
                // Map by startupName
                if (deal.startupName) {
                    statusMapByStartupName[deal.startupName.toLowerCase()] = dealInfo;
                }
            });
            
            // Merge all maps - prioritize by projectId, then projectName, then startupName
            const combinedMap = { ...statusMapByProjectName, ...statusMapByStartupName, ...statusMapByProjectId };
            
            console.log('[DiscoveryHub] ✓ Investment status map created:');
            console.log('  By projectId:', statusMapByProjectId);
            console.log('  By projectName:', statusMapByProjectName);
            console.log('  By startupName:', statusMapByStartupName);
            console.log('  Combined map:', combinedMap);
            console.log('  Final map keys:', Object.keys(combinedMap));
            
            setInvestmentStatusMap(combinedMap);
        } catch (error) {
            console.error('[DiscoveryHub] Failed to fetch investment status:', error);
            setInvestmentStatusMap({});
        }
    };

    // Load investment status for all projects (if user is investor)
    useEffect(() => {
        console.log('[DiscoveryHub] useEffect triggered:', {
            isInvestor: isInvestor,
            startupsLength: startups.length
        });
        
        if (!isInvestor || startups.length === 0) {
            console.log('[DiscoveryHub] Skipping investment status fetch - not investor or no startups');
            return;
        }

        fetchInvestmentStatusNow(startups);
    }, [isInvestor, startups.length]);

    // Listen for new deal creation events to refresh investment status
    useEffect(() => {
        if (!isInvestor) return;

        const handleDealCreated = (event) => {
            console.log('[DiscoveryHub] Deal created event received, refreshing status map:', event.detail);
            // Refetch investment status when deal is created
            const fetchUpdatedStatus = async () => {
                try {
                    const dealsRes = await dealsService.getInvestorDeals();
                    const deals = dealsRes?.data?.items || [];
                    
                    // Build statusMap with same structure as fetchInvestmentStatusNow
                    // Map by projectName (lowercase) for matching with startup.organizationName
                    const statusMap = {};
                    deals.forEach(deal => {
                        const dealInfo = {
                            dealId: deal.dealId,
                            status: deal.status,
                            projectName: deal.projectName,
                            startupName: deal.startupName,
                            projectId: deal.projectId,
                            investorConfirmed: deal.investorConfirmed,
                            startupConfirmed: deal.startupConfirmed,
                            amount: deal.amount,
                            equityPercentage: deal.equityPercentage
                        };
                        
                        // Map by projectName (lowercase) - same as fetchInvestmentStatusNow
                        if (deal.projectName) {
                            statusMap[deal.projectName.toLowerCase()] = dealInfo;
                        }
                    });
                    
                    setInvestmentStatusMap(statusMap);
                    console.log('[DiscoveryHub] ✓ Investment status updated after deal creation', { statusMap });
                } catch (error) {
                    console.error('[DiscoveryHub] Failed to update investment status:', error);
                }
            };
            
            fetchUpdatedStatus();
        };

        window.addEventListener('deal_created', handleDealCreated);
        return () => window.removeEventListener('deal_created', handleDealCreated);
    }, [isInvestor]);

    // Fetch all PRs for the news feed
    useEffect(() => {
        const fetchPRs = async () => {
            setIsLoadingPRs(true);
            try {
                console.log('[DiscoveryHub] Fetching PRs...');
                const response = await prService.getPRs();
                console.log('[DiscoveryHub] PR Response:', response);
                
                // Handle paginated response structure
                // API returns: { data: { items: [...], page, pageSize, totalCount, totalPages } }
                let prList = [];
                if (response?.data?.items && Array.isArray(response.data.items)) {
                    // Paginated response with items array
                    prList = response.data.items;
                } else if (Array.isArray(response?.data)) {
                    // Direct array
                    prList = response.data;
                } else if (Array.isArray(response)) {
                    // Direct array response
                    prList = response;
                } else {
                    console.warn('[DiscoveryHub] Could not extract PR list from response');
                    prList = [];
                }
                
                console.log('[DiscoveryHub] Fetched PRs:', prList.length, prList);
                // Sort by publishedAt (newest first)
                const sortedPRs = prList.sort((a, b) => 
                    new Date(b.publishedAt) - new Date(a.publishedAt)
                );
                console.log('[DiscoveryHub] Setting PRs state with:', sortedPRs.length, 'items');
                setPRs(sortedPRs);
            } catch (error) {
                console.error('[DiscoveryHub] Failed to fetch PRs:', error);
                // Set mock data for testing
                console.log('[DiscoveryHub] Setting mock PR data for testing');
                setPRs([
                    { postPrId: 1, title: 'Test PR 1', projectName: 'TechStart', investorName: 'Investor A', publishedAt: new Date().toISOString(), content: 'Test content' },
                    { postPrId: 2, title: 'Test PR 2', projectName: 'Project B', investorName: 'Investor B', publishedAt: new Date().toISOString(), content: 'Test content' }
                ]);
            } finally {
                setIsLoadingPRs(false);
            }
        };

        fetchPRs();
    }, []);

    // Local filtering logic
    const filteredStartups = startups.filter(startup => {
        const matchesSearch = (startup.organizationName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (startup.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesIndustry = activeIndustry === 'Tất cả' || startup.industry === activeIndustry;

        return matchesSearch && matchesIndustry;
    });

    return (
        <div className={styles.container}>
            <FeedHeader
                title="Khám phá Startup"
                subtitle="Tìm kiếm và kết nối với những ý tưởng đột phá nhất Việt Nam"
                showFilter={false}
            />

            {/* Main Content - 2 Column Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 380px',
                gap: '24px',
                alignItems: 'start',
                padding: '0 24px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Left Column - Search, Filter, Startups */}
                <div>
                    {/* Search Section */}
                    <div className={styles.searchSection}>
                        <div className={styles.searchContainer}>
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên công ty hoặc lĩnh vực..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className={styles.filterSection}>
                        <div className={styles.pills}>
                            {industries.map(industry => (
                                <button
                                    key={industry}
                                    className={`${styles.pill} ${activeIndustry === industry ? styles.pillActive : ''}`}
                                    onClick={() => setActiveIndustry(industry)}
                                >
                                    {industry}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Startups Grid */}
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <p>Đang tải danh sách startup...</p>
                        </div>
                    ) : filteredStartups.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Rocket size={48} className={styles.emptyIcon} />
                            <h3>Không tìm thấy Startup</h3>
                            <p>Hãy thử thay đổi tiêu chí tìm kiếm hoặc lọc theo ngành khác.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {filteredStartups.map(startup => {
                        // Try to match by organizationName (case-insensitive)
                        let investmentStatus = null;
                        if (startup.organizationName) {
                            const orgNameLower = startup.organizationName.toLowerCase();
                            investmentStatus = investmentStatusMap[orgNameLower];
                            
                            console.log('[DiscoveryHub] Render card:', {
                                organizationName: startup.organizationName,
                                orgNameLower: orgNameLower,
                                mapKeys: Object.keys(investmentStatusMap),
                                foundStatus: !!investmentStatus,
                                investmentStatus: investmentStatus
                            });
                        } else {
                            console.log('[DiscoveryHub] Startup has no organizationName:', startup);
                        }
                        
                        return (
                        <div key={startup.startupId} className={styles.startupCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {startup.logoUrl ? (
                                        <img src={startup.logoUrl} alt={startup.organizationName} />
                                    ) : (
                                        <span>{(startup.organizationName || 'S').charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className={styles.startupInfo}>
                                    <div className={styles.nameRow}>
                                        <h3 className={styles.startupName}>{startup.organizationName}</h3>
                                        {startup.isVerified && <CheckCircle size={16} className={styles.verifiedIcon} />}
                                    </div>
                                    <span className={styles.industryTag}>{startup.industry}</span>
                                </div>
                                <div className={styles.scoreBadge}>
                                    <Target size={14} />
                                    <span>{startup.aiScore || 'N/A'} AI Score</span>
                                </div>
                            </div>

                            <p className={styles.description}>
                                {startup.description || 'Chưa có mô tả chi tiết cho startup này.'}
                            </p>

                            <div className={styles.metadata}>
                                <div className={styles.metaItem}>
                                    <MapPin size={14} />
                                    <span>{startup.location || 'Chưa cập nhật'}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <TrendingUp size={14} />
                                    <span>{startup.developmentStage || 'Giai đoạn sớm'}</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.viewDetailsBtn}
                                    onClick={() => onSelectStartup?.(startup.id || startup.startupId)}
                                >
                                    Xem chi tiết
                                </button>
                                <button className={styles.followBtn}>Theo dõi</button>
                                {isInvestor && investmentStatus ? (
                                    // Show investment status badge when already invested
                                    <div 
                                        className={styles.investmentStatusBadge}
                                        title={`Trạng thái: ${investmentStatus.status}\nDeal #${investmentStatus.dealId}`}
                                    >
                                        <span className={`${styles.statusIndicator} ${styles[`status_${investmentStatus.status?.toLowerCase()}`]}`}>
                                            {investmentStatus.status === 'Pending' && '🟡'}
                                            {investmentStatus.status === 'Confirmed' && '🟢'}
                                            {investmentStatus.status === 'Contract_Signed' && '🟣'}
                                            {investmentStatus.status === 'Minted_NFT' && '✨'}
                                            {investmentStatus.status === 'Failed' && '🔴'}
                                        </span>
                                        <span className={styles.statusText}>
                                            {investmentStatus.status === 'Pending' && 'Chờ xác nhận'}
                                            {investmentStatus.status === 'Confirmed' && 'Đã xác nhận'}
                                            {investmentStatus.status === 'Contract_Signed' && 'Đã ký kết'}
                                            {investmentStatus.status === 'Minted_NFT' && 'Đã mint NFT'}
                                            {investmentStatus.status === 'Failed' && 'Thất bại'}
                                        </span>
                                    </div>
                                ) : isInvestor && (
                                    // Show investment button only if NOT invested
                                    <button
                                        className={styles.investBtn}
                                        onClick={() => setInvestmentModal({
                                            projectId: startup.id || startup.startupId,
                                            projectName: startup.organizationName,
                                            startupName: startup.organizationName
                                        })}
                                    >
                                        Đầu tư
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                    })
                )}
                        </div>
                    )}
                </div>

                {/* Right Column - PR News Sidebar */}
                <div style={{
                    position: 'sticky',
                    top: '24px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}>
                        {/* Sidebar Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '16px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid var(--border-color)'
                        }}>
                            <Newspaper size={20} color="var(--primary-blue)" />
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                            }}>
                                Tin tức mới
                            </h3>
                        </div>

                        {/* Loading State */}
                        {isLoadingPRs && (
                            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Đang tải...</p>
                            </div>
                        )}

                        {/* PR List */}
                        {!isLoadingPRs && prs.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {prs.slice(0, 8).map(pr => (
                                    <div
                                        key={pr.postPrId}
                                        onClick={() => window.open(`https://aisep-web.vercel.app/pr/${pr.postPrId}`, '_blank')}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: '1px solid var(--border-color)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                                            e.currentTarget.style.borderColor = 'var(--primary-blue)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                        }}
                                    >
                                        {/* PR Title */}
                                        <h4 style={{
                                            margin: '0 0 6px 0',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.3'
                                        }}>
                                            {pr.title}
                                        </h4>

                                        {/* Project & Investor */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '6px',
                                            flexWrap: 'wrap',
                                            marginBottom: '8px',
                                            fontSize: '11px'
                                        }}>
                                            <span style={{
                                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                                color: '#10b981',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontWeight: '600'
                                            }}>
                                                📊 {pr.projectName?.substring(0, 12)}
                                            </span>
                                            <span style={{
                                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                color: 'var(--primary-blue)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontWeight: '600'
                                            }}>
                                                💼 {pr.investorName?.substring(0, 12)}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Calendar size={10} />
                                            {new Date(pr.publishedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoadingPRs && prs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                                <Newspaper size={32} style={{ color: 'var(--border-color)', marginBottom: '8px', opacity: 0.3 }} />
                                <p style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Chưa có bài viết
                                </p>
                            </div>
                        )}

                        {/* View All Button */}
                        {prs.length > 8 && (
                            <button
                                onClick={() => setShowAllPRs(true)}
                                style={{
                                    width: '100%',
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    color: 'var(--primary-blue)',
                                    border: '1px solid var(--primary-blue)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--primary-blue)';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = 'var(--primary-blue)';
                                }}
                            >
                                Xem thêm ({prs.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <InvestmentModal
                isOpen={!!investmentModal}
                projectId={investmentModal?.projectId}
                projectName={investmentModal?.projectName}
                startupName={investmentModal?.startupName}
                onClose={() => setInvestmentModal(null)}
                onSuccess={() => {
                    setInvestmentModal(null);
                    // Optional: Could refresh the startup list or show a notification
                    console.log('[DiscoveryHub] Investment successful!');
                }}
            />

            {/* All PRs Modal */}
            {showAllPRs && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => e.target === e.currentTarget && setShowAllPRs(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            width: '95%',
                            maxWidth: '1200px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                            padding: '24px'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Newspaper size={28} color="var(--primary-blue)" />
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                        Tất cả bài viết
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {prs.length} bài đăng
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAllPRs(false)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--border-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'var(--bg-secondary)';
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* PR Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '16px'
                        }}>
                            {prs.map(pr => (
                                <div
                                    key={pr.postPrId}
                                    onClick={() => window.open(`https://aisep-web.vercel.app/pr/${pr.postPrId}`, '_blank')}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                        border: '1px solid var(--border-color)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* PR Image */}
                                    {pr.projectImage && (
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            paddingBottom: '60%',
                                            overflow: 'hidden',
                                            backgroundColor: '#f0f0f0'
                                        }}>
                                            <img
                                                src={pr.projectImage}
                                                alt={pr.projectName}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* PR Content */}
                                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h3 style={{
                                            margin: '0 0 12px 0',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.4'
                                        }}>
                                            {pr.title}
                                        </h3>

                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            flexWrap: 'wrap',
                                            marginBottom: '12px',
                                            fontSize: '12px'
                                        }}>
                                            <span style={{
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                📊 {pr.projectName}
                                            </span>
                                            <span style={{
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                color: 'var(--primary-blue)',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                💼 {pr.investorName}
                                            </span>
                                        </div>

                                        <p style={{
                                            margin: '0 0 12px 0',
                                            fontSize: '13px',
                                            color: 'var(--text-secondary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.5',
                                            flex: 1
                                        }}>
                                            {pr.content}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '12px',
                                            borderTop: '1px solid var(--border-color)',
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} />
                                                {new Date(pr.publishedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span style={{
                                                color: 'var(--primary-blue)',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                Xem <ExternalLink size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscoveryHub;
