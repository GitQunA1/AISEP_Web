import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Building2, Users, Tag } from 'lucide-react';
import styles from './NewsDetailModal.module.css';

/**
 * NewsDetailModal — Displays the full PR news item detail.
 *
 * API fields used (from PostPrResponseDto):
 *   postPrId, title, content, status, publishedAt,
 *   projectId, projectName, projectImage,
 *   investorId, investorName,
 *   startupId, startupName,
 *   category (defaulted to 'Đầu tư' if absent)
 */
export default function NewsDetailModal({ pr, onClose }) {
    if (!pr) return null;

    const publishedDate = pr.publishedAt
        ? new Date(pr.publishedAt).toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'Chưa xuất bản';

    const category = pr.category || 'Đầu tư';

    return createPortal(
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitleGrp}>
                        <h2 className={styles.headerTitleText}>{pr.title || 'Tin tức'}</h2>
                        <span className={styles.categoryBadge}>
                            <Tag size={10} style={{ marginRight: 4 }} />
                            {category}
                        </span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Thumbnail */}
                    {pr.projectImage ? (
                        <img
                            src={pr.projectImage}
                            alt={pr.projectName}
                            className={styles.thumbnail}
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : null}

                    {/* Deal Info */}
                    <div>
                        <span className={styles.sectionTitle}>Thông tin thương vụ</span>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}><Building2 size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Dự án</span>
                                <span className={styles.infoValue} style={{ color: 'var(--primary-blue)' }}>
                                    {pr.projectName || '—'}
                                </span>
                            </div>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}><Users size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Startup</span>
                                <span className={styles.infoValue} style={{ color: '#10b981' }}>
                                    {pr.startupName || '—'}
                                </span>
                            </div>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}><Users size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Nhà đầu tư</span>
                                <span className={styles.infoValue} style={{ color: '#f59e0b' }}>
                                    {pr.investorName || '—'}
                                </span>
                            </div>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}><Calendar size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Ngày đăng</span>
                                <span className={styles.infoValue}>
                                    {publishedDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Full Content */}
                    {pr.content && (
                        <div>
                            <span className={styles.sectionTitle}>Nội dung</span>
                            <div className={styles.contentBox}>
                                {pr.content}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.secondaryBtn} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
