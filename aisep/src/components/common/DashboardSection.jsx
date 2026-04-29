import React from 'react';
import styles from '../../styles/SharedDashboard.module.css';

/**
 * DashboardSection - Standardized layout container for dashboard tabs
 * 
 * @param {string} title - Section title
 * @param {React.Node} topBarExtra - Optional extra content for the top bar (e.g., Search)
 * @param {React.Node} filterBar - Optional filter bar (e.g., DashboardStatusFilter)
 * @param {React.Node} children - Main content (grid, list, etc.)
 */
const DashboardSection = ({ title, topBarExtra, filterBar, banner, children }) => {
    return (
        <div className={styles.section} style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '0 16px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '64px',
                boxSizing: 'border-box'
            }}>
                <div style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%'
                }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {topBarExtra}
                </div>
            </div>

            {/* Filter Bar */}
            {filterBar && (
                <div style={{ marginBottom: '24px' }}>
                    {filterBar}
                </div>
            )}

            {/* Banner Section (Placed below filters) */}
            {banner && (
                <div style={{ marginBottom: '24px' }}>
                    {banner}
                </div>
            )}

            {/* Main Content */}
            <div className={styles.sectionContent}>
                {children}
            </div>
        </div>
    );
};

export default DashboardSection;
