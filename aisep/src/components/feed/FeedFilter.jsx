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
    'E-commerce',
    'SaaS',
    'Logistics',
    'Real Estate',
    'Climate Tech',
    'Other'
  ];

  const stages = [
    'Idea',
    'MVP',
    'Early Traction',
    'Growth',
    'Series A',
    'Series B+',
    'Mature'
  ];

  const fundingStages = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Not Raising'
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

  // Only show filters for investors
  if (user?.role !== 'investor') {
    return null;
  }

  return (
    <div className={styles.filterContainer}>
      <button
        className={styles.filterToggle}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} />
        <span>Filter</span>
        {hasActiveFilters && <span className={styles.badge}>1</span>}
      </button>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h3>Filter Projects</h3>
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
              <label htmlFor="industry-filter">Industry</label>
              <select
                id="industry-filter"
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
              >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="stage-filter">Stage</label>
              <select
                id="stage-filter"
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
              >
                <option value="">All Stages</option>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Stage Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="funding-filter">Funding Status</label>
              <select
                id="funding-filter"
                value={filters.fundingStage}
                onChange={(e) => handleFilterChange('fundingStage', e.target.value)}
              >
                <option value="">All Statuses</option>
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
                Minimum AI Score: {filters.minScore}
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
                Clear Filters
              </button>
            )}
            <button
              className={styles.applyBtn}
              onClick={() => setShowFilters(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedFilter;
