import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, TrendingUp, MapPin, Building2, Target, Filter, Flame } from 'lucide-react';
import FeedHeader from '../feed/FeedHeader';
import FilterModal from './FilterModal';
import InvestorDetail from './InvestorDetail';
import investorService from '../../services/investorService';
import styles from './InvestorDiscovery.module.css';

export default function InvestorDiscovery({ user }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedInvestorId, setSelectedInvestorId] = useState(null);
    const [filters, setFilters] = useState({
        industry: 'Tất cả ngành nghề',
        stage: 'Tất cả giai đoạn',
        fundingStatus: 'Tất cả trạng thái',
        minAiScore: 0
    });

    const [investors, setInvestors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvestors = async () => {
            setIsLoading(true);
            try {
                const response = await investorService.getAllInvestors();
                if (response && response.items) {
                    // Map API fields to the existing UI format expectations if needed,
                    // or adapt the UI to the API fields.
                    const formatted = response.items.map(inv => ({
                        id: inv.investorId,
                        name: inv.organizationName || inv.userName,
                        userName: inv.userName,
                        thesis: inv.investmentTaste || 'Chưa cập nhật khẩu vị đầu tư.',
                        type: 'Quỹ đầu tư', // Default or derived
                        industries: inv.focusIndustry ? inv.focusIndustry.split(',').map(s => s.trim()) : [],
                        stages: [`Giai đoạn ${inv.preferredStage || 'sớm'}`],
                        fundingStatus: 'Đang hoạt động',
                        aiScore: 0, // Not provided directly in snippet
                        matchScore: Math.floor(Math.random() * 20) + 75, // Placeholder for algorithmic match
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inv.organizationName || inv.userName)}&background=random`,
                        location: inv.investmentRegion || 'Chưa cập nhật',
                        portfolioSize: 'N/A', // Not in this specific API
                        ticketSize: inv.investmentAmount ? `${inv.investmentAmount.toLocaleString()} VND` : 'N/A',
                        verified: true // Assume verified for demo unless field exists
                    }));
                    setInvestors(formatted);
                }
            } catch (error) {
                console.error("Failed to load investors:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!selectedInvestorId) {
            fetchInvestors();
        }
    }, [selectedInvestorId]);

    // Apply filters
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    // Filter investors based on search and filters
    const filteredInvestors = investors.filter(investor => {
        const matchesSearch =
            investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            investor.thesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            investor.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesIndustry =
            filters.industry === 'Tất cả ngành nghề' ||
            investor.industries.includes(filters.industry);

        const matchesStage =
            filters.stage === 'Tất cả giai đoạn' ||
            investor.stages.includes(filters.stage);

        const matchesFundingStatus =
            filters.fundingStatus === 'Tất cả trạng thái' ||
            investor.fundingStatus === filters.fundingStatus;

        const matchesAiScore = investor.aiScore >= filters.minAiScore;

        return matchesSearch && matchesIndustry && matchesStage && matchesFundingStatus && matchesAiScore;
    });

    // Get match score badge class
    const getMatchScoreClass = (score) => {
        if (score >= 80) return styles.matchHigh;
        if (score >= 60) return styles.matchMedium;
        return styles.matchLow;
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.industry !== 'Tất cả ngành nghề') count++;
        if (filters.stage !== 'Tất cả giai đoạn') count++;
        if (filters.fundingStatus !== 'Tất cả trạng thái') count++;
        if (filters.minAiScore > 0) count++;
        return count;
    };

    const activeFilterCount = getActiveFiltersCount();

    if (selectedInvestorId) {
        return <InvestorDetail investorId={selectedInvestorId} onBack={() => setSelectedInvestorId(null)} user={user} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Tìm nhà đầu tư</h1>
                <p className={styles.headerSubtitle}>Khám phá quỹ đầu tư và nhà đầu tư phù hợp với tiêu chí của bạn</p>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm quỹ, cá nhân..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Button */}
                <button className={styles.filterButton} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <Filter size={20} />
                    <span>Bộ lọc</span>
                    {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
                </button>

                {/* Filter Modal Panel */}
                <FilterModal
                    isOpen={isFilterOpen}
                    filters={filters}
                    onApply={handleApplyFilters}
                    onClose={() => setIsFilterOpen(false)}
                />
            </div>

            {/* Investor Feed */}
            <div className={styles.feed}>
                {isLoading ? (
                    <div className={styles.emptyState}>
                        <p>Đang tải nhà đầu tư...</p>
                    </div>
                ) : filteredInvestors.length === 0 ? (
                    <div className={styles.emptyState}>
                        <TrendingUp size={48} className={styles.emptyIcon} />
                        <h3>Không tìm thấy nhà đầu tư</h3>
                        <p>Hiện không có nhà đầu tư nào phù hợp với hồ sơ của bạn.</p>
                    </div>
                ) : (
                    filteredInvestors.map(investor => (
                        <div key={investor.id} className={styles.investorCard}>
                            {/* Header */}
                            <div className={styles.cardHeader}>
                                <div className={styles.avatarContainer}>
                                    <img
                                        src={investor.avatar}
                                        alt={investor.name}
                                        className={styles.avatar}
                                    />
                                </div>
                                <div className={styles.investorInfo}>
                                    <div className={styles.nameRow}>
                                        <div className={styles.nameWrapper}>
                                            <h3 className={styles.investorName}>{investor.name}</h3>
                                            {investor.verified && (
                                                <CheckCircle size={16} className={styles.verifiedBadge} />
                                            )}
                                            <span className={styles.investorType}>· {investor.type}</span>
                                        </div>
                                        <div className={styles.matchBadge}>
                                            <Flame size={14} className={styles.flameIcon} />
                                            <span>Phù hợp: cập nhật sau</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thesis/Bio */}
                            <p className={styles.thesis}>{investor.thesis}</p>

                            {/* Tags */}
                            <div className={styles.tags}>
                                <div className={styles.tagGroup}>
                                    <Target size={14} />
                                    {investor.industries.slice(0, 3).map(industry => (
                                        <span key={industry} className={styles.tag}>{industry}</span>
                                    ))}
                                </div>
                                <div className={styles.tagGroup}>
                                    <TrendingUp size={14} />
                                    {investor.stages.slice(0, 2).map(stage => (
                                        <span key={stage} className={styles.tag}>{stage}</span>
                                    ))}
                                </div  >
                            </div>

                            {/* Metadata */}
                            <div className={styles.metadata}>
                                <div className={styles.metaItem}>
                                    <MapPin size={14} />
                                    <span>{investor.location}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Building2 size={14} />
                                    <span>{investor.portfolioSize}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.ticketSize}>{investor.ticketSize}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button className={styles.primaryBtn} onClick={() => {
                                    if (!user || user.role !== 'startup') {
                                        alert('Chỉ tài khoản Startup mới có thể gửi Pitch cho nhà đầu tư.');
                                    } else {
                                        alert(`Yêu cầu kết nối đã được gửi tới ${investor.name}! (Tính năng đang phát triển)`);
                                    }
                                }}>
                                    <TrendingUp size={16} />
                                    <span>Yêu cầu kết nối</span>
                                </button>
                                <button className={styles.viewProfileBtn} onClick={() => setSelectedInvestorId(investor.id)}>Xem hồ sơ</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
