import React, { useState, useEffect } from 'react';
import { Search, MapPin, Rocket, Filter, TrendingUp, CheckCircle, Target, Building2 } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import InvestmentModal from '../components/common/InvestmentModal';
import startupProfileService from '../services/startupProfileService';
import dealsService from '../services/dealsService';
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

            <div className={styles.feed}>
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
                    filteredStartups.map(startup => {
                        // Match by organizationName since startup.id ≠ deal.projectId
                        // deal.projectName from API = startup.organizationName (both are project names)
                        let investmentStatus = null;
                        
                        // Try to match by organizationName (case-insensitive)
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

            {/* Investment Modal */}
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
        </div>
    );
};

export default DiscoveryHub;
