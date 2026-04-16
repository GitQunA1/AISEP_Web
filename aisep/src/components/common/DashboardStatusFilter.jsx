import React from 'react';
import styles from '../../styles/SharedDashboard.module.css';

/**
 * DashboardStatusFilter - A premium pill-style filter component for dashboards
 * 
 * @param {Array} options - Array of { id, label, statuses }
 * @param {Object} counts - Object mapping filter IDs to counts { all: 10, draft: 5, ... }
 * @param {string} activeFilter - Current active filter ID
 * @param {Function} onFilterChange - Callback when filter changes
 */
const DashboardStatusFilter = ({ options, counts, activeFilter, onFilterChange }) => {
    return (
        <div className={styles.xFilters}>
            {options.map((option) => (
                <button
                    key={option.id}
                    className={`${styles.xFilterTab} ${activeFilter === option.id ? styles.xFilterTabActive : ''}`}
                    onClick={() => onFilterChange(option.id)}
                >
                    <span>{option.label}</span>
                    {counts[option.id] !== undefined && (
                        <span className={styles.xFilterBadge}>{counts[option.id]}</span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default DashboardStatusFilter;
