import React, { useState, useEffect } from 'react';
import { Search, MapPin, Rocket, Filter, TrendingUp, CheckCircle, Target, Building2 } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import startupProfileService from '../services/startupProfileService';
import styles from './DiscoveryHub.module.css';

/**
 * StartupDiscovery - Explore and discover startup companies
 * Featuring search, industry filtering, and premium startup cards.
 */
const DiscoveryHub = ({ onSelectStartup }) => {
    const [startups, setStartups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndustry, setActiveIndustry] = useState('Tất cả');

    const industries = ['Tất cả', 'FinTech', 'AgriTech', 'EdTech', 'HealthTech', 'SaaS', 'AI/ML', 'GreenTech'];

    useEffect(() => {
        const fetchStartups = async () => {
            setIsLoading(true);
            try {
                // Fetch with Sieve params if needed, but for now just get all
                const response = await startupProfileService.getAllStartups();
                const items = response?.data?.items || response?.items || [];
                setStartups(items);
            } catch (error) {
                console.error("Failed to fetch startups:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStartups();
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
                    filteredStartups.map(startup => (
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
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiscoveryHub;
