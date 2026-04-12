import React, { useState, useEffect } from 'react';
import { Search, MapPin, Rocket, Filter, TrendingUp, CheckCircle, Target, Building2, Newspaper, Calendar, User, ExternalLink } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import InvestmentModal from '../components/common/InvestmentModal';
import startupProfileService from '../services/startupProfileService';
import projectSubmissionService from '../services/projectSubmissionService';
import dealsService from '../services/dealsService';
import prService from '../services/prService';
import NotificationCenter from '../components/common/NotificationCenter';
import FloatingChatWidget from '../components/common/FloatingChatWidget';
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
    const [activeChatSession, setActiveChatSession] = useState(null);
    const [myStartupProfile, setMyStartupProfile] = useState(null);

    const industries = ['Tất cả', 'FinTech', 'AgriTech', 'EdTech', 'HealthTech', 'SaaS', 'AI/ML', 'GreenTech'];

    const isInvestor = user && (user.role === 'Investor' || user.role === 1);
    const isStartup = user && (user.role === 'Startup' || user.role === 2);
    
    useEffect(() => {
        const fetchMyStartup = async () => {
            if (isStartup) {
                try {
                    const profile = await startupProfileService.getStartupMe();
                    setMyStartupProfile(profile);
                } catch (error) {
                    console.error("Failed to fetch my startup profile:", error);
                }
            }
        };
        fetchMyStartup();
    }, [isStartup]);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                // Fetch projects instead of startups
                const response = await projectSubmissionService.getAllProjects();
                const items = response?.data?.items || response?.items || [];
                setStartups(items);
                
                if (isInvestor) {
                    fetchInvestmentStatusNow(items);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [isInvestor]);

    const fetchInvestmentStatusNow = async (startupsList = null) => {
        if (!isInvestor) {
            setInvestmentStatusMap({});
            return;
        }

        try {
            const dealsRes = await dealsService.getInvestorDeals();
            const deals = dealsRes?.data?.items || [];
            
            const combinedMap = {};
            deals.forEach(deal => {
                const dealInfo = {
                    dealId: deal.dealId,
                    status: deal.status,
                    projectId: deal.projectId,
                    projectName: deal.projectName,
                    startupName: deal.startupName
                };
                
                if (deal.projectId) combinedMap[deal.projectId] = dealInfo;
                if (deal.projectId) combinedMap[deal.projectId.toString()] = dealInfo;
                if (deal.projectName) combinedMap[deal.projectName.toLowerCase()] = dealInfo;
                if (deal.startupName) combinedMap[deal.startupName.toLowerCase()] = dealInfo;
            });
            
            setInvestmentStatusMap(combinedMap);
        } catch (error) {
            console.error('[DiscoveryHub] Failed to fetch investment status:', error);
            setInvestmentStatusMap({});
        }
    };

    useEffect(() => {
        if (!isInvestor || startups.length === 0) return;
        fetchInvestmentStatusNow(startups);
    }, [isInvestor, startups.length]);

    useEffect(() => {
        const fetchPRs = async () => {
            setIsLoadingPRs(true);
            try {
                const response = await prService.getPRs();
                let prList = response?.data?.items || response?.data || response?.items || response || [];
                if (!Array.isArray(prList)) prList = [];
                
                const sortedPRs = prList.sort((a, b) => 
                    new Date(b.publishedAt) - new Date(a.publishedAt)
                );
                setPRs(sortedPRs);
            } catch (error) {
                console.error('[DiscoveryHub] Failed to fetch PRs:', error);
            } finally {
                setIsLoadingPRs(false);
            }
        };

        fetchPRs();
    }, []);

    const filteredStartups = startups.filter(startup => {
        const matchesSearch = (startup.projectName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (startup.shortDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesIndustry = activeIndustry === 'Tất cả' || startup.industry === activeIndustry;
        return matchesSearch && matchesIndustry;
    });

    return (
        <div className={styles.container}>
            {/* Unified Sticky Header */}
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className={styles.headerTitle}>Khám phá Dự án</h1>
                        <p className={styles.headerSubtitle}>Tìm kiếm và kết nối với các startup tiềm năng nhất</p>
                    </div>
                    <div style={{ padding: '4px' }}>
                        <NotificationCenter onOpenChat={(chatSessionId, notification) => {
                            setActiveChatSession({
                                chatSessionId,
                                displayName: notification?.title || 'Chat mới',
                                currentUserId: user?.userId,
                                sentTime: new Date().toISOString()
                            });
                        }} />
                    </div>
                </div>

                <div className={styles.searchRow}>
                    <div className={styles.searchContainer}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm tên dự án, lĩnh vực hoặc từ khóa..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        {industries.map(industry => (
                            <button
                                key={industry}
                                className={`${styles.industryBtn} ${activeIndustry === industry ? styles.active : ''}`}
                                onClick={() => setActiveIndustry(industry)}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                gap: '24px',
                alignItems: 'flex-start'
            }}>
                {/* Left Column - Startup Stream */}
                <div>
                    {isLoading ? (
                        <div className={styles.loadingState}>
                            <Rocket size={32} className={styles.loadingIcon} />
                            <p>Đang tìm kiếm dự án tiềm năng...</p>
                        </div>
                    ) : filteredStartups.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Search size={48} color="var(--text-secondary)" />
                            <h3>Không tìm thấy dự án phù hợp</h3>
                            <p>Hãy thử thay đổi tiêu chí lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {filteredStartups.map(startup => {
                                let investmentStatus = null;
                                if (startup.organizationName) {
                                    investmentStatus = investmentStatusMap[startup.organizationName.toLowerCase()];
                                }

                                return (
                                    <div key={startup.projectId} className={styles.startupCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.avatar}>
                                                {startup.projectImageUrl ? (
                                                    <img src={startup.projectImageUrl} alt={startup.projectName} />
                                                ) : (
                                                    <span>{(startup.projectName || 'P').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className={styles.startupInfo}>
                                                <div className={styles.nameRow}>
                                                    <h3 className={styles.startupName}>{startup.projectName}</h3>
                                                    {startup.isVerified && <CheckCircle size={16} className={styles.verifiedIcon} />}
                                                </div>
                                                <span className={styles.industryTag}>{startup.industry}</span>
                                            </div>
                                            <div className={styles.scoreBadge}>
                                                <Target size={14} />
                                                <span>{startup.startupPotentialScore || 'N/A'} AI Score</span>
                                            </div>
                                        </div>

                                        <p className={styles.description}>
                                            {startup.shortDescription || 'Chưa có mô tả chi tiết cho dự án này.'}
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
                                                onClick={() => onSelectStartup?.(startup.projectId)}
                                            >
                                                { (isStartup && myStartupProfile && startup.startupId === myStartupProfile.id) || startup.isUnlockedByCurrentUser ? "Xem chi tiết" : "Mở khóa ngay" }
                                            </button>
                                            <button className={styles.followBtn}>Theo dõi</button>
                                            {isInvestor && investmentStatus ? (
                                                <div className={styles.investmentStatusBadge}>
                                                    <span className={`${styles.statusIndicator} ${styles[`status_${investmentStatus.status?.toLowerCase()}`]}`}>
                                                        {investmentStatus.status === 'Pending' ? '🟡' : '🟢'}
                                                    </span>
                                                    <span className={styles.statusText}>{investmentStatus.status}</span>
                                                </div>
                                            ) : isInvestor && (
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
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column - PR News Sidebar */}
                <aside style={{ position: 'sticky', top: '24px' }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Tin tức mới nhất</h2>
                            <Newspaper size={18} color="var(--primary-blue)" />
                        </div>

                        {isLoadingPRs ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
                        ) : prs.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có tin tức nào</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {prs.slice(0, 5).map(pr => (
                                    <div key={pr.postPrId} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', lineHeight: '1.4' }}>{pr.title}</h3>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            <span>{pr.projectName}</span>
                                            <span>•</span>
                                            <span>{new Date(pr.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {prs.length > 5 && (
                                    <button
                                        onClick={() => setShowAllPRs(true)}
                                        style={{ border: 'none', background: 'none', color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                                    >
                                        Xem tất cả ({prs.length})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Modals & Chat */}
            <InvestmentModal
                isOpen={!!investmentModal}
                projectId={investmentModal?.projectId}
                projectName={investmentModal?.projectName}
                startupName={investmentModal?.startupName}
                onClose={() => setInvestmentModal(null)}
                onSuccess={() => {
                    setInvestmentModal(null);
                    fetchInvestmentStatusNow(startups);
                }}
            />

            {showAllPRs && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Tất cả tin tức</h2>
                            <button onClick={() => setShowAllPRs(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Đóng</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {prs.map(pr => (
                                <div key={pr.postPrId} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>{pr.title}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{pr.content}</p>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                        {pr.projectName} • {new Date(pr.publishedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeChatSession && (
                <FloatingChatWidget
                    {...activeChatSession}
                    onClose={() => setActiveChatSession(null)}
                />
            )}
        </div>
    );
};

export default DiscoveryHub;
