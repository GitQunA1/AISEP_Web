import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, Star, Users, DollarSign, CheckCircle, Filter, TrendingUp } from 'lucide-react';
import AdvisorFilterModal from '../components/profile/AdvisorFilterModal';
import advisorService from '../services/advisorService';
import BookingWizard from '../components/booking/BookingWizard';
import NotificationCenter from '../components/common/NotificationCenter';
import FloatingChatWidget from '../components/common/FloatingChatWidget';
import InvestorStatusBanner from '../components/common/InvestorStatusBanner';
import styles from './AdvisorsPage.module.css';

export default function AdvisorsPage({ user, onSelectAdvisor, onShowLogin, investorProfileStatus, investorProfileReason, onUpdateProfile }) {
    const [advisors, setAdvisors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        expertise: 'Tất cả chuyên môn',
        location: 'Tất cả khu vực',
        minRating: 0,
        maxRate: 5000000
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showBookingWizard, setShowBookingWizard] = useState(false);
    const [wizardInitialAdvisorId, setWizardInitialAdvisorId] = useState(null);
    const [activeChatSession, setActiveChatSession] = useState(null);

    const roleValue = user?.role;
    const roleStr = typeof roleValue === 'string' ? roleValue.toLowerCase() : '';
    const roleNum = Number(roleValue);
    // Booking dành cho Investor (role 1) và Startup (role 0)
    const canBook = roleStr === 'startup' || roleStr === 'investor' || roleNum === 0 || roleNum === 1;

    useEffect(() => {
        const fetchAdvisors = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await advisorService.getAllAdvisors();
                const items = response?.data?.items || response?.items || [];
                setAdvisors(items);
            } catch (err) {
                console.error('Failed to load advisors:', err);
                setError('Không thể tải danh sách cố vấn. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdvisors();
    }, [user]);

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.expertise !== 'Tất cả chuyên môn') count++;
        if (filters.location !== 'Tất cả khu vực') count++;
        if (filters.minRating > 0) count++;
        if (filters.maxRate < 5000000) count++;
        return count;
    };

    const activeFilterCount = getActiveFiltersCount();

    const filteredAdvisors = advisors.filter(advisor => {
        const matchesSearch =
            (advisor.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (advisor.expertise?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesExpertise =
            filters.expertise === 'Tất cả chuyên môn' ||
            (advisor.expertise || '').includes(filters.expertise);

        const matchesLocation =
            filters.location === 'Tất cả khu vực' ||
            (advisor.location || '').includes(filters.location);

        const matchesRating = (advisor.rating || 0) >= filters.minRating;
        const matchesRate = (advisor.hourlyRate || 0) <= filters.maxRate;

        return matchesSearch && matchesExpertise && matchesLocation && matchesRating && matchesRate;
    });

    const handleOpenBookingWizard = (advisor) => {
        if (!user) { onShowLogin?.(); return; }
        if (!canBook) return;
        setWizardInitialAdvisorId(advisor.advisorId);
        setShowBookingWizard(true);
    };

    return (
        <div className={styles.container}>
            {/* ─── Unified Sticky Header ─── */}
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className={styles.headerTitle}>Tìm cố vấn</h1>
                        <p className={styles.headerSubtitle}>Kết nối với các chuyên gia đã được xác minh để đẩy nhanh tăng trưởng</p>
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
                        <Search className={styles.searchIcon} size={19} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc chuyên môn..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterWrapper}>
                        <button className={styles.filterButton} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                            <Filter size={18} />
                            <span>Bộ lọc</span>
                            {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
                        </button>

                        {/* Desktop inline dropdown */}
                        {isFilterOpen && (
                            <div className={styles.desktopOnly}>
                                <AdvisorFilterModal
                                    isOpen={isFilterOpen}
                                    filters={filters}
                                    onApply={handleApplyFilters}
                                    onClose={() => setIsFilterOpen(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <InvestorStatusBanner
                status={investorProfileStatus}
                reason={investorProfileReason}
                onUpdateProfile={onUpdateProfile}
            />

            {/* Mobile portal modal */}
            {isFilterOpen && createPortal(
                <div className={styles.mobileOnly}>
                    <div className={styles.filterBackdrop} onClick={() => setIsFilterOpen(false)} />
                    <AdvisorFilterModal
                        isOpen={isFilterOpen}
                        filters={filters}
                        onApply={handleApplyFilters}
                        onClose={() => setIsFilterOpen(false)}
                    />
                </div>,
                document.body
            )}

            {/* ─── Advisor Feed ─── */}
            <div className={styles.feed}>
                {isLoading ? (
                    <div className={styles.emptyState}>
                        <p>Đang tải cố vấn...</p>
                    </div>
                ) : error ? (
                    <div className={styles.emptyState} style={{ color: 'var(--error)' }}>
                        <p>{error}</p>
                    </div>
                ) : filteredAdvisors.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Users size={48} className={styles.emptyIcon} />
                        <h3>Không tìm thấy cố vấn</h3>
                        <p>Hiện không có cố vấn nào phù hợp với tìm kiếm của bạn.</p>
                    </div>
                ) : (
                    filteredAdvisors.map(advisor => {
                        const expertises = advisor.expertise
                            ? advisor.expertise.split(',').map(s => s.trim()).filter(Boolean)
                            : [];

                        return (
                            <div key={advisor.advisorId} className={styles.advisorCard} onClick={() => onSelectAdvisor?.(advisor)}>
                                {/* Avatar */}
                                <div className={styles.avatarContainer}>
                                    <div className={styles.avatar}>
                                        {advisor.userName?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={styles.advisorInfo}>
                                    <div className={styles.nameRow}>
                                        <div className={styles.nameWrapper}>
                                            <h3 className={styles.name}>{advisor.userName}</h3>
                                            {advisor.approvalStatus === 'Approved' && (
                                                <CheckCircle size={15} className={styles.verifiedBadge} />
                                            )}
                                            <span className={styles.advisorType}>· Cố vấn</span>
                                        </div>
                                        {expertises.length > 0 && (
                                            <div className={styles.expertiseTags}>
                                                {expertises.slice(0, 2).map((exp, idx) => (
                                                    <span key={idx} className={styles.expertiseTag}>{exp}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <p className={styles.bio}>{advisor.bio || 'Chưa có thông tin giới thiệu.'}</p>

                                    <div className={styles.metadata}>
                                        <div className={styles.metaItem}>
                                            📍 <span>{advisor.location || 'Nghề nghiệp tự do'}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            💵 <span>{advisor.hourlyRate?.toLocaleString('vi-VN')} VNĐ/giờ</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            ⭐ <span>{advisor.rating || 0}</span>
                                        </div>
                                    </div>

                                    <div className={styles.actions}>
                                        {canBook && (
                                        <button
                                            className={styles.connectBtn}
                                            onClick={(e) => { e.stopPropagation(); handleOpenBookingWizard(advisor); }}
                                        >
                                            <TrendingUp size={15} />
                                            <span>Đặt lịch</span>
                                        </button>
                                    )}
                                        <button
                                            className={styles.viewProfileBtn}
                                            onClick={(e) => { e.stopPropagation(); onSelectAdvisor?.(advisor); }}
                                        >
                                            Xem hồ sơ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showBookingWizard && (
                <BookingWizard
                    user={user}
                    initialAdvisorId={wizardInitialAdvisorId}
                    onClose={() => {
                        setShowBookingWizard(false);
                        setWizardInitialAdvisorId(null);
                    }}
                />
            )}

            {activeChatSession && (
                <FloatingChatWidget
                    {...activeChatSession}
                    onClose={() => setActiveChatSession(null)}
                />
            )}
        </div>
    );
}
