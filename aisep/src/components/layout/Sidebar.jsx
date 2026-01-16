import React, { useState } from 'react';
import { Home, Search, Users, User, Rocket } from 'lucide-react';
import styles from './Sidebar.module.css';
import Button from '../common/Button';

/**
 * Sidebar Component - Left navigation panel (Desktop only)
 * Contains navigation links and authentication buttons
 */
function Sidebar() {
  const [activeItem, setActiveItem] = useState('Home');

  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Search, label: 'Explore', href: '#' },
    { icon: Users, label: 'Advisors', href: '#' },
    { icon: User, label: 'Profile', href: '#' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <Rocket size={28} color="var(--primary-blue)" />
          <span>AISEP</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${
                activeItem === item.label ? styles.active : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveItem(item.label);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Authentication Buttons Section */}
      <div className={styles.authSection}>
        <button className={styles.signInBtn}>
          Sign In
        </button>
        <Button
          variant="primary"
          className={styles.registerBtn}
        >
          Register
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;
