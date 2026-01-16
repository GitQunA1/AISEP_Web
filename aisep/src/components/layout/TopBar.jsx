import React from 'react';
import { Rocket, Menu } from 'lucide-react';
import styles from './TopBar.module.css';

/**
 * TopBar Component - Top navigation bar (Mobile only)
 * Shows AISEP logo and user menu
 */
function TopBar({ onMenuClick }) {
  return (
    <header className={styles.topBar}>
      <div className={styles.logoSection}>
        <Rocket size={24} color="var(--primary-blue)" />
        <h1 className={styles.title}>AISEP</h1>
      </div>
      <button className={styles.menuButton} aria-label="Menu" onClick={onMenuClick}>
        <Menu size={24} />
      </button>
    </header>
  );
}

export default TopBar;
