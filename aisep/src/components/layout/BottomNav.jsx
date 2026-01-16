import React from 'react';
import { Home, Search, Users, User } from 'lucide-react';
import styles from './BottomNav.module.css';

/**
 * BottomNav Component - Bottom navigation bar (Mobile only)
 * Contains main navigation icons at the bottom of screen
 */
function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Search, label: 'Explore', href: '#' },
    { icon: Users, label: 'Advisors', href: '#' },
    { icon: User, label: 'Profile', href: '#' },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <a key={item.label} href={item.href} className={styles.navButton}>
          <item.icon size={24} />
          <span className={styles.label}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export default BottomNav;
