import React from 'react';
import { ArrowLeft, Rocket, TrendingUp, Award } from 'lucide-react';
import styles from './RegisterSelection.module.css';

/**
 * RegisterSelection Component
 * Allows users to select their role (Founder, Investor, Advisor, Operation Staff).
 * Responsive Design: Stacked on Mobile, Grid on Desktop.
 */
function RegisterSelection({ onBack, onRoleSelect }) {

  // Role Data definition
  const roles = [
    {
      id: 'startup',
      icon: Rocket,
      title: 'Người sáng lập / Startup',
      description: 'Nộp dự án của bạn, bảo vệ ý tưởng bằng blockchain và nhận đánh giá từ AI.',
    },
    {
      id: 'investor',
      icon: TrendingUp,
      title: 'Nhà đầu tư',
      description: 'Khám phá các startup tiềm năng cao bằng điểm AI và phân tích chi tiết.',
    },
    {
      id: 'advisor',
      icon: Award,
      title: 'Cố vấn',
      description: 'Kiếm thu nhập từ chuyên môn bằng cách tư vấn startup và cung cấp dịch vụ tư vấn chuyên nghiệp.',
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
        <h1 className={styles.heading}>Tham gia AISEP với tư cách...</h1>
        <p className={styles.subheading}>Chọn vai trò để cá nhân hóa trải nghiệm của bạn</p>

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
          <span>Quay lại trang chủ</span>
        </button>

      </div>
    </div>
  );
}

export default RegisterSelection;