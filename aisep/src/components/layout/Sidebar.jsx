import React, { useState } from 'react';
import { Home, Search, TrendingUp, Users, User, Rocket, X, LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react';
import styles from './Sidebar.module.css';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

/**
 * Sidebar Component
 * Desktop: Always visible sticky sidebar.
 * Mobile: Slide-out drawer controlled by 'isOpen' prop.
 */
function Sidebar({
  isOpen = false,
  onClose,
  onShowRegister,
  onShowLogin,
  onShowProfile,
  onShowHome,
  onShowInvestors,
  onShowAdvisors,
  onShowDashboard,
  onMenuItemClick,
  user,
  onLogout,
  activeView = 'main' // New prop to determine active state
}) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '#', showWhenLoggedIn: true },
    { icon: Search, label: 'Explore', href: '#' },
    { icon: TrendingUp, label: 'Investors', href: '#', hideFor: ['investor'] },
    { icon: Users, label: 'Advisors', href: '#', hideFor: ['advisor'] },
    { icon: User, label: 'Profile', href: '#' },
  ];

  const handleNavClick = (label) => {
    // Navigate to dashboard when clicking Dashboard
    if (label === 'Dashboard' && onShowDashboard) {
      onShowDashboard();
    }

    // Navigate to home when clicking Home
    if (label === 'Home' && onShowHome) {
      onShowHome();
    }

    // Navigate to profile when clicking Profile
    if (label === 'Profile' && onShowProfile) {
      onShowProfile();
    }

    // Navigate to advisors when clicking Advisors
    if (label === 'Advisors' && onShowAdvisors) {
      onShowAdvisors();
    }

    // Navigate to investors when clicking Investors
    if (label === 'Investors' && onShowInvestors) {
      onShowInvestors();
    }

    onMenuItemClick?.();
    onClose?.();
  };

  const handleRegisterClick = () => {
    onShowRegister();
    onMenuItemClick?.();
    onClose?.();
  };

  const handleLoginClick = () => {
    onShowLogin?.();
    onMenuItemClick?.();
    onClose?.();
  };

  const handleLogoutClick = () => {
    onLogout?.();
    onMenuItemClick?.();
    onClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.content}>
          {/* Header: Logo + Mobile Close Button */}
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>
              <Rocket size={28} color="var(--primary-blue)" />
              <span>AISEP</span>
            </div>

            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links - Desktop Only */}
          <nav className={`${styles.nav} ${styles.navDesktopOnly}`}>
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
              .map((item) => {
                const Icon = item.icon;
                // Map activeView to nav item labels
                const getActiveLabel = () => {
                  if (activeView === 'main') return 'Home';
                  if (activeView === 'dashboard') return 'Dashboard';
                  if (activeView === 'profile') return 'Profile';
                  if (activeView === 'advisors') return 'Advisors';
                  if (activeView === 'investors') return 'Investors';
                  return 'Home';
                };
                const isActive = item.label === getActiveLabel();

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.label);
                    }}
                  >
                    <Icon size={24} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
          </nav>

          {/* Theme Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>Theme</span>
          </button>

          {/* Auth Section / Profile Display */}
          {user ? (
            /* Logged In: Show Profile Display with Logout Button */
            <div className={styles.profileSection}>
              <div className={styles.profileDisplay}>
                <div className={styles.profileAvatar}>
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>{user.name}</div>
                  <div className={styles.profileRole}>{user.role}</div>
                </div>
              </div>
              <button
                className={styles.logoutButton}
                onClick={handleLogoutClick}
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            /* Not Logged In: Show Auth Buttons */
            <div className={styles.authSection}>
              <button className={styles.signInBtn} onClick={handleLoginClick}>
                Sign In
              </button>

              <Button
                variant="primary"
                className={styles.registerBtn}
                onClick={handleRegisterClick}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;