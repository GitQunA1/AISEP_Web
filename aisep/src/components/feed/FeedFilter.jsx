import React, { useState } from 'react';
import { Filter, X, LayoutGrid, Wallet, Sprout, GraduationCap, Sparkles, Tag } from 'lucide-react';
import styles from './FeedFilter.module.css';

/**
 * Helper to get icon based on industry name
 */
const getIndustryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('fintech')) return <Wallet size={14} />;
  if (n.includes('agritech') || n.includes('nông nghiệp')) return <Sprout size={14} />;
  if (n.includes('edtech') || n.includes('giáo dục')) return <GraduationCap size={14} />;
  if (n.includes('ai') || n.includes('trí tuệ nhân tạo')) return <Sparkles size={14} />;
  return <Tag size={14} />;
};

/**
 * FeedFilter Component - Filter startups for investors
 * @param {array} startups - List of startups to filter
 * @param {function} onFilterChange - Callback when filters change
 * @param {object} user - Current user object
 */
function FeedFilter({ onFilterChange, industryCounts = {}, totalCount = 0 }) {
  const [activeTab, setActiveTab] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
  });

  const industries = Object.keys(industryCounts).sort();

  const handleTabClick = (industry) => {
    setActiveTab(industry);
    const newFilters = { ...filters, industry };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'industry') setActiveTab(value);
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsInner}>
          <div className={styles.tabsList}>
            <button 
              className={`${styles.tabItem} ${activeTab === '' ? styles.activeTab : ''}`}
              onClick={() => handleTabClick('')}
            >
              <span>Tất cả</span>
              <span className={styles.tabCount}>{totalCount}</span>
            </button>
            {industries.map(ind => (
              <button 
                key={ind}
                className={`${styles.tabItem} ${activeTab === ind ? styles.activeTab : ''}`}
                onClick={() => handleTabClick(ind)}
              >
                <span className={styles.tabIcon}>{getIndustryIcon(ind)}</span>
                <span>{ind}</span>
                <span className={styles.tabCount}>{industryCounts[ind] || 0}</span>
              </button>
            ))}
          </div>
          
          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
            title="Lọc nâng cao"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {showFilters && (
        <>
          <div className={styles.filterBackdrop} onClick={() => setShowFilters(false)} />
          <div className={styles.filterPanel}>
            {/* ... existing filter panel code ... */}
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
                  {['Ý tưởng', 'MVP', 'Tăng trưởng', 'Series A', 'Trưởng thành'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* AI Score Filter */}
              <div className={styles.filterGroup}>
                <label>Điểm AI tối thiểu: {filters.minScore}</label>
                <input type="range" min="0" max="100" value={filters.minScore} onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))} className={styles.rangeSlider} />
              </div>
            </div>
            <div className={styles.filterActions}>
              <button className={styles.applyBtn} onClick={() => setShowFilters(false)}>Xong</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FeedFilter;
