import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import styles from './RightPanel.module.css';
import Badge from '../common/Badge';

/**
 * RightPanel Component - Right sidebar with trending/featured content (Desktop only)
 */
function RightPanel() {
  const topRatedStartups = [
    { id: 1, name: 'GreenChain', score: 91 },
    { id: 2, name: 'FinFlow', score: 87 },
    { id: 3, name: 'HealthMind', score: 72 },
  ];

  const trendingSectors = [
    'Fintech',
    'HealthTech',
    'DevTools',
    'Blockchain',
    'Computer Vision',
  ];

  const handleStartupClick = (startupName) => {
    console.log(`Clicked on ${startupName}`);
  };

  const handleSectorClick = (sector) => {
    console.log(`Clicked on ${sector}`);
  };

  return (
    <aside className={styles.rightPanel}>
      {/* Top AI-Rated Startups */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <Zap size={18} color="var(--primary-blue)" />
          <h3 className={styles.widgetTitle}>Top AI Startups</h3>
        </div>
        <div className={styles.widgetContent}>
          {topRatedStartups.map((startup) => (
            <button
              key={startup.id}
              onClick={() => handleStartupClick(startup.name)}
              className={styles.startupItem}
            >
              <span className={styles.startupName}>{startup.name}</span>
              <Badge label={`${startup.score}%`} variant="score-good" />
            </button>
          ))}
        </div>
      </div>

      {/* Trending Sectors */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <TrendingUp size={18} color="var(--primary-blue)" />
          <h3 className={styles.widgetTitle}>Trending Sectors</h3>
        </div>
        <div className={styles.widgetContent}>
          {trendingSectors.map((sector) => (
            <button
              key={sector}
              onClick={() => handleSectorClick(sector)}
              className={styles.sectorItem}
            >
              #{sector}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default RightPanel;
