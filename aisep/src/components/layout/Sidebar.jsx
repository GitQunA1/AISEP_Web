import React, { useState } from 'react';
import { Home, Search, Users, User, Rocket, X } from 'lucide-react';
import styles from './Sidebar.module.css';
import Button from '../common/Button';

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
  onMenuItemClick 
}) {
  const [activeItem, setActiveItem] = useState('Home');

  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Search, label: 'Explore', href: '#' },
    { icon: Users, label: 'Advisors', href: '#' },
    { icon: User, label: 'Profile', href: '#' },
  ];

  const handleNavClick = (label) => {
    setActiveItem(label);
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
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`${styles.navItem} ${
                    activeItem === item.label ? styles.active : ''
                  }`}
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
        </div>

        {/* Auth Buttons */}
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
      </aside>
    </>
  );
}

export default Sidebar;