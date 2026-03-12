import React from 'react';
import { Home, Search, TrendingUp, Users, User, LayoutDashboard, Sparkles } from 'lucide-react';
import styles from './BottomNav.module.css';

/**
 * BottomNav Component - Bottom navigation bar (Mobile only)
 * Contains main navigation icons at the bottom of screen
 */
function BottomNav({ user, onShowProfile, onShowHome, onShowAdvisors, onShowInvestors, onShowDashboard, onShowAI, activeTab }) {
  const navItems = [
    { icon: Home, label: 'Home', displayLabel: 'Trang chủ', href: '#' },
    { icon: Sparkles, label: 'AI', displayLabel: 'Trợ lý AI', id: 'ai' },
    { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Dashboard', href: '#', showWhenLoggedIn: true },
    { icon: TrendingUp, label: 'Investors', displayLabel: 'Nhà đầu tư', href: '#', hideFor: ['investor'] },
    { icon: Users, label: 'Advisors', displayLabel: 'Cố vấn', href: '#', hideFor: ['advisor'] },
  ];

  const handleClick = (e, label) => {
    e.preventDefault();
    if (label === 'Home' && onShowHome) {
      onShowHome();
    }
    if (label === 'Dashboard' && onShowDashboard) {
      onShowDashboard();
    }
    if (label === 'Advisors' && onShowAdvisors) {
      onShowAdvisors();
    }
    if (label === 'Investors' && onShowInvestors) {
      onShowInvestors();
    }
    if (label === 'AI' && onShowAI) {
      onShowAI();
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
            <span className={styles.label}>{item.displayLabel || item.label}</span>
          </a>
        ))}
    </nav>
  );
}

export default BottomNav;
