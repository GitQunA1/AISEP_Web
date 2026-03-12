import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, DollarSign, CheckCircle } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import advisorService from '../services/advisorService';
import { authService } from '../services/authService';
import bookingService from '../services/bookingService';
import AdvisorBookingModal from '../components/profile/AdvisorBookingModal';
import styles from './AdvisorsPage.module.css';

export default function AdvisorsPage({ user, onSelectAdvisor }) {
    const [advisors, setAdvisors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [connectingTo, setConnectingTo] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    
    // Modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedAdvisorForBooking, setSelectedAdvisorForBooking] = useState(null);

    // Support both numeric (backend UserRole enum: 0=Startup, 1=Investor) and string roles
    const roleValue = user?.role;
    const roleStr = typeof roleValue === 'string' ? roleValue.toLowerCase() : '';
    const canConnect = roleStr === 'startup' || roleStr === 'investor' || roleValue === 0 || roleValue === 1;

    useEffect(() => {
        const fetchAdvisors = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await advisorService.getAllAdvisors();
                // response.data usually contains { items, totalCount, ... }
                const items = response?.data?.items || response?.items || [];
                setAdvisors(items);
            } catch (err) {
                console.error('Failed to load advisors:', err);
                setError('Không thể tải danh sách cố vấn. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchMyBookings = async () => {
            if (!user) return;
            const userId = user.id || user.userId || user.nameid; // Different JWT formats
            if (!userId) return;

            try {
                const response = await bookingService.getMyCustomerBookings(userId);
                const items = response?.items || response?.data?.items || response || [];
                // if it's an array
                if (Array.isArray(items)) {
                    setMyBookings(items);
                } else if (items.data && Array.isArray(items.data)) {
                    setMyBookings(items.data);
                }
            } catch (err) {
                console.error('Failed to load user bookings:', err);
            }
        };

        fetchAdvisors();
        fetchMyBookings();
    }, [user]);

    const filteredAdvisors = advisors.filter(advisor =>
        (advisor.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (advisor.expertise?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const handleConnect = (advisor) => {
        if (!canConnect) return;
        setSelectedAdvisorForBooking(advisor);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = (advisorId) => {
        // Optimistically update the bookings array so the button updates immediately
        setMyBookings(prev => [...prev, { 
            advisorId: advisorId, 
            status: 0 // Pending 
        }]);
    };

    const getBookingStatus = (advisorId) => {
        const booking = myBookings.find(b => b.advisorId === advisorId);
        if (!booking) return null; // no status = can connect
        // 0 = Pending, 1 = Confirmed, 2 = Canceled (Assuming backend enum values)
        return booking.status;
    };

    return (
        <div className={styles.container}>
            <FeedHeader
                title="Tìm cố vấn"
                subtitle="Kết nối với các chuyên gia đã được xác minh để đẩy nhanh tăng trưởng"
                showFilter={false}
            />

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc chuyên môn"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>Đang tải cố vấn...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--error)' }}>
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
                        <div key={advisor.advisorId} className={styles.advisorCard}>
                            {/* Card Header (Avatar + Name) */}
                            <div className={styles.cardHeader}>
                                <img 
                                    src={advisor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(advisor.userName)}&background=random`} 
                                    alt={advisor.userName} 
                                    className={styles.avatar} 
                                />
                                <div className={styles.advisorInfo}>
                                    <div className={styles.nameRow}>
                                        <span className={styles.name}>{advisor.userName}</span>
                                        {advisor.approvalStatus === 'Approved' && (
                                            <CheckCircle size={16} className={styles.verifiedBadge} />
                                        )}
                                        <span className={styles.handle}>@{advisor.userName?.toLowerCase().replace(/\s/g, '')}</span>
                                    </div>
                                    <div className={styles.expertiseTags}>
                                        {expertises.map((exp, idx) => (
                                            <span key={idx} className={styles.expertiseTag}>{exp}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className={styles.bio}>{advisor.bio || 'Chưa có thông tin giới thiệu.'}</p>

                            {/* Stats/Metadata */}
                            <div className={styles.metadata}>
                                <div className={styles.metaItem}>
                                    <MapPin size={14} />
                                    <span>{advisor.location || 'Nghề nghiệp tự do'}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <DollarSign size={14} />
                                    <span>{advisor.hourlyRate?.toLocaleString('vi-VN')} VNĐ/giờ</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Star size={14} fill="currentColor" />
                                    <span>{advisor.rating || 0}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                {canConnect && (() => {
                                    const status = getBookingStatus(advisor.advisorId);
                                    
                                    if (status === 0 || status === 'Pending') {
                                        return (
                                            <button className={styles.connectBtn} disabled style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--text-secondary)' }}>
                                                Đang chờ...
                                            </button>
                                        );
                                    }
                                    if (status === 1 || status === 'Confirmed' || status === 'Accepted') {
                                        return (
                                            <button className={styles.connectBtn} disabled style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', opacity: 0.9 }}>
                                                Đã kết nối
                                            </button>
                                        );
                                    }
                                    
                                    // Default/Canceled state
                                    return (
                                        <button
                                            className={styles.connectBtn}
                                            onClick={() => handleConnect(advisor)}
                                            disabled={connectingTo === advisor.advisorId}
                                            style={{ opacity: connectingTo === advisor.advisorId ? 0.7 : 1 }}
                                        >
                                            {connectingTo === advisor.advisorId ? 'Đang gửi...' : 'Kết nối'}
                                        </button>
                                    );
                                })()}
                                <button 
                                    className={styles.viewProfileBtn}
                                    onClick={() => onSelectAdvisor?.(advisor)}
                                >
                                    Xem hồ sơ
                                </button>
                            </div>
                        </div>
                    );
                })
)}
            </div>

            {showBookingModal && selectedAdvisorForBooking && (
                <AdvisorBookingModal
                    advisor={selectedAdvisorForBooking}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedAdvisorForBooking(null);
                    }}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </div>
    );
}
