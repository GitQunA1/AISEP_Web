import React from 'react';
import { Home, Search, TrendingUp, Users, User, LayoutDashboard } from 'lucide-react';
import styles from './BottomNav.module.css';

/**
 * BottomNav Component - Bottom navigation bar (Mobile only)
 * Contains main navigation icons at the bottom of screen
 */
function BottomNav({ user, onShowProfile, onShowHome, onShowAdvisors, onShowInvestors, onShowDashboard, activeTab }) {
  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '#', showWhenLoggedIn: true },
    { icon: Search, label: 'Explore', href: '#' },
    { icon: TrendingUp, label: 'Investors', href: '#' },
    { icon: Users, label: 'Advisors', href: '#', hideFor: ['advisor'] },
    { icon: User, label: 'Profile', href: '#' },
  ];

  const handleClick = (e, label) => {
    e.preventDefault();
    if (label === 'Home' && onShowHome) {
      onShowHome();
    }
    if (label === 'Dashboard' && onShowDashboard) {
      onShowDashboard();
    }
    if (label === 'Profile' && onShowProfile) {
      onShowProfile();
    }
    if (label === 'Advisors' && onShowAdvisors) {
      onShowAdvisors();
    }
    if (label === 'Investors' && onShowInvestors) {
      onShowInvestors();
    }
  };

  return (
    <nav className={styles.bottomNav}>
      {navItems
        .filter(item => {
          // Hide Dashboard when user is not logged in
          if (item.showWhenLoggedIn && !user) {
            return false;
          }
          // Hide Profile when user is not logged in
          if (item.label === 'Profile' && !user) {
            return false;
          }
          // Hide items for specific roles
          if (item.hideFor && user?.role && item.hideFor.includes(user.role)) {
            return false;
          }
          return true;
        })
        .map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`${styles.navButton} ${activeTab === item.label ? styles.active : ''}`}
            onClick={(e) => handleClick(e, item.label)}
          >
            <item.icon size={24} />
            <span className={styles.label}>{item.label}</span>
          </a>
        ))}
    </nav>
  );
}

export default BottomNav;
