import React from 'react';
import { createPortal } from 'react-dom';
import { 
    X, WarningCircle, CheckCircle, Clock, Info, Calendar, User, 
    ShieldCheck, ShieldWarning, ChatTeardropDots 
} from '@phosphor-icons/react';
import styles from './UserReportStatusModal.module.css';

/**
 * UserReportStatusModal - Modal for users to view their complaint status and resolution notes.
 */
export default function UserReportStatusModal({ report, onClose }) {
  if (!report) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return { 
          label: 'Đang xử lý', 
          color: '#f59e0b', 
          bg: 'rgba(245, 158, 11, 0.1)', 
          icon: Clock,
          message: 'Khiếu nại của bạn đang được đội ngũ quản trị viên AISEP xem xét. Chúng tôi sẽ sớm có phản hồi cho bạn.'
        };
      case 'Valid':
      case 'Resolved':
        return { 
          label: 'Hợp lệ', 
          color: '#10b981', 
          bg: 'rgba(16, 185, 129, 0.1)', 
          icon: ShieldCheck,
          message: 'Khiếu nại của bạn đã được xác minh là hợp lệ. Hành động giải quyết đã được thực thi theo quy định của hệ thống.'
        };
      case 'False':
      case 'Dismissed':
        return { 
          label: 'Sai lệch', 
          color: '#f4212e', 
          bg: 'rgba(244, 33, 46, 0.1)', 
          icon: WarningCircle,
          message: 'Khiếu nại của bạn được xác định là không chính xác hoặc không đủ bằng chứng để xử lý.'
        };
      default:
        return { 
          label: status, 
          color: 'var(--text-secondary)', 
          bg: 'var(--bg-secondary)', 
          icon: Info,
          message: ''
        };
    }
  };

  const config = getStatusConfig(report.status);
  const StatusIcon = config.icon;

  const categories = {
    'PaymentIssue': 'Vấn đề về thanh toán / Phí tư vấn',
    'ServiceQuality': 'Chất lượng dịch vụ không đạt yêu cầu',
    'NoShow': 'Cố vấn không xuất hiện (No-show)',
    'LateOrShortSession': 'Bắt đầu muộn / Kết thúc sớm',
    'UnprofessionalConduct': 'Hành vi thiếu chuyên nghiệp',
    'ScopeNotMet': 'Không đúng nội dung cam kết',
    'InappropriateContent': 'Nội dung không phù hợp / Quấy rối',
    'Other': 'Lý do khác',
  };

  const content = (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon} style={{ background: config.bg, color: config.color }}>
              <StatusIcon size={24} weight="bold" />
            </div>
            <div>
              <h2 className={styles.title}>Chi tiết Khiếu nại</h2>
              <p className={styles.subtitle}>Mã khiếu nại: #{report.userReportId || report.id}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Status Banner */}
          <div className={styles.statusBanner} style={{ borderLeft: `8px solid ${config.color}`, background: `${config.bg}` }}>
            <div className={styles.statusLabel} style={{ color: config.color }}>
                {config.label}
            </div>
            <p className={styles.statusMessage}>{config.message}</p>
          </div>

          {/* Report Information */}
          <section className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Thông tin đã báo cáo</h3>
            
            <div className={styles.infoField}>
              <div className={styles.fieldLabel}>Loại khiếu nại</div>
              <div className={styles.fieldValue}>{categories[report.category] || report.category}</div>
            </div>

            <div className={styles.infoField}>
              <div className={styles.fieldLabel}>Môi tả của bạn</div>
              <div className={styles.descriptionBox}>{report.description}</div>
            </div>

            <div className={styles.dateMeta}>
                <Calendar size={14} />
                <span>Ngày gửi: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </section>

          {/* Resolution Feedback - Only show if resolved */}
          {report.status !== 'Pending' && (
            <section className={styles.feedbackSection}>
              <div className={styles.feedbackHeader}>
                <ChatTeardropDots size={20} color="var(--primary-blue)" />
                <h3 className={styles.sectionTitle}>Phản hồi từ Quản trị viên</h3>
              </div>
              
              <div className={styles.resolutionNoteCard}>
                <div className={styles.noteContent}>
                    "{report.resolutionNote || "Quản trị viên đã xử lý khiếu nại này dựa trên các bằng chứng được cung cấp."}"
                </div>
                
                <div className={styles.resolutionMeta}>
                    <div className={styles.metaItem}>
                        <User size={12} weight="bold" />
                        <span>Người xử lý: {report.resolvedBy || 'Hệ thống'}</span>
                    </div>
                    {report.resolvedAt && (
                      <div className={styles.metaItem}>
                          <Clock size={12} weight="bold" />
                          <span>Thời gian: {new Date(report.resolvedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeActionBtn} onClick={onClose}>
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
