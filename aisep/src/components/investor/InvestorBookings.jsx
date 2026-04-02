import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, FileText, CheckCircle, Clock, AlertCircle, X, CreditCard, ChevronRight, Loader } from 'lucide-react';
import styles from '../../styles/SharedDashboard.module.css';
import bookingService from '../../services/bookingService';
import chatService from '../../services/chatService';
import ConsultingReportModal from '../booking/ConsultingReportModal';
import FloatingChatWidget from '../common/FloatingChatWidget';
import PaymentModal from '../booking/PaymentModal';

const BOOKING_STATUS_LABELS = {
    0: { label: 'Chờ xác nhận', cls: 'badgePending' },
    Pending: { label: 'Chờ xác nhận', cls: 'badgePending' },
    1: { label: 'Chờ thanh toán', cls: 'badgeInfo' },
    ApprovedAwaitingPayment: { label: 'Chờ thanh toán', cls: 'badgeInfo' },
    2: { label: 'Đã xác nhận', cls: 'badgeSuccess' },
    Confirmed: { label: 'Đã xác nhận', cls: 'badgeSuccess' },
    3: { label: 'Hoàn thành', cls: 'badgeSuccess' },
    Completed: { label: 'Hoàn thành', cls: 'badgeSuccess' },
    4: { label: 'Đã hủy', cls: 'badgeError' },
    Cancel: { label: 'Đã hủy', cls: 'badgeError' },
    5: { label: 'Không phản hồi', cls: 'badgeError' },
    NoResponse: { label: 'Không phản hồi', cls: 'badgeError' },
};

export default function InvestorBookings({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI state
    const [reportModal, setReportModal] = useState(null);
    const [chatSession, setChatSession] = useState(null);
    const [chatLoading, setChatLoading] = useState({});
    const [paymentBooking, setPaymentBooking] = useState(null);
    
    const loadBookings = useCallback(async () => {
        setLoading(true);
        try {
            // Lấy toàn bộ bookings, backend tự động lọc dựa vào CustomerId của JWT
            const response = await bookingService.getAllBookings('', '-Id', 1, 100);
            const items = response?.items ?? (Array.isArray(response) ? response : []);
            setBookings(items);
        } catch (error) {
            console.error('Failed to load investor bookings', error);
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
            alert('Không thể mở phiên chat. Vui lòng thử lại sau.');
        } finally {
            setChatLoading(prev => ({ ...prev, [booking.id]: false }));
        }
    };

    const handlePayment = (booking) => {
        setPaymentBooking(booking);
    };

    return (
        <div className={styles.section} style={{ padding: '20px' }}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                        Lịch tư vấn của tôi
                        {bookings.filter(b => b.status === 1 || b.status === 'ApprovedAwaitingPayment').length > 0 && (
                            <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: 12, fontSize: 11 }}>
                                {bookings.filter(b => b.status === 1 || b.status === 'ApprovedAwaitingPayment').length} chờ thanh toán
                            </span>
                        )}
                    </h3>
                    <button className={styles.secondaryBtn} onClick={loadBookings} style={{ padding: '6px 14px', fontSize: '12px' }}>
                        Làm mới
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader className={styles.spinner} size={24} />
                        <span>Đang tải lịch tư vấn...</span>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Clock size={40} />
                        <p>Bạn chưa có lịch tư vấn nào. Hãy quay lại trang Khám phá dự án để đặt lịch mới.</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {bookings.map(booking => {
                            const statusInfo = BOOKING_STATUS_LABELS[booking.status] || { label: String(booking.status), cls: 'badgeInfo' };
                            
                            return (
                                <div key={booking.id} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div className={styles.listIcon}><MessageSquare size={16} /></div>
                                            <div className={styles.listContent}>
                                                <div className={styles.listTitle}>{booking.projectName || 'Dự án'}</div>
                                                <div className={styles.listMeta}>
                                                    Cố vấn: <strong>{booking.advisorName || 'Cố vấn viên'}</strong>
                                                    {' · '}{booking.slotCount} slot ({booking.slotCount} giờ)
                                                </div>
                                                <div className={styles.listMeta} style={{ marginTop: '2px' }}>
                                                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                                                    {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                                                    {' '}
                                                    {new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    {' – '}
                                                    {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`${styles.badge} ${styles[statusInfo.cls]}`}>{statusInfo.label}</span>
                                    </div>

                                    {/* Action buttons depending on Booking status */}
                                    <div style={{ display: 'flex', gap: 8, paddingLeft: '48px', marginTop: '4px' }}>
                                        
                                        {(booking.status === 1 || booking.status === 'ApprovedAwaitingPayment') && (
                                            <button
                                                className={styles.primaryBtn}
                                                style={{ padding: '6px 14px', fontSize: '13px', background: '#10b981', borderColor: '#10b981' }}
                                                onClick={() => handlePayment(booking)}
                                            >
                                                <CreditCard size={14} />
                                                Thanh toán ngay
                                            </button>
                                        )}

                                        {(booking.status === 2 || booking.status === 'Confirmed' || booking.status === 3 || booking.status === 'Completed') && (
                                            <>
                                                <button
                                                    className={styles.primaryBtn}
                                                    style={{ padding: '6px 14px', fontSize: '13px', minWidth: 'auto' }}
                                                    onClick={() => handleOpenChat(booking)}
                                                    disabled={!!chatLoading[booking.id]}
                                                >
                                                    {chatLoading[booking.id] ? <Loader size={14} /> : <MessageSquare size={14} />}
                                                    Chat
                                                </button>
                                                <button
                                                    className={styles.secondaryBtn}
                                                    style={{ padding: '6px 14px', fontSize: '13px' }}
                                                    onClick={() => setReportModal({ bookingId: booking.id, advisorName: booking.advisorName, userRole: 'Investor' })}
                                                >
                                                    <FileText size={14} />
                                                    Xem báo cáo
                                                </button>
                                            </>
                                        )}
                                        
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ConsultingReportModal (View Only for Investor or interaction) */}
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
                    onClose={() => setPaymentBooking(null)}
                    onPaid={() => {
                        setPaymentBooking(null);
                        loadBookings();
                    }}
                />
            )}
        </div>
    );
}

