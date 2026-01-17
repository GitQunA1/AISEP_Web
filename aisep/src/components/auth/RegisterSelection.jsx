import React from 'react';
import { ArrowLeft, Rocket, TrendingUp, Award } from 'lucide-react';
import styles from './RegisterSelection.module.css';

/**
 * RegisterSelection Component
 * Allows users to select their role (Founder, Investor, Advisor).
 * Responsive Design: Stacked on Mobile, Grid on Desktop.
 */
function RegisterSelection({ onBack, onRoleSelect }) {

  // Role Data definition
  const roles = [
    {
      id: 'founder',
      icon: Rocket,
      title: 'Founder / Startup',
      description: 'Submit your project, protect your idea with blockchain, and get AI evaluation.',
    },
    {
      id: 'investor',
      icon: TrendingUp,
      title: 'Investor',
      description: 'Discover high-potential startups using AI scoring and detailed analytics.',
    },
    {
      id: 'advisor',
      icon: Award,
      title: 'Advisor',
      description: 'Monetize your expertise by auditing startups and offering professional consultation.',
    },
  ];

  // Handler for card click
  const handleRoleSelect = (roleId) => {
    console.log('Selected role:', roleId);
    onRoleSelect && onRoleSelect(roleId);
  };

  return (
    <div className={styles.container}>

      {/* 1. Mobile Header (Fixed Top - Only visible on Mobile) */}
      <header className={styles.header}>
        <button className={styles.mobileBackButton} onClick={onBack} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerLogo}>
          <Rocket size={20} className={styles.headerLogoIcon} />
          <span className={styles.headerLogoText}>AISEP</span>
        </div>
        {/* Dummy spacer to balance the flex header */}
        <div style={{ width: 40 }}></div>
      </header>

      {/* 2. Main Content Area */}
      <div className={styles.contentWrapper}>

        {/* Desktop Logo (Only visible on Desktop) */}
        <div className={styles.desktopLogo}>
          <Rocket size={36} className={styles.logoIcon} />
          <span className={styles.logoText}>AISEP</span>
        </div>

        {/* Headings */}
        <h1 className={styles.heading}>Join AISEP as...</h1>
        <p className={styles.subheading}>Choose your role to customize your experience</p>

        {/* 3. Role Selection Grid */}
        <div className={styles.cardsGrid}>
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <button
                key={role.id}
                className={styles.card}
                onClick={() => handleRoleSelect(role.id)}
                type="button"
              >
                <div className={styles.iconWrapper}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className={styles.cardTitle}>{role.title}</h3>
                <p className={styles.cardDescription}>{role.description}</p>
              </button>
            );
          })}
        </div>

        {/* 4. Desktop Back Button (Only visible on Desktop) */}
        <button className={styles.desktopBackButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

      </div>
    </div>
  );
}

export default RegisterSelection;