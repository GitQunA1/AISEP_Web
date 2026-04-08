import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, FileText, CheckCircle, Clock, AlertCircle, X, CreditCard, ChevronRight, Loader, Loader2, Calendar, Search, RefreshCcw } from 'lucide-react';
import styles from '../../styles/SharedDashboard.module.css';
import bookingService from '../../services/bookingService';
import chatService from '../../services/chatService';
import signalRService from '../../services/signalRService';
import ConsultingReportModal from '../booking/ConsultingReportModal';
import FloatingChatWidget from '../common/FloatingChatWidget';
import PaymentModal from '../booking/PaymentModal';
import BookingWizard from '../booking/BookingWizard';
import BookingDetailModal from '../booking/BookingDetailModal';
import UserReportModal from '../booking/UserReportModal';
import FeedHeader from '../feed/FeedHeader';

const BOOKING_STATUS_LABELS = {
    0: { label: 'Chờ xác nhận', cls: 'badgePending', color: 'var(--text-secondary)' },
    Pending: { label: 'Chờ xác nhận', cls: 'badgePending', color: 'var(--text-secondary)' },
    1: { label: 'Chờ thanh toán', cls: 'badgeInfo', color: '#1d9bf0' },
    ApprovedAwaitingPayment: { label: 'Chờ thanh toán', cls: 'badgeInfo', color: '#1d9bf0' },
    2: { label: 'Đã xác nhận', cls: 'badgeSuccess', color: '#1d9bf0' },
    Confirmed: { label: 'Đã xác nhận', cls: 'badgeSuccess', color: '#1d9bf0' },
    3: { label: 'Hoàn thành', cls: 'badgeSuccess', color: '#17bf63' },
    Completed: { label: 'Hoàn thành', cls: 'badgeSuccess', color: '#17bf63' },
    4: { label: 'Đã hủy', cls: 'badgeError', color: '#f4212e' },
    Cancel: { label: 'Đã hủy', cls: 'badgeError', color: '#f4212e' },
    5: { label: 'Không phản hồi', cls: 'badgeError', color: '#f4212e' },
    NoResponse: { label: 'Không phản hồi', cls: 'badgeError', color: '#f4212e' },
};

export default function InvestorBookings({ user, onViewProject, initialFilterStatus, onFilterStatusChange }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search State
    const [filterStatus, setFilterStatus] = useState(initialFilterStatus || 'ApprovedAwaitingPayment');
    const [searchTerm, setSearchTerm] = useState('');

    // UI state
    const [reportModal, setReportModal] = useState(null);
    const [chatSession, setChatSession] = useState(null);
    const [chatLoading, setChatLoading] = useState({});
    const [paymentBooking, setPaymentBooking] = useState(null);
    const [detailBooking, setDetailBooking] = useState(null);
    const [complainBooking, setComplainBooking] = useState(null);

    // Booking Wizard State (for re-booking)
    const [showBookingWizard, setShowBookingWizard] = useState(false);
    const [rebookData, setRebookData] = useState({ projectId: null, advisorId: null, sourceBookingId: null });

    const loadBookings = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await bookingService.getMyCustomerBookings('', '-Id', 1, 100);
            const items = response?.items ?? (Array.isArray(response) ? response : []);
            setBookings(items);
        } catch (error) {
            console.error('Failed to load investor bookings', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    // Initialize SignalR on mount
    useEffect(() => {
        const initSignalR = async () => {
            try {
                // Get JWT token from localStorage or auth context
                const token = localStorage.getItem('aisep_token') || sessionStorage.getItem('token');
                if (token && user?.userId) {
                    await signalRService.initialize(token);
                    console.log('[InvestorBookings] SignalR initialized successfully');
                }
            } catch (error) {
                console.error('[InvestorBookings] Failed to initialize SignalR:', error);
            }
        };

        if (user?.userId) {
            initSignalR();
        }

        // Cleanup on unmount
        return () => {
            signalRService.disconnect();
        };
    }, [user?.userId]);

    const handleOpenChat = async (booking) => {
        setChatLoading(prev => ({ ...prev, [booking.id]: true }));
        try {
            const result = await chatService.createOrGetBookingChat(booking.id);
            const chatData = result?.data || result || {};
            setChatSession({
                chatSessionId: chatData.chatSessionId || result.chatSessionId,
                displayName: chatData.advisorFullName || chatData.advisorName || result.advisorName || 'Cố vấn',
                handle: chatData.advisorName || result.advisorName,
                currentUserId: user?.userId,
                sentTime: chatData.startTime || result.startTime || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to access chat', error);
        } finally {
            setChatLoading(prev => ({ ...prev, [booking.id]: false }));
        }
    };

    const handleRebook = (booking) => {
        setRebookData({
            projectId: booking.projectId,
            advisorId: booking.advisorId,
            sourceBookingId: null
        });
        setShowBookingWizard(true);
    };

    const handleRebookReplacement = (booking) => {
        setRebookData({
            projectId: booking.projectId || booking.project?.projectId,
            advisorId: null,
            sourceBookingId: booking.id || booking.bookingId
        });
        setShowBookingWizard(true);
    };

    const handleDetailAction = (action, booking) => {
        if (action === 'pay') setPaymentBooking(booking);
        if (action === 'chat') handleOpenChat(booking);
        if (action === 'rebook') handleRebookReplacement(booking);
        if (action === 'complain') setComplainBooking(booking);
        if (action === 'report') setReportModal({ bookingId: booking.id, advisorName: booking.advisorName, userRole: 'Investor' });
        if (action === 'viewProject' && onViewProject) onViewProject(booking.projectId);
    };

    const handleClosePayment = useCallback(() => {
        setPaymentBooking(null);
    }, []);

    const handlePaymentSuccess = useCallback(() => {
        loadBookings(true); // Silent background refresh
    }, [loadBookings]);

    // Calculate Stats
    const stats = {
        total: bookings.length,
        completed: bookings.filter(b => b.status === 3 || b.status === 'Completed').length,
        confirmed: bookings.filter(b => b.status === 2 || b.status === 'Confirmed').length,
        canceled: bookings.filter(b => [4, 5, 'Cancel', 'NoResponse'].includes(b.status)).length
    };

    // Derived filtered bookings
    const filteredBookings = bookings.filter(b => {
        // Status filter
        const matchesStatus =
            (filterStatus === 'ApprovedAwaitingPayment' && (b.status === 1 || b.status === 'ApprovedAwaitingPayment')) ||
            (filterStatus === 'Pending' && (b.status === 0 || b.status === 'Pending')) ||
            (filterStatus === 'Confirmed' && (b.status === 2 || b.status === 'Confirmed')) ||
            (filterStatus === 'Completed' && (b.status === 3 || b.status === 'Completed')) ||
            (filterStatus === 'NoResponse' && (b.status === 5 || b.status === 'NoResponse')) ||
            (filterStatus === 'Cancel' && (b.status === 4 || b.status === 'Cancel'));

        // Search filter
        const displayProjectName = (b.projectName || b.project?.projectName || '').toLowerCase();
        const displayAdvisorName = (b.advisorName || '').toLowerCase();
        const matchesSearch = searchTerm === '' ||
            displayProjectName.includes(searchTerm.toLowerCase()) ||
            displayAdvisorName.includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.startTime || b.createdAt || 0) - new Date(a.startTime || a.createdAt || 0));

    return (
        <div className={styles.dashboardSection}>
            {/* Unified Header matching Investor Dashboard */}
            <FeedHeader
                title="Lịch tư vấn"
                subtitle="Quản lý các buổi tư vấn với cố vấn và chuyên gia."
                showFilter={false}
                user={user}
                onOpenChat={(chatSessionId, notification) => {
                    setChatSession({
                        chatSessionId,
                        displayName: notification?.title || 'Chat mới',
                        currentUserId: user?.userId,
                        sentTime: new Date().toISOString()
                    });
                }}
                customAction={
                    <button className={styles.xRefreshIconBtn} onClick={loadBookings} disabled={loading} title="Làm mới danh sách">
                        <RefreshCcw size={18} className={loading ? styles.xSpin : ''} />
                    </button>
                }
            />

            <div className={styles.dashboardContent}>

                {/* Stats Grid */}
                <div className={styles.xStatsGrid}>
                    <div className={styles.xStatCard}>
                        <span className={styles.xStatLabel}>Tổng buổi</span>
                        <span className={styles.xStatValue}>{stats.total}</span>
                    </div>
                    <div className={styles.xStatCard}>
                        <span className={styles.xStatLabel}>Hoàn thành</span>
                        <span className={styles.xStatValue} style={{ color: '#17bf63' }}>{stats.completed}</span>
                    </div>
                    <div className={styles.xStatCard}>
                        <span className={styles.xStatLabel}>Đã xác nhận</span>
                        <span className={styles.xStatValue} style={{ color: '#1d9bf0' }}>{stats.confirmed}</span>
                    </div>
                    <div className={styles.xStatCard}>
                        <span className={styles.xStatLabel}>Đã hủy</span>
                        <span className={styles.xStatValue} style={{ color: '#f4212e' }}>{stats.canceled}</span>
                    </div>
                </div>

                {/* Toolbar: Filters Only (Search moved to Header) */}
                <div className={styles.xToolbar}>
                    <div className={styles.xFilters}>
                        {[
                            { id: 'ApprovedAwaitingPayment', label: 'Chờ thanh toán' },
                            { id: 'Pending', label: 'Chờ duyệt' },
                            { id: 'Confirmed', label: 'Đã xác nhận' },
                            { id: 'Completed', label: 'Hoàn thành' },
                            { id: 'NoResponse', label: 'Không phản hồi' },
                            { id: 'Cancel', label: 'Đã hủy' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.xFilterTab} ${filterStatus === tab.id ? styles.xFilterTabActive : ''}`}
                                onClick={() => {
                                    setFilterStatus(tab.id);
                                    if (onFilterStatusChange) onFilterStatusChange(tab.id);
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader className={styles.spinner} size={24} />
                        <span>Đang tải lịch tư vấn...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Clock size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p>Không tìm thấy lịch tư vấn nào phù hợp.</p>
                    </div>
                ) : (
                    <div className={styles.xBookingGrid}>
                        {filteredBookings.map(booking => {
                            const statusInfo = BOOKING_STATUS_LABELS[booking.status] || { label: String(booking.status), cls: 'badgeInfo', color: '#1d9bf0' };
                            const displayProjectName = booking.projectName || 'Dự án';
                            const displayAdvisorName = booking.advisorName || 'Cố vấn chuyên môn';
                            const startTime = new Date(booking.startTime);
                            const endTime = new Date(booking.endTime);

                            return (
                                <div key={booking.id || booking.bookingId} className={styles.xItem} style={{ borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                                    <div className={styles.xAvatar}>
                                        {displayProjectName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={styles.xContent}>
                                        <div className={styles.xHeader}>
                                            <h4 className={styles.xProjectName} style={{ fontSize: '16px' }}>{displayProjectName}</h4>
                                            <span className={`${styles.xStatus} ${styles[statusInfo.cls]}`} style={{ background: 'transparent', border: `1px solid ${statusInfo.color}`, color: statusInfo.color }}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <div style={{ color: 'var(--primary-blue)', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                                            {displayAdvisorName}
                                        </div>

                                        <div className={styles.xMetaRow}>
                                            <div className={styles.xMetaItem}><Calendar size={13} /> {startTime.toLocaleDateString('vi-VN')}</div>
                                            <span className={styles.xDot}>•</span>
                                            <div className={styles.xMetaItem}><Clock size={13} /> {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                            <span className={styles.xDot}>•</span>
                                            <div className={styles.xMetaItem}>{booking.slotCount} giờ</div>
                                        </div>

                                        <div className={styles.xActions}>
                                            <button
                                                className={styles.xActionButton}
                                                onClick={() => setDetailBooking(booking)}
                                            >
                                                Chi tiết <ChevronRight size={14} />
                                            </button>

                                            {(booking.status === 1 || booking.status === 'ApprovedAwaitingPayment') && (
                                                <button className={`${styles.xActionButton} ${styles.xActionSuccess}`} onClick={() => setPaymentBooking(booking)}>
                                                    <CreditCard size={14} /> Thanh toán
                                                </button>
                                            )}

                                            {(booking.status === 2 || booking.status === 'Confirmed') && (
                                                <button
                                                    className={`${styles.xActionButton} ${styles.xActionPrimary} ${chatLoading[booking.id] ? styles.xBtnDisabled : ''}`}
                                                    onClick={() => handleOpenChat(booking)}
                                                    disabled={!!chatLoading[booking.id]}
                                                    style={{ minWidth: '85px', justifyContent: 'center' }}
                                                >
                                                    {chatLoading[booking.id] ? (
                                                        <Loader2 size={16} className={styles.spinner} />
                                                    ) : (
                                                        <><MessageSquare size={14} /> Chat</>
                                                    )}
                                                </button>
                                            )}

                                            {(booking.status === 2 || booking.status === 'Confirmed' || booking.status === 3 || booking.status === 'Completed') && (
                                                <button className={styles.xActionButton} onClick={() => setReportModal({ bookingId: booking.id, advisorName: booking.advisorName, userRole: 'Investor' })}>
                                                    <FileText size={14} /> Báo cáo
                                                </button>
                                            )}

                                            {(booking.status === 2 || booking.status === 'Confirmed') && (
                                                <button className={`${styles.xActionButton} ${styles.xActionDanger}`} onClick={() => setComplainBooking(booking)} style={{ color: '#f4212e' }}>
                                                    <AlertCircle size={14} /> Khiếu nại
                                                </button>
                                            )}

                                            {[4, 5, 'Cancel', 'NoResponse'].includes(booking.status) && (
                                                <button className={`${styles.xActionButton} ${styles.xActionPrimary}`} onClick={() => handleRebookReplacement(booking)}>
                                                    <RefreshCcw size={14} /> Đặt lại
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ConsultingReportModal */}
                {reportModal && (
                    <ConsultingReportModal
                        bookingId={reportModal.bookingId}
                        userRole={reportModal.userRole}
                        advisorName={reportModal.advisorName}
                        onClose={() => setReportModal(null)}
                        onDone={() => { setReportModal(null); loadBookings(); }}
                    />
                )}

                {/* Floating Chat Widget */}
                <FloatingChatWidget
                    chatSessionId={chatSession?.chatSessionId}
                    displayName={chatSession?.displayName}
                    currentUserId={chatSession?.currentUserId}
                    sentTime={chatSession?.sentTime}
                    onClose={() => setChatSession(null)}
                />

                {/* Payment Modal */}
                {paymentBooking && (
                    <PaymentModal
                        bookingId={paymentBooking.id}
                        advisorName={paymentBooking.advisorName}
                        slotCount={paymentBooking.slotCount}
                        onClose={handleClosePayment}
                        onPaid={handlePaymentSuccess}
                    />
                )}

                {detailBooking && (
                    <BookingDetailModal
                        booking={detailBooking}
                        userRole="Investor"
                        onClose={() => setDetailBooking(null)}
                        onAction={handleDetailAction}
                    />
                )}

                {complainBooking && (
                    <UserReportModal 
                        bookingId={complainBooking.id} 
                        targetUserId={complainBooking.advisorId} 
                        targetUserName={complainBooking.advisorName} 
                        onClose={() => setComplainBooking(null)} 
                        onDone={() => setComplainBooking(null)} 
                    />
                )}

                {/* Booking Wizard for Re-booking */}
                {showBookingWizard && (
                    <BookingWizard
                        initialProjectId={rebookData.projectId}
                        initialAdvisorId={rebookData.advisorId}
                        sourceBookingId={rebookData.sourceBookingId}
                        user={user}
                        onClose={() => setShowBookingWizard(false)}
                        onSuccess={() => {
                            setShowBookingWizard(false);
                            loadBookings();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

