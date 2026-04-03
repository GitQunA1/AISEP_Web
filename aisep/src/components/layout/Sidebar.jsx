import React, { useState } from 'react';
import { Home, Compass, Search, TrendingUp, Users, User, Rocket, X, LogOut, Sun, Moon, LayoutDashboard, Sparkles, LogIn, UserPlus, FileText, Calendar, ShieldCheck, Activity, MessageSquare } from 'lucide-react';
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
  onShowAI,
  onMenuItemClick,
  user,
  onLogout,
  activeView = 'main' // New prop to determine active state
}) {
  const { theme, toggleTheme } = useTheme();

  let navItems = [
    { icon: Compass, label: 'Home', displayLabel: 'Khám phá dự án', href: '#' },
    { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Bảng điều khiển', href: '#', showWhenLoggedIn: true },
    { icon: TrendingUp, label: 'Investors', displayLabel: 'Nhà đầu tư', href: '#', hideFor: ['investor'] },
    { icon: Users, label: 'Advisors', displayLabel: 'Cố vấn', href: '#', hideFor: ['advisor'] },
  ];

  // For Staff role, prioritize Dashboard at the top
  const roleStr = user?.role?.toString().toLowerCase() || '';
  const roleNum = Number(user?.role);
  const isStaff = roleStr === 'operationstaff' || roleStr === 'operation_staff' || roleStr === 'staff' || roleNum === 3;

  if (isStaff) {
    // Reorder: Dashboard sections first, then others
    const staffItems = [
      { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Bảng điều khiển', href: '#', showWhenLoggedIn: true },
      { icon: FileText, label: 'Projects', displayLabel: 'Quản lý dự án', href: '#', showWhenLoggedIn: true },
      { icon: Calendar, label: 'Bookings', displayLabel: 'Quản lý Booking', href: '#', showWhenLoggedIn: true },
      { icon: ShieldCheck, label: 'Approvals', displayLabel: 'Phê duyệt Startup', href: '#', showWhenLoggedIn: true },
      { icon: Activity, label: 'Activity', displayLabel: 'Giám sát hoạt động', href: '#', showWhenLoggedIn: true },
    ];
    const otherItems = navItems.filter(item => item.label !== 'Dashboard' && item.label !== 'Home');
    const homeItem = navItems.find(item => item.label === 'Home');
    navItems = [...staffItems, homeItem, ...otherItems];
  } else if (roleStr === 'advisor' || roleNum === 2) {
    // Specialized items for Advisor
    const advisorItems = [
      { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Bảng điều khiển', href: '#', showWhenLoggedIn: true },
      { icon: MessageSquare, label: 'Bookings', displayLabel: 'Booking Đến', href: '#', showWhenLoggedIn: true },
      { icon: Calendar, label: 'Availability', displayLabel: 'Lịch Rảnh', href: '#', showWhenLoggedIn: true },
      { icon: FileText, label: 'Reports', displayLabel: 'Báo cáo', href: '#', showWhenLoggedIn: true },
      { icon: User, label: 'Profile', displayLabel: 'Hồ sơ', href: '#', showWhenLoggedIn: true },
    ];
    const otherItems = navItems.filter(item => item.label !== 'Dashboard' && item.label !== 'Home');
    const homeItem = navItems.find(item => item.label === 'Home');
    navItems = [...advisorItems, homeItem, ...otherItems];
  } else if (roleStr === 'investor' || roleNum === 1) {
    // Specialized items for Investor
    const investorItems = [
      { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Bảng điều khiển', href: '#', showWhenLoggedIn: true },
      { icon: Calendar, label: 'Bookings', displayLabel: 'Lịch Tư Vấn', href: '#', showWhenLoggedIn: true },
    ];
    const otherItems = navItems.filter(item => item.label !== 'Dashboard' && item.label !== 'Home');
    const homeItem = navItems.find(item => item.label === 'Home');
    navItems = [...investorItems, homeItem, ...otherItems];
  }

  const handleNavClick = (label) => {
    // Navigate to dashboard when clicking Dashboard
    if (label === 'Dashboard' && onShowDashboard) {
      onShowDashboard('statistics');
    }
    if (label === 'Projects' && onShowDashboard) {
      onShowDashboard('project_management');
    }
    if (label === 'Bookings' && onShowDashboard) {
      onShowDashboard('bookings');
    }
    if (label === 'Approvals' && onShowDashboard) {
      onShowDashboard('approvals');
    }
    if (label === 'Activity' && onShowDashboard) {
      onShowDashboard('activity');
    }
    if (label === 'Availability' && onShowDashboard) {
      onShowDashboard('availability');
    }
    if (label === 'Reports' && onShowDashboard) {
      onShowDashboard('reports');
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

          {/* Navigation Links */}
          <nav className={styles.nav}>
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
                  if (activeView === 'dashboard_project_management') return 'Projects';
                  if (activeView === 'dashboard_bookings') return 'Bookings';
                  if (activeView === 'dashboard_approvals') return 'Approvals';
                  if (activeView === 'dashboard_activity') return 'Activity';
                  if (activeView === 'dashboard_availability') return 'Availability';
                  if (activeView === 'dashboard_reports') return 'Reports';
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
                    <span>{item.displayLabel}</span>
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
            <span>Giao diện</span>
          </button>

          {/* Auth Section / Profile Display */}
          {user ? (
            /* Logged In: Show Profile Display with Logout Button */
            <div className={styles.profileSection}>
              <div className={styles.profileDisplay}>
                <div className={styles.profileAvatar}>
                  <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>{user.name || user.email}</div>
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
                <LogIn className={styles.authIcon} size={20} />
                <span className={styles.btnText}>Đăng nhập</span>
              </button>

              <button
                className={styles.registerBtn}
                onClick={handleRegisterClick}
              >
                <UserPlus className={styles.authIcon} size={20} />
                <span className={styles.btnText}>Tạo tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;