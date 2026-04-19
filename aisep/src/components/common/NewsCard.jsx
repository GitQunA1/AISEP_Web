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
 * NewsCard — Unified news card with glassmorphism support.
 * Props: thumbnail, category, title, description, source, timestamp, onClick, projectName, investorName
 */
export default function NewsCard({ 
    thumbnail, 
    category, 
    title, 
    description, 
    source, 
    timestamp, 
    onClick, 
    index = 0,
    projectName,
    investorName 
}) {
    return (
        <div 
            className={`${styles.newsCard} ${styles.itemAppear}`} 
            onClick={onClick} 
            role="button" 
            tabIndex={0}
            style={{ animationDelay: `${index * 0.05}s` }}
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
                <div className={styles.newsBadgeRow}>
                    {category && <span className={styles.newsCategory}>{category}</span>}
                    {projectName && <span className={styles.newsProjectTag}>📊 {projectName}</span>}
                    {investorName && <span className={styles.newsInvestorTag}>💼 {investorName}</span>}
                </div>
                
                <h3 className={styles.newsTitle} title={title}>{title}</h3>
                {description && <p className={styles.newsDesc}>{description}</p>}
                
                <div className={styles.newsMeta}>
                    {source && <span className={styles.newsSource}>{source}</span>}
                    {source && timestamp && <span className={styles.metaDivider}>·</span>}
                    {timestamp && <span className={styles.newsDate}>{relativeTime(timestamp)}</span>}
                </div>
            </div>
        </div>
    );
}
