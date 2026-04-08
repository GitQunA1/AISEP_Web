import React from 'react';
import styles from '../../styles/SharedDashboard.module.css';

function relativeTime(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const then = new Date(dateString);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
    return `${Math.floor(diff / 31536000)} năm trước`;
}

/**
 * NewsCard — Unified news card using site CSS variable palette.
 * Props: thumbnail, category, title, description, source, timestamp, onClick
 */
export default function NewsCard({ thumbnail, category, title, description, source, timestamp, onClick }) {
    return (
        <div className={styles.newsCard} onClick={onClick} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick?.()}>
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt={title || 'Tin tức'}
                    className={styles.newsThumbnail}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <div className={styles.newsThumbnailPlaceholder}>
                    <span className={styles.newsThumbnailPlaceholderText}>Tin đăng không có ảnh đính kèm.</span>
                </div>
            )}
            <div className={styles.newsBody}>
                {category && <span className={styles.newsCategory}>{category}</span>}
                <h3 className={styles.newsTitle} title={title}>{title}</h3>
                {description && <p className={styles.newsDesc}>{description}</p>}
                <div className={styles.newsMeta}>
                    {source && <span>{source}</span>}
                    {source && timestamp && <span>·</span>}
                    {timestamp && <span>{relativeTime(timestamp)}</span>}
                </div>
            </div>
        </div>
    );
}
