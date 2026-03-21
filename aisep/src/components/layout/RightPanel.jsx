import React, { useState, useEffect } from 'react';
import { Zap, Pin, Loader, Search, Flame, Star } from 'lucide-react';
import styles from './RightPanel.module.css';
import Badge from '../common/Badge';
import projectSubmissionService from '../../services/projectSubmissionService';

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

function RightPanel({ className, searchQuery = '', onSearchChange, showSearch = true }) {
  const [topRatedStartups, setTopRatedStartups] = useState([]);
  const [trendingSectors, setTrendingSectors]   = useState([]);
  const [isLoading, setIsLoading]               = useState(true);

  useEffect(() => {
    const fetchPanelData = async () => {
      setIsLoading(true);
      try {
        const res = await projectSubmissionService.getAllProjects();
        const items = res?.data?.items ?? res?.items ?? [];

        if (items && items.length > 0) {
          // 1. Filter Approved only
          const approved = items.filter(p => p.status === 'Approved');

          // 2. Sort by score descending (Top Startups)
          const sortedByScore = [...approved].sort((a, b) => (b.score || 0) - (a.score || 0));

          setTopRatedStartups(sortedByScore.slice(0, 3).map((p, idx) => ({
            id: p.projectId ?? idx,
            name: p.projectName || 'Chưa đặt tên',
            industries: p.keySkills
              ? p.keySkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2)
              : [],
            score: p.score ?? null,
          })));

          // 3. Sector counts from Approved projects only
          const sectorCountMap = {};
          approved.forEach(p => {
            if (p.keySkills) {
              p.keySkills.split(',').forEach(field => {
                const trimmed = field.trim();
                if (trimmed) sectorCountMap[trimmed] = (sectorCountMap[trimmed] || 0) + 1;
              });
            }
          });

          const sortedSectors = Object.entries(sectorCountMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count], idx) => ({ name, count, label: SECTOR_LABELS[idx] }));

          setTrendingSectors(sortedSectors);
        }
      } catch (error) {
        console.error('[RightPanel] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPanelData();
  }, []);

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
                  label={startup.score != null && startup.score !== 0 ? String(startup.score) : '__'}
                  variant={
                    startup.score == null || startup.score === 0 ? 'updating'
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
          <button className={styles.widgetFooterLink}>Xem tất cả →</button>
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
              <button key={sector.name} className={styles.sectorRow}>
                <span className={styles.sectorLabel}>{sector.label}</span>
                <span className={styles.sectorHash}>#{sector.name}</span>
                <span className={styles.sectorCount}>{sector.count} dự án</span>
              </button>
            ))
          ) : (
            <p className={styles.emptyText}>#ĐangCậpNhật</p>
          )}
          <button className={styles.widgetFooterLink}>Xem thêm →</button>
        </div>
      </div>
    </aside>
  );
}

export default RightPanel;
