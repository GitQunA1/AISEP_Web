import React, { useState, useEffect } from 'react';
import { Zap, Pin, Loader, Search, Flame, Star } from 'lucide-react';
import styles from './RightPanel.module.css';
import Badge from '../common/Badge';
import projectSubmissionService from '../../services/projectSubmissionService';
import AIEvaluationService from '../../services/AIEvaluationService';

const AVATAR_COLORS = [
  { bg: '#1d4ed8', text: '#ffffff' },
  { bg: '#059669', text: '#ffffff' },
  { bg: '#d97706', text: '#ffffff' },
  { bg: '#7c3aed', text: '#ffffff' },
  { bg: '#db2777', text: '#ffffff' },
];

const SECTOR_LABELS = [
  'Xu hướng tuần này',
  'Tăng trưởng nhanh',
  'Nhiều nhà đầu tư theo dõi',
  'Mới nhất',
  'Đang nổi',
];

function AvatarInitial({ name, index }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <span
      className={styles.avatarCircle}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {initials}
    </span>
  );
}

function RightPanel({
  className,
  searchQuery = '',
  onSearchChange,
  showSearch = true,
  onFilterChange,
  onShowHome,
  topRatedStartups = [],
  trendingSectors = [],
  isLoading = false
}) {
  const handleSectorClick = (sectorName) => {
    if (onFilterChange) {
      onFilterChange({ industry: sectorName });
      if (onShowHome) onShowHome();
    }
  };

  return (
    <aside className={`${styles.rightPanel} ${className || ''}`}>

      {/* ── SEARCH BAR ── */}
      {showSearch && (
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
        </div>
      )}

      {/* Top Startup AI */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <Flame size={17} className={styles.headerIcon} />
          <h3 className={styles.widgetTitle}>Top Startup AI</h3>
        </div>
        <div className={styles.widgetContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader size={20} className={styles.spinIcon} />
            </div>
          ) : topRatedStartups.length > 0 ? (
            topRatedStartups.map((startup, idx) => (
              <div key={startup.id} className={styles.startupRow}>
                <AvatarInitial name={startup.name} index={idx} />
                <div className={styles.startupInfo}>
                  <span className={styles.startupName}>{startup.name}</span>
                  {startup.industries.length > 0 && (
                    <span className={styles.startupIndustries}>
                      {startup.industries.join(' · ')}
                    </span>
                  )}
                </div>
                <Badge
                  label={startup.score === undefined ? '' : (startup.score === null ? '__' : String(startup.score))}
                  isLoading={startup.score === undefined}
                  variant={
                    startup.score === undefined || startup.score === null ? 'updating'
                      : startup.score >= 80 ? 'score-good'
                        : startup.score >= 50 ? 'score-medium'
                          : 'score-poor'
                  }
                  size="sm"
                />
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Chưa có dự án được duyệt</p>
          )}
        </div>
      </div>

      {/* Lĩnh vực nổi bật */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <Star size={17} className={styles.headerIcon} />
          <h3 className={styles.widgetTitle}>Lĩnh vực nổi bật</h3>
        </div>
        <div className={styles.widgetContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader size={20} className={styles.spinIcon} />
            </div>
          ) : trendingSectors.length > 0 ? (
            trendingSectors.map(sector => (
              <button
                key={sector.name}
                className={styles.sectorRow}
                onClick={() => handleSectorClick(sector.name)}
              >
                <span className={styles.sectorLabel}>{sector.label}</span>
                <span className={styles.sectorHash}>#{sector.name}</span>
                <span className={styles.sectorCount}>{sector.count} dự án</span>
              </button>
            ))
          ) : (
            <p className={styles.emptyText}>#ĐangCậpNhật</p>
          )}
        </div>
      </div>
    </aside>
  );
}

export default RightPanel;
