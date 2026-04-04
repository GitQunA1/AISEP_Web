import React from 'react';
import { X, Calendar, Clock, User, Briefcase, CreditCard, ChevronRight, MessageSquare, RefreshCcw, AlertCircle } from 'lucide-react';
import styles from './BookingDetailModal.module.css';

const STATUS_CONFIG = {
  0: { label: 'Chờ xác nhận', badgeClass: styles.badgePending },
  Pending: { label: 'Chờ xác nhận', badgeClass: styles.badgePending },
  1: { label: 'Chờ thanh toán', badgeClass: styles.badgeConfirmed },
  ApprovedAwaitingPayment: { label: 'Chờ thanh toán', badgeClass: styles.badgeConfirmed },
  2: { label: 'Đã xác nhận', badgeClass: styles.badgeConfirmed },
  Confirmed: { label: 'Đã xác nhận', badgeClass: styles.badgeConfirmed },
  3: { label: 'Hoàn thành', badgeClass: styles.badgeCompleted },
  Completed: { label: 'Hoàn thành', badgeClass: styles.badgeCompleted },
  4: { label: 'Đã hủy', badgeClass: styles.badgeCancelled },
  Cancel: { label: 'Đã hủy', badgeClass: styles.badgeCancelled },
  5: { label: 'Không phản hồi', badgeClass: styles.badgeCancelled },
  NoResponse: { label: 'Không phản hồi', badgeClass: styles.badgeCancelled },
};

export default function BookingDetailModal({ booking, onClose, onAction, userRole = 'Startup' }) {
  if (!booking) return null;

  const statusInfo = STATUS_CONFIG[booking.status] || { label: String(booking.status), badgeClass: styles.badgeConfirmed };
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const formattedDate = startTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeRange = `${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  
  const price = booking.price || booking.estimatedPrice || 0;
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Modal Header — Replicating Staff Dashboard Style */}
        <div className={styles.header}>
          <div className={styles.headerTitleGrp}>
            <h2 className={styles.headerTitleText}>
              Booking #{booking.id || booking.bookingId}
            </h2>
            <span className={`${styles.bookingBadge} ${statusInfo.badgeClass}`}>
              {statusInfo.label}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body — Structured & Numbered */}
        <div className={styles.body}>
          {/* 1. Thông tin nhân sự */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className={styles.sectionTitle}>1. Thông tin nhân sự</h4>
            <div className={styles.infoGrid}>
              <div className={styles.profileCard}>
                <span className={styles.profileLabel}>Cố vấn chuyên môn</span>
                <span className={styles.profileName} style={{ color: '#1d9bf0' }}>{booking.advisorName || 'N/A'}</span>
                <span className={styles.profileId}>Mã cố vấn: {booking.advisorId || '—'}</span>
              </div>
              <div className={styles.profileCard}>
                <span className={styles.profileLabel}>{userRole === 'Startup' ? 'Startup / Khách hàng' : 'Nhà đầu tư / Khách hàng'}</span>
                <span className={styles.profileName} style={{ color: '#10b981' }}>{booking.projectName || (userRole === 'Startup' ? 'Dự án của bạn' : 'Khách hàng')}</span>
                <span className={styles.profileId}>Mã hồ sơ: {booking.projectId || booking.customerId || '—'}</span>
              </div>
            </div>
          </div>

          {/* 2. Thời gian tư vấn */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className={styles.sectionTitle}>2. Thời gian tư vấn</h4>
            <div className={styles.profileCard} style={{ background: 'transparent' }}>
               <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Ngày tư vấn</span>
                    <span className={styles.value}><Calendar size={16} color="#1d9bf0" /> {formattedDate}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Khung giờ chi tiết</span>
                    <span className={styles.value}><Clock size={16} color="#1d9bf0" /> {timeRange}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Thời lượng</span>
                    <span className={styles.value}>{booking.slotCount || 1} giờ tư vấn trực tuyến</span>
                  </div>
               </div>
            </div>
          </div>

          {/* 3. Chi phí & Ghi chú */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className={styles.sectionTitle}>3. Chi phí & Ghi chú</h4>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.label}>Tổng chi phí</span>
                <span className={styles.value} style={{ fontSize: '18px', color: '#1d9bf0' }}>
                  {price === 0 ? 'Miễn phí ✨' : formatPrice(price)}
                </span>
              </div>
              {booking.note && (
                <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.label}>Ghi chú từ khách hàng</span>
                  <div className={styles.noteBox}>
                    "{booking.note}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {booking.rejectReason && [4, 5, 'Cancel', 'NoResponse'].includes(booking.status) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 className={styles.sectionTitle} style={{ color: '#f4212e' }}>Lý do từ chối</h4>
              <div className={styles.noteBox} style={{ borderLeft: '4px solid #f4212e', background: 'rgba(244, 33, 46, 0.05)' }}>
                {booking.rejectReason}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer — Standardized Actions */}
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.secondaryBtn}>
            Đóng
          </button>
          
          {userRole === 'Startup' && (booking.status === 1 || booking.status === 'ApprovedAwaitingPayment') && (
            <button className={`${styles.primaryBtn} ${styles.successBtn}`} onClick={() => { onAction('pay', booking); onClose(); }}>
              <CreditCard size={16} /> Thanh toán phí
            </button>
          )}
          {(booking.status === 2 || booking.status === 'Confirmed') && (
            <button className={styles.primaryBtn} onClick={() => { onAction('chat', booking); onClose(); }}>
              <MessageSquare size={16} /> Vào phòng chat
            </button>
          )}
          {userRole === 'Startup' && [4, 5, 'Cancel', 'NoResponse'].includes(booking.status) && (
            <button className={styles.primaryBtn} onClick={() => { onAction('rebook', booking); onClose(); }}>
              <ChevronRight size={16} /> Tìm cố vấn thay thế
            </button>
          )}

          {userRole === 'Advisor' && (booking.status === 0 || booking.status === 'Pending') && (
            <>
              <button 
                className={`${styles.secondaryBtn} ${styles.dangerBtn}`} 
                onClick={() => { onAction('reject', booking); onClose(); }}
                style={{ color: '#f4212e', borderColor: 'rgba(244, 33, 46, 0.2)' }}
              >
                Từ chối
              </button>
              <button 
                className={styles.primaryBtn} 
                onClick={() => { onAction('approve', booking); onClose(); }}
                style={{ background: '#1d9bf0' }}
              >
                Phê duyệt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
