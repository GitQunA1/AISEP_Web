import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Filter, X, Clock, Flame, Star, Coins, List } from 'lucide-react';
import styles from './FeedFilter.module.css';

/**
 * FeedFilter Component - Filter startups for investors
 * @param {function} onFilterChange - Callback when filters change
 * @param {object} totalCount - Total number of projects
 */
function FeedFilter({ onFilterChange, totalCount = 0 }) {
  const [activeSort, setActiveSort] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
    sort: 'all',
  });

  const sortOptions = [
    { id: 'all', label: 'Tất cả', icon: List },
    { id: 'newest', label: 'Mới nhất', icon: Clock },
    { id: 'rated', label: 'Được đánh giá cao', icon: Star },
  ];

  const handleSortClick = (sortId) => {
    setActiveSort(sortId);
    const newFilters = { ...filters, sort: sortId };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const filterPanelContent = (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <h3>Lọc nâng cao</h3>
        <button className={styles.closeFilterBtn} onClick={() => setShowFilters(false)}>
          <X size={20} />
        </button>
      </div>
      <div className={styles.filterContent}>
        {/* Stage Filter */}
        <div className={styles.filterGroup}>
          <label>Giai đoạn</label>
          <select value={filters.stage} onChange={(e) => handleFilterChange('stage', e.target.value)}>
            <option value="">Tất cả giai đoạn</option>
            {['Ý tưởng (Idea)', 'MVP', 'Vận hành (Growth)'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* AI Score Filter */}
        <div className={styles.filterGroup}>
          <label>Điểm AI tối thiểu: {filters.minScore}%</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={filters.minScore} 
            onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))} 
            className={styles.rangeSlider} 
          />
          <div className={styles.scoreLabels}>
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>
      <div className={styles.filterActions}>
        <button className={styles.applyBtn} onClick={() => setShowFilters(false)}>Xong</button>
      </div>
    </div>
  );

  return (
    <div className={styles.filterContainer}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsInner}>
          <div className={styles.tabsList}>
            {sortOptions.map(option => {
              const IconComponent = option.icon;
              return (
                <button 
                  key={option.id}
                  className={`${styles.tabItem} ${activeSort === option.id ? styles.activeTab : ''}`}
                  onClick={() => handleSortClick(option.id)}
                >
                  <span className={styles.tabIcon}><IconComponent size={14} /></span>
                  <span>{option.label}</span>
                  {option.id === 'all' && <span className={styles.tabCount}>{totalCount}</span>}
                </button>
              );
            })}
          </div>
          
          <div className={styles.filterToggleWrapper}>
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
              title="Lọc nâng cao"
            >
              <Filter size={18} />
            </button>
            
            {/* Desktop Inline Panel */}
            {showFilters && (
              <div className={styles.desktopOnly}>
                {filterPanelContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Portal Modal */}
      {showFilters && createPortal(
        <div className={styles.mobileOnly}>
          <div className={styles.filterBackdrop} onClick={() => setShowFilters(false)} />
          {filterPanelContent}
        </div>,
        document.body
      )}
    </div>
  );
}

export default FeedFilter;
