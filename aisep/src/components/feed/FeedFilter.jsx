import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import styles from './FeedFilter.module.css';

/**
 * FeedFilter Component - Filter startups for investors
 * @param {array} startups - List of startups to filter
 * @param {function} onFilterChange - Callback when filters change
 * @param {object} user - Current user object
 */
function FeedFilter({ startups = [], onFilterChange, user }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    stage: '',
    minScore: 0,
    fundingStage: '',
  });

  const industries = [
    'AI/ML',
    'Fintech',
    'Healthtech',
    'EdTech',
    'Thương mại điện tử',
    'SaaS',
    'Logistics',
    'Bất động sản',
    'Climate Tech',
    'Khác'
  ];

  const stages = [
    'Ý tưởng',
    'MVP',
    'Tăng trưởng sớm',
    'Tăng trưởng',
    'Series A',
    'Series B+',
    'Trưởng thành'
  ];

  const fundingStages = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Không huy động'
  ];

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);

    // Call parent callback with filtered results
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      industry: '',
      stage: '',
      minScore: 0,
      fundingStage: '',
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== '' && value !== 0
  );

  // Filter is now available for all users

  return (
    <div className={styles.filterContainer}>
      <button
        className={styles.filterToggle}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} />
        <span>Bộ lọc</span>
        {hasActiveFilters && <span className={styles.badge}>1</span>}
      </button>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h3>Lọc dự án</h3>
            <button
              className={styles.closeFilterBtn}
              onClick={() => setShowFilters(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.filterContent}>
            {/* Industry Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="industry-filter">Ngành nghề</label>
              <select
                id="industry-filter"
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
              >
                <option value="">Tất cả ngành nghề</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="stage-filter">Giai đoạn</label>
              <select
                id="stage-filter"
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
              >
                <option value="">Tất cả giai đoạn</option>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Stage Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="funding-filter">Trạng thái gọi vốn</label>
              <select
                id="funding-filter"
                value={filters.fundingStage}
                onChange={(e) => handleFilterChange('fundingStage', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                {fundingStages.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Score Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="score-filter">
                Điểm AI tối thiểu: {filters.minScore}
              </label>
              <input
                type="range"
                id="score-filter"
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
            {hasActiveFilters && (
              <button
                className={styles.clearBtn}
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </button>
            )}
            <button
              className={styles.applyBtn}
              onClick={() => setShowFilters(false)}
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedFilter;
