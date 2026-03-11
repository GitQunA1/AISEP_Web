import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Loader } from 'lucide-react';
import styles from './RightPanel.module.css';
import Badge from '../common/Badge';
import startupProfileService from '../../services/startupProfileService';

/**
 * RightPanel Component - Right sidebar with dynamic featured content
 */
function RightPanel() {
  const [topRatedStartups, setTopRatedStartups] = useState([]);
  const [trendingSectors, setTrendingSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPanelData = async () => {
      setIsLoading(true);
      try {
        console.log('[RightPanel] Fetching startups...');
        const response = await startupProfileService.getAllStartups({
          pageSize: 50
        });
        console.log('[RightPanel] Raw API response:', response);

        // The apiClient returns the ApiResponse<T> wrapper;
        // the paginated list is at response.data.items
        const items = response?.data?.items ?? response?.items ?? null;
        console.log('[RightPanel] items:', items);

        if (items && items.length > 0) {
          // Process Top Startups — take first 3
          setTopRatedStartups(items.slice(0, 3).map(s => ({
            id: s.id,
            name: s.companyName || 'Chưa đặt tên',
            score: 'Điểm AI: cập nhật sau'
          })));

          // Extract unique sectors
          const sectors = new Set();
          items.forEach(s => {
            console.log('[RightPanel] startup:', s.companyName, ' industry:', s.industry);
            if (s.industry) {
              s.industry.split(',').forEach(field => {
                const trimmed = field.trim();
                if (trimmed) sectors.add(trimmed);
              });
            }
          });

          setTrendingSectors(Array.from(sectors).slice(0, 5));
        } else {
          console.warn('[RightPanel] No items found in response');
        }
      } catch (error) {
        console.error('[RightPanel] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPanelData();
  }, []);

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
          <h3 className={styles.widgetTitle}>Top Startup AI</h3>
        </div>
        <div className={styles.widgetContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader size={20} className="animate-spin" />
            </div>
          ) : topRatedStartups.length > 0 ? (
            topRatedStartups.map((startup) => (
              <button
                key={startup.id}
                onClick={() => handleStartupClick(startup.name)}
                className={styles.startupItem}
              >
                <span className={styles.startupName}>{startup.name}</span>
                <Badge label="Điểm AI: cập nhật" variant="updating" showIcon={true} />
              </button>
            ))
          ) : (
            <p className={styles.emptyText}>Đang cập nhật</p>
          )}
        </div>
      </div>

      {/* Trending Sectors */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <TrendingUp size={18} color="var(--primary-blue)" />
          <h3 className={styles.widgetTitle}>Lĩnh vực nổi bật</h3>
        </div>
        <div className={styles.widgetContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader size={20} className="animate-spin" />
            </div>
          ) : trendingSectors.length > 0 ? (
            trendingSectors.map((sector) => (
              <button
                key={sector}
                onClick={() => handleSectorClick(sector)}
                className={styles.sectorItem}
              >
                #{sector}
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
