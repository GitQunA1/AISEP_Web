import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, FileText, CheckCircle, Clock, AlertCircle, X, CreditCard, ChevronRight, Loader, Calendar, Search, RefreshCcw } from 'lucide-react';
import styles from '../../styles/SharedDashboard.module.css';
import bookingService from '../../services/bookingService';
import chatService from '../../services/chatService';
import ConsultingReportModal from '../booking/ConsultingReportModal';
import FloatingChatWidget from '../common/FloatingChatWidget';
import PaymentModal from '../booking/PaymentModal';
import BookingWizard from '../booking/BookingWizard';
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

export default function StartupBookings({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter & Search State
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI state
    const [reportModal, setReportModal] = useState(null);
    const [chatSession, setChatSession] = useState(null);
    const [chatLoading, setChatLoading] = useState({});
    const [paymentBooking, setPaymentBooking] = useState(null);
    
    // Booking Wizard State (for re-booking)
    const [showBookingWizard, setShowBookingWizard] = useState(false);
    const [rebookData, setRebookData] = useState({ projectId: null, advisorId: null });
    
    const loadBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await bookingService.getMyCustomerBookings('', '-Id', 1, 100);
            const items = response?.items ?? (Array.isArray(response) ? response : []);
            setBookings(items);
        } catch (error) {
            console.error('Failed to load startup bookings', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleOpenChat = async (booking) => {
        setChatLoading(prev => ({ ...prev, [booking.id]: true }));
        try {
            const result = await chatService.createOrGetBookingChat(booking.id);
            setChatSession({
                chatSessionId: result.chatSessionId,
                displayName: result.advisorName || 'Cố vấn',
                currentUserId: user?.userId,
                sentTime: new Date().toISOString()
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
            advisorId: booking.advisorId
        });
        setShowBookingWizard(true);
    };

    // Calculate Stats
    const stats = {
        total: bookings.length,
        completed: bookings.filter(b => b.status === 3 || b.status === 'Completed').length,
        confirmed: bookings.filter(b => b.status === 2 || b.status === 'Confirmed').length,
        canceled: bookings.filter(b => [4, 5, 'Cancel', 'NoResponse'].includes(b.status)).length
    };

    // Derived filtered bookings
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'completed' && (b.status === 3 || b.status === 'Completed')) ||
            (filterStatus === 'confirmed' && (b.status === 2 || b.status === 'Confirmed')) ||
            (filterStatus === 'canceled' && [4, 5, 'Cancel', 'NoResponse'].includes(b.status));
        
        const displayProjectName = (b.projectName || b.project?.projectName || '').toLowerCase();
        const displayAdvisorName = (b.advisorName || '').toLowerCase();
        const matchesSearch = searchTerm === '' || 
            displayProjectName.includes(searchTerm.toLowerCase()) || 
            displayAdvisorName.includes(searchTerm.toLowerCase());
            
        return matchesStatus && matchesSearch;
    });

    return (
        <div className={styles.dashboardSection}>
            <div className={styles.xHeaderIsland}>
                <div className={styles.xHeaderInfo}>
                    <h1 className={styles.xHeaderTitle}>Lịch tư vấn của tôi</h1>
                    <p className={styles.xHeaderSubtitle}>
                        Bạn có {stats.total} buổi tư vấn được ghi nhận trong hệ thống.
                    </p>
                </div>
                <div className={styles.xHeaderAction}>
                    <button
                        className={styles.xRefreshIconBtn}
                        onClick={loadBookings}
                        disabled={loading}
                        title="Làm mới danh sách"
                    >
                        <RefreshCcw size={18} className={loading ? styles.xSpin : ''} />
                    </button>
                </div>
            </div>


            <div className={styles.dashboardContent}>

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

                <div className={styles.xToolbar}>
                    <div className={styles.xFilters}>
                        <button className={`${styles.xFilterTab} ${filterStatus === 'all' ? styles.xFilterTabActive : ''}`} onClick={() => setFilterStatus('all')}>Tất cả</button>
                        <button className={`${styles.xFilterTab} ${filterStatus === 'completed' ? styles.xFilterTabActive : ''}`} onClick={() => setFilterStatus('completed')}>Hoàn thành</button>
                        <button className={`${styles.xFilterTab} ${filterStatus === 'confirmed' ? styles.xFilterTabActive : ''}`} onClick={() => setFilterStatus('confirmed')}>Đã xác nhận</button>
                        <button className={`${styles.xFilterTab} ${filterStatus === 'canceled' ? styles.xFilterTabActive : ''}`} onClick={() => setFilterStatus('canceled')}>Đã hủy</button>
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
                                    <div className={styles.xAvatar}>{displayProjectName.charAt(0).toUpperCase()}</div>
                                    <div className={styles.xContent}>
                                        <div className={styles.xHeader}>
                                            <h4 className={styles.xProjectName} style={{ fontSize: '16px' }}>{displayProjectName}</h4>
                                            <span className={`${styles.xStatus} ${styles[statusInfo.cls]}`} style={{ background: 'transparent', border: `1px solid ${statusInfo.color}`, color: statusInfo.color }}>{statusInfo.label}</span>
                                        </div>
                                        <div style={{ color: 'var(--primary-blue)', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>{displayAdvisorName}</div>
                                        <div className={styles.xMetaRow}>
                                            <div className={styles.xMetaItem}><Calendar size={13} /> {startTime.toLocaleDateString('vi-VN')}</div>
                                            <span className={styles.xDot}>•</span>
                                            <div className={styles.xMetaItem}><Clock size={13} /> {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                            <span className={styles.xDot}>•</span>
                                            <div className={styles.xMetaItem}>{booking.slotCount} giờ</div>
                                        </div>
                                        <div className={styles.xActions}>
                                            {(booking.status === 1 || booking.status === 'ApprovedAwaitingPayment') && (
                                                <button className={`${styles.xActionButton} ${styles.xActionSuccess}`} style={{ width: '100%' }} onClick={() => setPaymentBooking(booking)}>
                                                    <CreditCard size={14} /> Thanh toán phí tư vấn
                                                </button>
                                            )}
                                            {(booking.status === 2 || booking.status === 'Confirmed') && (
                                                <button className={`${styles.xActionButton} ${styles.xActionPrimary}`} style={{ width: '100%' }} onClick={() => handleOpenChat(booking)} disabled={!!chatLoading[booking.id]}>
                                                    <MessageSquare size={14} /> Trò chuyện trực tuyến
                                                </button>
                                            )}
                                            {booking.status === 3 || booking.status === 'Completed' ? (
                                                <button className={styles.xActionButton} style={{ width: '100%' }} onClick={() => setReportModal({ bookingId: booking.id, advisorName: booking.advisorName, userRole: 'Startup' })}>
                                                    <FileText size={14} /> Báo cáo
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modals and Widgets */}
                {reportModal && (
                    <ConsultingReportModal bookingId={reportModal.bookingId} userRole={reportModal.userRole} advisorName={reportModal.advisorName} onClose={() => setReportModal(null)} onDone={() => { setReportModal(null); loadBookings(); }} />
                )}
                <FloatingChatWidget chatSessionId={chatSession?.chatSessionId} displayName={chatSession?.displayName} currentUserId={chatSession?.currentUserId} sentTime={chatSession?.sentTime} onClose={() => setChatSession(null)} />
                {paymentBooking && (
                    <PaymentModal bookingId={paymentBooking.id} advisorName={paymentBooking.advisorName} slotCount={paymentBooking.slotCount} onClose={() => setPaymentBooking(null)} onPaid={() => { setPaymentBooking(null); loadBookings(); }} />
                )}
                {showBookingWizard && (
                    <BookingWizard initialProjectId={rebookData.projectId} initialAdvisorId={rebookData.advisorId} user={user} onClose={() => setShowBookingWizard(false)} onSuccess={() => { setShowBookingWizard(false); loadBookings(); }} />
                )}
            </div>
        </div>
    );
}
